/**
 * CanvasCord // Collaborative Design Studio & Discord Hub
 * Master Application Entrypoint
 */

import { CanvasEngine } from './canvas/canvasEngine.js';
import { ToolController } from './canvas/tools.js';
import { LayersTree } from './figma/layersTree.js';
import { PropertiesPanel } from './figma/propertiesPanel.js';
import { DiscordChat } from './discord/discordChat.js';
import { VoiceHuddle } from './discord/voiceHuddle.js';
import { MultiplayerPresence } from './presence/multiplayer.js';
import { AICopilot } from './ai/aiCopilot.js';
import { SUPPORTED_HF_MODELS } from './ai/huggingFaceClient.js';
import { createSaaSHeroTemplate } from './ai/templates.js';
import { createElement } from './canvas/elements.js';
import { INITIAL_DISCORD_STATE } from './discord/discordState.js';

class CanvasCordApp {
  constructor() {
    this.root = document.getElementById('app');
    this.discordState = JSON.parse(JSON.stringify(INITIAL_DISCORD_STATE));
    this.sidebarMode = 'channels'; // 'channels' | 'layers'
    this.chatOpen = true;

    this.initLayout();
    this.initCanvas();
    this.initSubsystems();
    this.bindGlobalEvents();

    // Spawn Initial Default SaaS Design Blueprint
    const initialElements = createSaaSHeroTemplate(120, 80);
    this.engine.elements.push(...initialElements);
    this.engine.fitToScreen();
    this.layersTree.render();
    this.propertiesPanel.render();
  }

  initLayout() {
    this.root.innerHTML = `
      <div class="app-layout">
        <!-- 1. Discord Guild / Server Rail (Leftmost) -->
        <nav class="guild-rail" id="guild-rail-container"></nav>

        <!-- 2. Context Sidebar (Switchable: Channels vs Figma Layers) -->
        <aside class="context-sidebar">
          <div class="sidebar-switch-tabs">
            <button class="switch-tab active" data-mode="channels">💬 Channels</button>
            <button class="switch-tab" data-mode="layers">🎨 Layers</button>
          </div>

          <!-- Channels Mode View -->
          <div class="sidebar-panel-view active" id="view-channels"></div>

          <!-- Layers Mode View -->
          <div class="sidebar-panel-view" id="view-layers">
            <div class="layers-header">
              <span class="layers-title">Page 1 // Studio</span>
              <button class="fit-btn-mini" id="btn-layers-fit" title="Fit Selection">Fit</button>
            </div>
            <div id="layers-tree-container" class="layers-container"></div>
          </div>
        </aside>

        <!-- 3. Main Center Workspace (Top Figma Toolbar + Canvas + Chat Overlay) -->
        <main class="center-stage">
          <!-- Top Toolbar -->
          <header class="figma-toolbar">
            <div class="tools-group">
              <button class="tool-btn active" data-tool="select" title="Move Tool (V)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7 18 3-7 7-3L3 3z"/></svg>
              </button>
              <button class="tool-btn" data-tool="hand" title="Hand Tool (H or Space)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0m0 5V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6m0 1V2a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v11m-4-3v2a6 6 0 0 0 6 6h4a6 6 0 0 0 6-6V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2"/></svg>
              </button>
              <div class="tool-divider"></div>
              <button class="tool-btn" data-tool="frame" title="Frame (F)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 7h18M3 17h18"/></svg>
              </button>
              <button class="tool-btn" data-tool="rect" title="Rectangle (R)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              </button>
              <button class="tool-btn" data-tool="circle" title="Ellipse (O)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>
              </button>
              <button class="tool-btn" data-tool="star" title="Star (S)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </button>
              <button class="tool-btn" data-tool="arrow" title="Connector Arrow (L)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <button class="tool-btn" data-tool="pen" title="Freehand Pen (P)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
              </button>
              <button class="tool-btn" data-tool="text" title="Text (T)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
              </button>
              <button class="tool-btn" data-tool="sticky" title="Sticky Note (N)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/></svg>
              </button>
            </div>

            <!-- Doc Title -->
            <div class="doc-title-wrapper">
              <span class="doc-name" contenteditable="true" spellcheck="false">Acme Design System v2.4</span>
              <span class="save-status">• Saved to Cloud</span>
            </div>

            <!-- Right Controls -->
            <div class="top-right-controls">
              <!-- Live Presence Avatars -->
              <div class="collab-avatars-pills">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" class="collab-pill-avatar border-blue" title="Sarah Chen" id="avatar-sarah" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" class="collab-pill-avatar border-green" title="Alex Rivera" id="avatar-alex" />
                <span class="collab-count">+2 online</span>
              </div>

              <!-- Hugging Face AI Settings Button -->
              <button class="hf-config-btn" id="btn-open-hf-config" title="Configure Hugging Face Open-Source Model">
                <span>🤗 HF LLM</span>
              </button>

              <!-- AI Copilot Button -->
              <button class="ai-copilot-btn" id="btn-ai-prompt-trigger">
                <span>✨ AI Studio</span>
              </button>

              <!-- Chat Toggle -->
              <button class="chat-toggle-btn active" id="btn-toggle-chat" title="Toggle Discord Chat Drawer">
                <span>💬 Chat</span>
                <span class="chat-toggle-badge">3</span>
              </button>

              <!-- Zoom Controls -->
              <div class="zoom-controls">
                <button class="zoom-btn" id="btn-zoom-out">-</button>
                <span class="zoom-level-text" id="zoom-indicator">100%</span>
                <button class="zoom-btn" id="btn-zoom-in">+</button>
                <button class="zoom-btn reset" id="btn-zoom-fit">Fit</button>
              </div>
            </div>
          </header>

          <!-- Infinite Canvas Viewport Container -->
          <div class="canvas-viewport" id="canvas-container">
            <canvas id="vector-canvas"></canvas>

            <!-- Floating Top Voice Huddle Bar -->
            <div class="floating-voice-huddle-wrap" id="voice-huddle-bar-container"></div>
          </div>
        </main>

        <!-- 4. Right Properties Inspector -->
        <aside class="properties-sidebar" id="properties-panel-container"></aside>

        <!-- 5. Discord Chat Drawer (Docked / Overlay on Right) -->
        <section class="discord-chat-drawer open" id="discord-chat-container"></section>
      </div>

      <!-- Quick AI Prompt Modal Dialog -->
      <div class="ai-modal-backdrop" id="ai-modal" style="display:none">
        <div class="ai-modal-card">
          <div class="ai-modal-header">
            <div class="ai-modal-title">✨ CanvasCord Generative UI Copilot</div>
            <button class="ai-modal-close" id="btn-close-ai-modal">✕</button>
          </div>
          <div class="ai-modal-body">
            <p class="ai-modal-desc">Describe any UI layout, component, or theme to synthesize directly onto your canvas:</p>
            <div class="ai-presets-grid">
              <button class="ai-preset-card" data-preset="hero">
                <span class="ai-preset-emoji">🚀</span>
                <strong>SaaS Landing Hero</strong>
                <small>1440px desktop frame with navbar & CTAs</small>
              </button>
              <button class="ai-preset-card" data-preset="mobile">
                <span class="ai-preset-emoji">📱</span>
                <strong>iOS Music Player</strong>
                <small>Dynamic Island, album art & controls</small>
              </button>
              <button class="ai-preset-card" data-preset="pricing">
                <span class="ai-preset-emoji">💳</span>
                <strong>SaaS Pricing Table</strong>
                <small>3-tier comparative matrix with badges</small>
              </button>
              <button class="ai-preset-card" data-preset="palette">
                <span class="ai-preset-emoji">🎨</span>
                <strong>Discord Color Palette</strong>
                <small>Harmonious 5-step UI swatches</small>
              </button>
              <button class="ai-preset-card" data-preset="checkout">
                <span class="ai-preset-emoji">🛒</span>
                <strong>Checkout Funnel</strong>
                <small>Card input & Apple Pay CTA</small>
              </button>
              <button class="ai-preset-card" data-preset="stats">
                <span class="ai-preset-emoji">📊</span>
                <strong>Analytics KPIs</strong>
                <small>3-card metric metrics delta</small>
              </button>
            </div>
            <div class="ai-input-wrap">
              <input type="text" id="ai-modal-prompt-input" placeholder="e.g. Generate dark mode checkout card with Apple Pay button" />
              <button class="ai-generate-btn" id="btn-run-ai-generate">Synthesize</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hugging Face AI Configuration Modal -->
      <div class="ai-modal-backdrop" id="hf-config-modal" style="display:none">
        <div class="ai-modal-card">
          <div class="ai-modal-header">
            <div class="ai-modal-title">🤗 Hugging Face Open-Source LLM Settings</div>
            <button class="ai-modal-close" id="btn-close-hf-modal">✕</button>
          </div>
          <div class="ai-modal-body">
            <p class="ai-modal-desc">Connect top-performing open-source coding and UI reasoning models via Hugging Face Inference API:</p>
            <div class="hf-field-group">
              <label>Select Open-Source Model</label>
              <select id="hf-model-select" class="hf-select">
                ${SUPPORTED_HF_MODELS.map(m => `
                  <option value="${m.id}">${m.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="hf-field-group" style="margin-top:10px">
              <label>Hugging Face User Access Token (Optional / Free)</label>
              <input type="password" id="hf-token-input" placeholder="hf_..." class="hf-input" />
              <small style="color:var(--text-muted);margin-top:4px;display:block">
                Leave blank to use built-in procedural heuristic design intelligence, or supply a free HF token from huggingface.co/settings/tokens.
              </small>
            </div>
            <div class="hf-modal-footer" style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px">
              <button class="fit-btn" id="btn-save-hf-config">Save Settings</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  initCanvas() {
    const canvasEl = document.getElementById('vector-canvas');
    this.engine = new CanvasEngine(canvasEl);

    this.tools = new ToolController(
      this.engine,
      selectedIds => {
        this.layersTree.render();
        this.propertiesPanel.render();
      },
      () => {
        this.layersTree.render();
        this.propertiesPanel.render();
      },
      el => this.shareElementToDiscord(el)
    );
  }

  initSubsystems() {
    // 1. Layers Tree
    const layersContainer = document.getElementById('layers-tree-container');
    this.layersTree = new LayersTree(
      layersContainer,
      this.engine,
      () => this.propertiesPanel.render(),
      () => this.engine.requestRender()
    );

    // 2. Properties Panel with Synergy bridge
    const propsContainer = document.getElementById('properties-panel-container');
    this.propertiesPanel = new PropertiesPanel(
      propsContainer,
      this.engine,
      () => {
        this.layersTree.render();
        this.engine.requestRender();
      },
      el => this.shareElementToDiscord(el)
    );

    // 3. AI Copilot
    this.copilot = new AICopilot(this.engine, () => {
      this.layersTree.render();
      this.propertiesPanel.render();
    });

    // 4. Discord Chat with Pinning & Locate Synergy
    const chatContainer = document.getElementById('discord-chat-container');
    this.chat = new DiscordChat(
      chatContainer,
      this.discordState,
      prompt => this.copilot.processPrompt(prompt),
      (text, author) => this.pinCommentToCanvas(text, author),
      elId => this.locateElementOnCanvas(elId)
    );
    this.chat.render();

    // 5. Voice Huddle with Presentation Mode & Laser Pointer
    const voiceContainer = document.getElementById('voice-huddle-bar-container');
    this.voiceHuddle = new VoiceHuddle(
      voiceContainer,
      this.discordState.voice,
      isMuted => {
        const micBtn = document.getElementById('btn-toggle-mic');
        if (micBtn) micBtn.textContent = isMuted ? '🔇' : '🎙️';
      },
      isLaserOn => {
        this.tools.setTool(isLaserOn ? 'laser' : 'select');
        this.engine.laserTrail = this.tools.laserTrail;
      },
      isPresenting => {
        const statusText = document.querySelector('.save-status');
        if (statusText) {
          statusText.textContent = isPresenting ? '📡 Presenting Live to Huddle' : '• Saved to Cloud';
          statusText.style.color = isPresenting ? '#EB459E' : '#57F287';
        }
      }
    );
    this.voiceHuddle.render();

    // 6. Multiplayer Presence
    this.presence = new MultiplayerPresence(this.engine);

    // 7. Initial Discord Rails & Channels Rendering
    this.renderGuildRail();
    this.renderChannelsSidebar();
  }

  renderGuildRail() {
    const rail = document.getElementById('guild-rail-container');
    if (!rail) return;

    rail.innerHTML = `
      ${this.discordState.servers.map(s => `
        <div class="guild-item ${s.id === this.discordState.activeServerId ? 'active' : ''}" data-server="${s.id}" title="${s.name}">
          <div class="guild-pill"></div>
          <div class="guild-icon">${s.icon || '💬'}</div>
          ${s.badge ? `<span class="guild-badge">${s.badge}</span>` : ''}
        </div>
      `).join('')}
      <div class="guild-separator"></div>
      <div class="guild-item action" id="btn-add-server" title="Add a Server">
        <div class="guild-icon">+</div>
      </div>
      <div class="guild-item action" id="btn-explore-servers" title="Explore Public Hubs">
        <div class="guild-icon">🧭</div>
      </div>
    `;

    rail.querySelectorAll('.guild-item[data-server]').forEach(item => {
      item.addEventListener('click', () => {
        const srvId = item.dataset.server;
        this.discordState.activeServerId = srvId;
        const server = this.discordState.servers.find(s => s.id === srvId);
        if (server) {
          const firstText = server.channels.find(c => c.type !== 'voice') || server.channels[0];
          if (firstText) this.discordState.activeChannelId = firstText.id;
        }
        this.renderGuildRail();
        this.renderChannelsSidebar();
        this.chat.render();
      });
    });

    rail.querySelector('#btn-add-server')?.addEventListener('click', () => {
      const name = prompt('Enter new Server / Team name:', 'Design Systems');
      if (name && name.trim()) {
        const newServer = {
          id: 'srv_' + Date.now(),
          name: name.trim(),
          icon: '💎',
          accentColor: '#5865F2',
          channels: [
            { id: 'chan_' + Date.now() + '_gen', name: 'general', type: 'text', unread: 0 },
            { id: 'chan_' + Date.now() + '_crit', name: 'design-reviews', type: 'text', unread: 0 },
            { id: 'chan_' + Date.now() + '_vc', name: 'Design Huddle', type: 'voice', usersCount: 1 },
          ],
        };
        this.discordState.servers.push(newServer);
        this.discordState.activeServerId = newServer.id;
        this.discordState.activeChannelId = newServer.channels[0].id;
        this.renderGuildRail();
        this.renderChannelsSidebar();
        this.chat.render();
      }
    });

    rail.querySelector('#btn-explore-servers')?.addEventListener('click', () => {
      alert('✨ CanvasCord Discovery: Connected to 12 Public Community Design Hubs & Figma System Repositories!');
    });
  }

  renderChannelsSidebar() {
    const container = document.getElementById('view-channels');
    if (!container) return;

    const server = this.discordState.servers.find(s => s.id === this.discordState.activeServerId) || this.discordState.servers[0];
    const textChannels = server.channels.filter(c => c.type !== 'voice');
    const voiceChannels = server.channels.filter(c => c.type === 'voice');

    container.innerHTML = `
      <div class="server-header">
        <span class="server-name">${server.name}</span>
        <span class="server-badge-verified">✓</span>
      </div>

      <div class="channels-section">
        <div class="channel-group-title">
          <span>TEXT CHANNELS</span>
          <span class="add-channel-btn" id="btn-add-channel" title="Create Text Channel">+</span>
        </div>
        <div class="channels-list">
          ${textChannels.map(ch => `
            <div class="channel-row ${ch.id === this.discordState.activeChannelId ? 'active' : ''}" data-chan="${ch.id}">
              <span class="chan-hash">#</span>
              <span class="chan-name">${ch.name}</span>
              ${ch.unread ? `<span class="chan-badge">${ch.unread}</span>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="channel-group-title" style="margin-top:16px">
          <span>VOICE HUDDLES</span>
        </div>
        <div class="channels-list">
          ${voiceChannels.map(vh => `
            <div class="channel-row voice ${vh.id === this.discordState.voice.channelId ? 'active' : ''}" data-chan="${vh.id}">
              <span class="chan-hash">🔊</span>
              <span class="chan-name">${vh.name}</span>
              ${vh.usersCount ? `
                <div class="voice-channel-users">
                  <span class="user-pill-speaking">${vh.usersCount} in call</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- User Status Footer in Discord Sidebar -->
      <div class="user-status-footer">
        <div class="user-avatar-wrap">
          <img src="${this.discordState.currentUser.avatar}" class="user-status-avatar" alt="User" />
          <span class="status-indicator online"></span>
        </div>
        <div class="user-names">
          <span class="user-display-name">${this.discordState.currentUser.name}</span>
          <span class="user-subtext">${this.discordState.currentUser.customStatus || 'Online'}</span>
        </div>
        <div class="user-quick-buttons">
          <button class="footer-btn" id="btn-toggle-mic" title="Mute/Unmute">${this.discordState.voice.isMuted ? '🔇' : '🎙️'}</button>
          <button class="footer-btn" id="btn-toggle-deaf" title="Deafen">${this.discordState.voice.isDeafened ? '🔕' : '🎧'}</button>
        </div>
      </div>
    `;

    // Channel Switching
    container.querySelectorAll('.channel-row').forEach(row => {
      row.addEventListener('click', () => {
        const chanId = row.dataset.chan;
        if (row.classList.contains('voice')) {
          this.discordState.voice.isConnected = true;
          this.discordState.voice.channelName = row.querySelector('.chan-name')?.textContent || 'Design Huddle';
          this.voiceHuddle.render();
          this.renderChannelsSidebar();
          return;
        }
        this.discordState.activeChannelId = chanId;
        this.renderChannelsSidebar();
        this.chat.render();
      });
    });

    // Add Channel
    container.querySelector('#btn-add-channel')?.addEventListener('click', () => {
      const name = prompt('Enter new channel name (e.g. wireframes):');
      if (name && name.trim()) {
        const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        const newChan = { id: 'chan_' + Date.now(), name: cleanName, type: 'text', unread: 0 };
        server.channels.push(newChan);
        this.discordState.activeChannelId = newChan.id;
        this.renderChannelsSidebar();
        this.chat.render();
      }
    });

    // Footer Buttons
    container.querySelector('#btn-toggle-mic')?.addEventListener('click', () => {
      this.voiceHuddle.toggleMute();
      const micBtn = container.querySelector('#btn-toggle-mic');
      if (micBtn) micBtn.textContent = this.discordState.voice.isMuted ? '🔇' : '🎙️';
    });

    container.querySelector('#btn-toggle-deaf')?.addEventListener('click', () => {
      this.voiceHuddle.toggleDeafen();
      const deafBtn = container.querySelector('#btn-toggle-deaf');
      if (deafBtn) deafBtn.textContent = this.discordState.voice.isDeafened ? '🔕' : '🎧';
    });
  }

  /**
   * Synergy 1: Share selected canvas element/frame to Discord channel
   */
  shareElementToDiscord(el) {
    const channelId = this.discordState.activeChannelId;
    if (!this.discordState.messages[channelId]) this.discordState.messages[channelId] = [];

    const shareMsg = {
      id: 'msg_share_' + Date.now(),
      author: {
        name: this.discordState.currentUser.name,
        role: 'Designer',
        badge: 'YOU',
        avatar: this.discordState.currentUser.avatar,
        color: '#EB459E',
      },
      time: 'Just now',
      content: `📸 **Shared Canvas Component**: *${el.name}*\n` +
        `• **Dimensions**: ${Math.round(el.width)}×${Math.round(el.height)}px\n` +
        `• **Fill**: \`${el.fill}\` | **Corner Radius**: \`${el.cornerRadius || 0}px\`\n` +
        `• **Status**: Pushed to team channel for visual feedback & review! ✨`,
      targetElementId: el.id,
      targetElementName: el.name,
      reactions: [
        { emoji: '👀', count: 2, active: true },
        { emoji: '🔥', count: 1, active: false },
      ],
    };

    this.discordState.messages[channelId].push(shareMsg);
    this.chat.render();

    // Ensure chat drawer is open
    if (!this.chatOpen) {
      this.chatOpen = true;
      document.getElementById('discord-chat-container')?.classList.add('open');
      document.getElementById('btn-toggle-chat')?.classList.add('active');
    }
  }

  /**
   * Synergy 2: Pin a Discord discussion comment onto the canvas
   */
  pinCommentToCanvas(text, author) {
    const cx = Math.round(-this.engine.viewport.x + this.engine.width / (2 * this.engine.viewport.zoom));
    const cy = Math.round(-this.engine.viewport.y + this.engine.height / (2 * this.engine.viewport.zoom));

    const sticky = createElement('sticky', {
      name: `Pin // ${author}`,
      x: cx - 90 + (Math.random() * 40 - 20),
      y: cy - 70 + (Math.random() * 40 - 20),
      text: `📍 ${author}:\n${text.slice(0, 140)}...`,
      author: author,
      fill: '#FEE75C',
    });

    this.engine.elements.push(sticky);
    this.engine.selectedIds.clear();
    this.engine.selectedIds.add(sticky.id);
    this.engine.requestRender();
    this.layersTree.render();
    this.propertiesPanel.render();
  }

  /**
   * Synergy 3: Glide camera to target element from Discord mention
   */
  locateElementOnCanvas(elId) {
    const el = this.engine.elements.find(i => i.id === elId);
    if (!el) return;

    this.engine.selectedIds.clear();
    this.engine.selectedIds.add(el.id);

    this.engine.viewport.x = this.engine.width / 2 - (el.x + el.width / 2) * this.engine.viewport.zoom;
    this.engine.viewport.y = this.engine.height / 2 - (el.y + el.height / 2) * this.engine.viewport.zoom;

    this.engine.requestRender();
    this.layersTree.render();
    this.propertiesPanel.render();
  }

  bindGlobalEvents() {
    // Sidebar Tabs (Channels vs Layers)
    document.querySelectorAll('.switch-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.switch-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const mode = tab.dataset.mode;
        document.querySelectorAll('.sidebar-panel-view').forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${mode}`).classList.add('active');

        if (mode === 'layers') {
          this.layersTree.render();
        }
      });
    });

    // Tool Buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.tools.setTool(btn.dataset.tool);
      });
    });

    // Chat Drawer Toggle
    const chatToggle = document.getElementById('btn-toggle-chat');
    const chatDrawer = document.getElementById('discord-chat-container');
    if (chatToggle && chatDrawer) {
      chatToggle.addEventListener('click', () => {
        this.chatOpen = !this.chatOpen;
        chatDrawer.classList.toggle('open', this.chatOpen);
        chatToggle.classList.toggle('active', this.chatOpen);
        setTimeout(() => this.engine.resize(), 200);
      });
    }

    // Zoom Buttons
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      this.engine.zoomAt(this.engine.width / 2, this.engine.height / 2, 1.2);
      this.updateZoomIndicator();
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.engine.zoomAt(this.engine.width / 2, this.engine.height / 2, 0.83);
      this.updateZoomIndicator();
    });
    document.getElementById('btn-zoom-fit')?.addEventListener('click', () => {
      this.engine.fitToScreen();
      this.updateZoomIndicator();
    });
    document.getElementById('btn-layers-fit')?.addEventListener('click', () => {
      this.engine.fitToScreen();
      this.updateZoomIndicator();
    });

    // Collaborator Avatars Jump
    document.getElementById('avatar-sarah')?.addEventListener('click', () => {
      this.presence.jumpToCollaborator('collab_sarah');
    });
    document.getElementById('avatar-alex')?.addEventListener('click', () => {
      this.presence.jumpToCollaborator('collab_alex');
    });

    // AI Modal Dialog
    const aiModal = document.getElementById('ai-modal');
    const triggerBtn = document.getElementById('btn-ai-prompt-trigger');
    const closeBtn = document.getElementById('btn-close-ai-modal');
    const runBtn = document.getElementById('btn-run-ai-generate');
    const promptInput = document.getElementById('ai-modal-prompt-input');

    if (triggerBtn && aiModal) {
      triggerBtn.addEventListener('click', () => {
        aiModal.style.display = 'flex';
        promptInput?.focus();
      });
    }

    if (closeBtn && aiModal) {
      closeBtn.addEventListener('click', () => {
        aiModal.style.display = 'none';
      });
    }

    const runGenerate = async () => {
      const text = promptInput.value.trim();
      if (!text) return;
      promptInput.value = '';
      aiModal.style.display = 'none';

      const response = await this.copilot.processPrompt(text);
      const channelId = this.discordState.activeChannelId;
      if (!this.discordState.messages[channelId]) this.discordState.messages[channelId] = [];
      this.discordState.messages[channelId].push({
        id: 'msg_' + Date.now(),
        author: {
          name: 'Canvas AI Copilot',
          role: 'AI Bot',
          badge: 'BOT',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
          color: '#5865F2',
        },
        time: 'Just now',
        content: response,
        reactions: [{ emoji: '✨', count: 1, active: true }],
      });
      this.chat.render();
    };

    if (runBtn) runBtn.addEventListener('click', runGenerate);
    if (promptInput) {
      promptInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') runGenerate();
      });
    }

    // AI Modal Presets
    document.querySelectorAll('.ai-preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const preset = card.dataset.preset;
        aiModal.style.display = 'none';
        this.copilot.processPrompt(preset);
      });
    });

    // Hugging Face Config Modal
    const hfModal = document.getElementById('hf-config-modal');
    const hfOpenBtn = document.getElementById('btn-open-hf-config');
    const hfCloseBtn = document.getElementById('btn-close-hf-modal');
    const hfSaveBtn = document.getElementById('btn-save-hf-config');
    const hfSelect = document.getElementById('hf-model-select');
    const hfInput = document.getElementById('hf-token-input');

    if (hfOpenBtn && hfModal) {
      hfOpenBtn.addEventListener('click', () => {
        hfModal.style.display = 'flex';
        if (hfSelect) hfSelect.value = this.copilot.hfClient.selectedModel;
        if (hfInput) hfInput.value = this.copilot.hfClient.apiKey;
      });
    }

    if (hfCloseBtn && hfModal) {
      hfCloseBtn.addEventListener('click', () => {
        hfModal.style.display = 'none';
      });
    }

    if (hfSaveBtn && hfModal) {
      hfSaveBtn.addEventListener('click', () => {
        if (hfSelect) this.copilot.hfClient.setModel(hfSelect.value);
        if (hfInput) this.copilot.hfClient.setApiKey(hfInput.value);
        hfModal.style.display = 'none';
        alert(`Hugging Face settings saved! Using ${this.copilot.hfClient.selectedModel}`);
      });
    }

    setInterval(() => this.updateZoomIndicator(), 500);
  }

  updateZoomIndicator() {
    const ind = document.getElementById('zoom-indicator');
    if (ind && this.engine) {
      ind.textContent = `${Math.round(this.engine.viewport.zoom * 100)}%`;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new CanvasCordApp();
});
