// src/ledger/promptLedger.js
// Universal Object Prompt Ledger & Ontology Registry
// Catalogs every scale of existence: From a Coffee Cup to the Entire Observable Universe

export class UniversalPromptLedger {
  constructor(scene, primitives, outliner, channelBox) {
    this.scene = scene;
    this.primitives = primitives;
    this.outliner = outliner;
    this.channelBox = channelBox;

    this.storageKey = 'jwala_universal_prompt_ledger_v1';
    this.selectedObjectId = 'obj-tableware-cup-classic';
    this.searchQuery = '';
    this.selectedScale = 'all'; // 'all', 'micro', 'human', 'hardware', 'room', 'vehicle', 'architectural', 'geological', 'planetary', 'stellar', 'galactic', 'cosmic'
    this.selectedTag = 'all';

    this.onInjectPromptCallback = null;
    this.onSwitchToAdamCad = null;
    this.adamClient = null;
    this.adamCopilot = null;
    this.customItems = this.loadCustomItems();
    this.builtInCatalog = this.initUniversalCatalog();
  }

  setAdamBridge(client, copilot) {
    this.adamClient = client;
    this.adamCopilot = copilot;
  }

  loadCustomItems() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveCustomItem(item) {
    item.id = `custom-${Date.now()}`;
    item.isCustom = true;
    this.customItems.unshift(item);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.customItems));
    } catch (e) {}
    return item;
  }

  deleteCustomItem(id) {
    this.customItems = this.customItems.filter(i => i.id !== id);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.customItems));
    } catch (e) {}
  }

  getAllItems() {
    return [...this.customItems, ...this.builtInCatalog];
  }

  getFilteredItems() {
    const all = this.getAllItems();
    return all.filter(item => {
      const matchesSearch = !this.searchQuery ||
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.scale.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesScale = this.selectedScale === 'all' || item.scaleCategory === this.selectedScale;
      return matchesSearch && matchesScale;
    });
  }

  initUniversalCatalog() {
    return [
      // ======================================================================
      // SCALE 1: HUMAN EVERYDAY / TABLEWARE (THE CUP & DOMESTIC OBJECTS)
      // ======================================================================
      {
        id: 'obj-tableware-cup-classic',
        name: 'Ceramic Coffee Mug (The Cup)',
        scaleCategory: 'human',
        scaleOrder: '10⁻¹ m',
        scale: '95mm height x 82mm diameter',
        tags: ['cup', 'mug', 'ceramic', 'kitchen', 'tableware', 'coffee', 'porcelain'],
        description: 'Standard 350ml cylindrical glazed ceramic coffee mug with ergonomic C-shaped curved handle, chamfered rim, and thermal foot ring.',
        prompt: `Create a photorealistic ceramic coffee mug. Dimensions: 95mm height, 82mm outer diameter, 3.5mm wall thickness.
Topology: Smooth subdivided cylindrical lathe profile with an extruded hollow interior cavity (depth 88mm).
Handle: Seamlessly filleted C-channel curved handle attached to the lateral profile from Y=25mm to Y=75mm.
Material: High-gloss white glazed porcelain shader (baseColor: #f4f6f8, roughness: 0.12, specular: 0.9, IOR: 1.52).
Details: Subtle rim chamfer, recessed underside base ring with unglazed matte stoneware texture.`,
        proceduralParams: {
          type: 'cylinder',
          dimensions: [1.2, 1.6, 1.2],
          color: '#f0f4f8',
          hasHandle: true
        },
        generate: (scene, prims) => {
          const cupBody = prims.createCylinder(0.8, 1.6, 32);
          cupBody.mesh.name = 'Cup_CeramicMug_Body';
          cupBody.mesh.position.set(0, 0.8, 0);
          if (cupBody.mesh.material) {
            cupBody.mesh.material.color.setHex(0xf5f7fa);
            cupBody.mesh.material.roughness = 0.15;
            cupBody.mesh.material.metalness = 0.05;
          }

          // C-handle (Torus slice)
          const handle = prims.createTorus(0.45, 0.12, 16, 24);
          handle.mesh.name = 'Cup_CeramicMug_Handle';
          handle.mesh.rotation.y = Math.PI / 2;
          handle.mesh.position.set(0.85, 0.85, 0);
          if (handle.mesh.material) {
            handle.mesh.material.color.setHex(0xf5f7fa);
            handle.mesh.material.roughness = 0.15;
          }

          scene.addObject(cupBody.mesh, cupBody.mesh.name);
          scene.addObject(handle.mesh, handle.mesh.name);
          return cupBody.mesh;
        }
      },
      {
        id: 'obj-tableware-espresso-cup',
        name: 'Italian Espresso Demitasse Cup & Saucer',
        scaleCategory: 'human',
        scaleOrder: '10⁻¹ m',
        scale: '55mm height x 60mm diameter',
        tags: ['cup', 'espresso', 'demitasse', 'porcelain', 'saucer', 'tableware'],
        description: 'Heavy-walled Italian porcelain espresso demitasse with thick heat-retentive base, small single-finger loop handle, and matching ceramic saucer disk.',
        prompt: `Model an Italian espresso demitasse cup with saucer. Cup height 55mm, diameter 60mm, wall thickness 5mm with tulip curved flare.
Saucer: 120mm diameter shallow circular plate with center depression locking ring.
Material: Glossy glazed deep cobalt blue ceramic with gold rim line (roughness 0.1, specular 0.85).`,
        proceduralParams: { type: 'cylinder', dimensions: [0.9, 0.8, 0.9], color: '#1565c0' },
        generate: (scene, prims) => {
          const cup = prims.createCylinder(0.6, 0.8, 28);
          cup.mesh.name = 'Espresso_Cup';
          cup.mesh.position.set(0, 0.45, 0);
          if (cup.mesh.material) cup.mesh.material.color.setHex(0x1976d2);

          const saucer = prims.createCylinder(1.2, 0.08, 32);
          saucer.mesh.name = 'Espresso_Saucer';
          saucer.mesh.position.set(0, 0.04, 0);
          if (saucer.mesh.material) saucer.mesh.material.color.setHex(0x1565c0);

          scene.addObject(cup.mesh, cup.mesh.name);
          scene.addObject(saucer.mesh, saucer.mesh.name);
          return cup.mesh;
        }
      },
      {
        id: 'obj-tableware-wine-glass',
        name: 'Crystal Bordeaux Wine Glass',
        scaleCategory: 'human',
        scaleOrder: '10⁻¹ m',
        scale: '240mm height x 95mm bowl diameter',
        tags: ['glass', 'wine', 'crystal', 'tableware', 'transparent', 'drinkware'],
        description: 'Hand-blown lead crystal wine glass featuring a tall tapered tulip bowl, seamless drawn slender stem, and flat stable circular foot.',
        prompt: `Synthesize a luxury crystal wine glass. Total height 240mm.
Geometry: Wide tapered balloon bowl tapering to an 80mm rim, drawn 6mm cylindrical stem transitioning smoothly into a 90mm circular baseplate.
Shader: Physical transmission glass shader (transmission: 1.0, roughness: 0.02, IOR: 1.54, dispersion: 0.015).`,
        proceduralParams: { type: 'cylinder', dimensions: [0.9, 2.4, 0.9], color: '#ffffff' },
        generate: (scene, prims) => {
          const bowl = prims.createSphere(0.8, 24);
          bowl.mesh.name = 'Wine_Glass_Bowl';
          bowl.mesh.scale.set(1.0, 1.4, 1.0);
          bowl.mesh.position.set(0, 1.8, 0);

          const stem = prims.createCylinder(0.08, 1.4, 16);
          stem.mesh.name = 'Wine_Glass_Stem';
          stem.mesh.position.set(0, 0.8, 0);

          const base = prims.createCylinder(0.9, 0.05, 24);
          base.mesh.name = 'Wine_Glass_Base';
          base.mesh.position.set(0, 0.05, 0);

          scene.addObject(bowl.mesh, bowl.mesh.name);
          scene.addObject(stem.mesh, stem.mesh.name);
          scene.addObject(base.mesh, base.mesh.name);
          return bowl.mesh;
        }
      },
      {
        id: 'obj-tableware-fork-knife',
        name: 'Forged Culinary Flatware (Fork & Knife)',
        scaleCategory: 'human',
        scaleOrder: '10⁻¹ m',
        scale: '210mm length x 25mm width',
        tags: ['fork', 'knife', 'cutlery', 'flatware', 'steel', 'utensil'],
        description: '18/10 stainless steel forged culinary dining set with four tapered polished tines and ergonomic drop-handle.',
        prompt: `Create forged cutlery dinner set. Fork: 210mm length, 4 precision tapered tines with arched drop bolster.
Knife: 230mm forged bolster, serrated edge, brushed steel bolster and weighted handle.
Shader: Polished specular stainless steel (roughness: 0.15, metalness: 0.95).`,
        proceduralParams: { type: 'cube', dimensions: [0.3, 0.1, 2.1], color: '#cfd8dc' },
        generate: (scene, prims) => {
          const fork = prims.createCube(1);
          fork.mesh.name = 'Flatware_Fork';
          fork.mesh.scale.set(0.25, 0.06, 2.1);
          fork.mesh.position.set(-0.3, 0.03, 0);
          if (fork.mesh.material) {
            fork.mesh.material.metalness = 0.95;
            fork.mesh.material.roughness = 0.15;
          }

          const knife = prims.createCube(1);
          knife.mesh.name = 'Flatware_Knife';
          knife.mesh.scale.set(0.18, 0.08, 2.3);
          knife.mesh.position.set(0.3, 0.04, 0);
          if (knife.mesh.material) {
            knife.mesh.material.metalness = 0.95;
            knife.mesh.material.roughness = 0.15;
          }

          scene.addObject(fork.mesh, fork.mesh.name);
          scene.addObject(knife.mesh, knife.mesh.name);
          return fork.mesh;
        }
      },

      // ======================================================================
      // SCALE 2: MICRO & NANOSCALE (ATOMS, MOLECULES, CHIPS, FASTENERS)
      // ======================================================================
      {
        id: 'obj-micro-water-molecule',
        name: 'Water Molecule (H₂O)',
        scaleCategory: 'micro',
        scaleOrder: '10⁻¹⁰ m (0.28 nm)',
        scale: '0.28 nanometers bond span',
        tags: ['molecule', 'water', 'chemistry', 'nanoscale', 'atom', 'scientific'],
        description: 'Covalent polar water molecule with central Oxygen atom bonded to two Hydrogen atoms at 104.45° bond angle.',
        prompt: `Construct a scientifically accurate 3D Ball-and-Stick water molecule (H2O).
Oxygen Atom: Van der Waals sphere radius 1.52 Å at origin (colored red #e53935).
Hydrogen Atoms: Two spheres radius 1.20 Å positioned at 0.96 Å bond distance with 104.45° bond angle (colored white #ffffff).
Bonds: Dual translucent cylindrical covalent bond rods connecting O to H atoms.`,
        proceduralParams: { type: 'sphere', dimensions: [1, 1, 1], color: '#e53935' },
        generate: (scene, prims) => {
          const oxygen = prims.createSphere(0.8, 24);
          oxygen.mesh.name = 'Molecule_Oxygen_Center';
          oxygen.mesh.position.set(0, 0.8, 0);
          if (oxygen.mesh.material) oxygen.mesh.material.color.setHex(0xe53935);

          const h1 = prims.createSphere(0.45, 20);
          h1.mesh.name = 'Molecule_Hydrogen_1';
          h1.mesh.position.set(0.9, 1.4, 0);
          if (h1.mesh.material) h1.mesh.material.color.setHex(0xffffff);

          const h2 = prims.createSphere(0.45, 20);
          h2.mesh.name = 'Molecule_Hydrogen_2';
          h2.mesh.position.set(-0.9, 1.4, 0);
          if (h2.mesh.material) h2.mesh.material.color.setHex(0xffffff);

          scene.addObject(oxygen.mesh, oxygen.mesh.name);
          scene.addObject(h1.mesh, h1.mesh.name);
          scene.addObject(h2.mesh, h2.mesh.name);
          return oxygen.mesh;
        }
      },
      {
        id: 'obj-micro-microchip',
        name: 'Silicon Microprocessor Die & Substrate',
        scaleCategory: 'micro',
        scaleOrder: '10⁻² m (15mm)',
        scale: '15mm x 15mm x 0.8mm',
        tags: ['silicon', 'chip', 'semiconductor', 'microprocessor', 'electronics', 'tech'],
        description: 'Photolithographic etched silicon microprocessor die with copper heat spreader perimeter and gold contact array.',
        prompt: `Model an advanced silicon processor flip-chip die.
Substrate: 35mm square multi-layer organic green PCB with 1200 gold ball contact pad arrays.
Die: 15mm mirror-finish etched silicon die with iridescent rainbow diffraction grating shader and micro-etched core boundaries.`,
        proceduralParams: { type: 'cube', dimensions: [3, 0.2, 3], color: '#2e7d32' },
        generate: (scene, prims) => {
          const substrate = prims.createCube(3);
          substrate.mesh.name = 'IC_Substrate_PCB';
          substrate.mesh.scale.set(1.2, 0.08, 1.2);
          substrate.mesh.position.set(0, 0.1, 0);
          if (substrate.mesh.material) substrate.mesh.material.color.setHex(0x1b5e20);

          const die = prims.createCube(1.5);
          die.mesh.name = 'IC_Silicon_Die';
          die.mesh.scale.set(1.0, 0.12, 1.0);
          die.mesh.position.set(0, 0.25, 0);
          if (die.mesh.material) {
            die.mesh.material.color.setHex(0x37474f);
            die.mesh.material.metalness = 0.9;
            die.mesh.material.roughness = 0.1;
          }

          scene.addObject(substrate.mesh, substrate.mesh.name);
          scene.addObject(die.mesh, die.mesh.name);
          return substrate.mesh;
        }
      },

      // ======================================================================
      // SCALE 3: HARDWARE & MECHANICAL ENGINEERING
      // ======================================================================
      {
        id: 'obj-hw-hex-bolt',
        name: 'Hexagonal Flange Bolt & Nut (M12)',
        scaleCategory: 'hardware',
        scaleOrder: '10⁻¹ m (60mm)',
        scale: 'M12 x 50mm metric bolt',
        tags: ['bolt', 'screw', 'fastener', 'hardware', 'mechanical', 'flange', 'nut'],
        description: 'Standard Grade 8.8 galvanized zinc-plated metric hex head bolt with integrated washer flange and matching hex lock nut.',
        prompt: `Generate a parametric M12 hex head bolt.
Head: Hexagonal prism with chamfered top crown, 18mm across flats, 7mm height, integrated circular serrated washer flange.
Shank: 12mm cylindrical body with 35mm length standard M12x1.75 helical thread profile.
Material: Galvanized zinc-chromate steel with anisotropic surface lathe reflections.`,
        proceduralParams: { type: 'cylinder', dimensions: [1, 2.5, 1], color: '#90a4ae' },
        generate: (scene, prims) => {
          const head = prims.createCylinder(0.8, 0.5, 6);
          head.mesh.name = 'Hex_Bolt_Head';
          head.mesh.position.set(0, 2.2, 0);

          const shank = prims.createCylinder(0.4, 2.0, 24);
          shank.mesh.name = 'Hex_Bolt_Shank';
          shank.mesh.position.set(0, 1.0, 0);

          const nut = prims.createCylinder(0.75, 0.45, 6);
          nut.mesh.name = 'Hex_Nut_M12';
          nut.mesh.position.set(0, 0.6, 0);

          scene.addObject(head.mesh, head.mesh.name);
          scene.addObject(shank.mesh, shank.mesh.name);
          scene.addObject(nut.mesh, nut.mesh.name);
          return head.mesh;
        }
      },
      {
        id: 'obj-hw-ball-bearing',
        name: 'Precision Deep-Groove Ball Bearing (608-RS)',
        scaleCategory: 'hardware',
        scaleOrder: '10⁻² m (22mm)',
        scale: 'Ø22mm outer x Ø8mm bore x 7mm width',
        tags: ['bearing', 'mechanical', 'ballbearing', 'race', 'cad', 'hardware'],
        description: 'Industrial rolling element ball bearing with precision ground inner/outer races, stamped brass retainer cage, and polished chrome steel spheres.',
        prompt: `Model an industrial 608 ball bearing.
Races: Concentric outer ring (Ø22mm) and inner bore ring (Ø8mm) with machined circular raceways.
Rolling Elements: 8 spherical ball bearings (Ø3.96mm) evenly arrayed at 45° intervals inside stamped separator cage.
Material: Polished AISI 52100 chrome bearing steel (mirror finish, roughness 0.05).`,
        proceduralParams: { type: 'torus', dimensions: [1.5, 1.5, 0.5], color: '#b0bec5' },
        generate: (scene, prims) => {
          const outer = prims.createCylinder(1.5, 0.5, 32);
          outer.mesh.name = 'Bearing_Outer_Race';
          outer.mesh.position.set(0, 0.25, 0);

          const inner = prims.createCylinder(0.6, 0.52, 32);
          inner.mesh.name = 'Bearing_Inner_Race';
          inner.mesh.position.set(0, 0.25, 0);

          scene.addObject(outer.mesh, outer.mesh.name);
          scene.addObject(inner.mesh, inner.mesh.name);
          return outer.mesh;
        }
      },

      // ======================================================================
      // SCALE 4: CONSUMER ELECTRONICS & GADGETS
      // ======================================================================
      {
        id: 'obj-gadget-smartphone',
        name: 'Ultra-Thin Smartphone Device',
        scaleCategory: 'gadget',
        scaleOrder: '10⁻¹ m (160mm)',
        scale: '160mm x 77mm x 8mm',
        tags: ['phone', 'smartphone', 'mobile', 'electronics', 'gadget', 'screen'],
        description: 'Next-gen flagship smartphone with curved titanium chassis, edge-to-edge OLED glass display, and rear triple camera array.',
        prompt: `Create a modern flagship smartphone.
Chassis: 160mm x 77mm x 8mm rounded rectangular prism with 4mm corner fillets and satin brushed titanium rail.
Front: Jet black edge-to-edge OLED glass with subtle punch-hole camera aperture.
Rear: Frosted matte gorilla glass with raised sapphire camera island housing triple optical lenses.`,
        proceduralParams: { type: 'cube', dimensions: [1.2, 2.4, 0.15], color: '#212121' },
        generate: (scene, prims) => {
          const body = prims.createCube(1);
          body.mesh.name = 'Smartphone_Chassis';
          body.mesh.scale.set(1.4, 2.8, 0.12);
          body.mesh.position.set(0, 1.4, 0);
          if (body.mesh.material) {
            body.mesh.material.color.setHex(0x1a1a1a);
            body.mesh.material.roughness = 0.2;
            body.mesh.material.metalness = 0.8;
          }

          const screen = prims.createCube(1);
          screen.mesh.name = 'Smartphone_Screen';
          screen.mesh.scale.set(1.3, 2.6, 0.02);
          screen.mesh.position.set(0, 1.4, 0.07);
          if (screen.mesh.material) {
            screen.mesh.material.color.setHex(0x00bcd4);
            screen.mesh.material.roughness = 0.05;
          }

          scene.addObject(body.mesh, body.mesh.name);
          scene.addObject(screen.mesh, screen.mesh.name);
          return body.mesh;
        }
      },
      {
        id: 'obj-gadget-drone',
        name: 'Autonomous Aerial Quadcopter Drone',
        scaleCategory: 'gadget',
        scaleOrder: '10⁻¹ m (400mm)',
        scale: '400mm x 400mm x 150mm',
        tags: ['drone', 'quadcopter', 'robotics', 'propeller', 'aerial', 'flight'],
        description: 'High-speed autonomous quadcopter featuring lightweight carbon fiber cross-arms, 4 brushless electric motors, aerodynamic hull, and forward 4K sensor gimbal.',
        prompt: `Design an aerodynamic quadcopter drone.
Frame: Aerodynamic molded central fuselage with four 45° swept carbon composite rotor arms.
Propulsion: Four outrunner brushless motors with twin-blade composite propellers.
Sensors: Underslung 3-axis gyro-stabilized camera gimbal with dual obstacle avoidance sensors.`,
        proceduralParams: { type: 'cube', dimensions: [3, 0.6, 3], color: '#37474f' },
        generate: (scene, prims) => {
          const fuselage = prims.createCube(1);
          fuselage.mesh.name = 'Drone_Fuselage';
          fuselage.mesh.scale.set(1.2, 0.4, 1.6);
          fuselage.mesh.position.set(0, 0.6, 0);

          const arm1 = prims.createCylinder(0.08, 2.8, 12);
          arm1.mesh.name = 'Drone_Rotor_Arm_A';
          arm1.mesh.rotation.z = Math.PI / 4;
          arm1.mesh.position.set(0, 0.6, 0);

          const arm2 = prims.createCylinder(0.08, 2.8, 12);
          arm2.mesh.name = 'Drone_Rotor_Arm_B';
          arm2.mesh.rotation.z = -Math.PI / 4;
          arm2.mesh.position.set(0, 0.6, 0);

          scene.addObject(fuselage.mesh, fuselage.mesh.name);
          scene.addObject(arm1.mesh, arm1.mesh.name);
          scene.addObject(arm2.mesh, arm2.mesh.name);
          return fuselage.mesh;
        }
      },

      // ======================================================================
      // SCALE 5: FURNITURE & ROOM (CHAIRS, TABLES, LIGHTS)
      // ======================================================================
      {
        id: 'obj-furniture-chair',
        name: 'Ergonomic Executive Office Chair',
        scaleCategory: 'room',
        scaleOrder: '10⁰ m (1.2m)',
        scale: '650mm x 650mm x 1200mm',
        tags: ['chair', 'furniture', 'office', 'ergonomic', 'leather', 'interior'],
        description: 'Adjustable ergonomic task chair with pneumatic cylinder column, 5-star castor wheel base, lumbar mesh backrest, and padded 3D armrests.',
        prompt: `Construct an ergonomic office task chair.
Base: 5-spoke aluminum star base with twin-wheel nylon castors and center pneumatic lifting piston.
Seat: Contoured high-density foam seat cushion upholstered in breathable charcoal weave.
Backrest: Curved poly-composite lumbar spine with flexible breathable elastomeric mesh suspension.`,
        proceduralParams: { type: 'cube', dimensions: [1.4, 2.4, 1.4], color: '#263238' },
        generate: (scene, prims) => {
          const seat = prims.createCube(1.2);
          seat.mesh.name = 'Chair_Seat';
          seat.mesh.scale.set(1.2, 0.2, 1.2);
          seat.mesh.position.set(0, 1.2, 0);

          const back = prims.createCube(1.2);
          back.mesh.name = 'Chair_Backrest';
          back.mesh.scale.set(1.1, 1.4, 0.15);
          back.mesh.position.set(0, 1.9, -0.5);

          const stem = prims.createCylinder(0.12, 1.2, 16);
          stem.mesh.name = 'Chair_Piston_Base';
          stem.mesh.position.set(0, 0.6, 0);

          scene.addObject(seat.mesh, seat.mesh.name);
          scene.addObject(back.mesh, back.mesh.name);
          scene.addObject(stem.mesh, stem.mesh.name);
          return seat.mesh;
        }
      },

      // ======================================================================
      // SCALE 6: VEHICLES & MOBILITY
      // ======================================================================
      {
        id: 'obj-veh-hypercar',
        name: 'Electric Aerodynamic Hypercar',
        scaleCategory: 'vehicle',
        scaleOrder: '10⁰ - 10¹ m (4.8m)',
        scale: '4.8m length x 2.1m width x 1.15m height',
        tags: ['car', 'vehicle', 'hypercar', 'transport', 'speed', 'automotive'],
        description: 'Low-slung electric hypercar with sculpted monocoque carbon shell, active aerodynamic front air splitter, and center-lock magnesium wheels.',
        prompt: `Generate an ultra-sleek aerodynamic electric hypercar.
Body: Sculpted aerodynamic monocoque carbon body, cab-forward cockpit glasshouse, functional air intake vents, aggressive rear diffuser.
Wheels: 21-inch forged magnesium wheels wrapped in ultra-low profile competition tires.
Shaders: Deep metallic midnight blue paint with double clearcoat reflections (roughness 0.08, metallic 0.85).`,
        proceduralParams: { type: 'cube', dimensions: [4.8, 1.2, 2.1], color: '#0d47a1' },
        generate: (scene, prims) => {
          const chassis = prims.createCube(2);
          chassis.mesh.name = 'Hypercar_Chassis';
          chassis.mesh.scale.set(2.4, 0.45, 1.1);
          chassis.mesh.position.set(0, 0.6, 0);
          if (chassis.mesh.material) chassis.mesh.material.color.setHex(0x0d47a1);

          const cabin = prims.createCube(1.4);
          cabin.mesh.name = 'Hypercar_Cockpit';
          cabin.mesh.scale.set(1.2, 0.4, 0.8);
          cabin.mesh.position.set(-0.2, 1.0, 0);
          if (cabin.mesh.material) {
            cabin.mesh.material.color.setHex(0x111111);
            cabin.mesh.material.roughness = 0.05;
          }

          scene.addObject(chassis.mesh, chassis.mesh.name);
          scene.addObject(cabin.mesh, cabin.mesh.name);
          return chassis.mesh;
        }
      },

      // ======================================================================
      // SCALE 7: ARCHITECTURE & MEGASTRUCTURES
      // ======================================================================
      {
        id: 'obj-arch-skyscraper',
        name: 'Cybernetic Megacity Skyscraper',
        scaleCategory: 'architectural',
        scaleOrder: '10² m (450m)',
        scale: '450m height x 80m base footprint',
        tags: ['skyscraper', 'tower', 'building', 'architecture', 'city', 'megacity'],
        description: 'Neo-futuristic 110-story skyscraper with diagrid exoskeleton, multi-tiered sky lobbies, exterior express elevator conduits, and crowning spire.',
        prompt: `Create a futuristic architectural skyscraper.
Form: 450m tapering tower with structural triangular steel diagrid exoskeleton, recessed multi-story sky lobbies at floors 40 and 80.
Facade: Unitized blue-tinted solar glazing curtain wall panels with horizontal architectural louvers.
Crown: Twin 45m telecommunication spires and rooftop helipad.`,
        proceduralParams: { type: 'cube', dimensions: [3, 12, 3], color: '#263238' },
        generate: (scene, prims) => {
          const tower = prims.createCube(2);
          tower.mesh.name = 'Megacity_Tower_Core';
          tower.mesh.scale.set(1.6, 7.5, 1.6);
          tower.mesh.position.set(0, 7.5, 0);
          if (tower.mesh.material) {
            tower.mesh.material.color.setHex(0x37474f);
            tower.mesh.material.roughness = 0.2;
            tower.mesh.material.metalness = 0.7;
          }

          const spire = prims.createCone(0.3, 3.0, 16);
          spire.mesh.name = 'Tower_Antenna_Spire';
          spire.mesh.position.set(0, 16.5, 0);

          scene.addObject(tower.mesh, tower.mesh.name);
          scene.addObject(spire.mesh, spire.mesh.name);
          return tower.mesh;
        }
      },

      // ======================================================================
      // SCALE 8: GEOLOGICAL TERRAINS & NATURAL BIOMES
      // ======================================================================
      {
        id: 'obj-geo-volcano',
        name: 'Stratovolcano Mountain & Caldera',
        scaleCategory: 'geological',
        scaleOrder: '10³ m (3,800m)',
        scale: '15km base diameter x 3,800m elevation',
        tags: ['mountain', 'volcano', 'terrain', 'landscape', 'caldera', 'geology', 'nature'],
        description: 'Majestic conical volcanic mountain featuring procedural erosion gullies, basalt scree slopes, and summit volcanic crater.',
        prompt: `Generate a procedural volcanic mountain.
Footprint: 15km diameter circular base with exponential elevation gradient reaching 3,800m peak.
Topography: Fluvial hydraulic erosion channels, radial ridge spurs, rugged scree slopes, and 800m diameter summit caldera.
Material: Layered basalt rock, dark volcanic ash deposits, and glacial snow caps along northern ridge lines.`,
        proceduralParams: { type: 'cone', dimensions: [8, 5, 8], color: '#455a64' },
        generate: (scene, prims) => {
          const volcano = prims.createCone(5.0, 4.5, 36);
          volcano.mesh.name = 'Terrain_Stratovolcano';
          volcano.mesh.position.set(0, 2.25, 0);
          if (volcano.mesh.material) {
            volcano.mesh.material.color.setHex(0x455a64);
            volcano.mesh.material.roughness = 0.9;
          }
          scene.addObject(volcano.mesh, volcano.mesh.name);
          return volcano.mesh;
        }
      },

      // ======================================================================
      // SCALE 9: PLANETARY OBJECTS & MOONS
      // ======================================================================
      {
        id: 'obj-planet-earthlike',
        name: 'Living Terrestrial Planet (Earth-like)',
        scaleCategory: 'planetary',
        scaleOrder: '10⁷ m (12,742 km)',
        scale: '12,742 km equatorial diameter',
        tags: ['planet', 'earth', 'ocean', 'atmosphere', 'space', 'astronomy', 'globe'],
        description: 'Complete habitable terrestrial sphere featuring dynamic ocean specular response, continental landmasses with varied biomes, and layered atmospheric Rayleigh scattering.',
        prompt: `Synthesize a photorealistic Earth-like terrestrial exoplanet.
Diameter: 12,742 km sphere with topographic elevation displacement mapping.
Surfaces: Deep liquid water oceans with high specular fresnel response, continental landmasses with biome color gradation (forests, savannas, deserts, ice caps).
Atmosphere: Dual cloud layer shell with cyclone vortex formations and realistic blue limb Rayleigh scattering atmosphere glow.`,
        proceduralParams: { type: 'sphere', dimensions: [6, 6, 6], color: '#1e88e5' },
        generate: (scene, prims) => {
          const planet = prims.createSphere(3.5, 48);
          planet.mesh.name = 'Planet_Terrestrial_Globe';
          planet.mesh.position.set(0, 3.5, 0);
          if (planet.mesh.material) {
            planet.mesh.material.color.setHex(0x1976d2);
            planet.mesh.material.roughness = 0.3;
          }

          const atmo = prims.createSphere(3.65, 36);
          atmo.mesh.name = 'Planet_Atmosphere_Glow';
          atmo.mesh.position.set(0, 3.5, 0);
          if (atmo.mesh.material) {
            atmo.mesh.material.color.setHex(0x64b5f6);
            atmo.mesh.material.transparent = true;
            atmo.mesh.material.opacity = 0.35;
          }

          scene.addObject(planet.mesh, planet.mesh.name);
          scene.addObject(atmo.mesh, atmo.mesh.name);
          return planet.mesh;
        }
      },
      {
        id: 'obj-planet-ringed-giant',
        name: 'Ringed Gas Giant Planet (Saturnian)',
        scaleCategory: 'planetary',
        scaleOrder: '10⁸ m (120,000 km)',
        scale: '120,000 km planetary body with 280,000 km ring disk',
        tags: ['planet', 'gasgiant', 'rings', 'saturn', 'astronomy', 'space'],
        description: 'Majestic oblate gas giant with banded ammonia and methane cloud storms, encircled by an ultra-thin concentric icy planetary ring system.',
        prompt: `Render a massive ringed gas giant planet.
Planet: Oblate spheroid with 120,000 km equatorial diameter, swirling atmospheric latitudinal bands of ochre, cream, and amber storm eddies.
Ring System: 0.1km thin concentric disk extending from 70,000 km to 140,000 km radius with Cassini division gap and opacity gradients.`,
        proceduralParams: { type: 'sphere', dimensions: [5, 5, 5], color: '#d7ccc8' },
        generate: (scene, prims) => {
          const giant = prims.createSphere(3.0, 36);
          giant.mesh.name = 'GasGiant_Sphere';
          giant.mesh.scale.set(1.1, 0.95, 1.1);
          giant.mesh.position.set(0, 3.5, 0);
          if (giant.mesh.material) giant.mesh.material.color.setHex(0xd7ccc8);

          const ring = prims.createTorus(5.5, 1.2, 4, 48);
          ring.mesh.name = 'GasGiant_RingSystem';
          ring.mesh.rotation.x = Math.PI / 2.3;
          ring.mesh.scale.set(1.0, 1.0, 0.05);
          ring.mesh.position.set(0, 3.5, 0);
          if (ring.mesh.material) {
            ring.mesh.material.color.setHex(0xbcaaa4);
            ring.mesh.material.transparent = true;
            ring.mesh.material.opacity = 0.75;
          }

          scene.addObject(giant.mesh, giant.mesh.name);
          scene.addObject(ring.mesh, ring.mesh.name);
          return giant.mesh;
        }
      },

      // ======================================================================
      // SCALE 10: STELLAR BODIES & BLACK HOLES
      // ======================================================================
      {
        id: 'obj-stellar-blackhole',
        name: 'Spinning Black Hole & Accretion Disk',
        scaleCategory: 'stellar',
        scaleOrder: '10⁹ m to 10¹¹ m',
        scale: 'Schwarzschild event horizon with relativistic disk',
        tags: ['blackhole', 'singularity', 'accretion', 'relativity', 'space', 'cosmic', 'star'],
        description: 'Gravitational Kerr black hole with pitch-black event horizon, photon ring sphere, warped gravitational lensing, and fiery plasma accretion disk.',
        prompt: `Create a relativistic rotating black hole (Interstellar Gargantua-style).
Event Horizon: Perfectly light-absorbing black sphere surrounded by razor-sharp photon ring sphere.
Accretion Disk: Swirling ultra-hot relativistic plasma disk spanning 10x event horizon radius, warped vertically by gravitational lensing.
Jets: Dual collimated relativistic magnetic polar particle beams.`,
        proceduralParams: { type: 'sphere', dimensions: [4, 4, 4], color: '#000000' },
        generate: (scene, prims) => {
          const singularity = prims.createSphere(2.0, 32);
          singularity.mesh.name = 'BlackHole_Singularity';
          singularity.mesh.position.set(0, 3.0, 0);
          if (singularity.mesh.material) {
            singularity.mesh.material.color.setHex(0x000000);
            singularity.mesh.material.roughness = 1.0;
          }

          const disk = prims.createTorus(4.8, 0.6, 8, 48);
          disk.mesh.name = 'Accretion_Disk_Plasma';
          disk.mesh.rotation.x = Math.PI / 2;
          disk.mesh.position.set(0, 3.0, 0);
          if (disk.mesh.material) {
            disk.mesh.material.color.setHex(0xff7043);
            disk.mesh.material.emissive = new (window.THREE || {}).Color ? new window.THREE.Color(0xff5722) : null;
          }

          scene.addObject(singularity.mesh, singularity.mesh.name);
          scene.addObject(disk.mesh, disk.mesh.name);
          return singularity.mesh;
        }
      },

      // ======================================================================
      // SCALE 11: GALACTIC SCALE (SPIRAL GALAXIES)
      // ======================================================================
      {
        id: 'obj-galactic-spiral',
        name: 'Grand Design Spiral Galaxy',
        scaleCategory: 'galactic',
        scaleOrder: '10²¹ m (100,000 Light Years)',
        scale: '100,000 Light Years across, 200 Billion Stars',
        tags: ['galaxy', 'spiral', 'stars', 'milkyway', 'deepspace', 'astronomy', 'cosmos'],
        description: 'Rotating galactic disk containing 200 billion stars, a luminous stellar core bulge, two prominent logarithmic spiral arms, and interstellar dust lanes.',
        prompt: `Generate a Grand Design Spiral Galaxy.
Core: Dense brilliant spherical galactic bulge with supermassive black hole core emitting warm amber stellar glow.
Spiral Arms: Two major logarithmic spiral arms populated with young blue star clusters, ionized hydrogen H-II starburst regions, and dark silhouette dust lanes.
Halo: Sparse spherical halo with ancient globular clusters orbiting the galactic plane.`,
        proceduralParams: { type: 'torus', dimensions: [7, 7, 1], color: '#90caf9' },
        generate: (scene, prims) => {
          const core = prims.createSphere(1.8, 32);
          core.mesh.name = 'Galaxy_Core_Bulge';
          core.mesh.position.set(0, 2.5, 0);
          if (core.mesh.material) {
            core.mesh.material.color.setHex(0xffecb3);
          }

          const arms = prims.createTorus(5.5, 1.8, 4, 48);
          arms.mesh.name = 'Galaxy_Spiral_Arms';
          arms.mesh.rotation.x = Math.PI / 2;
          arms.mesh.position.set(0, 2.5, 0);
          if (arms.mesh.material) {
            arms.mesh.material.color.setHex(0x64b5f6);
            arms.mesh.material.transparent = true;
            arms.mesh.material.opacity = 0.65;
          }

          scene.addObject(core.mesh, core.mesh.name);
          scene.addObject(arms.mesh, arms.mesh.name);
          return core.mesh;
        }
      },

      // ======================================================================
      // SCALE 12: THE ENTIRE OBSERVABLE UNIVERSE (COSMIC WEB)
      // ======================================================================
      {
        id: 'obj-cosmic-universe-web',
        name: 'The Observable Universe (Cosmic Web)',
        scaleCategory: 'cosmic',
        scaleOrder: '10²⁶ m (93 Billion Light Years)',
        scale: '93 Billion Light Years (The Entire Known Universe)',
        tags: ['universe', 'cosmic', 'web', 'filaments', 'superclusters', 'voids', 'infinity'],
        description: 'The totality of physical existence: The vast 93-billion-light-year Cosmic Web composed of interconnected dark matter filaments, galactic superclusters, and gigantic cosmic voids, bounded by the Cosmic Microwave Background horizon.',
        prompt: `Construct a scientifically grounded representation of the Entire Observable Universe.
Macro-Structure: A 93-billion-light-year spherical cosmic horizon containing the Large-Scale Structure of the universe.
Cosmic Web: Intricate web-like network of glowing dark matter filaments along which billions of galaxy clusters (Laniakea, Shapley, Sloan Great Wall) are threaded like beads of light.
Cosmic Voids: Giant dark regions (Boötes void) spanning hundreds of millions of light-years with near-zero galactic density.
Outer Boundary: Spherical boundary shell exhibiting thermal Cosmic Microwave Background (CMB) dipole temperature fluctuations (2.725 Kelvin signature).`,
        proceduralParams: { type: 'sphere', dimensions: [9, 9, 9], color: '#7c4dff' },
        generate: (scene, prims) => {
          // Cosmic Web Filament Core (Interconnected glowing structure)
          const universeSphere = prims.createSphere(6.0, 48);
          universeSphere.mesh.name = 'Universe_CosmicWeb_Horizon';
          universeSphere.mesh.position.set(0, 6.0, 0);
          if (universeSphere.mesh.material) {
            universeSphere.mesh.material.color.setHex(0x4a148c);
            universeSphere.mesh.material.wireframe = true;
            universeSphere.mesh.material.transparent = true;
            universeSphere.mesh.material.opacity = 0.45;
          }

          // Central Supercluster Core
          const supercluster = prims.createSphere(2.5, 32);
          supercluster.mesh.name = 'Universe_Local_Superclusters';
          supercluster.mesh.position.set(0, 6.0, 0);
          if (supercluster.mesh.material) {
            supercluster.mesh.material.color.setHex(0x7c4dff);
            supercluster.mesh.material.transparent = true;
            supercluster.mesh.material.opacity = 0.7;
          }

          scene.addObject(universeSphere.mesh, universeSphere.mesh.name);
          scene.addObject(supercluster.mesh, supercluster.mesh.name);
          return universeSphere.mesh;
        }
      }
    ];
  }

  render() {
    const filtered = this.getFilteredItems();
    const selected = this.getAllItems().find(i => i.id === this.selectedObjectId) || filtered[0] || this.builtInCatalog[0];

    return `
      <div class="ledger-container">
        <!-- Ledger Header -->
        <div class="ledger-header">
          <div class="ledger-title-row">
            <div class="ledger-brand">
              <span class="ledger-icon">📖</span>
              <div>
                <div class="ledger-title">Universal Prompt Ledger</div>
                <div class="ledger-subtitle">Ontology Registry & Objectised Blueprints: From Cup to Universe</div>
              </div>
            </div>
            <div class="ledger-stats-badge">
              <span class="stat-count">${this.getAllItems().length}</span>
              <span class="stat-label">Objects Cataloged</span>
            </div>
          </div>

          <!-- Search & Filter Controls -->
          <div class="ledger-controls">
            <div class="ledger-search-box">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                id="ledger-search-input"
                class="ledger-search-input"
                placeholder="Search any object in the universe (e.g., cup, gear, skyscraper, universe, planet)..."
                value="${this.escapeHtml(this.searchQuery)}"
              />
              ${this.searchQuery ? `<button id="ledger-search-clear" class="search-clear-btn">✕</button>` : ''}
            </div>

            <!-- Scale Filter Pills -->
            <div class="ledger-scale-pills">
              <button class="scale-pill ${this.selectedScale === 'all' ? 'active' : ''}" data-scale="all">All Scales</button>
              <button class="scale-pill ${this.selectedScale === 'human' ? 'active' : ''}" data-scale="human">☕ Everyday / Cup</button>
              <button class="scale-pill ${this.selectedScale === 'micro' ? 'active' : ''}" data-scale="micro">🔬 Micro / Atomic</button>
              <button class="scale-pill ${this.selectedScale === 'hardware' ? 'active' : ''}" data-scale="hardware">🔩 Hardware</button>
              <button class="scale-pill ${this.selectedScale === 'gadget' ? 'active' : ''}" data-scale="gadget">📱 Gadgets</button>
              <button class="scale-pill ${this.selectedScale === 'room' ? 'active' : ''}" data-scale="room">🪑 Furniture</button>
              <button class="scale-pill ${this.selectedScale === 'vehicle' ? 'active' : ''}" data-scale="vehicle">🏎️ Vehicles</button>
              <button class="scale-pill ${this.selectedScale === 'architectural' ? 'active' : ''}" data-scale="architectural">🏙️ Megastructures</button>
              <button class="scale-pill ${this.selectedScale === 'geological' ? 'active' : ''}" data-scale="geological">🏔️ Geological</button>
              <button class="scale-pill ${this.selectedScale === 'planetary' ? 'active' : ''}" data-scale="planetary">🪐 Planetary</button>
              <button class="scale-pill ${this.selectedScale === 'stellar' ? 'active' : ''}" data-scale="stellar">☀️ Stellar</button>
              <button class="scale-pill ${this.selectedScale === 'galactic' ? 'active' : ''}" data-scale="galactic">🌌 Galactic</button>
              <button class="scale-pill ${this.selectedScale === 'cosmic' ? 'active' : ''}" data-scale="cosmic">🌌 Observable Universe</button>
            </div>
          </div>
        </div>

        <!-- Ledger Split View: Grid & Blueprint Detail -->
        <div class="ledger-split-body">
          <!-- Left: Catalog Item Cards -->
          <div class="ledger-items-list">
            ${filtered.length === 0 ? `
              <div class="ledger-empty-state">
                <span>🔍 No objects found matching "${this.escapeHtml(this.searchQuery)}"</span>
                <p>Try searching for "cup", "gear", "phone", "planet", "galaxy", or "universe".</p>
              </div>
            ` : filtered.map(item => `
              <div class="ledger-card ${item.id === selected?.id ? 'selected' : ''}" data-item-id="${item.id}">
                <div class="card-header">
                  <div class="card-name">${item.name}</div>
                  <span class="card-scale-badge">${item.scaleOrder}</span>
                </div>
                <div class="card-desc">${item.description.slice(0, 95)}...</div>
                <div class="card-tags">
                  ${item.tags.slice(0, 4).map(t => `<span class="card-tag">#${t}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Right: Detailed Objectised Blueprint Inspector -->
          <div class="ledger-detail-panel">
            ${selected ? this.renderDetailPanel(selected) : '<div class="no-selection">Select an object to inspect its blueprint</div>'}
          </div>
        </div>
      </div>
    `;
  }

  renderDetailPanel(item) {
    return `
      <div class="blueprint-container">
        <!-- Blueprint Title -->
        <div class="blueprint-header">
          <div>
            <div class="blueprint-name">${item.name}</div>
            <div class="blueprint-scale-metric">Scale Magnitude: <b>${item.scaleOrder}</b> (${item.scale})</div>
          </div>
          <div class="blueprint-actions">
            <button id="btn-ledger-synthesize" class="blueprint-action-btn primary" title="Generate this object in 3D viewport">
              ⚡ Synthesize 3D
            </button>
            <button id="btn-ledger-inject" class="blueprint-action-btn secondary" title="Inject prompt into Gemma-4 Copilot">
              🔥 Gemma-4
            </button>
            <button id="btn-ledger-send-adam" class="blueprint-action-btn adam" title="Send to Adam AI CAD">
              ⚡ Adam CAD
            </button>
            <button id="btn-ledger-dispatch-mcp" class="blueprint-action-btn mcp" title="Dispatch over Adam MCP bridge">
              🔌 Dispatch MCP
            </button>
          </div>
        </div>

        <!-- Physical Spec Matrix -->
        <div class="blueprint-spec-grid">
          <div class="spec-cell">
            <span class="spec-label">Domain Scale</span>
            <span class="spec-val">${item.scaleCategory.toUpperCase()}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-label">Metric Envelope</span>
            <span class="spec-val">${item.scale}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-label">Classification</span>
            <span class="spec-val">${item.tags[0] || 'Physical'}</span>
          </div>
          <div class="spec-cell">
            <span class="spec-label">Object Type</span>
            <span class="spec-val">${item.isCustom ? 'User Registered' : 'Universal Ontology'}</span>
          </div>
        </div>

        <!-- Description -->
        <div class="blueprint-section">
          <div class="section-title">Physical Topology & Description</div>
          <p class="blueprint-text">${item.description}</p>
        </div>

        <!-- Production-Grade Prompt Blueprint -->
        <div class="blueprint-section">
          <div class="section-title-row">
            <span class="section-title">Objectised Production Prompt</span>
            <button id="btn-copy-prompt" class="mini-copy-btn">📋 Copy</button>
          </div>
          <pre class="blueprint-prompt-box" id="blueprint-prompt-code">${this.escapeHtml(item.prompt)}</pre>
        </div>

        <!-- Custom Record Form -->
        <div class="blueprint-section" style="margin-top: auto;">
          <button id="btn-toggle-custom-form" class="custom-add-toggle">
            ➕ Record New Universal Object in Ledger
          </button>
          <div id="ledger-custom-form" class="custom-form" style="display: none;">
            <input type="text" id="cust-name" class="ledger-input" placeholder="Object Name (e.g., Titanium Pocket Knife, Andromeda Galaxy)" />
            <input type="text" id="cust-scale" class="ledger-input" placeholder="Physical Scale (e.g. 120mm, 2.5 Million Light Years)" />
            <textarea id="cust-desc" class="ledger-input" rows="2" placeholder="Physical Description..."></textarea>
            <textarea id="cust-prompt" class="ledger-input" rows="3" placeholder="Production Prompt Blueprint..."></textarea>
            <button id="btn-save-custom-object" class="save-custom-btn">💾 Save to Universal Ledger</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(container) {
    // Search input
    const searchInput = container.querySelector('#ledger-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.refreshView(container);
      });
    }

    const clearBtn = container.querySelector('#ledger-search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.searchQuery = '';
        this.refreshView(container);
      });
    }

    // Scale pills
    container.querySelectorAll('.scale-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.selectedScale = pill.dataset.scale;
        this.refreshView(container);
      });
    });

    // Card selection
    container.querySelectorAll('.ledger-card').forEach(card => {
      card.addEventListener('click', () => {
        this.selectedObjectId = card.dataset.itemId;
        this.refreshView(container);
      });
    });

    // Action: Synthesize 3D in Viewport
    const synthBtn = container.querySelector('#btn-ledger-synthesize');
    if (synthBtn) {
      synthBtn.addEventListener('click', () => {
        const item = this.getAllItems().find(i => i.id === this.selectedObjectId);
        if (item && item.generate) {
          synthBtn.textContent = '⏳ Synthesizing...';
          setTimeout(() => {
            const mesh = item.generate(this.scene, this.primitives);
            if (mesh) {
              this.scene.selectObject(mesh);
              if (this.outliner) this.outliner.render();
              if (this.channelBox) this.channelBox.render();
            }
            synthBtn.textContent = '✓ Synthesized in 3D!';
            setTimeout(() => { synthBtn.textContent = '⚡ Synthesize 3D'; }, 1500);
          }, 150);
        }
      });
    }

    // Action: Inject Prompt to Gemma-4
    const injectBtn = container.querySelector('#btn-ledger-inject');
    if (injectBtn) {
      injectBtn.addEventListener('click', () => {
        const item = this.getAllItems().find(i => i.id === this.selectedObjectId);
        if (item && this.onInjectPromptCallback) {
          this.onInjectPromptCallback(item.prompt);
          injectBtn.textContent = '✓ Injected!';
          setTimeout(() => { injectBtn.textContent = '🔥 Gemma-4'; }, 1500);
        }
      });
    }

    // Action: Send to Adam CAD
    const sendAdamBtn = container.querySelector('#btn-ledger-send-adam');
    if (sendAdamBtn) {
      sendAdamBtn.addEventListener('click', () => {
        const item = this.getAllItems().find(i => i.id === this.selectedObjectId);
        if (item && this.onSwitchToAdamCad) {
          sendAdamBtn.textContent = '✓ Sent!';
          this.onSwitchToAdamCad(item.prompt);
          setTimeout(() => { sendAdamBtn.textContent = '⚡ Adam CAD'; }, 1500);
        }
      });
    }

    // Action: Dispatch via Adam MCP
    const dispatchMcpBtn = container.querySelector('#btn-ledger-dispatch-mcp');
    if (dispatchMcpBtn) {
      dispatchMcpBtn.addEventListener('click', async () => {
        const item = this.getAllItems().find(i => i.id === this.selectedObjectId);
        if (item && this.adamClient) {
          dispatchMcpBtn.textContent = '⏳ Dispatching MCP...';
          try {
            await this.adamClient.invokeMcpTool('create_object', {
              type: item.proceduralParams?.type || 'cube',
              name: `Ledger_${item.id.replace(/-/g, '_')}`,
              color: item.proceduralParams?.color || '#00bcd4'
            });
            dispatchMcpBtn.textContent = '✓ Dispatched MCP!';
          } catch (e) {
            dispatchMcpBtn.textContent = '✕ MCP Offline';
          }
          setTimeout(() => { dispatchMcpBtn.textContent = '🔌 Dispatch MCP'; }, 1800);
        }
      });
    }

    // Copy Prompt
    const copyBtn = container.querySelector('#btn-copy-prompt');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = container.querySelector('#blueprint-prompt-code')?.textContent;
        if (text) {
          navigator.clipboard.writeText(text);
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 1500);
        }
      });
    }

    // Custom Form Toggle
    const toggleFormBtn = container.querySelector('#btn-toggle-custom-form');
    const customForm = container.querySelector('#ledger-custom-form');
    if (toggleFormBtn && customForm) {
      toggleFormBtn.addEventListener('click', () => {
        const isHidden = customForm.style.display === 'none';
        customForm.style.display = isHidden ? 'flex' : 'none';
      });
    }

    // Save Custom Object
    const saveCustomBtn = container.querySelector('#btn-save-custom-object');
    if (saveCustomBtn) {
      saveCustomBtn.addEventListener('click', () => {
        const name = container.querySelector('#cust-name')?.value.trim();
        const scale = container.querySelector('#cust-scale')?.value.trim();
        const desc = container.querySelector('#cust-desc')?.value.trim();
        const prompt = container.querySelector('#cust-prompt')?.value.trim();

        if (!name || !prompt) {
          alert('Please enter at least an Object Name and Prompt Blueprint.');
          return;
        }

        const newItem = {
          name,
          scaleCategory: 'human',
          scaleOrder: 'Custom',
          scale: scale || 'Variable',
          tags: ['custom', name.toLowerCase()],
          description: desc || name,
          prompt,
          generate: (scene, prims) => {
            const m = prims.createCube(2);
            m.mesh.name = name.replace(/\s+/g, '_');
            scene.addObject(m.mesh, m.mesh.name);
            return m.mesh;
          }
        };

        const saved = this.saveCustomItem(newItem);
        this.selectedObjectId = saved.id;
        this.refreshView(container);
      });
    }
  }

  refreshView(container) {
    const dockContent = document.getElementById('jwala-dock-content');
    if (dockContent) {
      dockContent.innerHTML = this.render();
      this.bindEvents(dockContent);
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
