# TikTok Web App Clone (`copycat`)

A modern, high-fidelity TikTok clone built with Vanilla JavaScript, HTML5, and custom CSS. Features vertical video scroll-snapping, interactive comments drawer, video upload studio, profile exploration, and procedural Web Audio API effects.

---

## 🌟 Key Features

* **Vertical FYP Feed**: Fullscreen vertical snap scroll with automatic play/pause on viewport entry.
* **Double-Tap Like Burst**: Double-tap anywhere on the video spawns floating heart particles at the cursor coordinates with audio feedback.
* **Side Actions**:
  - Heart / Like with count animation.
  - Slide-over Comments Drawer with quick emoji bar and live comment posting.
  - Bookmark / Favorite with star highlights.
  - Share modal with one-click clipboard copy and social links.
  - Spinning vinyl record with floating musical notes.
* **Upload Video Studio**:
  - Drag-and-drop local MP4/WebM video files or pick from preset templates.
  - Custom captions, hashtags, and sound title.
  - Instantly prepends the newly uploaded video to the top of the feed.
* **Creator Profile Modal**:
  - Creator stats (followers, following, likes).
  - Video gallery grid with hover-to-play previews.
* **Keyboard Shortcuts**:
  - `↓` / `S`: Next video
  - `↑` / `W`: Previous video
  - `Space` / `K`: Play / Pause
  - `M`: Mute / Unmute
  - `L`: Like video
  - `C`: Open / Close comments
  - `Esc`: Close open drawers/modals

---

## 🛠️ Tech Stack

* **Vite** — Fast modern development environment and bundling.
* **Vanilla JavaScript** (ES Modules) — Snappy logic without heavy framework overhead.
* **Vanilla CSS** — Custom design system with OLED dark theme, glassmorphism, and responsive breakpoints.
* **Web Audio API** — Procedural sound synthesis for clicks, likes, and follows.

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run local dev server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```
