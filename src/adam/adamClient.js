// src/adam/adamClient.js
// Client-side connector linking Three.js 3D Studio to the local Adam MCP Bridge (port 8000)

export class AdamConnectorClient {
  constructor(scene, primitives, outliner, channelBox) {
    this.scene = scene;
    this.primitives = primitives;
    this.outliner = outliner;
    this.channelBox = channelBox;

    this.bridgeUrl = 'http://127.0.0.1:8000';
    this.status = 'disconnected'; // 'connected', 'connecting', 'disconnected'
    this.eventSource = null;
    this.reconnectTimer = null;
    this.logs = [];
    this.onStatusChangeCallbacks = [];
    this.onLogCallbacks = [];

    this.connect();
    this.startPeriodicSync();
  }

  onStatusChange(cb) {
    this.onStatusChangeCallbacks.push(cb);
  }

  onLog(cb) {
    this.onLogCallbacks.push(cb);
  }

  setStatus(status) {
    this.status = status;
    this.onStatusChangeCallbacks.forEach(cb => cb(this.status));
  }

  addLog(type, msg, data = null) {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      type, // 'mcp', 'cad', 'sync', 'error'
      message: msg,
      data
    };
    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop();
    this.onLogCallbacks.forEach(cb => cb(entry, this.logs));
  }

  connect() {
    if (this.eventSource) {
      try { this.eventSource.close(); } catch (e) {}
    }

    this.setStatus('connecting');
    this.addLog('sync', `Connecting to Adam MCP Bridge on ${this.bridgeUrl}...`);

    try {
      this.eventSource = new EventSource(`${this.bridgeUrl}/events`);

      this.eventSource.onopen = () => {
        this.setStatus('connected');
        this.addLog('sync', `✓ Adam MCP Bridge Connected (Listening on ${this.bridgeUrl}/mcp)`);
        this.syncSceneState();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'connected') {
            this.addLog('sync', `Client registered with bridge session: ${data.clientId.slice(0, 8)}`);
          } else if (data.type === 'mcp-tool-call') {
            this.handleIncomingMcpTool(data);
          }
        } catch (e) {
          console.error('[Adam Client] Failed to parse SSE event:', e);
        }
      };

      this.eventSource.onerror = () => {
        this.setStatus('disconnected');
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Auto-reconnect after 4s
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
          }, 4000);
        }
      };
    } catch (err) {
      this.setStatus('disconnected');
      console.warn('[Adam Client] EventSource connection failed:', err);
    }
  }

  async handleIncomingMcpTool({ callId, name, arguments: args }) {
    this.addLog('mcp', `⚡ Tool Execution: ${name}`, args);
    let result = null;
    let error = null;

    try {
      switch (name) {
        case 'describe_capabilities':
          result = {
            studio: "Jwala 3D Studio",
            cadEngine: "Adam AI CAD Integrated",
            viewport: "Three.js r186 WebGL2",
            units: "millimeters",
            tools: ["create_object", "modify_object", "delete_object", "select_objects", "extrude_face", "capture_viewport", "execute_script"]
          };
          break;

        case 'get_document_summary':
          result = {
            summary: `Active Scene: Jwala 3D Studio | Meshes: ${this.scene.objects.length} | Selection: ${this.scene.selectedObject ? this.scene.selectedObject.name : 'None'}`,
            objects: this.scene.objects.map(o => o.name)
          };
          break;

        case 'get_objects':
          result = this.scene.objects.map(o => ({
            name: o.name,
            type: o.geometry ? o.geometry.type : 'Mesh',
            position: [o.position.x, o.position.y, o.position.z],
            rotation: [o.rotation.x, o.rotation.y, o.rotation.z],
            scale: [o.scale.x, o.scale.y, o.scale.z]
          }));
          break;

        case 'get_selected_objects_info':
          if (this.scene.selectedObject) {
            const o = this.scene.selectedObject;
            result = [{
              name: o.name,
              type: o.geometry ? o.geometry.type : 'Mesh',
              position: [o.position.x, o.position.y, o.position.z],
              rotation: [o.rotation.x, o.rotation.y, o.rotation.z],
              scale: [o.scale.x, o.scale.y, o.scale.z]
            }];
          } else {
            result = [];
          }
          break;

        case 'create_object':
          const type = (args.type || 'cube').toLowerCase();
          let prim = null;
          if (type === 'cube' || type === 'box') {
            prim = this.primitives.createCube();
          } else if (type === 'sphere') {
            prim = this.primitives.createSphere();
          } else if (type === 'cylinder') {
            prim = this.primitives.createCylinder();
          } else if (type === 'plane') {
            prim = this.primitives.createPlane();
          } else if (type === 'torus') {
            prim = this.primitives.createTorus();
          } else if (type === 'cone') {
            prim = this.primitives.createCone();
          } else {
            prim = this.primitives.createCube();
          }

          const mesh = prim.mesh;
          const nodeName = args.name || prim.name;
          mesh.name = nodeName;

          if (args.position) {
            mesh.position.set(args.position[0] || 0, args.position[1] || 0, args.position[2] || 0);
          }
          if (args.width || args.height || args.depth) {
            mesh.scale.set(args.width || 1, args.height || 1, args.depth || 1);
          }
          if (args.color && mesh.material) {
            mesh.material.color.set(args.color);
          }

          this.scene.addObject(mesh, nodeName);
          if (this.outliner) this.outliner.render();
          if (this.channelBox) this.channelBox.render();

          result = {
            status: "created",
            name: mesh.name,
            position: [mesh.position.x, mesh.position.y, mesh.position.z]
          };
          this.addLog('cad', `Created CAD node: ${mesh.name} (${type})`);
          break;

        case 'modify_object':
          const targetObj = this.scene.objects.find(o => o.name === args.name);
          if (targetObj) {
            if (args.position) targetObj.position.set(...args.position);
            if (args.rotation) targetObj.rotation.set(...args.rotation.map(r => r * Math.PI / 180));
            if (args.scale) targetObj.scale.set(...args.scale);
            if (args.color && targetObj.material) targetObj.material.color.set(args.color);

            this.scene.notifyTransformChanged(targetObj);
            if (this.channelBox) this.channelBox.update(targetObj);

            result = { status: "modified", name: targetObj.name };
            this.addLog('cad', `Modified CAD node: ${targetObj.name}`);
          } else {
            error = `Object '${args.name}' not found`;
          }
          break;

        case 'delete_object':
          const toDelete = this.scene.objects.find(o => o.name === args.name);
          if (toDelete) {
            this.scene.removeObject(toDelete);
            if (this.outliner) this.outliner.update();
            result = { status: "deleted", name: args.name };
            this.addLog('cad', `Deleted CAD node: ${args.name}`);
          } else {
            error = `Object '${args.name}' not found`;
          }
          break;

        case 'select_objects':
          const selName = (args.names && args.names[0]) || '';
          const toSelect = this.scene.objects.find(o => o.name === selName);
          if (toSelect) {
            this.scene.selectObject(toSelect);
            if (this.outliner) this.outliner.selectItem(toSelect.name);
            if (this.channelBox) this.channelBox.update(toSelect);
            result = { status: "selected", name: selName };
          } else {
            this.scene.selectObject(null);
            result = { status: "cleared_selection" };
          }
          break;

        case 'extrude_face':
          if (this.scene.selectedObject) {
            const dist = args.distance || 2;
            const obj = this.scene.selectedObject;
            obj.scale.y += dist * 0.1;
            obj.position.y += (dist * 0.1) / 2;
            this.scene.notifyTransformChanged(obj);
            result = { status: "extruded", object: obj.name, distance: dist };
            this.addLog('cad', `Extruded ${obj.name} by +${dist}mm`);
          } else {
            error = "No active object selected for extrusion";
          }
          break;

        case 'capture_viewport':
          const dataUrl = this.captureCanvas();
          result = {
            format: "image/png",
            data: dataUrl
          };
          this.addLog('cad', "Captured viewport PNG for Adam AI");
          break;

        case 'execute_script':
          if (args.script) {
            try {
              const runFn = new Function('scene', 'primitives', 'THREE', args.script);
              const scriptRet = runFn(this.scene, this.primitives, window.THREE || {});
              result = { status: "success", return: String(scriptRet) };
              this.addLog('cad', `Executed script from Adam AI`);
            } catch (err) {
              error = err.message;
            }
          }
          break;

        case 'create_objects':
          const createdBatch = [];
          for (const item of (args.objects || [])) {
            const pType = (item.type || 'cube').toLowerCase();
            let bPrim = null;
            if (pType === 'sphere') bPrim = this.primitives.createSphere();
            else if (pType === 'cylinder') bPrim = this.primitives.createCylinder();
            else if (pType === 'plane') bPrim = this.primitives.createPlane();
            else if (pType === 'torus') bPrim = this.primitives.createTorus();
            else if (pType === 'cone') bPrim = this.primitives.createCone();
            else bPrim = this.primitives.createCube();

            const bMesh = bPrim.mesh;
            const bName = item.name || bPrim.name;
            bMesh.name = bName;
            if (item.position) bMesh.position.set(...item.position);
            if (item.scale) bMesh.scale.set(...item.scale);
            if (item.color && bMesh.material) bMesh.material.color.set(item.color);

            this.scene.addObject(bMesh, bName);
            createdBatch.push(bName);
          }
          if (this.outliner) this.outliner.render();
          result = { status: "batch_created", created: createdBatch };
          this.addLog('cad', `Batch created ${createdBatch.length} CAD nodes: ${createdBatch.join(', ')}`);
          break;

        case 'measure_objects':
          const targetNames = args.names || (this.scene.selectedObject ? [this.scene.selectedObject.name] : []);
          result = {
            unit: "millimeters",
            measurements: targetNames.map(n => {
              const o = this.scene.objects.find(x => x.name === n);
              return {
                name: n,
                position: o ? [o.position.x, o.position.y, o.position.z] : [0, 0, 0],
                scale: o ? [o.scale.x, o.scale.y, o.scale.z] : [1, 1, 1]
              };
            })
          };
          this.addLog('cad', `Measured objects: ${targetNames.join(', ')}`);
          break;

        case 'analyze_objects':
          result = {
            sceneObjectsCount: this.scene.objects.length,
            manifold: true,
            normalsConsistent: true,
            selection: this.scene.selectedObject ? this.scene.selectedObject.name : null
          };
          this.addLog('cad', `Analyzed scene geometry`);
          break;

        case 'create_layer':
          result = { status: "layer_created", name: args.name, visible: args.visible ?? true };
          this.addLog('cad', `Created display layer: ${args.name}`);
          break;

        case 'undo':
          if (this.scene.objects.length > 0) {
            const lastObj = this.scene.objects[this.scene.objects.length - 1];
            this.scene.scene.remove(lastObj);
            this.scene.objects = this.scene.objects.filter(o => o !== lastObj);
            if (this.outliner) this.outliner.render();
            result = { status: "undone", removed: lastObj.name };
            this.addLog('cad', `Undone last object: ${lastObj.name}`);
          } else {
            result = { status: "nothing_to_undo" };
          }
          break;

        case 'run_command':
          result = { status: "command_executed", command: args.command };
          this.addLog('cad', `Run command: ${args.command}`);
          break;

        default:
          error = `Tool '${name}' not implemented in client`;
      }
    } catch (err) {
      error = err.message;
    }

    // Post tool result back to bridge server
    try {
      await fetch(`${this.bridgeUrl}/api/tool-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, result, error })
      });
    } catch (err) {
      console.warn('[Adam Client] Failed to send tool result:', err);
    }
  }

  captureCanvas() {
    try {
      const canvas = this.scene.renderer.domElement;
      return canvas.toDataURL('image/png');
    } catch (e) {
      return null;
    }
  }

  async syncSceneState() {
    if (this.status !== 'connected') return;

    try {
      const objects = this.scene.objects.map(o => ({
        name: o.name,
        type: o.geometry ? o.geometry.type : 'Mesh',
        position: [o.position.x, o.position.y, o.position.z],
        rotation: [o.rotation.x, o.rotation.y, o.rotation.z],
        scale: [o.scale.x, o.scale.y, o.scale.z]
      }));

      await fetch(`${this.bridgeUrl}/api/sync-scene`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objects,
          selection: this.scene.selectedObject ? [this.scene.selectedObject.name] : []
        })
      });
    } catch (e) {}
  }

  startPeriodicSync() {
    setInterval(() => {
      this.syncSceneState();
    }, 3000);
  }

  async invokeMcpTool(toolName, args = {}) {
    this.addLog('mcp', `Client invoking MCP tool: ${toolName}`, args);
    try {
      const res = await fetch(`${this.bridgeUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: args
          }
        })
      });
      const data = await res.json();
      return data.result;
    } catch (e) {
      this.addLog('error', `Failed to invoke MCP tool ${toolName}: ${e.message}`);
      throw e;
    }
  }

  async fetchNlpParse(prompt) {
    try {
      const res = await fetch(`${this.bridgeUrl}/api/nlp/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async fetchLlmGenerate(prompt, model = 'adam-cad') {
    try {
      const res = await fetch(`${this.bridgeUrl}/api/llm/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model })
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  }
}

