import * as THREE from 'three';

export class MayaScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.objects = [];
    this.selectedObject = null;
    this.currentTool = 'move'; // 'select', 'move', 'rotate', 'scale'
    this.shadingMode = 'shaded'; // 'wireframe', 'shaded', 'textured', 'wireframe-shaded'
    this.cameraView = 'persp';

    // Camera target for orbit
    this.cameraTarget = new THREE.Vector3(0, 1, 0);
    this.cameraDistance = 14;
    this.cameraTheta = Math.PI / 4;
    this.cameraPhi = Math.PI / 3;

    // Callbacks
    this.onSelectionChanged = null;
    this.onTransformChanged = null;
    this.onStatsUpdated = null;

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x191919);

    // 2. Camera
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.updateCameraPosition();

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    // 4. Maya Ground Grid
    this.setupGrid();

    // 5. Lighting Setup (Key, Fill, Rim, Ambient)
    this.setupLighting();

    // 6. Selection Highlight Helper
    this.selectionBox = new THREE.BoxHelper(new THREE.Mesh(), 0xff9800);
    this.selectionBox.visible = false;
    this.scene.add(this.selectionBox);

    // 7. Raycaster for picking
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 8. Event listeners for Orbit, Pan, Zoom, and Selection
    this.setupControls();

    // 9. Resize observer
    window.addEventListener('resize', () => this.onResize());

    // 10. Animation render loop
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.fps = 60;
    this.animate();
  }

  setupGrid() {
    // Maya dual subdivision ground grid
    const size = 30;
    const divisions = 30;
    this.grid = new THREE.GridHelper(size, divisions, 0x555555, 0x2e2e2e);
    this.grid.position.y = 0;
    this.scene.add(this.grid);

    // Coordinate Axes
    this.axes = new THREE.AxesHelper(3);
    this.axes.position.set(-size / 2, 0.01, size / 2);
    this.scene.add(this.axes);
  }

  setupLighting() {
    // Ambient / Environment Fill
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(this.ambientLight);

    // Maya Key Directional Light
    this.directionalLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    this.directionalLight.position.set(12, 20, 15);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.bias = -0.0001;
    this.scene.add(this.directionalLight);

    // Rim / Fill Light
    this.fillLight = new THREE.DirectionalLight(0x80d8ff, 0.4);
    this.fillLight.position.set(-15, 10, -12);
    this.scene.add(this.fillLight);
  }

  updateCameraPosition() {
    // Spherical coordinates around target
    this.camera.position.x = this.cameraTarget.x + this.cameraDistance * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    this.camera.position.y = this.cameraTarget.y + this.cameraDistance * Math.cos(this.cameraPhi);
    this.camera.position.z = this.cameraTarget.z + this.cameraDistance * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);
    this.camera.lookAt(this.cameraTarget);
  }

  setupControls() {
    const el = this.renderer.domElement;
    let isDragging = false;
    let dragMode = null; // 'orbit', 'pan', 'zoom'
    let prevMouseX = 0;
    let prevMouseY = 0;

    el.addEventListener('contextmenu', e => e.preventDefault());

    el.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (e.button === 0) {
        // Left button: Orbit
        dragMode = 'orbit';
      } else if (e.button === 1 || (e.button === 0 && e.altKey)) {
        // Middle button or Alt+Left: Pan
        dragMode = 'pan';
      } else if (e.button === 2) {
        // Right button: Dolly/Zoom
        dragMode = 'zoom';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (dragMode === 'orbit') {
        this.cameraTheta -= deltaX * 0.008;
        this.cameraPhi -= deltaY * 0.008;
        this.cameraPhi = Math.max(0.05, Math.min(Math.PI - 0.05, this.cameraPhi));
        this.updateCameraPosition();
      } else if (dragMode === 'pan') {
        const panSpeed = 0.008 * (this.cameraDistance / 10);
        const forward = new THREE.Vector3().subVectors(this.cameraTarget, this.camera.position).normalize();
        const right = new THREE.Vector3().crossVectors(forward, this.camera.up).normalize();
        const up = new THREE.Vector3().crossVectors(right, forward).normalize();

        this.cameraTarget.addScaledVector(right, -deltaX * panSpeed);
        this.cameraTarget.addScaledVector(up, deltaY * panSpeed);
        this.updateCameraPosition();
      } else if (dragMode === 'zoom') {
        this.cameraDistance += (deltaY - deltaX) * 0.05;
        this.cameraDistance = Math.max(1.5, Math.min(200, this.cameraDistance));
        this.updateCameraPosition();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;

      // Click selection check if minimal movement
      const moveDist = Math.hypot(e.clientX - prevMouseX, e.clientY - prevMouseY);
      if (moveDist < 3 && e.button === 0) {
        this.handlePointerClick(e);
      }
    });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraDistance += e.deltaY * 0.015;
      this.cameraDistance = Math.max(1.5, Math.min(200, this.cameraDistance));
      this.updateCameraPosition();
    });
  }

  handlePointerClick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.objects, true);

    if (intersects.length > 0) {
      // Find top-level root mesh
      let hit = intersects[0].object;
      while (hit.parent && hit.parent !== this.scene) {
        hit = hit.parent;
      }
      this.selectObject(hit);
    } else {
      this.selectObject(null);
    }
  }

  selectObject(obj) {
    this.selectedObject = obj;
    if (obj) {
      this.selectionBox.setFromObject(obj);
      this.selectionBox.visible = true;
    } else {
      this.selectionBox.visible = false;
    }

    if (this.onSelectionChanged) {
      this.onSelectionChanged(obj);
    }
  }

  addObject(mesh, name = 'polyMesh') {
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.objects.push(mesh);
    this.selectObject(mesh);
    this.updateStats();
    return mesh;
  }

  deleteSelected() {
    if (!this.selectedObject) return;
    const obj = this.selectedObject;
    this.scene.remove(obj);
    const idx = this.objects.indexOf(obj);
    if (idx !== -1) {
      this.objects.splice(idx, 1);
    }
    this.selectObject(null);
    this.updateStats();
  }

  duplicateSelected() {
    if (!this.selectedObject) return null;
    const clone = this.selectedObject.clone();
    clone.position.x += 1.5;
    const nameMatch = this.selectedObject.name.match(/^(.*?)(\d+)$/);
    if (nameMatch) {
      clone.name = `${nameMatch[1]}${parseInt(nameMatch[2], 10) + 1}`;
    } else {
      clone.name = `${this.selectedObject.name}_copy`;
    }
    this.addObject(clone, clone.name);
    return clone;
  }

  setShadingMode(mode) {
    this.shadingMode = mode;
    this.objects.forEach(obj => {
      obj.traverse(child => {
        if (child.isMesh && child.material) {
          if (mode === 'wireframe') {
            child.material.wireframe = true;
          } else {
            child.material.wireframe = false;
          }
        }
      });
    });
  }

  updateStats() {
    let verts = 0;
    let faces = 0;
    let tris = 0;

    this.objects.forEach(obj => {
      obj.traverse(child => {
        if (child.isMesh && child.geometry) {
          const geo = child.geometry;
          if (geo.attributes.position) {
            verts += geo.attributes.position.count;
          }
          if (geo.index) {
            tris += geo.index.count / 3;
            faces += geo.index.count / 3;
          } else if (geo.attributes.position) {
            tris += geo.attributes.position.count / 3;
            faces += geo.attributes.position.count / 3;
          }
        }
      });
    });

    if (this.onStatsUpdated) {
      this.onStatsUpdated({
        verts,
        edges: Math.round(tris * 1.5),
        faces: Math.round(faces),
        tris: Math.round(tris),
        fps: this.fps,
        objectsCount: this.objects.length
      });
    }
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width && height) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Calculate FPS
    const now = performance.now();
    this.frameCount++;
    if (now - this.lastFrameTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
      this.frameCount = 0;
      this.lastFrameTime = now;
      this.updateStats();
    }

    // Update selection box if object moved
    if (this.selectedObject && this.selectionBox.visible) {
      this.selectionBox.setFromObject(this.selectedObject);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
