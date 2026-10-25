import * as THREE from 'three';

// Counter for unique Maya node naming (pCube1, pSphere1, etc.)
const counters = {
  cube: 1,
  sphere: 1,
  cylinder: 1,
  plane: 1,
  torus: 1,
  cone: 1,
  pipe: 1,
  joint: 1,
  ai_mesh: 1
};

// Standard Maya Arnold Shader Material (MeshStandardMaterial with PBR parameters)
export function createMayaMaterial(color = 0x8a9299, metalness = 0.2, roughness = 0.4) {
  return new THREE.MeshStandardMaterial({
    color: color,
    metalness: metalness,
    roughness: roughness,
    envMapIntensity: 1.0
  });
}

export const primitives = {
  createCube(size = 2) {
    const geo = new THREE.BoxGeometry(size, size, size, 2, 2, 2);
    const mat = createMayaMaterial(0x8e9aa6, 0.2, 0.4);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = size / 2;
    const name = `pCube${counters.cube++}`;
    mesh.userData = { type: 'polyCube', width: size, height: size, depth: size };
    return { mesh, name };
  },

  createSphere(radius = 1.2, segments = 24) {
    const geo = new THREE.SphereGeometry(radius, segments, segments);
    const mat = createMayaMaterial(0x00bcd4, 0.4, 0.3);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = radius;
    const name = `pSphere${counters.sphere++}`;
    mesh.userData = { type: 'polySphere', radius, segments };
    return { mesh, name };
  },

  createCylinder(radius = 1, height = 2.5, segments = 24) {
    const geo = new THREE.CylinderGeometry(radius, radius, height, segments);
    const mat = createMayaMaterial(0xa0aab2, 0.3, 0.35);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = height / 2;
    const name = `pCylinder${counters.cylinder++}`;
    mesh.userData = { type: 'polyCylinder', radius, height, segments };
    return { mesh, name };
  },

  createPlane(size = 8) {
    const geo = new THREE.PlaneGeometry(size, size, 8, 8);
    geo.rotateX(-Math.PI / 2);
    const mat = createMayaMaterial(0x384149, 0.1, 0.8);
    const mesh = new THREE.Mesh(geo, mat);
    const name = `pPlane${counters.plane++}`;
    mesh.userData = { type: 'polyPlane', size };
    return { mesh, name };
  },

  createTorus(radius = 1.5, tube = 0.4) {
    const geo = new THREE.TorusGeometry(radius, tube, 16, 32);
    geo.rotateX(Math.PI / 2);
    const mat = createMayaMaterial(0xff9800, 0.5, 0.25);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = tube;
    const name = `pTorus${counters.torus++}`;
    mesh.userData = { type: 'polyTorus', radius, tube };
    return { mesh, name };
  },

  createCone(radius = 1.2, height = 2.5) {
    const geo = new THREE.ConeGeometry(radius, height, 20);
    const mat = createMayaMaterial(0xe91e63, 0.3, 0.4);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = height / 2;
    const name = `pCone${counters.cone++}`;
    mesh.userData = { type: 'polyCone', radius, height };
    return { mesh, name };
  },

  // Maya Joint Skeletal Bone
  createJoint(x = 0, y = 0, z = 0) {
    const group = new THREE.Group();
    // Sphere joint
    const jointGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const jointMat = new THREE.MeshBasicMaterial({ color: 0x00e676, wireframe: true });
    const jointMesh = new THREE.Mesh(jointGeo, jointMat);
    group.add(jointMesh);

    group.position.set(x, y, z);
    const name = `joint${counters.joint++}`;
    group.userData = { type: 'joint' };
    return { mesh: group, name };
  },

  // Gemma-4 AI Procedural Sci-Fi Mech Robot
  createSciFiMech() {
    const root = new THREE.Group();
    const chromeMat = createMayaMaterial(0x22262a, 0.8, 0.2);
    const glowMat = new THREE.MeshStandardMaterial({ color: 0x00bcd4, emissive: 0x00bcd4, emissiveIntensity: 2 });
    const orangeMat = createMayaMaterial(0xff5722, 0.4, 0.3);

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 1.6), chromeMat);
    torso.position.y = 3.5;
    root.add(torso);

    // Core reactor glow
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), glowMat);
    core.rotateX(Math.PI / 2);
    core.position.set(0, 3.5, 0.85);
    root.add(core);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), orangeMat);
    head.position.set(0, 5.2, 0);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.2), glowMat);
    visor.position.set(0, 5.2, 0.65);
    root.add(head);
    root.add(visor);

    // Shoulders & Arms
    [-1.6, 1.6].forEach(side => {
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), orangeMat);
      shoulder.position.set(side, 4.4, 0);
      const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 1.8), chromeMat);
      bicep.position.set(side * 1.1, 3.2, 0);
      const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.8), chromeMat);
      forearm.position.set(side * 1.2, 1.6, 0.3);
      root.add(shoulder, bicep, forearm);
    });

    // Legs
    [-0.7, 0.7].forEach(side => {
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 2), chromeMat);
      thigh.position.set(side, 1.8, 0);
      const shin = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2, 0.9), orangeMat);
      shin.position.set(side, 0.6, 0.2);
      root.add(thigh, shin);
    });

    const name = `jwala_mech${counters.ai_mesh++}`;
    root.userData = { type: 'ai_procedural_mech' };
    return { mesh: root, name };
  },

  // Gemma-4 AI Procedural Cyber Dragon
  createCyberDragon() {
    const root = new THREE.Group();
    const bodyMat = createMayaMaterial(0x1a237e, 0.6, 0.3);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xff3d00,
      emissive: 0xff3d00,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const spineMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 1.5 });

    // Segmented Spine Body
    for (let i = 0; i < 7; i++) {
      const radius = 1.0 - i * 0.1;
      const seg = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 1), bodyMat);
      seg.position.set(0, 3 + Math.sin(i * 0.5) * 0.8, -i * 1.4);
      root.add(seg);

      // Spine crest
      const crest = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8, 4), spineMat);
      crest.position.set(0, seg.position.y + radius + 0.3, seg.position.z);
      crest.rotateX(0.2);
      root.add(crest);
    }

    // Wings
    [-1, 1].forEach(side => {
      const wingGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        0, 0, 0,
        side * 5, 3, -1,
        side * 4, -1, -3
      ]);
      wingGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      wingGeo.computeVertexNormals();
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.set(side * 0.8, 4, -1);
      root.add(wing);
    });

    const name = `jwala_dragon${counters.ai_mesh++}`;
    root.userData = { type: 'ai_procedural_dragon' };
    return { mesh: root, name };
  },

  // Gemma-4 Procedural Futuristic Cyberpunk Skyscraper
  createCyberBuilding() {
    const root = new THREE.Group();
    const concreteMat = createMayaMaterial(0x1e2227, 0.8, 0.2);
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 2.2
    });

    const baseHeight = 10;
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.5, baseHeight, 3.5), concreteMat);
    base.position.y = baseHeight / 2;
    root.add(base);

    // Illuminated window strips
    for (let h = 1; h < baseHeight; h += 1.4) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 3.6), windowMat);
      strip.position.y = h;
      root.add(strip);
    }

    // Spire
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.8, 4, 8), concreteMat);
    spire.position.y = baseHeight + 2;
    root.add(spire);

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff1744 }));
    beacon.position.y = baseHeight + 4;
    root.add(beacon);

    const name = `jwala_building${counters.ai_mesh++}`;
    root.userData = { type: 'ai_procedural_building' };
    return { mesh: root, name };
  }
};
