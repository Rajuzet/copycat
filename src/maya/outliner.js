export class MayaOutliner {
  constructor(containerEl, mayaScene) {
    this.container = containerEl;
    this.scene = mayaScene;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="maya-panel-titlebar">
        <span>Outliner</span>
        <div style="display: flex; gap: 4px;">
          <button id="outliner-refresh-btn" title="Refresh scene graph" style="color: var(--maya-text-muted);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="maya-outliner-tree" id="outliner-tree-list"></div>
    `;

    this.treeList = this.container.querySelector('#outliner-tree-list');

    // Subscribe to scene changes
    this.scene.onSelectionChanged = (obj) => {
      this.updateSelection(obj);
    };

    this.container.querySelector('#outliner-refresh-btn').addEventListener('click', () => {
      this.render();
    });

    this.render();
  }

  render() {
    this.treeList.innerHTML = '';

    // Standard Maya Default Cameras
    const defaultCameras = [
      { name: 'persp', icon: 'camera' },
      { name: 'top', icon: 'camera' },
      { name: 'front', icon: 'camera' },
      { name: 'side', icon: 'camera' }
    ];

    defaultCameras.forEach(cam => {
      const node = document.createElement('div');
      node.className = 'maya-tree-node';
      node.innerHTML = `
        <span class="maya-tree-node-icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </span>
        <span>${cam.name}</span>
      `;
      this.treeList.appendChild(node);
    });

    // Default Lights
    const lightNode = document.createElement('div');
    lightNode.className = 'maya-tree-node';
    lightNode.innerHTML = `
      <span class="maya-tree-node-icon" style="color: #ffeb3b;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
        </svg>
      </span>
      <span>defaultLightSet</span>
    `;
    this.treeList.appendChild(lightNode);

    // Dynamic Objects in the 3D Scene
    this.scene.objects.forEach(obj => {
      const isSelected = this.scene.selectedObject === obj;
      const node = document.createElement('div');
      node.className = `maya-tree-node ${isSelected ? 'selected' : ''}`;
      node.dataset.uuid = obj.uuid;

      const isJoint = obj.userData?.type === 'joint';
      const iconSvg = isJoint ? `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="8"></circle>
        </svg>
      ` : `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        </svg>
      `;

      node.innerHTML = `
        <span class="maya-tree-node-icon">${iconSvg}</span>
        <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${obj.name}</span>
        <span class="maya-tree-node-vis" title="Toggle Visibility">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${obj.visible 
              ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>'
              : '<line x1="1" y1="1" x2="23" y2="23"></line><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>'
            }
          </svg>
        </span>
      `;

      node.addEventListener('click', (e) => {
        if (e.target.closest('.maya-tree-node-vis')) {
          obj.visible = !obj.visible;
          this.render();
          return;
        }
        this.scene.selectObject(obj);
      });

      this.treeList.appendChild(node);
    });
  }

  updateSelection(selectedObj) {
    const nodes = this.treeList.querySelectorAll('.maya-tree-node');
    nodes.forEach(n => n.classList.remove('selected'));
    if (selectedObj) {
      const match = this.treeList.querySelector(`[data-uuid="${selectedObj.uuid}"]`);
      if (match) {
        match.classList.add('selected');
        match.scrollIntoView({ block: 'nearest' });
      }
    }
  }
}
