/**
 * CanvasCord High-Fidelity UI Templates & Generative Blueprint Library
 */

import { createElement } from '../canvas/elements.js';

export function createSaaSHeroTemplate(startX = 120, startY = 80) {
  const elements = [];

  // Main Desktop Frame
  const frame = createElement('frame', {
    name: 'Desktop // SaaS Landing Hero',
    x: startX,
    y: startY,
    width: 1200,
    height: 720,
    fill: '#111215',
    stroke: '#2b2d31',
    strokeWidth: 1,
    cornerRadius: 16,
  });
  elements.push(frame);

  // Gradient Aura Background Object
  const aura = createElement('circle', {
    name: 'Aura Glow',
    x: startX + 350,
    y: startY + 100,
    width: 500,
    height: 500,
    fill: '#5865F2',
    opacity: 0.12,
    shadow: { enabled: true, x: 0, y: 0, blur: 80, color: '#5865F2' },
  });
  elements.push(aura);

  // Navigation Bar Container
  const navbar = createElement('rect', {
    name: 'Navbar Container',
    x: startX + 60,
    y: startY + 32,
    width: 1080,
    height: 64,
    fill: 'rgba(30, 31, 34, 0.75)',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 12,
  });
  elements.push(navbar);

  // Logo Text
  const logo = createElement('text', {
    name: 'Brand Logo',
    x: startX + 84,
    y: startY + 52,
    text: '⚡ CanvasCord',
    fontSize: 20,
    fontWeight: '700',
    fontColor: '#F2F3F5',
  });
  elements.push(logo);

  // Nav Links
  const navLinks = createElement('text', {
    name: 'Nav Links',
    x: startX + 420,
    y: startY + 54,
    text: 'Features        Design System        Community        Pricing',
    fontSize: 14,
    fontWeight: '500',
    fontColor: '#949BA4',
  });
  elements.push(navLinks);

  // Nav CTA Button
  const navBtn = createElement('rect', {
    name: 'Nav CTA Button',
    x: startX + 980,
    y: startY + 44,
    width: 130,
    height: 40,
    fill: '#5865F2',
    cornerRadius: 8,
  });
  const navBtnText = createElement('text', {
    name: 'Nav CTA Label',
    x: startX + 1010,
    y: startY + 55,
    text: 'Open Studio',
    fontSize: 13,
    fontWeight: '600',
    fontColor: '#ffffff',
  });
  elements.push(navBtn, navBtnText);

  // Badge Pill
  const pill = createElement('rect', {
    name: 'Badge Pill',
    x: startX + 450,
    y: startY + 160,
    width: 300,
    height: 32,
    fill: 'rgba(88, 101, 242, 0.15)',
    stroke: '#5865F2',
    strokeWidth: 1,
    cornerRadius: 999,
  });
  const pillText = createElement('text', {
    name: 'Badge Text',
    x: startX + 472,
    y: startY + 168,
    text: '✨ Powered by Gemma-4 AI Copilot',
    fontSize: 12,
    fontWeight: '600',
    fontColor: '#5865F2',
  });
  elements.push(pill, pillText);

  // Main Headline
  const headline = createElement('text', {
    name: 'Hero Headline',
    x: startX + 220,
    y: startY + 220,
    text: 'Where Real-Time Vector Design\nMeets Discord Community',
    fontSize: 44,
    fontWeight: '800',
    fontColor: '#F2F3F5',
    textAlign: 'center',
    lineHeight: 1.25,
  });
  elements.push(headline);

  // Subtitle
  const subtitle = createElement('text', {
    name: 'Hero Subtitle',
    x: startX + 270,
    y: startY + 360,
    text: 'High-performance 60FPS infinite canvas, multiplayer cursors, integrated voice huddles,\nand generative UI co-pilot tailored for forward-thinking engineering teams.',
    fontSize: 16,
    fontWeight: '400',
    fontColor: '#949BA4',
    textAlign: 'center',
    lineHeight: 1.5,
  });
  elements.push(subtitle);

  // Hero Primary CTA Button
  const heroBtn1 = createElement('rect', {
    name: 'Primary Button',
    x: startX + 440,
    y: startY + 460,
    width: 170,
    height: 50,
    fill: '#5865F2',
    cornerRadius: 10,
    shadow: { enabled: true, x: 0, y: 8, blur: 24, color: 'rgba(88, 101, 242, 0.4)' },
  });
  const heroBtn1Text = createElement('text', {
    name: 'Primary Label',
    x: startX + 472,
    y: startY + 476,
    text: 'Start Designing',
    fontSize: 15,
    fontWeight: '600',
    fontColor: '#ffffff',
  });

  // Secondary Button
  const heroBtn2 = createElement('rect', {
    name: 'Secondary Button',
    x: startX + 630,
    y: startY + 460,
    width: 140,
    height: 50,
    fill: '#2b2d31',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 10,
  });
  const heroBtn2Text = createElement('text', {
    name: 'Secondary Label',
    x: startX + 665,
    y: startY + 476,
    text: 'Join Discord',
    fontSize: 15,
    fontWeight: '500',
    fontColor: '#F2F3F5',
  });
  elements.push(heroBtn1, heroBtn1Text, heroBtn2, heroBtn2Text);

  // Sticky Note review
  const sticky = createElement('sticky', {
    name: 'Feedback Note',
    x: startX + 960,
    y: startY + 220,
    text: '💡 Sarah:\nNavbar looks crisp! Blurple gradient glow really anchors the dark mode theme.',
    fill: '#fff375',
    author: 'Sarah Chen (Staff)',
  });
  elements.push(sticky);

  return elements;
}

export function createMobileAppTemplate(startX = 1500, startY = 80) {
  const elements = [];

  // iPhone 16 Frame
  const frame = createElement('frame', {
    name: 'iPhone 16 // Music Player',
    x: startX,
    y: startY,
    width: 390,
    height: 844,
    fill: '#18191c',
    stroke: '#313338',
    strokeWidth: 2,
    cornerRadius: 44,
  });
  elements.push(frame);

  // Dynamic Island
  const dynamicIsland = createElement('rect', {
    name: 'Dynamic Island',
    x: startX + 135,
    y: startY + 16,
    width: 120,
    height: 32,
    fill: '#000000',
    cornerRadius: 999,
  });
  elements.push(dynamicIsland);

  // Album Artwork
  const albumArt = createElement('rect', {
    name: 'Album Artwork',
    x: startX + 35,
    y: startY + 100,
    width: 320,
    height: 320,
    fill: '#5865F2',
    cornerRadius: 24,
    shadow: { enabled: true, x: 0, y: 16, blur: 40, color: 'rgba(88, 101, 242, 0.45)' },
  });
  const albumDeco = createElement('star', {
    name: 'Artwork Motif',
    x: startX + 145,
    y: startY + 210,
    width: 100,
    height: 100,
    fill: '#FEE75C',
  });
  elements.push(albumArt, albumDeco);

  // Track Title & Artist
  const title = createElement('text', {
    name: 'Track Title',
    x: startX + 35,
    y: startY + 460,
    text: 'Midnight Vectors',
    fontSize: 24,
    fontWeight: '700',
    fontColor: '#F2F3F5',
  });
  const artist = createElement('text', {
    name: 'Artist',
    x: startX + 35,
    y: startY + 495,
    text: 'CanvasCord Radio • Cyber Beats',
    fontSize: 15,
    fontWeight: '500',
    fontColor: '#949BA4',
  });
  elements.push(title, artist);

  // Progress Bar
  const trackBarBg = createElement('rect', {
    name: 'Progress Bar BG',
    x: startX + 35,
    y: startY + 540,
    width: 320,
    height: 6,
    fill: '#2b2d31',
    cornerRadius: 999,
  });
  const trackBarFill = createElement('rect', {
    name: 'Progress Bar Fill',
    x: startX + 35,
    y: startY + 540,
    width: 190,
    height: 6,
    fill: '#5865F2',
    cornerRadius: 999,
  });
  const timeLabels = createElement('text', {
    name: 'Time Stamp',
    x: startX + 35,
    y: startY + 555,
    text: '2:34                                                      4:12',
    fontSize: 12,
    fontWeight: '500',
    fontColor: '#949BA4',
  });
  elements.push(trackBarBg, trackBarFill, timeLabels);

  // Playback Control Button (Circle)
  const playBtn = createElement('circle', {
    name: 'Play / Pause Button',
    x: startX + 160,
    y: startY + 610,
    width: 70,
    height: 70,
    fill: '#5865F2',
    shadow: { enabled: true, x: 0, y: 8, blur: 24, color: 'rgba(88, 101, 242, 0.4)' },
  });
  const playIcon = createElement('text', {
    name: 'Play Icon',
    x: startX + 187,
    y: startY + 632,
    text: '▶',
    fontSize: 22,
    fontWeight: '700',
    fontColor: '#ffffff',
  });
  elements.push(playBtn, playIcon);

  return elements;
}

export function createPricingTableTemplate(startX = 120, startY = 880) {
  const elements = [];

  // Card 1: Starter
  const card1 = createElement('rect', {
    name: 'Card // Starter Tier',
    x: startX,
    y: startY,
    width: 340,
    height: 480,
    fill: '#1e1f22',
    stroke: '#313338',
    strokeWidth: 1,
    cornerRadius: 16,
  });
  const title1 = createElement('text', {
    name: 'Starter Title',
    x: startX + 32,
    y: startY + 40,
    text: 'Starter\n$0 / month\n\n✓ 3 Active Canvas Projects\n✓ Unlimited Shapes & Vectors\n✓ 7-Day Version History\n✓ Community Discord Access',
    fontSize: 16,
    fontWeight: '500',
    fontColor: '#F2F3F5',
    lineHeight: 1.6,
  });
  elements.push(card1, title1);

  // Card 2: Pro (Highlighted)
  const card2 = createElement('rect', {
    name: 'Card // Pro Tier (Featured)',
    x: startX + 380,
    y: startY - 20,
    width: 360,
    height: 520,
    fill: '#232428',
    stroke: '#5865F2',
    strokeWidth: 2,
    cornerRadius: 18,
    shadow: { enabled: true, x: 0, y: 16, blur: 40, color: 'rgba(88, 101, 242, 0.35)' },
  });
  const title2 = createElement('text', {
    name: 'Pro Title',
    x: startX + 412,
    y: startY + 30,
    text: '⚡ Pro Creator\n$24 / month\n\n✓ Unlimited Canvases & Frames\n✓ Real-time Voice Huddles (RTC)\n✓ AI Generative UI Copilot\n✓ Export to SVG, PNG, Tailwind\n✓ Full Discord Webhooks',
    fontSize: 16,
    fontWeight: '600',
    fontColor: '#ffffff',
    lineHeight: 1.6,
  });
  const proBtn = createElement('rect', {
    name: 'Pro CTA',
    x: startX + 412,
    y: startY + 410,
    width: 296,
    height: 48,
    fill: '#5865F2',
    cornerRadius: 10,
  });
  const proBtnText = createElement('text', {
    name: 'Pro CTA Label',
    x: startX + 490,
    y: startY + 424,
    text: 'Upgrade to Pro',
    fontSize: 15,
    fontWeight: '600',
    fontColor: '#ffffff',
  });
  elements.push(card2, title2, proBtn, proBtnText);

  return elements;
}

export function createLoginFormTemplate(startX = 200, startY = 150) {
  const elements = [];
  const frame = createElement('frame', {
    name: 'Frame // Sign In Dialog',
    x: startX,
    y: startY,
    width: 380,
    height: 480,
    fill: '#1e1f22',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 16,
  });
  const logo = createElement('text', {
    name: 'Brand Logo',
    x: startX + 40,
    y: startY + 40,
    text: '❖ CanvasCord ID',
    fontSize: 22,
    fontWeight: '700',
    fontColor: '#ffffff',
  });
  const sub = createElement('text', {
    name: 'Subtitle',
    x: startX + 40,
    y: startY + 76,
    text: 'Sign in to access your creative workspace',
    fontSize: 13,
    fontWeight: '400',
    fontColor: '#949BA4',
  });
  const emailInput = createElement('rect', {
    name: 'Email Input',
    x: startX + 40,
    y: startY + 120,
    width: 300,
    height: 46,
    fill: '#2b2d31',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 8,
  });
  const emailLabel = createElement('text', {
    name: 'Email Placeholder',
    x: startX + 54,
    y: startY + 134,
    text: 'alex@designteam.io',
    fontSize: 14,
    fontColor: '#dbdee1',
  });
  const passInput = createElement('rect', {
    name: 'Password Input',
    x: startX + 40,
    y: startY + 180,
    width: 300,
    height: 46,
    fill: '#2b2d31',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 8,
  });
  const passLabel = createElement('text', {
    name: 'Password Placeholder',
    x: startX + 54,
    y: startY + 194,
    text: '••••••••••••••••',
    fontSize: 14,
    fontColor: '#949BA4',
  });
  const btn = createElement('rect', {
    name: 'Sign In Button',
    x: startX + 40,
    y: startY + 250,
    width: 300,
    height: 48,
    fill: '#5865F2',
    cornerRadius: 10,
    shadow: { enabled: true, x: 0, y: 6, blur: 20, color: 'rgba(88, 101, 242, 0.4)' },
  });
  const btnText = createElement('text', {
    name: 'Sign In Label',
    x: startX + 130,
    y: startY + 264,
    text: 'Continue',
    fontSize: 15,
    fontWeight: '600',
    fontColor: '#ffffff',
  });
  const ssoBtn = createElement('rect', {
    name: 'Google SSO Button',
    x: startX + 40,
    y: startY + 316,
    width: 300,
    height: 46,
    fill: '#2b2d31',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 8,
  });
  const ssoText = createElement('text', {
    name: 'Google SSO Label',
    x: startX + 100,
    y: startY + 330,
    text: 'Continue with Google',
    fontSize: 14,
    fontWeight: '500',
    fontColor: '#F2F3F5',
  });
  elements.push(frame, logo, sub, emailInput, emailLabel, passInput, passLabel, btn, btnText, ssoBtn, ssoText);
  return elements;
}

export function createNavbarTemplate(startX = 100, startY = 100) {
  const elements = [];
  const navBg = createElement('rect', {
    name: 'Navbar Frame',
    x: startX,
    y: startY,
    width: 1100,
    height: 64,
    fill: '#18191c',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 14,
    shadow: { enabled: true, x: 0, y: 8, blur: 24, color: 'rgba(0,0,0,0.4)' },
  });
  const brand = createElement('text', {
    name: 'Brand Logo',
    x: startX + 24,
    y: startY + 20,
    text: '❖ StudioOS',
    fontSize: 18,
    fontWeight: '700',
    fontColor: '#F2F3F5',
  });
  const links = createElement('text', {
    name: 'Nav Links',
    x: startX + 320,
    y: startY + 22,
    text: 'Overview        Components        Tokens        Documentation        API',
    fontSize: 14,
    fontWeight: '500',
    fontColor: '#949BA4',
  });
  const cta = createElement('rect', {
    name: 'CTA Button',
    x: startX + 960,
    y: startY + 12,
    width: 116,
    height: 40,
    fill: '#5865F2',
    cornerRadius: 8,
  });
  const ctaText = createElement('text', {
    name: 'CTA Label',
    x: startX + 984,
    y: startY + 23,
    text: 'Deploy Now',
    fontSize: 13,
    fontWeight: '600',
    fontColor: '#ffffff',
  });
  elements.push(navBg, brand, links, cta, ctaText);
  return elements;
}

export function createTestimonialTemplate(startX = 200, startY = 150) {
  const elements = [];
  const card = createElement('rect', {
    name: 'Testimonial Card',
    x: startX,
    y: startY,
    width: 380,
    height: 220,
    fill: '#2b2d31',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 16,
    shadow: { enabled: true, x: 0, y: 8, blur: 24, color: 'rgba(0,0,0,0.3)' },
  });
  const avatar = createElement('circle', {
    name: 'Author Avatar',
    x: startX + 24,
    y: startY + 24,
    width: 48,
    height: 48,
    fill: '#EB459E',
  });
  const author = createElement('text', {
    name: 'Author Name',
    x: startX + 86,
    y: startY + 26,
    text: 'Elena Rostova\nVP of Product Design',
    fontSize: 14,
    fontWeight: '600',
    fontColor: '#F2F3F5',
    lineHeight: 1.3,
  });
  const stars = createElement('text', {
    name: 'Star Rating',
    x: startX + 86,
    y: startY + 62,
    text: '★★★★★',
    fontSize: 15,
    fontColor: '#FEE75C',
  });
  const quote = createElement('text', {
    name: 'Review Text',
    x: startX + 24,
    y: startY + 100,
    text: '"CanvasCord unified our Figma vector workflow with live Discord voice huddles and generative AI. Iteration velocity tripled in week one."',
    fontSize: 13,
    fontWeight: '400',
    fontColor: '#dbdee1',
    lineHeight: 1.5,
  });
  elements.push(card, avatar, author, stars, quote);
  return elements;
}

export function createProfileCardTemplate(startX = 200, startY = 150) {
  const elements = [];
  const card = createElement('rect', {
    name: 'Profile Card',
    x: startX,
    y: startY,
    width: 340,
    height: 380,
    fill: '#2b2d31',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 16,
    shadow: { enabled: true, x: 0, y: 8, blur: 24, color: 'rgba(0,0,0,0.35)' },
  });
  const banner = createElement('rect', {
    name: 'Cover Banner',
    x: startX,
    y: startY,
    width: 340,
    height: 100,
    fill: '#5865F2',
    cornerRadius: 16,
  });
  const avatar = createElement('circle', {
    name: 'Avatar',
    x: startX + 24,
    y: startY + 70,
    width: 60,
    height: 60,
    fill: '#57F287',
    stroke: '#2b2d31',
    strokeWidth: 4,
  });
  const name = createElement('text', {
    name: 'Display Name',
    x: startX + 24,
    y: startY + 140,
    text: 'Marcus Vance\n@marcus_ux',
    fontSize: 17,
    fontWeight: '700',
    fontColor: '#F2F3F5',
    lineHeight: 1.3,
  });
  const bio = createElement('text', {
    name: 'Bio',
    x: startX + 24,
    y: startY + 195,
    text: 'Principal Design Technologist crafting accessible design systems & spatial UI prototypes.',
    fontSize: 12,
    fontWeight: '400',
    fontColor: '#949BA4',
    lineHeight: 1.4,
  });
  const stats = createElement('text', {
    name: 'Follower Metrics',
    x: startX + 24,
    y: startY + 255,
    text: '2.8k Followers    •    410 Following    •    94 Repos',
    fontSize: 12,
    fontWeight: '600',
    fontColor: '#dbdee1',
  });
  const btn = createElement('rect', {
    name: 'Follow Button',
    x: startX + 24,
    y: startY + 300,
    width: 292,
    height: 44,
    fill: '#5865F2',
    cornerRadius: 10,
  });
  const btnText = createElement('text', {
    name: 'Follow Label',
    x: startX + 140,
    y: startY + 314,
    text: 'Follow',
    fontSize: 14,
    fontWeight: '600',
    fontColor: '#ffffff',
  });
  elements.push(card, banner, avatar, name, bio, stats, btn, btnText);
  return elements;
}

export function createModalDialogTemplate(startX = 200, startY = 150) {
  const elements = [];
  const modal = createElement('frame', {
    name: 'Frame // Alert Modal',
    x: startX,
    y: startY,
    width: 440,
    height: 240,
    fill: '#2b2d31',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 16,
    shadow: { enabled: true, x: 0, y: 16, blur: 36, color: 'rgba(0,0,0,0.5)' },
  });
  const title = createElement('text', {
    name: 'Modal Title',
    x: startX + 28,
    y: startY + 28,
    text: '⚠️  Confirm Deployment',
    fontSize: 18,
    fontWeight: '700',
    fontColor: '#F2F3F5',
  });
  const desc = createElement('text', {
    name: 'Modal Description',
    x: startX + 28,
    y: startY + 68,
    text: 'You are about to push your active vector canvas design to the live production repository. This will notify all 14 team members in #design-critique.',
    fontSize: 13,
    fontWeight: '400',
    fontColor: '#949BA4',
    lineHeight: 1.5,
  });
  const cancelBtn = createElement('rect', {
    name: 'Cancel Button',
    x: startX + 180,
    y: startY + 160,
    width: 100,
    height: 42,
    fill: '#35373c',
    cornerRadius: 8,
  });
  const cancelText = createElement('text', {
    name: 'Cancel Label',
    x: startX + 208,
    y: startY + 172,
    text: 'Cancel',
    fontSize: 13,
    fontWeight: '500',
    fontColor: '#F2F3F5',
  });
  const confirmBtn = createElement('rect', {
    name: 'Confirm Button',
    x: startX + 296,
    y: startY + 160,
    width: 116,
    height: 42,
    fill: '#5865F2',
    cornerRadius: 8,
  });
  const confirmText = createElement('text', {
    name: 'Confirm Label',
    x: startX + 318,
    y: startY + 172,
    text: 'Deploy Now',
    fontSize: 13,
    fontWeight: '600',
    fontColor: '#ffffff',
  });
  elements.push(modal, title, desc, cancelBtn, cancelText, confirmBtn, confirmText);
  return elements;
}

export function createSmartUniversalLayout(startX = 200, startY = 150, promptText = 'UI Component') {
  const elements = [];
  const cleanTitle = promptText.replace(/generate|create|design|build|make|add/gi, '').trim() || 'UI Component';
  const capitalizedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  // Extract color hint from prompt
  const lower = promptText.toLowerCase();
  let primaryColor = '#5865F2'; // default blurple
  if (lower.includes('emerald') || lower.includes('green')) primaryColor = '#57F287';
  else if (lower.includes('crimson') || lower.includes('red')) primaryColor = '#ED4245';
  else if (lower.includes('gold') || lower.includes('yellow')) primaryColor = '#FEE75C';
  else if (lower.includes('pink') || lower.includes('fuchsia')) primaryColor = '#EB459E';
  else if (lower.includes('cyan') || lower.includes('teal')) primaryColor = '#00F0FF';
  else if (lower.includes('purple')) primaryColor = '#9B51E0';

  // Main Card
  const card = createElement('rect', {
    name: `Card // ${capitalizedTitle.slice(0, 30)}`,
    x: startX,
    y: startY,
    width: 420,
    height: 280,
    fill: '#1e1f22',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 16,
    shadow: { enabled: true, x: 0, y: 8, blur: 24, color: 'rgba(0,0,0,0.35)' },
  });

  // Category Tag
  const badge = createElement('rect', {
    name: 'Badge Pill',
    x: startX + 24,
    y: startY + 24,
    width: 100,
    height: 26,
    fill: primaryColor,
    cornerRadius: 13,
  });
  const badgeText = createElement('text', {
    name: 'Badge Label',
    x: startX + 42,
    y: startY + 29,
    text: 'AI COMPONENT',
    fontSize: 10,
    fontWeight: '700',
    fontColor: primaryColor === '#57F287' || primaryColor === '#FEE75C' ? '#000000' : '#ffffff',
  });

  // Title
  const title = createElement('text', {
    name: 'Component Title',
    x: startX + 24,
    y: startY + 68,
    text: capitalizedTitle.slice(0, 40),
    fontSize: 20,
    fontWeight: '700',
    fontColor: '#F2F3F5',
  });

  // Subtitle / context description
  const desc = createElement('text', {
    name: 'Component Description',
    x: startX + 24,
    y: startY + 104,
    text: `Synthesized layout for: "${promptText}".\nProduction-ready vector component with WCAG AAA accessibility.`,
    fontSize: 13,
    fontWeight: '400',
    fontColor: '#949BA4',
    lineHeight: 1.4,
  });

  // Visual Focal element or preview bar
  const visualPreview = createElement('rect', {
    name: 'Component Viewport',
    x: startX + 24,
    y: startY + 160,
    width: 372,
    height: 44,
    fill: '#2b2d31',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 8,
  });
  const previewText = createElement('text', {
    name: 'Preview Text',
    x: startX + 40,
    y: startY + 174,
    text: `⚡ Active Design Specification • 100% Vector Precision`,
    fontSize: 12,
    fontWeight: '500',
    fontColor: '#dbdee1',
  });

  // Action Button
  const btn = createElement('rect', {
    name: 'Action CTA',
    x: startX + 24,
    y: startY + 220,
    width: 140,
    height: 40,
    fill: primaryColor,
    cornerRadius: 8,
  });
  const btnText = createElement('text', {
    name: 'CTA Label',
    x: startX + 54,
    y: startY + 232,
    text: 'Explore Element',
    fontSize: 13,
    fontWeight: '600',
    fontColor: primaryColor === '#57F287' || primaryColor === '#FEE75C' ? '#000000' : '#ffffff',
  });

  elements.push(card, badge, badgeText, title, desc, visualPreview, previewText, btn, btnText);
  return elements;
}

export function createProductCardTemplate(startX = 200, startY = 150) {
  const elements = [];
  const card = createElement('rect', {
    name: 'Card // E-Commerce Product',
    x: startX,
    y: startY,
    width: 320,
    height: 440,
    fill: '#1e1f22',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 16,
    shadow: { enabled: true, x: 0, y: 8, blur: 24, color: 'rgba(0,0,0,0.35)' },
  });
  const imgBg = createElement('rect', {
    name: 'Product Image Placeholder',
    x: startX + 16,
    y: startY + 16,
    width: 288,
    height: 200,
    fill: '#2b2d31',
    cornerRadius: 12,
  });
  const imgLabel = createElement('text', {
    name: 'Image Icon Label',
    x: startX + 110,
    y: startY + 104,
    text: '👟 Air Pro v2',
    fontSize: 16,
    fontWeight: '600',
    fontColor: '#949BA4',
  });
  const tag = createElement('rect', {
    name: 'Discount Badge',
    x: startX + 28,
    y: startY + 28,
    width: 72,
    height: 24,
    fill: '#ED4245',
    cornerRadius: 6,
  });
  const tagText = createElement('text', {
    name: 'Badge Text',
    x: startX + 38,
    y: startY + 34,
    text: '-25% OFF',
    fontSize: 11,
    fontWeight: '700',
    fontColor: '#ffffff',
  });
  const title = createElement('text', {
    name: 'Product Name',
    x: startX + 16,
    y: startY + 232,
    text: 'Nike Air Max Pulse',
    fontSize: 18,
    fontWeight: '700',
    fontColor: '#F2F3F5',
  });
  const category = createElement('text', {
    name: 'Category Subtitle',
    x: startX + 16,
    y: startY + 260,
    text: "Men's Performance Running Shoes",
    fontSize: 12,
    fontWeight: '400',
    fontColor: '#949BA4',
  });
  const price = createElement('text', {
    name: 'Price Tag',
    x: startX + 16,
    y: startY + 296,
    text: '$149.99',
    fontSize: 22,
    fontWeight: '700',
    fontColor: '#57F287',
  });
  const oldPrice = createElement('text', {
    name: 'Strikethrough Price',
    x: startX + 116,
    y: startY + 302,
    text: '$199.99',
    fontSize: 14,
    fontWeight: '500',
    fontColor: '#72767d',
  });
  const cartBtn = createElement('rect', {
    name: 'Add to Cart CTA',
    x: startX + 16,
    y: startY + 340,
    width: 288,
    height: 48,
    fill: '#5865F2',
    cornerRadius: 10,
    shadow: { enabled: true, x: 0, y: 4, blur: 16, color: 'rgba(88, 101, 242, 0.4)' },
  });
  const cartText = createElement('text', {
    name: 'Cart CTA Label',
    x: startX + 96,
    y: startY + 355,
    text: '🛒 Add to Bag',
    fontSize: 14,
    fontWeight: '600',
    fontColor: '#ffffff',
  });
  elements.push(card, imgBg, imgLabel, tag, tagText, title, category, price, oldPrice, cartBtn, cartText);
  return elements;
}

export function createSettingsPanelTemplate(startX = 200, startY = 150) {
  const elements = [];
  const card = createElement('rect', {
    name: 'Card // Settings & Preferences',
    x: startX,
    y: startY,
    width: 440,
    height: 380,
    fill: '#1e1f22',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 16,
    shadow: { enabled: true, x: 0, y: 8, blur: 24, color: 'rgba(0,0,0,0.35)' },
  });
  const header = createElement('text', {
    name: 'Settings Title',
    x: startX + 24,
    y: startY + 24,
    text: 'Workspace Preferences',
    fontSize: 20,
    fontWeight: '700',
    fontColor: '#F2F3F5',
  });
  const sub = createElement('text', {
    name: 'Settings Subtitle',
    x: startX + 24,
    y: startY + 52,
    text: 'Manage multiplayer presence, notifications, and AI model routing.',
    fontSize: 12,
    fontWeight: '400',
    fontColor: '#949BA4',
  });

  // Setting 1: Live Voice Huddle
  const row1 = createElement('rect', {
    name: 'Setting Row 1',
    x: startX + 24,
    y: startY + 88,
    width: 392,
    height: 60,
    fill: '#2b2d31',
    cornerRadius: 10,
  });
  const t1 = createElement('text', {
    name: 'Setting 1 Title',
    x: startX + 40,
    y: startY + 100,
    text: 'Auto-join Voice Huddle',
    fontSize: 14,
    fontWeight: '600',
    fontColor: '#F2F3F5',
  });
  const d1 = createElement('text', {
    name: 'Setting 1 Desc',
    x: startX + 40,
    y: startY + 122,
    text: 'Connect microphone when clicking live presentation',
    fontSize: 11,
    fontColor: '#949BA4',
  });
  const toggle1 = createElement('rect', {
    name: 'Toggle 1 Active',
    x: startX + 356,
    y: startY + 106,
    width: 44,
    height: 24,
    fill: '#57F287',
    cornerRadius: 12,
  });

  // Setting 2: Hugging Face AI Routing
  const row2 = createElement('rect', {
    name: 'Setting Row 2',
    x: startX + 24,
    y: startY + 160,
    width: 392,
    height: 60,
    fill: '#2b2d31',
    cornerRadius: 10,
  });
  const t2 = createElement('text', {
    name: 'Setting 2 Title',
    x: startX + 40,
    y: startY + 172,
    text: 'Qwen 2.5 Coder Neural Routing',
    fontSize: 14,
    fontWeight: '600',
    fontColor: '#F2F3F5',
  });
  const d2 = createElement('text', {
    name: 'Setting 2 Desc',
    x: startX + 40,
    y: startY + 194,
    text: 'Prioritize open-source Hugging Face inference over local heuristics',
    fontSize: 11,
    fontColor: '#949BA4',
  });
  const toggle2 = createElement('rect', {
    name: 'Toggle 2 Active',
    x: startX + 356,
    y: startY + 178,
    width: 44,
    height: 24,
    fill: '#5865F2',
    cornerRadius: 12,
  });

  // Save changes button
  const saveBtn = createElement('rect', {
    name: 'Save Preferences CTA',
    x: startX + 24,
    y: startY + 280,
    width: 392,
    height: 44,
    fill: '#5865F2',
    cornerRadius: 8,
  });
  const saveText = createElement('text', {
    name: 'Save CTA Label',
    x: startX + 164,
    y: startY + 294,
    text: 'Save Preferences',
    fontSize: 13,
    fontWeight: '600',
    fontColor: '#ffffff',
  });

  elements.push(card, header, sub, row1, t1, d1, toggle1, row2, t2, d2, toggle2, saveBtn, saveText);
  return elements;
}

export function createDataTableTemplate(startX = 200, startY = 150) {
  const elements = [];
  const card = createElement('rect', {
    name: 'Card // Data Table Grid',
    x: startX,
    y: startY,
    width: 520,
    height: 320,
    fill: '#1e1f22',
    stroke: '#35373c',
    strokeWidth: 1,
    cornerRadius: 14,
    shadow: { enabled: true, x: 0, y: 6, blur: 20, color: 'rgba(0,0,0,0.3)' },
  });
  const title = createElement('text', {
    name: 'Table Title',
    x: startX + 20,
    y: startY + 20,
    text: 'Recent Team Deployments',
    fontSize: 16,
    fontWeight: '700',
    fontColor: '#F2F3F5',
  });
  // Table Header
  const th = createElement('rect', {
    name: 'Table Header Bar',
    x: startX + 16,
    y: startY + 54,
    width: 488,
    height: 36,
    fill: '#2b2d31',
    cornerRadius: 6,
  });
  const thText = createElement('text', {
    name: 'Header Columns',
    x: startX + 28,
    y: startY + 66,
    text: 'PROJECT NAME          BRANCH           STATUS          LATENCY',
    fontSize: 11,
    fontWeight: '700',
    fontColor: '#949BA4',
  });

  // Row 1
  const r1Text = createElement('text', {
    name: 'Row 1',
    x: startX + 28,
    y: startY + 110,
    text: 'copycat-studio          main               ✓ Active         24ms',
    fontSize: 13,
    fontWeight: '500',
    fontColor: '#57F287',
  });

  // Row 2
  const r2Text = createElement('text', {
    name: 'Row 2',
    x: startX + 28,
    y: startY + 155,
    text: 'design-system           staging           ✓ Deployed     38ms',
    fontSize: 13,
    fontWeight: '500',
    fontColor: '#F2F3F5',
  });

  // Row 3
  const r3Text = createElement('text', {
    name: 'Row 3',
    x: startX + 28,
    y: startY + 200,
    text: 'hf-llm-orchestrator    v2-release       ⚡ Building      18ms',
    fontSize: 13,
    fontWeight: '500',
    fontColor: '#FEE75C',
  });

  // Pagination Footer
  const footerText = createElement('text', {
    name: 'Pagination Info',
    x: startX + 28,
    y: startY + 265,
    text: 'Showing 1 to 3 of 48 total pipeline runs',
    fontSize: 12,
    fontColor: '#949BA4',
  });

  elements.push(card, title, th, thText, r1Text, r2Text, r3Text, footerText);
  return elements;
}


