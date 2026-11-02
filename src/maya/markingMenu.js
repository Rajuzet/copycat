export class MayaMarkingMenu {
  constructor(viewportContainer, mayaScene, onActionCallback) {
    this.container = viewportContainer;
    this.scene = mayaScene;
    this.onAction = onActionCallback;
    this.menuEl = null;
    this.isOpen = false;
    this.init();
  }

  init() {
    this.menuEl = document.createElement('div');
    this.menuEl.className = 'maya-marking-menu';
    this.menuEl.id = 'maya-marking-menu';
    this.container.appendChild(this.menuEl);

    // Right-Click on viewport canvas opens Marking Menu at cursor
    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.open(e.clientX, e.clientY);
    });

    // Dismiss on click outside or escape
    window.addEventListener('mousedown', (e) => {
      if (this.isOpen && !e.target.closest('#maya-marking-menu')) {
        this.close();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open(clientX, clientY) {
    const rect = this.container.getBoundingClientRect();
    const x = Math.max(120, Math.min(rect.width - 120, clientX - rect.left));
    const y = Math.max(120, Math.min(rect.height - 120, clientY - rect.top));

    const selectedName = this.scene.selectedObject ? this.scene.selectedObject.name : 'persp';

    const wedges = [
      { id: 'vertex', dir: 'N', label: 'Vertex', icon: '•', angle: -90, action: () => this.triggerAction('component:vertex') },
      { id: 'multicut', dir: 'NE', label: 'Multi-Cut', icon: '✂', angle: -45, action: () => this.triggerAction('edit:multicut') },
      { id: 'edge', dir: 'E', label: 'Edge', icon: '╱', angle: 0, action: () => this.triggerAction('component:edge') },
      { id: 'extrude', dir: 'SE', label: 'Extrude Face', icon: '⤊', angle: 45, action: () => this.triggerAction('edit:extrude') },
      { id: 'face', dir: 'S', label: 'Face', icon: '◼', angle: 90, action: () => this.triggerAction('component:face') },
      { id: 'bevel', dir: 'SW', label: 'Bevel', icon: '◿', angle: 135, action: () => this.triggerAction('edit:bevel') },
      { id: 'object', dir: 'W', label: 'Object Mode', icon: '◻', angle: 180, action: () => this.triggerAction('component:object') },
      { id: 'shader', dir: 'NW', label: 'aiShader', icon: '🎨', angle: -135, action: () => this.triggerAction('arnold:shader') }
    ];

    let itemsHtml = '';
    const radius = 80;

    wedges.forEach(w => {
      const rad = (w.angle * Math.PI) / 180;
      const posX = Math.round(Math.cos(rad) * radius);
      const posY = Math.round(Math.sin(rad) * radius);
      itemsHtml += `
        <div class="marking-wedge" data-id="${w.id}" style="transform: translate(${posX}px, ${posY}px);">
          <span class="wedge-icon">${w.icon}</span>
          <span class="wedge-label">${w.label}</span>
        </div>
      `;
    });

    this.menuEl.innerHTML = `
      <div class="marking-center-badge">
        <span class="center-type">${this.scene.selectedObject ? 'MESH' : 'VIEWPORT'}</span>
        <span class="center-name">${selectedName}</span>
      </div>
      <div class="marking-wedges-container">
        ${itemsHtml}
      </div>
      <div class="marking-quick-bar">
        <button class="marking-btn" data-action="frame" title="Frame Selected (F)">⛶ Frame (F)</button>
        <button class="marking-btn" data-action="duplicate" title="Duplicate (Ctrl+D)">⧉ Duplicate</button>
        <button class="marking-btn" data-action="reset" title="Reset Transforms">↺ Reset</button>
        <button class="marking-btn" data-action="delete" title="Delete" style="color: var(--maya-red);">🗑 Delete</button>
      </div>
    `;

    this.menuEl.style.left = `${x}px`;
    this.menuEl.style.top = `${y}px`;
    this.menuEl.classList.add('open');
    this.isOpen = true;

    // Attach click listeners to wedges
    this.menuEl.querySelectorAll('.marking-wedge').forEach(wedgeEl => {
      wedgeEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = wedgeEl.dataset.id;
        const match = wedges.find(w => w.id === id);
        if (match) match.action();
        this.close();
      });
    });

    // Attach click listeners to quick bar buttons
    this.menuEl.querySelectorAll('.marking-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = btn.dataset.action;
        if (act === 'frame') {
          if (this.scene.selectedObject) this.scene.focusOnObject(this.scene.selectedObject);
          this.triggerAction('view:frame');
        } else if (act === 'duplicate') {
          this.scene.duplicateSelected();
          this.triggerAction('edit:duplicate');
        } else if (act === 'reset') {
          if (this.scene.selectedObject) {
            this.scene.selectedObject.position.set(0, 0, 0);
            this.scene.selectedObject.rotation.set(0, 0, 0);
            this.scene.selectedObject.scale.set(1, 1, 1);
            this.scene.notifyTransformChanged(this.scene.selectedObject);
          }
          this.triggerAction('modify:reset');
        } else if (act === 'delete') {
          this.scene.deleteSelected();
          this.triggerAction('edit:delete');
        }
        this.close();
      });
    });
  }

  triggerAction(actionKey) {
    if (this.onAction) {
      this.onAction(actionKey);
    }
  }

  close() {
    if (!this.isOpen) return;
    this.menuEl.classList.remove('open');
    this.isOpen = false;
  }
}
