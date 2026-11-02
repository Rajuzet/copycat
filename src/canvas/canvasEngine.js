/**
 * CanvasCord High-Performance 60FPS Infinite Vector Canvas Engine
 */

export class CanvasEngine {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    // Viewport Transform State
    this.viewport = {
      x: 240, // initial center offset
      y: 120,
      zoom: 1.0,
      minZoom: 0.05,
      maxZoom: 5.0,
    };

    // Scene Graph
    this.elements = [];
    this.selectedIds = new Set();
    this.hoveredId = null;

    // Snapping Guides
    this.guides = [];

    // Marquee Selection Box
    this.marquee = null; // { startX, startY, currentX, currentY }

    // Live Collaborators
    this.collaborators = [];

    // Animation frame request ID
    this.rafId = null;
    this.needsRender = true;

    // Setup Canvas Resize
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();

    // Start Render Loop
    this.loop = this.loop.bind(this);
    this.loop();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.requestRender();
  }

  requestRender() {
    this.needsRender = true;
  }

  loop() {
    if (this.needsRender) {
      this.render();
      this.needsRender = false;
    }
    this.rafId = requestAnimationFrame(this.loop);
  }

  // Coordinate Conversion
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.viewport.x) / this.viewport.zoom,
      y: (sy - this.viewport.y) / this.viewport.zoom,
    };
  }

  worldToScreen(wx, wy) {
    return {
      x: wx * this.viewport.zoom + this.viewport.x,
      y: wy * this.viewport.zoom + this.viewport.y,
    };
  }

  zoomAt(sx, sy, zoomDelta) {
    const prevZoom = this.viewport.zoom;
    const newZoom = Math.min(
      this.viewport.maxZoom,
      Math.max(this.viewport.minZoom, prevZoom * zoomDelta)
    );
    if (newZoom === prevZoom) return;

    // Zoom towards cursor location
    this.viewport.x = sx - (sx - this.viewport.x) * (newZoom / prevZoom);
    this.viewport.y = sy - (sy - this.viewport.y) * (newZoom / prevZoom);
    this.viewport.zoom = newZoom;
    this.requestRender();
  }

  pan(dx, dy) {
    this.viewport.x += dx;
    this.viewport.y += dy;
    this.requestRender();
  }

  setZoom(zoomPercent) {
    const targetZoom = zoomPercent / 100;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    this.zoomAt(centerX, centerY, targetZoom / this.viewport.zoom);
  }

  fitToScreen() {
    if (this.elements.length === 0) {
      this.viewport = { x: this.width / 2 - 200, y: this.height / 2 - 200, zoom: 1 };
      this.requestRender();
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of this.elements) {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    }

    const padding = 80;
    const bboxW = (maxX - minX) + padding * 2;
    const bboxH = (maxY - minY) + padding * 2;

    const scaleX = this.width / bboxW;
    const scaleY = this.height / bboxH;
    const targetZoom = Math.min(1.5, Math.max(0.2, Math.min(scaleX, scaleY)));

    this.viewport.zoom = targetZoom;
    this.viewport.x = (this.width - (maxX + minX) * targetZoom) / 2;
    this.viewport.y = (this.height - (maxY + minY) * targetZoom) / 2;
    this.requestRender();
  }

  // Master Render Pass
  render() {
    const ctx = this.ctx;
    ctx.save();

    // Scale for Retina/HiDPI
    ctx.scale(this.dpr, this.dpr);

    // 1. Draw Canvas Dark Dot Grid Background
    this.renderGrid(ctx);

    // 2. Apply World Transform
    ctx.save();
    ctx.translate(this.viewport.x, this.viewport.y);
    ctx.scale(this.viewport.zoom, this.viewport.zoom);

    // 3. Render Elements (Z-sorted)
    for (const el of this.elements) {
      if (!el.visible) continue;
      this.renderElement(ctx, el);
    }

    // 4. Render Snapping Alignment Guides
    this.renderGuides(ctx);

    // 5. Render Selection Gizmos
    this.renderSelectionGizmo(ctx);

    // 6. Render Live Collaborators & Cursors
    this.renderCollaborators(ctx);

    ctx.restore(); // Restore world transform

    // 7. Render Screen-space Marquee (Drag select box)
    if (this.marquee) {
      this.renderMarquee(ctx);
    }

    ctx.restore();
  }

  // Dot Matrix Canvas Background
  renderGrid(ctx) {
    const w = this.width;
    const h = this.height;

    // Dark sleek workspace background (#1a1b1e)
    ctx.fillStyle = '#1e1f22';
    ctx.fillRect(0, 0, w, h);

    const zoom = this.viewport.zoom;
    let gridSize = 24 * zoom;
    while (gridSize < 16) gridSize *= 2;
    while (gridSize > 64) gridSize /= 2;

    const offsetX = (this.viewport.x % gridSize);
    const offsetY = (this.viewport.y % gridSize);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    const dotRadius = Math.max(1, 1.2 * Math.min(zoom, 1.5));

    for (let x = offsetX; x < w; x += gridSize) {
      for (let y = offsetY; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  renderElement(ctx, el) {
    ctx.save();
    ctx.translate(el.x, el.y);
    if (el.rotation) {
      ctx.rotate((el.rotation * Math.PI) / 180);
    }
    ctx.globalAlpha = el.opacity ?? 1;

    // Apply Drop Shadow if enabled
    if (el.shadow?.enabled) {
      ctx.shadowColor = el.shadow.color || 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = el.shadow.blur || 12;
      ctx.shadowOffsetX = el.shadow.x || 0;
      ctx.shadowOffsetY = el.shadow.y || 4;
    }

    switch (el.type) {
      case 'frame':
        this.renderFrame(ctx, el);
        break;
      case 'rect':
        this.renderRect(ctx, el);
        break;
      case 'circle':
        this.renderCircle(ctx, el);
        break;
      case 'star':
        this.renderStar(ctx, el);
        break;
      case 'arrow':
        this.renderArrow(ctx, el);
        break;
      case 'text':
        this.renderText(ctx, el);
        break;
      case 'sticky':
        this.renderSticky(ctx, el);
        break;
      case 'pen':
        this.renderPen(ctx, el);
        break;
      case 'component':
        this.renderComponent(ctx, el);
        break;
      default:
        this.renderRect(ctx, el);
    }

    ctx.restore();
  }

  renderFrame(ctx, el) {
    const r = el.cornerRadius || 0;
    const w = el.width;
    const h = el.height;

    // Frame Header Label (Figma-style floating tag above frame)
    ctx.save();
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillStyle = '#949BA4';
    ctx.fillText(`${el.name} (${Math.round(w)} × ${Math.round(h)})`, 4, -8);
    ctx.restore();

    // Frame Body
    ctx.fillStyle = el.fill || '#2b2d31';
    this.roundRect(ctx, 0, 0, w, h, r);
    ctx.fill();

    if (el.strokeWidth > 0) {
      ctx.strokeStyle = el.stroke || '#35373c';
      ctx.lineWidth = el.strokeWidth;
      ctx.stroke();
    }
  }

  renderRect(ctx, el) {
    const w = el.width;
    const h = el.height;
    const r = el.cornerRadius || 0;

    ctx.fillStyle = el.fill || '#5865F2';
    this.roundRect(ctx, 0, 0, w, h, r);
    ctx.fill();

    if (el.strokeWidth > 0) {
      ctx.strokeStyle = el.stroke || '#ffffff';
      ctx.lineWidth = el.strokeWidth;
      ctx.stroke();
    }
  }

  renderCircle(ctx, el) {
    const cx = el.width / 2;
    const cy = el.height / 2;
    const rx = el.width / 2;
    const ry = el.height / 2;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = el.fill || '#23A55A';
    ctx.fill();

    if (el.strokeWidth > 0) {
      ctx.strokeStyle = el.stroke || '#ffffff';
      ctx.lineWidth = el.strokeWidth;
      ctx.stroke();
    }
  }

  renderStar(ctx, el) {
    const cx = el.width / 2;
    const cy = el.height / 2;
    const spikes = el.pointsCount || 5;
    const outerRadius = Math.min(cx, cy);
    const innerRadius = outerRadius * (el.innerRadiusRatio || 0.45);

    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();

    ctx.fillStyle = el.fill || '#FEE75C';
    ctx.fill();

    if (el.strokeWidth > 0) {
      ctx.strokeStyle = el.stroke || '#ffffff';
      ctx.lineWidth = el.strokeWidth;
      ctx.stroke();
    }
  }

  renderArrow(ctx, el) {
    const points = el.points || [{ x: 0, y: 0 }, { x: el.width, y: 0 }];
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.strokeStyle = el.stroke || '#EB459E';
    ctx.lineWidth = el.strokeWidth || 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Arrowhead at end point
    if (el.arrowHead !== false) {
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const headLen = 12;

      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(
        p2.x - headLen * Math.cos(angle - Math.PI / 6),
        p2.y - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(
        p2.x - headLen * Math.cos(angle + Math.PI / 6),
        p2.y - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    }
  }

  renderText(ctx, el) {
    ctx.font = `${el.fontWeight || '400'} ${el.fontSize || 16}px ${el.fontFamily || 'Inter, sans-serif'}`;
    ctx.fillStyle = el.fontColor || '#F2F3F5';
    ctx.textBaseline = 'top';

    const lines = (el.text || '').split('\n');
    const lineHeight = (el.fontSize || 16) * (el.lineHeight || 1.3);

    lines.forEach((line, idx) => {
      ctx.fillText(line, 0, idx * lineHeight);
    });
  }

  renderSticky(ctx, el) {
    const w = el.width;
    const h = el.height;

    // Post-It Shadow & Folded Paper Look
    ctx.fillStyle = el.fill || '#fff375';
    this.roundRect(ctx, 0, 0, w, h, el.cornerRadius || 4);
    ctx.fill();

    // Subtle top tape or pin line
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, 0, w, 24);

    // Author tag
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillText(el.author || 'Design Note', 12, 16);

    // Text content
    ctx.font = `500 ${el.fontSize || 14}px Inter, sans-serif`;
    ctx.fillStyle = el.fontColor || '#1e1f22';
    ctx.textBaseline = 'top';

    const words = (el.text || '').split(' ');
    let line = '';
    let y = 38;
    const maxW = w - 24;

    for (let n = 0; n < words.length; n++) {
      if (words[n].includes('\n')) {
        const sub = words[n].split('\n');
        line += sub[0];
        ctx.fillText(line, 12, y);
        y += 20;
        line = sub[1] + ' ';
        continue;
      }
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxW && n > 0) {
        ctx.fillText(line, 12, y);
        line = words[n] + ' ';
        y += 20;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 12, y);
  }

  renderPen(ctx, el) {
    const pts = el.points || [];
    if (pts.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = el.stroke || '#5865F2';
    ctx.lineWidth = el.strokeWidth || 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  renderComponent(ctx, el) {
    const w = el.width;
    const h = el.height;
    const type = el.componentType || 'button';

    if (type === 'button') {
      ctx.fillStyle = el.fill || '#5865F2';
      this.roundRect(ctx, 0, 0, w, h, 8);
      ctx.fill();

      ctx.font = '600 14px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(el.props?.label || 'Action Button', w / 2, h / 2);
    } else if (type === 'card') {
      ctx.fillStyle = '#2b2d31';
      this.roundRect(ctx, 0, 0, w, h, 12);
      ctx.fill();
      ctx.strokeStyle = '#35373c';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#F2F3F5';
      ctx.font = '600 16px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(el.props?.title || 'Card Title', 16, 28);

      ctx.fillStyle = '#949BA4';
      ctx.font = '400 12px Inter, sans-serif';
      ctx.fillText(el.props?.desc || 'Interactive UI Component', 16, 50);
    }
  }

  // Helper: Rounded Rectangle
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Selection & Transform Gizmo
  renderSelectionGizmo(ctx) {
    if (this.selectedIds.size === 0) return;

    for (const id of this.selectedIds) {
      const el = this.elements.find(e => e.id === id);
      if (!el || !el.visible) continue;

      ctx.save();
      ctx.translate(el.x, el.y);
      if (el.rotation) ctx.rotate((el.rotation * Math.PI) / 180);

      // Figma selection bounding line (#0D99FF)
      ctx.strokeStyle = '#0D99FF';
      ctx.lineWidth = 1.5 / this.viewport.zoom;
      ctx.strokeRect(0, 0, el.width, el.height);

      // 8 Resize Handles
      const handleSize = 7 / this.viewport.zoom;
      const hw = el.width;
      const hh = el.height;

      const handles = [
        { x: 0, y: 0 },
        { x: hw / 2, y: 0 },
        { x: hw, y: 0 },
        { x: hw, y: hh / 2 },
        { x: hw, y: hh },
        { x: hw / 2, y: hh },
        { x: 0, y: hh },
        { x: 0, y: hh / 2 },
      ];

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0D99FF';
      ctx.lineWidth = 1.5 / this.viewport.zoom;

      for (const h of handles) {
        ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      }

      // Rotation Handle (Circle above top edge)
      const rotDist = 20 / this.viewport.zoom;
      ctx.beginPath();
      ctx.moveTo(hw / 2, 0);
      ctx.lineTo(hw / 2, -rotDist);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(hw / 2, -rotDist, handleSize / 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }

  // Smart Snapping Guides
  renderGuides(ctx) {
    if (this.guides.length === 0) return;

    ctx.save();
    ctx.strokeStyle = '#FF007F'; // Vibrant magenta Figma snapping guide
    ctx.lineWidth = 1 / this.viewport.zoom;
    ctx.setLineDash([4 / this.viewport.zoom, 4 / this.viewport.zoom]);

    for (const g of this.guides) {
      ctx.beginPath();
      if (g.type === 'vertical') {
        ctx.moveTo(g.x, -5000);
        ctx.lineTo(g.x, 5000);
      } else {
        ctx.moveTo(-5000, g.y);
        ctx.lineTo(5000, g.y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // Live Collaborator Cursors
  renderCollaborators(ctx) {
    for (const col of this.collaborators) {
      ctx.save();
      ctx.translate(col.x, col.y);

      // Figma-style colored arrow cursor
      ctx.fillStyle = col.color || '#5865F2';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 16);
      ctx.lineTo(4.5, 12);
      ctx.lineTo(10.5, 17);
      ctx.lineTo(12.5, 15);
      ctx.lineTo(6.5, 10);
      ctx.lineTo(12, 10);
      ctx.closePath();
      ctx.fill();

      // Name Badge
      ctx.font = '600 11px Inter, sans-serif';
      const textWidth = ctx.measureText(col.name).width;
      ctx.fillStyle = col.color || '#5865F2';
      this.roundRect(ctx, 12, 14, textWidth + 14, 20, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(col.name, 19, 28);

      // Chat bubble if collaborator is speaking
      if (col.chatMessage) {
        ctx.font = '400 12px Inter, sans-serif';
        const msgWidth = ctx.measureText(col.chatMessage).width;
        ctx.fillStyle = 'rgba(30, 31, 34, 0.95)';
        this.roundRect(ctx, 12, 38, msgWidth + 16, 26, 6);
        ctx.fill();
        ctx.strokeStyle = col.color || '#5865F2';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#F2F3F5';
        ctx.fillText(col.chatMessage, 20, 55);
      }

      ctx.restore();
    }
  }

  // Marquee Selection Box
  renderMarquee(ctx) {
    const m = this.marquee;
    const x = Math.min(m.startX, m.currentX);
    const y = Math.min(m.startY, m.currentY);
    const w = Math.abs(m.currentX - m.startX);
    const h = Math.abs(m.currentY - m.startY);

    ctx.save();
    ctx.fillStyle = 'rgba(13, 153, 255, 0.12)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#0D99FF';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  // Hit Testing
  getElementAt(wx, wy) {
    // Check in reverse z-index (topmost first)
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const el = this.elements[i];
      if (!el.visible || el.locked) continue;

      if (
        wx >= el.x &&
        wx <= el.x + el.width &&
        wy >= el.y &&
        wy <= el.y + el.height
      ) {
        return el;
      }
    }
    return null;
  }
}

