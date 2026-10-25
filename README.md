---
title: Jwala - Autodesk Maya 3D Studio + Gemma-4 AI
emoji: 🔥
colorFrom: red
colorTo: yellow
sdk: static
pinned: false
license: apache-2.0
short_description: Autodesk Maya 3D Studio with Gemma-4 AI Copilot
---

# 🔥 Jwala // Autodesk Maya 3D Studio + Gemma-4 AI Copilot

An Autodesk Maya 3D Studio web recreation featuring an interactive 3D WebGL viewport, Outliner scene tree, Channel Box transform controls, Arnold material inspector, 120-frame animation timeline, MEL/Python script editor, and **Jwala AI Copilot** powered by `google/gemma-4-12B-it-qat-q4_0-gguf`.

---

## 🚀 Hugging Face Space
* **Space URL**: [https://huggingface.co/spaces/packiyanathan/jwala](https://huggingface.co/spaces/packiyanathan/jwala)
* **Model**: [`google/gemma-4-12B-it-qat-q4_0-gguf`](https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf)
* **App Name**: `Jwala` (🔥)

---

## 🛠️ Features

### 1. Autodesk Maya 3D Viewport
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
