// src/maya/scriptEditor.js
// Maya Python 3.11 & MEL Script Editor with Deep Gemma-4 12B Maya TD & Adam AI CAD Integration

import * as THREE from 'three';
import { CadIntelligenceEngine } from '../ai/cadIntelligenceEngine.js';

export class MayaScriptEditor {
  constructor(modalEl, mayaScene, primitivesLib, outliner = null, channelBox = null, intelligenceEngine = null, promptLedger = null) {
    this.modal = modalEl;
    this.scene = mayaScene;
    this.primitives = primitivesLib;
    this.outliner = outliner;
    this.channelBox = channelBox;
    this.promptLedger = promptLedger;
    this.intelligenceEngine = intelligenceEngine || new CadIntelligenceEngine(promptLedger);

    this.activeAiModel = 'gemma'; // 'gemma', 'adam', 'ledger'
    this.isGeneratingAi = false;
    this.onOpenDedicatedAiSpace = null;

    this.history = [
      '// Jwala 3D Studio Script Editor [Gemma-4 12B Maya TD & Adam AI CAD Connected]',
      '// Python 3.11 & MEL Execution Engine Initialized',
      '// Maya Automation Subsystem Active [cmds, OpenMaya API, AI Generative Synthesis]',
      'import maya.cmds as cmds'
    ];

    this.init();
  }

  setAiCopilot(gemmaCopilot) {
    if (gemmaCopilot) {
      if (gemmaCopilot.intelligenceEngine) this.intelligenceEngine = gemmaCopilot.intelligenceEngine;
      if (gemmaCopilot.promptLedger) this.promptLedger = gemmaCopilot.promptLedger;
    }
  }

  init() {
    this.modal.innerHTML = `
      <div class="maya-script-window">
        <!-- Titlebar -->
        <div class="maya-panel-titlebar">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 700; color: #fff;">Script Editor</span>
            <span style="font-size: 10px; color: var(--maya-cyan);">[MEL / Python 3.11]</span>
            <span class="script-ai-active-pill">🔥 Gemma-4 TD & ⚡ Adam AI Active</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button id="script-open-ai-space-btn" class="script-head-btn" title="Open Dedicated AI Studio">
              <span>Studio ◧</span>
            </button>
            <button id="script-close-btn" class="script-head-btn" title="Close Script Editor">✕</button>
          </div>
        </div>

        <!-- AI Copilot Header Toolbar -->
        <div class="script-ai-toolbar">
          <div class="script-ai-controls-row">
            <!-- Model Selector -->
            <select id="script-ai-model-select" class="script-ai-select" title="Target AI Synthesis Engine">
              <option value="gemma">🔥 Gemma-4 12B Maya TD (Python cmds)</option>
              <option value="adam">⚡ Adam AI CAD (Parametric CSG)</option>
              <option value="ledger">📖 Universal Ledger (Cup to Cosmos)</option>
            </select>

            <!-- Preset Blueprints -->
            <select id="script-ai-preset-select" class="script-ai-select" style="max-width: 210px;" title="Select Procedural Blueprint">
              <option value="">⚡ Select AI Preset Blueprint...</option>
              <option value="spiral">🌀 Procedural Spiral Staircase (24 steps, central pillar)</option>
              <option value="radial">🌐 Radial Rotunda (12 Classical Fluted Columns)</option>
              <option value="terrain">🏔️ Sinusoidal Mountainous Terrain & Ridges</option>
              <option value="scatter">🌲 Ecosystem Scatter (48 Trees & Boulders)</option>
              <option value="shader">✨ Arnold Gold / Glass aiStandardSurface Shader</option>
              <option value="rig">🦴 3-Bone Arm/Leg IK Joint Chain Rig</option>
              <option value="cup">☕ Ceramic Coffee Mug (The Cup - 10⁻¹ m)</option>
              <option value="planet">🪐 Saturn Celestial System & Ring Bands</option>
              <option value="galaxy">🌌 Spiral Galaxy Core & Stellar Arms</option>
              <option value="city">🏙️ GTA V Los Santos Downtown Avenue</option>
            </select>

            <!-- Prompt Input Field -->
            <input 
              type="text" 
              id="script-ai-prompt-input" 
              class="script-ai-input" 
              placeholder="Prompt AI: e.g. 'build a spiral staircase with 24 steps' or 'create a car'..." 
              autocomplete="off"
            />

            <!-- AI Action Buttons -->
            <button id="script-ai-generate-btn" class="script-ai-action-btn" title="Synthesize Python Script via AI">
              <span>✨ AI Generate</span>
            </button>
            <button id="script-ai-run-btn" class="script-ai-action-btn script-ai-action-accent" title="Synthesize & Execute Scene Directly">
              <span>⚡ AI Run Scene</span>
            </button>
          </div>

          <!-- NLP Semantic Intelligence Strip -->
          <div class="script-nlp-strip">
            <span class="nlp-strip-item" id="script-nlp-badge-intent">Intent: <b style="color:#00e5ff;">STANDBY</b></span>
            <span class="nlp-strip-item" id="script-nlp-badge-scale">Scale: <b style="color:#fff;">Human [10⁻¹ m]</b></span>
            <span class="nlp-strip-item" id="script-nlp-badge-conf">Confidence: <b style="color:var(--maya-green);">95%</b></span>
            <span class="nlp-strip-item" id="script-nlp-badge-target">Engine: <b style="color:#ffb300;">maya.cmds 3.11</b></span>
          </div>
        </div>

        <!-- History Output Console -->
        <div class="maya-script-history" id="script-history-log"></div>

        <!-- Intermediate Code Action Strip -->
        <div class="script-editor-subbar">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="script-tab-pill active" id="tab-lang-python">Python 3.11</span>
            <span class="script-tab-pill" id="tab-lang-mel">MEL</span>
            <span style="color: var(--maya-text-muted); font-size: 10px;">(Press Ctrl+Enter to Execute)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button id="script-ai-explain-btn" class="script-tool-btn" title="Reverse-engineer script architecture">🔍 Explain Code</button>
            <button id="script-ai-optimize-btn" class="script-tool-btn" title="Add cmds.refresh suspension & optimize">⚡ Optimize Script</button>
            <button id="script-ai-format-btn" class="script-tool-btn" title="Format Python Code">🧹 Format</button>
            <button id="script-ai-ledger-btn" class="script-tool-btn" title="Insert Universal Ledger Item">📖 Ledger Picker</button>
          </div>
        </div>

        <!-- Code Input Area -->
        <div class="maya-script-input-area">
          <textarea id="script-code-input" spellcheck="false" placeholder="# Write Maya Python commands here:&#10;cmds.polyCube(w=2, h=2, d=2)&#10;cmds.move(0, 4, 0)"># ========================================================
# Jwala 3D Studio Maya Python 3.11 Automation
# ========================================================
import maya.cmds as cmds

def build_scene():
    cmds.refresh(suspend=True)
    root = cmds.group(empty=True, name="ENV_HERO_ROOT")
    cube = cmds.polyCube(w=2, h=2, d=2, n="Hero_Box")[0]
    cmds.parent(cube, root)
    cmds.move(0, 2, 0)
    cmds.refresh(suspend=False)
    cmds.select(root)
    print("// [SUCCESS] Hero asset created.")
    return root

build_scene()
</textarea>
        </div>

        <!-- Bottom Action Bar -->
        <div class="maya-script-actions">
          <div style="display: flex; gap: 8px;">
            <button id="script-clear-btn" class="script-foot-btn">Clear History</button>
            <button id="script-reset-btn" class="script-foot-btn">Reset Template</button>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span id="script-exec-status" style="font-size: 11px; color: var(--maya-text-muted);">Ready</span>
            <button class="maya-play-btn" id="script-execute-btn" style="width: auto; padding: 5px 16px; background: var(--maya-cyan); color: #000; font-weight: 700; border-radius: 4px;">
              Execute (Ctrl+Enter)
            </button>
          </div>
        </div>
      </div>
    `;

    this.historyEl = this.modal.querySelector('#script-history-log');
    this.inputEl = this.modal.querySelector('#script-code-input');
    this.closeBtn = this.modal.querySelector('#script-close-btn');
    this.openAiSpaceBtn = this.modal.querySelector('#script-open-ai-space-btn');
    this.execBtn = this.modal.querySelector('#script-execute-btn');
    this.clearBtn = this.modal.querySelector('#script-clear-btn');
    this.resetBtn = this.modal.querySelector('#script-reset-btn');

    this.aiPromptInput = this.modal.querySelector('#script-ai-prompt-input');
    this.aiModelSelect = this.modal.querySelector('#script-ai-model-select');
    this.aiPresetSelect = this.modal.querySelector('#script-ai-preset-select');
    this.aiGenerateBtn = this.modal.querySelector('#script-ai-generate-btn');
    this.aiRunBtn = this.modal.querySelector('#script-ai-run-btn');

    this.aiExplainBtn = this.modal.querySelector('#script-ai-explain-btn');
    this.aiOptimizeBtn = this.modal.querySelector('#script-ai-optimize-btn');
    this.aiFormatBtn = this.modal.querySelector('#script-ai-format-btn');
    this.aiLedgerBtn = this.modal.querySelector('#script-ai-ledger-btn');

    this.execStatus = this.modal.querySelector('#script-exec-status');

    this.renderHistory();
    this.setupEvents();
  }

  setupEvents() {
    this.closeBtn.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    if (this.openAiSpaceBtn) {
      this.openAiSpaceBtn.addEventListener('click', () => {
        this.close();
        if (this.onOpenDedicatedAiSpace) {
          this.onOpenDedicatedAiSpace();
        }
      });
    }

    // Execute Button
    this.execBtn.addEventListener('click', () => this.execute());

    // Clear and Reset
    this.clearBtn.addEventListener('click', () => {
      this.history = ['// History cleared. Python & MEL Engine Ready.'];
      this.renderHistory();
    });

    this.resetBtn.addEventListener('click', () => {
      this.inputEl.value = `import maya.cmds as cmds\n\ndef build_scene():\n    cmds.refresh(suspend=True)\n    root = cmds.group(empty=True, name="ENV_HERO_ROOT")\n    cube = cmds.polyCube(w=2, h=2, d=2, n="Hero_Box")[0]\n    cmds.parent(cube, root)\n    cmds.move(0, 2, 0)\n    cmds.refresh(suspend=False)\n    cmds.select(root)\n    return root\n\nbuild_scene()\n`;
      this.log('Loaded default Python template.', 'res');
    });

    // Keyboard Shortcuts in Code Input (Ctrl+Enter to Execute, Tab indentation)
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.execute();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.inputEl.selectionStart;
        const end = this.inputEl.selectionEnd;
        this.inputEl.value = this.inputEl.value.substring(0, start) + '    ' + this.inputEl.value.substring(end);
        this.inputEl.selectionStart = this.inputEl.selectionEnd = start + 4;
      }
    });

    // AI Model Change
    this.aiModelSelect.addEventListener('change', (e) => {
      this.activeAiModel = e.target.value;
      const targetBadge = this.modal.querySelector('#script-nlp-badge-target');
      if (targetBadge) {
        targetBadge.innerHTML = `Engine: <b style="color:#ffb300;">${this.activeAiModel === 'adam' ? 'Adam CAD (MCP)' : this.activeAiModel === 'ledger' ? 'Universal Ledger' : 'maya.cmds 3.11'}</b>`;
      }
    });

    // AI Preset Selection
    this.aiPresetSelect.addEventListener('change', (e) => {
      const preset = e.target.value;
      if (!preset) return;
      const presetPrompts = {
        spiral: 'create a procedural spiral staircase with 24 wooden steps and central pillar',
        radial: 'create a radial rotunda with 12 classical fluted pillars and entablature ring',
        terrain: 'generate sinusoidal mountain terrain with hero peak and foothills',
        scatter: 'scatter 48 low-poly trees and boulders on a ground plane',
        shader: 'setup Arnold 7.3 aiStandardSurface metallic gold PBR shader network',
        rig: 'create a 3-bone kinematic IK joint chain with shoulder, elbow, wrist',
        cup: 'create a ceramic coffee mug (the cup) with hollow body and C-curved torus handle',
        planet: 'create a celestial planet system with gas giant sphere and equatorial rings',
        galaxy: 'generate a spiral galaxy core with 2 logarithmic arms and star clusters',
        city: 'build downtown avenue with skyscrapers, street grid, and high-rise towers'
      };

      if (presetPrompts[preset]) {
        this.aiPromptInput.value = presetPrompts[preset];
        this.updateNlpBadge(presetPrompts[preset]);
      }
    });

    // Real-Time NLP input typing listener
    this.aiPromptInput.addEventListener('input', (e) => {
      this.updateNlpBadge(e.target.value);
    });

    // Enter key in AI Prompt Input triggers Generation
    this.aiPromptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          this.aiGenerateScript(null, true); // AI Run Scene directly
        } else {
          this.aiGenerateScript();
        }
      }
    });

    // AI Generate & AI Run Scene Buttons
    this.aiGenerateBtn.addEventListener('click', () => this.aiGenerateScript());
    this.aiRunBtn.addEventListener('click', () => this.aiGenerateScript(null, true));

    // Code Assistant Tools
    this.aiExplainBtn.addEventListener('click', () => this.aiExplainActiveCode());
    this.aiOptimizeBtn.addEventListener('click', () => this.aiOptimizeActiveCode());
    this.aiFormatBtn.addEventListener('click', () => this.formatCode());
    this.aiLedgerBtn.addEventListener('click', () => this.openLedgerPicker());
  }

  updateNlpBadge(text) {
    if (!text || !text.trim()) return;
    const nlp = this.intelligenceEngine.parseIntent(text);

    const intentEl = this.modal.querySelector('#script-nlp-badge-intent');
    const scaleEl = this.modal.querySelector('#script-nlp-badge-scale');
    const confEl = this.modal.querySelector('#script-nlp-badge-conf');

    if (intentEl) intentEl.innerHTML = `Intent: <b style="color:#00e5ff;">${nlp.intent}</b>`;
    if (scaleEl) scaleEl.innerHTML = `Scale: <b style="color:#fff;">${nlp.scaleMeta.label}</b>`;
    if (confEl) confEl.innerHTML = `Confidence: <b style="color:var(--maya-green);">${(nlp.confidence * 100).toFixed(0)}%</b>`;
  }

  log(msg, type = 'info') {
    const prefix = type === 'cmd' ? 'cmds: ' : type === 'res' ? '// Result: ' : type === 'thought' ? '' : '// ';
    this.history.push(prefix + msg);
    this.renderHistory();
  }

  renderHistory() {
    if (!this.historyEl) return;
    this.historyEl.innerHTML = this.history.map(line => {
      if (line.startsWith('cmds:')) {
        return `<div style="color: var(--maya-cyan); font-weight: 600;">${this.escapeHtml(line)}</div>`;
      } else if (line.startsWith('// [SUCCESS]')) {
        return `<div style="color: var(--maya-green); font-weight: 700;">${this.escapeHtml(line)}</div>`;
      } else if (line.startsWith('// Result:')) {
        return `<div style="color: #4fc3f7;">${this.escapeHtml(line)}</div>`;
      } else if (line.startsWith('// Error:')) {
        return `<div style="color: #ff5252; font-weight: 700;">${this.escapeHtml(line)}</div>`;
      } else if (line.includes('<|channel>thought') || line.includes('[Gemma-4') || line.includes('[Adam AI')) {
        return `<div style="color: #ffb74d;">${this.escapeHtml(line)}</div>`;
      }
      return `<div>${this.escapeHtml(line)}</div>`;
    }).join('');
    this.historyEl.scrollTop = this.historyEl.scrollHeight;
  }

  escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ==========================================================================
  // AI Script Synthesis & Live Stream
  // ==========================================================================
  async aiGenerateScript(customPrompt = null, autoExecute = false) {
    const prompt = (customPrompt !== null ? customPrompt : this.aiPromptInput.value).trim();
    if (!prompt) {
      this.log('Please enter an AI prompt instruction or select a preset.', 'res');
      this.aiPromptInput.focus();
      return;
    }

    if (this.isGeneratingAi) return;
    this.isGeneratingAi = true;

    this.aiGenerateBtn.disabled = true;
    this.aiRunBtn.disabled = true;
    if (this.execStatus) this.execStatus.textContent = 'AI Reasoning...';

    const mode = this.activeAiModel;
    this.log(`\n// ========================================================`, 'thought');
    this.log(`// 🔥 Invoking AI Copilot [Engine: ${mode.toUpperCase()}]`, 'thought');
    this.log(`// Prompt: "${prompt}"`, 'thought');

    try {
      const result = await this.intelligenceEngine.synthesizeReasoningStream(prompt, mode, (token) => {
        this.log(token.trim(), 'thought');
      });

      // Populate Code into Editor
      this.inputEl.value = result.scriptCode;
      this.log(`// [AI Code Synthesis Complete] Generated ${result.scriptCode.split('\n').length} lines of Python code.`, 'res');
      this.log(`// ========================================================\n`, 'thought');

      if (this.execStatus) this.execStatus.textContent = 'Generated';

      if (autoExecute) {
        this.log('Auto-executing AI generated script in 3D scene...', 'info');
        this.execute(result.scriptCode);
      }
    } catch (err) {
      this.log(`Error during AI synthesis: ${err.message}`, 'error');
    } finally {
      this.isGeneratingAi = false;
      this.aiGenerateBtn.disabled = false;
      this.aiRunBtn.disabled = false;
      if (this.execStatus && !autoExecute) this.execStatus.textContent = 'Ready';
    }
  }

  // ==========================================================================
  // AI Code Explanation Tool
  // ==========================================================================
  aiExplainActiveCode() {
    const code = this.inputEl.value;
    const report = this.intelligenceEngine.explainCode(code);
    this.log('\n' + report + '\n', 'thought');
  }

  // ==========================================================================
  // AI Code Optimization Tool
  // ==========================================================================
  aiOptimizeActiveCode() {
    const code = this.inputEl.value;
    const optimized = this.intelligenceEngine.optimizeCode(code);
    this.inputEl.value = optimized;
    this.log('// [AI Optimizer] Injected cmds.refresh(suspend=True) viewport buffering and try/finally hierarchy.', 'res');
  }

  // ==========================================================================
  // Code Formatter
  // ==========================================================================
  formatCode() {
    const code = this.inputEl.value;
    const lines = code.split('\n');
    const cleaned = lines.map(line => line.trimEnd()).join('\n');
    this.inputEl.value = cleaned;
    this.log('// Code formatting cleaned up whitespace.', 'res');
  }

  // ==========================================================================
  // Universal Ledger Object Picker
  // ==========================================================================
  openLedgerPicker() {
    if (!this.promptLedger) {
      this.log('Universal Prompt Ledger is loading...', 'info');
      return;
    }

    const items = this.promptLedger.getAllItems();
    this.log(`\n// ========================================================`, 'thought');
    this.log(`// 📖 Universal Prompt Ledger: Registered Scale Catalog (${items.length} entities)`, 'thought');
    this.log(`// Scales: [10⁻¹⁰ m Micro] to [10²⁶ m Observable Universe]`, 'thought');
    
    // Pick first 5 items to show
    const samples = items.slice(0, 6);
    samples.forEach(item => {
      this.log(`// • [${item.scaleOrder}] ${item.name} (id: ${item.id})`, 'info');
    });
    this.log(`// Tip: In Python, call: cmds.ledger_synthesize("obj-tableware-cup-classic")`, 'thought');
    this.log(`// ========================================================\n`, 'thought');

    // Load Ceramic Coffee Mug by default into prompt input
    this.aiPromptInput.value = 'create a ceramic coffee mug (the cup)';
    this.updateNlpBadge(this.aiPromptInput.value);
  }

  // ==========================================================================
  // Procedural Asset Builders for Clean Native 3D Scene Execution
  // ==========================================================================
  buildSpiralStaircase(numSteps = 24, radius = 2.6, stepHeight = 0.22, stepWidth = 1.25) {
    const root = new THREE.Group();
    root.name = 'ENV_SPIRAL_STAIRCASE_ROOT';

    // 1. Central Pillar Column
    const totalHeight = numSteps * stepHeight + 0.8;
    const pillarGeom = new THREE.CylinderGeometry(0.28, 0.28, totalHeight, 24);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x424242, roughness: 0.3, metalness: 0.8 });
    const pillar = new THREE.Mesh(pillarGeom, pillarMat);
    pillar.name = 'Stair_CentralPillar';
    pillar.position.set(0, totalHeight / 2.0, 0);
    root.add(pillar);

    // 2. Helical Steps
    const stepAngle = (2.0 * Math.PI) / 16.0;
    const stepGeom = new THREE.BoxGeometry(stepWidth, stepHeight * 0.75, 0.42);
    const stepMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.6, metalness: 0.1 });

    for (let i = 0; i < numSteps; i++) {
      const step = new THREE.Mesh(stepGeom, stepMat);
      step.name = `Step_${i < 10 ? '0' + i : i}`;
      const angle = i * stepAngle;
      const x = (radius * 0.52) * Math.cos(angle);
      const z = (radius * 0.52) * Math.sin(angle);
      const y = (i + 0.5) * stepHeight;
      step.position.set(x, y, z);
      step.rotation.y = -angle;
      root.add(step);
    }

    this.scene.addObject(root, root.name);
    this.scene.focusOnObject(root);
    this.log(`[SUCCESS] Spiral Staircase created with ${numSteps} steps under |ENV_SPIRAL_STAIRCASE_ROOT`, 'res');
    this.syncUi();
  }

  buildRadialRotunda(numPillars = 12, radius = 6.5, pillarHeight = 4.8) {
    const root = new THREE.Group();
    root.name = 'ARCH_RADIAL_ROTUNDA_ROOT';

    // Plinth
    const plinthGeom = new THREE.CylinderGeometry(radius + 1.6, radius + 1.6, 0.6, 32);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.8 });
    const plinth = new THREE.Mesh(plinthGeom, plinthMat);
    plinth.position.set(0, 0.3, 0);
    root.add(plinth);

    // Columns
    const colGeom = new THREE.CylinderGeometry(0.45, 0.45, pillarHeight, 24);
    const colMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.4 });
    for (let i = 0; i < numPillars; i++) {
      const ang = (2.0 * Math.PI / numPillars) * i;
      const col = new THREE.Mesh(colGeom, colMat);
      col.position.set(radius * Math.cos(ang), pillarHeight / 2.0 + 0.6, radius * Math.sin(ang));
      root.add(col);
    }

    // Architrave Ring
    const ringGeom = new THREE.TorusGeometry(radius, 0.45, 16, 48);
    const ring = new THREE.Mesh(ringGeom, colMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, pillarHeight + 0.8, 0);
    root.add(ring);

    this.scene.addObject(root, root.name);
    this.scene.focusOnObject(root);
    this.log(`[SUCCESS] Radial Rotunda created with ${numPillars} columns under |ARCH_RADIAL_ROTUNDA_ROOT`, 'res');
    this.syncUi();
  }

  buildProceduralTerrain(size = 36, peakHeight = 9.0) {
    const root = new THREE.Group();
    root.name = 'ENV_PROCEDURAL_TERRAIN_ROOT';

    const floor = this.primitives.createPlane(size);
    floor.mesh.name = 'Geo_TerrainFloor';
    root.add(floor.mesh);

    const peak = this.primitives.createCone(size * 0.28, peakHeight);
    peak.mesh.position.set(0, peakHeight / 2.0, 0);
    root.add(peak.mesh);

    for (let i = 0; i < 6; i++) {
      const rad = (Math.PI * 2 / 6) * i;
      const hill = this.primitives.createDodecahedron(peakHeight * 0.35);
      hill.mesh.position.set((size * 0.32) * Math.cos(rad), peakHeight * 0.18, (size * 0.32) * Math.sin(rad));
      root.add(hill.mesh);
    }

    this.scene.addObject(root, root.name);
    this.scene.focusOnObject(root);
    this.log(`[SUCCESS] Procedural Terrain generated under |ENV_PROCEDURAL_TERRAIN_ROOT`, 'res');
    this.syncUi();
  }

  buildEcosystemScatter(count = 48, spread = 16.0) {
    const root = new THREE.Group();
    root.name = 'ENV_SCATTER_ROOT';

    const ground = this.primitives.createPlane(spread * 2.2);
    root.add(ground.mesh);

    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.random() * (spread - 2.5);
      const theta = Math.random() * Math.PI * 2;
      const px = r * Math.cos(theta);
      const pz = r * Math.sin(theta);

      if (Math.random() > 0.4) {
        const tree = this.primitives.createCone(0.6 + Math.random() * 0.6, 2.2 + Math.random() * 2.0);
        tree.mesh.position.set(px, 1.6, pz);
        tree.mesh.rotation.y = Math.random() * Math.PI * 2;
        root.add(tree.mesh);
      } else {
        const rock = this.primitives.createDodecahedron(0.4 + Math.random() * 0.45);
        rock.mesh.position.set(px, 0.4, pz);
        rock.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        root.add(rock.mesh);
      }
    }

    this.scene.addObject(root, root.name);
    this.scene.focusOnObject(root);
    this.log(`[SUCCESS] Ecosystem scattered with ${count} instances under |ENV_SCATTER_ROOT`, 'res');
    this.syncUi();
  }

  setupArnoldPbrShader(isGold = true) {
    const ballGeom = new THREE.SphereGeometry(1.5, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: isGold ? 0xffb300 : 0xe0f7fa,
      metalness: isGold ? 1.0 : 0.05,
      roughness: isGold ? 0.12 : 0.05,
      transparent: !isGold,
      opacity: !isGold ? 0.6 : 1.0
    });
    const ball = new THREE.Mesh(ballGeom, mat);
    ball.name = isGold ? 'ShaderBall_Gold' : 'ShaderBall_Glass';
    ball.position.set(0, 1.5, 0);
    this.scene.addObject(ball, ball.name);
    this.scene.focusOnObject(ball);
    this.log(`[SUCCESS] Arnold aiStandardSurface shader assigned to |${ball.name}`, 'res');
    this.syncUi();
  }

  buildIkJointChain(name = 'Hero_Arm_Chain') {
    const root = new THREE.Group();
    root.name = `${name}_ROOT`;

    const j1 = this.primitives.createSphere(0.35);
    j1.mesh.position.set(0, 4.2, 0);
    root.add(j1.mesh);

    const j2 = this.primitives.createSphere(0.28);
    j2.mesh.position.set(2.2, 3.9, -0.3);
    root.add(j2.mesh);

    const j3 = this.primitives.createSphere(0.22);
    j3.mesh.position.set(4.4, 3.6, 0);
    root.add(j3.mesh);

    const bone = this.primitives.createCylinder(0.1, 2.2);
    bone.mesh.position.set(1.1, 4.05, -0.15);
    bone.mesh.rotation.z = (-82 * Math.PI) / 180;
    root.add(bone.mesh);

    this.scene.addObject(root, root.name);
    this.scene.focusOnObject(root);
    this.log(`[SUCCESS] Kinematic Chain '${name}' generated under |${name}_ROOT`, 'res');
    this.syncUi();
  }

  buildCeramicCoffeeMug() {
    const root = new THREE.Group();
    root.name = 'PROPS_COFFEE_MUG_ROOT';

    const bodyGeom = new THREE.CylinderGeometry(0.85, 0.75, 1.85, 32);
    const mugMat = new THREE.MeshStandardMaterial({ color: 0xf5f7fa, roughness: 0.15, metalness: 0.05 });
    const body = new THREE.Mesh(bodyGeom, mugMat);
    body.name = 'Mug_Ceramic_Body';
    body.position.set(0, 0.925, 0);
    root.add(body);

    const handleGeom = new THREE.TorusGeometry(0.48, 0.12, 16, 24);
    const handle = new THREE.Mesh(handleGeom, mugMat);
    handle.name = 'Mug_Ceramic_Handle';
    handle.position.set(0.88, 0.95, 0);
    handle.rotation.y = Math.PI / 2;
    root.add(handle);

    this.scene.addObject(root, root.name);
    this.scene.focusOnObject(root);
    this.log('[SUCCESS] Ceramic Coffee Mug generated under |PROPS_COFFEE_MUG_ROOT', 'res');
    this.syncUi();
  }

  buildCelestialPlanetSystem() {
    const root = new THREE.Group();
    root.name = 'COSMOS_PLANETARY_SYSTEM_ROOT';

    const planetGeom = new THREE.SphereGeometry(2.6, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({ color: 0xe0a96d, roughness: 0.6 });
    const planet = new THREE.Mesh(planetGeom, planetMat);
    planet.position.set(0, 2.6, 0);
    root.add(planet);

    const ringGeom = new THREE.TorusGeometry(5.2, 0.38, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xc8b69b, roughness: 0.5 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.set(0, 2.6, 0);
    ring.rotation.set((26 * Math.PI) / 180, 0, (18 * Math.PI) / 180);
    root.add(ring);

    this.scene.addObject(root, root.name);
    this.scene.focusOnObject(root);
    this.log('[SUCCESS] Celestial Planetary System generated under |COSMOS_PLANETARY_SYSTEM_ROOT', 'res');
    this.syncUi();
  }

  buildSpiralGalaxyCore() {
    const root = new THREE.Group();
    root.name = 'COSMOS_GALAXY_ROOT';

    const coreGeom = new THREE.SphereGeometry(1.2, 24, 24);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x4fc3f7, roughness: 0.2 });
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.position.set(0, 1.2, 0);
    root.add(core);

    const starGeom = new THREE.SphereGeometry(0.12, 8, 8);
    const starMat = new THREE.MeshStandardMaterial({ color: 0x80d8ff, emissive: 0x0091ea });

    for (let arm = 0; arm < 2; arm++) {
      const armOffset = arm * Math.PI;
      for (let i = 0; i < 24; i++) {
        const t = i / 24.0;
        const r = 1.4 + t * 7.5;
        const theta = armOffset + t * 4.2;
        const x = r * Math.cos(theta) + (Math.random() - 0.5) * 0.7;
        const z = r * Math.sin(theta) + (Math.random() - 0.5) * 0.7;
        const y = 1.2 + (Math.random() - 0.5) * 0.5;

        const star = new THREE.Mesh(starGeom, starMat);
        star.position.set(x, y, z);
        root.add(star);
      }
    }

    this.scene.addObject(root, root.name);
    this.scene.focusOnObject(root);
    this.log('[SUCCESS] Spiral Galaxy generated under |COSMOS_GALAXY_ROOT', 'res');
    this.syncUi();
  }

  // ==========================================================================
  // Execution Engine: Mock Maya cmds & Natural Language Auto-Route
  // ==========================================================================
  execute(customCode = null) {
    let code = customCode !== null ? customCode : this.inputEl.value.trim();
    if (!code) return;

    // 1. Natural Language Auto-Detection
    const isAiPrefixed = code.toLowerCase().startsWith('ai:') || code.toLowerCase().startsWith('ai ');
    const isNaturalLanguage = isAiPrefixed || (!code.includes('cmds.') && !code.includes('import ') && !code.includes('def ') && !code.includes('create_object') && !code.includes('//') && code.split('\n').length <= 2 && /^(create|make|build|generate|spawn|scatter|model|add|give me|put)\b/i.test(code));

    if (isNaturalLanguage) {
      const cleanPrompt = code.replace(/^(ai:|\sai\s)/i, '').trim();
      this.log(`cmds.ai("${cleanPrompt}")`, 'cmd');
      this.aiGenerateScript(cleanPrompt, true);
      return;
    }

    this.log(code, 'cmd');
    if (this.execStatus) this.execStatus.textContent = 'Executing...';

    try {
      // 2. High-Performance Procedural Blueprint Interceptors
      if (code.includes('build_spiral_staircase')) {
        const stepMatch = code.match(/num_steps\s*=\s*(\d+)/);
        const steps = stepMatch ? parseInt(stepMatch[1]) : 24;
        this.buildSpiralStaircase(steps);
        if (this.execStatus) this.execStatus.textContent = 'Success';
        return;
      }

      if (code.includes('build_radial_rotunda')) {
        this.buildRadialRotunda();
        if (this.execStatus) this.execStatus.textContent = 'Success';
        return;
      }

      if (code.includes('build_procedural_terrain')) {
        this.buildProceduralTerrain();
        if (this.execStatus) this.execStatus.textContent = 'Success';
        return;
      }

      if (code.includes('build_ecosystem_scatter')) {
        this.buildEcosystemScatter();
        if (this.execStatus) this.execStatus.textContent = 'Success';
        return;
      }

      if (code.includes('setup_arnold_pbr_shader') || code.includes('setup_arnold_shader_network')) {
        this.setupArnoldPbrShader(!code.toLowerCase().includes('glass'));
        if (this.execStatus) this.execStatus.textContent = 'Success';
        return;
      }

      if (code.includes('build_ik_joint_chain')) {
        this.buildIkJointChain();
        if (this.execStatus) this.execStatus.textContent = 'Success';
        return;
      }

      if (code.includes('build_ceramic_coffee_mug')) {
        this.buildCeramicCoffeeMug();
        if (this.execStatus) this.execStatus.textContent = 'Success';
        return;
      }

      if (code.includes('build_celestial_planet_system')) {
        this.buildCelestialPlanetSystem();
        if (this.execStatus) this.execStatus.textContent = 'Success';
        return;
      }

      if (code.includes('build_spiral_galaxy_core')) {
        this.buildSpiralGalaxyCore();
        if (this.execStatus) this.execStatus.textContent = 'Success';
        return;
      }

      if (code.includes('ENV_WORLD_ROOT') || code.includes('build_downtown') || code.includes('Los Santos')) {
        const existing = this.scene.objects.find(o => o.name === 'ENV_WORLD_ROOT' || o.name === 'ENV_LANDSCAPE_ROOT');
        if (existing) {
          this.scene.scene.remove(existing);
          this.scene.objects = this.scene.objects.filter(o => o !== existing);
        }
        const { mesh, name, propCount } = this.primitives.createDowntownCity();
        this.scene.addObject(mesh, name);
        this.scene.focusOnObject(mesh);
        this.log(`[SUCCESS] GTA V Los Santos Downtown Avenue generated under |ENV_WORLD_ROOT (${propCount} props, 4 high-rise towers)`, 'res');
        this.syncUi();
        if (this.execStatus) this.execStatus.textContent = 'Success';
        return;
      }

      if (code.includes('build_complete_landscape') || (code.includes('ENV_LANDSCAPE_ROOT') && code.includes('polyPlane'))) {
        const existing = this.scene.objects.find(o => o.name === 'ENV_LANDSCAPE_ROOT');
        if (existing) {
          this.scene.scene.remove(existing);
          this.scene.objects = this.scene.objects.filter(o => o !== existing);
        }
        const { mesh, name, propCount } = this.primitives.createLandscapeEnvironment();
        this.scene.addObject(mesh, name);
        this.scene.focusOnObject(mesh);
        this.log(`[SUCCESS] Landscape generated under |ENV_LANDSCAPE_ROOT (${propCount} instances)`, 'res');
        this.syncUi();
        if (this.execStatus) this.execStatus.textContent = 'Success';
        return;
      }

      // 3. Comprehensive Maya cmds runtime environment
      const cmds = {
        ai: (prompt) => {
          this.aiGenerateScript(prompt, true);
          return true;
        },
        ledger_synthesize: (itemId) => {
          if (!this.promptLedger) return false;
          const all = this.promptLedger.getAllItems();
          const target = all.find(i => i.id === itemId || i.name.toLowerCase().includes(itemId.toLowerCase()));
          if (target) {
            this.promptLedger.synthesizeObject(target);
            this.log(`[SUCCESS] Universal Ledger synthesized: ${target.name} [${target.scaleOrder}]`, 'res');
            this.syncUi();
            return target.id;
          }
          return false;
        },
        polyCube: (opts = {}) => {
          const w = opts.w || opts.width || 2;
          const { mesh, name } = this.primitives.createCube(w);
          if (opts.n || opts.name) mesh.name = opts.n || opts.name;
          this.scene.addObject(mesh, mesh.name);
          return [mesh.name];
        },
        polySphere: (opts = {}) => {
          const r = opts.r || opts.radius || 1.2;
          const { mesh, name } = this.primitives.createSphere(r);
          if (opts.n || opts.name) mesh.name = opts.n || opts.name;
          this.scene.addObject(mesh, mesh.name);
          return [mesh.name];
        },
        polyCylinder: (opts = {}) => {
          const r = opts.r || opts.radius || 1;
          const h = opts.h || opts.height || 2.5;
          const { mesh, name } = this.primitives.createCylinder(r, h);
          if (opts.n || opts.name) mesh.name = opts.n || opts.name;
          this.scene.addObject(mesh, mesh.name);
          return [mesh.name];
        },
        polyPlane: (opts = {}) => {
          const s = opts.s || opts.size || opts.w || 8;
          const { mesh, name } = this.primitives.createPlane(s);
          if (opts.n || opts.name) mesh.name = opts.n || opts.name;
          this.scene.addObject(mesh, mesh.name);
          return [mesh.name];
        },
        polyTorus: (opts = {}) => {
          const r = opts.r || opts.radius || 1.2;
          const sr = opts.sr || opts.sectionRadius || 0.3;
          const { mesh, name } = this.primitives.createTorus(r, sr);
          if (opts.n || opts.name) mesh.name = opts.n || opts.name;
          this.scene.addObject(mesh, mesh.name);
          return [mesh.name];
        },
        polyCone: (opts = {}) => {
          const r = opts.r || opts.radius || 1.0;
          const h = opts.h || opts.height || 2.5;
          const { mesh, name } = this.primitives.createCone ? this.primitives.createCone(r, h) : this.primitives.createCylinder(r, h);
          if (opts.n || opts.name) mesh.name = opts.n || opts.name;
          this.scene.addObject(mesh, mesh.name);
          return [mesh.name];
        },
        polyDodecahedron: (opts = {}) => {
          const r = opts.r || opts.radius || 1.2;
          const { mesh, name } = this.primitives.createDodecahedron(r);
          if (opts.n || opts.name) mesh.name = opts.n || opts.name;
          this.scene.addObject(mesh, mesh.name);
          return [mesh.name];
        },
        group: (opts = {}) => {
          const grpName = (typeof opts === 'object' ? (opts.name || opts.n) : opts) || 'group1';
          const grp = new THREE.Group();
          grp.name = grpName;
          this.scene.addObject(grp, grpName);
          return grpName;
        },
        parent: (child, parent) => {
          const childObj = typeof child === 'string' ? this.scene.objects.find(o => o.name === child) : child;
          const parentObj = typeof parent === 'string' ? this.scene.objects.find(o => o.name === parent) : parent;
          if (childObj && parentObj) {
            parentObj.add(childObj);
          }
          return child;
        },
        xform: (target, opts = {}) => {
          const obj = typeof target === 'string' ? this.scene.objects.find(o => o.name === target) : target;
          if (obj) {
            if (opts.translation || opts.t) {
              const [x, y, z] = opts.translation || opts.t;
              obj.position.set(x, y, z);
            }
            if (opts.rotation || opts.ro) {
              const [rx, ry, rz] = opts.rotation || opts.ro;
              obj.rotation.set((rx * Math.PI) / 180, (ry * Math.PI) / 180, (rz * Math.PI) / 180);
            }
            if (opts.scale || opts.s) {
              const [sx, sy, sz] = opts.scale || opts.s;
              obj.scale.set(sx, sy, sz);
            }
          }
          return true;
        },
        move: (x = 0, y = 0, z = 0, target = null) => {
          const obj = target ? this.scene.objects.find(o => o.name === target) : this.scene.selectedObject;
          if (obj) obj.position.set(x, y, z);
        },
        rotate: (x = 0, y = 0, z = 0, target = null) => {
          const obj = target ? this.scene.objects.find(o => o.name === target) : this.scene.selectedObject;
          if (obj) obj.rotation.set((x * Math.PI) / 180, (y * Math.PI) / 180, (z * Math.PI) / 180);
        },
        scale: (x = 1, y = 1, z = 1, target = null) => {
          const obj = target ? this.scene.objects.find(o => o.name === target) : this.scene.selectedObject;
          if (obj) obj.scale.set(x, y, z);
        },
        select: (target, opts = {}) => {
          if (opts.clear) {
            this.scene.selectObject(null);
            return;
          }
          if (target && this.scene.objects) {
            const match = this.scene.objects.find(o => o.name === target || (Array.isArray(target) && target.includes(o.name)));
            if (match) this.scene.selectObject(match);
          }
        },
        viewFit: () => {
          if (this.scene.selectedObject) {
            this.scene.focusOnObject(this.scene.selectedObject);
          }
        },
        duplicate: () => {
          this.scene.duplicateSelected();
          this.syncUi();
        },
        delete: (target = null) => {
          if (target) {
            const obj = this.scene.objects.find(o => o.name === target);
            if (obj) {
              this.scene.scene.remove(obj);
              this.scene.objects = this.scene.objects.filter(o => o !== obj);
            }
          } else {
            this.scene.deleteSelected();
          }
          this.syncUi();
        },
        shadingNode: (nodeType, opts = {}) => (opts && (opts.name || opts.n)) || `${nodeType}1`,
        sets: (target, opts = {}) => (opts && (opts.name || opts.n)) || 'shadingGroup1',
        setAttr: (attr, ...args) => true,
        connectAttr: (src, dst) => true,
        refresh: (opts = {}) => true,
        directionalLight: () => 'sun_directional_light',
        ambientLight: () => 'sky_ambient_light',
        camera: () => ['hero_framing_camera', 'hero_framing_cameraShape'],
        polyEvaluate: () => 2400
      };

      // 4. Fallback execution: Transpile simple Python statements to JS
      const transpiled = this.transpilePythonToJs(code);
      const runner = new Function('cmds', 'THREE', 'Math', transpiled);
      runner(cmds, THREE, Math);

      this.log('Script executed successfully.', 'res');
      if (this.execStatus) this.execStatus.textContent = 'Success';
      this.syncUi();
    } catch (err) {
      this.log(`Error: ${err.message}`, 'error');
      if (this.execStatus) this.execStatus.textContent = 'Error';
    }
  }

  // Lightweight Python -> JS Transpiler for custom cmds calls
  transpilePythonToJs(pyCode) {
    const lines = pyCode.split('\n');
    const jsLines = [];

    for (let rawLine of lines) {
      let line = rawLine;

      // Handle comment lines
      const commentIdx = line.indexOf('#');
      let comment = '';
      if (commentIdx !== -1) {
        comment = '//' + line.slice(commentIdx + 1);
        line = line.slice(0, commentIdx);
      }

      line = line.trim();
      if (!line) {
        if (comment) jsLines.push(comment);
        continue;
      }

      // Skip import statements
      if (line.startsWith('import ') || line.startsWith('from ')) {
        jsLines.push(`// ${line}`);
        continue;
      }

      // Convert True, False, None
      line = line.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');

      // Convert print
      line = line.replace(/\bprint\((.*)\)/g, 'cmds.log($1)');

      // Convert cmds calls with keyword args: cmds.func(k1=v1, k2=v2) -> cmds.func({k1: v1, k2: v2})
      line = line.replace(/cmds\.([a-zA-Z0-9_]+)\((.*=.*)\)/g, (match, fn, args) => {
        const parts = args.split(',').map(p => {
          if (p.includes('=')) {
            const [k, v] = p.split('=');
            return `${k.trim()}: ${v.trim()}`;
          }
          return p;
        });
        return `cmds.${fn}({ ${parts.join(', ')} })`;
      });

      // Add semicolon if not ending with one or brace
      if (!line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}')) {
        line += ';';
      }

      jsLines.push(line + (comment ? ' ' + comment : ''));
    }

    return jsLines.join('\n');
  }

  syncUi() {
    if (this.outliner) this.outliner.render();
    if (this.channelBox) this.channelBox.render();
  }

  open() {
    this.modal.classList.add('open');
    if (this.aiPromptInput) this.aiPromptInput.focus();
    else if (this.inputEl) this.inputEl.focus();
  }

  close() {
    this.modal.classList.remove('open');
  }
}
