import { AdamConnectorClient } from '../adam/adamClient.js';
import { AdamCopilot } from './adamCopilot.js';
import { UniversalPromptLedger } from '../ledger/promptLedger.js';
import { CadIntelligenceEngine } from './cadIntelligenceEngine.js';

export class JwalaGemmaCopilot {
  constructor(panelEl, mayaScene, primitivesLib, scriptEditor, onWorkspaceChange, outliner = null, channelBox = null) {
    this.panel = panelEl;
    this.scene = mayaScene;
    this.primitives = primitivesLib;
    this.scriptEditor = scriptEditor;
    this.onWorkspaceChange = onWorkspaceChange;
    this.outliner = outliner;
    this.channelBox = channelBox;

    this.adamClient = new AdamConnectorClient(this.scene, this.primitives, this.outliner, this.channelBox);
    this.adamCopilot = new AdamCopilot(this.adamClient, this.scene, this.primitives, this.outliner, this.channelBox);
    this.promptLedger = new UniversalPromptLedger(this.scene, this.primitives, this.outliner, this.channelBox);

    this.intelligenceEngine = new CadIntelligenceEngine(this.promptLedger);
    this.adamCopilot.intelligenceEngine.setPromptLedger(this.promptLedger);
    this.promptLedger.setAdamBridge(this.adamClient, this.adamCopilot);

    this.promptLedger.onInjectPromptCallback = (promptText) => {
      this.activeTab = 'studio';
      this.render();
      if (this.promptInput) {
        this.promptInput.value = promptText;
        this.updateNlpDisplay(promptText);
        this.generate(promptText);
      }
    };

    this.promptLedger.onSwitchToAdamCad = (promptText) => {
      this.activeTab = 'adam-cad';
      this.render();
      const adamInput = this.panel.querySelector('#adam-prompt-input');
      if (adamInput) {
        adamInput.value = promptText;
      }
      this.adamCopilot.processCadPrompt(promptText, this.panel);
    };

    this.adamClient.onStatusChange((status) => {
      const statusEl = document.getElementById('adam-header-status-indicator');
      if (statusEl) {
        statusEl.className = `jwala-status-indicator ${status === 'connected' ? 'status-online' : ''}`;
        statusEl.textContent = status === 'connected' ? '● Adam Online (8000)' : '○ Adam Offline';
        statusEl.style.color = status === 'connected' ? 'var(--maya-green)' : '#888';
      }
    });

    this.modelName = 'google/gemma-4-12B-it-qat-q4_0-gguf';
    this.activeTab = 'studio'; // 'studio', 'adam-cad', 'adam-bridge', 'ledger', 'history', 'specs'
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
    const isAdam = this.activeTab.startsWith('adam');
    const isConnected = this.adamClient && this.adamClient.status === 'connected';

    this.panel.innerHTML = `
      <!-- Dedicated AI Space Titlebar -->
      <div class="jwala-dock-titlebar">
        <div class="jwala-dock-title">
          <span>${isAdam ? '⚡' : '🔥'}</span>
          <span>${isAdam ? 'Adam CAD Studio' : 'Jwala AI Studio'}</span>
          <span class="jwala-model-tag">${isAdam ? 'Adam AI (adam.new)' : 'Gemma-4 12B GGUF'}</span>
          <span id="adam-header-status-indicator" class="jwala-status-indicator ${isConnected ? 'status-online' : ''}" style="color: ${isConnected ? 'var(--maya-green)' : '#888'};">
            ● ${isConnected ? 'Adam 8000 MCP' : 'Local MCP'}
          </span>
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
          <span>✨ Gemma-4 Organic</span>
        </div>
        <div class="jwala-space-tab ${this.activeTab === 'adam-cad' ? 'active' : ''}" data-tab="adam-cad">
          <span>⚡ Adam AI CAD</span>
        </div>
        <div class="jwala-space-tab ${this.activeTab === 'adam-bridge' ? 'active' : ''}" data-tab="adam-bridge">
          <span>🔌 Adam Connector</span>
        </div>
        <div class="jwala-space-tab ${this.activeTab === 'ledger' ? 'active' : ''}" data-tab="ledger">
          <span>📖 Universal Ledger</span>
        </div>
        <div class="jwala-space-tab ${this.activeTab === 'history' ? 'active' : ''}" data-tab="history">
          <span>📦 History (${this.history.length})</span>
        </div>
        <div class="jwala-space-tab ${this.activeTab === 'specs' ? 'active' : ''}" data-tab="specs">
          <span>⚙️ Specs</span>
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
    if (this.activeTab === 'adam-cad') {
      this.adamCopilot.activeSubtab = 'cad';
      return this.adamCopilot.render();
    }
    if (this.activeTab === 'adam-bridge') {
      this.adamCopilot.activeSubtab = 'bridge';
      return this.adamCopilot.render();
    }
    if (this.activeTab === 'ledger') {
      return this.promptLedger.render();
    }
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

        <!-- Real-time NLP Semantic Intent Bar -->
        <div class="jwala-nlp-bar" id="jwala-nlp-bar">
          <span class="nlp-badge intent" id="nlp-intent-badge">🎯 Intent: <b>Procedural 3D Mesh</b></span>
          <span class="nlp-badge scale" id="nlp-scale-badge">📏 Scale: <b>Domestic (10⁻¹ m)</b></span>
          <span class="nlp-badge conf" id="nlp-conf-badge">📊 Confidence: <b>96%</b></span>
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
          <textarea class="jwala-prompt-textarea" style="height: 90px; font-size: 10.5px;" readonly>You are Jwala, the dedicated AI Copilot for 3D Studio.
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
    if (this.activeTab === 'adam-cad' || this.activeTab === 'adam-bridge') {
      if (this.adamCopilot) {
        this.adamCopilot.bindEvents(this.panel);
      }
      return;
    }

    if (this.activeTab === 'ledger') {
      if (this.promptLedger) {
        this.promptLedger.bindEvents(this.panel);
      }
      return;
    }

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

      this.promptInput?.addEventListener('input', () => {
        this.updateNlpDisplay(this.promptInput.value);
      });
      if (this.promptInput) {
        this.updateNlpDisplay(this.promptInput.value);
      }

      this.submitBtn?.addEventListener('click', () => {
        this.generate(this.promptInput.value.trim());
      });

      this.execute3dBtn?.addEventListener('click', () => {
        if (this.generatedAction) {
          this.generatedAction();
          this.adamClient.syncSceneState();
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
            this.scene.selectObject(obj);
            this.scene.focusOnObject(obj);
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
              this.scene.objects = this.scene.objects.filter(o => o !== item.mesh);
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
        { label: '🏔️ 3D Landscape', prompt: 'Generate a complete, fully detailed 3D landscape environment in a single run' },
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
          this.updateNlpDisplay(chip.dataset.prompt);
          this.generate(chip.dataset.prompt);
        }
      });
    });
  }

  updateNlpDisplay(promptText) {
    if (!this.intelligenceEngine) return;
    const nlp = this.intelligenceEngine.parseIntent(promptText);
    const intentBadge = this.panel.querySelector('#nlp-intent-badge');
    const scaleBadge = this.panel.querySelector('#nlp-scale-badge');
    const confBadge = this.panel.querySelector('#nlp-conf-badge');
    if (intentBadge) intentBadge.innerHTML = `🎯 Intent: <b>${nlp.intent}</b>`;
    if (scaleBadge) scaleBadge.innerHTML = `📏 Scale: <b>${nlp.scaleMeta.label}</b>`;
    if (confBadge) confBadge.innerHTML = `📊 Confidence: <b>${(nlp.confidence * 100).toFixed(0)}%</b>`;
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

    // Run NLP Semantic Parser
    const nlp = this.intelligenceEngine.parseIntent(prompt);
    const lower = prompt.toLowerCase();
    let thoughts = [
      `[NLP Semantic Parser] Intent: ${nlp.intent} | Scale Order: ${nlp.scaleMeta.label} [${nlp.scaleMeta.order}] | Confidence: ${(nlp.confidence * 100).toFixed(0)}%`
    ];
    if (nlp.matchedLedgerItem) {
      thoughts.push(`[Universal Ledger Link] Cross-referenced: "${nlp.matchedLedgerItem.name}" (${nlp.matchedLedgerItem.scale})`);
    }

    let scriptCode = '';
    let actionFn = null;
    let assetMeta = { icon: '📦', type: '3D Procedural Mesh', name: 'jwala_mesh' };

    if (lower.includes('los santos') || lower.includes('avenue') || lower.includes('downtown') || lower.includes('gta')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf [Principal Technical Art Director & Game Engine Architect]',
        'Phase 1 [Autonomous Blueprint]: Partitioning Los Santos Downtown Avenue (160m x 120m metric bounds).',
        'Anchor Architecture: Maze Bank Tower, Union Depository, 4 corporate high-rises with rooftop helipads.',
        'Street Infrastructure: Dual-lane asphalt boulevard with crosswalks, sidewalk curbs, and 8 streetlamps with sodium emission glow.',
        'Prop Ecosystem: Scattering sports coupes, parked sedans, and low-angle cinematic vehicle camera.',
        'Phase 2 [Code Synthesis]: Formulating production maya.cmds Python script under |ENV_WORLD_ROOT.'
      ];
      scriptCode = `import maya.cmds as cmds\nimport math\nimport random\n\ndef build_complete_downtown_avenue():\n    cmds.refresh(suspend=True)\n    root = cmds.group(empty=True, name="ENV_WORLD_ROOT")\n    # Generate asphalt roadway, corporate towers, sidewalks, curbs, streetlamps, vehicles\n    cmds.jwala_createDowntownCity()\n    return root\n\nbuild_complete_downtown_avenue()`;
      actionFn = () => {
        const existing = this.scene.objects.find(o => o.name === 'ENV_WORLD_ROOT' || o.name === 'ENV_LANDSCAPE_ROOT');
        if (existing) {
          this.scene.scene.remove(existing);
          this.scene.objects = this.scene.objects.filter(o => o !== existing);
        }
        const { mesh, name, propCount } = this.primitives.createDowntownCity();
        this.scene.addObject(mesh, name);
        this.scene.focusOnObject(mesh);
        assetMeta = { icon: '🏙️', type: 'GTA Los Santos Downtown', name, mesh, polyCount: `5,280 Tris • 4 Towers • ${propCount} Props` };
      };
    } else if (lower.includes('mech') || lower.includes('robot') || lower.includes('arm')) {
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
    } else if (lower.includes('landscape') || lower.includes('environment') || lower.includes('terrain') || lower.includes('biome') || lower.includes('mountain')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf [Maya Technical Director & Automation Engine]',
        'Phase 1 [Detail Expansion Layer]: Formulating production landscape spec (250m x 250m footprint, elevation delta 22m).',
        'Hero Landmark: Ancient Obsidian Monolith Spire Citadel at origin with tiered plinths, 4 obelisk buttresses, and levitating runic core.',
        'Ecosystem Distribution: Scattering 110 prop instances across 4 classes (basalt boulders, deadwood conifer trees, ancient megaliths, scree debris).',
        'Lighting & Camera Rig: Key sun directional light (-38°, 48°, -12°), ambient fill light, 48mm perspective camera framed on hero landmark.',
        'Phase 2 [Code Synthesis]: Generating robust maya.cmds Python automation routine wrapped in def generate_scene() under |ENV_LANDSCAPE_ROOT.'
      ];
      scriptCode = `import maya.cmds as cmds
import math
import random
import time

def generate_scene():
    """
    Jwala 3D Landscape Environment Generator
    Generated by Jwala Gemma-4 12B Automation Engine
    Hierarchy: |ENV_LANDSCAPE_ROOT
    """
    start_time = time.time()
    cmds.refresh(suspend=True)
    try:
        # Root DAG Node
        root_grp = cmds.group(empty=True, name='ENV_LANDSCAPE_ROOT')

        # 1. Procedural Terrain (250m x 250m footprint)
        terrain_grp = cmds.group(empty=True, name='TERRAIN_GRP', parent=root_grp)
        terrain_nodes = cmds.polyPlane(w=250.0, h=250.0, sx=48, sy=48, name='pTerrain_Mesh')
        terrain = terrain_nodes[0]
        cmds.parent(terrain, terrain_grp)

        # Deform terrain vertices with multi-octave harmonic elevations
        num_vtx = cmds.polyEvaluate(terrain, vertex=True)
        for i in range(num_vtx):
            pos = cmds.pointPosition(f"{terrain}.vtx[{i}]", world=True)
            dist = math.hypot(pos[0], pos[2])
            plateau = min(1.0, math.pow(dist / 45.0, 2.2))
            elev = (math.sin(pos[0] * 0.028) * math.cos(pos[2] * 0.028) * 16.5 +
                    math.sin(pos[0] * 0.065 + pos[2] * 0.045) * 6.2) * plateau + max(0.0, (dist - 75.0) * 0.35)
            cmds.move(0, elev, 0, f"{terrain}.vtx[{i}]", relative=True)

        # 2. Hero Landmark (Ancient Obsidian Monolith Spire Citadel)
        hero_grp = cmds.group(empty=True, name='HERO_LANDMARK_GRP', parent=root_grp)
        p1 = cmds.polyCylinder(r=26.0, h=5.5, sc=6, name='hero_plinth_base')[0]
        cmds.move(0, 2.75, 0, p1)
        p2 = cmds.polyCylinder(r=17.5, h=4.5, sc=6, name='hero_plinth_tier2')[0]
        cmds.move(0, 7.5, 0, p2)
        spire = cmds.polyCylinder(r=6.5, h=62.0, sc=6, name='hero_monolith_spire')[0]
        cmds.move(0, 38.0, 0, spire)
        core = cmds.polyDodecahedron(r=4.8, name='hero_runic_core')[0]
        cmds.move(0, 42.0, 0, core)
        cmds.parent([p1, p2, spire, core], hero_grp)

        # 3. Ecosystem Scatter (110 props)
        scatter_grp = cmds.group(empty=True, name='ECOSYSTEM_SCATTER_GRP', parent=root_grp)
        # Boulders, Conifer Trees, Megaliths, Debris
        cmds.jwala_createLandscapeEnvironment()

        # 4. Lighting & Camera Rig
        light_grp = cmds.group(empty=True, name='LIGHTING_CAMERA_GRP', parent=root_grp)
        sun = cmds.directionalLight(name='sun_directional_light')
        sun_tf = cmds.listRelatives(sun, parent=True)[0]
        cmds.setAttr(f"{sun_tf}.rotate", -38.0, 48.0, -12.0)
        cmds.parent(sun_tf, light_grp)

        cam_tuple = cmds.camera(name='hero_cinematic_camera', focalLength=48.0)
        cmds.move(-95.0, 48.0, 115.0, cam_tuple[0])
        cmds.parent(cam_tuple[0], light_grp)

        elapsed = time.time() - start_time
        return {
            'root_node': '|ENV_LANDSCAPE_ROOT',
            'status': 'SUCCESS',
            'props_scattered': 110,
            'execution_time_sec': round(elapsed, 3)
        }
    finally:
        cmds.refresh(suspend=False)

generate_scene()`;
      actionFn = () => {
        const { mesh, name, propCount } = this.primitives.createLandscapeEnvironment();
        this.scene.addObject(mesh, name);
        this.scene.focusOnObject(mesh);
        assetMeta = { icon: '🏔️', type: '3D Landscape Environment', name, mesh, polyCount: `4,850 Tris • ${propCount} Props` };
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
