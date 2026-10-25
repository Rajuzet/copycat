import { soundEffects } from '../utils/audio.js';

export function createShareModal(showToast) {
  const modal = document.createElement('div');
  modal.className = 'tt-modal-backdrop';
  modal.id = 'share-modal';

  modal.innerHTML = `
    <div class="tt-modal-window" style="max-width: 440px;">
      <div class="tt-modal-header">
        <h2 class="tt-modal-title">Share to</h2>
        <button class="tt-comments-close-btn" id="share-close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="tt-modal-body">
        <div class="tt-share-grid">
          <!-- WhatsApp -->
          <div class="tt-share-item" id="share-whatsapp">
            <div class="tt-share-icon whatsapp">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"></path>
              </svg>
            </div>
            <span style="font-size: 11.5px; font-weight: 600;">WhatsApp</span>
          </div>

          <!-- Twitter / X -->
          <div class="tt-share-item" id="share-twitter">
            <div class="tt-share-icon twitter">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            </div>
            <span style="font-size: 11.5px; font-weight: 600;">Twitter (X)</span>
          </div>

          <!-- Facebook -->
          <div class="tt-share-item" id="share-facebook">
            <div class="tt-share-icon facebook">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z"></path>
              </svg>
            </div>
            <span style="font-size: 11.5px; font-weight: 600;">Facebook</span>
          </div>

          <!-- Copy Link -->
          <div class="tt-share-item" id="share-copylink">
            <div class="tt-share-icon copylink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </div>
            <span style="font-size: 11.5px; font-weight: 600;">Copy link</span>
          </div>
        </div>

        <!-- Copy Link input box -->
        <div class="tt-share-copy-box">
          <input type="text" id="share-url-input" readonly value="https://tiktok.com/@creator/video/10293847" />
          <button class="tt-btn-primary" id="copy-btn-action" style="padding: 6px 14px; font-size: 12px;">Copy</button>
        </div>
      </div>
    </div>
  `;

  const closeBtn = modal.querySelector('#share-close-btn');
  const urlInput = modal.querySelector('#share-url-input');
  const copyBtn = modal.querySelector('#copy-btn-action');
  const copyItem = modal.querySelector('#share-copylink');
  const whatsappItem = modal.querySelector('#share-whatsapp');
  const twitterItem = modal.querySelector('#share-twitter');
  const facebookItem = modal.querySelector('#share-facebook');

  function closeModal() {
    modal.classList.remove('open');
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  function copyToClipboard() {
    soundEffects.playPop();
    navigator.clipboard.writeText(urlInput.value).catch(() => {});
    showToast('🔗 Link copied to clipboard!');
    closeModal();
  }

  copyBtn.addEventListener('click', copyToClipboard);
  copyItem.addEventListener('click', copyToClipboard);

  whatsappItem.addEventListener('click', () => {
    soundEffects.playClick();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this video on TikTok: ' + urlInput.value)}`, '_blank');
  });

  twitterItem.addEventListener('click', () => {
    soundEffects.playClick();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Watch this video on TikTok: ' + urlInput.value)}`, '_blank');
  });

  facebookItem.addEventListener('click', () => {
    soundEffects.playClick();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlInput.value)}`, '_blank');
  });

  return {
    element: modal,
    open(video) {
      if (video) {
        urlInput.value = `${window.location.origin}/@${video.author.username}/video/${video.id}`;
      }
      modal.classList.add('open');
    },
    close: closeModal
  };
}
