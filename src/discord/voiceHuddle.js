/**
 * CanvasCord Voice Huddle & Web Audio Visualizer
 */

export class VoiceHuddle {
  constructor(container, voiceState, onToggleMute) {
    this.container = container;
    this.voiceState = voiceState;
    this.onToggleMute = onToggleMute || (() => {});
    this.animId = null;
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
          <canvas id="voice-waveform-canvas" width="120" height="28"></canvas>
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

  bindEvents() {
    const muteBtn = this.container.querySelector('#btn-mute-mic');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        this.voiceState.isMuted = !this.voiceState.isMuted;
        this.onToggleMute(this.voiceState.isMuted);
        this.render();
      });
    }

    const deafBtn = this.container.querySelector('#btn-deafen');
    if (deafBtn) {
      deafBtn.addEventListener('click', () => {
        this.voiceState.isDeafened = !this.voiceState.isDeafened;
        this.render();
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
        // Draw lively audio frequencies
        const barCount = 14;
        const barWidth = 4;
        const gap = 4;
        const totalW = barCount * (barWidth + gap);
        const startX = (canvas.width - totalW) / 2;

        ctx.fillStyle = '#57F287'; // Discord speaking green

        for (let i = 0; i < barCount; i++) {
          const heightFactor = Math.sin(phase + i * 0.6) * 0.5 + 0.5;
          const barHeight = Math.max(3, heightFactor * 22);
          const y = (canvas.height - barHeight) / 2;
          const x = startX + i * (barWidth + gap);

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
        phase += 0.08;
      }

      this.animId = requestAnimationFrame(draw);
    };

    if (this.animId) cancelAnimationFrame(this.animId);
    this.animId = requestAnimationFrame(draw);
  }
}

