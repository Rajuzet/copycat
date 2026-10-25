import { soundEffects } from '../utils/audio.js';

export function createProfileModal(onSelectVideo) {
  const modal = document.createElement('div');
  modal.className = 'tt-modal-backdrop';
  modal.id = 'profile-modal';

  modal.innerHTML = `
    <div class="tt-modal-window">
      <div class="tt-modal-header">
        <h2 class="tt-modal-title" id="profile-title">Profile</h2>
        <button class="tt-comments-close-btn" id="profile-close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="tt-modal-body">
        <!-- Hero Header -->
        <div class="tt-profile-hero">
          <div class="tt-profile-avatar-large">
            <img id="profile-avatar-img" src="" alt="Avatar" />
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <h3 id="profile-name" style="font-size: 20px; font-weight: 800;"></h3>
              <span id="profile-verified"></span>
            </div>
            <p id="profile-handle" style="color: var(--tt-text-muted); font-size: 13px; margin-bottom: 8px;"></p>
            <button class="tt-btn-primary" id="profile-action-btn" style="padding: 6px 20px; font-size: 13px;">Follow</button>
          </div>
        </div>

        <!-- Follower stats -->
        <div class="tt-profile-stats">
          <div class="tt-stat-item">
            <span class="tt-stat-num" id="profile-following">184</span>
            <span class="tt-stat-lbl">Following</span>
          </div>
          <div class="tt-stat-item">
            <span class="tt-stat-num" id="profile-followers">48.2K</span>
            <span class="tt-stat-lbl">Followers</span>
          </div>
          <div class="tt-stat-item">
            <span class="tt-stat-num" id="profile-likes">3.1M</span>
            <span class="tt-stat-lbl">Likes</span>
          </div>
        </div>

        <!-- Bio text -->
        <p id="profile-bio" style="font-size: 13px; color: var(--tt-text-secondary); line-height: 1.5; margin-bottom: 12px;"></p>

        <!-- Videos Grid Header -->
        <div style="border-top: 1px solid var(--tt-border-subtle); padding-top: 16px;">
          <h4 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--tt-text-muted); margin-bottom: 12px;">
            Videos
          </h4>
          <div class="tt-profile-grid" id="profile-videos-grid"></div>
        </div>
      </div>
    </div>
  `;

  const closeBtn = modal.querySelector('#profile-close-btn');
  const avatarImg = modal.querySelector('#profile-avatar-img');
  const nameEl = modal.querySelector('#profile-name');
  const handleEl = modal.querySelector('#profile-handle');
  const bioEl = modal.querySelector('#profile-bio');
  const verifiedEl = modal.querySelector('#profile-verified');
  const followersEl = modal.querySelector('#profile-followers');
  const followingEl = modal.querySelector('#profile-following');
  const likesEl = modal.querySelector('#profile-likes');
  const actionBtn = modal.querySelector('#profile-action-btn');
  const gridEl = modal.querySelector('#profile-videos-grid');

  function closeModal() {
    modal.classList.remove('open');
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  return {
    element: modal,
    open(author, allVideos = []) {
      avatarImg.src = author.avatar;
      nameEl.textContent = author.name;
      handleEl.textContent = `@${author.username}`;
      bioEl.textContent = author.bio || 'Digital creator on TikTok.';
      followersEl.textContent = author.followers || '120K';
      followingEl.textContent = author.following || '142';
      likesEl.textContent = author.likes || '1.8M';

      if (author.verified) {
        verifiedEl.innerHTML = `
          <svg class="tt-verified-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"></path>
          </svg>
        `;
      } else {
        verifiedEl.innerHTML = '';
      }

      // Populate grid with author videos or fallback
      gridEl.innerHTML = '';
      const creatorVideos = allVideos.filter(v => v.author.username === author.username);
      const videosToShow = creatorVideos.length > 0 ? creatorVideos : allVideos.slice(0, 3);

      videosToShow.forEach(v => {
        const thumb = document.createElement('div');
        thumb.className = 'tt-profile-thumb';
        thumb.innerHTML = `
          <video src="${v.videoUrl}" muted preload="metadata"></video>
          <div class="tt-profile-thumb-overlay">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>${(v.stats.likes / 1000).toFixed(0)}K</span>
          </div>
        `;

        thumb.addEventListener('mouseenter', () => {
          const vEl = thumb.querySelector('video');
          vEl.play().catch(() => {});
        });
        thumb.addEventListener('mouseleave', () => {
          const vEl = thumb.querySelector('video');
          vEl.pause();
          vEl.currentTime = 0;
        });

        thumb.addEventListener('click', () => {
          closeModal();
          onSelectVideo(v.id);
        });

        gridEl.appendChild(thumb);
      });

      let isFollowing = false;
      actionBtn.textContent = 'Follow';
      actionBtn.onclick = () => {
        soundEffects.playFollow();
        isFollowing = !isFollowing;
        actionBtn.textContent = isFollowing ? 'Following' : 'Follow';
        actionBtn.style.background = isFollowing ? 'var(--tt-surface-hover)' : 'var(--tt-red)';
      };

      modal.classList.add('open');
    },
    close: closeModal
  };
}
