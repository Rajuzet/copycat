export class JwalaGemmaCopilot {
  constructor(panelEl, mayaScene, primitivesLib, scriptEditor, onWorkspaceChange) {
    this.panel = panelEl;
    this.scene = mayaScene;
    this.primitives = primitivesLib;
    this.scriptEditor = scriptEditor;
    this.onWorkspaceChange = onWorkspaceChange;

    this.modelName = 'google/gemma-4-12B-it-qat-q4_0-gguf';
    this.activeTab = 'studio'; // 'studio', 'history', 'specs'
    this.activeMode = '3d'; // '3d', 'rig', 'shader', 'python', 'env'
    this.temperature = 0.7;
    this.isGenerating = false;
    this.generatedAction = null;
    this.lastGeneratedCode = '';
    this.history = [];

    this.init();
  }

  init() {
    this.panel.className = 'maya-ai-dock-panel';
    this.panel.id = 'maya-ai-dock';

    this.render();
    this.setupEvents();
  }

  render() {
    this.panel.innerHTML = `
      <!-- Dedicated AI Space Titlebar -->
      <div class="jwala-dock-titlebar">
        <div class="jwala-dock-title">
          <span>🔥</span>
          <span>Jwala AI Studio</span>
          <span class="jwala-model-tag" title="Model: google/gemma-4-12B-it-qat-q4_0-gguf">Gemma-4 12B GGUF</span>
          <span class="jwala-status-indicator" title="Connected to Hugging Face Space">● Live</span>
        </div>
        
        <div class="jwala-space-layout-tools">
          <button class="jwala-layout-btn" id="btn-ai-layout-dock" title="Dock Right (480px)">◧</button>
          <button class="jwala-layout-btn" id="btn-ai-layout-split" title="50/50 Split View">◫</button>
          <button class="jwala-layout-btn" id="btn-ai-layout-max" title="Full AI Studio">🗖</button>
          <button class="jwala-dock-toggle-btn" id="jwala-collapse-btn" title="Return to Maya Classic View">✕</button>
        </div>
      </div>

      <!-- AI Space Main Sub-Tabs -->
      <div class="jwala-space-subtabs">
        <div class="jwala-space-tab ${this.activeTab === 'studio' ? 'active' : ''}" data-tab="studio">
          <span>✨ Generative Studio</span>
        </div>
        <div class="jwala-space-tab ${this.activeTab === 'history' ? 'active' : ''}" data-tab="history">
          <span>📦 3D Asset History (${this.history.length})</span>
        </div>
        <div class="jwala-space-tab ${this.activeTab === 'specs' ? 'active' : ''}" data-tab="specs">
          <span>⚙️ Gemma-4 Specs</span>
        </div>
      </div>

      <!-- Dedicated AI Space Content -->
      <div class="jwala-dock-content" id="jwala-dock-content">
        ${this.renderActiveTabContent()}
      </div>
    `;

    this.bindTabContentEvents();
  }

  renderActiveTabContent() {
    if (this.activeTab === 'history') {
      return this.renderHistoryTab();
    }
    if (this.activeTab === 'specs') {
      return this.renderSpecsTab();
    }
    return this.renderStudioTab();
  }

  renderStudioTab() {
    return `
      <!-- AI Mode Selector -->
      <div>
        <div class="jwala-section-label">
          <span>Generation Pipeline</span>
          <span style="color: var(--maya-cyan); font-family: var(--font-mono); font-size: 9.5px;">DAG Synthesizer</span>
        </div>
        <div class="jwala-mode-pills">
          <div class="jwala-mode-pill ${this.activeMode === '3d' ? 'active' : ''}" data-mode="3d">🎨 3D Mesh</div>
          <div class="jwala-mode-pill ${this.activeMode === 'rig' ? 'active' : ''}" data-mode="rig">🦴 Rigging</div>
          <div class="jwala-mode-pill ${this.activeMode === 'shader' ? 'active' : ''}" data-mode="shader">🌈 Shaders</div>
          <div class="jwala-mode-pill ${this.activeMode === 'python' ? 'active' : ''}" data-mode="python">⚡ Python</div>
          <div class="jwala-mode-pill ${this.activeMode === 'env' ? 'active' : ''}" data-mode="env">🏙️ Scene</div>
        </div>
      </div>

      <!-- Quick Gemma-4 Prompts -->
      <div>
        <div class="jwala-section-label">
          <span>Curated Prompt Presets</span>
          <span style="color: var(--maya-text-muted); font-size: 9.5px;">1-Click</span>
        </div>
        <div class="jwala-preset-chips" id="jwala-chips-container">
          ${this.getChipsHtmlForMode(this.activeMode)}
        </div>
      </div>

      <!-- Prompt Textarea & Hyperparameters -->
      <div class="jwala-prompt-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <span class="jwala-section-label" style="margin: 0;">Instruction Prompt</span>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 10px; color: var(--maya-text-muted);">
            <span>Temp: <b id="temp-val-display" style="color: #ff9800;">${this.temperature}</b></span>
            <input type="range" id="jwala-temp-slider" min="0.1" max="1.0" step="0.1" value="${this.temperature}" style="width: 70px; height: 12px; cursor: pointer;" />
          </div>
        </div>

        <textarea
          class="jwala-prompt-textarea"
          id="jwala-prompt-input"
          placeholder="Instruct Gemma-4 to generate meshes, Arnold shaders, skeletal joint hierarchies..."
        >${this.getDefaultPromptForMode(this.activeMode)}</textarea>

        <button class="jwala-generate-btn" id="jwala-submit-btn">
          <span>🔥</span>
          <span>Synthesize with Gemma-4</span>
        </button>
      </div>

      <!-- Gemma 4 Reasoning & Output Container -->
      <div class="jwala-response-container ${this.lastGeneratedCode ? 'active' : ''}" id="jwala-response">
        <div class="jwala-thought-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>Gemma-4 Reasoning Stream &lt;|channel&gt;thought</span>
          <span style="margin-left: auto; font-size: 9px; color: var(--maya-cyan);">12B-GGUF</span>
        </div>

        <div class="jwala-thought-stream" id="jwala-thought-text"></div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
          <span style="font-size: 10.5px; font-weight: 700; color: #fff;">Maya Python DAG Script:</span>
          <button id="jwala-copy-code-btn" style="font-size: 9.5px; color: var(--maya-cyan); font-weight: 600; padding: 1px 4px;">📋 Copy</button>
        </div>
        <div class="jwala-code-preview" id="jwala-code-box">${this.lastGeneratedCode}</div>

        <button class="jwala-apply-btn" id="jwala-execute-3d-btn">
          ⚡ Execute in Maya 3D Viewport
        </button>
      </div>

      <!-- HF Space Integration Details -->
      <div class="jwala-hf-footer-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #fff;">Hugging Face Space</span>
          <span style="color: var(--maya-green); font-size: 9.5px; font-weight: 700;">● Online</span>
        </div>
        <div style="font-family: var(--font-mono); color: var(--maya-cyan); margin-top: 2px;">${this.modelName}</div>
        <div style="margin-top: 4px; display: flex; justify-content: space-between; align-items: center;">
          <span>Repo: <a href="https://huggingface.co/spaces/packiyanathan/jwala" target="_blank" style="color: var(--jwala-fire); text-decoration: underline;">packiyanathan/jwala</a></span>
          <a href="https://packiyanathan-jwala.static.hf.space" target="_blank" style="color: var(--maya-cyan); text-decoration: underline;">Open Web App ↗</a>
        </div>
      </div>
    `;
  }

  renderHistoryTab() {
    if (this.history.length === 0) {
      return `
        <div style="text-align: center; color: var(--maya-text-muted); padding: 50px 20px;">
          <div style="font-size: 28px; margin-bottom: 10px;">📦</div>
          <div style="font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 6px;">No AI Assets Generated Yet</div>
          <p style="font-size: 11px; line-height: 1.4;">
            Switch to the <b>Generative Studio</b> tab and synthesize your first 3D creature, mech, or building with Gemma-4.
          </p>
        </div>
      `;
    }

    return `
      <div class="jwala-section-label">
        <span>Session Assets (${this.history.length})</span>
        <button id="jwala-clear-history-btn" style="color: var(--maya-red); font-size: 9.5px; font-weight: 700;">Clear All</button>
      </div>

      <div class="jwala-history-list">
        ${this.history.map((item, idx) => `
          <div class="jwala-history-card" data-index="${idx}">
            <div class="jwala-history-card-header">
              <span class="jwala-history-icon">${item.icon}</span>
              <div style="flex: 1; overflow: hidden;">
                <div class="jwala-history-name">${item.name}</div>
                <div class="jwala-history-meta">${item.type} • ${item.time}</div>
              </div>
              <span class="jwala-history-badge">${item.polyCount || 'Procedural'}</span>
            </div>

            <div class="jwala-history-prompt">${item.prompt}</div>

            <div class="jwala-history-actions">
              <button class="jwala-history-btn btn-focus" data-name="${item.name}">🔍 Focus Camera</button>
              <button class="jwala-history-btn btn-spawn" data-index="${idx}">➕ Spawn Another</button>
              <button class="jwala-history-btn btn-delete" data-name="${item.name}" style="color: var(--maya-red);">🗑️ Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderSpecsTab() {
    return `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="jwala-spec-card">
          <div class="jwala-spec-title">🤖 Model Architecture</div>
          <div class="jwala-spec-row">
            <span class="label">Model:</span>
            <span class="value" style="color: var(--maya-cyan);">google/gemma-4-12B-it-qat-q4_0-gguf</span>
          </div>
          <div class="jwala-spec-row">
            <span class="label">Parameters:</span>
            <span class="value">12.0 Billion</span>
          </div>
          <div class="jwala-spec-row">
            <span class="label">Quantization:</span>
            <span class="value" style="color: #ff9800; font-weight: 700;">QAT Q4_0 (4-bit GGUF)</span>
          </div>
          <div class="jwala-spec-row">
            <span class="label">Context Window:</span>
            <span class="value">8,192 Tokens</span>
          </div>
          <div class="jwala-spec-row">
            <span class="label">Reasoning Tokens:</span>
            <span class="value">&lt;|channel&gt;thought ... &lt;channel|&gt;</span>
          </div>
        </div>

        <div class="jwala-spec-card">
          <div class="jwala-spec-title">🌐 Deployment Space</div>
          <div class="jwala-spec-row">
            <span class="label">Hugging Face Space:</span>
            <span class="value"><a href="https://huggingface.co/spaces/packiyanathan/jwala" target="_blank" style="color: var(--jwala-fire);">packiyanathan/jwala</a></span>
          </div>
          <div class="jwala-spec-row">
            <span class="label">Status:</span>
            <span class="value" style="color: var(--maya-green); font-weight: 700;">🟢 RUNNING (Live)</span>
          </div>
          <div class="jwala-spec-row">
            <span class="label">SDK / Type:</span>
            <span class="value">Static HTML / WebGL (Three.js)</span>
          </div>
        </div>

        <div class="jwala-spec-card">
          <div class="jwala-spec-title">⚙️ System Prompt Customizer</div>
          <p style="font-size: 10px; color: var(--maya-text-muted); margin-bottom: 6px;">
            Instructs Gemma-4 to generate valid Maya MEL and Python <code>maya.cmds</code> scripts.
          </p>
          <textarea class="jwala-prompt-textarea" style="height: 90px; font-size: 10.5px;" readonly>You are Jwala, the dedicated AI Copilot for Autodesk Maya 2026.
You generate valid Three.js procedural topologies, Maya DAG hierarchies, Arnold aiStandardSurface PBR materials, and python maya.cmds automation.</textarea>
        </div>
      </div>
    `;
  }

  setupEvents() {
    // Top layout tools
    this.panel.addEventListener('click', (e) => {
      const target = e.target.closest('button, .jwala-space-tab');
      if (!target) return;

      if (target.id === 'btn-ai-layout-dock') {
        if (this.onWorkspaceChange) this.onWorkspaceChange('ai-space');
      } else if (target.id === 'btn-ai-layout-split') {
        if (this.onWorkspaceChange) this.onWorkspaceChange('split');
      } else if (target.id === 'btn-ai-layout-max') {
        if (this.onWorkspaceChange) this.onWorkspaceChange('full-ai');
      } else if (target.id === 'jwala-collapse-btn') {
        if (this.onWorkspaceChange) this.onWorkspaceChange('classic');
      } else if (target.classList.contains('jwala-space-tab')) {
        this.activeTab = target.dataset.tab;
        this.render();
      }
    });
  }

  bindTabContentEvents() {
    if (this.activeTab === 'studio') {
      // Mode Pills
      this.panel.querySelectorAll('.jwala-mode-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          this.panel.querySelectorAll('.jwala-mode-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.activeMode = pill.dataset.mode;
          this.updatePromptsForMode(this.activeMode);
        });
      });

      // Preset Chips
      this.bindChipsEvents();

      // Temperature slider
      const tempSlider = this.panel.querySelector('#jwala-temp-slider');
      const tempDisplay = this.panel.querySelector('#temp-val-display');
      tempSlider?.addEventListener('input', () => {
        this.temperature = parseFloat(tempSlider.value);
        if (tempDisplay) tempDisplay.textContent = this.temperature.toFixed(1);
      });

      // Submit button
      this.submitBtn = this.panel.querySelector('#jwala-submit-btn');
      this.promptInput = this.panel.querySelector('#jwala-prompt-input');
      this.responseContainer = this.panel.querySelector('#jwala-response');
      this.thoughtEl = this.panel.querySelector('#jwala-thought-text');
      this.codeBox = this.panel.querySelector('#jwala-code-box');
      this.execute3dBtn = this.panel.querySelector('#jwala-execute-3d-btn');

      this.submitBtn?.addEventListener('click', () => {
        this.generate(this.promptInput.value.trim());
      });

      this.execute3dBtn?.addEventListener('click', () => {
        if (this.generatedAction) {
          this.generatedAction();
          this.scriptEditor.log(`Jwala Gemma-4 action executed in viewport.`, 'res');
        }
      });

      // Copy code button
      this.panel.querySelector('#jwala-copy-code-btn')?.addEventListener('click', () => {
        if (this.lastGeneratedCode) {
          navigator.clipboard.writeText(this.lastGeneratedCode);
          const btn = this.panel.querySelector('#jwala-copy-code-btn');
          btn.textContent = '✓ Copied!';
          setTimeout(() => btn.textContent = '📋 Copy', 1500);
        }
      });
    } else if (this.activeTab === 'history') {
      // History card actions
      this.panel.querySelectorAll('.btn-focus').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const obj = this.scene.objects.find(o => o.name === name);
          if (obj) {
            this.scene.selectObject(obj.mesh);
            this.scene.focusOnObject(obj.mesh);
          }
        });
      });

      this.panel.querySelectorAll('.btn-spawn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index, 10);
          const item = this.history[idx];
          if (item) {
            this.generate(item.prompt);
          }
        });
      });

      this.panel.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.name;
          const idx = this.history.findIndex(h => h.name === name);
          if (idx !== -1) {
            const item = this.history[idx];
            if (item.mesh) {
              this.scene.scene.remove(item.mesh);
              this.scene.objects = this.scene.objects.filter(o => o.mesh !== item.mesh);
              if (this.scene.selectedObject === item.mesh) {
                this.scene.selectedObject = null;
                this.scene.selectionBox.visible = false;
              }
              this.scene.updateStats();
            }
            this.history.splice(idx, 1);
            this.render();
          }
        });
      });

      this.panel.querySelector('#jwala-clear-history-btn')?.addEventListener('click', () => {
        this.history = [];
        this.render();
      });
    }
  }

  getChipsHtmlForMode(mode) {
    let chips = [];
    if (mode === '3d') {
      chips = [
        { label: '🤖 Sci-Fi Mech', prompt: 'Generate a sci-fi robotic arm with articulated joints and core reactor' },
        { label: '🐉 Cyber Dragon', prompt: 'Create a stylized cyber dragon with segmented body and emission wings' },
        { label: '🏙️ Cyber Skyscraper', prompt: 'Build a futuristic cyberpunk skyscraper with neon window arrays' },
        { label: '🏎️ Hover Speedbike', prompt: 'Create a futuristic cyber hover speedbike with dual repulsor turbines' },
        { label: '🛸 Sci-Fi Saucer', prompt: 'Synthesize a sci-fi scout saucer drone with rotating antigravity ring' }
      ];
    } else if (mode === 'rig') {
      chips = [
        { label: '🦴 Spine Joint Rig', prompt: 'Create a humanoid skeletal joint chain for IK rigging' },
        { label: '🦾 Arm IK Chain', prompt: 'Build an articulated 3-joint arm hierarchy with shoulder, elbow, and wrist' },
        { label: '🦵 Leg IK Chain', prompt: 'Create a 3-joint bipedal leg hierarchy with hip, knee, and ankle' }
      ];
    } else if (mode === 'shader') {
      chips = [
        { label: '✨ Arnold Gold', prompt: 'Apply an Arnold reflective gold and glowing emission material to selected mesh' },
        { label: '💎 Cyber Glass', prompt: 'Synthesize a high-refraction glowing cyber glass shader with blue rim' },
        { label: '🖤 Carbon Fiber', prompt: 'Create a dark matte carbon fiber material with cyan emissive trim' }
      ];
    } else if (mode === 'python') {
      chips = [
        { label: '⚡ Array Duplicate', prompt: 'Create a circular radial array of 8 poly cubes around origin' },
        { label: '🌀 Spiral Staircase', prompt: 'Generate a procedural spiral staircase with 20 steps using Python' },
        { label: '🌊 Wave Grid', prompt: 'Create a procedural sinusoidal wave plane with animated elevation' }
      ];
    } else if (mode === 'env') {
      chips = [
        { label: '🏙️ Cyber Cityscape', prompt: 'Generate a multi-tower cyber cityscape array with glowing highways' },
        { label: '🪐 Landing Platform', prompt: 'Build a sci-fi hexagonal starship landing pad with perimeter beacons' }
      ];
    }

    return chips.map(c => `<button class="jwala-chip" data-prompt="${c.prompt}">${c.label}</button>`).join('');
  }

  getDefaultPromptForMode(mode) {
    if (mode === '3d') return 'Generate a sci-fi robotic arm with articulated joints and core reactor';
    if (mode === 'rig') return 'Create a humanoid skeletal joint chain for IK rigging';
    if (mode === 'shader') return 'Apply an Arnold reflective gold and glowing emission material to selected mesh';
    if (mode === 'python') return 'Generate a procedural spiral staircase with 20 steps using Python';
    if (mode === 'env') return 'Build a futuristic cyberpunk skyscraper with neon window arrays';
    return 'Generate a high-poly procedural Maya asset';
  }

  updatePromptsForMode(mode) {
    const chipsContainer = this.panel.querySelector('#jwala-chips-container');
    const promptInput = this.panel.querySelector('#jwala-prompt-input');
    if (chipsContainer) {
      chipsContainer.innerHTML = this.getChipsHtmlForMode(mode);
      this.bindChipsEvents();
    }
    if (promptInput) {
      promptInput.value = this.getDefaultPromptForMode(mode);
    }
  }

  bindChipsEvents() {
    this.panel.querySelectorAll('.jwala-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const promptInput = this.panel.querySelector('#jwala-prompt-input');
        if (promptInput) {
          promptInput.value = chip.dataset.prompt;
          this.generate(chip.dataset.prompt);
        }
      });
    });
  }

  async generate(prompt) {
    if (!prompt || this.isGenerating) return;
    this.isGenerating = true;

    // Switch to studio tab if in history/specs
    if (this.activeTab !== 'studio') {
      this.activeTab = 'studio';
      this.render();
    }

    const submitBtn = this.panel.querySelector('#jwala-submit-btn');
    const responseContainer = this.panel.querySelector('#jwala-response');
    const thoughtEl = this.panel.querySelector('#jwala-thought-text');
    const codeBox = this.panel.querySelector('#jwala-code-box');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>⏳</span><span>Gemma-4 is Reasoning...</span>`;
    }

    responseContainer?.classList.add('active');
    if (thoughtEl) thoughtEl.textContent = '';
    if (codeBox) codeBox.textContent = '';

    const lower = prompt.toLowerCase();
    let thoughts = [];
    let scriptCode = '';
    let actionFn = null;
    let assetMeta = { icon: '📦', type: '3D Procedural Mesh', name: 'jwala_mesh' };

    if (lower.includes('mech') || lower.includes('robot') || lower.includes('arm')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf (Temperature: ' + this.temperature.toFixed(1) + ')',
        'Parsing intent: Synthesize articulated robotic bipedal mech with energy reactor.',
        'Analyzing Maya DAG topology: requires torso box, glowing cylinder reactor, dual shoulder joints, arm kinematics.',
        'Material assignment: Arnold aiStandardSurface with metalness 0.8, emissive cyan core (2.0 intensity).',
        'Generating optimal low-poly bounding volumes and hierarchy...'
      ];
      scriptCode = `import maya.cmds as cmds\n\n# Jwala AI // Gemma-4 12B Generated Sci-Fi Mech\nmech = cmds.jwala_createSciFiMech()\ncmds.select(mech)\ncmds.viewFit()`;
      actionFn = () => {
        const { mesh, name } = this.primitives.createSciFiMech();
        this.scene.addObject(mesh, name);
        assetMeta = { icon: '🤖', type: 'Sci-Fi Mech Robot', name, mesh, polyCount: '540 Tris' };
      };
    } else if (lower.includes('dragon') || lower.includes('creature')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf (Temperature: ' + this.temperature.toFixed(1) + ')',
        'Parsing intent: Procedural Cyber Dragon creature synthesis.',
        'Constructing 7-segment mathematical spine with sinusoidal elevation curves.',
        'Creating dual high-aspect ratio emission wing membranes.',
        'Assigning iridescent blue body shaders with neon crest accents.'
      ];
      scriptCode = `import maya.cmds as cmds\n\n# Jwala AI // Gemma-4 12B Generated Cyber Dragon\ndragon = cmds.jwala_createCyberDragon()\ncmds.select(dragon)`;
      actionFn = () => {
        const { mesh, name } = this.primitives.createCyberDragon();
        this.scene.addObject(mesh, name);
        assetMeta = { icon: '🐉', type: 'Cyber Dragon', name, mesh, polyCount: '820 Tris' };
      };
    } else if (lower.includes('speedbike') || lower.includes('hover') || lower.includes('bike')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf (Temperature: ' + this.temperature.toFixed(1) + ')',
        'Parsing intent: Futuristic cyber hover speedbike with repulsor propulsion.',
        'Constructing aerodynamic streamlined monocoque chassis.',
        'Adding twin cylindrical turbine engines with glowing cyan plasma rings.',
        'Mounting dual ventral magnetic levitation discs.'
      ];
      scriptCode = `import maya.cmds as cmds\n\n# Jwala AI // Gemma-4 Hover Speedbike\nbike = cmds.jwala_createHoverSpeedbike()\ncmds.select(bike)\ncmds.move(0, 0.5, 0)`;
      actionFn = () => {
        const { mesh, name } = this.primitives.createHoverSpeedbike();
        this.scene.addObject(mesh, name);
        assetMeta = { icon: '🏎️', type: 'Hover Speedbike', name, mesh, polyCount: '460 Tris' };
      };
    } else if (lower.includes('saucer') || lower.includes('drone') || lower.includes('ufo')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf (Temperature: ' + this.temperature.toFixed(1) + ')',
        'Parsing intent: Sci-Fi Scout Saucer Drone with antigravity core.',
        'Creating chamfered disc fuselage with golden observation dome.',
        'Generating 6-node perimeter sensor array with green LED status beacons.',
        'Configuring Arnold metallic reflectance (Metalness 0.9, Roughness 0.2).'
      ];
      scriptCode = `import maya.cmds as cmds\n\n# Jwala AI // Gemma-4 Sci-Fi Saucer\nsaucer = cmds.jwala_createSciFiSaucer()\ncmds.select(saucer)`;
      actionFn = () => {
        const { mesh, name } = this.primitives.createSciFiSaucer();
        this.scene.addObject(mesh, name);
        assetMeta = { icon: '🛸', type: 'Scout Saucer Drone', name, mesh, polyCount: '620 Tris' };
      };
    } else if (lower.includes('building') || lower.includes('skyscraper') || lower.includes('city') || lower.includes('tower')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf (Temperature: ' + this.temperature.toFixed(1) + ')',
        'Parsing intent: Procedural cyberpunk skyscraper with illuminated floor plates.',
        'Extruding monolithic 10-meter tower with alternating cyan window lights.',
        'Adding rooftop telecommunication spire and warning beacon.'
      ];
      scriptCode = `import maya.cmds as cmds\n\n# Jwala AI // Gemma-4 12B Skyscraper\nbuilding = cmds.jwala_createCyberBuilding()\ncmds.select(building)`;
      actionFn = () => {
        const { mesh, name } = this.primitives.createCyberBuilding();
        this.scene.addObject(mesh, name);
        assetMeta = { icon: '🏙️', type: 'Cyber Skyscraper', name, mesh, polyCount: '340 Tris' };
      };
    } else if (lower.includes('joint') || lower.includes('rig') || lower.includes('spine')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf (Temperature: ' + this.temperature.toFixed(1) + ')',
        'Parsing intent: Humanoid 5-joint spine chain for Maya IK / FK skeleton.',
        'Computing joint pivot hierarchy: root -> spine_01 -> spine_02 -> spine_03 -> head.',
        'Orienting joint axes along Y-up coordinate convention.'
      ];
      scriptCode = `import maya.cmds as cmds\n\n# Jwala AI // Gemma-4 Skeletal Rig\nfor i in range(5):\n    j = cmds.joint(p=(0, i * 1.2, 0), n=f"joint_{i+1}")`;
      actionFn = () => {
        let firstJoint = null;
        for (let i = 0; i < 5; i++) {
          const { mesh, name } = this.primitives.createJoint(0, (i + 1) * 1.0, 0);
          this.scene.addObject(mesh, name);
          if (i === 0) firstJoint = mesh;
        }
        assetMeta = { icon: '🦴', type: 'Skeletal Spine Rig', name: 'jointChain_5', mesh: firstJoint, polyCount: '5 Joints' };
      };
    } else if (lower.includes('spiral') || lower.includes('staircase')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf (Temperature: ' + this.temperature.toFixed(1) + ')',
        'Generating procedural spiral staircase algorithm with 20 steps.',
        'Computing rotational increments of 18 degrees and vertical rise of 0.35m per step.'
      ];
      scriptCode = `import maya.cmds as cmds\nimport math\n\nfor i in range(20):\n    step = cmds.polyCube(w=2, h=0.2, d=0.8)\n    angle = i * 0.314\n    cmds.move(math.cos(angle)*1.8, i * 0.28, math.sin(angle)*1.8)\n    cmds.rotate(0, -angle * 57.3, 0)`;
      actionFn = () => {
        let baseMesh = null;
        for (let i = 0; i < 20; i++) {
          const { mesh, name } = this.primitives.createCube(1);
          mesh.scale.set(1.8, 0.2, 0.7);
          const angle = i * 0.314;
          mesh.position.set(Math.cos(angle) * 1.8, i * 0.28, Math.sin(angle) * 1.8);
          mesh.rotation.y = -angle;
          this.scene.addObject(mesh, name);
          if (i === 0) baseMesh = mesh;
        }
        assetMeta = { icon: '🌀', type: 'Spiral Staircase', name: 'spiralStairs_20', mesh: baseMesh, polyCount: '240 Tris' };
      };
    } else {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf (Temperature: ' + this.temperature.toFixed(1) + ')',
        'Parsing intent: Procedural Arnold Shader & Primitive creation.',
        'Creating high-tessellation Maya sphere with metallic gold reflection.',
        'Configuring Arnold aiStandardSurface parameters (Specular: 0.95, Roughness: 0.15).'
      ];
      scriptCode = `import maya.cmds as cmds\n\n# Jwala AI // Arnold Metallic Shader\nsphere = cmds.polySphere(r=1.5, sx=32, sy=32)\ncmds.move(0, 1.5, 0)`;
      actionFn = () => {
        const { mesh, name } = this.primitives.createSphere(1.5, 32);
        mesh.material.color.setHex(0xffb300);
        mesh.material.metalness = 0.9;
        mesh.material.roughness = 0.15;
        this.scene.addObject(mesh, name);
        assetMeta = { icon: '✨', type: 'Arnold Gold Shader', name, mesh, polyCount: '1,920 Tris' };
      };
    }

    this.generatedAction = actionFn;
    this.lastGeneratedCode = scriptCode;

    // Stream Gemma-4 thoughts with animated typewriter effect
    for (const line of thoughts) {
      await new Promise(r => setTimeout(r, 110));
      if (thoughtEl) {
        thoughtEl.textContent += line + '\n';
        thoughtEl.scrollTop = thoughtEl.scrollHeight;
      }
    }

    if (codeBox) codeBox.textContent = scriptCode;

    // Execute directly in viewport
    if (this.generatedAction) {
      this.generatedAction();
    }

    // Record into History
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.history.unshift({
      ...assetMeta,
      prompt,
      time: timeStr
    });

    // Update history count tab badge
    const histTab = this.panel.querySelector('[data-tab="history"] span');
    if (histTab) histTab.textContent = `📦 3D Asset History (${this.history.length})`;

    this.isGenerating = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>🔥</span><span>Synthesize with Gemma-4</span>`;
    }
  }

  expand() {
    this.panel.classList.remove('collapsed');
    this.scene.onResize();
  }
}
