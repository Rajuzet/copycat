/**
 * CanvasCord Tool Controller & Interactive Event State Machine
 */

import { createElement } from './elements.js';

export class ToolController {
  constructor(engine, onSelectionChange, onElementChange) {
    this.engine = engine;
    this.canvas = engine.canvas;
    this.onSelectionChange = onSelectionChange || (() => {});
    this.onElementChange = onElementChange || (() => {});

    this.activeTool = 'select'; // 'select' | 'hand' | 'frame' | 'rect' | 'circle' | 'star' | 'arrow' | 'pen' | 'text' | 'sticky'

    // Interaction State
    this.isMouseDown = false;
    this.dragStart = { x: 0, y: 0 };
    this.currentDrag = { x: 0, y: 0 };
    this.dragMode = 'none'; // 'none' | 'pan' | 'move' | 'resize' | 'rotate' | 'marquee' | 'draw'
    this.resizeHandle = null; // 'tl','tc','tr','mr','br','bc','bl','ml'
    this.activeDrawElement = null;

    // Undo / Redo History Stacks
    this.history = [];
    this.historyIndex = -1;
    this.saveState();

    this.setupListeners();
  }

  saveState() {
    // Truncate future if branched
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    // Deep clone elements
    const snapshot = JSON.stringify(this.engine.elements);
    this.history.push(snapshot);
    if (this.history.length > 50) this.history.shift();
    this.historyIndex = this.history.length - 1;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.engine.elements = JSON.parse(this.history[this.historyIndex]);
      this.engine.selectedIds.clear();
      this.engine.requestRender();
      this.onSelectionChange([]);
      this.onElementChange();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.engine.elements = JSON.parse(this.history[this.historyIndex]);
      this.engine.requestRender();
      this.onElementChange();
    }
  }

  setTool(tool) {
    this.activeTool = tool;
    this.updateCursor();
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
  }

  updateCursor() {
    if (this.activeTool === 'hand') {
      this.canvas.style.cursor = 'grab';
    } else if (['frame', 'rect', 'circle', 'star', 'arrow', 'pen'].includes(this.activeTool)) {
      this.canvas.style.cursor = 'crosshair';
    } else if (this.activeTool === 'text') {
      this.canvas.style.cursor = 'text';
    } else if (this.activeTool === 'sticky') {
      this.canvas.style.cursor = 'copy';
    } else {
      this.canvas.style.cursor = 'default';
    }
  }

  setupListeners() {
    const c = this.canvas;

    c.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    c.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    c.addEventListener('dblclick', this.onDoubleClick.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  onWheel(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.engine.zoomAt(sx, sy, zoomFactor);
    } else {
      // Pan
      this.engine.pan(-e.deltaX, -e.deltaY);
    }
  }

  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const world = this.engine.screenToWorld(sx, sy);

    this.isMouseDown = true;
    this.dragStart = { sx, sy, wx: world.x, wy: world.y };
    this.currentDrag = { sx, sy, wx: world.x, wy: world.y };

    // Spacebar or Middle Mouse = Pan
    if (e.spaceKey || e.button === 1 || this.activeTool === 'hand') {
      this.dragMode = 'pan';
      this.canvas.style.cursor = 'grabbing';
      return;
    }

    if (this.activeTool === 'select') {
      // Check if clicked on a resize handle of a selected element
      const handleHit = this.checkHandleHit(world.x, world.y);
      if (handleHit) {
        this.dragMode = 'resize';
        this.resizeHandle = handleHit.handle;
        this.resizeTarget = handleHit.element;
        this.resizeInitial = {
          x: handleHit.element.x,
          y: handleHit.element.y,
          width: handleHit.element.width,
          height: handleHit.element.height,
        };
        return;
      }

      // Check hit on element
      const hit = this.engine.getElementAt(world.x, world.y);
      if (hit) {
        if (!e.shiftKey && !this.engine.selectedIds.has(hit.id)) {
          this.engine.selectedIds.clear();
        }
        this.engine.selectedIds.add(hit.id);
        this.dragMode = 'move';
        this.dragOffsets = Array.from(this.engine.selectedIds).map(id => {
          const el = this.engine.elements.find(item => item.id === id);
          return { id, ox: el.x - world.x, oy: el.y - world.y };
        });
        this.onSelectionChange(Array.from(this.engine.selectedIds));
      } else {
        if (!e.shiftKey) {
          this.engine.selectedIds.clear();
          this.onSelectionChange([]);
        }
        this.dragMode = 'marquee';
        this.engine.marquee = { startX: sx, startY: sy, currentX: sx, currentY: sy };
      }
      this.engine.requestRender();
      return;
    }

    // Drawing Tools
    if (['frame', 'rect', 'circle', 'star', 'arrow'].includes(this.activeTool)) {
      this.dragMode = 'draw';
      const el = createElement(this.activeTool, {
        x: world.x,
        y: world.y,
        width: 1,
        height: 1,
      });
      this.engine.elements.push(el);
      this.activeDrawElement = el;
      this.engine.selectedIds.clear();
      this.engine.selectedIds.add(el.id);
      this.engine.requestRender();
      return;
    }

    if (this.activeTool === 'pen') {
      this.dragMode = 'pen';
      const el = createElement('pen', {
        x: world.x,
        y: world.y,
        width: 1,
        height: 1,
        points: [{ x: 0, y: 0 }],
      });
      this.engine.elements.push(el);
      this.activeDrawElement = el;
      this.engine.selectedIds.clear();
      this.engine.selectedIds.add(el.id);
      this.engine.requestRender();
      return;
    }

    if (this.activeTool === 'text') {
      const text = prompt('Enter text for label:', 'Design System Component');
      if (text) {
        const el = createElement('text', {
          x: world.x,
          y: world.y,
          text: text,
          width: text.length * 12 + 20,
          height: 36,
        });
        this.engine.elements.push(el);
        this.engine.selectedIds.clear();
        this.engine.selectedIds.add(el.id);
        this.onSelectionChange([el.id]);
        this.onElementChange();
        this.saveState();
        this.setTool('select');
      }
      this.dragMode = 'none';
      return;
    }

    if (this.activeTool === 'sticky') {
      const note = prompt('Enter sticky note content:', '💡 Polish the navigation bar animation!');
      if (note) {
        const el = createElement('sticky', {
          x: world.x,
          y: world.y,
          text: note,
        });
        this.engine.elements.push(el);
        this.engine.selectedIds.clear();
        this.engine.selectedIds.add(el.id);
        this.onSelectionChange([el.id]);
        this.onElementChange();
        this.saveState();
        this.setTool('select');
      }
      this.dragMode = 'none';
      return;
    }
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const world = this.engine.screenToWorld(sx, sy);

    if (!this.isMouseDown) {
      // Hover handle cursor
      if (this.activeTool === 'select') {
        const handleHit = this.checkHandleHit(world.x, world.y);
        if (handleHit) {
          this.canvas.style.cursor = this.getHandleCursor(handleHit.handle);
        } else {
          this.updateCursor();
        }
      }
      return;
    }

    const dx = sx - this.currentDrag.sx;
    const dy = sy - this.currentDrag.sy;
    this.currentDrag = { sx, sy, wx: world.x, wy: world.y };

    if (this.dragMode === 'pan') {
      this.engine.pan(dx, dy);
      return;
    }

    if (this.dragMode === 'move') {
      // Move selected elements with smart snapping
      this.engine.guides = [];
      const primaryId = Array.from(this.engine.selectedIds)[0];
      const primaryEl = this.engine.elements.find(i => i.id === primaryId);

      for (const off of this.dragOffsets) {
        const el = this.engine.elements.find(i => i.id === off.id);
        if (el) {
          el.x = Math.round(world.x + off.ox);
          el.y = Math.round(world.y + off.oy);
        }
      }

      // Check alignment to other elements
      if (primaryEl) {
        this.calculateSnappingGuides(primaryEl);
      }

      this.engine.requestRender();
      this.onElementChange();
      return;
    }

    if (this.dragMode === 'resize') {
      const el = this.resizeTarget;
      const init = this.resizeInitial;
      const curW = world.x;
      const curH = world.y;

      const handle = this.resizeHandle;
      if (handle.includes('r')) {
        el.width = Math.max(10, Math.round(curW - el.x));
      }
      if (handle.includes('b')) {
        el.height = Math.max(10, Math.round(curH - el.y));
      }
      if (handle.includes('l')) {
        const newW = Math.max(10, Math.round(init.x + init.width - curW));
        el.x = init.x + init.width - newW;
        el.width = newW;
      }
      if (handle.includes('t')) {
        const newH = Math.max(10, Math.round(init.y + init.height - curH));
        el.y = init.y + init.height - newH;
        el.height = newH;
      }

      this.engine.requestRender();
      this.onElementChange();
      return;
    }

    if (this.dragMode === 'draw') {
      const el = this.activeDrawElement;
      if (el) {
        const startX = this.dragStart.wx;
        const startY = this.dragStart.wy;

        el.x = Math.min(startX, world.x);
        el.y = Math.min(startY, world.y);
        el.width = Math.max(10, Math.abs(world.x - startX));
        el.height = Math.max(10, Math.abs(world.y - startY));

        if (el.type === 'arrow') {
          el.points = [{ x: 0, y: 0 }, { x: el.width, y: el.height }];
        }

        this.engine.requestRender();
      }
      return;
    }

    if (this.dragMode === 'pen') {
      const el = this.activeDrawElement;
      if (el) {
        const localX = world.x - el.x;
        const localY = world.y - el.y;
        el.points.push({ x: localX, y: localY });
        this.engine.requestRender();
      }
      return;
    }

    if (this.dragMode === 'marquee') {
      this.engine.marquee.currentX = sx;
      this.engine.marquee.currentY = sy;

      // Calculate elements inside marquee
      const mStartX = Math.min(this.dragStart.wx, world.x);
      const mStartY = Math.min(this.dragStart.wy, world.y);
      const mEndX = Math.max(this.dragStart.wx, world.x);
      const mEndY = Math.max(this.dragStart.wy, world.y);

      for (const el of this.engine.elements) {
        if (!el.visible || el.locked) continue;
        const inBox = (
          el.x < mEndX &&
          el.x + el.width > mStartX &&
          el.y < mEndY &&
          el.y + el.height > mStartY
        );
        if (inBox) {
          this.engine.selectedIds.add(el.id);
        } else if (!e.shiftKey) {
          this.engine.selectedIds.delete(el.id);
        }
      }
      this.onSelectionChange(Array.from(this.engine.selectedIds));
      this.engine.requestRender();
      return;
    }
  }

  onMouseUp() {
    if (!this.isMouseDown) return;
    this.isMouseDown = false;
    this.engine.guides = [];

    if (this.dragMode === 'draw' || this.dragMode === 'pen') {
      if (this.activeDrawElement) {
        this.onSelectionChange([this.activeDrawElement.id]);
        this.onElementChange();
        this.saveState();
        this.activeDrawElement = null;
      }
      this.setTool('select');
    } else if (this.dragMode === 'move' || this.dragMode === 'resize') {
      this.saveState();
    } else if (this.dragMode === 'marquee') {
      this.engine.marquee = null;
    }

    this.dragMode = 'none';
    this.updateCursor();
    this.engine.requestRender();
  }

  onDoubleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const world = this.engine.screenToWorld(sx, sy);
    const hit = this.engine.getElementAt(world.x, world.y);

    if (hit && (hit.type === 'text' || hit.type === 'sticky')) {
      const newText = prompt('Edit content:', hit.text);
      if (newText !== null) {
        hit.text = newText;
        this.engine.requestRender();
        this.onElementChange();
        this.saveState();
      }
    }
  }

  onKeyDown(e) {
    // Prevent interfering with text inputs or chat
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.key === 'v' || e.key === 'V') this.setTool('select');
    if (e.key === 'h' || e.key === 'H') this.setTool('hand');
    if (e.key === 'f' || e.key === 'F') this.setTool('frame');
    if (e.key === 'r' || e.key === 'R') this.setTool('rect');
    if (e.key === 'o' || e.key === 'O') this.setTool('circle');
    if (e.key === 's' || e.key === 'S') this.setTool('star');
    if (e.key === 'l' || e.key === 'L') this.setTool('arrow');
    if (e.key === 'p' || e.key === 'P') this.setTool('pen');
    if (e.key === 't' || e.key === 'T') this.setTool('text');
    if (e.key === 'n' || e.key === 'N') this.setTool('sticky');

    // Delete
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.engine.selectedIds.size > 0) {
        this.engine.elements = this.engine.elements.filter(
          el => !this.engine.selectedIds.has(el.id)
        );
        this.engine.selectedIds.clear();
        this.onSelectionChange([]);
        this.onElementChange();
        this.saveState();
        this.engine.requestRender();
      }
    }

    // Duplicate (Ctrl+D / Cmd+D)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      this.duplicateSelected();
    }

    // Select All (Ctrl+A / Cmd+A)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      this.engine.elements.forEach(el => this.engine.selectedIds.add(el.id));
      this.onSelectionChange(Array.from(this.engine.selectedIds));
      this.engine.requestRender();
    }

    // Undo / Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      if (e.shiftKey) this.redo();
      else this.undo();
    }
  }

  duplicateSelected() {
    const duplicates = [];
    for (const id of this.engine.selectedIds) {
      const orig = this.engine.elements.find(i => i.id === id);
      if (orig) {
        const copy = JSON.parse(JSON.stringify(orig));
        copy.id = 'el_' + Math.random().toString(36).substring(2, 9);
        copy.name = `${orig.name} (Copy)`;
        copy.x += 24;
        copy.y += 24;
        this.engine.elements.push(copy);
        duplicates.push(copy.id);
      }
    }
    if (duplicates.length > 0) {
      this.engine.selectedIds.clear();
      duplicates.forEach(id => this.engine.selectedIds.add(id));
      this.onSelectionChange(duplicates);
      this.onElementChange();
      this.saveState();
      this.engine.requestRender();
    }
  }

  checkHandleHit(wx, wy) {
    const handleDist = 8 / this.engine.viewport.zoom;

    for (const id of this.engine.selectedIds) {
      const el = this.engine.elements.find(e => e.id === id);
      if (!el) continue;

      const hw = el.width;
      const hh = el.height;
      const handles = {
        tl: { x: el.x, y: el.y },
        tc: { x: el.x + hw / 2, y: el.y },
        tr: { x: el.x + hw, y: el.y },
        mr: { x: el.x + hw, y: el.y + hh / 2 },
        br: { x: el.x + hw, y: el.y + hh },
        bc: { x: el.x + hw / 2, y: el.y + hh },
        bl: { x: el.x, y: el.y + hh },
        ml: { x: el.x, y: el.y + hh / 2 },
      };

      for (const [key, pos] of Object.entries(handles)) {
        if (Math.abs(wx - pos.x) < handleDist && Math.abs(wy - pos.y) < handleDist) {
          return { handle: key, element: el };
        }
      }
    }
    return null;
  }

  getHandleCursor(handle) {
    const map = {
      tl: 'nwse-resize',
      br: 'nwse-resize',
      tr: 'nesw-resize',
      bl: 'nesw-resize',
      tc: 'ns-resize',
      bc: 'ns-resize',
      ml: 'ew-resize',
      mr: 'ew-resize',
    };
    return map[handle] || 'default';
  }

  calculateSnappingGuides(target) {
    const threshold = 6;
    const targetCenterX = target.x + target.width / 2;
    const targetCenterY = target.y + target.height / 2;

    for (const other of this.engine.elements) {
      if (other.id === target.id || !other.visible) continue;
      const otherCenterX = other.x + other.width / 2;
      const otherCenterY = other.y + other.height / 2;

      // X alignment: left-left, center-center, right-right
      if (Math.abs(target.x - other.x) < threshold) {
        target.x = other.x;
        this.engine.guides.push({ type: 'vertical', x: other.x });
      } else if (Math.abs(targetCenterX - otherCenterX) < threshold) {
        target.x = otherCenterX - target.width / 2;
        this.engine.guides.push({ type: 'vertical', x: otherCenterX });
      }

      // Y alignment: top-top, center-center, bottom-bottom
      if (Math.abs(target.y - other.y) < threshold) {
        target.y = other.y;
        this.engine.guides.push({ type: 'horizontal', y: other.y });
      } else if (Math.abs(targetCenterY - otherCenterY) < threshold) {
        target.y = otherCenterY - target.height / 2;
        this.engine.guides.push({ type: 'horizontal', y: otherCenterY });
      }
    }
  }
}
