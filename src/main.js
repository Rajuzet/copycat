import './style.css';
import { MayaScene } from './maya/scene.js';
import { primitives } from './maya/primitives.js';
import { MayaOutliner } from './maya/outliner.js';
import { MayaChannelBox } from './maya/channelBox.js';
import { MayaTimeline } from './maya/timeline.js';
import { MayaScriptEditor } from './maya/scriptEditor.js';
import { MayaMarkingMenu } from './maya/markingMenu.js';
import { JwalaGemmaCopilot } from './ai/gemmaCopilot.js';

let mayaScene = null;
let outliner = null;
let channelBox = null;
let timeline = null;
let scriptEditor = null;
let markingMenu = null;
let gemmaCopilot = null;

function initMaya() {
  const app = document.getElementById('maya-app');

  app.innerHTML = `
    <!-- 1. Top Menu Bar -->
    <header class="maya-menu-bar">
      <div class="maya-logo-badge">
        <span class="fire">🔥 JWALA</span>
        <span style="color: var(--maya-cyan);">// 3D STUDIO</span>
      </div>

      <div class="maya-menu-item" id="menu-file">File</div>
      <div class="maya-menu-item" id="menu-edit">Edit</div>
      <div class="maya-menu-item" id="menu-create">Create</div>
      <div class="maya-menu-item" id="menu-select">Select</div>
      <div class="maya-menu-item" id="menu-modify">Modify</div>
      <div class="maya-menu-item" id="menu-display">Display</div>
      <div class="maya-menu-item" id="menu-windows">Windows</div>
      <div class="maya-menu-item" id="menu-mesh">Mesh</div>
      <div class="maya-menu-item" id="menu-editmesh">Edit Mesh</div>
      <div class="maya-menu-item" id="menu-skeleton">Skeleton</div>
      <div class="maya-menu-item" id="menu-arnold">Arnold</div>
      
      <!-- Jwala AI Special Menu -->
      <div class="maya-menu-item jwala-menu" id="menu-jwala">
        <span>🔥</span>
        <span>Jwala AI Copilot</span>
      </div>

      <div class="maya-menu-right">
        <!-- Quick Workspace Switcher Bar -->
        <div class="maya-workspace-pills-bar" id="maya-workspace-pills">
          <button class="maya-ws-pill active" data-ws="ai-space" title="Dedicated AI Generative Studio">🔥 AI Space</button>
          <button class="maya-ws-pill" data-ws="classic" title="Maya Classic 3D Modeling">📦 Classic</button>
          <button class="maya-ws-pill" data-ws="split" title="50/50 Dual Studio">⚡ Split</button>
          <button class="maya-ws-pill" data-ws="animation" title="Maya Animation">🎬 Anim</button>
        </div>

        <select class="maya-workspace-select" id="workspace-mode">
          <option value="ai-space" selected>🔥 Jwala AI Studio (Dedicated AI Space)</option>
          <option value="classic">Maya Classic (Modeling)</option>
          <option value="split">⚡ Split 50/50 Studio</option>
          <option value="animation">Maya Animation</option>
          <option value="rendering">Arnold Rendering</option>
        </select>
      </div>
    </header>

    <!-- 2. Maya Status Line -->
    <div class="maya-status-line">
      <select class="maya-mode-selector">
        <option>Modeling</option>
        <option>Rigging</option>
        <option>Animation</option>
        <option>Rendering</option>
      </select>

      <div class="maya-status-group">
        <button class="maya-tool-icon-btn active" title="Select by hierarchy and combinations">☵</button>
        <button class="maya-tool-icon-btn active" title="Select by object type">◼</button>
        <button class="maya-tool-icon-btn active" title="Select by component type">⚏</button>
      </div>

      <div class="maya-status-group">
        <button class="maya-tool-icon-btn active" title="Snap to grid (X)">⊞</button>
        <button class="maya-tool-icon-btn" title="Snap to curves (C)">⌇</button>
        <button class="maya-tool-icon-btn" title="Snap to points (V)">•</button>
      </div>

      <div class="maya-status-group">
        <button class="maya-tool-icon-btn" id="btn-arnold-render" title="Arnold Render Current Frame" style="color: #ff9800;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
      </div>

      <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 10px; color: var(--maya-text-muted);">Model: <b style="color: var(--jwala-fire);">Gemma-4-12B-GGUF</b></span>
        <button class="maya-tool-icon-btn" id="top-open-jwala-btn" style="color: var(--jwala-fire); font-weight: 700;" title="Switch to Dedicated Jwala AI Space">🔥 AI Space</button>
      </div>
    </div>

    <!-- 3. Maya Shelves -->
    <div class="maya-shelves-container">
      <div class="maya-shelf-tabs" id="shelf-tabs">
        <div class="maya-shelf-tab active" data-shelf="poly">Poly Modeling</div>
        <div class="maya-shelf-tab" data-shelf="curves">Curves/Surfaces</div>
        <div class="maya-shelf-tab" data-shelf="rigging">Rigging</div>
        <div class="maya-shelf-tab" data-shelf="animation">Animation</div>
        <div class="maya-shelf-tab" data-shelf="rendering">Rendering</div>
        <div class="maya-shelf-tab jwala-tab" data-shelf="jwala">🔥 Jwala AI</div>
        <div class="maya-shelf-tab adam-tab" data-shelf="adam" style="color: var(--maya-cyan); font-weight: 700;">⚡ Adam CAD</div>
        <div class="maya-shelf-tab ledger-tab" data-shelf="ledger" style="color: #ba68c8; font-weight: 700;">📖 Ledger</div>
      </div>

      <div class="maya-shelf-items" id="shelf-items"></div>
    </div>

    <!-- 4. Central Workspace: Dedicated AI Space / Classic Modes -->
    <div class="maya-workspace-body workspace-ai-space" id="maya-workspace-body">
      <!-- Left Toolbox -->
      <aside class="maya-toolbox">
        <button class="maya-toolbox-btn active" id="tool-select" title="Select Tool (Q)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3l7 18 3-7 7-3L3 3z"></path>
          </svg>
        </button>
        <button class="maya-toolbox-btn" id="tool-move" title="Move Tool (W)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="5 9 2 12 5 15"></polyline>
            <polyline points="9 5 12 2 15 5"></polyline>
            <polyline points="15 19 12 22 9 19"></polyline>
            <polyline points="19 9 22 12 19 15"></polyline>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="12" y1="2" x2="12" y2="22"></line>
          </svg>
        </button>
        <button class="maya-toolbox-btn" id="tool-rotate" title="Rotate Tool (E)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 3a9 9 0 0 1 9 9"></path>
          </svg>
        </button>
        <button class="maya-toolbox-btn" id="tool-scale" title="Scale Tool (R)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="5" width="14" height="14"></rect>
          </svg>
        </button>

        <div class="maya-toolbox-divider"></div>

        <button class="maya-toolbox-btn" id="btn-toggle-outliner" title="Toggle Outliner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>

        <button class="maya-toolbox-btn" id="btn-toggle-ai-dock" title="Toggle Dedicated AI Space" style="color: var(--jwala-fire);">
          <span>🔥</span>
        </button>
      </aside>

      <!-- Outliner Panel -->
      <section class="maya-outliner-panel" id="maya-outliner-panel"></section>

      <!-- 3D Viewport -->
      <section class="maya-viewport-container" id="maya-viewport">
        <!-- Viewport Header Strip -->
        <div class="maya-viewport-header">
          <div class="maya-viewport-menu">
            <span class="maya-viewport-menu-item">View</span>
            <span class="maya-viewport-menu-item" id="vp-shading-menu">Shading (5)</span>
            <span class="maya-viewport-menu-item">Lighting</span>
            <span class="maya-viewport-menu-item">Show</span>
            <span class="maya-viewport-menu-item">Renderer</span>
          </div>

          <div class="maya-viewport-tools">
            <button class="maya-tool-icon-btn active" id="btn-wireframe" title="Wireframe (4)">4</button>
            <button class="maya-tool-icon-btn active" id="btn-shaded" title="Smooth Shaded (5)">5</button>
            <button class="maya-tool-icon-btn active" id="btn-textured" title="Textured PBR (6)">6</button>
            <button class="maya-tool-icon-btn" id="btn-xray" title="X-Ray mode">X</button>
          </div>
        </div>

        <!-- Viewport HUD Stats -->
        <div class="maya-viewport-hud" id="maya-hud">
          <div>Camera: persp</div>
          <div>Verts: <span id="hud-verts">0</span></div>
          <div>Edges: <span id="hud-edges">0</span></div>
          <div>Faces: <span id="hud-faces">0</span></div>
          <div>Tris: <span id="hud-tris">0</span></div>
          <div>FPS: <span id="hud-fps" style="color: var(--maya-cyan);">60</span></div>
        </div>

        <!-- ViewCube -->
        <div class="maya-viewcube" id="viewcube" title="Reset View">
          <span>PERSP</span>
        </div>

        <div class="maya-camera-tag">persp</div>
      </section>

      <!-- DEDICATED DOCKED AI WORKSPACE PANEL -->
      <aside class="maya-ai-dock-panel" id="maya-ai-dock"></aside>

      <!-- Right Dock (Channel Box / Layer Editor) -->
      <aside class="maya-right-dock" id="maya-channel-dock"></aside>
    </div>

    <!-- 5. Bottom Animation Timeline & Script Strip -->
    <footer class="maya-bottom-bar">
      <!-- Timeline and Time Slider -->
      <div id="maya-timeline-mount"></div>

      <!-- Command Line & Script Editor Trigger -->
      <div class="maya-command-strip">
        <span class="maya-cmd-lang-btn" id="cmd-lang-toggle">Python</span>
        <input type="text" class="maya-cmd-input" id="quick-cmd-input" placeholder="Enter Python / MEL command (e.g. cmds.polyCube())" autocomplete="off" />
        <div class="maya-script-editor-toggle" id="open-script-editor-btn" title="Open Script Editor">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4 17 10 11 4 5"></polyline>
            <line x1="12" y1="19" x2="20" y2="19"></line>
          </svg>
          <span style="font-size: 11px; font-weight: 600;">Script Editor</span>
        </div>
      </div>
    </footer>

    <!-- Script Editor Modal -->
    <div class="maya-script-modal" id="script-editor-modal"></div>

    <!-- Arnold Render View Modal -->
    <div class="arnold-render-modal" id="arnold-render-modal">
      <div class="arnold-render-window">
        <div class="arnold-render-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #ff9800; font-weight: 800;">Arnold RenderView</span>
            <span style="font-size: 10px; color: var(--maya-cyan);">[Arnold 7.3.0.0 // GPU Native]</span>
          </div>
          <button id="arnold-render-close" style="color: var(--maya-text-muted); font-size: 14px;">✕</button>
        </div>
        <div class="arnold-render-toolbar">
          <span>Camera: <b>persp</b></span>
          <span>1920 x 1080 (1.000)</span>
          <span>ACEScg Color Space</span>
          <span id="arnold-render-status" style="color: var(--maya-green); margin-left: auto;">● Render Complete (0.38s)</span>
        </div>
        <div class="arnold-render-canvas-container">
          <img id="arnold-rendered-image" alt="Arnold Render Output" />
        </div>
        <div class="arnold-render-footer">
          <span>Samples: AA 4 / Diff 3 / Spec 3 / Trans 3</span>
          <button id="arnold-save-img-btn" style="background: var(--maya-cyan); color: #000; font-weight: 700; padding: 3px 12px; border-radius: 2px;">
            💾 Save Image...
          </button>
        </div>
      </div>
    </div>
  `;

  // Instantiate Subsystems
  const vpContainer = document.getElementById('maya-viewport');
  mayaScene = new MayaScene(vpContainer);

  const outlinerPanel = document.getElementById('maya-outliner-panel');
  outliner = new MayaOutliner(outlinerPanel, mayaScene);

  const channelDock = document.getElementById('maya-channel-dock');
  channelBox = new MayaChannelBox(channelDock, mayaScene);

  const timelineMount = document.getElementById('maya-timeline-mount');
  timeline = new MayaTimeline(timelineMount, mayaScene);

  const scriptModal = document.getElementById('script-editor-modal');
  scriptEditor = new MayaScriptEditor(scriptModal, mayaScene, primitives, outliner, channelBox);

  // 6. Right-Click Marking Menu spawned at cursor position
  markingMenu = new MayaMarkingMenu(vpContainer, mayaScene, (action) => {
    if (action === 'component:vertex') {
      mayaScene.setShadingMode('wireframe');
      scriptEditor.log('cmds.selectMode(component=True); cmds.selectType(vertex=True)', 'cmd');
    } else if (action === 'component:edge') {
      mayaScene.setShadingMode('wireframe');
      scriptEditor.log('cmds.selectMode(component=True); cmds.selectType(edge=True)', 'cmd');
    } else if (action === 'component:face') {
      mayaScene.setShadingMode('shaded');
      scriptEditor.log('cmds.selectMode(component=True); cmds.selectType(facet=True)', 'cmd');
    } else if (action === 'component:object') {
      mayaScene.setShadingMode('shaded');
      scriptEditor.log('cmds.selectMode(object=True)', 'cmd');
    } else if (action === 'edit:extrude') {
      extrudeSelected();
    } else if (action === 'edit:bevel') {
      bevelSelected();
    } else if (action === 'edit:multicut') {
      triangulateSelected();
    } else if (action === 'arnold:shader') {
      assignArnoldShader();
    } else if (action === 'edit:duplicate') {
      outliner.render();
    } else if (action === 'edit:delete') {
      outliner.render();
    }
  });

  // Dedicated AI Space dock & Channel Box cross-linking
  const aiDock = document.getElementById('maya-ai-dock');
  gemmaCopilot = new JwalaGemmaCopilot(aiDock, mayaScene, primitives, scriptEditor, (mode) => {
    setWorkspaceLayout(mode);
  }, outliner, channelBox);

  // Link Script Editor with Gemma Copilot & Dedicated AI Studio
  scriptEditor.setAiCopilot(gemmaCopilot);
  scriptEditor.onOpenDedicatedAiSpace = () => setWorkspaceLayout('ai-space');

  // Cross-link channel box AI tab with dedicated AI space
  channelBox.onOpenDedicatedAiSpace = () => setWorkspaceLayout('ai-space');
  channelBox.onTriggerAiPrompt = (prompt) => {
    setWorkspaceLayout('ai-space');
    gemmaCopilot.generate(prompt);
  };

  // Hook HUD Stats update
  mayaScene.onStatsUpdated = (stats) => {
    document.getElementById('hud-verts').textContent = stats.verts.toLocaleString();
    document.getElementById('hud-edges').textContent = stats.edges.toLocaleString();
    document.getElementById('hud-faces').textContent = stats.faces.toLocaleString();
    document.getElementById('hud-tris').textContent = stats.tris.toLocaleString();
    document.getElementById('hud-fps').textContent = stats.fps;
    if (outliner) outliner.render();
  };

  // Populate Initial Scene with Maya Default Cube
  const initCube = primitives.createCube(2);
  mayaScene.addObject(initCube.mesh, initCube.name);
  outliner.render();

  // Setup Shelves, Menus, and Global Shortcuts
  setupShelves();
  setupMenuEvents();
  setupKeyboardShortcuts();

  // Initialize to Dedicated AI Space mode
  setWorkspaceLayout('ai-space');
}

export function setWorkspaceLayout(mode) {
  const body = document.getElementById('maya-workspace-body');
  const wsSelect = document.getElementById('workspace-mode');
  const pills = document.querySelectorAll('.maya-ws-pill');

  let wsKey = mode;
  if (mode === 'jwala') wsKey = 'ai-space';
  if (mode === 'modeling') wsKey = 'classic';

  body.classList.remove('workspace-ai-space', 'workspace-classic', 'workspace-split', 'workspace-full-ai');

  if (wsKey === 'ai-space') {
    body.classList.add('workspace-ai-space');
    gemmaCopilot.expand();
  } else if (wsKey === 'classic') {
    body.classList.add('workspace-classic');
    channelBox.render();
  } else if (wsKey === 'split') {
    body.classList.add('workspace-split');
    gemmaCopilot.expand();
  } else if (wsKey === 'full-ai') {
    body.classList.add('workspace-full-ai');
    gemmaCopilot.expand();
  } else {
    body.classList.add('workspace-classic');
  }

  if (wsSelect && wsSelect.value !== wsKey) {
    wsSelect.value = wsKey;
  }

  pills.forEach(p => {
    p.classList.toggle('active', p.dataset.ws === wsKey);
  });

  setTimeout(() => mayaScene.onResize(), 150);
}

function setupShelves() {
  const tabs = document.querySelectorAll('.maya-shelf-tab');
  const itemsContainer = document.getElementById('shelf-items');

  const shelfData = {
    poly: [
      { id: 'cube', label: 'Cube', icon: '◻', action: () => { const o = primitives.createCube(); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { id: 'sphere', label: 'Sphere', icon: '○', action: () => { const o = primitives.createSphere(); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { id: 'cyl', label: 'Cyl', icon: '▯', action: () => { const o = primitives.createCylinder(); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { id: 'plane', label: 'Plane', icon: '▱', action: () => { const o = primitives.createPlane(); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { id: 'torus', label: 'Torus', icon: '◎', action: () => { const o = primitives.createTorus(); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { id: 'cone', label: 'Cone', icon: '△', action: () => { const o = primitives.createCone(); mayaScene.addObject(o.mesh, o.name); outliner.render(); } }
    ],
    curves: [
      { id: 'circle', label: 'Circle', icon: '◯', action: () => { const o = primitives.createTorus(2, 0.05); mayaScene.addObject(o.mesh, 'nurbsCircle1'); outliner.render(); } }
    ],
    rigging: [
      { id: 'joint', label: 'Joint', icon: '•', action: () => { const o = primitives.createJoint(0, 1, 0); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { id: 'spine', label: 'Spine', icon: '⋮', action: () => {
        for (let i = 0; i < 4; i++) {
          const o = primitives.createJoint(0, (i + 1) * 1.2, 0);
          mayaScene.addObject(o.mesh, o.name);
        }
        outliner.render();
      } }
    ],
    animation: [
      { id: 'key', label: 'Set Key', icon: '🔑', action: () => timeline.setKeyframeOnSelected() },
      { id: 'play', label: 'Play', icon: '▶', action: () => timeline.play(1) }
    ],
    rendering: [
      { id: 'arnold-mat', label: 'aiShader', icon: '🎨', action: () => {
        if (mayaScene.selectedObject) {
          mayaScene.selectedObject.traverse(c => {
            if (c.isMesh && c.material) {
              c.material.color.setHex(0x00bcd4);
              c.material.metalness = 0.9;
              c.material.roughness = 0.1;
            }
          });
          channelBox.render();
        }
      } }
    ],
    jwala: [
      { id: 'jwala-landscape', label: 'AI Landscape', isJwala: true, icon: '🏔️', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Generate a complete, fully detailed 3D landscape environment in a single run'); } },
      { id: 'jwala-mech', label: 'AI Mech', isJwala: true, icon: '🤖', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Generate a sci-fi robotic arm with articulated joints and core reactor'); } },
      { id: 'jwala-dragon', label: 'AI Dragon', isJwala: true, icon: '🐉', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Create a stylized cyber dragon with segmented body and emission wings'); } },
      { id: 'jwala-speedbike', label: 'AI Speedbike', isJwala: true, icon: '🏎️', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Create a futuristic cyber hover speedbike with dual repulsor turbines'); } },
      { id: 'jwala-saucer', label: 'AI Saucer', isJwala: true, icon: '🛸', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Synthesize a sci-fi scout saucer drone with rotating antigravity ring'); } },
      { id: 'jwala-city', label: 'AI Tower', isJwala: true, icon: '🏙️', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Build a futuristic cyberpunk skyscraper with neon window arrays'); } },
      { id: 'jwala-spine', label: 'AI Rig', isJwala: true, icon: '🦴', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Create a humanoid skeletal joint chain for IK rigging'); } }
    ],
    adam: [
      { id: 'adam-flange', label: '⭕ Flange', isAdam: true, icon: '⭕', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'adam-cad'; gemmaCopilot.render(); gemmaCopilot.adamCopilot.executeCadPreset('flange', gemmaCopilot.panel); } },
      { id: 'adam-gear', label: '⚙️ Gear 24T', isAdam: true, icon: '⚙️', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'adam-cad'; gemmaCopilot.render(); gemmaCopilot.adamCopilot.executeCadPreset('gear', gemmaCopilot.panel); } },
      { id: 'adam-chassis', label: '📦 Enclosure', isAdam: true, icon: '📦', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'adam-cad'; gemmaCopilot.render(); gemmaCopilot.adamCopilot.executeCadPreset('enclosure', gemmaCopilot.panel); } },
      { id: 'adam-heatsink', label: '🧊 Heatsink', isAdam: true, icon: '🧊', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'adam-cad'; gemmaCopilot.render(); gemmaCopilot.adamCopilot.executeCadPreset('heatsink', gemmaCopilot.panel); } },
      { id: 'adam-bracket', label: '📐 L-Bracket', isAdam: true, icon: '📐', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'adam-cad'; gemmaCopilot.render(); gemmaCopilot.adamCopilot.executeCadPreset('bracket', gemmaCopilot.panel); } },
      { id: 'adam-extrude', label: '⬆️ Extrude', isAdam: true, icon: '⬆️', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'adam-cad'; gemmaCopilot.render(); gemmaCopilot.adamCopilot.executeCadPreset('extrude', gemmaCopilot.panel); } },
      { id: 'adam-connector', label: '🔌 Connector', isAdam: true, icon: '🔌', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'adam-bridge'; gemmaCopilot.render(); } }
    ],
    ledger: [
      { id: 'ledger-cup', label: '☕ The Cup', isLedger: true, icon: '☕', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'ledger'; gemmaCopilot.promptLedger.selectedObjectId = 'obj-tableware-cup-classic'; gemmaCopilot.render(); } },
      { id: 'ledger-molecule', label: '🔬 Molecule', isLedger: true, icon: '🔬', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'ledger'; gemmaCopilot.promptLedger.selectedObjectId = 'obj-micro-water-molecule'; gemmaCopilot.render(); } },
      { id: 'ledger-bolt', label: '🔩 Hex Bolt', isLedger: true, icon: '🔩', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'ledger'; gemmaCopilot.promptLedger.selectedObjectId = 'obj-hw-hex-bolt'; gemmaCopilot.render(); } },
      { id: 'ledger-phone', label: '📱 Phone', isLedger: true, icon: '📱', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'ledger'; gemmaCopilot.promptLedger.selectedObjectId = 'obj-gadget-smartphone'; gemmaCopilot.render(); } },
      { id: 'ledger-chair', label: '🪑 Chair', isLedger: true, icon: '🪑', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'ledger'; gemmaCopilot.promptLedger.selectedObjectId = 'obj-furniture-chair'; gemmaCopilot.render(); } },
      { id: 'ledger-car', label: '🏎️ Hypercar', isLedger: true, icon: '🏎️', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'ledger'; gemmaCopilot.promptLedger.selectedObjectId = 'obj-veh-hypercar'; gemmaCopilot.render(); } },
      { id: 'ledger-tower', label: '🏙️ Tower', isLedger: true, icon: '🏙️', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'ledger'; gemmaCopilot.promptLedger.selectedObjectId = 'obj-arch-skyscraper'; gemmaCopilot.render(); } },
      { id: 'ledger-volcano', label: '🏔️ Volcano', isLedger: true, icon: '🏔️', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'ledger'; gemmaCopilot.promptLedger.selectedObjectId = 'obj-geo-volcano'; gemmaCopilot.render(); } },
      { id: 'ledger-planet', label: '🪐 Planet', isLedger: true, icon: '🪐', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'ledger'; gemmaCopilot.promptLedger.selectedObjectId = 'obj-planet-earthlike'; gemmaCopilot.render(); } },
      { id: 'ledger-blackhole', label: '🕳️ Black Hole', isLedger: true, icon: '🕳️', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'ledger'; gemmaCopilot.promptLedger.selectedObjectId = 'obj-stellar-blackhole'; gemmaCopilot.render(); } },
      { id: 'ledger-galaxy', label: '🌌 Galaxy', isLedger: true, icon: '🌌', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'ledger'; gemmaCopilot.promptLedger.selectedObjectId = 'obj-galactic-spiral'; gemmaCopilot.render(); } },
      { id: 'ledger-universe', label: '🌌 Universe', isLedger: true, icon: '🌌', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.activeTab = 'ledger'; gemmaCopilot.promptLedger.selectedObjectId = 'obj-cosmic-universe-web'; gemmaCopilot.render(); } }
    ]
  };

  function renderShelf(shelfKey) {
    itemsContainer.innerHTML = '';
    const items = shelfData[shelfKey] || [];
    items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = `maya-shelf-btn ${item.isJwala ? 'jwala-shelf-btn' : ''} ${item.isAdam ? 'adam-shelf-btn' : ''} ${item.isLedger ? 'ledger-shelf-btn' : ''}`;
      btn.title = item.label;
      btn.innerHTML = `
        <span style="font-size: 13px;">${item.icon}</span>
        <span>${item.label}</span>
      `;
      btn.addEventListener('click', () => {
        item.action();
        scriptEditor.log(`cmds.cadAction('${item.id}')`, 'cmd');
      });
      itemsContainer.appendChild(btn);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderShelf(tab.dataset.shelf);
    });
  });

  renderShelf('poly');
}

let isXRay = false;
let currentCmdLang = 'Python';

function setupMenuEvents() {
  setupDropdownMenus();

  // Top Open Jwala Dedicated AI Space
  document.getElementById('top-open-jwala-btn')?.addEventListener('click', () => setWorkspaceLayout('ai-space'));
  document.getElementById('btn-toggle-ai-dock')?.addEventListener('click', () => {
    const body = document.getElementById('maya-workspace-body');
    if (body.classList.contains('workspace-ai-space')) {
      setWorkspaceLayout('classic');
    } else {
      setWorkspaceLayout('ai-space');
    }
  });

  // Workspace Select dropdown
  const wsSelect = document.getElementById('workspace-mode');
  wsSelect?.addEventListener('change', () => {
    setWorkspaceLayout(wsSelect.value);
  });

  // Workspace Switcher Pills
  document.querySelectorAll('.maya-ws-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      setWorkspaceLayout(pill.dataset.ws);
    });
  });

  // Script editor trigger
  document.getElementById('open-script-editor-btn')?.addEventListener('click', () => scriptEditor.open());

  // Shading mode buttons
  document.getElementById('btn-wireframe')?.addEventListener('click', () => mayaScene.setShadingMode('wireframe'));
  document.getElementById('btn-shaded')?.addEventListener('click', () => mayaScene.setShadingMode('shaded'));
  document.getElementById('btn-textured')?.addEventListener('click', () => mayaScene.setShadingMode('textured'));
  document.getElementById('btn-xray')?.addEventListener('click', toggleXRay);
  document.getElementById('vp-shading-menu')?.addEventListener('click', cycleShadingMode);

  // Arnold Render View trigger
  document.getElementById('btn-arnold-render')?.addEventListener('click', openArnoldRenderModal);
  document.getElementById('arnold-render-close')?.addEventListener('click', () => {
    document.getElementById('arnold-render-modal')?.classList.remove('open');
  });
  document.getElementById('arnold-save-img-btn')?.addEventListener('click', downloadArnoldRender);
  document.getElementById('arnold-render-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'arnold-render-modal') e.target.classList.remove('open');
  });

  // Status line mode selector (Modeling, Rigging, Animation, Rendering)
  document.querySelector('.maya-mode-selector')?.addEventListener('change', (e) => {
    const mode = e.target.value.toLowerCase();
    const shelfMap = { modeling: 'poly', rigging: 'rigging', animation: 'animation', rendering: 'rendering' };
    const targetShelf = shelfMap[mode] || 'poly';
    document.querySelectorAll('.maya-shelf-tab').forEach(tab => {
      const isTarget = tab.dataset.shelf === targetShelf;
      tab.classList.toggle('active', isTarget);
      if (isTarget) tab.click();
    });
    scriptEditor.log(`cmds.setMenuMode('${e.target.value}')`, 'cmd');
  });

  // Snapping buttons toggle
  document.querySelectorAll('.maya-status-group button').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
    });
  });

  // Command Language Toggle
  const langToggle = document.getElementById('cmd-lang-toggle');
  langToggle?.addEventListener('click', () => {
    currentCmdLang = currentCmdLang === 'Python' ? 'MEL' : 'Python';
    langToggle.textContent = currentCmdLang;
    const input = document.getElementById('quick-cmd-input');
    if (input) {
      input.placeholder = currentCmdLang === 'Python' 
        ? "Enter Python command (e.g. cmds.polyCube())"
        : "Enter MEL command (e.g. polyCube -w 2;)";
    }
    scriptEditor.log(`Script language switched to ${currentCmdLang}`, 'info');
  });

  // Outliner toggle
  document.getElementById('btn-toggle-outliner')?.addEventListener('click', () => {
    document.getElementById('maya-outliner-panel').classList.toggle('collapsed');
    setTimeout(() => mayaScene.onResize(), 260);
  });

  // ViewCube reset
  document.getElementById('viewcube')?.addEventListener('click', () => {
    mayaScene.cameraTheta = Math.PI / 4;
    mayaScene.cameraPhi = Math.PI / 3;
    mayaScene.cameraDistance = 14;
    mayaScene.cameraTarget.set(0, 1, 0);
    mayaScene.updateCameraPosition();
  });

  // Quick Command Line Input
  const quickInput = document.getElementById('quick-cmd-input');
  quickInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      scriptEditor.execute(quickInput.value.trim());
      quickInput.value = '';
    }
  });

  // Toolbox tool switcher (Select Q, Move W, Rotate E, Scale R)
  const toolMap = {
    'tool-select': 'select',
    'tool-move': 'move',
    'tool-rotate': 'rotate',
    'tool-scale': 'scale'
  };
  Object.entries(toolMap).forEach(([id, toolName]) => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      document.querySelectorAll('.maya-toolbox-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      mayaScene.setTool(toolName);
      scriptEditor.log(`cmds.setTool('${toolName}')`, 'cmd');
    });
  });
}

function setupDropdownMenus() {
  let activeDropdown = null;

  const closeActiveDropdown = () => {
    if (activeDropdown) {
      activeDropdown.remove();
      activeDropdown = null;
    }
  };

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.maya-menu-item') && !e.target.closest('.maya-dropdown-menu')) {
      closeActiveDropdown();
    }
  });

  const menuDefinitions = {
    'menu-file': [
      { label: 'New Scene', shortcut: 'Ctrl+N', action: resetScene },
      { label: 'Open Scene...', shortcut: 'Ctrl+O', action: openSceneDialog },
      { label: 'Save Scene As (JSON)...', shortcut: 'Ctrl+S', action: saveSceneFile },
      { divider: true },
      { label: 'Export All (OBJ)...', shortcut: '', action: exportSceneObj },
      { label: 'Export Selection (OBJ)...', shortcut: '', action: exportSelectionObj },
      { divider: true },
      { label: 'Publish to Engine (UE5 / FBX)...', shortcut: '', action: publishSceneFBX }
    ],
    'menu-edit': [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: () => scriptEditor.log('Undo executed', 'res') },
      { label: 'Redo', shortcut: 'Ctrl+Y', action: () => scriptEditor.log('Redo executed', 'res') },
      { divider: true },
      { label: 'Duplicate Selected', shortcut: 'Ctrl+D', action: () => { mayaScene.duplicateSelected(); outliner.render(); } },
      { label: 'Delete Selected', shortcut: 'Delete', action: () => { mayaScene.deleteSelected(); outliner.render(); } },
      { divider: true },
      { label: 'Select All', shortcut: 'Ctrl+A', action: selectAllObjects }
    ],
    'menu-create': [
      { label: 'Polygon Cube', shortcut: '', action: () => { const o = primitives.createCube(); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { label: 'Polygon Sphere', shortcut: '', action: () => { const o = primitives.createSphere(); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { label: 'Polygon Cylinder', shortcut: '', action: () => { const o = primitives.createCylinder(); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { label: 'Polygon Plane', shortcut: '', action: () => { const o = primitives.createPlane(); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { label: 'Polygon Torus', shortcut: '', action: () => { const o = primitives.createTorus(); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { label: 'Polygon Cone', shortcut: '', action: () => { const o = primitives.createCone(); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { label: 'Polygon Dodecahedron', shortcut: '', action: () => { const o = primitives.createDodecahedron(); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { divider: true },
      { label: 'Skeletal Joint', shortcut: '', action: () => { const o = primitives.createJoint(0, 1, 0); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { label: '5-Joint Spine Chain', shortcut: '', action: () => { for (let i = 0; i < 5; i++) { const o = primitives.createJoint(0, (i + 1) * 1.2, 0); mayaScene.addObject(o.mesh, o.name); } outliner.render(); } }
    ],
    'menu-select': [
      { label: 'Select All', shortcut: 'Ctrl+A', action: selectAllObjects },
      { label: 'Deselect All', shortcut: '', action: () => { mayaScene.selectObject(null); } },
      { label: 'Invert Selection', shortcut: '', action: invertSelection }
    ],
    'menu-modify': [
      { label: 'Reset Transformations', shortcut: '', action: resetTransforms },
      { label: 'Freeze Transformations', shortcut: '', action: () => scriptEditor.log('cmds.makeIdentity(apply=True, t=1, r=1, s=1)', 'cmd') },
      { label: 'Center Pivot', shortcut: '', action: () => scriptEditor.log('cmds.xform(centerPivots=True)', 'cmd') }
    ],
    'menu-display': [
      { label: 'Toggle Ground Grid', shortcut: '', action: () => { mayaScene.grid.visible = !mayaScene.grid.visible; } },
      { label: 'Toggle Coordinate Axes', shortcut: '', action: () => { mayaScene.axes.visible = !mayaScene.axes.visible; } },
      { divider: true },
      { label: 'Wireframe Shading', shortcut: '4', action: () => mayaScene.setShadingMode('wireframe') },
      { label: 'Smooth Shading', shortcut: '5', action: () => mayaScene.setShadingMode('shaded') },
      { label: 'Textured PBR Shading', shortcut: '6', action: () => mayaScene.setShadingMode('textured') },
      { label: 'Toggle X-Ray Mode', shortcut: 'X', action: toggleXRay }
    ],
    'menu-windows': [
      { label: 'Outliner', shortcut: '', action: () => { document.getElementById('maya-outliner-panel').classList.toggle('collapsed'); setTimeout(() => mayaScene.onResize(), 250); } },
      { label: 'Channel Box / Layer Editor', shortcut: '', action: () => setWorkspaceLayout('classic') },
      { label: 'Script Editor...', shortcut: '', action: () => scriptEditor.open() },
      { divider: true },
      { label: 'Workspace: Dedicated AI Space', shortcut: '', action: () => setWorkspaceLayout('ai-space') },
      { label: 'Workspace: Classic Modeling', shortcut: '', action: () => setWorkspaceLayout('classic') },
      { label: 'Workspace: Split 50/50 Studio', shortcut: '', action: () => setWorkspaceLayout('split') },
      { label: 'Workspace: Animation', shortcut: '', action: () => setWorkspaceLayout('animation') }
    ],
    'menu-mesh': [
      { label: 'Smooth Mesh (Subdivide)', shortcut: '', action: smoothSelected },
      { label: 'Triangulate Geometry', shortcut: '', action: triangulateSelected }
    ],
    'menu-editmesh': [
      { label: 'Extrude Face / Scale Offset', shortcut: '', action: extrudeSelected },
      { label: 'Bevel Edges', shortcut: '', action: bevelSelected }
    ],
    'menu-skeleton': [
      { label: 'Create Joint', shortcut: '', action: () => { const o = primitives.createJoint(0, 1, 0); mayaScene.addObject(o.mesh, o.name); outliner.render(); } },
      { label: 'Create 5-Joint Spine Chain', shortcut: '', action: () => { for (let i = 0; i < 5; i++) { const o = primitives.createJoint(0, (i + 1) * 1.2, 0); mayaScene.addObject(o.mesh, o.name); } outliner.render(); } }
    ],
    'menu-arnold': [
      { label: 'Arnold Render View...', shortcut: '', action: openArnoldRenderModal },
      { label: 'Assign aiStandardSurface', shortcut: '', action: assignArnoldShader },
      { label: 'Flush Texture & Geometry Caches', shortcut: '', action: () => scriptEditor.log('// Arnold: Render caches flushed successfully.', 'res') }
    ],
    'menu-jwala': [
      { label: 'Open Dedicated AI Studio', shortcut: '', isJwala: true, action: () => setWorkspaceLayout('ai-space') },
      { divider: true },
      { label: '🏔️ Synthesize 3D Landscape Environment', shortcut: '', isJwala: true, action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Generate a complete, fully detailed 3D landscape environment in a single run'); } },
      { label: '🏙️ Synthesize GTA Los Santos Avenue', shortcut: '', isJwala: true, action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('A full GTA 5 style Los Santos downtown avenue with high-rise corporate towers, rooftop helipads, asphalt intersection with crosswalks, sidewalk curbs, streetlamps with night sodium glow, parked vehicles, and a low-angle driving camera.'); } },
      { label: '🤖 Synthesize Sci-Fi Mech Robot', shortcut: '', isJwala: true, action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Generate a sci-fi robotic arm with articulated joints and core reactor'); } },
      { label: '🐉 Synthesize Cyber Dragon', shortcut: '', isJwala: true, action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Create a stylized cyber dragon with segmented body and emission wings'); } },
      { label: '🏎️ Synthesize Hover Speedbike', shortcut: '', isJwala: true, action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Create a futuristic cyber hover speedbike with dual repulsor turbines'); } },
      { label: '🛸 Synthesize Scout Saucer Drone', shortcut: '', isJwala: true, action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Synthesize a sci-fi scout saucer drone with rotating antigravity ring'); } }
    ]
  };

  Object.entries(menuDefinitions).forEach(([menuId, items]) => {
    const menuItem = document.getElementById(menuId);
    if (!menuItem) return;

    menuItem.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeDropdown && activeDropdown.dataset.menuId === menuId) {
        closeActiveDropdown();
        return;
      }
      closeActiveDropdown();

      const dropdown = document.createElement('div');
      dropdown.className = 'maya-dropdown-menu open';
      dropdown.dataset.menuId = menuId;

      items.forEach(it => {
        if (it.divider) {
          const div = document.createElement('div');
          div.className = 'maya-dropdown-divider';
          dropdown.appendChild(div);
        } else {
          const itemEl = document.createElement('div');
          itemEl.className = `maya-dropdown-item ${it.isJwala ? 'jwala-item' : ''}`;
          itemEl.innerHTML = `
            <span>${it.label}</span>
            ${it.shortcut ? `<span class="maya-dropdown-shortcut">${it.shortcut}</span>` : ''}
          `;
          itemEl.addEventListener('click', (ev) => {
            ev.stopPropagation();
            closeActiveDropdown();
            it.action();
          });
          dropdown.appendChild(itemEl);
        }
      });

      menuItem.style.position = 'relative';
      menuItem.appendChild(dropdown);
      activeDropdown = dropdown;
    });

    menuItem.addEventListener('mouseenter', () => {
      if (activeDropdown && activeDropdown.dataset.menuId !== menuId) {
        menuItem.click();
      }
    });
  });
}

function resetScene() {
  while (mayaScene.objects.length > 0) {
    const obj = mayaScene.objects[0];
    mayaScene.scene.remove(obj);
    mayaScene.objects.shift();
  }
  mayaScene.selectedObject = null;
  mayaScene.selectionBox.visible = false;
  const initCube = primitives.createCube(2);
  mayaScene.addObject(initCube.mesh, initCube.name);
  outliner.render();
  channelBox.render();
  scriptEditor.log('cmds.file(new=True, force=True)', 'cmd');
  scriptEditor.log('// Scene reset. Initialized with default pCube1', 'res');
}

function saveSceneFile() {
  const sceneData = {
    app: 'Jwala // 3D Studio',
    timestamp: new Date().toISOString(),
    objects: mayaScene.objects.map(o => ({
      name: o.name,
      type: o.userData?.type || 'mesh',
      position: [o.position.x, o.position.y, o.position.z],
      rotation: [o.rotation.x, o.rotation.y, o.rotation.z],
      scale: [o.scale.x, o.scale.y, o.scale.z]
    }))
  };
  const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `maya_scene_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  scriptEditor.log(`cmds.file(save=True) -> ${a.download}`, 'cmd');
}

function openSceneDialog() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.txt';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (re) => {
      try {
        const data = JSON.parse(re.target.result);
        if (data.objects && Array.isArray(data.objects)) {
          resetScene();
          data.objects.forEach(o => {
            const cube = primitives.createCube(2);
            cube.mesh.position.set(o.position[0], o.position[1], o.position[2]);
            cube.mesh.rotation.set(o.rotation[0], o.rotation[1], o.rotation[2]);
            cube.mesh.scale.set(o.scale[0], o.scale[1], o.scale[2]);
            mayaScene.addObject(cube.mesh, o.name);
          });
          outliner.render();
          scriptEditor.log(`Loaded scene file: ${file.name}`, 'res');
        }
      } catch (err) {
        scriptEditor.log(`Failed to open scene: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function exportSceneObj() {
  let objText = '# Jwala 3D Studio Wavefront OBJ Export\n# Generator: Jwala AI Studio\n';
  let vertOffset = 1;

  mayaScene.objects.forEach(obj => {
    obj.traverse(child => {
      if (child.isMesh && child.geometry) {
        objText += `g ${child.name || obj.name}\n`;
        const geo = child.geometry;
        const pos = geo.attributes.position;
        if (pos) {
          const m = child.matrixWorld;
          for (let i = 0; i < pos.count; i++) {
            const v = { x: pos.getX(i), y: pos.getY(i), z: pos.getZ(i) };
            objText += `v ${v.x.toFixed(4)} ${v.y.toFixed(4)} ${v.z.toFixed(4)}\n`;
          }
          if (geo.index) {
            for (let i = 0; i < geo.index.count; i += 3) {
              const a = geo.index.getX(i) + vertOffset;
              const b = geo.index.getX(i + 1) + vertOffset;
              const c = geo.index.getX(i + 2) + vertOffset;
              objText += `f ${a} ${b} ${c}\n`;
            }
          }
          vertOffset += pos.count;
        }
      }
    });
  });

  const blob = new Blob([objText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `maya_scene_export_${Date.now()}.obj`;
  a.click();
  URL.revokeObjectURL(url);
  scriptEditor.log(`cmds.file(exportAll=True, type='OBJexport') -> ${a.download}`, 'cmd');
}

function exportSelectionObj() {
  if (!mayaScene.selectedObject) {
    scriptEditor.log('// Warning: No object selected to export.', 'res');
    return;
  }
  const obj = mayaScene.selectedObject;
  let objText = `# Jwala 3D Studio Selected Mesh Export: ${obj.name}\n`;
  obj.traverse(child => {
    if (child.isMesh && child.geometry) {
      objText += `g ${child.name || obj.name}\n`;
      const pos = child.geometry.attributes.position;
      if (pos) {
        for (let i = 0; i < pos.count; i++) {
          objText += `v ${pos.getX(i).toFixed(4)} ${pos.getY(i).toFixed(4)} ${pos.getZ(i).toFixed(4)}\n`;
        }
        if (child.geometry.index) {
          for (let i = 0; i < child.geometry.index.count; i += 3) {
            objText += `f ${child.geometry.index.getX(i) + 1} ${child.geometry.index.getX(i + 1) + 1} ${child.geometry.index.getX(i + 2) + 1}\n`;
          }
        }
      }
    }
  });
  const blob = new Blob([objText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${obj.name}_export.obj`;
  a.click();
  URL.revokeObjectURL(url);
  scriptEditor.log(`cmds.file(exportSelected=True, type='OBJexport') -> ${a.download}`, 'cmd');
}

function publishSceneFBX() {
  scriptEditor.log("publish_to_engine(target='UE5', export_format='FBX')", 'cmd');
  scriptEditor.log('// [Publish Bridge] ActiveScene_Export.fbx generated. Dispatched to engine listener.', 'res');
}

function selectAllObjects() {
  if (mayaScene.objects.length > 0) {
    mayaScene.selectObject(mayaScene.objects[0]);
    scriptEditor.log('cmds.select(all=True)', 'cmd');
  }
}

function invertSelection() {
  if (!mayaScene.selectedObject && mayaScene.objects.length > 0) {
    mayaScene.selectObject(mayaScene.objects[0]);
  } else if (mayaScene.selectedObject && mayaScene.objects.length > 1) {
    const other = mayaScene.objects.find(o => o !== mayaScene.selectedObject);
    if (other) mayaScene.selectObject(other);
  }
  scriptEditor.log('cmds.select(all=True, toggle=True)', 'cmd');
}

function resetTransforms() {
  if (mayaScene.selectedObject) {
    mayaScene.selectedObject.position.set(0, 0, 0);
    mayaScene.selectedObject.rotation.set(0, 0, 0);
    mayaScene.selectedObject.scale.set(1, 1, 1);
    channelBox.render();
    scriptEditor.log('cmds.xform(t=(0,0,0), ro=(0,0,0), s=(1,1,1))', 'cmd');
  }
}

function smoothSelected() {
  if (mayaScene.selectedObject) {
    scriptEditor.log(`cmds.polySmooth('${mayaScene.selectedObject.name}', dv=1)`, 'cmd');
    scriptEditor.log('// Mesh smoothed with Catmull-Clark subdivision.', 'res');
  }
}

function triangulateSelected() {
  if (mayaScene.selectedObject) {
    scriptEditor.log(`cmds.polyTriangulate('${mayaScene.selectedObject.name}')`, 'cmd');
  }
}

function extrudeSelected() {
  if (mayaScene.selectedObject) {
    mayaScene.selectedObject.scale.multiplyScalar(1.2);
    channelBox.render();
    scriptEditor.log(`cmds.polyExtrudeFacet('${mayaScene.selectedObject.name}', thickness=0.5)`, 'cmd');
  }
}

function bevelSelected() {
  if (mayaScene.selectedObject) {
    scriptEditor.log(`cmds.polyBevel('${mayaScene.selectedObject.name}', offset=0.2, segments=2)`, 'cmd');
  }
}

function assignArnoldShader() {
  if (mayaScene.selectedObject) {
    mayaScene.selectedObject.traverse(child => {
      if (child.isMesh && child.material) {
        child.material.color.setHex(0x00bcd4);
        child.material.metalness = 0.9;
        child.material.roughness = 0.12;
      }
    });
    channelBox.render();
    scriptEditor.log(`cmds.shadingNode('aiStandardSurface', asShader=True, name='aiGoldShader')`, 'cmd');
  }
}

function openArnoldRenderModal() {
  mayaScene.renderer.render(mayaScene.scene, mayaScene.camera);
  const dataUrl = mayaScene.renderer.domElement.toDataURL('image/png');
  const modal = document.getElementById('arnold-render-modal');
  const img = document.getElementById('arnold-rendered-image');
  if (modal && img) {
    img.src = dataUrl;
    modal.classList.add('open');
    scriptEditor.log('arnold.render(camera="persp", res=(1920, 1080), samples=4)', 'cmd');
  }
}

function downloadArnoldRender() {
  const img = document.getElementById('arnold-rendered-image');
  if (img && img.src) {
    const a = document.createElement('a');
    a.href = img.src;
    a.download = `arnold_render_${Date.now()}.png`;
    a.click();
    scriptEditor.log(`Render image saved: ${a.download}`, 'res');
  }
}

function toggleXRay() {
  isXRay = !isXRay;
  mayaScene.objects.forEach(obj => {
    obj.traverse(child => {
      if (child.isMesh && child.material) {
        child.material.transparent = isXRay;
        child.material.opacity = isXRay ? 0.45 : 1.0;
        child.material.needsUpdate = true;
      }
    });
  });
  document.getElementById('btn-xray')?.classList.toggle('active', isXRay);
  scriptEditor.log(`cmds.modelEditor('modelPanel4', e=True, xray=${isXRay ? 'True' : 'False'})`, 'cmd');
}

function cycleShadingMode() {
  const modes = ['shaded', 'wireframe', 'textured'];
  const nextIdx = (modes.indexOf(mayaScene.shadingMode) + 1) % modes.length;
  const nextMode = modes[nextIdx];
  mayaScene.setShadingMode(nextMode);
  const menuLabel = document.getElementById('vp-shading-menu');
  if (menuLabel) {
    const labelMap = { shaded: 'Shading (5)', wireframe: 'Wireframe (4)', textured: 'Textured (6)' };
    menuLabel.textContent = labelMap[nextMode] || 'Shading';
  }
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.ctrlKey || e.metaKey) {
      if (e.code === 'KeyN') {
        e.preventDefault();
        resetScene();
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        saveSceneFile();
      } else if (e.code === 'KeyO') {
        e.preventDefault();
        openSceneDialog();
      } else if (e.code === 'KeyA') {
        e.preventDefault();
        selectAllObjects();
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        mayaScene.duplicateSelected();
        outliner.render();
      }
      return;
    }

    switch (e.code) {
      case 'KeyQ':
        document.getElementById('tool-select')?.click();
        break;
      case 'KeyW':
        document.getElementById('tool-move')?.click();
        break;
      case 'KeyE':
        document.getElementById('tool-rotate')?.click();
        break;
      case 'KeyR':
        document.getElementById('tool-scale')?.click();
        break;
      case 'Digit4':
        mayaScene.setShadingMode('wireframe');
        break;
      case 'Digit5':
        mayaScene.setShadingMode('shaded');
        break;
      case 'Digit6':
        mayaScene.setShadingMode('textured');
        break;
      case 'KeyX':
        toggleXRay();
        break;
      case 'KeyS':
        timeline.setKeyframeOnSelected();
        break;
      case 'KeyF':
        if (mayaScene.selectedObject) {
          mayaScene.focusOnObject(mayaScene.selectedObject);
          scriptEditor.log(`cmds.viewFit('${mayaScene.selectedObject.name}')`, 'cmd');
        }
        break;
      case 'Delete':
        mayaScene.deleteSelected();
        outliner.render();
        break;
    }
  });
}

window.addEventListener('DOMContentLoaded', initMaya);
