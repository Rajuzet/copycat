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
  },

  // Gemma-4 Procedural Cyber Hover Speedbike
  createHoverSpeedbike() {
    const root = new THREE.Group();
    const chassisMat = createMayaMaterial(0x181a1d, 0.85, 0.15);
    const orangeMat = createMayaMaterial(0xff5722, 0.5, 0.3);
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 2.5
    });

    // Aerodynamic Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 4), chassisMat);
    chassis.position.y = 1.2;
    root.add(chassis);

    // Streamlined nose canopy
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 4), orangeMat);
    nose.rotateX(-Math.PI / 2);
    nose.rotateY(Math.PI / 4);
    nose.position.set(0, 1.3, 2.7);
    root.add(nose);

    // Twin Repulsor Jet Turbines
    [-0.8, 0.8].forEach(side => {
      const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 2.2, 16), chassisMat);
      thruster.rotateX(Math.PI / 2);
      thruster.position.set(side, 1.1, -1.2);
      root.add(thruster);

      // Jet exhaust glow ring
      const exhaust = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 12, 24), glowMat);
      exhaust.position.set(side, 1.1, -2.3);
      root.add(exhaust);
    });

    // Hover Repulsor Discs underneath
    [-1, 1].forEach(z => {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.15, 16), glowMat);
      pad.position.set(0, 0.4, z * 1.3);
      root.add(pad);
    });

    const name = `jwala_speedbike${counters.ai_mesh++}`;
    root.userData = { type: 'ai_procedural_speedbike' };
    return { mesh: root, name };
  },

  // Gemma-4 Procedural Sci-Fi Scout Saucer Drone
  createSciFiSaucer() {
    const root = new THREE.Group();
    const hullMat = createMayaMaterial(0x282c34, 0.9, 0.2);
    const goldMat = createMayaMaterial(0xffb300, 0.8, 0.25);
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x76ff03,
      emissive: 0x76ff03,
      emissiveIntensity: 2.0
    });

    // Main Disc Hull
    const hull = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.2, 0.6, 24), hullMat);
    hull.position.y = 2.0;
    root.add(hull);

    // Upper cockpit dome
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), goldMat);
    dome.position.y = 2.3;
    root.add(dome);

    // Peripheral sensor array (6 glowing nodes around perimeter)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), glowMat);
      node.position.set(Math.cos(angle) * 3.1, 2.0, Math.sin(angle) * 3.1);
      root.add(node);
    }

    // Ventral antigravity emitter
    const emitter = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.18, 16, 32), glowMat);
    emitter.rotateX(Math.PI / 2);
    emitter.position.y = 1.6;
    root.add(emitter);

    const name = `jwala_saucer${counters.ai_mesh++}`;
    root.userData = { type: 'ai_procedural_saucer' };
    return { mesh: root, name };
  },

  // Maya Poly Dodecahedron
  createDodecahedron(radius = 1.2) {
    const geo = new THREE.DodecahedronGeometry(radius);
    const mat = createMayaMaterial(0x78909c, 0.4, 0.35);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = radius;
    const name = `pDodecahedron${counters.ai_mesh++}`;
    mesh.userData = { type: 'polyDodecahedron', radius };
    return { mesh, name };
  },

  // Gemma-4 / Maya Automation Engine: Complete 3D Landscape Environment Builder
  createLandscapeEnvironment() {
    const root = new THREE.Group();
    root.name = 'ENV_LANDSCAPE_ROOT';

    // Materials Palette (Maya PBR / Arnold Shaders)
    const terrainMat = createMayaMaterial(0x2f3833, 0.15, 0.88); // Mountain Basalt / Tundra Rock
    const obsidianMat = createMayaMaterial(0x1a1e22, 0.75, 0.22); // Polished Hero Obsidian
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 2.6
    }); // Radiant Cyan Runic Core
    const boulderMat = createMayaMaterial(0x485058, 0.3, 0.82); // Granite Boulder
    const trunkMat = createMayaMaterial(0x2e231d, 0.1, 0.9); // Aged Deadwood Bark
    const foliageMat = createMayaMaterial(0x19371f, 0.1, 0.7); // Alpine Spruce Conifer
    const megalithMat = createMayaMaterial(0x3a4248, 0.35, 0.75); // Ancient Runestone
    const debrisMat = createMayaMaterial(0x383e44, 0.2, 0.85); // Scree Debris

    // 1. TERRAIN_GRP (Deformed Mountainous Grid with Central Hero Plateau)
    const terrainGrp = new THREE.Group();
    terrainGrp.name = 'TERRAIN_GRP';

    const terrainSize = 76;
    const terrainSubdivs = 48;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSubdivs, terrainSubdivs);
    terrainGeo.rotateX(-Math.PI / 2);

    const elevation = (x, z) => {
      const dist = Math.hypot(x, z);
      // Flattens out near the origin to anchor the hero landmark
      const plateauDamping = Math.min(1.0, Math.pow(dist / 13.5, 2.2));
      const hills = Math.sin(x * 0.09) * Math.cos(z * 0.09) * 4.6
                  + Math.sin(x * 0.21 + z * 0.14) * 1.9
                  + Math.cos(x * 0.32 - z * 0.22) * 0.8;
      const rimElevation = Math.max(0, (dist - 22) * 0.32);
      return (hills * plateauDamping) + rimElevation;
    };

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      pos.setY(i, elevation(vx, vz));
    }
    terrainGeo.computeVertexNormals();

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.name = 'pLandscapeTerrain1';
    terrainMesh.receiveShadow = true;
    terrainGrp.add(terrainMesh);
    root.add(terrainGrp);

    // 2. HERO_LANDMARK_GRP (Ancient Obsidian Monolith Spire Citadel)
    const heroGrp = new THREE.Group();
    heroGrp.name = 'HERO_LANDMARK_GRP';
    heroGrp.position.set(0, 0, 0);

    // Tier 1 Base Hexagonal Plinth
    const plinth1 = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 9.8, 1.8, 6), obsidianMat);
    plinth1.position.y = 0.9;
    plinth1.castShadow = true;
    plinth1.receiveShadow = true;
    heroGrp.add(plinth1);

    // Tier 2 Concentric Plinth
    const plinth2 = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 6.8, 1.4, 6), obsidianMat);
    plinth2.position.y = 2.4;
    plinth2.castShadow = true;
    heroGrp.add(plinth2);

    // Central Monolithic Spire Tower
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 3.8, 20, 6), obsidianMat);
    spire.position.y = 12.8;
    spire.castShadow = true;
    heroGrp.add(spire);

    // Spire Pyramid Pinnacle
    const pinnacle = new THREE.Mesh(new THREE.ConeGeometry(2.0, 4.2, 6), obsidianMat);
    pinnacle.position.y = 24.8;
    pinnacle.castShadow = true;
    heroGrp.add(pinnacle);

    // 4 Cardinal Buttress Obelisks
    const buttressAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    buttressAngles.forEach(ang => {
      const buttress = new THREE.Mesh(new THREE.BoxGeometry(1.1, 10, 1.1), obsidianMat);
      const bx = Math.cos(ang) * 7.5;
      const bz = Math.sin(ang) * 7.5;
      buttress.position.set(bx, 5.0, bz);
      buttress.rotation.y = -ang;
      buttress.rotation.z = 0.08;
      buttress.castShadow = true;
      heroGrp.add(buttress);
    });

    // Levitating Runestone Core
    const runestone = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6), glowMat);
    runestone.position.set(0, 13.5, 0);
    heroGrp.add(runestone);

    root.add(heroGrp);

    // 3. ECOSYSTEM_SCATTER_GRP (Boulders, Trees, Megaliths, Debris)
    const scatterGrp = new THREE.Group();
    scatterGrp.name = 'ECOSYSTEM_SCATTER_GRP';

    // Deterministic PRNG for consistent yet organic landscape scatter
    let seed = 42;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    let totalProps = 0;

    // Helper to generate scatter positions outside the hero landmark
    const getScatterPos = (minR = 12, maxR = 33) => {
      const angle = random() * Math.PI * 2;
      const dist = minR + random() * (maxR - minR);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = elevation(x, z);
      return { x, y, z, angle };
    };

    // Prop Class 1: Basalt Boulders (30 instances)
    for (let i = 0; i < 30; i++) {
      const { x, y, z } = getScatterPos(11.5, 34);
      const bScale = 0.7 + random() * 0.7; // 0.7x - 1.4x
      const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0), boulderMat);
      boulder.position.set(x, y + bScale * 0.6, z);
      boulder.scale.set(bScale, bScale * (0.8 + random() * 0.4), bScale);
      boulder.rotation.set(random() * 0.4, random() * Math.PI * 2, random() * 0.4);
      boulder.castShadow = true;
      scatterGrp.add(boulder);
      totalProps++;
    }

    // Prop Class 2: Deadwood Conifer Trees (35 instances)
    for (let i = 0; i < 35; i++) {
      const { x, y, z } = getScatterPos(13, 33);
      const tScale = 0.7 + random() * 0.6; // 0.7x - 1.3x
      const treeGrp = new THREE.Group();
      treeGrp.position.set(x, y, z);
      treeGrp.scale.set(tScale, tScale, tScale);
      treeGrp.rotation.y = random() * Math.PI * 2;

      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 3.2, 6), trunkMat);
      trunk.position.y = 1.6;
      trunk.castShadow = true;
      treeGrp.add(trunk);

      // Tier 1 Lower Conifer Canopy
      const canopy1 = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.4, 6), foliageMat);
      canopy1.position.y = 3.2;
      canopy1.castShadow = true;
      treeGrp.add(canopy1);

      // Tier 2 Upper Conifer Canopy
      const canopy2 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 6), foliageMat);
      canopy2.position.y = 4.4;
      canopy2.castShadow = true;
      treeGrp.add(canopy2);

      scatterGrp.add(treeGrp);
      totalProps++;
    }

    // Prop Class 3: Ancient Megaliths / Runestones (15 instances)
    for (let i = 0; i < 15; i++) {
      const { x, y, z } = getScatterPos(12, 31);
      const mScale = 0.8 + random() * 0.5;
      const megalith = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.2, 0.4), megalithMat);
      megalith.position.set(x, y + mScale * 1.5, z);
      megalith.scale.set(mScale, mScale, mScale);
      megalith.rotation.set(random() * 0.15 - 0.075, random() * Math.PI * 2, random() * 0.15 - 0.075);
      megalith.castShadow = true;
      scatterGrp.add(megalith);
      totalProps++;
    }

    // Prop Class 4: Surface Scree Debris (30 instances)
    for (let i = 0; i < 30; i++) {
      const { x, y, z } = getScatterPos(11, 35);
      const dScale = 0.3 + random() * 0.4;
      const debris = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5), debrisMat);
      debris.position.set(x, y + dScale * 0.3, z);
      debris.scale.set(dScale, dScale * 0.5, dScale);
      debris.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
      scatterGrp.add(debris);
      totalProps++;
    }

    root.add(scatterGrp);

    const name = `ENV_LANDSCAPE_ROOT`;
    root.userData = {
      type: 'ai_procedural_landscape',
      propCount: totalProps,
      elevationDelta: '22m',
      footprint: '250m x 250m'
    };

    return { mesh: root, name, propCount: totalProps };
  },

  // GTA V / Cyberpunk Style Downtown Los Santos Avenue Generator
  createDowntownCity() {
    const root = new THREE.Group();
    root.name = 'ENV_WORLD_ROOT';

    // Materials Palette (PBR / High-Fidelity Architectural Shaders)
    const asphaltMat = createMayaMaterial(0x1e2022, 0.15, 0.85); // Wet/Polished Asphalt
    const curbMat = createMayaMaterial(0x757d84, 0.1, 0.75); // Granite Concrete Curb
    const sidewalkMat = createMayaMaterial(0x9aa2a9, 0.05, 0.8); // Brushed Concrete Sidewalk
    const yellowLineMat = new THREE.MeshStandardMaterial({ color: 0xffb300, roughness: 0.5 });
    const whiteLineMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.5 });
    const heroFacadeMat = createMayaMaterial(0x181c22, 0.85, 0.18); // Dark Metallic Steel / Granite
    const glassFacadeMat = new THREE.MeshStandardMaterial({ color: 0x00bcd4, metalness: 0.9, roughness: 0.1, envMapIntensity: 1.5 });
    const glassReflectMat = new THREE.MeshStandardMaterial({ color: 0x29b6f6, metalness: 0.85, roughness: 0.15 });
    const bronzeLouversMat = createMayaMaterial(0x8d6e63, 0.7, 0.3);
    const sodiumGlowMat = new THREE.MeshStandardMaterial({ color: 0xffa000, emissive: 0xffa000, emissiveIntensity: 2.8 });
    const redNeonMat = new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 2.5 });
    const greenTrafficMat = new THREE.MeshStandardMaterial({ color: 0x00e676, emissive: 0x00e676, emissiveIntensity: 2.5 });
    const carPaintRed = createMayaMaterial(0xd50000, 0.85, 0.2);
    const carPaintBlue = createMayaMaterial(0x0288d1, 0.85, 0.2);
    const carPaintSilver = createMayaMaterial(0xb0bec5, 0.9, 0.25);
    const tireRubberMat = createMayaMaterial(0x141414, 0.05, 0.95);
    const foliageMat = createMayaMaterial(0x2e7d32, 0.05, 0.75);

    // 1. TERRAIN_AND_ROADS_GRP
    const roadsGrp = new THREE.Group();
    roadsGrp.name = 'TERRAIN_AND_ROADS_GRP';

    // Base Ground / Asphalt Grid (180m x 180m)
    const roadBase = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), asphaltMat);
    roadBase.rotateX(-Math.PI / 2);
    roadBase.receiveShadow = true;
    roadsGrp.add(roadBase);

    // Sidewalk Platforms (4 corner quadrants, raised 0.25m)
    const quadOffsets = [
      [-48, -48], [48, -48],
      [-48, 48], [48, 48]
    ];
    quadOffsets.forEach(([qx, qz]) => {
      const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(72, 0.25, 72), sidewalkMat);
      sidewalk.position.set(qx, 0.125, qz);
      sidewalk.receiveShadow = true;
      roadsGrp.add(sidewalk);

      // Curbs along the intersection edges
      const curbX = new THREE.Mesh(new THREE.BoxGeometry(72, 0.3, 0.4), curbMat);
      curbX.position.set(qx, 0.15, qz + (qz > 0 ? -36 : 36));
      const curbZ = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 72), curbMat);
      curbZ.position.set(qx + (qx > 0 ? -36 : 36), 0.15, qz);
      roadsGrp.add(curbX, curbZ);
    });

    // Road Markings: Double Solid Yellow Centerlines
    [-60, 60].forEach(z => {
      const yellowLine = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 50), yellowLineMat);
      yellowLine.rotateX(-Math.PI / 2);
      yellowLine.position.set(0, 0.015, z);
      roadsGrp.add(yellowLine);
    });
    [-60, 60].forEach(x => {
      const yellowLine = new THREE.Mesh(new THREE.PlaneGeometry(50, 0.2), yellowLineMat);
      yellowLine.rotateX(-Math.PI / 2);
      yellowLine.position.set(x, 0.015, 0);
      roadsGrp.add(yellowLine);
    });

    // Crosswalk Zebra Stripes at 4 intersection crossings
    [-14, 14].forEach(z => {
      for (let i = -8; i <= 8; i += 2.2) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.5), whiteLineMat);
        stripe.rotateX(-Math.PI / 2);
        stripe.position.set(i, 0.02, z);
        roadsGrp.add(stripe);
      }
    });
    [-14, 14].forEach(x => {
      for (let i = -8; i <= 8; i += 2.2) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1.2), whiteLineMat);
        stripe.rotateX(-Math.PI / 2);
        stripe.position.set(x, 0.02, i);
        roadsGrp.add(stripe);
      }
    });

    root.add(roadsGrp);

    // 2. ARCHITECTURE_AND_HERO_GRP
    const archGrp = new THREE.Group();
    archGrp.name = 'ARCHITECTURE_AND_HERO_GRP';

    // TOWER 1: Hero Maze Corporate Center (Southeast Quadrant: x=48, z=48)
    const heroTower = new THREE.Group();
    heroTower.name = 'Hero_Corporate_Center';
    heroTower.position.set(48, 0, 48);

    // Base Atrium Podium
    const podium = new THREE.Mesh(new THREE.BoxGeometry(44, 14, 44), heroFacadeMat);
    podium.position.y = 7;
    podium.castShadow = true;
    heroTower.add(podium);

    // Glass curtain atrium band
    const atriumGlass = new THREE.Mesh(new THREE.BoxGeometry(45, 6, 45), glassFacadeMat);
    atriumGlass.position.y = 6;
    heroTower.add(atriumGlass);

    // Mid Tower Shaft
    const midShaft = new THREE.Mesh(new THREE.BoxGeometry(34, 48, 34), heroFacadeMat);
    midShaft.position.y = 38;
    midShaft.castShadow = true;
    heroTower.add(midShaft);

    // Reflective curtain window arrays (layered boxes)
    for (let floor = 18; floor < 58; floor += 8) {
      const windowBand = new THREE.Mesh(new THREE.BoxGeometry(34.8, 4.5, 34.8), glassFacadeMat);
      windowBand.position.y = floor;
      heroTower.add(windowBand);
    }

    // Upper Setback Penthouse
    const penthouse = new THREE.Mesh(new THREE.BoxGeometry(24, 22, 24), heroFacadeMat);
    penthouse.position.y = 73;
    penthouse.castShadow = true;
    heroTower.add(penthouse);

    // Rooftop Helipad
    const helipad = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 8.5, 0.6, 24), curbMat);
    helipad.position.y = 84.3;
    heroTower.add(helipad);
    const heliMarking = new THREE.Mesh(new THREE.RingGeometry(5.5, 6.2, 24), yellowLineMat);
    heliMarking.rotateX(-Math.PI / 2);
    heliMarking.position.y = 84.62;
    heroTower.add(heliMarking);

    // Rooftop Communications Mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.6, 24, 8), bronzeLouversMat);
    mast.position.y = 96;
    heroTower.add(mast);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), redNeonMat);
    beacon.position.y = 108.2;
    heroTower.add(beacon);

    archGrp.add(heroTower);

    // TOWER 2: Glass Fin Skyscraper (Northwest Quadrant: x=-48, z=-48)
    const finTower = new THREE.Group();
    finTower.name = 'Glass_Fin_Tower';
    finTower.position.set(-48, 0, -48);
    const finShaft = new THREE.Mesh(new THREE.BoxGeometry(32, 75, 32), glassReflectMat);
    finShaft.position.y = 37.5;
    finShaft.castShadow = true;
    finTower.add(finShaft);
    const finSpire = new THREE.Mesh(new THREE.ConeGeometry(8, 22, 4), heroFacadeMat);
    finSpire.position.set(0, 86, 0);
    finSpire.rotateY(Math.PI / 4);
    finTower.add(finSpire);
    archGrp.add(finTower);

    // TOWER 3: Stepped Corporate Complex (Northeast Quadrant: x=48, z=-48)
    const steppedTower = new THREE.Group();
    steppedTower.name = 'Stepped_ArtDeco_Tower';
    steppedTower.position.set(48, 0, -48);
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(36, 30, 36), heroFacadeMat);
    step1.position.y = 15;
    const step2 = new THREE.Mesh(new THREE.BoxGeometry(26, 25, 26), heroFacadeMat);
    step2.position.y = 42.5;
    const step3 = new THREE.Mesh(new THREE.BoxGeometry(16, 18, 16), glassFacadeMat);
    step3.position.y = 64;
    steppedTower.add(step1, step2, step3);
    archGrp.add(steppedTower);

    // TOWER 4: Tech Media Hub (Southwest Quadrant: x=-48, z=48)
    const techTower = new THREE.Group();
    techTower.name = 'Tech_Media_Hub';
    techTower.position.set(-48, 0, 48);
    const techBody = new THREE.Mesh(new THREE.BoxGeometry(30, 50, 30), heroFacadeMat);
    techBody.position.y = 25;
    const ledRibbon = new THREE.Mesh(new THREE.BoxGeometry(30.6, 5, 30.6), sodiumGlowMat);
    ledRibbon.position.y = 28;
    techTower.add(techBody, ledRibbon);
    archGrp.add(techTower);

    root.add(archGrp);

    // 3. STREET_PROPS_AND_SCATTER_GRP
    const propsGrp = new THREE.Group();
    propsGrp.name = 'STREET_PROPS_AND_SCATTER_GRP';

    let totalProps = 0;

    // A. Streetlamps (12 Modern Dual-Arm Sodium Streetlamps along curbs)
    const lampPositions = [
      [-13, -25], [-13, -55], [13, -25], [13, -55],
      [-13, 25], [-13, 55], [13, 25], [13, 55],
      [-25, -13], [-55, -13], [-25, 13], [-55, 13]
    ];
    lampPositions.forEach(([lx, lz]) => {
      const lamp = new THREE.Group();
      lamp.position.set(lx, 0.25, lz);

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 7.5, 8), heroFacadeMat);
      post.position.y = 3.75;
      post.castShadow = true;
      lamp.add(post);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.2), heroFacadeMat);
      arm.position.set(0, 7.4, 0);
      lamp.add(arm);

      const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.35), sodiumGlowMat);
      bulb.position.set(0, 7.25, 0);
      lamp.add(bulb);

      propsGrp.add(lamp);
      totalProps++;
    });

    // B. Traffic Signal Gantries (4 Corner Mast-Arms)
    const trafficCorners = [
      [-12.5, -12.5, 0], [12.5, -12.5, Math.PI / 2],
      [-12.5, 12.5, -Math.PI / 2], [12.5, 12.5, Math.PI]
    ];
    trafficCorners.forEach(([cx, cz, rot]) => {
      const gantry = new THREE.Group();
      gantry.position.set(cx, 0.25, cz);
      gantry.rotation.y = rot;

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 6.5, 8), heroFacadeMat);
      pole.position.y = 3.25;
      const mastArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5, 8), heroFacadeMat);
      mastArm.rotateZ(Math.PI / 2);
      mastArm.position.set(2.5, 6.2, 0);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.4), heroFacadeMat);
      head.position.set(4, 5.8, 0);
      const greenLight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), greenTrafficMat);
      greenLight.position.set(4, 5.5, 0.2);
      gantry.add(pole, mastArm, head, greenLight);

      propsGrp.add(gantry);
      totalProps++;
    });

    // C. Vehicles (10 Parked / Cruising Sedans & SUVs)
    const vehiclesData = [
      { x: -5.5, z: -32, rot: 0, mat: carPaintRed },
      { x: -5.5, z: 28, rot: 0, mat: carPaintBlue },
      { x: 5.5, z: -45, rot: Math.PI, mat: carPaintSilver },
      { x: 5.5, z: 40, rot: Math.PI, mat: carPaintRed },
      { x: -35, z: -5.5, rot: Math.PI / 2, mat: carPaintBlue },
      { x: 38, z: 5.5, rot: -Math.PI / 2, mat: carPaintSilver },
      { x: -11.5, z: -50, rot: 0, mat: heroFacadeMat },
      { x: -11.5, z: 52, rot: 0, mat: carPaintBlue }
    ];
    vehiclesData.forEach(v => {
      const car = new THREE.Group();
      car.position.set(v.x, 0, v.z);
      car.rotation.y = v.rot;

      // Body Chassis
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.8, 4.6), v.mat);
      body.position.y = 0.65;
      body.castShadow = true;
      car.add(body);

      // Cabin / Greenhouse
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 2.6), heroFacadeMat);
      cabin.position.set(0, 1.35, -0.2);
      cabin.castShadow = true;
      car.add(cabin);

      // Windshield glass
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.6, 2.4), glassFacadeMat);
      windshield.position.set(0, 1.35, -0.2);
      car.add(windshield);

      // Headlights
      [-0.7, 0.7].forEach(hx => {
        const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), sodiumGlowMat);
        headlight.position.set(hx, 0.65, 2.3);
        car.add(headlight);
      });

      // Wheels
      [[-1.05, 1.4], [1.05, 1.4], [-1.05, -1.4], [1.05, -1.4]].forEach(([wx, wz]) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.32, 12), tireRubberMat);
        wheel.rotateZ(Math.PI / 2);
        wheel.position.set(wx, 0.38, wz);
        car.add(wheel);
      });

      propsGrp.add(car);
      totalProps++;
    });

    // D. Sidewalk Planters & Street Trees (12 Planters)
    const planterPositions = [
      [-14.5, -35], [-14.5, -65], [14.5, -35], [14.5, -65],
      [-14.5, 35], [-14.5, 65], [14.5, 35], [14.5, 65]
    ];
    planterPositions.forEach(([px, pz]) => {
      const planter = new THREE.Group();
      planter.position.set(px, 0.25, pz);

      const pot = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), curbMat);
      pot.position.y = 0.3;
      planter.add(pot);

      const shrub = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0), foliageMat);
      shrub.position.y = 1.2;
      planter.add(shrub);

      propsGrp.add(planter);
      totalProps++;
    });

    root.add(propsGrp);

    // 4. CAMERAS_GRP & LIGHTING_AND_VFX_GRP
    const camGrp = new THREE.Group();
    camGrp.name = 'CAMERAS_GRP';
    root.add(camGrp);

    const name = `ENV_WORLD_ROOT`;
    root.userData = {
      type: 'ai_procedural_downtown_gta',
      propCount: totalProps,
      buildingCount: 4,
      footprint: '200m x 200m'
    };

    return { mesh: root, name, propCount: totalProps };
  }
};

