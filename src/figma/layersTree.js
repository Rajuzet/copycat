/**
 * CanvasCord Figma Layers Tree & Hierarchy Panel
 */

export class LayersTree {
  constructor(container, engine, onSelect, onUpdate) {
    this.container = container;
    this.engine = engine;
    this.onSelect = onSelect || (() => {});
    this.onUpdate = onUpdate || (() => {});
  }

  render() {
    if (!this.container) return;

    const elements = [...this.engine.elements].reverse(); // Top layer first
    if (elements.length === 0) {
      this.container.innerHTML = `
        <div class="empty-layers-state">
          <div class="empty-icon">🎨</div>
          <div class="empty-title">No Layers Yet</div>
          <div class="empty-desc">Draw shapes, drop sticky notes, or use AI copilot to generate your design!</div>
        </div>
      `;
      return;
    }

    let html = `<div class="layers-list">`;
    for (const el of elements) {
      const isSelected = this.engine.selectedIds.has(el.id);
      const isVisible = el.visible !== false;
      const isLocked = el.locked === true;
      const icon = this.getTypeIcon(el.type);

      html += `
        <div class="layer-item ${isSelected ? 'selected' : ''}" data-id="${el.id}">
          <div class="layer-drag-handle">⋮⋮</div>
          <span class="layer-icon">${icon}</span>
          <span class="layer-name" title="Double click to rename">${el.name}</span>
          <div class="layer-actions">
            <button class="layer-action-btn toggle-vis ${!isVisible ? 'dimmed' : ''}" data-action="vis" title="Toggle Visibility">
              ${isVisible ? '👁' : '👁‍🗨'}
            </button>
            <button class="layer-action-btn toggle-lock ${isLocked ? 'active' : ''}" data-action="lock" title="Lock/Unlock">
              ${isLocked ? '🔒' : '🔓'}
            </button>
          </div>
        </div>
      `;
    }
    html += `</div>`;
    this.container.innerHTML = html;

    this.bindEvents();
  }

  getTypeIcon(type) {
    const icons = {
      frame: '📱',
      rect: '■',
      circle: '●',
      star: '★',
      arrow: '➔',
      text: 'T',
      sticky: '📝',
      pen: '✎',
      component: '❖',
    };
    return icons[type] || '▢';
  }

  bindEvents() {
    this.container.querySelectorAll('.layer-item').forEach(item => {
      const id = item.dataset.id;
      const el = this.engine.elements.find(i => i.id === id);

      // Click to select
      item.addEventListener('click', e => {
        if (e.target.closest('.layer-action-btn')) return;

        if (e.shiftKey) {
          if (this.engine.selectedIds.has(id)) this.engine.selectedIds.delete(id);
          else this.engine.selectedIds.add(id);
        } else {
          this.engine.selectedIds.clear();
          this.engine.selectedIds.add(id);
        }

        this.onSelect(Array.from(this.engine.selectedIds));
        this.engine.requestRender();
        this.render();
      });

      // Double-click to rename
      const nameSpan = item.querySelector('.layer-name');
      nameSpan.addEventListener('dblclick', e => {
        e.stopPropagation();
        const newName = prompt('Rename layer:', el.name);
        if (newName && newName.trim()) {
          el.name = newName.trim();
          this.render();
          this.onUpdate();
        }
      });

      // Visibility Toggle
      const visBtn = item.querySelector('[data-action="vis"]');
      if (visBtn) {
        visBtn.addEventListener('click', e => {
          e.stopPropagation();
          el.visible = el.visible === false ? true : false;
          this.render();
          this.engine.requestRender();
          this.onUpdate();
        });
      }

      // Lock Toggle
      const lockBtn = item.querySelector('[data-action="lock"]');
      if (lockBtn) {
        lockBtn.addEventListener('click', e => {
          e.stopPropagation();
          el.locked = !el.locked;
          this.render();
          this.onUpdate();
        });
      }
    });
  }
}
