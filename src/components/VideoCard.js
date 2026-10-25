import { soundEffects } from '../utils/audio.js';

// Format numbers (e.g. 14200 -> 14.2K, 1200000 -> 1.2M)
export function formatCount(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export function createVideoCard(video, index, onCommentClick, onShareClick, onProfileClick, isGlobalMuted, onToggleMute) {
  const item = document.createElement('div');
  item.className = 'tt-feed-item';
  item.dataset.videoId = video.id;
  item.dataset.index = index;

  item.innerHTML = `
    <div class="tt-video-wrapper" id="wrapper-${video.id}">
      <!-- HTML5 Video Element -->
      <video
        class="tt-video-element"
        id="video-${video.id}"
        src="${video.videoUrl}"
        loop
        playsinline
        preload="metadata"
        ${isGlobalMuted ? 'muted' : ''}
      ></video>

      <!-- Central Play/Pause Watermark Pulse -->
      <div class="tt-play-pulse" id="pulse-${video.id}">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </div>

      <!-- Top Overlay Controls -->
      <div class="tt-video-top-overlay">
        <div class="tt-video-top-controls">
          <button class="tt-top-btn tt-speed-pill" id="speed-btn-${video.id}" title="Playback speed">1x</button>
          <button class="tt-top-btn" id="mute-btn-${video.id}" title="${isGlobalMuted ? 'Unmute' : 'Mute'}">
            <svg class="tt-mute-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${isGlobalMuted 
                ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>'
                : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>'
              }
            </svg>
          </button>
        </div>
      </div>

      <!-- Bottom Overlay Information -->
      <div class="tt-video-bottom-overlay">
        <!-- Creator Header -->
        <div class="tt-creator-row">
          <span class="tt-creator-username" id="creator-btn-${video.id}">
            @${video.author.username}
            ${video.author.verified ? `
              <svg class="tt-verified-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"></path>
              </svg>` : ''}
          </span>
          <button class="tt-creator-follow-btn ${video.isFollowing ? 'following' : ''}" id="follow-btn-${video.id}">
            ${video.isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        <!-- Video Caption & Expandable Tags -->
        <p class="tt-caption" id="caption-${video.id}">
          ${video.caption}
          <span class="tt-caption-tags">
            ${video.tags.map(tag => `<span class="tt-tag-link" data-tag="${tag}">#${tag}</span>`).join(' ')}
          </span>
        </p>

        <!-- Sound Ticker -->
        <div class="tt-sound-bar" id="sound-bar-${video.id}">
          <svg class="tt-sound-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <div class="tt-marquee-wrapper">
            <span class="tt-marquee-text">${video.sound.title} - @${video.sound.author} 🎵</span>
          </div>
        </div>
      </div>

      <!-- Bottom Progress Bar Scrubber -->
      <div class="tt-progress-container" id="progress-container-${video.id}">
        <div class="tt-progress-bar" id="progress-bar-${video.id}">
          <div class="tt-progress-thumb"></div>
        </div>
      </div>

      <!-- Right Action Sidebar -->
      <div class="tt-action-sidebar">
        <!-- Creator Avatar with '+' Badge -->
        <div class="tt-creator-badge-wrapper">
          <button class="tt-creator-avatar-btn" id="avatar-btn-${video.id}" title="View profile">
            <img src="${video.author.avatar}" alt="${video.author.name}" />
          </button>
          <button class="tt-avatar-plus-btn ${video.isFollowing ? 'followed' : ''}" id="avatar-plus-${video.id}" title="Follow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              ${video.isFollowing 
                ? '<polyline points="20 6 9 17 4 12"></polyline>' 
                : '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'
              }
            </svg>
          </button>
        </div>

        <!-- Like Button -->
        <div class="tt-action-item ${video.isLiked ? 'liked' : ''}" id="like-action-${video.id}">
          <button class="tt-action-circle" id="like-btn-${video.id}" title="Like">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <span class="tt-action-count" id="like-count-${video.id}">${formatCount(video.stats.likes)}</span>
        </div>

        <!-- Comment Button -->
        <div class="tt-action-item">
          <button class="tt-action-circle" id="comment-btn-${video.id}" title="Comments">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </button>
          <span class="tt-action-count" id="comment-count-${video.id}">${formatCount(video.stats.comments)}</span>
        </div>

        <!-- Bookmark / Favorite Button -->
        <div class="tt-action-item ${video.isBookmarked ? 'bookmarked' : ''}" id="bookmark-action-${video.id}">
          <button class="tt-action-circle" id="bookmark-btn-${video.id}" title="Add to favorites">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
          <span class="tt-action-count" id="bookmark-count-${video.id}">${formatCount(video.stats.bookmarks)}</span>
        </div>

        <!-- Share Button -->
        <div class="tt-action-item">
          <button class="tt-action-circle" id="share-btn-${video.id}" title="Share">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </button>
          <span class="tt-action-count">${formatCount(video.stats.shares)}</span>
        </div>

        <!-- Rotating Vinyl Record -->
        <div class="tt-vinyl-wrapper" id="vinyl-wrapper-${video.id}" title="Sound: ${video.sound.title}">
          <div class="tt-vinyl-disc" id="vinyl-disc-${video.id}">
            <img class="tt-vinyl-art" src="${video.sound.cover}" alt="Sound cover" />
          </div>
          <!-- Musical note particle container -->
          <div class="tt-music-notes-container" id="notes-${video.id}"></div>
        </div>
      </div>
    </div>
  `;

  // Attach interactive behaviors
  setupVideoInteractions(item, video, onCommentClick, onShareClick, onProfileClick, onToggleMute);

  return item;
}

function setupVideoInteractions(item, video, onCommentClick, onShareClick, onProfileClick, onToggleMute) {
  const vid = item.querySelector(`#video-${video.id}`);
  const wrapper = item.querySelector(`#wrapper-${video.id}`);
  const pulse = item.querySelector(`#pulse-${video.id}`);
  const progressBar = item.querySelector(`#progress-bar-${video.id}`);
  const progressContainer = item.querySelector(`#progress-container-${video.id}`);
  const likeAction = item.querySelector(`#like-action-${video.id}`);
  const likeBtn = item.querySelector(`#like-btn-${video.id}`);
  const likeCount = item.querySelector(`#like-count-${video.id}`);
  const bookmarkAction = item.querySelector(`#bookmark-action-${video.id}`);
  const bookmarkBtn = item.querySelector(`#bookmark-btn-${video.id}`);
  const bookmarkCount = item.querySelector(`#bookmark-count-${video.id}`);
  const commentBtn = item.querySelector(`#comment-btn-${video.id}`);
  const shareBtn = item.querySelector(`#share-btn-${video.id}`);
  const followBtn = item.querySelector(`#follow-btn-${video.id}`);
  const avatarPlus = item.querySelector(`#avatar-plus-${video.id}`);
  const avatarBtn = item.querySelector(`#avatar-btn-${video.id}`);
  const creatorBtn = item.querySelector(`#creator-btn-${video.id}`);
  const speedBtn = item.querySelector(`#speed-btn-${video.id}`);
  const muteBtn = item.querySelector(`#mute-btn-${video.id}`);
  const vinylDisc = item.querySelector(`#vinyl-disc-${video.id}`);
  const notesContainer = item.querySelector(`#notes-${video.id}`);

  // Progress Bar Time Updates
  vid.addEventListener('timeupdate', () => {
    if (vid.duration) {
      const pct = (vid.currentTime / vid.duration) * 100;
      progressBar.style.width = `${pct}%`;
    }
  });

  // Seeking on Progress Bar Click
  progressContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    const rect = progressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    vid.currentTime = pos * vid.duration;
  });

  // Tap vs Double-Tap Logic
  let lastTapTime = 0;
  let tapTimeout = null;

  wrapper.addEventListener('click', (e) => {
    // Avoid triggering when clicking action buttons or controls
    if (e.target.closest('.tt-action-sidebar') || 
        e.target.closest('.tt-video-bottom-overlay') || 
        e.target.closest('.tt-video-top-overlay') ||
        e.target.closest('.tt-progress-container')) {
      return;
    }

    const currentTime = Date.now();
    const tapLength = currentTime - lastTapTime;

    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected!
      clearTimeout(tapTimeout);
      handleDoubleTapLike(e, wrapper);
    } else {
      // Single tap toggle play/pause
      tapTimeout = setTimeout(() => {
        togglePlayPause();
      }, 300);
    }
    lastTapTime = currentTime;
  });

  function togglePlayPause() {
    if (vid.paused) {
      vid.play();
      pulse.classList.remove('active');
      vinylDisc.classList.remove('paused');
    } else {
      vid.pause();
      pulse.classList.add('active');
      vinylDisc.classList.add('paused');
    }
  }

  function handleDoubleTapLike(e, wrapperEl) {
    // Spawn heart burst animation at click coordinate
    const rect = wrapperEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    spawnBurstHeart(wrapperEl, x, y);
    soundEffects.playPop();

    // Toggle liked state if not already liked
    if (!video.isLiked) {
      video.isLiked = true;
      video.stats.likes++;
      likeAction.classList.add('liked');
      likeCount.textContent = formatCount(video.stats.likes);
    }
  }

  function spawnBurstHeart(parent, x, y) {
    const heart = document.createElement('div');
    heart.className = 'tt-burst-heart';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    `;
    parent.appendChild(heart);
    setTimeout(() => heart.remove(), 850);
  }

  // Like Button Click
  likeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEffects.playPop();
    video.isLiked = !video.isLiked;
    if (video.isLiked) {
      video.stats.likes++;
      likeAction.classList.add('liked');
    } else {
      video.stats.likes = Math.max(0, video.stats.likes - 1);
      likeAction.classList.remove('liked');
    }
    likeCount.textContent = formatCount(video.stats.likes);
  });

  // Bookmark Button Click
  bookmarkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEffects.playFavorite();
    video.isBookmarked = !video.isBookmarked;
    if (video.isBookmarked) {
      video.stats.bookmarks++;
      bookmarkAction.classList.add('bookmarked');
    } else {
      video.stats.bookmarks = Math.max(0, video.stats.bookmarks - 1);
      bookmarkAction.classList.remove('bookmarked');
    }
    bookmarkCount.textContent = formatCount(video.stats.bookmarks);
  });

  // Follow Button Toggle
  function toggleFollow(e) {
    e.stopPropagation();
    soundEffects.playFollow();
    video.isFollowing = !video.isFollowing;
    if (video.isFollowing) {
      followBtn.textContent = 'Following';
      followBtn.classList.add('following');
      avatarPlus.classList.add('followed');
      avatarPlus.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else {
      followBtn.textContent = 'Follow';
      followBtn.classList.remove('following');
      avatarPlus.classList.remove('followed');
      avatarPlus.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
    }
  }

  followBtn.addEventListener('click', toggleFollow);
  avatarPlus.addEventListener('click', toggleFollow);

  // Comments Click
  commentBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEffects.playClick();
    onCommentClick(video);
  });

  // Share Click
  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEffects.playClick();
    onShareClick(video);
  });

  // Profile Click
  avatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onProfileClick(video.author);
  });
  creatorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onProfileClick(video.author);
  });

  // Speed Pill Toggle (1x -> 1.5x -> 2x -> 1x)
  const speeds = [1, 1.5, 2];
  let currentSpeedIdx = 0;
  speedBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEffects.playClick();
    currentSpeedIdx = (currentSpeedIdx + 1) % speeds.length;
    const speed = speeds[currentSpeedIdx];
    vid.playbackRate = speed;
    speedBtn.textContent = `${speed}x`;
  });

  // Mute / Unmute Toggle
  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onToggleMute();
  });

  // Periodic floating musical notes from spinning vinyl
  setInterval(() => {
    if (!vid.paused && notesContainer) {
      const note = document.createElement('div');
      note.className = 'tt-music-note';
      const symbols = ['♪', '♫', '♩', '♬'];
      note.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      notesContainer.appendChild(note);
      setTimeout(() => note.remove(), 2400);
    }
  }, 2200);
}
