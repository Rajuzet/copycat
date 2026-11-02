/**
 * CanvasCord Hugging Face Inference Client & LLM Orchestrator
 * Connects to top open-source coding & design models on Hugging Face Hub
 */

export const SUPPORTED_HF_MODELS = [
  {
    id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    name: 'Qwen 2.5 Coder 32B (Recommended for UI & Design)',
    provider: 'Alibaba Cloud / Hugging Face',
    description: 'Top-tier open-source code and structured layout reasoning model.',
  },
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta AI / Hugging Face',
    description: 'State-of-the-art open reasoning model for complex design systems.',
  },
  {
    id: 'google/gemma-2-27b-it',
    name: 'Gemma 2 27B Instruct',
    provider: 'Google DeepMind',
    description: 'High-precision instruction tuned model with deep visual balance reasoning.',
  },
  {
    id: 'HuggingFaceTB/SmolLM2-1.7B-Instruct',
    name: 'SmolLM2 1.7B (Fast / Lightweight)',
    provider: 'Hugging Face',
    description: 'Ultra-fast sub-second edge model for quick component generation.',
  },
];

export class HuggingFaceClient {
  constructor() {
    this.apiKey = localStorage.getItem('canvascord_hf_token') || '';
    this.selectedModel = localStorage.getItem('canvascord_hf_model') || 'Qwen/Qwen2.5-Coder-32B-Instruct';
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    localStorage.setItem('canvascord_hf_token', this.apiKey);
  }

  setModel(modelId) {
    this.selectedModel = modelId;
    localStorage.setItem('canvascord_hf_model', modelId);
  }

  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.startsWith('hf_'));
  }

  /**
   * System Prompt instructing the LLM to produce CanvasCord JSON specifications
   */
  getSystemPrompt() {
    return `You are CanvasCord AI, an expert Senior Product Designer and Design Systems Architect.
Your role is to translate natural language design requirements into production-ready vector canvas element hierarchies.

You MUST respond strictly with a valid JSON array of element objects matching this schema:
[
  {
    "type": "frame" | "rect" | "circle" | "star" | "arrow" | "text" | "sticky",
    "name": string,
    "x": number,
    "y": number,
    "width": number,
    "height": number,
    "fill": string (hex color or transparent),
    "stroke": string (hex),
    "strokeWidth": number,
    "cornerRadius": number,
    "text": string (for text/sticky),
    "fontSize": number,
    "fontWeight": "400"|"500"|"600"|"700"|"800",
    "fontColor": string (hex),
    "shadow": { "enabled": boolean, "x": number, "y": number, "blur": number, "color": string }
  }
]
Do not wrap your output in markdown backticks or commentary. Output raw JSON only.`;
  }

  /**
   * Request design generation from Hugging Face Inference API
   */
  async generateDesignFromPrompt(userPrompt, canvasCenter = { x: 200, y: 150 }) {
    if (!this.hasApiKey()) {
      return {
        success: false,
        source: 'local_fallback',
        message: 'No Hugging Face token configured. Using embedded procedural design intelligence.',
      };
    }

    const endpoint = `https://api-inference.huggingface.co/models/${this.selectedModel}`;
    const payload = {
      inputs: `<|im_start|>system\n${this.getSystemPrompt()}<|im_end|>\n<|im_start|>user\nGenerate vector UI layout around x=${canvasCenter.x}, y=${canvasCenter.y} for: ${userPrompt}<|im_end|>\n<|im_start|>assistant\n`,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.3,
        return_full_text: false,
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          source: 'local_fallback',
          error: `Hugging Face API (${response.status}): ${errorText}`,
        };
      }

      const result = await response.json();
      let generatedText = '';
      if (Array.isArray(result) && result[0]?.generated_text) {
        generatedText = result[0].generated_text;
      } else if (result.generated_text) {
        generatedText = result.generated_text;
      }

      // Parse JSON
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const elements = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          source: 'huggingface',
          model: this.selectedModel,
          elements,
        };
      }

      return {
        success: false,
        source: 'local_fallback',
        error: 'Model output did not contain valid JSON array.',
      };
    } catch (err) {
      return {
        success: false,
        source: 'local_fallback',
        error: err.message,
      };
    }
  }
}

