export class MayaChannelBox {
  constructor(containerEl, mayaScene) {
    this.container = containerEl;
    this.scene = mayaScene;
    this.activeTab = 'channels'; // 'channels' or 'attributes'
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="maya-dock-tabs">
        <div class="maya-dock-tab active" id="tab-channels">Channel Box / Layer Editor</div>
        <div class="maya-dock-tab" id="tab-attributes">Attribute Editor</div>
      </div>

      <div class="maya-channel-box-content" id="channel-content"></div>

      <!-- Display Layers Subpanel -->
      <div class="maya-layers-box">
        <div class="maya-layers-header">
          <span>Display Layers</span>
          <button id="add-layer-btn" style="color: var(--maya-cyan); font-weight: 700;">+ New</button>
        </div>
        <div style="flex: 1; padding: 4px; overflow-y: auto; font-family: var(--font-mono); font-size: 10px;">
          <div style="display: flex; align-items: center; gap: 6px; padding: 2px 4px; background: rgba(255,255,255,0.05); border-radius: 2px;">
            <span style="color: var(--maya-green); font-weight: 700;">V</span>
            <span style="color: var(--maya-text-muted);">P</span>
            <span style="color: var(--maya-text-muted);">R</span>
            <span style="flex: 1; color: #fff;">defaultLayer</span>
          </div>
        </div>
      </div>
    `;

    this.contentEl = this.container.querySelector('#channel-content');

    const tabChannels = this.container.querySelector('#tab-channels');
    const tabAttributes = this.container.querySelector('#tab-attributes');

    tabChannels.addEventListener('click', () => {
      tabChannels.classList.add('active');
      tabAttributes.classList.remove('active');
      this.activeTab = 'channels';
      this.render();
    });

    tabAttributes.addEventListener('click', () => {
      tabAttributes.classList.add('active');
      tabChannels.classList.remove('active');
      this.activeTab = 'attributes';
      this.render();
    });

    this.scene.onSelectionChanged = () => {
      this.render();
    };

    this.render();
  }

  render() {
    const obj = this.scene.selectedObject;
    if (!obj) {
      this.contentEl.innerHTML = `
        <div style="text-align: center; color: var(--maya-text-muted); padding: 40px 10px;">
          <p style="font-size: 11px; margin-bottom: 4px;">No object selected</p>
          <p style="font-size: 10px;">Click any object in the 3D viewport or Outliner</p>
        </div>
      `;
      return;
    }

    if (this.activeTab === 'channels') {
      this.renderChannelBox(obj);
    } else {
      this.renderAttributeEditor(obj);
    }
  }

  renderChannelBox(obj) {
    this.contentEl.innerHTML = `
      <div class="maya-selected-header">
        <span>${obj.name}</span>
        <span style="font-size: 10px; color: var(--maya-text-muted); font-weight: 400;">Transform</span>
      </div>

      <div class="maya-channel-group-title">Channels (Keyable)</div>

      <!-- Translate Channels -->
      <div class="maya-channel-row">
        <label class="maya-channel-label" id="lbl-tx">Translate X</label>
        <input type="number" step="0.1" class="maya-channel-input" id="inp-tx" value="${obj.position.x.toFixed(3)}" />
      </div>
      <div class="maya-channel-row">
        <label class="maya-channel-label" id="lbl-ty">Translate Y</label>
        <input type="number" step="0.1" class="maya-channel-input" id="inp-ty" value="${obj.position.y.toFixed(3)}" />
      </div>
      <div class="maya-channel-row">
        <label class="maya-channel-label" id="lbl-tz">Translate Z</label>
        <input type="number" step="0.1" class="maya-channel-input" id="inp-tz" value="${obj.position.z.toFixed(3)}" />
      </div>

      <!-- Rotate Channels -->
      <div class="maya-channel-row">
        <label class="maya-channel-label" id="lbl-rx">Rotate X</label>
        <input type="number" step="1" class="maya-channel-input" id="inp-rx" value="${(obj.rotation.x * (180 / Math.PI)).toFixed(1)}" />
      </div>
      <div class="maya-channel-row">
        <label class="maya-channel-label" id="lbl-ry">Rotate Y</label>
        <input type="number" step="1" class="maya-channel-input" id="inp-ry" value="${(obj.rotation.y * (180 / Math.PI)).toFixed(1)}" />
      </div>
      <div class="maya-channel-row">
        <label class="maya-channel-label" id="lbl-rz">Rotate Z</label>
        <input type="number" step="1" class="maya-channel-input" id="inp-rz" value="${(obj.rotation.z * (180 / Math.PI)).toFixed(1)}" />
      </div>

      <!-- Scale Channels -->
      <div class="maya-channel-row">
        <label class="maya-channel-label" id="lbl-sx">Scale X</label>
        <input type="number" step="0.1" class="maya-channel-input" id="inp-sx" value="${obj.scale.x.toFixed(3)}" />
      </div>
      <div class="maya-channel-row">
        <label class="maya-channel-label" id="lbl-sy">Scale Y</label>
        <input type="number" step="0.1" class="maya-channel-input" id="inp-sy" value="${obj.scale.y.toFixed(3)}" />
      </div>
      <div class="maya-channel-row">
        <label class="maya-channel-label" id="lbl-sz">Scale Z</label>
        <input type="number" step="0.1" class="maya-channel-input" id="inp-sz" value="${obj.scale.z.toFixed(3)}" />
      </div>

      <!-- Visibility -->
      <div class="maya-channel-row">
        <label class="maya-channel-label">Visibility</label>
        <select class="maya-channel-input" id="inp-vis">
          <option value="on" ${obj.visible ? 'selected' : ''}>on</option>
          <option value="off" ${!obj.visible ? 'selected' : ''}>off</option>
        </select>
      </div>

      <!-- Inputs / History -->
      <div class="maya-channel-group-title" style="margin-top: 10px;">Inputs</div>
      <div style="background: rgba(255,255,255,0.04); padding: 6px; border-radius: 2px; font-family: var(--font-mono); font-size: 10px; color: var(--maya-cyan);">
        ▶ ${obj.userData?.type || 'polyMeshNode1'}
      </div>
    `;

    // Hook inputs
    this.bindChannelInputs(obj);
  }

  bindChannelInputs(obj) {
    const tx = this.contentEl.querySelector('#inp-tx');
    const ty = this.contentEl.querySelector('#inp-ty');
    const tz = this.contentEl.querySelector('#inp-tz');
    const rx = this.contentEl.querySelector('#inp-rx');
    const ry = this.contentEl.querySelector('#inp-ry');
    const rz = this.contentEl.querySelector('#inp-rz');
    const sx = this.contentEl.querySelector('#inp-sx');
    const sy = this.contentEl.querySelector('#inp-sy');
    const sz = this.contentEl.querySelector('#inp-sz');
    const vis = this.contentEl.querySelector('#inp-vis');

    tx?.addEventListener('input', () => { obj.position.x = parseFloat(tx.value) || 0; });
    ty?.addEventListener('input', () => { obj.position.y = parseFloat(ty.value) || 0; });
    tz?.addEventListener('input', () => { obj.position.z = parseFloat(tz.value) || 0; });

    rx?.addEventListener('input', () => { obj.rotation.x = ((parseFloat(rx.value) || 0) * Math.PI) / 180; });
    ry?.addEventListener('input', () => { obj.rotation.y = ((parseFloat(ry.value) || 0) * Math.PI) / 180; });
    rz?.addEventListener('input', () => { obj.rotation.z = ((parseFloat(rz.value) || 0) * Math.PI) / 180; });

    sx?.addEventListener('input', () => { obj.scale.x = parseFloat(sx.value) || 1; });
    sy?.addEventListener('input', () => { obj.scale.y = parseFloat(sy.value) || 1; });
    sz?.addEventListener('input', () => { obj.scale.z = parseFloat(sz.value) || 1; });

    vis?.addEventListener('change', () => { obj.visible = vis.value === 'on'; });
  }

  renderAttributeEditor(obj) {
    let mat = null;
    obj.traverse(child => {
      if (child.isMesh && child.material && !mat) {
        mat = child.material;
      }
    });

    const hexColor = mat?.color ? '#' + mat.color.getHexString() : '#8a9299';
    const metalness = mat?.metalness !== undefined ? mat.metalness : 0.2;
    const roughness = mat?.roughness !== undefined ? mat.roughness : 0.4;

    this.contentEl.innerHTML = `
      <div class="maya-selected-header">
        <span>${obj.name}</span>
        <span style="font-size: 10px; color: #ff9800; font-weight: 700;">Arnold aiStandardSurface</span>
      </div>

      <div class="maya-channel-group-title">Base Material</div>
      <div class="maya-mat-row">
        <span>Base Color</span>
        <input type="color" class="maya-color-picker" id="mat-color" value="${hexColor}" />
      </div>

      <div class="maya-mat-row">
        <span>Metalness</span>
        <input type="range" min="0" max="1" step="0.05" id="mat-metal" value="${metalness}" style="width: 100px;" />
      </div>

      <div class="maya-mat-row">
        <span>Roughness</span>
        <input type="range" min="0" max="1" step="0.05" id="mat-rough" value="${roughness}" style="width: 100px;" />
      </div>

      <div class="maya-channel-group-title" style="margin-top: 10px;">Wireframe & Shading</div>
      <div class="maya-mat-row">
        <span>Wireframe</span>
        <input type="checkbox" id="mat-wire" ${mat?.wireframe ? 'checked' : ''} />
      </div>
    `;

    const colorPicker = this.contentEl.querySelector('#mat-color');
    const metalSlider = this.contentEl.querySelector('#mat-metal');
    const roughSlider = this.contentEl.querySelector('#mat-rough');
    const wireCheck = this.contentEl.querySelector('#mat-wire');

    colorPicker?.addEventListener('input', (e) => {
      obj.traverse(child => {
        if (child.isMesh && child.material?.color) {
          child.material.color.set(e.target.value);
        }
      });
    });

    metalSlider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      obj.traverse(child => {
        if (child.isMesh && child.material?.metalness !== undefined) {
          child.material.metalness = val;
        }
      });
    });

    roughSlider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      obj.traverse(child => {
        if (child.isMesh && child.material?.roughness !== undefined) {
          child.material.roughness = val;
        }
      });
    });

    wireCheck?.addEventListener('change', (e) => {
      obj.traverse(child => {
        if (child.isMesh && child.material) {
          child.material.wireframe = e.target.checked;
        }
      });
    });
  }
}
