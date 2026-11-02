import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

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

    // Callbacks & Multi-subscriber listeners
    this.onSelectionChanged = null;
    this.onTransformChanged = null;
    this.onStatsUpdated = null;
    this.selectionListeners = [];
    this.transformListeners = [];
    this.isGizmoDragging = false;

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
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
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

    // 6b. Pre-selection Hover Highlight Helper (Cyan Glow)
    this.hoverBox = new THREE.BoxHelper(new THREE.Mesh(), 0x00bcd4);
    this.hoverBox.visible = false;
    this.scene.add(this.hoverBox);

    // 6c. Interactive Maya Transform Manipulator (Move / Rotate / Scale)
    this.setupTransformControls();

    // 6d. Cursors, Selection Marquee, and Transform HUD Overlays
    this.setupCursorOverlays();

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

  setupCursorOverlays() {
    // 1. Rubberband Marquee Selection Element
    this.marqueeEl = document.createElement('div');
    this.marqueeEl.id = 'maya-marquee';
    this.marqueeEl.className = 'maya-selection-marquee';
    this.container.appendChild(this.marqueeEl);

    // 2. Cursor Floating Transform Delta HUD Element
    this.cursorHudEl = document.createElement('div');
    this.cursorHudEl.id = 'maya-cursor-hud';
    this.cursorHudEl.className = 'maya-cursor-hud';
    this.container.appendChild(this.cursorHudEl);

    this.isMarqueeSelecting = false;
    this.marqueeStartX = 0;
    this.marqueeStartY = 0;

    this.updateCursor();
  }

  updateCursor(overrideMode = null) {
    this.container.classList.remove(
      'cursor-select', 'cursor-move', 'cursor-rotate', 'cursor-scale',
      'cursor-orbit', 'cursor-orbiting', 'cursor-pan', 'cursor-zoom'
    );
    const mode = overrideMode || this.currentTool;
    if (mode === 'orbiting') this.container.classList.add('cursor-orbiting');
    else if (mode === 'orbit') this.container.classList.add('cursor-orbit');
    else if (mode === 'pan') this.container.classList.add('cursor-pan');
    else if (mode === 'zoom') this.container.classList.add('cursor-zoom');
    else if (mode === 'move') this.container.classList.add('cursor-move');
    else if (mode === 'rotate') this.container.classList.add('cursor-rotate');
    else if (mode === 'scale') this.container.classList.add('cursor-scale');
    else this.container.classList.add('cursor-select');
  }

  setupTransformControls() {
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.size = 0.85;
    this.transformControls.setMode('translate');

    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.isGizmoDragging = event.value;
      if (!event.value && this.cursorHudEl) {
        this.cursorHudEl.style.display = 'none';
      }
    });

    this.transformControls.addEventListener('change', () => {
      if (this.selectedObject && this.selectionBox.visible) {
        this.selectionBox.setFromObject(this.selectedObject);
      }
      this.notifyTransformChanged(this.selectedObject);
      if (this.isGizmoDragging) {
        this.updateTransformHud();
      }
    });

    const helper = this.transformControls.getHelper ? this.transformControls.getHelper() : this.transformControls;
    this.scene.add(helper);
  }

  updateTransformHud(clientX = null, clientY = null) {
    if (!this.selectedObject || !this.cursorHudEl) return;
    const mode = this.transformControls.getMode();
    const pos = this.selectedObject.position;
    const rot = this.selectedObject.rotation;
    const sc = this.selectedObject.scale;

    let text = '';
    if (mode === 'translate') {
      text = `[Move] X: ${pos.x.toFixed(2)}  Y: ${pos.y.toFixed(2)}  Z: ${pos.z.toFixed(2)}`;
    } else if (mode === 'rotate') {
      text = `[Rotate] X: ${(rot.x * 180 / Math.PI).toFixed(1)}°  Y: ${(rot.y * 180 / Math.PI).toFixed(1)}°  Z: ${(rot.z * 180 / Math.PI).toFixed(1)}°`;
    } else if (mode === 'scale') {
      text = `[Scale] X: ${sc.x.toFixed(2)}  Y: ${sc.y.toFixed(2)}  Z: ${sc.z.toFixed(2)}`;
    }

    this.cursorHudEl.textContent = text;
    this.cursorHudEl.style.display = 'block';

    if (clientX !== null && clientY !== null) {
      const rect = this.container.getBoundingClientRect();
      this.cursorHudEl.style.left = `${clientX - rect.left}px`;
      this.cursorHudEl.style.top = `${clientY - rect.top}px`;
    }
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

    // Key Directional Light
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
      if (this.isGizmoDragging) return;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      const isAlt = e.altKey;
      const rect = el.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.objects, true);

      if (e.button === 0) {
        if (!isAlt && intersects.length === 0 && !this.selectedObject) {
          // Empty space drag: Start Marquee Selection
          this.isMarqueeSelecting = true;
          this.marqueeStartX = e.clientX;
          this.marqueeStartY = e.clientY;
          return;
        }

        // Left button: Orbit
        isDragging = true;
        dragMode = 'orbit';
        this.updateCursor('orbiting');
      } else if (e.button === 1 || (e.button === 0 && isAlt)) {
        // Middle button or Alt+Left: Pan
        isDragging = true;
        dragMode = 'pan';
        this.updateCursor('pan');
      } else if (e.button === 2) {
        // Right button: Dolly/Zoom
        isDragging = true;
        dragMode = 'zoom';
        this.updateCursor('zoom');
      }
    });

    window.addEventListener('mousemove', (e) => {
      // 1. Live Pre-Selection Hover Highlighting
      if (!this.isGizmoDragging && !isDragging && !this.isMarqueeSelecting) {
        const rect = el.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          this.raycaster.setFromCamera(this.mouse, this.camera);
          const intersects = this.raycaster.intersectObjects(this.objects, true);
          if (intersects.length > 0) {
            let hit = intersects[0].object;
            while (hit.parent && hit.parent !== this.scene) hit = hit.parent;
            if (hit !== this.selectedObject) {
              this.hoverBox.setFromObject(hit);
              this.hoverBox.visible = true;
            } else {
              this.hoverBox.visible = false;
            }
          } else {
            this.hoverBox.visible = false;
          }
        } else {
          this.hoverBox.visible = false;
        }
      }

      // 2. Marquee Selection Dragging
      if (this.isMarqueeSelecting && this.marqueeEl) {
        const minX = Math.min(this.marqueeStartX, e.clientX);
        const minY = Math.min(this.marqueeStartY, e.clientY);
        const w = Math.abs(e.clientX - this.marqueeStartX);
        const h = Math.abs(e.clientY - this.marqueeStartY);
        const rect = this.container.getBoundingClientRect();
        this.marqueeEl.style.left = `${minX - rect.left}px`;
        this.marqueeEl.style.top = `${minY - rect.top}px`;
        this.marqueeEl.style.width = `${w}px`;
        this.marqueeEl.style.height = `${h}px`;
        this.marqueeEl.style.display = 'block';
        return;
      }

      // 3. Transform HUD Positioning during gizmo drag
      if (this.isGizmoDragging) {
        this.updateTransformHud(e.clientX, e.clientY);
      }

      // 4. Viewport Camera Navigation Dragging
      if (this.isGizmoDragging || !isDragging) return;
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
      // 1. Finish Marquee Selection
      if (this.isMarqueeSelecting) {
        this.isMarqueeSelecting = false;
        if (this.marqueeEl) this.marqueeEl.style.display = 'none';
        const dist = Math.hypot(e.clientX - this.marqueeStartX, e.clientY - this.marqueeStartY);
        if (dist > 8) {
          const rect = this.container.getBoundingClientRect();
          const minX = Math.min(this.marqueeStartX, e.clientX) - rect.left;
          const maxX = Math.max(this.marqueeStartX, e.clientX) - rect.left;
          const minY = Math.min(this.marqueeStartY, e.clientY) - rect.top;
          const maxY = Math.max(this.marqueeStartY, e.clientY) - rect.top;

          const enclosed = [];
          this.objects.forEach(obj => {
            const v = new THREE.Vector3();
            obj.getWorldPosition(v);
            v.project(this.camera);
            const screenX = ((v.x + 1) * rect.width) / 2;
            const screenY = ((-v.y + 1) * rect.height) / 2;
            if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY && v.z < 1) {
              enclosed.push(obj);
            }
          });
          if (enclosed.length > 0) {
            this.selectObject(enclosed[0]);
          }
          return;
        }
      }

      if (this.isGizmoDragging) return;
      if (!isDragging) return;
      isDragging = false;
      this.updateCursor();

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
    this.hoverBox.visible = false;
    if (obj) {
      this.selectionBox.setFromObject(obj);
      this.selectionBox.visible = true;
      if (this.transformControls && this.currentTool !== 'select') {
        this.transformControls.attach(obj);
      }
    } else {
      this.selectionBox.visible = false;
      if (this.transformControls) {
        this.transformControls.detach();
      }
    }

    this.notifySelectionChanged(obj);
  }

  setTool(tool) {
    this.currentTool = tool; // 'select', 'move', 'rotate', 'scale'
    this.updateCursor();
    if (!this.transformControls) return;

    if (tool === 'select') {
      this.transformControls.detach();
    } else {
      const modeMap = { move: 'translate', rotate: 'rotate', scale: 'scale' };
      const mode = modeMap[tool] || 'translate';
      this.transformControls.setMode(mode);
      if (this.selectedObject) {
        this.transformControls.attach(this.selectedObject);
      }
    }
  }

  addSelectionListener(fn) {
    this.selectionListeners.push(fn);
  }

  notifySelectionChanged(obj) {
    if (this.onSelectionChanged) {
      this.onSelectionChanged(obj);
    }
    this.selectionListeners.forEach(fn => fn(obj));
  }

  addTransformListener(fn) {
    this.transformListeners.push(fn);
  }

  notifyTransformChanged(obj) {
    if (this.onTransformChanged) {
      this.onTransformChanged(obj);
    }
    this.transformListeners.forEach(fn => fn(obj));
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

  focusOnObject(obj) {
    if (!obj) return;
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 2);

    this.cameraTarget.copy(center);
    this.cameraDistance = Math.min(Math.max(maxDim * 1.8, 14), 160);
    this.cameraPhi = Math.PI / 3.2;
    this.cameraTheta = Math.PI / 4.2;
    this.updateCameraPosition();
  }

  deleteSelected() {
    if (!this.selectedObject) return;
    const obj = this.selectedObject;
    if (this.transformControls) {
      this.transformControls.detach();
    }
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
