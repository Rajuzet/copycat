import './style.css';
import { initialVideos, currentUser, suggestedAccounts, trendingTags } from './data/videos.js';
import { createVideoCard } from './components/VideoCard.js';
import { createCommentsDrawer } from './components/CommentsDrawer.js';
import { createUploadModal } from './components/UploadModal.js';
import { createShareModal } from './components/ShareModal.js';
import { createProfileModal } from './components/ProfileModal.js';
import { soundEffects } from './utils/audio.js';

// Application State
let videos = [...initialVideos];
let isGlobalMuted = true; // Default muted for browser autoplay policy compliance
let activeVideoIndex = 0;
let commentsDrawer = null;
let uploadModal = null;
let shareModal = null;
let profileModal = null;
let currentFilterTag = null;

// Toast Notification System
function showToast(message) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'tt-toast';
    toast.id = 'global-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// App Initialization
function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- Top Header -->
    <header class="tt-header">
      <!-- Logo -->
      <a href="#" class="tt-logo" id="logo-btn">
        <div class="tt-logo-icon">
          <svg viewBox="0 0 48 48" fill="none">
            <path fill="#25F4EE" d="M23 4v24a8 8 0 1 1-8-8c.7 0 1.4.1 2 .3V14a14 14 0 1 0 12 13.8V16a12 12 0 0 0 7.8 2.8V13a6.8 6.8 0 0 1-6.8-6.8V4h-7z"/>
            <path fill="#FE2C55" d="M26 6v24a8 8 0 1 1-8-8c.7 0 1.4.1 2 .3V16a14 14 0 1 0 12 13.8V18a12 12 0 0 0 7.8 2.8V15a6.8 6.8 0 0 1-6.8-6.8V6h-7z"/>
            <path fill="#FFFFFF" d="M24.5 5v24a8 8 0 1 1-8-8c.7 0 1.4.1 2 .3V15a14 14 0 1 0 12 13.8V17a12 12 0 0 0 7.8 2.8V14a6.8 6.8 0 0 1-6.8-6.8V5h-7z"/>
          </svg>
        </div>
        <div class="tt-logo-text">
          TikTok
          <span class="tt-logo-badge">Clone</span>
        </div>
      </a>

      <!-- Center Search -->
      <div class="tt-search-container">
        <div class="tt-search-box">
          <input type="text" id="main-search-input" placeholder="Search accounts, hashtags, and videos..." autocomplete="off" />
          <div class="tt-search-divider"></div>
          <button class="tt-search-btn" id="search-action-btn" title="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        <!-- Live Search Dropdown -->
        <div class="tt-search-dropdown" id="search-dropdown">
          <div class="tt-search-dropdown-header">Trending Searches</div>
          <div class="tt-search-item" data-query="dance">
            <span class="tt-search-item-tag">#</span>
            <span class="tt-search-item-text">dancechallenge</span>
            <span class="tt-search-item-count">4.8B</span>
          </div>
          <div class="tt-search-item" data-query="nature">
            <span class="tt-search-item-tag">#</span>
            <span class="tt-search-item-text">timelapse</span>
            <span class="tt-search-item-count">980M</span>
          </div>
          <div class="tt-search-item" data-query="beats">
            <span class="tt-search-item-tag">#</span>
            <span class="tt-search-item-text">synthwave</span>
            <span class="tt-search-item-count">1.4B</span>
          </div>
          <div class="tt-search-item" data-query="jellyfish">
            <span class="tt-search-item-tag">#</span>
            <span class="tt-search-item-text">deepsea</span>
            <span class="tt-search-item-count">620M</span>
          </div>
        </div>
      </div>

      <!-- Right Header Actions -->
      <div class="tt-header-actions">
        <button class="tt-upload-btn" id="header-upload-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Upload</span>
        </button>

        <!-- Messages Button -->
        <button class="tt-icon-btn" id="header-messages-btn" title="Messages">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="tt-badge-dot"></span>
        </button>

        <!-- Notifications Inbox Button -->
        <button class="tt-icon-btn" id="header-inbox-btn" title="Inbox">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="tt-badge-dot"></span>
        </button>

        <!-- Current User Avatar -->
        <div class="tt-header-avatar" id="header-avatar-btn" title="${currentUser.name} (@${currentUser.username})">
          <img src="${currentUser.avatar}" alt="${currentUser.name}" />
        </div>
      </div>
    </header>

    <!-- Main Content: Sidebar + Center Feed -->
    <main class="tt-main">
      <!-- Left Sidebar -->
      <aside class="tt-sidebar">
        <!-- Navigation Section -->
        <div class="tt-nav-section">
          <div class="tt-nav-item active" id="nav-fyp">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z"/>
            </svg>
            <span>For You</span>
          </div>

          <div class="tt-nav-item" id="nav-following">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Following</span>
          </div>

          <div class="tt-nav-item" id="nav-explore">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
            <span>Explore</span>
          </div>

          <div class="tt-nav-item" id="nav-live">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 7l-7 5 7 5V7z"></path>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            <span>LIVE</span>
            <span class="tt-live-pill">LIVE</span>
          </div>

          <div class="tt-nav-item" id="nav-profile">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Profile</span>
          </div>
        </div>

        <div class="tt-sidebar-divider"></div>

        <!-- Suggested Accounts -->
        <div class="tt-sidebar-title">Suggested Accounts</div>
        <div class="tt-nav-section" id="suggested-accounts-list">
          ${suggestedAccounts.map((acc, idx) => `
            <div class="tt-account-item" data-acc-idx="${idx}">
              <div class="tt-account-avatar">
                <img src="${acc.avatar}" alt="${acc.name}" />
              </div>
              <div class="tt-account-info">
                <div class="tt-account-name">
                  ${acc.name}
                  ${acc.verified ? `
                    <svg class="tt-verified-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"></path>
                    </svg>` : ''}
                </div>
                <div class="tt-account-username">@${acc.username}</div>
              </div>
              <button class="tt-sidebar-follow-btn ${acc.isFollowing ? 'following' : ''}" data-acc-idx="${idx}">
                ${acc.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          `).join('')}
        </div>

        <div class="tt-sidebar-divider"></div>

        <!-- Trending Topics / Hashtags -->
        <div class="tt-sidebar-title">Discover Topics</div>
        <div style="padding: 6px 10px;">
          ${trendingTags.map(t => `
            <div class="tt-tag-pill" data-tag="${t.tag}">
              <span style="color: var(--tt-cyan); font-weight: 800;">#</span>
              <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.tag}</span>
              <span style="font-size: 11px; color: var(--tt-text-muted);">${t.count}</span>
            </div>
          `).join('')}
        </div>

        <div class="tt-sidebar-footer">
          <p>© 2026 TikTok Clone - Copycat</p>
          <p><a href="#">Community Guidelines</a> · <a href="#">Terms</a> · <a href="#">Privacy</a></p>
        </div>
      </aside>

      <!-- Center Feed Area -->
      <section class="tt-feed-container">
        <!-- Floating Up/Down Arrow Navigation Buttons -->
        <div class="tt-feed-nav-controls">
          <button class="tt-nav-arrow-btn" id="nav-arrow-up" title="Previous video (Up Arrow / W)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
          <button class="tt-nav-arrow-btn" id="nav-arrow-down" title="Next video (Down Arrow / S)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        <!-- Filter banner (when filtering by tag) -->
        <div id="filter-banner" style="display: none; position: absolute; top: 12px; z-index: 30; background: var(--tt-surface-glass); backdrop-filter: blur(12px); border: 1px solid var(--tt-border); padding: 6px 14px; border-radius: var(--radius-full); font-size: 13px; align-items: center; gap: 8px;">
          <span>Filtering by: <b id="filter-tag-name" style="color: var(--tt-cyan);"></b></span>
          <button id="clear-filter-btn" style="color: var(--tt-red); font-weight: 700; margin-left: 6px;">✕ Clear</button>
        </div>

        <!-- Vertical Snap Scroller -->
        <div class="tt-feed-scroller" id="feed-scroller"></div>

        <!-- Keyboard Shortcuts Helper Pill -->
        <div class="tt-shortcuts-pill">
          <span><span class="tt-kbd">↑</span> <span class="tt-kbd">↓</span> Scroll</span>
          <span><span class="tt-kbd">Space</span> Play/Pause</span>
          <span><span class="tt-kbd">M</span> Mute</span>
          <span><span class="tt-kbd">L</span> Like</span>
          <span><span class="tt-kbd">C</span> Comments</span>
        </div>
      </section>
    </main>
  `;

  // Initialize Sub-components
  commentsDrawer = createCommentsDrawer();
  app.appendChild(commentsDrawer.element);

  uploadModal = createUploadModal(handleUploadSuccess, showToast);
  app.appendChild(uploadModal.element);

  shareModal = createShareModal(showToast);
  app.appendChild(shareModal.element);

  profileModal = createProfileModal(scrollToVideoId);
  app.appendChild(profileModal.element);

  // Render Feed
  renderFeed();

  // Attach Event Handlers
  setupHeaderEvents();
  setupSidebarEvents();
  setupKeyboardShortcuts();
}

// Render Video Feed Items
function renderFeed() {
  const scroller = document.getElementById('feed-scroller');
  scroller.innerHTML = '';

  let filtered = videos;
  if (currentFilterTag) {
    filtered = videos.filter(v => v.tags.includes(currentFilterTag.toLowerCase()));
  }

  if (filtered.length === 0) {
    scroller.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--tt-text-muted); text-align: center; padding: 20px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px;">No videos found</p>
        <p style="font-size: 13px;">Try searching for another hashtag or clear filter</p>
      </div>
    `;
    return;
  }

  filtered.forEach((video, idx) => {
    const card = createVideoCard(
      video,
      idx,
      (v) => commentsDrawer.open(v),
      (v) => shareModal.open(v),
      (author) => profileModal.open(author, videos),
      isGlobalMuted,
      toggleGlobalMute
    );

    // Tag links inside caption
    card.querySelectorAll('.tt-tag-link').forEach(tagEl => {
      tagEl.addEventListener('click', (e) => {
        e.stopPropagation();
        filterByTag(tagEl.dataset.tag);
      });
    });

    scroller.appendChild(card);
  });

  setupIntersectionObserver();
}

// Global Mute Toggle
function toggleGlobalMute() {
  isGlobalMuted = !isGlobalMuted;
  soundEffects.playClick();

  // Update all video elements
  document.querySelectorAll('.tt-video-element').forEach(vid => {
    vid.muted = isGlobalMuted;
  });

  // Update mute button icons
  document.querySelectorAll('.tt-mute-icon').forEach(icon => {
    icon.innerHTML = isGlobalMuted
      ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>'
      : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
  });

  showToast(isGlobalMuted ? '🔇 Audio muted' : '🔊 Audio unmuted');
}

// Intersection Observer for Vertical AutoPlay
let observer = null;
function setupIntersectionObserver() {
  if (observer) observer.disconnect();

  const options = {
    root: document.getElementById('feed-scroller'),
    threshold: 0.65
  };

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const vid = entry.target.querySelector('video');
      const disc = entry.target.querySelector('.tt-vinyl-disc');
      const pulse = entry.target.querySelector('.tt-play-pulse');

      if (!vid) return;

      if (entry.isIntersecting) {
        activeVideoIndex = parseInt(entry.target.dataset.index, 10);
        vid.muted = isGlobalMuted;
        vid.play().catch(() => {
          // Autoplay policy prevented playback, keep paused
        });
        if (pulse) pulse.classList.remove('active');
        if (disc) disc.classList.remove('paused');
      } else {
        vid.pause();
        vid.currentTime = 0;
        if (disc) disc.classList.add('paused');
      }
    });
  }, options);

  document.querySelectorAll('.tt-feed-item').forEach(item => {
    observer.observe(item);
  });
}

// Tag Filtering
function filterByTag(tag) {
  currentFilterTag = tag;
  const banner = document.getElementById('filter-banner');
  const tagName = document.getElementById('filter-tag-name');
  if (banner && tagName) {
    tagName.textContent = '#' + tag;
    banner.style.display = 'flex';
  }
  renderFeed();
  showToast(`Filtered by #${tag}`);
}

function clearFilter() {
  currentFilterTag = null;
  const banner = document.getElementById('filter-banner');
  if (banner) banner.style.display = 'none';
  renderFeed();
}

// Scroll to Video by ID
function scrollToVideoId(id) {
  const target = document.querySelector(`.tt-feed-item[data-video-id="${id}"]`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

// Handle Upload Success
function handleUploadSuccess(newVideo) {
  videos.unshift(newVideo);
  currentFilterTag = null;
  const banner = document.getElementById('filter-banner');
  if (banner) banner.style.display = 'none';

  renderFeed();

  // Scroll to top to view newly uploaded video
  const scroller = document.getElementById('feed-scroller');
  scroller.scrollTo({ top: 0, behavior: 'smooth' });
}

// Setup Header Events
function setupHeaderEvents() {
  const uploadBtn = document.getElementById('header-upload-btn');
  uploadBtn.addEventListener('click', () => {
    soundEffects.playClick();
    uploadModal.open();
  });

  const avatarBtn = document.getElementById('header-avatar-btn');
  avatarBtn.addEventListener('click', () => {
    profileModal.open(currentUser, videos);
  });

  const logoBtn = document.getElementById('logo-btn');
  logoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    clearFilter();
    const scroller = document.getElementById('feed-scroller');
    scroller.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const messagesBtn = document.getElementById('header-messages-btn');
  messagesBtn.addEventListener('click', () => {
    soundEffects.playClick();
    showToast('💬 Direct Messages: All caught up! No new messages.');
  });

  const inboxBtn = document.getElementById('header-inbox-btn');
  inboxBtn.addEventListener('click', () => {
    soundEffects.playClick();
    showToast('🔔 Notifications: 4 creators liked your activity!');
  });

  // Search logic
  const searchInput = document.getElementById('main-search-input');
  const searchDropdown = document.getElementById('search-dropdown');
  const searchBtn = document.getElementById('search-action-btn');

  searchInput.addEventListener('focus', () => {
    searchDropdown.classList.add('open');
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      searchDropdown.classList.remove('open');
    }, 200);
  });

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim().toLowerCase();
    if (!val) {
      clearFilter();
      return;
    }
  });

  function executeSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    searchDropdown.classList.remove('open');
    // Find matching tag or caption
    filterByTag(query.replace('#', ''));
  }

  searchBtn.addEventListener('click', executeSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeSearch();
  });

  searchDropdown.querySelectorAll('.tt-search-item').forEach(item => {
    item.addEventListener('click', () => {
      const q = item.dataset.query;
      searchInput.value = '#' + q;
      filterByTag(q);
    });
  });

  // Clear filter banner click
  document.getElementById('clear-filter-btn')?.addEventListener('click', clearFilter);
}

// Setup Sidebar Events
function setupSidebarEvents() {
  // Navigation Tabs
  const navFyp = document.getElementById('nav-fyp');
  const navFollowing = document.getElementById('nav-following');
  const navExplore = document.getElementById('nav-explore');
  const navLive = document.getElementById('nav-live');
  const navProfile = document.getElementById('nav-profile');

  const navItems = [navFyp, navFollowing, navExplore, navLive, navProfile];

  function setActiveNav(activeItem) {
    navItems.forEach(item => item?.classList.remove('active'));
    activeItem.classList.add('active');
    soundEffects.playClick();
  }

  navFyp?.addEventListener('click', () => {
    setActiveNav(navFyp);
    clearFilter();
  });

  navFollowing?.addEventListener('click', () => {
    setActiveNav(navFollowing);
    // Filter by following
    const followingVideos = videos.filter(v => v.isFollowing);
    if (followingVideos.length > 0) {
      showToast('Showing Following feed');
    } else {
      showToast('Follow more creators to populate your Following feed!');
    }
  });

  navExplore?.addEventListener('click', () => {
    setActiveNav(navExplore);
    showToast('🧭 Explore: Trending topics across TikTok');
  });

  navLive?.addEventListener('click', () => {
    setActiveNav(navLive);
    showToast('🔴 LIVE: 142 broadcasts currently live worldwide!');
  });

  navProfile?.addEventListener('click', () => {
    setActiveNav(navProfile);
    profileModal.open(currentUser, videos);
  });

  // Sidebar suggested follow buttons
  document.querySelectorAll('.tt-sidebar-follow-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.accIdx, 10);
      const acc = suggestedAccounts[idx];
      acc.isFollowing = !acc.isFollowing;
      soundEffects.playFollow();

      if (acc.isFollowing) {
        btn.textContent = 'Following';
        btn.classList.add('following');
        showToast(`You are now following ${acc.name}!`);
      } else {
        btn.textContent = 'Follow';
        btn.classList.remove('following');
      }
    });
  });

  // Sidebar account clicks open profile
  document.querySelectorAll('.tt-account-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.accIdx, 10);
      const acc = suggestedAccounts[idx];
      profileModal.open({
        name: acc.name,
        username: acc.username,
        avatar: acc.avatar,
        verified: acc.verified,
        bio: `Hi, I'm ${acc.name}! Welcome to my TikTok profile. ✨`,
        followers: acc.followers,
        following: 120,
        likes: '4.5M'
      }, videos);
    });
  });

  // Sidebar Trending Tag Pills
  document.querySelectorAll('.tt-tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      filterByTag(pill.dataset.tag);
    });
  });

  // Up/Down Arrow buttons
  const arrowUp = document.getElementById('nav-arrow-up');
  const arrowDown = document.getElementById('nav-arrow-down');
  const scroller = document.getElementById('feed-scroller');

  arrowUp?.addEventListener('click', () => {
    soundEffects.playClick();
    scroller.scrollBy({ top: -scroller.clientHeight, behavior: 'smooth' });
  });

  arrowDown?.addEventListener('click', () => {
    soundEffects.playClick();
    scroller.scrollBy({ top: scroller.clientHeight, behavior: 'smooth' });
  });
}

// Global Keyboard Shortcuts
function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // If typing in an input or textarea, ignore shortcuts
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }

    const scroller = document.getElementById('feed-scroller');

    switch (e.code) {
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        scroller.scrollBy({ top: scroller.clientHeight, behavior: 'smooth' });
        break;

      case 'ArrowUp':
      case 'KeyW':
        e.preventDefault();
        scroller.scrollBy({ top: -scroller.clientHeight, behavior: 'smooth' });
        break;

      case 'Space':
      case 'KeyK':
        e.preventDefault();
        toggleActiveVideoPlay();
        break;

      case 'KeyM':
        e.preventDefault();
        toggleGlobalMute();
        break;

      case 'KeyL':
        e.preventDefault();
        triggerActiveVideoLike();
        break;

      case 'KeyC':
        e.preventDefault();
        const activeVideo = videos[activeVideoIndex];
        if (activeVideo) {
          commentsDrawer.open(activeVideo);
        }
        break;

      case 'Escape':
        uploadModal?.close();
        shareModal?.close();
        profileModal?.close();
        commentsDrawer?.close();
        break;
    }
  });
}

function toggleActiveVideoPlay() {
  const activeItem = document.querySelectorAll('.tt-feed-item')[activeVideoIndex];
  if (activeItem) {
    const vid = activeItem.querySelector('video');
    const pulse = activeItem.querySelector('.tt-play-pulse');
    const disc = activeItem.querySelector('.tt-vinyl-disc');
    if (vid) {
      if (vid.paused) {
        vid.play();
        pulse?.classList.remove('active');
        disc?.classList.remove('paused');
      } else {
        vid.pause();
        pulse?.classList.add('active');
        disc?.classList.add('paused');
      }
    }
  }
}

function triggerActiveVideoLike() {
  const activeVideo = videos[activeVideoIndex];
  if (!activeVideo) return;
  const activeItem = document.querySelectorAll('.tt-feed-item')[activeVideoIndex];
  if (activeItem) {
    const likeBtn = activeItem.querySelector(`#like-btn-${activeVideo.id}`);
    if (likeBtn) likeBtn.click();
  }
}

// Mount app when DOM is ready
window.addEventListener('DOMContentLoaded', initApp);
