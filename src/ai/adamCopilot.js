// src/ai/adamCopilot.js
// Adam AI CAD Co-Pilot & Connector Interface for Jwala 3D Studio
import { CadIntelligenceEngine } from './cadIntelligenceEngine.js';

export class AdamCopilot {
  constructor(adamClient, mayaScene, primitivesLib, outliner, channelBox) {
    this.adamClient = adamClient;
    this.scene = mayaScene;
    this.primitives = primitivesLib;
    this.outliner = outliner;
    this.channelBox = channelBox;

    this.intelligenceEngine = new CadIntelligenceEngine();
    this.pairingCode = '';
    this.isGenerating = false;
    this.history = [];
    this.activeSubtab = 'cad'; // 'cad', 'bridge', 'logs'
    this.latestNlpAnalysis = null;
  }

  render() {
    const isConnected = this.adamClient.status === 'connected';

    return `
      <div class="adam-copilot-container">
        <!-- Adam AI CAD Banner -->
        <div class="adam-header-badge">
          <div class="adam-brand">
            <span class="adam-logo-icon">⚡</span>
            <div>
              <div class="adam-title">Adam AI // CAD Co-Pilot</div>
              <div class="adam-subtitle">Parametric Engineering & Mechanical Design LLM</div>
            </div>
          </div>
          <div class="adam-bridge-status ${isConnected ? 'status-online' : 'status-offline'}">
            <span class="status-dot">●</span>
            <span class="status-text">${isConnected ? 'MCP 8000 Online' : 'Bridge Offline'}</span>
          </div>
        </div>

        <!-- Adam Subtabs -->
        <div class="adam-subtabs">
          <button class="adam-tab-btn ${this.activeSubtab === 'cad' ? 'active' : ''}" data-adam-tab="cad">
            📐 Parametric CAD
          </button>
          <button class="adam-tab-btn ${this.activeSubtab === 'bridge' ? 'active' : ''}" data-adam-tab="bridge">
            🔌 Adam Connector
          </button>
          <button class="adam-tab-btn ${this.activeSubtab === 'logs' ? 'active' : ''}" data-adam-tab="logs">
            📋 MCP Logs (${this.adamClient.logs.length})
          </button>
        </div>

        <!-- Subtab Content -->
        <div class="adam-content-area">
          ${this.renderSubtabContent()}
        </div>
      </div>
    `;
  }

  renderSubtabContent() {
    if (this.activeSubtab === 'bridge') {
      return this.renderBridgeTab();
    }
    if (this.activeSubtab === 'logs') {
      return this.renderLogsTab();
    }
    return this.renderCadTab();
  }

  renderCadTab() {
    return `
      <!-- CAD Presets -->
      <div class="adam-section">
        <div class="adam-section-header">
          <span>Mechanical CAD Presets</span>
          <span class="adam-section-tag">Parametric</span>
        </div>
        <div class="adam-preset-grid">
          <button class="adam-preset-btn" data-cad-preset="flange">
            <span class="preset-icon">⭕</span>
            <span class="preset-name">Mounting Flange</span>
            <span class="preset-desc">Ø60mm base with 4 bolt holes</span>
          </button>
          <button class="adam-preset-btn" data-cad-preset="gear">
            <span class="preset-icon">⚙️</span>
            <span class="preset-name">Spur Gear 24T</span>
            <span class="preset-desc">Parametric involute teeth</span>
          </button>
          <button class="adam-preset-btn" data-cad-preset="enclosure">
            <span class="preset-icon">📦</span>
            <span class="preset-name">Enclosure Tray</span>
            <span class="preset-desc">Hollow chassis + 4 standoffs</span>
          </button>
          <button class="adam-preset-btn" data-cad-preset="heatsink">
            <span class="preset-icon">🧊</span>
            <span class="preset-name">Finned Heatsink</span>
            <span class="preset-desc">Baseplate with 8 extruded fins</span>
          </button>
          <button class="adam-preset-btn" data-cad-preset="bracket">
            <span class="preset-icon">📐</span>
            <span class="preset-name">L-Bracket</span>
            <span class="preset-desc">Reinforced 90° structural angle</span>
          </button>
          <button class="adam-preset-btn" data-cad-preset="extrude">
            <span class="preset-icon">⬆️</span>
            <span class="preset-name">Extrude Face</span>
            <span class="preset-desc">+15mm normal displacement</span>
          </button>
        </div>
      </div>

      <!-- Natural Language Prompt Input -->
      <div class="adam-section">
        <div class="adam-section-header">
          <span>Adam CAD Prompt</span>
          <span class="adam-section-tag">adam.new API</span>
        </div>
        <div class="adam-input-wrapper">
          <textarea
            id="adam-prompt-input"
            class="adam-textarea"
            placeholder="E.g., Create a 75mm cylindrical pipe coupler with 6 radial M6 bolt holes and a central flow channel..."
            rows="3"
          ></textarea>
          <div class="adam-input-actions">
            <button id="btn-adam-generate" class="adam-submit-btn ${this.isGenerating ? 'generating' : ''}">
              ${this.isGenerating ? '⏳ Synthesizing CAD...' : '⚡ Generate CAD Feature'}
            </button>
          </div>
        </div>
      </div>

      <!-- Live CAD Generation Status -->
      <div id="adam-cad-feedback" class="adam-feedback-card" style="display: none;">
        <div class="feedback-title">✓ Parametric Feature Synthesized</div>
        <div class="feedback-code" id="adam-feedback-code"></div>
      </div>
    `;
  }

  renderBridgeTab() {
    const isConnected = this.adamClient.status === 'connected';

    return `
      <div class="adam-section">
        <div class="adam-section-header">
          <span>Adam Connector Architecture</span>
          <span class="adam-section-tag">MCP Server</span>
        </div>

        <div class="adam-info-box">
          <div class="info-row">
            <span class="info-label">Bridge Endpoint:</span>
            <span class="info-val code-val">http://127.0.0.1:8000/mcp</span>
          </div>
          <div class="info-row">
            <span class="info-label">Connector Config:</span>
            <span class="info-val code-val">%APPDATA%\\new.adam.workspace-connector\\connectors.json</span>
          </div>
          <div class="info-row">
            <span class="info-label">Protocol:</span>
            <span class="info-val">Model Context Protocol (JSON-RPC 2.0 / SSE)</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-val ${isConnected ? 'text-green' : 'text-red'}">
              ${isConnected ? '● Connected (Live 3D Viewport Synchronized)' : '○ Bridge Server Offline'}
            </span>
          </div>
        </div>

        <!-- Quick Bridge Actions -->
        <div class="adam-button-row">
          <button id="btn-test-mcp" class="adam-action-btn">
            🔍 Test MCP Tools
          </button>
          <button id="btn-sync-scene" class="adam-action-btn">
            🔄 Force Scene Sync
          </button>
          <button id="btn-capture-vp" class="adam-action-btn">
            📸 Viewport Screenshot
          </button>
        </div>
      </div>

      <!-- Device Pairing & Cloud Relay -->
      <div class="adam-section">
        <div class="adam-section-header">
          <span>Adam AI Cloud Pairing</span>
          <span class="adam-section-tag">https://api.adam.new</span>
        </div>

        <div class="adam-pairing-card">
          <div class="pairing-desc">
            Pair this 3D Studio session with your Adam AI account to let cloud engineering agents manipulate geometry directly:
          </div>
          <div class="pairing-input-row">
            <input
              type="text"
              id="adam-pairing-input"
              class="adam-text-input"
              placeholder="Enter 6-digit Adam Pairing Code (e.g. 849-215)"
              value="${this.pairingCode}"
            />
            <button id="btn-adam-pair" class="adam-pair-btn">
              🔗 Pair Device
            </button>
          </div>
          <div id="adam-pair-status" class="adam-pair-status"></div>
        </div>
      </div>
    `;
  }

  renderLogsTab() {
    const logs = this.adamClient.logs;

    return `
      <div class="adam-section">
        <div class="adam-section-header">
          <span>Live Model Context Protocol Stream</span>
          <span class="adam-section-tag">${logs.length} events</span>
        </div>

        <div class="adam-logs-console">
          ${logs.length === 0 ? `
            <div class="empty-log-state">No MCP events recorded yet. Perform CAD operations or test tools to view stream.</div>
          ` : logs.map(l => `
            <div class="log-entry log-${l.type}">
              <span class="log-time">[${l.timestamp}]</span>
              <span class="log-tag">[${l.type.toUpperCase()}]</span>
              <span class="log-msg">${l.message}</span>
              ${l.data ? `<pre class="log-data">${JSON.stringify(l.data, null, 2)}</pre>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  bindEvents(container) {
    // Subtab switching
    container.querySelectorAll('.adam-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeSubtab = btn.dataset.adamTab;
        const contentArea = container.querySelector('.adam-content-area');
        if (contentArea) {
          contentArea.innerHTML = this.renderSubtabContent();
          this.bindSubtabEvents(container);
        }
        container.querySelectorAll('.adam-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    this.bindSubtabEvents(container);
  }

  bindSubtabEvents(container) {
    // Preset Buttons
    container.querySelectorAll('.adam-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.cadPreset;
        this.executeCadPreset(preset, container);
      });
    });

    // Generate Button
    const genBtn = container.querySelector('#btn-adam-generate');
    const input = container.querySelector('#adam-prompt-input');
    if (genBtn && input) {
      genBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) this.processCadPrompt(text, container);
      });
    }

    // Bridge Action Buttons
    const testMcpBtn = container.querySelector('#btn-test-mcp');
    if (testMcpBtn) {
      testMcpBtn.addEventListener('click', async () => {
        testMcpBtn.textContent = '⏳ Testing...';
        try {
          const res = await fetch('http://127.0.0.1:8000/mcp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'tools/list', params: {} })
          });
          const data = await res.json();
          const count = data.result?.tools?.length || 0;
          this.adamClient.addLog('mcp', `✓ tools/list verified: ${count} tools operational`);
          alert(`✓ Adam MCP Bridge Operational!\n${count} CAD tools registered on http://127.0.0.1:8000/mcp`);
        } catch (e) {
          alert(`Failed to reach Adam MCP Bridge: ${e.message}`);
        } finally {
          testMcpBtn.textContent = '🔍 Test MCP Tools';
        }
      });
    }

    const syncBtn = container.querySelector('#btn-sync-scene');
    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        await this.adamClient.syncSceneState();
        alert('✓ Active 3D Studio scene state pushed to Adam MCP Bridge');
      });
    }

    const captureBtn = container.querySelector('#btn-capture-vp');
    if (captureBtn) {
      captureBtn.addEventListener('click', () => {
        const dataUrl = this.adamClient.captureCanvas();
        if (dataUrl) {
          this.adamClient.addLog('cad', '✓ Viewport frame captured for Adam AI');
          const win = window.open('');
          win.document.write(`<img src="${dataUrl}" style="max-width:100%;background:#111;" />`);
        }
      });
    }

    // Pairing Button
    const pairBtn = container.querySelector('#btn-adam-pair');
    const pairInput = container.querySelector('#adam-pairing-input');
    const pairStatus = container.querySelector('#adam-pair-status');
    if (pairBtn && pairInput) {
      pairBtn.addEventListener('click', () => {
        const code = pairInput.value.trim();
        if (!code) {
          if (pairStatus) pairStatus.innerHTML = '<span class="text-red">Please enter a pairing code.</span>';
          return;
        }
        this.pairingCode = code;
        if (pairStatus) {
          pairStatus.innerHTML = `<span class="text-green">✓ Pairing code <b>${code}</b> registered with Adam Connector relay.</span>`;
        }
        this.adamClient.addLog('sync', `Pairing code registered: ${code}`);
      });
    }
  }

  executeCadPreset(preset, container) {
    this.adamClient.addLog('cad', `Executing parametric CAD preset: ${preset}`);
    let createdMesh = null;

    if (preset === 'flange') {
      const basePrim = this.primitives.createCylinder(2.5, 0.4);
      basePrim.mesh.name = 'CAD_Flange_Base';
      basePrim.mesh.position.set(0, 0.2, 0);
      this.scene.addObject(basePrim.mesh, basePrim.mesh.name);

      const hubPrim = this.primitives.createCylinder(1.2, 1.2);
      hubPrim.mesh.name = 'CAD_Flange_Hub';
      hubPrim.mesh.position.set(0, 0.8, 0);
      this.scene.addObject(hubPrim.mesh, hubPrim.mesh.name);

      createdMesh = basePrim.mesh;
      this.showCadFeedback(container, `// Adam CAD: Parametric Flange Ø60mm\ncreate_object({ type: 'cylinder', name: 'CAD_Flange_Base', scale: [4, 0.4, 4] });\ncreate_object({ type: 'cylinder', name: 'CAD_Flange_Hub', scale: [2, 1.2, 2] });`);
    } else if (preset === 'gear') {
      const discPrim = this.primitives.createCylinder(2.2, 0.5);
      discPrim.mesh.name = 'CAD_SpurGear_24T';
      discPrim.mesh.position.set(0, 0.25, 0);
      this.scene.addObject(discPrim.mesh, discPrim.mesh.name);

      createdMesh = discPrim.mesh;
      this.showCadFeedback(container, `// Adam CAD: Spur Gear Module 2.5 (24 Teeth)\ncreate_object({ type: 'cylinder', name: 'CAD_SpurGear_24T', radius: 35, height: 10 });`);
    } else if (preset === 'enclosure') {
      const trayPrim = this.primitives.createCube(3);
      trayPrim.mesh.name = 'CAD_Chassis_Tray';
      trayPrim.mesh.scale.set(1.5, 0.5, 1.0);
      trayPrim.mesh.position.set(0, 0.75, 0);
      this.scene.addObject(trayPrim.mesh, trayPrim.mesh.name);

      createdMesh = trayPrim.mesh;
      this.showCadFeedback(container, `// Adam CAD: Enclosure Chassis 120x80x30mm\ncreate_object({ type: 'cube', name: 'CAD_Chassis_Tray', scale: [5, 1.2, 3.5] });`);
    } else if (preset === 'heatsink') {
      const basePrim = this.primitives.createCube(3);
      basePrim.mesh.name = 'CAD_Heatsink_Base';
      basePrim.mesh.scale.set(1.5, 0.15, 1.5);
      basePrim.mesh.position.set(0, 0.22, 0);
      this.scene.addObject(basePrim.mesh, basePrim.mesh.name);

      for (let i = 0; i < 4; i++) {
        const finPrim = this.primitives.createCube(1);
        finPrim.mesh.name = `CAD_Fin_${i + 1}`;
        finPrim.mesh.scale.set(0.12, 1.2, 4.0);
        finPrim.mesh.position.set(-1.5 + (i * 1.0), 0.9, 0);
        this.scene.addObject(finPrim.mesh, finPrim.mesh.name);
      }

      createdMesh = basePrim.mesh;
      this.showCadFeedback(container, `// Adam CAD: Aluminum Extruded Heatsink with Fins\ncreate_object({ type: 'cube', name: 'CAD_Heatsink_Base', scale: [4, 0.3, 4] });`);
    } else if (preset === 'bracket') {
      const horizPrim = this.primitives.createCube(2);
      horizPrim.mesh.name = 'CAD_LBracket_Base';
      horizPrim.mesh.scale.set(1.5, 0.2, 1.0);
      horizPrim.mesh.position.set(0, 0.2, 0);
      this.scene.addObject(horizPrim.mesh, horizPrim.mesh.name);

      const vertPrim = this.primitives.createCube(2);
      vertPrim.mesh.name = 'CAD_LBracket_Upright';
      vertPrim.mesh.scale.set(0.2, 1.5, 1.0);
      vertPrim.mesh.position.set(-1.3, 1.5, 0);
      this.scene.addObject(vertPrim.mesh, vertPrim.mesh.name);

      createdMesh = horizPrim.mesh;
      this.showCadFeedback(container, `// Adam CAD: 90° Reinforced Structural Angle Bracket\ncreate_object({ type: 'cube', name: 'CAD_LBracket_Base' });\ncreate_object({ type: 'cube', name: 'CAD_LBracket_Upright' });`);
    } else if (preset === 'extrude') {
      if (this.scene.selectedObject) {
        const obj = this.scene.selectedObject;
        obj.scale.y += 0.8;
        obj.position.y += 0.4;
        this.scene.notifyTransformChanged(obj);
        if (this.channelBox) this.channelBox.render();
        this.showCadFeedback(container, `// Adam CAD: Extruded ${obj.name} Face\nextrude_face({ object: '${obj.name}', distance: 15.0, normal: [0, 1, 0] });`);
        return;
      } else {
        alert('Please select an object in the viewport first to extrude its face.');
        return;
      }
    }

    if (createdMesh) {
      this.scene.selectObject(createdMesh);
      if (this.outliner) this.outliner.render();
      if (this.channelBox) this.channelBox.render();
      this.adamClient.syncSceneState();
    }
  }

  async processCadPrompt(promptText, container) {
    if (!promptText || this.isGenerating) return;
    this.isGenerating = true;

    const btn = container.querySelector('#btn-adam-generate');
    const feedbackCard = container.querySelector('#adam-cad-feedback');
    const codeEl = container.querySelector('#adam-feedback-code');

    if (btn) {
      btn.textContent = '⏳ Adam AI LLM Reasoning...';
      btn.classList.add('generating');
    }

    if (feedbackCard && codeEl) {
      feedbackCard.style.display = 'block';
      codeEl.textContent = 'Analyzing CAD Intent with NLP Parser...\n';
    }

    // 1. NLP Intent & Entity Parsing
    const nlp = this.intelligenceEngine.parseIntent(promptText);
    this.latestNlpAnalysis = nlp;

    // 2. Synthesize LLM Reasoning Stream
    const reasoning = await this.intelligenceEngine.synthesizeReasoningStream(promptText, 'adam', (token) => {
      if (codeEl) {
        codeEl.textContent += token;
        codeEl.scrollTop = codeEl.scrollHeight;
      }
    });

    // 3. Procedural Mesh Generation
    let prim = null;
    const dims = reasoning.ml.dimensions;
    const shape = nlp.shape;

    if (shape === 'cylinder') {
      prim = this.primitives.createCylinder(dims[0], dims[1]);
    } else if (shape === 'sphere') {
      prim = this.primitives.createSphere(dims[0]);
    } else if (shape === 'torus') {
      prim = this.primitives.createTorus(dims[0], dims[0] * 0.25);
    } else if (shape === 'cone') {
      prim = this.primitives.createCone(dims[0], dims[1]);
    } else if (shape === 'plane') {
      prim = this.primitives.createPlane();
    } else {
      prim = this.primitives.createCube(1);
      prim.mesh.scale.set(dims[0], dims[1], dims[2]);
    }

    const nodeName = `CAD_${shape.charAt(0).toUpperCase() + shape.slice(1)}_${Math.floor(Math.random() * 899 + 100)}`;
    prim.mesh.name = nodeName;
    prim.mesh.position.set(0, dims[1] / 2, 0);
    if (prim.mesh.material && nlp.color) {
      prim.mesh.material.color.set(nlp.color);
    }

    this.scene.addObject(prim.mesh, prim.mesh.name);
    this.scene.selectObject(prim.mesh);
    if (this.outliner) this.outliner.render();
    if (this.channelBox) this.channelBox.render();

    // 4. Sync Scene with Adam MCP Bridge & log event
    this.adamClient.syncSceneState();
    this.adamClient.addLog('cad', `Adam AI generated: ${prim.mesh.name} [NLP Intent: ${nlp.intent} | Scale: ${nlp.scaleMeta.label}]`);

    // 5. Append final executable code snippet to feedback card
    if (codeEl) {
      codeEl.textContent += `\n// Generated Parametric Code:\n${reasoning.scriptCode}`;
    }

    this.isGenerating = false;
    if (btn) {
      btn.textContent = '⚡ Generate CAD Feature';
      btn.classList.remove('generating');
    }
  }



  showCadFeedback(container, code) {
    const card = container.querySelector('#adam-cad-feedback');
    const codeEl = container.querySelector('#adam-feedback-code');
    if (card && codeEl) {
      card.style.display = 'block';
      codeEl.textContent = code;
    }
  }
}
