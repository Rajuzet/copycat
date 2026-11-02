/**
 * CanvasCord Figma Design Inspector, Properties & CSS Code Generator
 */

export class PropertiesPanel {
  constructor(container, engine, onUpdate) {
    this.container = container;
    this.engine = engine;
    this.onUpdate = onUpdate || (() => {});
    this.activeTab = 'design'; // 'design' | 'code' | 'export'
  }

  render() {
    if (!this.container) return;

    const selectedIds = Array.from(this.engine.selectedIds);
    if (selectedIds.length === 0) {
      this.container.innerHTML = `
        <div class="empty-properties-state">
          <div class="empty-icon">📐</div>
          <div class="empty-title">No Selection</div>
          <div class="empty-desc">Select an element on canvas to adjust its geometry, fill, stroke, typography and CSS code.</div>
          
          <div class="canvas-global-settings">
            <div class="prop-section-title">Canvas Settings</div>
            <div class="prop-row">
              <span class="prop-label">Zoom Level</span>
              <span class="prop-value-badge">${Math.round(this.engine.viewport.zoom * 100)}%</span>
            </div>
            <div class="prop-row">
              <span class="prop-label">Total Elements</span>
              <span class="prop-value-badge">${this.engine.elements.length}</span>
            </div>
            <button class="fit-btn" id="btn-fit-screen">Fit All to Screen</button>
          </div>
        </div>
      `;

      const fitBtn = this.container.querySelector('#btn-fit-screen');
      if (fitBtn) {
        fitBtn.addEventListener('click', () => this.engine.fitToScreen());
      }
      return;
    }

    const primaryEl = this.engine.elements.find(i => i.id === selectedIds[0]);
    if (!primaryEl) return;

    this.container.innerHTML = `
      <div class="props-tabs-header">
        <button class="prop-tab-btn ${this.activeTab === 'design' ? 'active' : ''}" data-tab="design">Design</button>
        <button class="prop-tab-btn ${this.activeTab === 'code' ? 'active' : ''}" data-tab="code">CSS & Code</button>
        <button class="prop-tab-btn ${this.activeTab === 'export' ? 'active' : ''}" data-tab="export">Export</button>
      </div>

      <div class="props-tab-content">
        ${this.activeTab === 'design' ? this.renderDesignTab(primaryEl) : ''}
        ${this.activeTab === 'code' ? this.renderCodeTab(primaryEl) : ''}
        ${this.activeTab === 'export' ? this.renderExportTab(primaryEl) : ''}
      </div>
    `;

    this.bindTabEvents(primaryEl);
  }

  renderDesignTab(el) {
    return `
      <!-- Alignment Toolbar -->
      <div class="align-toolbar">
        <button class="align-btn" data-align="left" title="Align Left">⇤</button>
        <button class="align-btn" data-align="center-h" title="Align Horizontal Centers">⇥⇤</button>
        <button class="align-btn" data-align="right" title="Align Right">⇥</button>
        <button class="align-btn" data-align="top" title="Align Top">⤒</button>
        <button class="align-btn" data-align="center-v" title="Align Vertical Centers">⤓⤒</button>
        <button class="align-btn" data-align="bottom" title="Align Bottom">⤓</button>
      </div>

      <!-- Geometry -->
      <div class="prop-section">
        <div class="prop-section-title">Geometry</div>
        <div class="prop-grid-2">
          <div class="input-field-group">
            <label>X</label>
            <input type="number" id="prop-x" value="${Math.round(el.x)}" />
          </div>
          <div class="input-field-group">
            <label>Y</label>
            <input type="number" id="prop-y" value="${Math.round(el.y)}" />
          </div>
          <div class="input-field-group">
            <label>W</label>
            <input type="number" id="prop-w" value="${Math.round(el.width)}" />
          </div>
          <div class="input-field-group">
            <label>H</label>
            <input type="number" id="prop-h" value="${Math.round(el.height)}" />
          </div>
          <div class="input-field-group">
            <label>∠</label>
            <input type="number" id="prop-rot" value="${el.rotation || 0}" />
          </div>
          <div class="input-field-group">
            <label>⌒</label>
            <input type="number" id="prop-radius" value="${el.cornerRadius || 0}" />
          </div>
        </div>
      </div>

      <!-- Fill -->
      <div class="prop-section">
        <div class="prop-section-title">Fill</div>
        <div class="color-picker-row">
          <input type="color" id="prop-fill-color" value="${this.sanitizeColor(el.fill)}" />
          <input type="text" id="prop-fill-hex" value="${el.fill || '#5865F2'}" class="hex-input" />
          <input type="range" id="prop-opacity" min="0" max="1" step="0.05" value="${el.opacity ?? 1}" title="Opacity" />
        </div>
        
        <!-- Preset Swatches -->
        <div class="preset-swatches">
          <span class="swatch" style="background:#5865F2" data-color="#5865F2" title="Discord Blurple"></span>
          <span class="swatch" style="background:#57F287" data-color="#57F287" title="Discord Green"></span>
          <span class="swatch" style="background:#FEE75C" data-color="#FEE75C" title="Discord Yellow"></span>
          <span class="swatch" style="background:#EB459E" data-color="#EB459E" title="Discord Fuchsia"></span>
          <span class="swatch" style="background:#ED4245" data-color="#ED4245" title="Discord Red"></span>
          <span class="swatch" style="background:#0D99FF" data-color="#0D99FF" title="Figma Blue"></span>
          <span class="swatch" style="background:#1e1f22" data-color="#1e1f22" title="Dark Slate"></span>
          <span class="swatch" style="background:#ffffff" data-color="#ffffff" title="Pure White"></span>
        </div>
      </div>

      <!-- Stroke -->
      <div class="prop-section">
        <div class="prop-section-title">Stroke</div>
        <div class="color-picker-row">
          <input type="color" id="prop-stroke-color" value="${this.sanitizeColor(el.stroke)}" />
          <input type="text" id="prop-stroke-hex" value="${el.stroke || '#ffffff'}" class="hex-input" />
          <input type="number" id="prop-stroke-width" min="0" max="40" value="${el.strokeWidth || 0}" style="width:50px" />
        </div>
      </div>

      <!-- Effects / Shadow -->
      <div class="prop-section">
        <div class="prop-section-title">Effects (Drop Shadow)</div>
        <div class="prop-row">
          <label class="checkbox-label">
            <input type="checkbox" id="prop-shadow-toggle" ${el.shadow?.enabled ? 'checked' : ''} />
            <span>Enable Drop Shadow</span>
          </label>
        </div>
        ${el.shadow?.enabled ? `
          <div class="prop-grid-2" style="margin-top:8px">
            <div class="input-field-group">
              <label>Blur</label>
              <input type="number" id="prop-shadow-blur" value="${el.shadow.blur || 12}" />
            </div>
            <div class="input-field-group">
              <label>Y Offset</label>
              <input type="number" id="prop-shadow-y" value="${el.shadow.y || 4}" />
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Text / Typography Details -->
      ${['text', 'sticky'].includes(el.type) ? `
        <div class="prop-section">
          <div class="prop-section-title">Typography & Content</div>
          <div class="input-field-group full-width" style="margin-bottom:8px">
            <label>Content</label>
            <textarea id="prop-text-content" rows="3">${el.text || ''}</textarea>
          </div>
          <div class="prop-grid-2">
            <div class="input-field-group">
              <label>Size</label>
              <input type="number" id="prop-font-size" value="${el.fontSize || 16}" />
            </div>
            <div class="input-field-group">
              <label>Weight</label>
              <select id="prop-font-weight">
                <option value="400" ${el.fontWeight == '400' ? 'selected' : ''}>Regular</option>
                <option value="500" ${el.fontWeight == '500' ? 'selected' : ''}>Medium</option>
                <option value="600" ${el.fontWeight == '600' ? 'selected' : ''}>Semibold</option>
                <option value="700" ${el.fontWeight == '700' ? 'selected' : ''}>Bold</option>
              </select>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Star Specifics -->
      ${el.type === 'star' ? `
        <div class="prop-section">
          <div class="prop-section-title">Star Points</div>
          <div class="input-field-group full-width">
            <label>Points Count</label>
            <input type="range" id="prop-star-points" min="3" max="12" value="${el.pointsCount || 5}" />
          </div>
        </div>
      ` : ''}
    `;
  }

  renderCodeTab(el) {
    const css = this.generateCSS(el);
    const tailwind = this.generateTailwind(el);

    return `
      <div class="code-inspector">
        <div class="code-block-header">
          <span>CSS Styles</span>
          <button class="copy-code-btn" id="btn-copy-css">Copy CSS</button>
        </div>
        <pre class="code-preview"><code>${css}</code></pre>

        <div class="code-block-header" style="margin-top:16px">
          <span>Tailwind CSS Classes</span>
          <button class="copy-code-btn" id="btn-copy-tw">Copy Tailwind</button>
        </div>
        <pre class="code-preview"><code>${tailwind}</code></pre>
      </div>
    `;
  }

  renderExportTab(el) {
    return `
      <div class="export-panel">
        <div class="prop-section-title">Export Selection</div>
        <p class="export-desc">Download layer "${el.name}" as a production-ready vector asset or data blueprint.</p>
        
        <div class="export-actions-list">
          <button class="export-btn primary" id="btn-export-png">
            <span>🖼️ Export as PNG (Hi-Res)</span>
          </button>
          <button class="export-btn" id="btn-export-svg">
            <span>📐 Export as Vector SVG</span>
          </button>
          <button class="export-btn" id="btn-export-json">
            <span>📄 Export as JSON Specification</span>
          </button>
        </div>
      </div>
    `;
  }

  generateCSS(el) {
    const lines = [];
    lines.push(`/* Layer: ${el.name} */`);
    lines.push(`width: ${Math.round(el.width)}px;`);
    lines.push(`height: ${Math.round(el.height)}px;`);
    if (el.fill && el.fill !== 'transparent') {
      lines.push(`background: ${el.fill};`);
    }
    if (el.cornerRadius) {
      lines.push(`border-radius: ${el.cornerRadius}px;`);
    }
    if (el.strokeWidth > 0) {
      lines.push(`border: ${el.strokeWidth}px solid ${el.stroke || '#ffffff'};`);
    }
    if (el.opacity < 1) {
      lines.push(`opacity: ${el.opacity};`);
    }
    if (el.shadow?.enabled) {
      lines.push(`box-shadow: ${el.shadow.x || 0}px ${el.shadow.y || 4}px ${el.shadow.blur || 12}px ${el.shadow.color || 'rgba(0,0,0,0.3)'};`);
    }
    if (el.fontSize) {
      lines.push(`font-size: ${el.fontSize}px;`);
      lines.push(`font-weight: ${el.fontWeight || 500};`);
      lines.push(`color: ${el.fontColor || '#ffffff'};`);
    }
    return lines.join('\n');
  }

  generateTailwind(el) {
    const classes = [];
    classes.push(`w-[${Math.round(el.width)}px]`);
    classes.push(`h-[${Math.round(el.height)}px]`);
    if (el.cornerRadius) {
      if (el.cornerRadius >= 999) classes.push('rounded-full');
      else classes.push(`rounded-[${el.cornerRadius}px]`);
    }
    if (el.strokeWidth > 0) {
      classes.push(`border-[${el.strokeWidth}px]`);
    }
    if (el.shadow?.enabled) {
      classes.push('shadow-xl');
    }
    if (el.fontSize) {
      classes.push(`text-[${el.fontSize}px]`);
      if (el.fontWeight >= 700) classes.push('font-bold');
      else if (el.fontWeight >= 600) classes.push('font-semibold');
      else if (el.fontWeight >= 500) classes.push('font-medium');
    }
    return classes.join(' ');
  }

  sanitizeColor(hex) {
    if (!hex || hex === 'transparent' || !hex.startsWith('#') || hex.length < 7) {
      return '#5865F2';
    }
    return hex;
  }

  bindTabEvents(el) {
    // Tab switching
    this.container.querySelectorAll('.prop-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.render();
      });
    });

    if (this.activeTab === 'design') {
      this.bindDesignInputs(el);
    } else if (this.activeTab === 'code') {
      const copyCss = this.container.querySelector('#btn-copy-css');
      if (copyCss) {
        copyCss.addEventListener('click', () => {
          navigator.clipboard.writeText(this.generateCSS(el));
          copyCss.textContent = 'Copied!';
          setTimeout(() => (copyCss.textContent = 'Copy CSS'), 1500);
        });
      }
      const copyTw = this.container.querySelector('#btn-copy-tw');
      if (copyTw) {
        copyTw.addEventListener('click', () => {
          navigator.clipboard.writeText(this.generateTailwind(el));
          copyTw.textContent = 'Copied!';
          setTimeout(() => (copyTw.textContent = 'Copy Tailwind'), 1500);
        });
      }
    } else if (this.activeTab === 'export') {
      this.bindExportActions(el);
    }
  }

  bindDesignInputs(el) {
    const bindNum = (id, prop) => {
      const input = this.container.querySelector(id);
      if (input) {
        input.addEventListener('input', e => {
          el[prop] = parseFloat(e.target.value) || 0;
          this.engine.requestRender();
          this.onUpdate();
        });
      }
    };

    bindNum('#prop-x', 'x');
    bindNum('#prop-y', 'y');
    bindNum('#prop-w', 'width');
    bindNum('#prop-h', 'height');
    bindNum('#prop-rot', 'rotation');
    bindNum('#prop-radius', 'cornerRadius');
    bindNum('#prop-stroke-width', 'strokeWidth');
    bindNum('#prop-opacity', 'opacity');
    bindNum('#prop-font-size', 'fontSize');

    // Color inputs
    const fillColor = this.container.querySelector('#prop-fill-color');
    const fillHex = this.container.querySelector('#prop-fill-hex');
    if (fillColor && fillHex) {
      fillColor.addEventListener('input', e => {
        el.fill = e.target.value;
        fillHex.value = e.target.value;
        this.engine.requestRender();
        this.onUpdate();
      });
      fillHex.addEventListener('input', e => {
        el.fill = e.target.value;
        fillColor.value = e.target.value;
        this.engine.requestRender();
        this.onUpdate();
      });
    }

    // Color Swatches
    this.container.querySelectorAll('.swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        el.fill = sw.dataset.color;
        if (fillColor) fillColor.value = el.fill;
        if (fillHex) fillHex.value = el.fill;
        this.engine.requestRender();
        this.onUpdate();
      });
    });

    // Stroke Color
    const strokeColor = this.container.querySelector('#prop-stroke-color');
    const strokeHex = this.container.querySelector('#prop-stroke-hex');
    if (strokeColor && strokeHex) {
      strokeColor.addEventListener('input', e => {
        el.stroke = e.target.value;
        strokeHex.value = e.target.value;
        this.engine.requestRender();
        this.onUpdate();
      });
      strokeHex.addEventListener('input', e => {
        el.stroke = e.target.value;
        strokeColor.value = e.target.value;
        this.engine.requestRender();
        this.onUpdate();
      });
    }

    // Shadow toggle & blur
    const shadowToggle = this.container.querySelector('#prop-shadow-toggle');
    if (shadowToggle) {
      shadowToggle.addEventListener('change', e => {
        if (!el.shadow) el.shadow = {};
        el.shadow.enabled = e.target.checked;
        this.render();
        this.engine.requestRender();
        this.onUpdate();
      });
    }

    bindNum('#prop-shadow-blur', 'blur');

    // Text content
    const textContent = this.container.querySelector('#prop-text-content');
    if (textContent) {
      textContent.addEventListener('input', e => {
        el.text = e.target.value;
        this.engine.requestRender();
        this.onUpdate();
      });
    }

    // Align buttons
    this.container.querySelectorAll('.align-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.alignElement(el, btn.dataset.align);
      });
    });
  }

  alignElement(el, alignType) {
    const parentW = this.engine.width;
    const parentH = this.engine.height;

    switch (alignType) {
      case 'left':
        el.x = 40;
        break;
      case 'center-h':
        el.x = (parentW / 2 - el.width / 2) - this.engine.viewport.x;
        break;
      case 'right':
        el.x = (parentW - el.width - 40) - this.engine.viewport.x;
        break;
      case 'top':
        el.y = 40;
        break;
      case 'center-v':
        el.y = (parentH / 2 - el.height / 2) - this.engine.viewport.y;
        break;
      case 'bottom':
        el.y = (parentH - el.height - 40) - this.engine.viewport.y;
        break;
    }
    this.engine.requestRender();
    this.render();
    this.onUpdate();
  }

  bindExportActions(el) {
    const btnPng = this.container.querySelector('#btn-export-png');
    if (btnPng) {
      btnPng.addEventListener('click', () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = Math.max(10, el.width * 2);
        offCanvas.height = Math.max(10, el.height * 2);
        const ctx = offCanvas.getContext('2d');
        ctx.scale(2, 2);

        const tempEl = { ...el, x: 0, y: 0 };
        this.engine.renderElement(ctx, tempEl);

        const link = document.createElement('a');
        link.download = `${el.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = offCanvas.toDataURL('image/png');
        link.click();
      });
    }

    const btnSvg = this.container.querySelector('#btn-export-svg');
    if (btnSvg) {
      btnSvg.addEventListener('click', () => {
        const svgContent = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${el.width}" height="${el.height}" viewBox="0 0 ${el.width} ${el.height}">
            <rect width="${el.width}" height="${el.height}" rx="${el.cornerRadius || 0}" fill="${el.fill || '#5865F2'}" stroke="${el.stroke || 'none'}" stroke-width="${el.strokeWidth || 0}" />
            ${el.text ? `<text x="12" y="24" fill="${el.fontColor || '#ffffff'}" font-size="${el.fontSize || 16}" font-family="sans-serif">${el.text}</text>` : ''}
          </svg>
        `;
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${el.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
        link.href = url;
        link.click();
      });
    }

    const btnJson = this.container.querySelector('#btn-export-json');
    if (btnJson) {
      btnJson.addEventListener('click', () => {
        const data = JSON.stringify(el, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${el.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        link.href = url;
        link.click();
      });
    }
  }
}

