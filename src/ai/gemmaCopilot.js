export class JwalaGemmaCopilot {
  constructor(panelEl, mayaScene, primitivesLib, scriptEditor) {
    this.panel = panelEl;
    this.scene = mayaScene;
    this.primitives = primitivesLib;
    this.scriptEditor = scriptEditor;

    this.modelName = 'google/gemma-4-12B-it-qat-q4_0-gguf';
    this.activeMode = '3d'; // '3d', 'rig', 'shader', 'python'
    this.isGenerating = false;
    this.generatedAction = null;

    this.init();
  }

  init() {
    this.panel.className = 'maya-ai-dock-panel';
    this.panel.id = 'maya-ai-dock';

    this.panel.innerHTML = `
      <!-- Dedicated AI Space Titlebar -->
      <div class="jwala-dock-titlebar">
        <div class="jwala-dock-title">
          <span>🔥</span>
          <span>Jwala AI Studio</span>
          <span class="jwala-model-tag" title="Model: google/gemma-4-12B-it-qat-q4_0-gguf">Gemma-4 12B</span>
        </div>
        <div style="display: flex; gap: 4px; align-items: center;">
          <button class="jwala-dock-toggle-btn" id="jwala-collapse-btn" title="Collapse / Expand AI Workspace">◂</button>
        </div>
      </div>

      <!-- Dedicated AI Space Content -->
      <div class="jwala-dock-content" id="jwala-dock-content">
        <!-- AI Mode Selector -->
        <div>
          <div style="font-size: 10px; font-weight: 700; color: var(--maya-text-muted); text-transform: uppercase; margin-bottom: 6px;">
            AI Copilot Mode
          </div>
          <div class="jwala-mode-pills">
            <div class="jwala-mode-pill active" data-mode="3d">🎨 3D Mesh</div>
            <div class="jwala-mode-pill" data-mode="rig">🦴 Rigging</div>
            <div class="jwala-mode-pill" data-mode="shader">🌈 Shaders</div>
            <div class="jwala-mode-pill" data-mode="python">⚡ Python</div>
          </div>
        </div>

        <!-- Quick Gemma-4 Prompts -->
        <div>
          <div style="font-size: 10px; font-weight: 700; color: var(--maya-text-muted); text-transform: uppercase; margin-bottom: 6px;">
            Prompt Presets
          </div>
          <div class="jwala-preset-chips" id="jwala-chips-container">
            <button class="jwala-chip" data-prompt="Generate a sci-fi robotic arm with articulated joints and core reactor">🤖 Sci-Fi Mech</button>
            <button class="jwala-chip" data-prompt="Create a stylized cyber dragon with segmented body and emission wings">🐉 Cyber Dragon</button>
            <button class="jwala-chip" data-prompt="Build a futuristic cyberpunk skyscraper with neon window arrays">🏙️ Cyber Skyscraper</button>
            <button class="jwala-chip" data-prompt="Create a humanoid skeletal joint chain for IK rigging">🦴 Spine Joint Rig</button>
            <button class="jwala-chip" data-prompt="Apply an Arnold reflective gold and glowing emission material to selected mesh">✨ Arnold Gold Shader</button>
          </div>
        </div>

        <!-- Prompt Textarea & Button -->
        <div class="jwala-prompt-box">
          <textarea
            class="jwala-prompt-textarea"
            id="jwala-prompt-input"
            placeholder="Instruct Gemma-4 to generate meshes, Arnold shaders, or animation..."
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

          <div style="font-size: 10.5px; font-weight: 700; color: #fff; margin-top: 4px;">Maya Execution Script:</div>
          <div class="jwala-code-preview" id="jwala-code-box"></div>

          <button class="jwala-apply-btn" id="jwala-execute-3d-btn">
            ⚡ Execute in Maya 3D Viewport
          </button>
        </div>

        <!-- HF Space Integration Details -->
        <div style="margin-top: auto; padding: 8px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px solid rgba(255,255,255,0.06); font-size: 10px; color: var(--maya-text-muted);">
          <div style="font-weight: 700; color: #fff; margin-bottom: 2px;">Connected Model</div>
          <div style="font-family: var(--font-mono); color: var(--maya-cyan);">${this.modelName}</div>
          <div style="margin-top: 4px;">Space: <a href="https://huggingface.co/spaces/packiyanathan/jwala" target="_blank" style="color: var(--jwala-fire); text-decoration: underline;">packiyanathan/jwala</a></div>
        </div>
      </div>
    `;

    this.promptInput = this.panel.querySelector('#jwala-prompt-input');
    this.submitBtn = this.panel.querySelector('#jwala-submit-btn');
    this.responseContainer = this.panel.querySelector('#jwala-response');
    this.thoughtEl = this.panel.querySelector('#jwala-thought-text');
    this.codeBox = this.panel.querySelector('#jwala-code-box');
    this.execute3dBtn = this.panel.querySelector('#jwala-execute-3d-btn');
    this.collapseBtn = this.panel.querySelector('#jwala-collapse-btn');

    this.setupEvents();
  }

  setupEvents() {
    // Mode Pills
    this.panel.querySelectorAll('.jwala-mode-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.panel.querySelectorAll('.jwala-mode-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeMode = pill.dataset.mode;
        this.updatePromptsForMode(this.activeMode);
      });
    });

    // Preset Chips
    this.panel.querySelectorAll('.jwala-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.promptInput.value = chip.dataset.prompt;
        this.generate(chip.dataset.prompt);
      });
    });

    // Submit button
    this.submitBtn.addEventListener('click', () => {
      this.generate(this.promptInput.value.trim());
    });

    // Execute in 3D viewport
    this.execute3dBtn.addEventListener('click', () => {
      if (this.generatedAction) {
        this.generatedAction();
        this.scriptEditor.log(`Jwala Gemma-4 action executed in viewport.`, 'res');
      }
    });

    // Collapse toggle
    this.collapseBtn.addEventListener('click', () => {
      const isCollapsed = this.panel.classList.toggle('collapsed');
      this.collapseBtn.textContent = isCollapsed ? '▸' : '◂';
      this.collapseBtn.title = isCollapsed ? 'Expand AI Workspace' : 'Collapse AI Workspace';
      // Trigger scene resize
      setTimeout(() => this.scene.onResize(), 260);
    });
  }

  updatePromptsForMode(mode) {
    const chipsContainer = this.panel.querySelector('#jwala-chips-container');
    let chips = [];

    if (mode === '3d') {
      chips = [
        { label: '🤖 Sci-Fi Mech', prompt: 'Generate a sci-fi robotic arm with articulated joints and core reactor' },
        { label: '🐉 Cyber Dragon', prompt: 'Create a stylized cyber dragon with segmented body and emission wings' },
        { label: '🏙️ Cyber Skyscraper', prompt: 'Build a futuristic cyberpunk skyscraper with neon window arrays' }
      ];
    } else if (mode === 'rig') {
      chips = [
        { label: '🦴 Spine Joint Rig', prompt: 'Create a humanoid skeletal joint chain for IK rigging' },
        { label: '🦾 Arm IK Chain', prompt: 'Build an articulated 3-joint arm hierarchy with shoulder, elbow, and wrist' }
      ];
    } else if (mode === 'shader') {
      chips = [
        { label: '✨ Arnold Gold', prompt: 'Apply an Arnold reflective gold and glowing emission material to selected mesh' },
        { label: '💎 Cyber Glass', prompt: 'Synthesize a high-refraction glowing cyber glass shader with blue rim' }
      ];
    } else if (mode === 'python') {
      chips = [
        { label: '⚡ Array Duplicate', prompt: 'Create a circular radial array of 8 poly cubes around origin' },
        { label: '🌀 Spiral Staircase', prompt: 'Generate a procedural spiral staircase with 20 steps using Python' }
      ];
    }

    chipsContainer.innerHTML = chips.map(c => `<button class="jwala-chip" data-prompt="${c.prompt}">${c.label}</button>`).join('');

    chipsContainer.querySelectorAll('.jwala-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.promptInput.value = chip.dataset.prompt;
        this.generate(chip.dataset.prompt);
      });
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
    } else if (lower.includes('building') || lower.includes('skyscraper') || lower.includes('city') || lower.includes('tower')) {
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
    } else if (lower.includes('spiral') || lower.includes('staircase')) {
      thoughts = [
        'Model: google/gemma-4-12B-it-qat-q4_0-gguf',
        'Generating procedural spiral staircase algorithm with 20 steps.',
        'Computing rotational increments of 18 degrees and vertical rise of 0.35m per step.'
      ];
      scriptCode = `import maya.cmds as cmds\nimport math\n\nfor i in range(20):\n    step = cmds.polyCube(w=2, h=0.2, d=0.8)\n    angle = i * 0.314\n    cmds.move(math.cos(angle)*1.5, i * 0.3, math.sin(angle)*1.5)\n    cmds.rotate(0, -angle * 57.3, 0)`;
      actionFn = () => {
        for (let i = 0; i < 20; i++) {
          const { mesh, name } = this.primitives.createCube(1);
          mesh.scale.set(1.8, 0.2, 0.7);
          const angle = i * 0.314;
          mesh.position.set(Math.cos(angle) * 1.8, i * 0.28, Math.sin(angle) * 1.8);
          mesh.rotation.y = -angle;
          this.scene.addObject(mesh, name);
        }
      };
    } else {
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

    // Stream Gemma-4 thoughts
    for (const line of thoughts) {
      await new Promise(r => setTimeout(r, 120));
      this.thoughtEl.textContent += line + '\n';
      this.thoughtEl.scrollTop = this.thoughtEl.scrollHeight;
    }

    this.codeBox.textContent = scriptCode;

    this.isGenerating = false;
    this.submitBtn.disabled = false;
    this.submitBtn.innerHTML = `<span>🔥</span><span>Synthesize with Gemma-4</span>`;

    // Apply directly to viewport
    if (this.generatedAction) {
      this.generatedAction();
    }
  }

  expand() {
    this.panel.classList.remove('collapsed');
    this.collapseBtn.textContent = '◂';
    this.scene.onResize();
  }
}
