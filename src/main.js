import './style.css';
import { MayaScene } from './maya/scene.js';
import { primitives } from './maya/primitives.js';
import { MayaOutliner } from './maya/outliner.js';
import { MayaChannelBox } from './maya/channelBox.js';
import { MayaTimeline } from './maya/timeline.js';
import { MayaScriptEditor } from './maya/scriptEditor.js';
import { JwalaGemmaCopilot } from './ai/gemmaCopilot.js';

let mayaScene = null;
let outliner = null;
let channelBox = null;
let timeline = null;
let scriptEditor = null;
let gemmaCopilot = null;

function initMaya() {
  const app = document.getElementById('maya-app');

  app.innerHTML = `
    <!-- 1. Top Menu Bar -->
    <header class="maya-menu-bar">
      <div class="maya-logo-badge">
        <span class="fire">🔥 JWALA</span>
        <span style="color: var(--maya-cyan);">// MAYA 2026</span>
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
  scriptEditor = new MayaScriptEditor(scriptModal, mayaScene, primitives);

  // Dedicated AI Space dock & Channel Box cross-linking
  const aiDock = document.getElementById('maya-ai-dock');
  gemmaCopilot = new JwalaGemmaCopilot(aiDock, mayaScene, primitives, scriptEditor, (mode) => {
    setWorkspaceLayout(mode);
  });

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
      { id: 'jwala-mech', label: 'AI Mech', isJwala: true, icon: '🤖', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Generate a sci-fi robotic arm with articulated joints and core reactor'); } },
      { id: 'jwala-dragon', label: 'AI Dragon', isJwala: true, icon: '🐉', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Create a stylized cyber dragon with segmented body and emission wings'); } },
      { id: 'jwala-speedbike', label: 'AI Speedbike', isJwala: true, icon: '🏎️', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Create a futuristic cyber hover speedbike with dual repulsor turbines'); } },
      { id: 'jwala-saucer', label: 'AI Saucer', isJwala: true, icon: '🛸', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Synthesize a sci-fi scout saucer drone with rotating antigravity ring'); } },
      { id: 'jwala-city', label: 'AI Tower', isJwala: true, icon: '🏙️', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Build a futuristic cyberpunk skyscraper with neon window arrays'); } },
      { id: 'jwala-spine', label: 'AI Rig', isJwala: true, icon: '🦴', action: () => { setWorkspaceLayout('ai-space'); gemmaCopilot.generate('Create a humanoid skeletal joint chain for IK rigging'); } }
    ]
  };

  function renderShelf(shelfKey) {
    itemsContainer.innerHTML = '';
    const items = shelfData[shelfKey] || [];
    items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = `maya-shelf-btn ${item.isJwala ? 'jwala-shelf-btn' : ''}`;
      btn.title = item.label;
      btn.innerHTML = `
        <span style="font-size: 13px;">${item.icon}</span>
        <span>${item.label}</span>
      `;
      btn.addEventListener('click', () => {
        item.action();
        scriptEditor.log(`cmds.polyCreate('${item.id}')`, 'cmd');
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

function setupMenuEvents() {
  // Top Open Jwala Dedicated AI Space
  document.getElementById('top-open-jwala-btn')?.addEventListener('click', () => setWorkspaceLayout('ai-space'));
  document.getElementById('menu-jwala')?.addEventListener('click', () => setWorkspaceLayout('ai-space'));
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

  // Toolbox tool switcher
  ['tool-select', 'tool-move', 'tool-rotate', 'tool-scale'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      document.querySelectorAll('.maya-toolbox-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

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
      case 'KeyS':
        timeline.setKeyframeOnSelected();
        break;
      case 'Delete':
        mayaScene.deleteSelected();
        outliner.render();
        break;
      case 'KeyD':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          mayaScene.duplicateSelected();
          outliner.render();
        }
        break;
    }
  });
}

window.addEventListener('DOMContentLoaded', initMaya);
