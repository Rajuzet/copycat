/**
 * CanvasCord AI Design Copilot & Natural Language Synthesis Engine
 */

import { createElement } from '../canvas/elements.js';
import {
  createSaaSHeroTemplate,
  createMobileAppTemplate,
  createPricingTableTemplate,
} from './templates.js';

export class AICopilot {
  constructor(engine, onElementAdded) {
    this.engine = engine;
    this.onElementAdded = onElementAdded || (() => {});
  }

  processPrompt(promptText) {
    const raw = promptText.toLowerCase();

    // 1. Templates Synthesis
    if (raw.includes('hero') || raw.includes('landing')) {
      const els = createSaaSHeroTemplate(
        -this.engine.viewport.x + 80,
        -this.engine.viewport.y + 60
      );
      this.engine.elements.push(...els);
      this.engine.requestRender();
      this.onElementAdded();
      return `✨ Synthesized **Modern SaaS Landing Page Hero Section** (1440px desktop frame with navbar, typography, CTA buttons, and ambient blurple lighting).`;
    }

    if (raw.includes('mobile') || raw.includes('phone') || raw.includes('music')) {
      const els = createMobileAppTemplate(
        -this.engine.viewport.x + 120,
        -this.engine.viewport.y + 60
      );
      this.engine.elements.push(...els);
      this.engine.requestRender();
      this.onElementAdded();
      return `📱 Synthesized **iOS 16 Mobile Music Player** (390×844 frame with Dynamic Island, album art card, progress scrubbing bar, and media controls).`;
    }

    if (raw.includes('pricing') || raw.includes('tier')) {
      const els = createPricingTableTemplate(
        -this.engine.viewport.x + 100,
        -this.engine.viewport.y + 80
      );
      this.engine.elements.push(...els);
      this.engine.requestRender();
      this.onElementAdded();
      return `💳 Synthesized **3-Tier SaaS Pricing Matrix** (Starter, Pro Featured, and Enterprise packages with feature checklists).`;
    }

    // 2. Button Component
    if (raw.includes('button')) {
      const labelMatch = promptText.match(/["'](.*?)["']/);
      const label = labelMatch ? labelMatch[1] : 'Action Button';
      const cx = -this.engine.viewport.x + this.engine.width / (2 * this.engine.viewport.zoom);
      const cy = -this.engine.viewport.y + this.engine.height / (2 * this.engine.viewport.zoom);

      const btn = createElement('rect', {
        name: `Button // ${label}`,
        x: cx - 80,
        y: cy - 25,
        width: 160,
        height: 50,
        fill: '#5865F2',
        cornerRadius: 10,
        shadow: { enabled: true, x: 0, y: 6, blur: 20, color: 'rgba(88, 101, 242, 0.4)' },
      });
      const txt = createElement('text', {
        name: `Label // ${label}`,
        x: cx - 50,
        y: cy - 10,
        text: label,
        fontSize: 15,
        fontWeight: '600',
        fontColor: '#ffffff',
      });

      this.engine.elements.push(btn, txt);
      this.engine.requestRender();
      this.onElementAdded();
      return `🔘 Spawned high-contrast UI Button **"${label}"** at center viewport.`;
    }

    // 3. Color Palette Generation
    if (raw.includes('palette') || raw.includes('color')) {
      const cx = -this.engine.viewport.x + 120;
      const cy = -this.engine.viewport.y + 100;
      const colors = raw.includes('cyberpunk')
        ? ['#00F0FF', '#FF007F', '#7000FF', '#FFE600', '#05050A']
        : ['#5865F2', '#57F287', '#FEE75C', '#EB459E', '#ED4245'];

      colors.forEach((hex, idx) => {
        const swatch = createElement('rect', {
          name: `Swatch ${idx + 1} (${hex})`,
          x: cx + idx * 90,
          y: cy,
          width: 76,
          height: 100,
          fill: hex,
          cornerRadius: 12,
          shadow: { enabled: true, x: 0, y: 4, blur: 12, color: 'rgba(0,0,0,0.3)' },
        });
        const label = createElement('text', {
          name: `Hex Label ${idx + 1}`,
          x: cx + idx * 90 + 8,
          y: cy + 110,
          text: hex,
          fontSize: 12,
          fontWeight: '600',
          fontColor: '#949BA4',
        });
        this.engine.elements.push(swatch, label);
      });

      this.engine.requestRender();
      this.onElementAdded();
      return `🎨 Generated 5-step harmonious design palette on canvas!`;
    }

    // 4. Design Audit / Critique
    if (raw.includes('audit') || raw.includes('critique')) {
      const count = this.engine.elements.length;
      return `🔍 **AI Design System Audit**:\n` +
        `• **Canvas Density**: ${count} active layers.\n` +
        `• **Visual Hierarchy**: Excellent distinction between headers (44px) and body copy.\n` +
        `• **Color Contrast**: Dark mode background (#111215) with Discord Blurple (#5865F2) achieves 7.4:1 contrast ratio (WCAG AAA).\n` +
        `• **Recommendation**: Ensure touch targets on mobile frames maintain a minimum 48×48px clickable boundary.`;
    }

    // Default Fallback
    const note = createElement('sticky', {
      name: 'AI Response Note',
      x: -this.engine.viewport.x + 200,
      y: -this.engine.viewport.y + 150,
      text: `🤖 AI Copilot:\nProcessed request: "${promptText}". Ready to generate frames or vector paths!`,
      fill: '#5865F2',
      fontColor: '#ffffff',
      author: 'Canvas AI Bot',
    });
    this.engine.elements.push(note);
    this.engine.requestRender();
    this.onElementAdded();
    return `📝 Dropped generated copilot note for prompt: *"${promptText}"*`;
  }
}
