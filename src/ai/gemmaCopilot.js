export class JwalaGemmaCopilot {
  constructor(panelEl, mayaScene, primitivesLib, scriptEditor) {
    this.panel = panelEl;
    this.scene = mayaScene;
    this.primitives = primitivesLib;
    this.scriptEditor = scriptEditor;

    this.modelName = 'google/gemma-4-12B-it-qat-q4_0-gguf';
    this.isGenerating = false;
    this.generatedAction = null;

    this.init();
  }

  init() {
    this.panel.innerHTML = `
      <!-- Header -->
      <div class="jwala-panel-header">
        <div class="jwala-title">
          <span style="font-size: 16px;">🔥</span>
          <span>Jwala AI Studio</span>
          <span class="jwala-model-badge" title="Target Model: google/gemma-4-12B-it-qat-q4_0-gguf">Gemma-4 12B GGUF</span>
        </div>
        <div style="display: flex; gap: 6px; align-items: center;">
          <button id="jwala-minimize-btn" title="Minimize / Expand" style="color: var(--maya-text-muted);">━</button>
          <button id="jwala-close-btn" title="Close" style="color: var(--maya-text-muted);">✕</button>
        </div>
      </div>

      <!-- Body -->
      <div class="jwala-panel-body">
        <!-- Quick Preset Prompt Chips -->
        <div>
          <div style="font-size: 10px; font-weight: 700; color: var(--maya-text-muted); text-transform: uppercase; margin-bottom: 6px;">
            Gemma-4 3D Prompts
          </div>
          <div class="jwala-preset-chips">
            <button class="jwala-chip" data-prompt="Generate a sci-fi robotic arm with articulated joints and core reactor">🤖 Sci-Fi Mech</button>
            <button class="jwala-chip" data-prompt="Create a stylized cyber dragon with segmented body and emission wings">🐉 Cyber Dragon</button>
            <button class="jwala-chip" data-prompt="Build a futuristic cyberpunk skyscraper with neon window arrays">🏙️ Cyber Skyscraper</button>
            <button class="jwala-chip" data-prompt="Create a humanoid skeletal joint chain for IK rigging">🦴 Spine Rig</button>
            <button class="jwala-chip" data-prompt="Apply an Arnold reflective gold and glowing emission material to selected mesh">✨ Arnold Gold Shader</button>
          </div>
        </div>

        <!-- Prompt Input Box -->
        <div class="jwala-prompt-box">
          <textarea
            class="jwala-prompt-textarea"
            id="jwala-prompt-input"
            placeholder="Ask Gemma-4 to generate 3D meshes, MEL scripts, Arnold shaders, or keyframe animations..."
          >Generate a sci-fi robotic arm with articulated joints and core reactor</textarea>

          <button class="jwala-generate-btn" id="jwala-submit-btn">
            <span>🔥</span>
            <span>Synthesize with Gemma-4</span>
          </button>
        </div>

        <!-- Gemma 4 Reasoning & Output Container -->
        <div class="jwala-response-container" id="jwala-response">
          <div class="jwala-thought-header">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>Gemma-4 Reasoning Stream &lt;|channel&gt;thought</span>
          </div>

          <div class="jwala-thought-stream" id="jwala-thought-text"></div>

          <div style="font-size: 11px; font-weight: 700; color: #fff; margin-top: 4px;">Maya Execution Script:</div>
          <div class="jwala-code-preview" id="jwala-code-box"></div>

          <button class="jwala-apply-btn" id="jwala-execute-3d-btn">
            ⚡ Execute in Maya 3D Viewport
          </button>
        </div>
      </div>
    `;

    this.promptInput = this.panel.querySelector('#jwala-prompt-input');
    this.submitBtn = this.panel.querySelector('#jwala-submit-btn');
    this.responseContainer = this.panel.querySelector('#jwala-response');
    this.thoughtEl = this.panel.querySelector('#jwala-thought-text');
    this.codeBox = this.panel.querySelector('#jwala-code-box');
    this.execute3dBtn = this.panel.querySelector('#jwala-execute-3d-btn');
    this.minBtn = this.panel.querySelector('#jwala-minimize-btn');
    this.closeBtn = this.panel.querySelector('#jwala-close-btn');

    this.setupEvents();
  }

  setupEvents() {
    this.panel.querySelectorAll('.jwala-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.promptInput.value = chip.dataset.prompt;
        this.generate(chip.dataset.prompt);
      });
    });

    this.submitBtn.addEventListener('click', () => {
      this.generate(this.promptInput.value.trim());
    });

    this.execute3dBtn.addEventListener('click', () => {
      if (this.generatedAction) {
        this.generatedAction();
        this.scriptEditor.log(`Jwala Gemma-4 action executed in viewport.`, 'res');
      }
    });

    this.minBtn.addEventListener('click', () => {
      this.panel.classList.toggle('minimized');
    });

    this.closeBtn.addEventListener('click', () => {
      this.panel.style.display = 'none';
    });
  }

  async generate(prompt) {
    if (!prompt || this.isGenerating) return;
    this.isGenerating = true;
    this.submitBtn.disabled = true;
    this.submitBtn.innerHTML = `<span>⏳</span><span>Gemma-4 is Reasoning...</span>`;

    this.responseContainer.classList.add('active');
    this.thoughtEl.textContent = '';
    this.codeBox.textContent = '';

    // Determine generation action based on user query
    const lower = prompt.toLowerCase();
    let thoughts = [];
    let scriptCode = '';
    let actionFn = null;

    if (lower.includes('mech') || lower.includes('robot') || lower.includes('arm')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf',
        'Parsing intent: Synthesize articulated robotic bipedal mech with energy reactor.',
        'Analyzing Maya DAG topology: requires torso box, glowing cylinder reactor, dual shoulder joints, arm kinematics.',
        'Material assignment: Arnold aiStandardSurface with metalness 0.8, emissive cyan core (2.0 intensity).',
        'Generating optimal low-poly bounding volumes and hierarchy...'
      ];
      scriptCode = `import maya.cmds as cmds\n\n# Jwala AI // Gemma-4 12B Generated Sci-Fi Mech\nmech = cmds.jwala_createSciFiMech()\ncmds.select(mech)\ncmds.viewFit()`;
      actionFn = () => {
        const { mesh, name } = this.primitives.createSciFiMech();
        this.scene.addObject(mesh, name);
      };
    } else if (lower.includes('dragon') || lower.includes('creature')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf',
        'Parsing intent: Procedural Cyber Dragon creature synthesis.',
        'Constructing 7-segment mathematical spine with sinusoidal elevation curves.',
        'Creating dual high-aspect ratio emission wing membranes.',
        'Assigning iridescent blue body shaders with neon crest accents.'
      ];
      scriptCode = `import maya.cmds as cmds\n\n# Jwala AI // Gemma-4 12B Generated Cyber Dragon\ndragon = cmds.jwala_createCyberDragon()\ncmds.select(dragon)`;
      actionFn = () => {
        const { mesh, name } = this.primitives.createCyberDragon();
        this.scene.addObject(mesh, name);
      };
    } else if (lower.includes('building') || lower.includes('skyscraper') || lower.includes('city')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf',
        'Parsing intent: Procedural cyberpunk skyscraper with illuminated floor plates.',
        'Extruding monolithic 10-meter tower with alternating cyan window lights.',
        'Adding rooftop telecommunication spire and warning beacon.'
      ];
      scriptCode = `import maya.cmds as cmds\n\n# Jwala AI // Gemma-4 12B Skyscraper\nbuilding = cmds.jwala_createCyberBuilding()\ncmds.select(building)`;
      actionFn = () => {
        const { mesh, name } = this.primitives.createCyberBuilding();
        this.scene.addObject(mesh, name);
      };
    } else if (lower.includes('joint') || lower.includes('rig') || lower.includes('spine')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf',
        'Parsing intent: Humanoid 5-joint spine chain for Maya IK / FK skeleton.',
        'Computing joint pivot hierarchy: root -> spine_01 -> spine_02 -> spine_03 -> head.',
        'Orienting joint axes along Y-up coordinate convention.'
      ];
      scriptCode = `import maya.cmds as cmds\n\n# Jwala AI // Gemma-4 Skeletal Rig\nfor i in range(5):\n    j = cmds.joint(p=(0, i * 1.2, 0), n=f"joint_{i+1}")`;
      actionFn = () => {
        for (let i = 0; i < 5; i++) {
          const { mesh, name } = this.primitives.createJoint(0, (i + 1) * 1.0, 0);
          this.scene.addObject(mesh, name);
        }
      };
    } else {
      // Arnold Material or Custom Mesh
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf',
        'Parsing intent: Procedural Arnold Shader & Primitive creation.',
        'Creating high-tessellation Maya sphere with metallic gold reflection.',
        'Configuring Arnold aiStandardSurface parameters (Specular: 0.95, Roughness: 0.15).'
      ];
      scriptCode = `import maya.cmds as cmds\n\n# Jwala AI // Arnold Metallic Shader\nsphere = cmds.polySphere(r=1.5, sx=32, sy=32)\ncmds.move(0, 1.5, 0)`;
      actionFn = () => {
        const { mesh, name } = this.primitives.createSphere(1.5, 32);
        mesh.material.color.setHex(0xffb300);
        mesh.material.metalness = 0.9;
        mesh.material.roughness = 0.15;
        this.scene.addObject(mesh, name);
      };
    }

    this.generatedAction = actionFn;

    // Simulate Gemma-4 token streaming
    for (const line of thoughts) {
      await new Promise(r => setTimeout(r, 140));
      this.thoughtEl.textContent += line + '\n';
      this.thoughtEl.scrollTop = this.thoughtEl.scrollHeight;
    }

    this.codeBox.textContent = scriptCode;

    this.isGenerating = false;
    this.submitBtn.disabled = false;
    this.submitBtn.innerHTML = `<span>🔥</span><span>Synthesize with Gemma-4</span>`;

    // Automatically trigger viewport execution!
    if (this.generatedAction) {
      this.generatedAction();
    }
  }

  show() {
    this.panel.style.display = 'flex';
    this.panel.classList.remove('minimized');
    this.promptInput.focus();
  }
}
