export class MayaScriptEditor {
  constructor(modalEl, mayaScene, primitivesLib) {
    this.modal = modalEl;
    this.scene = mayaScene;
    this.primitives = primitivesLib;
    this.history = [
      '// Autodesk Maya 2026 Script Editor',
      '// Jwala AI Python & MEL Engine Initialized',
      'import maya.cmds as cmds'
    ];
    this.init();
  }

  init() {
    this.modal.innerHTML = `
      <div class="maya-script-window">
        <div class="maya-panel-titlebar">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>Script Editor</span>
            <span style="font-size: 10px; color: var(--maya-cyan);">[MEL / Python 3.11]</span>
          </div>
          <button id="script-close-btn" style="color: var(--maya-text-muted);">✕</button>
        </div>

        <!-- History Output Console -->
        <div class="maya-script-history" id="script-history-log"></div>

        <!-- Code Input Area -->
        <div class="maya-script-input-area">
          <div style="height: 24px; background: #222; display: flex; align-items: center; padding: 0 8px; gap: 8px; font-size: 11px;">
            <span style="color: var(--maya-cyan); font-weight: 700;">Python</span>
            <span style="color: var(--maya-text-muted); font-size: 10px;">(Press Ctrl+Enter to Execute)</span>
          </div>
          <textarea id="script-code-input" spellcheck="false" placeholder="# Write Maya Python commands here:&#10;cmds.polyCube(w=2, h=2, d=2)&#10;cmds.move(0, 4, 0)"># Create a poly sphere and elevate it
cube = cmds.polyCube(w=2, h=2, d=2)
cmds.move(0, 2, 0)
</textarea>
        </div>

        <!-- Bottom Action Bar -->
        <div class="maya-script-actions">
          <button id="script-clear-btn" style="color: var(--maya-text-muted);">Clear History</button>
          <div style="display: flex; gap: 8px;">
            <button class="maya-play-btn" id="script-execute-btn" style="width: auto; padding: 4px 14px; background: var(--maya-cyan); color: #000; font-weight: 700;">
              Execute (Ctrl+Enter)
            </button>
          </div>
        </div>
      </div>
    `;

    this.historyEl = this.modal.querySelector('#script-history-log');
    this.inputEl = this.modal.querySelector('#script-code-input');
    this.closeBtn = this.modal.querySelector('#script-close-btn');
    this.execBtn = this.modal.querySelector('#script-execute-btn');
    this.clearBtn = this.modal.querySelector('#script-clear-btn');

    this.renderHistory();

    this.closeBtn.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    this.execBtn.addEventListener('click', () => this.execute());
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.execute();
      }
    });

    this.clearBtn.addEventListener('click', () => {
      this.history = ['// History cleared'];
      this.renderHistory();
    });
  }

  log(msg, type = 'info') {
    const prefix = type === 'cmd' ? 'cmds: ' : type === 'res' ? '// Result: ' : '// ';
    this.history.push(prefix + msg);
    this.renderHistory();
  }

  renderHistory() {
    if (!this.historyEl) return;
    this.historyEl.innerHTML = this.history.map(line => `<div>${line}</div>`).join('');
    this.historyEl.scrollTop = this.historyEl.scrollHeight;
  }

  execute(customCode = null) {
    const code = customCode !== null ? customCode : this.inputEl.value.trim();
    if (!code) return;

    this.log(code, 'cmd');

    try {
      // Mock Maya cmds execution engine
      const cmds = {
        polyCube: (opts = {}) => {
          const w = opts.w || opts.width || 2;
          const { mesh, name } = this.primitives.createCube(w);
          this.scene.addObject(mesh, name);
          return name;
        },
        polySphere: (opts = {}) => {
          const r = opts.r || opts.radius || 1.2;
          const { mesh, name } = this.primitives.createSphere(r);
          this.scene.addObject(mesh, name);
          return name;
        },
        polyCylinder: (opts = {}) => {
          const r = opts.r || 1;
          const h = opts.h || 2.5;
          const { mesh, name } = this.primitives.createCylinder(r, h);
          this.scene.addObject(mesh, name);
          return name;
        },
        polyPlane: (opts = {}) => {
          const s = opts.s || opts.size || 8;
          const { mesh, name } = this.primitives.createPlane(s);
          this.scene.addObject(mesh, name);
          return name;
        },
        polyTorus: () => {
          const { mesh, name } = this.primitives.createTorus();
          this.scene.addObject(mesh, name);
          return name;
        },
        move: (x = 0, y = 0, z = 0) => {
          if (this.scene.selectedObject) {
            this.scene.selectedObject.position.set(x, y, z);
          }
        },
        rotate: (x = 0, y = 0, z = 0) => {
          if (this.scene.selectedObject) {
            this.scene.selectedObject.rotation.set((x * Math.PI) / 180, (y * Math.PI) / 180, (z * Math.PI) / 180);
          }
        },
        scale: (x = 1, y = 1, z = 1) => {
          if (this.scene.selectedObject) {
            this.scene.selectedObject.scale.set(x, y, z);
          }
        },
        delete: () => {
          this.scene.deleteSelected();
        }
      };

      // Safe evaluation
      const runner = new Function('cmds', code);
      runner(cmds);
      this.log('Script executed successfully.', 'res');
    } catch (err) {
      this.log(`Error: ${err.message}`, 'error');
    }
  }

  open() {
    this.modal.classList.add('open');
    this.inputEl.focus();
  }

  close() {
    this.modal.classList.remove('open');
  }
}
