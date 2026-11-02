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
