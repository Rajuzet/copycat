/**
 * CanvasCord Tool Controller & Interactive Event State Machine
 * Features: 60FPS Dragging, Snapping Guides, Resize/Rotate, Frame Parent Movement, Nudging, Grouping
 */

import { createElement } from './elements.js';

export class ToolController {
  constructor(engine, onSelectionChange, onElementChange, onShareToChat) {
    this.engine = engine;
    this.canvas = engine.canvas;
    this.onSelectionChange = onSelectionChange || (() => {});
    this.onElementChange = onElementChange || (() => {});
    this.onShareToChat = onShareToChat || (() => {});

    this.activeTool = 'select'; // 'select' | 'hand' | 'frame' | 'rect' | 'circle' | 'star' | 'arrow' | 'pen' | 'text' | 'sticky' | 'laser'
    this.isLaserActive = false;
    this.laserTrail = [];

    // Interaction State
    this.isMouseDown = false;
    this.isSpacePressed = false;
    this.dragStart = { x: 0, y: 0 };
    this.currentDrag = { x: 0, y: 0 };
    this.dragMode = 'none'; // 'none' | 'pan' | 'move' | 'resize' | 'rotate' | 'marquee' | 'draw' | 'laser'
    this.resizeHandle = null;
    this.rotateTarget = null;
    this.activeDrawElement = null;

    // Undo / Redo History Stacks
    this.history = [];
    this.historyIndex = -1;
    this.saveState();

    this.setupListeners();
  }

  saveState() {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
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
    } else if (this.activeTool === 'laser') {
      this.canvas.style.cursor = 'crosshair';
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

    window.addEventListener('keydown', e => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName) && !e.target.isContentEditable) {
        if (!this.isSpacePressed) {
          this.isSpacePressed = true;
          this.canvas.style.cursor = 'grab';
        }
      }
    });

    window.addEventListener('keyup', e => {
      if (e.code === 'Space') {
        this.isSpacePressed = false;
        this.updateCursor();
      }
    });
  }

  onWheel(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.engine.zoomAt(sx, sy, zoomFactor);
    } else {
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

    if (this.isSpacePressed || e.button === 1 || this.activeTool === 'hand') {
      this.dragMode = 'pan';
      this.canvas.style.cursor = 'grabbing';
      return;
    }

    if (this.activeTool === 'laser') {
      this.dragMode = 'laser';
      return;
    }

    if (this.activeTool === 'select') {
      const handleHit = this.checkHandleHit(world.x, world.y);
      if (handleHit) {
        if (handleHit.handle === 'rot') {
          this.dragMode = 'rotate';
          this.rotateTarget = handleHit.element;
          return;
        }

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

      const hit = this.engine.getElementAt(world.x, world.y);
      if (hit) {
        if (!e.shiftKey && !this.engine.selectedIds.has(hit.id)) {
          this.engine.selectedIds.clear();
        }
        this.engine.selectedIds.add(hit.id);

        // Check if hit element is a Frame: also move all nested children
        const movingIds = new Set(this.engine.selectedIds);
        if (hit.type === 'frame') {
          for (const item of this.engine.elements) {
            if (item.id !== hit.id && !movingIds.has(item.id)) {
              if (
                item.x >= hit.x &&
                item.x + item.width <= hit.x + hit.width &&
                item.y >= hit.y &&
                item.y + item.height <= hit.y + hit.height
              ) {
                movingIds.add(item.id);
              }
            }
          }
        }

        this.dragMode = 'move';
        this.dragOffsets = Array.from(movingIds).map(id => {
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
      let text = 'Design Label';
      try {
        const input = prompt('Enter text for label:', 'Design Label');
        if (input !== null && input.trim()) text = input.trim();
        else if (input === null) {
          // If cancelled by user, still create a placeholder or reset tool
          text = 'Design Label';
        }
      } catch (e) {
        text = 'Design Label';
      }

      const el = createElement('text', {
        x: world.x,
        y: world.y,
        text: text,
        width: Math.max(120, text.length * 12 + 20),
        height: 36,
      });
      this.engine.elements.push(el);
      this.engine.selectedIds.clear();
      this.engine.selectedIds.add(el.id);
      this.onSelectionChange([el.id]);
      this.onElementChange();
      this.saveState();
      this.setTool('select');
      this.dragMode = 'none';
      return;
    }

    if (this.activeTool === 'sticky') {
      let note = '💡 Polish the navigation bar animation!';
      try {
        const input = prompt('Enter sticky note content:', '💡 Polish the navigation bar animation!');
        if (input !== null && input.trim()) note = input.trim();
        else if (input === null) {
          note = '💡 New Sticky Note';
        }
      } catch (e) {
        note = '💡 New Sticky Note';
      }

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

    if (this.dragMode === 'laser') {
      this.laserTrail.push({ x: world.x, y: world.y, time: Date.now() });
      if (this.laserTrail.length > 30) this.laserTrail.shift();
      this.engine.requestRender();
      return;
    }

    if (this.dragMode === 'move') {
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
      if (handle.includes('r')) el.width = Math.max(10, Math.round(curW - el.x));
      if (handle.includes('b')) el.height = Math.max(10, Math.round(curH - el.y));
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

    if (this.dragMode === 'rotate') {
      const el = this.rotateTarget;
      if (el) {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const rad = Math.atan2(world.y - cy, world.x - cx);
        let deg = Math.round((rad * 180) / Math.PI) + 90;
        if (e.shiftKey) {
          deg = Math.round(deg / 15) * 15; // 15-degree snap
        }
        el.rotation = ((deg % 360) + 360) % 360;
        this.engine.requestRender();
        this.onElementChange();
      }
      return;
    }

    if (this.dragMode === 'draw') {
      const el = this.activeDrawElement;
      if (el) {
        const startX = this.dragStart.wx;
        const startY = this.dragStart.wy;

        el.x = Math.min(startX, world.x);
        el.y = Math.min(startY, world.y);
        el.width = Math.abs(world.x - startX);
        el.height = Math.abs(world.y - startY);

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
        const el = this.activeDrawElement;
        // If single-clicked without dragging (or jitter < 15px), assign natural default dimensions
        if (el.width < 15 || el.height < 15) {
          if (el.type === 'frame') {
            el.width = 390;
            el.height = 680;
          } else if (el.type === 'rect') {
            el.width = 160;
            el.height = 100;
          } else if (el.type === 'circle') {
            el.width = 100;
            el.height = 100;
          } else if (el.type === 'star') {
            el.width = 120;
            el.height = 120;
          } else if (el.type === 'arrow') {
            el.width = 160;
            el.height = 40;
            el.points = [{ x: 0, y: 0 }, { x: 160, y: 40 }];
          }
        }

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
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    // Arrow keys nudging (1px or 10px with Shift)
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const dx = e.key === 'ArrowLeft' ? -step : (e.key === 'ArrowRight' ? step : 0);
      const dy = e.key === 'ArrowUp' ? -step : (e.key === 'ArrowDown' ? step : 0);

      for (const id of this.engine.selectedIds) {
        const el = this.engine.elements.find(i => i.id === id);
        if (el) {
          el.x += dx;
          el.y += dy;
        }
      }
      this.engine.requestRender();
      this.onElementChange();
      return;
    }

    // Tools hotkeys
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

    // Layer Depth (Bring Forward / Send Backward)
    if (e.key === ']') {
      this.bringForwardSelected();
    }
    if (e.key === '[') {
      this.sendBackwardSelected();
    }

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

    // Group (Ctrl+G) / Ungroup (Ctrl+Shift+G)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
      e.preventDefault();
      if (e.shiftKey) this.ungroupSelected();
      else this.groupSelected();
      return;
    }

    // Duplicate
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      this.duplicateSelected();
    }

    // Select All
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

  bringForwardSelected() {
    for (const id of this.engine.selectedIds) {
      const idx = this.engine.elements.findIndex(e => e.id === id);
      if (idx !== -1 && idx < this.engine.elements.length - 1) {
        const item = this.engine.elements.splice(idx, 1)[0];
        this.engine.elements.splice(idx + 1, 0, item);
      }
    }
    this.engine.requestRender();
    this.onElementChange();
  }

  sendBackwardSelected() {
    for (const id of this.engine.selectedIds) {
      const idx = this.engine.elements.findIndex(e => e.id === id);
      if (idx > 0) {
        const item = this.engine.elements.splice(idx, 1)[0];
        this.engine.elements.splice(idx - 1, 0, item);
      }
    }
    this.engine.requestRender();
    this.onElementChange();
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

  groupSelected() {
    if (this.engine.selectedIds.size < 2) return;
    const selected = Array.from(this.engine.selectedIds)
      .map(id => this.engine.elements.find(i => i.id === id))
      .filter(Boolean);

    if (selected.length < 2) return;

    const minX = Math.min(...selected.map(i => i.x));
    const minY = Math.min(...selected.map(i => i.y));
    const maxX = Math.max(...selected.map(i => i.x + i.width));
    const maxY = Math.max(...selected.map(i => i.y + i.height));

    const groupFrame = createElement('frame', {
      name: 'Group // Frame',
      x: minX - 16,
      y: minY - 16,
      width: (maxX - minX) + 32,
      height: (maxY - minY) + 32,
      fill: 'transparent',
      stroke: '#0D99FF',
      strokeWidth: 1,
      cornerRadius: 12,
    });

    const lowestIdx = Math.min(...selected.map(el => this.engine.elements.indexOf(el)));
    this.engine.elements.splice(lowestIdx, 0, groupFrame);

    this.engine.selectedIds.clear();
    this.engine.selectedIds.add(groupFrame.id);
    this.onSelectionChange([groupFrame.id]);
    this.onElementChange();
    this.saveState();
    this.engine.requestRender();
  }

  ungroupSelected() {
    for (const id of Array.from(this.engine.selectedIds)) {
      const el = this.engine.elements.find(i => i.id === id);
      if (el && el.type === 'frame' && el.name.toLowerCase().includes('group')) {
        this.engine.elements = this.engine.elements.filter(i => i.id !== id);
      }
    }
    this.engine.selectedIds.clear();
    this.onSelectionChange([]);
    this.onElementChange();
    this.saveState();
    this.engine.requestRender();
  }

  checkHandleHit(wx, wy) {
    const handleDist = 9 / this.engine.viewport.zoom;

    for (const id of this.engine.selectedIds) {
      const el = this.engine.elements.find(e => e.id === id);
      if (!el) continue;

      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      const hw = el.width;
      const hh = el.height;

      let dx = wx - cx;
      let dy = wy - cy;

      if (el.rotation) {
        const rad = (-el.rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const rx = dx * cos - dy * sin;
        const ry = dx * sin + dy * cos;
        dx = rx;
        dy = ry;
      }

      const rotDist = 20 / this.engine.viewport.zoom;
      const handles = {
        tl: { x: -hw / 2, y: -hh / 2 },
        tc: { x: 0, y: -hh / 2 },
        tr: { x: hw / 2, y: -hh / 2 },
        mr: { x: hw / 2, y: 0 },
        br: { x: hw / 2, y: hh / 2 },
        bc: { x: 0, y: hh / 2 },
        bl: { x: -hw / 2, y: hh / 2 },
        ml: { x: -hw / 2, y: 0 },
        rot: { x: 0, y: -hh / 2 - rotDist },
      };

      for (const [key, pos] of Object.entries(handles)) {
        if (Math.abs(dx - pos.x) < handleDist && Math.abs(dy - pos.y) < handleDist) {
          return { handle: key, element: el };
        }
      }
    }
    return null;
  }

  getHandleCursor(handle) {
    if (handle === 'rot') return 'crosshair';
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

      if (Math.abs(target.x - other.x) < threshold) {
        target.x = other.x;
        this.engine.guides.push({ type: 'vertical', x: other.x });
      } else if (Math.abs(targetCenterX - otherCenterX) < threshold) {
        target.x = otherCenterX - target.width / 2;
        this.engine.guides.push({ type: 'vertical', x: otherCenterX });
      }

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
