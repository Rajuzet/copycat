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
import { createSaaSHeroTemplate } from './ai/templates.js';
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
        <nav class="guild-rail">
          <div class="guild-item active" data-server="srv_design" title="Design Guild">
            <div class="guild-pill"></div>
            <div class="guild-icon">🎨</div>
            <span class="guild-badge">3</span>
          </div>
          <div class="guild-item" data-server="srv_product" title="Acme Product Team">
            <div class="guild-pill"></div>
            <div class="guild-icon">🚀</div>
          </div>
          <div class="guild-item" data-server="srv_ai" title="AI Innovation Lab">
            <div class="guild-pill"></div>
            <div class="guild-icon">✨</div>
          </div>
          <div class="guild-separator"></div>
          <div class="guild-item action" id="btn-add-server" title="Add a Server">
            <div class="guild-icon">+</div>
          </div>
          <div class="guild-item action" id="btn-explore-servers" title="Explore Public Hubs">
            <div class="guild-icon">🧭</div>
          </div>
        </nav>

        <!-- 2. Context Sidebar (Switchable: Channels vs Figma Layers) -->
        <aside class="context-sidebar">
          <div class="sidebar-switch-tabs">
            <button class="switch-tab active" data-mode="channels">💬 Channels</button>
            <button class="switch-tab" data-mode="layers">🎨 Layers</button>
          </div>

          <!-- Channels Mode View -->
          <div class="sidebar-panel-view active" id="view-channels">
            <div class="server-header">
              <span class="server-name">Design Guild</span>
              <span class="server-badge-verified">✓</span>
            </div>

            <div class="channels-section">
              <div class="channel-group-title">
                <span>TEXT CHANNELS</span>
                <span class="add-channel-btn">+</span>
              </div>
              <div class="channels-list">
                <div class="channel-row active" data-chan="chan_critique">
                  <span class="chan-hash">#</span>
                  <span class="chan-name">design-critique</span>
                  <span class="chan-badge">3</span>
                </div>
                <div class="channel-row" data-chan="chan_general">
                  <span class="chan-hash">#</span>
                  <span class="chan-name">general-chat</span>
                </div>
                <div class="channel-row" data-chan="chan_ai_lab">
                  <span class="chan-hash">#</span>
                  <span class="chan-name">ai-prompt-lab</span>
                  <span class="chan-badge">1</span>
                </div>
                <div class="channel-row" data-chan="chan_assets">
                  <span class="chan-hash">#</span>
                  <span class="chan-name">asset-drops</span>
                </div>
              </div>

              <div class="channel-group-title" style="margin-top:16px">
                <span>VOICE HUDDLES</span>
              </div>
              <div class="channels-list">
                <div class="channel-row voice active" data-chan="chan_huddle">
                  <span class="chan-hash">🔊</span>
                  <span class="chan-name">Design Huddle</span>
                  <div class="voice-channel-users">
                    <span class="user-pill-speaking">3 in call</span>
                  </div>
                </div>
                <div class="channel-row voice" data-chan="chan_focus">
                  <span class="chan-hash">🔊</span>
                  <span class="chan-name">Silent Focus</span>
                </div>
              </div>
            </div>

            <!-- User Status Footer in Discord Sidebar -->
            <div class="user-status-footer">
              <div class="user-avatar-wrap">
                <img src="${this.discordState.currentUser.avatar}" class="user-status-avatar" alt="User" />
                <span class="status-indicator online"></span>
              </div>
              <div class="user-names">
                <span class="user-display-name">You (Lead)</span>
                <span class="user-subtext">Online</span>
              </div>
              <div class="user-quick-buttons">
                <button class="footer-btn" id="btn-toggle-mic" title="Mute/Unmute">🎙️</button>
                <button class="footer-btn" id="btn-toggle-deaf" title="Deafen">🎧</button>
              </div>
            </div>
          </div>

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
            </div>
            <div class="ai-input-wrap">
              <input type="text" id="ai-modal-prompt-input" placeholder="e.g. Generate dark mode checkout card with Apple Pay button" />
              <button class="ai-generate-btn" id="btn-run-ai-generate">Synthesize</button>
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
      }
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

    // 2. Properties Panel
    const propsContainer = document.getElementById('properties-panel-container');
    this.propertiesPanel = new PropertiesPanel(
      propsContainer,
      this.engine,
      () => {
        this.layersTree.render();
        this.engine.requestRender();
      }
    );

    // 3. AI Copilot
    this.copilot = new AICopilot(this.engine, () => {
      this.layersTree.render();
      this.propertiesPanel.render();
    });

    // 4. Discord Chat
    const chatContainer = document.getElementById('discord-chat-container');
    this.chat = new DiscordChat(chatContainer, this.discordState, prompt => {
      return this.copilot.processPrompt(prompt);
    });
    this.chat.render();

    // 5. Voice Huddle
    const voiceContainer = document.getElementById('voice-huddle-bar-container');
    this.voiceHuddle = new VoiceHuddle(voiceContainer, this.discordState.voice, isMuted => {
      const micBtn = document.getElementById('btn-toggle-mic');
      if (micBtn) micBtn.textContent = isMuted ? '🔇' : '🎙️';
    });
    this.voiceHuddle.render();

    // 6. Multiplayer Presence
    this.presence = new MultiplayerPresence(this.engine);
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

    // Channel Switching
    document.querySelectorAll('.channel-row').forEach(row => {
      row.addEventListener('click', () => {
        document.querySelectorAll('.channel-row').forEach(r => r.classList.remove('active'));
        row.classList.add('active');
        this.discordState.activeChannelId = row.dataset.chan;
        this.chat.render();
      });
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

    const runGenerate = () => {
      const text = promptInput.value.trim();
      if (!text) return;
      promptInput.value = '';
      aiModal.style.display = 'none';

      const response = this.copilot.processPrompt(text);
      // Also post to active Discord chat
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

    // Update Zoom Indicator on canvas actions
    setInterval(() => this.updateZoomIndicator(), 500);
  }

  updateZoomIndicator() {
    const ind = document.getElementById('zoom-indicator');
    if (ind && this.engine) {
      ind.textContent = `${Math.round(this.engine.viewport.zoom * 100)}%`;
    }
  }
}

// Start application once DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new CanvasCordApp();
});

