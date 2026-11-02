/**
 * CanvasCord Real-time Multiplayer Presence & Live Cursor Engine
 */

export class MultiplayerPresence {
  constructor(engine) {
    this.engine = engine;

    this.collaborators = [
      {
        id: 'collab_sarah',
        name: 'Sarah Chen',
        color: '#5865F2', // Discord Blurple
        x: 420,
        y: 220,
        targetX: 420,
        targetY: 220,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
        status: 'Editing Button',
        chatMessage: null,
      },
      {
        id: 'collab_alex',
        name: 'Alex Rivera',
        color: '#57F287', // Discord Green
        x: 780,
        y: 340,
        targetX: 780,
        targetY: 340,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
        status: 'Reviewing Typography',
        chatMessage: null,
      },
    ];

    this.engine.collaborators = this.collaborators;
    this.startSimulation();
  }

  startSimulation() {
    const messages = [
      'Love this button contrast! 🔥',
      'Checking 8px grid alignment 📐',
      'This hero section looks so sharp! 🚀',
      'Should we make the corner radius 16px?',
      'Added a sticky note on the navbar 📝',
      'Exporting this icon to SVG...',
    ];

    // Smooth movement interpolation ticker
    setInterval(() => {
      let moved = false;
      for (const col of this.collaborators) {
        const dx = col.targetX - col.x;
        const dy = col.targetY - col.y;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          col.x += dx * 0.12;
          col.y += dy * 0.12;
          moved = true;
        }
      }
      if (moved) this.engine.requestRender();
    }, 30);

    // Pick new targets occasionally
    setInterval(() => {
      const col = this.collaborators[Math.floor(Math.random() * this.collaborators.length)];
      if (this.engine.elements.length > 0) {
        const targetEl = this.engine.elements[Math.floor(Math.random() * this.engine.elements.length)];
        col.targetX = targetEl.x + Math.random() * targetEl.width;
        col.targetY = targetEl.y + Math.random() * targetEl.height;
      } else {
        col.targetX = 100 + Math.random() * 800;
        col.targetY = 100 + Math.random() * 500;
      }

      // Random speech bubble
      if (Math.random() > 0.65) {
        col.chatMessage = messages[Math.floor(Math.random() * messages.length)];
        setTimeout(() => {
          col.chatMessage = null;
          this.engine.requestRender();
        }, 4000);
      }
    }, 5000);
  }

  jumpToCollaborator(id) {
    const col = this.collaborators.find(c => c.id === id);
    if (!col) return;

    this.engine.viewport.x = this.engine.width / 2 - col.x * this.engine.viewport.zoom;
    this.engine.viewport.y = this.engine.height / 2 - col.y * this.engine.viewport.zoom;
    this.engine.requestRender();
  }
}
