---
title: Jwala - 3D Studio + Gemma-4 AI
emoji: 🔥
colorFrom: red
colorTo: yellow
sdk: static
pinned: false
license: apache-2.0
short_description: Jwala 3D Studio with Gemma-4 AI Copilot
---

# 🔥 Jwala // 3D Studio + Gemma-4 AI Copilot

A comprehensive 3D Studio web recreation featuring an interactive 3D WebGL viewport, Outliner scene tree, Channel Box transform controls, Arnold material inspector, 120-frame animation timeline, MEL/Python script editor, and **Jwala AI Copilot** powered by `google/gemma-4-12B-it-qat-q4_0-gguf`.

---

## 🚀 Hugging Face Space
* **Space URL**: [https://huggingface.co/spaces/packiyanathan/jwala](https://huggingface.co/spaces/packiyanathan/jwala)
* **Model**: [`google/gemma-4-12B-it-qat-q4_0-gguf`](https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf)
* **App Name**: `Jwala` (🔥)

---

## 🛠️ Features

### 1. Interactive 3D Viewport
* **Interactive 3D Navigation**:
  - Left-Click Drag: Maya Camera Orbit
  - Right-Click Drag / Mouse Wheel: Dolly / Zoom
  - Middle-Click Drag / Alt+Left: Camera Pan
  - ViewCube: Instant camera orientation reset
* **Maya Infinite Ground Grid**: Dual subdivision grid with colored coordinate axes (X red, Y green, Z blue).
* **Viewport Shading Modes**:
  - `4`: Wireframe mode
  - `5`: Smooth Shaded mode
  - `6`: Arnold Realistic PBR Textured mode
* **Real-time Viewport HUD**: Dynamic polygon counters (Verts, Edges, Faces, Tris) and 60 FPS counter.

### 2. Maya Outliner & Scene Hierarchy
* Tree view of scene nodes: default cameras (`persp`, `top`, `front`, `side`), lights (`defaultLightSet`), and all 3D poly meshes.
* Click to select, eye icon to toggle visibility, duplicate (`Ctrl+D`), and delete (`Delete`).

### 3. Maya Channel Box & Arnold Attribute Editor
* **Channel Box**:
  - Numeric scrubbing inputs for Translate X/Y/Z, Rotate X/Y/Z, Scale X/Y/Z, and Visibility.
  - Construction history input nodes (`polyCube1`, `polySphere1`).
  - Display layers manager.
* **Arnold Attribute Editor**:
  - Arnold `aiStandardSurface` PBR material inspector.
  - Interactive color picker, metalness slider, roughness slider, and wireframe toggle.

### 4. 120-Frame Animation Timeline & Time Slider
* Scrubbable red playhead needle across frames 1 to 120.
* Playback controls: Play Forward, Play Reverse, Step Forward, Step Back, First Frame, Last Frame.
* Keyframing (`S` key): Saves position, rotation, and scale transforms per frame and interpolates motion smoothly during playback.

### 5. MEL & Python Script Editor
* Tabbed MEL and Python (`import maya.cmds as cmds`) console.
* Interactive command history log recording all scene actions in Maya command syntax.
* Script execution engine (`Ctrl+Enter`).

### 6. 🔥 Jwala AI Copilot (Powered by Google Gemma-4 12B)
* Target Model: **`google/gemma-4-12B-it-qat-q4_0-gguf`**.
* **Reasoning Stream**: Displays Gemma-4 chain-of-thought `<|channel>thought...<channel|>` before outputting executable code.
* **Procedural 3D Synthesis**:
  - 🤖 Articulated Sci-Fi Mech Robot with glowing energy core.
  - 🐉 Segmented Cyber Dragon with emission wings and crest.
  - 🏙️ Cyberpunk Skyscraper with illuminated window arrays and rooftop antenna.
  - 🦴 Humanoid 5-joint spine chain for Maya IK rigging.
  - ✨ Arnold reflective gold shader network.
* **Instant Execution**: One-click execution translates Gemma-4 AI reasoning directly into the live 3D viewport.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Maya Action |
| :--- | :--- |
| `Q` | Select Tool |
| `W` | Move Tool (Translate) |
| `E` | Rotate Tool |
| `R` | Scale Tool |
| `4` | Wireframe Shading |
| `5` | Smooth Shaded |
| `S` | Set Keyframe at Current Frame |
| `Ctrl + D` | Duplicate Selected Object |
| `Delete` | Delete Selected Object |
| `Ctrl + Enter` | Execute Script in Editor |

---

## 💻 Local Setup & Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5174` in your browser.

3. **Build production bundle**:
   ```bash
   npm run build
   ```

---

## 🚀 Deploying to Hugging Face Spaces

1. Login with your Hugging Face credentials:
   ```bash
   hf auth login
   ```

2. Build and upload dist files to the Space:
   ```bash
   npm run build
   hf upload packiyanathan/jwala dist/ . --repo-type space
   ```

---

## ⚡ Adam Connector & Adam AI CAD Integration

Jwala 3D Studio integrates with **Adam AI** ([adam.new](https://adam.new)) and the **Adam Connector** (`workspace-connector.exe`):

1. **Local MCP Bridge (`http://127.0.0.1:8000/mcp`)**:
   - Implements standard Model Context Protocol (JSON-RPC 2.0 / SSE stream).
   - Starts via `npm run bridge` (Node.js microservice in `server/adamBridge.js`).
   - Registers CAD tools: `create_object`, `modify_object`, `delete_object`, `select_objects`, `extrude_face`, `boolean_operation`, `execute_script`, and `capture_viewport`.

2. **Adam Connector Configuration**:
   - Auto-registered in `%APPDATA%\new.adam.workspace-connector\connectors.json`:
     ```json
     [
       {
         "name": "Jwala 3D Studio",
         "slug": "jwala-3d-studio",
         "url": "http://127.0.0.1:8000/mcp"
       }
     ]
     ```

3. **Adam AI CAD Co-Pilot in UI**:
   - Parametric mechanical presets: Mounting Flange, Spur Gear 24T, Enclosure Chassis, Finned Heatsink, 90° L-Bracket, and Face Extrusion.
   - Natural language CAD prompts and real-time viewport execution.
   - Live Model Context Protocol event log console and device pairing interface.

---

## 📖 Universal Prompt Ledger & Cosmic Object Ontology

An inbuilt prompt ledger where every single object in the universe—from a everyday domestic cup all the way to the entire observable universe—is objectised, cataloged, and saved with physical metrics and production-ready prompts:

### 1. The 12 Cosmic Scale Tiers
1. **☕ Everyday Domestic / Tableware ($10^{-1}\text{ m}$)**:
   - *Ceramic Coffee Mug (The Cup)*: 95mm height x 82mm outer diameter, 3.5mm wall thickness, extruded hollow cavity, filleted C-channel handle, glazed porcelain shader.
   - *Italian Espresso Demitasse Cup & Saucer*: 55mm height x 60mm diameter tulip curve flare with locking ring saucer.
   - *Crystal Bordeaux Wine Glass*: 240mm height tapered balloon bowl with drawn 6mm stem.
   - *Forged Culinary Flatware (Fork & Knife)*: 210mm length 18/10 stainless steel 4-tine fork and drop-forged bolster knife.
2. **🔬 Micro & Atomic Scale ($10^{-10}\text{ m}$ to $10^{-2}\text{ m}$)**:
   - *Water Molecule ($H_2O$)*: 0.28 nm bond span, central Oxygen atom at origin bonded to two Hydrogen atoms at 104.45° bond angle.
   - *Silicon Microprocessor Die & Substrate*: 15mm x 15mm x 0.8mm flip-chip die on multi-layer organic PCB with gold contact pads.
3. **🔩 Hardware & Fasteners ($10^{-2}\text{ m}$ to $10^{-1}\text{ m}$)**:
   - *Hexagonal Flange Bolt & Nut (M12)*: Grade 8.8 galvanized steel bolt with M12x1.75 thread profile and serrated washer flange.
   - *Precision Ball Bearing (608-RS)*: Ø22mm outer x Ø8mm bore x 7mm width with 8 spherical rolling elements.
4. **📱 Consumer Electronics & Gadgets ($10^{-1}\text{ m}$)**:
   - *Ultra-Thin Smartphone Device*: 160mm x 77mm x 8mm titanium chassis with edge-to-edge OLED display and triple camera island.
   - *Autonomous Aerial Quadcopter Drone*: 400mm carbon fiber cross-arm airframe with 4 brushless motors and 3-axis gyro gimbal.
5. **🪑 Furniture & Interior Envelopes ($10^0\text{ m}$)**:
   - *Ergonomic Executive Office Chair*: 650mm x 650mm x 1200mm task chair with pneumatic lift cylinder, 5-star castor base, and lumbar mesh backrest.
6. **🏎️ Vehicles & High-Speed Mobility ($10^0 - 10^1\text{ m}$)**:
   - *Electric Aerodynamic Hypercar*: 4.8m length x 2.1m width x 1.15m height sculpted monocoque carbon shell with dual clearcoat reflections.
7. **🏙️ Architecture & Megastructures ($10^2\text{ m}$)**:
   - *Cybernetic Megacity Skyscraper*: 450m height x 80m base 110-story tower with triangular steel diagrid exoskeleton and dual sky lobbies.
8. **🏔️ Geological Terrains & Biomes ($10^3\text{ m}$)**:
   - *Stratovolcano Mountain & Caldera*: 15km diameter base x 3,800m elevation with radial hydraulic erosion gullies and basalt scree slopes.
9. **🪐 Planetary Objects ($10^7 - 10^8\text{ m}$)**:
   - *Living Terrestrial Planet (Earth-like)*: 12,742 km sphere with ocean specular response, continental biomes, and Rayleigh scattering atmosphere.
   - *Ringed Gas Giant Planet (Saturnian)*: 120,000 km oblate giant encircled by a 280,000 km concentric icy ring disk.
10. **☀️ Stellar Bodies & Singularities ($10^9 - 10^{11}\text{ m}$)**:
    - *Spinning Black Hole & Accretion Disk*: Gravitational Kerr black hole with pitch-black event horizon, photon ring sphere, relativistic plasma disk, and polar jets.
11. **🌌 Galactic Scales ($10^{21}\text{ m}$)**:
    - *Grand Design Spiral Galaxy*: 100,000 Light Years across, dense luminous central bulge, 200 billion stars, and two logarithmic spiral arms.
12. **🌌 The Observable Universe ($10^{26}\text{ m}$)**:
    - *The Cosmic Web (93 Billion Light Years)*: The totality of physical reality—interconnected dark matter filaments, galactic superclusters (Laniakea, Shapley), cosmic voids, bounded by the Cosmic Microwave Background horizon.

### 2. Capabilities
* **1-Click 3D Synthesis**: Spawns parametric, fully textured Three.js meshes directly in the 3D viewport and populates the Maya Outliner.
* **Copilot Prompt Injection**: Injects production prompt blueprints into the Gemma-4 or Adam AI generation inputs with a single click.
* **Persistent Ledger Storage**: Users can record and objectise custom items (`localStorage`), complete with dimensional metrics, classification tags, and executable blueprints.
* **Shelf Integration**: Dedicated `📖 Ledger` shelf tab providing instant 1-click access to the cosmic scale continuum.
* **Interconnected Multi-Copilot Dispatch**: 1-click actions to dispatch any ledger blueprint directly into Gemma-4 Organic, Adam AI CAD, or over the live Adam MCP Bridge (`http://127.0.0.1:8000/mcp`).

---

## 🧠 ML, NLP & LLM Intelligence Engine Architecture

The studio incorporates a unified intelligence architecture (`src/ai/cadIntelligenceEngine.js`) uniting three complementary AI paradigms:

### 1. NLP (Natural Language Processing)
* **Semantic Intent Classification**: Parses natural language inputs into formal 3D actions: `CREATE_OBJECT`, `PARAMETRIC_CAD`, `EXTRUDE`, `BOOLEAN`, `MATERIAL_PBR`, `RIGGING`, `LANDSCAPE_SCATTER`, `MODIFY`.
* **Entity & Metric Extraction**: Extracts dimensional parameters, units (`mm`, `cm`, `m`, `km`, `nm`, `ly`), angular rotations, geometric primitive shapes, and color vectors.
* **Scale Order Mapping**: Automatically identifies the cosmic order of magnitude ($10^{-10}\text{ m}$ to $10^{26}\text{ m}$) with dynamic confidence scoring.
* **Universal Ledger Linking**: Continuously cross-references user text against the 12-tier Universal Prompt Ledger in real-time.

### 2. ML (Machine Learning & Procedural Geometry Inference)
* **Adaptive Polygon Budgeting**: Allocates Level of Detail (LOD) and tessellation budgets based on metric scale envelope.
* **Parametric Mathematical Synthesis**: Procedural generation heuristics for involute gears, mounting flanges, finned heatsinks, chassis trays, and planetary bodies.
* **Harmonic Noise Topography**: Multi-octave sinusoidal deformation for natural landscape biomes and filament structures.

### 3. LLM (Reasoning & Code Synthesis Engine)
* **Gemma-4 12B Organic Engine**: Employs `<|channel>thought ... <channel|>` reasoning tokens to generate Phase 1 Autonomous Blueprints and Phase 2 executable Maya DAG Python (`maya.cmds`) scripts.
* **Adam AI CAD Engine**: Synthesizes formal CAD boundary-representation operations (`create_object`, `extrude_face`, `boolean_operation`) with kinematic clearance validation.
* **Universal Model Context Protocol (MCP)**: Reverse engineered (REA) from official CAD connectors, exposing 22 tools over standard JSON-RPC 2.0 / SSE stream on `http://127.0.0.1:8000/mcp`.

---

## 💻 AI Script Editor Integration (`MayaScriptEditor`)

Jwala 3D Studio connects the AI intelligence engine directly into the Maya Python & MEL Script Editor (`src/maya/scriptEditor.js`):

### 1. Embedded AI Script Copilot Toolbar
* **Target AI Engine Selector**: Switch between `🔥 Gemma-4 12B Maya TD` (Python `maya.cmds`), `⚡ Adam AI CAD` (Parametric CSG), and `📖 Universal Ledger`.
* **Procedural Blueprint Presets**: 1-click loading for procedural spiral staircases, classical radial rotundas, sinusoidal mountain terrains, foliage/rock scatter biomes, Arnold PBR shader networks, 3-bone IK joint chain rigs, ceramic coffee mugs, Saturn celestial systems, spiral galaxy cores, and GTA V Los Santos city blocks.
* **Real-time NLP Semantic Badging**: Displays parsed intent, detected universal scale order, statistical confidence, and execution target as you type.
* **Live Streaming Reasoning Console**: Streams `<|channel>thought` tokens directly into the Script Editor history log, printing architectural breakdowns before populating the editor with clean, PEP-8 Python code.

### 2. Code Intelligence & Analysis Tools
* **🔍 AI Explain Code**: Reverse-engineers active scripts in the editor, providing a complete structural breakdown of function signatures, `cmds` calls, viewport suspension status, and algorithmic complexity.
* **⚡ AI Optimize Script**: Automatically refactors raw scripts to inject `cmds.refresh(suspend=True)` viewport buffering, DAG root grouping, and robust `try / finally` hierarchy for zero UI lag.
* **🧹 Clean & Format**: Cleans whitespace and standardizes indentation.
* **📖 Ledger Item Picker**: Instant catalogue lookup from Cup ($10^{-1}\text{ m}$) to Observable Universe ($10^{26}\text{ m}$) with direct code generation.

### 3. In-Script Generative Hooks
* `cmds.ai("prompt")`: Enables executing generative AI prompts dynamically from within Python scripts.
* `cmds.ledger_synthesize("itemId")`: Synthesizes registered Universal Ledger entities directly from code.

### 4. Bottom Command Line Integration
* Natural language prompt entered into the Maya bottom command line (`#quick-cmd-input`) (e.g. `create a ceramic coffee mug` or `ai: build spiral staircase with 24 steps`) automatically routes to the AI Copilot engine, synthesizes code, updates the 3D scene, and refreshes the Maya Outliner and Channel Box.




