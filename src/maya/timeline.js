export class MayaTimeline {
  constructor(containerEl, mayaScene) {
    this.container = containerEl;
    this.scene = mayaScene;
    this.currentFrame = 1;
    this.startFrame = 1;
    this.endFrame = 120;
    this.isPlaying = false;
    this.playDirection = 1;
    this.fps = 24;
    this.keyframeTrack = new Map(); // objUuid -> { frameNumber: { pos, rot, scale } }
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <!-- Time Slider -->
      <div class="maya-time-slider" id="time-slider">
        <div class="maya-timeline-ticks" id="timeline-ticks"></div>
        <div class="maya-playhead-needle" id="playhead-needle" style="left: 0%;">
          <div class="maya-playhead-thumb"></div>
        </div>
      </div>

      <!-- Range Controls & Playback Buttons -->
      <div class="maya-range-controls">
        <input type="number" class="maya-range-box" id="range-start" value="${this.startFrame}" />
        <input type="number" class="maya-range-box" id="range-current" value="${this.currentFrame}" style="color: var(--maya-red); font-weight: 700;" />
        
        <!-- Playback Buttons -->
        <div class="maya-playback-buttons">
          <button class="maya-play-btn" id="btn-first" title="First Frame (Alt+,)">⏮</button>
          <button class="maya-play-btn" id="btn-prev" title="Step Back (,)">⏴</button>
          <button class="maya-play-btn" id="btn-play-rev" title="Play Reverse">◀</button>
          <button class="maya-play-btn" id="btn-play-fwd" title="Play Forward (Alt+V)">▶</button>
          <button class="maya-play-btn" id="btn-next" title="Step Forward (.)">⏵</button>
          <button class="maya-play-btn" id="btn-last" title="Last Frame (Alt+.)">⏭</button>
          <button class="maya-play-btn" id="btn-set-key" title="Set Keyframe (S)" style="color: var(--maya-red); font-weight: 800; margin-left: 6px;">S</button>
        </div>

        <span style="font-size: 11px; color: var(--maya-text-muted);">24 fps</span>
        <input type="number" class="maya-range-box" id="range-end" value="${this.endFrame}" />
      </div>
    `;

    this.sliderEl = this.container.querySelector('#time-slider');
    this.ticksEl = this.container.querySelector('#timeline-ticks');
    this.needleEl = this.container.querySelector('#playhead-needle');
    this.currFrameInput = this.container.querySelector('#range-current');
    this.playFwdBtn = this.container.querySelector('#btn-play-fwd');
    this.playRevBtn = this.container.querySelector('#btn-play-rev');

    this.renderTicks();
    this.setupListeners();
    this.startLoop();
  }

  renderTicks() {
    this.ticksEl.innerHTML = '';
    const total = this.endFrame - this.startFrame + 1;
    const step = 5;

    for (let f = this.startFrame; f <= this.endFrame; f += step) {
      const tick = document.createElement('div');
      tick.className = 'maya-timeline-tick';
      tick.textContent = f;
      this.ticksEl.appendChild(tick);
    }
  }

  setupListeners() {
    let isScrubbing = false;

    const scrub = (e) => {
      const rect = this.sliderEl.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const frame = Math.round(this.startFrame + pct * (this.endFrame - this.startFrame));
      this.setFrame(frame);
    };

    this.sliderEl.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      scrub(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isScrubbing) scrub(e);
    });

    window.addEventListener('mouseup', () => {
      isScrubbing = false;
    });

    // Playback Buttons
    this.playFwdBtn.addEventListener('click', () => {
      if (this.isPlaying && this.playDirection === 1) {
        this.pause();
      } else {
        this.play(1);
      }
    });

    this.playRevBtn.addEventListener('click', () => {
      if (this.isPlaying && this.playDirection === -1) {
        this.pause();
      } else {
        this.play(-1);
      }
    });

    this.container.querySelector('#btn-first').addEventListener('click', () => this.setFrame(this.startFrame));
    this.container.querySelector('#btn-last').addEventListener('click', () => this.setFrame(this.endFrame));
    this.container.querySelector('#btn-prev').addEventListener('click', () => this.setFrame(Math.max(this.startFrame, this.currentFrame - 1)));
    this.container.querySelector('#btn-next').addEventListener('click', () => this.setFrame(Math.min(this.endFrame, this.currentFrame + 1)));

    // Set Keyframe Button
    this.container.querySelector('#btn-set-key').addEventListener('click', () => {
      this.setKeyframeOnSelected();
    });
  }

  setFrame(frame) {
    this.currentFrame = frame;
    this.currFrameInput.value = frame;
    const pct = ((frame - this.startFrame) / (this.endFrame - this.startFrame)) * 100;
    this.needleEl.style.left = `${pct}%`;

    // Apply keyframe animation
    this.applyAnimationToScene();
  }

  setKeyframeOnSelected() {
    const obj = this.scene.selectedObject;
    if (!obj) return;

    if (!this.keyframeTrack.has(obj.uuid)) {
      this.keyframeTrack.set(obj.uuid, []);
    }

    const track = this.keyframeTrack.get(obj.uuid);
    // Remove existing key at this frame
    const existingIdx = track.findIndex(k => k.frame === this.currentFrame);
    const keyData = {
      frame: this.currentFrame,
      pos: obj.position.clone(),
      rot: obj.rotation.clone(),
      scale: obj.scale.clone()
    };

    if (existingIdx !== -1) {
      track[existingIdx] = keyData;
    } else {
      track.push(keyData);
      track.sort((a, b) => a.frame - b.frame);
    }
  }

  applyAnimationToScene() {
    this.keyframeTrack.forEach((track, uuid) => {
      const obj = this.scene.objects.find(o => o.uuid === uuid);
      if (!obj || track.length === 0) return;

      // Find surrounding keyframes
      let prev = track[0];
      let next = track[track.length - 1];

      for (let i = 0; i < track.length; i++) {
        if (track[i].frame <= this.currentFrame) prev = track[i];
        if (track[i].frame >= this.currentFrame) {
          next = track[i];
          break;
        }
      }

      if (prev.frame === next.frame) {
        obj.position.copy(prev.pos);
        obj.rotation.copy(prev.rot);
        obj.scale.copy(prev.scale);
      } else {
        const factor = (this.currentFrame - prev.frame) / (next.frame - prev.frame);
        obj.position.lerpVectors(prev.pos, next.pos, factor);
        obj.scale.lerpVectors(prev.scale, next.scale, factor);
      }
    });
  }

  play(dir = 1) {
    this.isPlaying = true;
    this.playDirection = dir;
    this.playFwdBtn.classList.toggle('active', dir === 1);
    this.playRevBtn.classList.toggle('active', dir === -1);
  }

  pause() {
    this.isPlaying = false;
    this.playFwdBtn.classList.remove('active');
    this.playRevBtn.classList.remove('active');
  }

  startLoop() {
    let lastTime = performance.now();
    const frameInterval = 1000 / this.fps;

    const tick = () => {
      requestAnimationFrame(tick);
      if (!this.isPlaying) return;

      const now = performance.now();
      if (now - lastTime >= frameInterval) {
        lastTime = now;
        let nextFrame = this.currentFrame + this.playDirection;
        if (nextFrame > this.endFrame) nextFrame = this.startFrame;
        if (nextFrame < this.startFrame) nextFrame = this.endFrame;
        this.setFrame(nextFrame);
      }
    };
    tick();
  }
}
