import { formatCount } from './VideoCard.js';
import { soundEffects } from '../utils/audio.js';
import { currentUser } from '../data/videos.js';

export function createCommentsDrawer() {
  const drawer = document.createElement('div');
  drawer.className = 'tt-comments-drawer';
  drawer.id = 'comments-drawer';

  drawer.innerHTML = `
    <div class="tt-comments-header">
      <div class="tt-comments-title">
        <span>Comments</span>
        <span id="drawer-comments-count" style="color: var(--tt-text-muted); font-weight: 600; font-size: 14px;">(0)</span>
      </div>
      <button class="tt-comments-close-btn" id="drawer-close-btn" title="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Scrollable comments list -->
    <div class="tt-comments-list" id="drawer-comments-list"></div>

    <!-- Comment input section with emoji picker -->
    <div class="tt-comments-input-section">
      <div class="tt-quick-emoji-bar">
        <button class="tt-emoji-chip" data-emoji="🔥">🔥</button>
        <button class="tt-emoji-chip" data-emoji="❤️">❤️</button>
        <button class="tt-emoji-chip" data-emoji="😂">😂</button>
        <button class="tt-emoji-chip" data-emoji="👏">👏</button>
        <button class="tt-emoji-chip" data-emoji="😍">😍</button>
        <button class="tt-emoji-chip" data-emoji="💯">💯</button>
        <button class="tt-emoji-chip" data-emoji="✨">✨</button>
        <button class="tt-emoji-chip" data-emoji="🚀">🚀</button>
      </div>

      <div class="tt-comment-input-box">
        <input type="text" id="drawer-comment-input" placeholder="Add comment..." autocomplete="off" />
        <button class="tt-comment-submit-btn" id="drawer-submit-btn">Post</button>
      </div>
    </div>
  `;

  let currentVideo = null;
  const countEl = drawer.querySelector('#drawer-comments-count');
  const listEl = drawer.querySelector('#drawer-comments-list');
  const inputEl = drawer.querySelector('#drawer-comment-input');
  const submitBtn = drawer.querySelector('#drawer-submit-btn');
  const closeBtn = drawer.querySelector('#drawer-close-btn');

  closeBtn.addEventListener('click', () => {
    drawer.classList.remove('open');
  });

  // Enable/disable Post button based on text
  inputEl.addEventListener('input', () => {
    if (inputEl.value.trim().length > 0) {
      submitBtn.classList.add('active');
    } else {
      submitBtn.classList.remove('active');
    }
  });

  // Quick Emoji Click
  drawer.querySelectorAll('.tt-emoji-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      inputEl.value += chip.dataset.emoji;
      inputEl.focus();
      submitBtn.classList.add('active');
    });
  });

  // Submit comment handler
  function submitComment() {
    const text = inputEl.value.trim();
    if (!text || !currentVideo) return;

    soundEffects.playPop();

    const newComment = {
      id: 'c-' + Date.now(),
      user: {
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
        verified: true
      },
      text: text,
      timestamp: 'Just now',
      likes: 0,
      isLiked: false
    };

    currentVideo.comments.unshift(newComment);
    currentVideo.stats.comments++;

    // Update counts
    countEl.textContent = `(${formatCount(currentVideo.stats.comments)})`;
    const cardCountEl = document.querySelector(`#comment-count-${currentVideo.id}`);
    if (cardCountEl) {
      cardCountEl.textContent = formatCount(currentVideo.stats.comments);
    }

    // Prepend comment row
    const row = renderCommentRow(newComment);
    listEl.prepend(row);

    // Reset input
    inputEl.value = '';
    submitBtn.classList.remove('active');
  }

  submitBtn.addEventListener('click', submitComment);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitComment();
    }
  });

  function renderCommentRow(comment) {
    const row = document.createElement('div');
    row.className = 'tt-comment-row';
    row.id = `comment-${comment.id}`;

    row.innerHTML = `
      <div class="tt-comment-avatar">
        <img src="${comment.user.avatar}" alt="${comment.user.name}" />
      </div>
      <div class="tt-comment-content">
        <div class="tt-comment-user">
          ${comment.user.name}
          ${comment.user.verified ? `
            <svg class="tt-verified-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"></path>
            </svg>` : ''}
        </div>
        <p class="tt-comment-text">${comment.text}</p>
        <div class="tt-comment-footer">
          <span>${comment.timestamp}</span>
          <button class="tt-comment-reply-btn">Reply</button>
        </div>
      </div>
      <button class="tt-comment-like-btn ${comment.isLiked ? 'liked' : ''}" id="clike-${comment.id}" title="Like comment">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span id="clike-count-${comment.id}">${comment.likes > 0 ? formatCount(comment.likes) : ''}</span>
      </button>
    `;

    const likeBtn = row.querySelector(`#clike-${comment.id}`);
    const likeCountSpan = row.querySelector(`#clike-count-${comment.id}`);

    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEffects.playPop();
      comment.isLiked = !comment.isLiked;
      if (comment.isLiked) {
        comment.likes++;
        likeBtn.classList.add('liked');
      } else {
        comment.likes = Math.max(0, comment.likes - 1);
        likeBtn.classList.remove('liked');
      }
      likeCountSpan.textContent = comment.likes > 0 ? formatCount(comment.likes) : '';
    });

    return row;
  }

  return {
    element: drawer,
    open(video) {
      currentVideo = video;
      countEl.textContent = `(${formatCount(video.stats.comments)})`;
      listEl.innerHTML = '';
      if (video.comments && video.comments.length > 0) {
        video.comments.forEach(c => {
          listEl.appendChild(renderCommentRow(c));
        });
      } else {
        listEl.innerHTML = `
          <div style="text-align: center; color: var(--tt-text-muted); padding: 40px 0;">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        `;
      }
      drawer.classList.add('open');
      inputEl.focus();
    },
    close() {
      drawer.classList.remove('open');
    }
  };
}
