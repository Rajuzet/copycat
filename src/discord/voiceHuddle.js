/**
 * CanvasCord Voice Huddle, Web Audio Visualizer & Interactive Screen Presentation Mode
 */

export class VoiceHuddle {
  constructor(container, voiceState, onToggleMute, onToggleLaser, onTogglePresent) {
    this.container = container;
    this.voiceState = voiceState;
    this.onToggleMute = onToggleMute || (() => { });
    this.onToggleLaser = onToggleLaser || (() => {});
    this.onTogglePresent = onTogglePresent || (() => {});
    this.animId = null;
    this.isPresenting = false;
    this.isLaserOn = false;
  }

  render() {
    if (!this.container) return;

    if (!this.voiceState.isConnected) {
      this.container.innerHTML = `
        <div class="voice-huddle-bar disconnected">
          <div class="voice-status-info">
            <span class="voice-indicator offline"></span>
            <span class="voice-channel-name">No active voice huddle</span>
          </div>
          <button class="join-voice-btn" id="btn-reconnect-voice">🔊 Join Huddle</button>
        </div>
      `;
      const btn = this.container.querySelector('#btn-reconnect-voice');
      if (btn) {
        btn.addEventListener('click', () => {
          this.voiceState.isConnected = true;
          this.render();
        });
      }
      return;
    }

    this.container.innerHTML = `
      <div class="voice-huddle-bar connected">
        <div class="voice-status-info">
          <span class="voice-indicator online"></span>
          <div class="voice-text-details">
            <span class="voice-connected-label">Voice Connected</span>
            <span class="voice-channel-name">🔊 ${this.voiceState.channelName} (RTC 22ms)</span>
          </div>
        </div>

        <!-- Real-time Web Audio Waveform Canvas -->
        <div class="voice-waveform-container">
          <canvas id="voice-waveform-canvas" width="100" height="26"></canvas>
        </div>

        <!-- Participants Heads -->
        <div class="voice-participants-list">
          ${this.voiceState.participants.map(p => `
            <div class="voice-avatar-wrap ${p.isSpeaking ? 'speaking' : ''}" title="${p.name} ${p.isSpeaking ? '(Speaking)' : ''}">
              <img src="${p.avatar}" alt="${p.name}" class="voice-avatar" />
              ${p.isMuted ? `<span class="avatar-mute-badge">🔇</span>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Collaborative Presentation Tools -->
        <div class="voice-tools-group">
          <button class="voice-action-pill ${this.isPresenting ? 'active' : ''}" id="btn-present-canvas" title="Broadcast your canvas viewport to team">
            <span>📡 Present Canvas</span>
          </button>
          <button class="voice-action-pill ${this.isLaserOn ? 'active' : ''}" id="btn-laser-pointer" title="Laser Pointer for live walkthroughs">
            <span>🔴 Laser</span>
          </button>
        </div>

        <!-- Controls -->
        <div class="voice-controls">
          <button class="voice-btn ${this.voiceState.isMuted ? 'muted' : ''}" id="btn-mute-mic" title="Mute / Unmute Microphone">
            ${this.voiceState.isMuted ? '🔇' : '🎙️'}
          </button>
          <button class="voice-btn ${this.voiceState.isDeafened ? 'deafened' : ''}" id="btn-deafen" title="Deafen">
            ${this.voiceState.isDeafened ? '🔕' : '🎧'}
          </button>
          <button class="voice-btn disconnect" id="btn-disconnect-voice" title="Disconnect Huddle">
            ✕
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
    this.startWaveformAnimation();
  }

  toggleMute() {
    this.voiceState.isMuted = !this.voiceState.isMuted;
    this.onToggleMute(this.voiceState.isMuted);
    this.render();
  }

  toggleDeafen() {
    this.voiceState.isDeafened = !this.voiceState.isDeafened;
    this.render();
  }

  bindEvents() {
    const muteBtn = this.container.querySelector('#btn-mute-mic');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        this.toggleMute();
      });
    }

    const deafBtn = this.container.querySelector('#btn-deafen');
    if (deafBtn) {
      deafBtn.addEventListener('click', () => {
        this.toggleDeafen();
      });
    }

    const discBtn = this.container.querySelector('#btn-disconnect-voice');
    if (discBtn) {
      discBtn.addEventListener('click', () => {
        this.voiceState.isConnected = false;
        if (this.animId) cancelAnimationFrame(this.animId);
        this.render();
      });
    }

    const presentBtn = this.container.querySelector('#btn-present-canvas');
    if (presentBtn) {
      presentBtn.addEventListener('click', () => {
        this.isPresenting = !this.isPresenting;
        this.onTogglePresent(this.isPresenting);
        this.render();
      });
    }

    const laserBtn = this.container.querySelector('#btn-laser-pointer');
    if (laserBtn) {
      laserBtn.addEventListener('click', () => {
        this.isLaserOn = !this.isLaserOn;
        this.onToggleLaser(this.isLaserOn);
        this.render();
      });
    }
  }

  startWaveformAnimation() {
    const canvas = this.container.querySelector('#voice-waveform-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let phase = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (this.voiceState.isMuted) {
        ctx.strokeStyle = '#949BA4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      } else {
        const barCount = 12;
        const barWidth = 3.5;
        const gap = 3.5;
        const totalW = barCount * (barWidth + gap);
        const startX = (canvas.width - totalW) / 2;

        ctx.fillStyle = '#57F287';

        for (let i = 0; i < barCount; i++) {
          const heightFactor = Math.sin(phase + i * 0.6) * 0.5 + 0.5;
          const barHeight = Math.max(3, heightFactor * 20);
          const y = (canvas.height - barHeight) / 2;
          const x = startX + i * (barWidth + gap);

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
        phase += 0.09;
      }

      this.animId = requestAnimationFrame(draw);
    };

    if (this.animId) cancelAnimationFrame(this.animId);
    this.animId = requestAnimationFrame(draw);
  }
}
