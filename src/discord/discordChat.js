/**
 * CanvasCord Discord Chat Feed, AI Copilot & Interactive Canvas Bridge
 */

export class DiscordChat {
  constructor(container, state, onCopilotAction, onPinToCanvas, onLocateElement) {
    this.container = container;
    this.state = state;
    this.onCopilotAction = onCopilotAction || (() => {});
    this.onPinToCanvas = onPinToCanvas || (() => {});
    this.onLocateElement = onLocateElement || (() => {});
  }

  render() {
    if (!this.container) return;

    const server = this.state.servers.find(s => s.id === this.state.activeServerId);
    const channel = server?.channels.find(c => c.id === this.state.activeChannelId);
    const messages = this.state.messages[this.state.activeChannelId] || [];

    this.container.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-title">
          <span class="channel-hash">#</span>
          <span class="channel-name">${channel ? channel.name : 'general'}</span>
        </div>
        <div class="chat-header-topic">Collaborative design feedback, live canvas pins & @copilot</div>
      </div>

      <div class="chat-messages-container" id="chat-messages-list">
        ${messages.map(msg => this.renderMessage(msg)).join('')}
      </div>

      <!-- Quick AI Copilot Prompts Bar -->
      <div class="copilot-quick-prompts">
        <span class="prompt-chip" data-cmd="@copilot generate saas hero">✨ Hero Section</span>
        <span class="prompt-chip" data-cmd="@copilot generate pricing">💳 Pricing Card</span>
        <span class="prompt-chip" data-cmd="@copilot generate mobile">📱 Mobile Frame</span>
        <span class="prompt-chip" data-cmd="@copilot generate checkout">🛒 Checkout Dialog</span>
        <span class="prompt-chip" data-cmd="@copilot generate stats">📊 Analytics KPI</span>
        <span class="prompt-chip" data-cmd="@copilot palette cyberpunk">🎨 Cyberpunk</span>
        <span class="prompt-chip" data-cmd="@copilot audit">🔍 Audit Design</span>
      </div>

      <div class="chat-input-bar">
        <div class="chat-input-wrapper">
          <button class="chat-attach-btn" title="Add File / Vector Attachment">+</button>
          <input 
            type="text" 
            id="chat-message-input" 
            placeholder="Message #${channel ? channel.name : 'channel'} (type @copilot to generate UI)" 
            autocomplete="off"
          />
          <button class="chat-send-btn" id="btn-send-message">Send</button>
        </div>
      </div>
    `;

    this.bindEvents();
    this.scrollToBottom();
  }

  renderMessage(msg) {
    const isBot = msg.author.badge === 'BOT';

    return `
      <div class="chat-message ${isBot ? 'is-bot' : ''}" data-msg-id="${msg.id}">
        <img class="chat-avatar" src="${msg.author.avatar}" alt="${msg.author.name}" />
        <div class="chat-message-body">
          <div class="chat-meta">
            <span class="chat-author-name" style="color: ${msg.author.color || '#F2F3F5'}">${msg.author.name}</span>
            ${msg.author.badge ? `<span class="chat-role-badge ${msg.author.badge.toLowerCase()}">${msg.author.badge}</span>` : ''}
            <span class="chat-timestamp">${msg.time}</span>

            <!-- Message Action Buttons (Synergy with Canvas) -->
            <div class="msg-synergy-actions">
              <button class="msg-mini-action btn-pin-canvas" title="Pin feedback to live canvas" data-text="${this.escapeHtml(msg.content)}" data-author="${msg.author.name}">
                📍 Pin to Canvas
              </button>
              ${!isBot ? `
                <button class="msg-mini-action btn-apply-ai" title="Apply suggestion to canvas with AI" data-text="${this.escapeHtml(msg.content)}">
                  ✨ Apply with AI
                </button>
              ` : ''}
            </div>
          </div>

          <div class="chat-text">${this.formatMessageText(msg.content)}</div>

          ${msg.targetElementId ? `
            <div class="shared-element-pill">
              <span>🎯 Layer Reference: <strong>${msg.targetElementName || 'Element'}</strong></span>
              <button class="btn-locate-canvas" data-el-id="${msg.targetElementId}">Locate on Canvas</button>
            </div>
          ` : ''}
          
          ${msg.reactions && msg.reactions.length > 0 ? `
            <div class="chat-reactions-row">
              ${msg.reactions.map((r, idx) => `
                <button class="chat-reaction ${r.active ? 'active' : ''}" data-idx="${idx}">
                  <span>${r.emoji}</span>
                  <span class="reaction-count">${r.count}</span>
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  escapeHtml(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  formatMessageText(text) {
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>')
      .replace(/\n/g, '<br/>');

    formatted = formatted.replace(
      /@(copilot|Sarah Chen|Alex Rivera)/g,
      '<span class="chat-mention">@$1</span>'
    );

    return formatted;
  }

  scrollToBottom() {
    const el = this.container.querySelector('#chat-messages-list');
    if (el) el.scrollTop = el.scrollHeight;
  }

  bindEvents() {
    const input = this.container.querySelector('#chat-message-input');
    const sendBtn = this.container.querySelector('#btn-send-message');

    const handleSend = () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      const channelId = this.state.activeChannelId;
      if (!this.state.messages[channelId]) this.state.messages[channelId] = [];

      const userMsg = {
        id: 'msg_' + Date.now(),
        author: {
          name: this.state.currentUser.name,
          role: 'Designer',
          badge: 'YOU',
          avatar: this.state.currentUser.avatar,
          color: '#EB459E',
        },
        time: 'Just now',
        content: text,
        reactions: [],
      };
      this.state.messages[channelId].push(userMsg);
      this.render();

      if (text.toLowerCase().includes('@copilot')) {
        this.handleCopilotBot(text);
      }
    };

    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    if (input) {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleSend();
      });
    }

    this.container.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (input) {
          input.value = chip.dataset.cmd;
          handleSend();
        }
      });
    });

    // Pin to canvas
    this.container.querySelectorAll('.btn-pin-canvas').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        const author = btn.dataset.author;
        this.onPinToCanvas(text, author);
        btn.textContent = '✓ Pinned!';
        setTimeout(() => (btn.textContent = '📍 Pin to Canvas'), 1500);
      });
    });

    // Apply with AI
    this.container.querySelectorAll('.btn-apply-ai').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        btn.textContent = '⏳ Applying...';
        this.handleCopilotBot(text);
      });
    });

    // Locate element on canvas
    this.container.querySelectorAll('.btn-locate-canvas').forEach(btn => {
      btn.addEventListener('click', () => {
        this.onLocateElement(btn.dataset.elId);
      });
    });

    // Reaction click
    this.container.querySelectorAll('.chat-reaction').forEach(btn => {
      btn.addEventListener('click', () => {
        const countSpan = btn.querySelector('.reaction-count');
        let count = parseInt(countSpan.textContent, 10);
        if (btn.classList.contains('active')) {
          btn.classList.remove('active');
          countSpan.textContent = count - 1;
        } else {
          btn.classList.add('active');
          countSpan.textContent = count + 1;
        }
      });
    });
  }

  async handleCopilotBot(promptText) {
    const channelId = this.state.activeChannelId;

    const botResponse = await this.onCopilotAction(promptText);

    const botMsg = {
      id: 'msg_bot_' + Date.now(),
      author: {
        name: 'Canvas AI Copilot',
        role: 'AI Bot',
        badge: 'BOT',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
        color: '#5865F2',
      },
      time: 'Just now',
      content: botResponse || '✨ Successfully generated and synthesized elements directly on your live canvas!',
      reactions: [{ emoji: '🚀', count: 1, active: true }],
    };

    this.state.messages[channelId].push(botMsg);
    this.render();
  }
}
