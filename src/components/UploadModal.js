import { soundEffects } from '../utils/audio.js';
import { currentUser } from '../data/videos.js';

export function createUploadModal(onUploadSuccess, showToast) {
  const modal = document.createElement('div');
  modal.className = 'tt-modal-backdrop';
  modal.id = 'upload-modal';

  modal.innerHTML = `
    <div class="tt-modal-window">
      <div class="tt-modal-header">
        <h2 class="tt-modal-title">Upload Video Studio</h2>
        <button class="tt-comments-close-btn" id="upload-close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="tt-modal-body">
        <div class="tt-upload-grid">
          <!-- Video File Dropzone / Preview -->
          <div class="tt-upload-dropzone" id="upload-dropzone">
            <input type="file" id="video-file-input" accept="video/mp4,video/webm" style="display: none;" />
            
            <div id="dropzone-empty" style="display: flex; flex-direction: column; align-items: center;">
              <div class="tt-upload-dropzone-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <p style="font-weight: 700; margin-bottom: 4px;">Select video to upload</p>
              <p style="font-size: 11.5px; color: var(--tt-text-muted); margin-bottom: 12px;">Or drag and drop a file</p>
              <span class="tt-btn-primary" style="padding: 8px 16px; font-size: 12px;">Browse Files</span>
            </div>

            <!-- Preview video tag (hidden by default) -->
            <video id="upload-preview-video" loop muted playsinline style="display: none;"></video>
          </div>

          <!-- Video Details Form -->
          <form class="tt-upload-form" id="upload-form">
            <!-- Quick Preset Clip Selector -->
            <div class="tt-form-group">
              <label class="tt-form-label">Or choose sample video template</label>
              <div class="tt-preset-selector">
                <button type="button" class="tt-preset-chip active" data-src="/videos/v1.mp4">🌸 Bloom</button>
                <button type="button" class="tt-preset-chip" data-src="/videos/v2.mp4">⚡ Beats</button>
                <button type="button" class="tt-preset-chip" data-src="/videos/v3.mp4">🪼 Jellyfish</button>
                <button type="button" class="tt-preset-chip" data-src="/videos/v4.mp4">🐰 3D Bunny</button>
                <button type="button" class="tt-preset-chip" data-src="/videos/v5.mp4">🐉 Fantasy</button>
              </div>
            </div>

            <div class="tt-form-group">
              <label class="tt-form-label" for="upload-caption">Caption & Hashtags</label>
              <textarea class="tt-form-textarea" id="upload-caption" placeholder="Describe your video, mention friends, and add hashtags...">Creating amazing things with code and passion! ✨ #vibes #creative #fyp #tech</textarea>
            </div>

            <div class="tt-form-group">
              <label class="tt-form-label" for="upload-sound">Sound Title</label>
              <input type="text" class="tt-form-input" id="upload-sound" value="original sound - rajuzet" />
            </div>

            <div class="tt-form-group">
              <label class="tt-form-label">Who can watch this video</label>
              <select class="tt-form-input" id="upload-privacy" style="background: rgba(255,255,255,0.07); cursor: pointer;">
                <option value="public" style="background: #161823;">Public (Everyone)</option>
                <option value="friends" style="background: #161823;">Friends</option>
                <option value="private" style="background: #161823;">Private (Only me)</option>
              </select>
            </div>

            <div style="margin-top: 8px;">
              <button type="submit" class="tt-btn-primary" style="width: 100%;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 2L11 13"></path>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Post Video
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const closeBtn = modal.querySelector('#upload-close-btn');
  const dropzone = modal.querySelector('#upload-dropzone');
  const fileInput = modal.querySelector('#video-file-input');
  const previewVideo = modal.querySelector('#upload-preview-video');
  const dropzoneEmpty = modal.querySelector('#dropzone-empty');
  const form = modal.querySelector('#upload-form');
  const captionInput = modal.querySelector('#upload-caption');
  const soundInput = modal.querySelector('#upload-sound');
  const presetChips = modal.querySelectorAll('.tt-preset-chip');

  let currentVideoUrl = '/videos/v1.mp4';

  function setPreview(src) {
    currentVideoUrl = src;
    previewVideo.src = src;
    previewVideo.style.display = 'block';
    dropzoneEmpty.style.display = 'none';
    previewVideo.play().catch(() => {});
  }

  // Set default initial preview
  setPreview(currentVideoUrl);

  // Preset Chips selection
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      setPreview(chip.dataset.src);
    });
  });

  // Browse files click
  dropzone.addEventListener('click', (e) => {
    if (e.target !== previewVideo) {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      presetChips.forEach(c => c.classList.remove('active'));
      setPreview(url);
    }
  });

  // Drag and drop handlers
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--tt-red)';
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'rgba(255,255,255,0.2)';
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(255,255,255,0.2)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      presetChips.forEach(c => c.classList.remove('active'));
      setPreview(url);
    }
  });

  // Close modal
  function closeModal() {
    modal.classList.remove('open');
    previewVideo.pause();
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const caption = captionInput.value.trim() || 'Check out my new video! 🔥 #fyp';
    const sound = soundInput.value.trim() || `original sound - ${currentUser.username}`;

    // Extract hashtags
    const tagMatches = caption.match(/#[a-z0-9_]+/gi) || ['#fyp', '#creative'];
    const tags = tagMatches.map(t => t.replace('#', ''));

    const newVideo = {
      id: 'vid-' + Date.now(),
      videoUrl: currentVideoUrl,
      author: {
        id: 'u-current',
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
        verified: currentUser.verified,
        bio: currentUser.bio,
        followers: currentUser.followers,
        following: currentUser.following,
        likes: currentUser.likes
      },
      caption: caption,
      tags: tags,
      sound: {
        title: sound,
        author: currentUser.username,
        cover: currentUser.avatar
      },
      stats: {
        likes: 1,
        comments: 0,
        bookmarks: 0,
        shares: 0
      },
      isLiked: true,
      isBookmarked: false,
      isFollowing: false,
      comments: []
    };

    soundEffects.playPop();
    closeModal();
    onUploadSuccess(newVideo);
    showToast('🎉 Your video was uploaded to the FYP feed!');
  });

  return {
    element: modal,
    open() {
      modal.classList.add('open');
      previewVideo.play().catch(() => {});
    },
    close: closeModal
  };
}
