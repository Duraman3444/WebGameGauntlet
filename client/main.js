import * as THREE from 'three';
import { io } from 'socket.io-client';
import { MapLoader } from './MapLoader.js';

class MultiplayerGame {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.socket = null;
    this.players = {};
    this.player = null;
    this.gameObjects = [];
    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.isPointerLocked = false;
    this.playerId = null;
    this.score = 0;
    this.health = 100;
    this.mapLoader = null;
    this.availableMaps = [];
    this.isSettingsOpen = false;
    
    // Default environment tracking
    this.defaultEnvironment = [];
    this.defaultGround = null;
    this.isDefaultEnvironmentActive = true;
    
    // Movement
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.canJump = false;
    
    // Performance tracking
    this.lastTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.fpsUpdateInterval = 1000; // Update FPS every second
    this.lastFpsUpdate = 0;
    
    // Movement optimization
    this.moveSpeed = 20;
    this.jumpSpeed = 15;
    this.gravity = 30;
    this.mouseSensitivity = 0.002;
    
    // Performance optimization - shared resources
    this.sharedGeometries = {
      player: null,
      collectible: null,
      platform: null,
      wall: null,
      ground: null
    };
    
    this.sharedMaterials = {
      player: null,
      collectible: null,
      platform: null,
      wall: null,
      ground: null
    };
    
    // Object pooling for better performance
    this.objectPool = {
      players: [],
      collectibles: []
    };
    
    this.maxPoolSize = 20;
    this.renderDistance = 200;
    this.cullingEnabled = true;
    
    // Initialize the game
    this.init();
  }

  async init() {
    try {
      this.setupScene();
      this.setupLighting();
      this.createSharedResources();
      this.setupPlayer();
      this.setupEnvironment();
      this.setupMapLoader();
      this.setupControls();
      this.setupUI();
      await this.connectToServer();
      await this.loadInitialMap();
      this.animate();
      
      // Hide loading screen
      document.getElementById('loading').classList.add('hidden');
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  }

  createSharedResources() {
    // Create shared geometries (reuse for all instances)
    this.sharedGeometries.player = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
    this.sharedGeometries.collectible = new THREE.SphereGeometry(0.8, 6, 4); // Reduced detail
    this.sharedGeometries.platform = new THREE.BoxGeometry(8, 1, 8);
    this.sharedGeometries.wall = new THREE.BoxGeometry(4, 10, 4);
    this.sharedGeometries.ground = new THREE.PlaneGeometry(200, 200);
    
    // Create shared materials (reuse for all instances)
    this.sharedMaterials.player = new THREE.MeshLambertMaterial({ color: 0x4ecdc4 });
    this.sharedMaterials.collectible = new THREE.MeshLambertMaterial({ 
      color: 0xf9ca24,
      emissive: 0xf9ca24,
      emissiveIntensity: 0.1 // Reduced for performance
    });
    this.sharedMaterials.platform = new THREE.MeshLambertMaterial({ color: 0x34495e });
    this.sharedMaterials.wall = new THREE.MeshLambertMaterial({ color: 0x7f8c8d });
    this.sharedMaterials.ground = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
    
    console.log('🎯 Created shared resources for optimal performance');
  }

  setupScene() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x001122);
    this.scene.fog = new THREE.Fog(0x001122, 0, 1000);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);

    // Create renderer with aggressive optimizations
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('gameCanvas'),
      antialias: false, // Disable for better performance
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Reduce for better performance
    
    // Optimize rendering settings
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // Use basic shadows for better performance
    this.renderer.shadowMap.autoUpdate = false; // Manual shadow updates
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Performance optimizations
    this.renderer.sortObjects = false; // Disable automatic sorting for better performance
    this.renderer.setAnimationLoop = null; // Use manual animation loop
    this.renderer.info.autoReset = false; // Disable automatic info reset
    
    // Culling optimizations
    this.renderer.localClippingEnabled = false;
    this.renderer.gammaFactor = 2.2;
    
    // Handle window resize with throttling
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      }, 100);
    });
  }

  setupLighting() {
    // Ambient light - increase to reduce dependency on shadows
    const ambientLight = new THREE.AmbientLight(0x404040, 0.7);
    this.scene.add(ambientLight);

    // Directional light (sun) - optimized for performance
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    
    // Optimize shadow settings for performance
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.mapSize.width = 1024; // Reduced from 2048
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.radius = 4;
    directionalLight.shadow.bias = -0.0001;
    this.scene.add(directionalLight);

    // Store references for optimization
    this.ambientLight = ambientLight;
    this.directionalLight = directionalLight;
    
    // Remove expensive point lights for better performance
    // Point lights will be added only when needed
  }

  setupPlayer() {
    // Create player using shared resources
    this.player = new THREE.Mesh(this.sharedGeometries.player, this.sharedMaterials.player);
    this.player.position.set(0, 1, 0);
    this.player.castShadow = true;
    this.scene.add(this.player);

    // Create camera group for first-person view
    this.cameraGroup = new THREE.Group();
    this.cameraGroup.add(this.camera);
    this.player.add(this.cameraGroup);
    this.camera.position.set(0, 0.5, 0);
  }

  setupEnvironment() {
    // Create ground using shared resources
    const ground = new THREE.Mesh(this.sharedGeometries.ground, this.sharedMaterials.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.userData = { isDefaultEnvironment: true };
    this.scene.add(ground);
    this.defaultGround = ground;
    this.defaultEnvironment.push(ground);

    // Create some platforms and obstacles
    this.createPlatforms();
    this.createCollectibles();
  }

  setupMapLoader() {
    this.mapLoader = new MapLoader(this.scene);
    console.log('🗺️ Map loader initialized');
  }

  async loadInitialMap() {
    try {
      // Try to load available maps
      const availableMaps = await this.mapLoader.loadAvailableMaps();
      
      if (availableMaps.length > 0) {
        // Hide default environment and load the first available map
        this.hideDefaultEnvironment();
        const firstMap = availableMaps[0];
        const mapResult = await this.mapLoader.loadMap(firstMap.path, firstMap.name);
        
        // Position player at the spawn point inside the map
        if (mapResult.spawnPoint) {
          this.player.position.copy(mapResult.spawnPoint);
          this.player.position.y += 1.8; // Add player height
          console.log(`🎮 Player spawned at: ${this.player.position.x.toFixed(2)}, ${this.player.position.y.toFixed(2)}, ${this.player.position.z.toFixed(2)}`);
        }
        
        // Update lighting for the map environment
        this.updateLightingForMap();
        
        console.log(`🎮 Loaded initial map: ${firstMap.name}`);
        
        // Update UI to show map info
        this.updateMapInfo();
      } else {
        console.log('📂 No custom maps found, using default environment');
        // Default environment is already active
      }
    } catch (error) {
      console.error('⚠️ Failed to load initial map:', error);
      console.log('🎮 Continuing with default environment');
      // Make sure default environment is shown if map loading fails
      this.showDefaultEnvironment();
      this.player.position.set(0, 1, 0);
    }
  }

  createPlatforms() {
    // Create fewer platforms using shared resources for better performance
    const platformPositions = [
      { x: 20, y: 2, z: 0 },
      { x: -20, y: 4, z: 20 },
      { x: 0, y: 6, z: -30 }
    ];

    platformPositions.forEach(pos => {
      const platform = new THREE.Mesh(this.sharedGeometries.platform, this.sharedMaterials.platform);
      platform.position.set(pos.x, pos.y, pos.z);
      platform.castShadow = true;
      platform.receiveShadow = true;
      platform.userData = { isDefaultEnvironment: true };
      this.scene.add(platform);
      this.defaultEnvironment.push(platform);
      this.gameObjects.push(platform);
    });

    // Create fewer walls for boundaries using shared resources
    for (let i = 0; i < 8; i++) { // Reduced from 12 to 8
      const angle = (i / 8) * Math.PI * 2;
      const radius = 80;
      const wall = new THREE.Mesh(this.sharedGeometries.wall, this.sharedMaterials.wall);
      wall.position.x = Math.cos(angle) * radius;
      wall.position.z = Math.sin(angle) * radius;
      wall.position.y = 5;
      wall.castShadow = true;
      wall.receiveShadow = true;
      wall.userData = { isDefaultEnvironment: true };
      this.scene.add(wall);
      this.defaultEnvironment.push(wall);
      this.gameObjects.push(wall);
    }
  }

  createCollectibles() {
    // Create fewer collectibles using shared resources for better performance
    for (let i = 0; i < 8; i++) { // Reduced from 15 to 8
      const collectible = new THREE.Mesh(this.sharedGeometries.collectible, this.sharedMaterials.collectible);
      collectible.position.set(
        (Math.random() - 0.5) * 120,
        2 + Math.random() * 8,
        (Math.random() - 0.5) * 120
      );
      collectible.castShadow = true;
      collectible.userData = { 
        type: 'collectible', 
        collected: false, 
        isDefaultEnvironment: true 
      };
      this.scene.add(collectible);
      this.defaultEnvironment.push(collectible);
      this.gameObjects.push(collectible);
    }
  }

  setupControls() {
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
      this.keys[event.code] = true;
      
      if (event.code === 'Enter') {
        event.preventDefault();
        this.focusChat();
      }
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.code] = false;
    });

    // Mouse controls
    document.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        this.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === document.getElementById('gameCanvas');
    });

    document.addEventListener('mousemove', (event) => {
      if (this.isPointerLocked) {
        this.mouseX -= event.movementX * this.mouseSensitivity;
        this.mouseY -= event.movementY * this.mouseSensitivity;
        this.mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.mouseY));
        
        this.cameraGroup.rotation.y = this.mouseX;
        this.camera.rotation.x = this.mouseY;
      }
    });

    // Escape key to release pointer lock
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Escape') {
        document.exitPointerLock();
      }
    });
  }

  setupUI() {
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        const message = chatInput.value.trim();
        if (message && this.socket) {
          this.socket.emit('chatMessage', message);
          chatInput.value = '';
          chatInput.blur();
        }
      }
    });

    // Setup settings panel
    this.setupSettingsPanel();
  }

  setupSettingsPanel() {
    const settingsButton = document.getElementById('settingsButton');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettings = document.getElementById('closeSettings');
    const clearCurrentMap = document.getElementById('clearCurrentMap');
    const refreshMaps = document.getElementById('refreshMaps');
    
    // Settings button click
    settingsButton.addEventListener('click', () => {
      this.toggleSettings();
    });

    // Close settings
    closeSettings.addEventListener('click', () => {
      this.closeSettings();
    });

    // Clear current map
    clearCurrentMap.addEventListener('click', () => {
      this.clearCurrentMap();
    });

    // Refresh maps
    refreshMaps.addEventListener('click', () => {
      this.refreshMapList();
    });

    // Tab key to toggle settings
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Tab') {
        event.preventDefault();
        this.toggleSettings();
      }
    });

    // Click outside to close settings
    settingsPanel.addEventListener('click', (event) => {
      if (event.target === settingsPanel) {
        this.closeSettings();
      }
    });

    // Settings checkboxes
    const showCollisionMeshes = document.getElementById('showCollisionMeshes');
    const showSpawnPoints = document.getElementById('showSpawnPoints');
    const enableFrustumCulling = document.getElementById('enableFrustumCulling');
    const enableShadows = document.getElementById('enableShadows');

    showCollisionMeshes.addEventListener('change', (event) => {
      this.toggleCollisionMeshes(event.target.checked);
    });

    showSpawnPoints.addEventListener('change', (event) => {
      this.toggleSpawnPoints(event.target.checked);
    });

    enableFrustumCulling.addEventListener('change', (event) => {
      this.cullingEnabled = event.target.checked;
      console.log(`🎯 Frustum culling ${this.cullingEnabled ? 'enabled' : 'disabled'}`);
    });

    enableShadows.addEventListener('change', (event) => {
      this.renderer.shadowMap.enabled = event.target.checked;
      this.directionalLight.castShadow = event.target.checked;
      console.log(`💡 Shadows ${event.target.checked ? 'enabled' : 'disabled'}`);
    });
  }

  async toggleSettings() {
    if (this.isSettingsOpen) {
      this.closeSettings();
    } else {
      await this.openSettings();
    }
  }

  async openSettings() {
    this.isSettingsOpen = true;
    document.getElementById('settingsPanel').classList.remove('hidden');
    
    // Load available maps
    await this.loadAvailableMapsToUI();
  }

  closeSettings() {
    this.isSettingsOpen = false;
    document.getElementById('settingsPanel').classList.add('hidden');
  }

  async loadAvailableMapsToUI() {
    const mapListElement = document.getElementById('mapList');
    mapListElement.innerHTML = '<div class="loading">Loading maps...</div>';

    try {
      this.availableMaps = await this.mapLoader.loadAvailableMaps();
      
      // Filter out any maps that don't actually exist
      const validMaps = this.availableMaps.filter(map => map.size > 0);
      
      if (validMaps.length === 0) {
        mapListElement.innerHTML = `
          <div class="loading">
            <p>No maps found in public/maps/</p>
            <p style="font-size: 12px; margin-top: 10px;">
              Add GLB files to public/maps/ and refresh
            </p>
          </div>
        `;
        return;
      }

      // Add default map option
      const defaultMapHTML = `
        <div class="map-item ${this.isDefaultEnvironmentActive ? 'active' : ''}" data-map="default">
          <div>
            <div class="map-name">🏞️ Default Environment</div>
            <div class="map-size">Built-in</div>
          </div>
        </div>
      `;

      // Generate map list HTML for valid maps only
      const mapListHTML = validMaps.map(map => `
        <div class="map-item ${this.mapLoader.mapName === map.name ? 'active' : ''}" data-map="${map.name}" data-path="${map.path}">
          <div>
            <div class="map-name">🗺️ ${map.name}</div>
            <div class="map-size">${this.formatFileSize(map.size)}</div>
          </div>
        </div>
      `).join('');

      mapListElement.innerHTML = defaultMapHTML + mapListHTML;

      // Add click handlers for map items
      const mapItems = mapListElement.querySelectorAll('.map-item');
      mapItems.forEach(item => {
        item.addEventListener('click', () => {
          this.switchMap(item.dataset.map, item.dataset.path);
        });
      });

      // Update available maps count
      console.log(`📂 Loaded ${validMaps.length} valid maps in UI`);

    } catch (error) {
      console.error('Failed to load maps:', error);
      mapListElement.innerHTML = `
        <div class="loading">
          <p>Error loading maps</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Check console for details
          </p>
        </div>
      `;
    }
  }

  async refreshMapList() {
    const refreshButton = document.getElementById('refreshMaps');
    const originalText = refreshButton.textContent;
    
    try {
      // Show loading state
      refreshButton.textContent = '🔄 Refreshing...';
      refreshButton.disabled = true;
      
      // Clear cached maps
      this.availableMaps = [];
      
      // Reload the map list
      await this.loadAvailableMapsToUI();
      
      console.log('🔄 Map list refreshed');
      
    } catch (error) {
      console.error('Failed to refresh map list:', error);
    } finally {
      // Restore button state
      refreshButton.textContent = originalText;
      refreshButton.disabled = false;
    }
  }

  hideDefaultEnvironment() {
    this.defaultEnvironment.forEach(obj => {
      obj.visible = false;
    });
    this.isDefaultEnvironmentActive = false;
    console.log('🏞️ Default environment hidden');
  }

  showDefaultEnvironment() {
    this.defaultEnvironment.forEach(obj => {
      obj.visible = true;
    });
    this.isDefaultEnvironmentActive = true;
    console.log('🏞️ Default environment shown');
  }

  async switchMap(mapName, mapPath) {
    try {
      // Show loading state
      const mapListElement = document.getElementById('mapList');
      const activeItem = mapListElement.querySelector('.active');
      if (activeItem) {
        activeItem.classList.remove('active');
      }

      if (mapName === 'default') {
        // Clear current map and show default environment
        this.mapLoader.clearCurrentMap();
        this.showDefaultEnvironment();
        // Reset player position to default
        this.player.position.set(0, 1, 0);
        this.updateMapInfo();
        console.log('🏞️ Switched to default environment');
      } else {
        // Hide default environment and load the selected map
        this.hideDefaultEnvironment();
        const mapResult = await this.mapLoader.loadMap(mapPath, mapName);
        
        // Position player at the spawn point inside the map
        if (mapResult.spawnPoint) {
          this.player.position.copy(mapResult.spawnPoint);
          this.player.position.y += 1.8; // Add player height
          console.log(`🎮 Player spawned at: ${this.player.position.x.toFixed(2)}, ${this.player.position.y.toFixed(2)}, ${this.player.position.z.toFixed(2)}`);
        }
        
        // Update lighting for the map environment
        this.updateLightingForMap();
        
        this.updateMapInfo();
        console.log(`🗺️ Switched to map: ${mapName}`);
      }

      // Update active state
      const selectedItem = mapListElement.querySelector(`[data-map="${mapName}"]`);
      if (selectedItem) {
        selectedItem.classList.add('active');
      }

    } catch (error) {
      console.error('Failed to switch map:', error);
      // If map loading fails, show default environment
      this.showDefaultEnvironment();
      this.player.position.set(0, 1, 0);
      alert(`Failed to load map: ${mapName}`);
    }
  }

  clearCurrentMap() {
    if (this.mapLoader && this.mapLoader.currentMap) {
      this.mapLoader.clearCurrentMap();
      this.showDefaultEnvironment();
      this.player.position.set(0, 1, 0);
      
      // Reset lighting for default environment
      this.scene.background = new THREE.Color(0x001122);
      this.scene.fog = new THREE.Fog(0x001122, 0, 1000);
      
      // Reset ambient light intensity
      const ambientLight = this.scene.children.find(child => 
        child.type === 'AmbientLight'
      );
      if (ambientLight) {
        ambientLight.intensity = 0.3;
      }
      
      this.updateMapInfo();
      
      // Update UI if settings panel is open
      if (this.isSettingsOpen) {
        const mapListElement = document.getElementById('mapList');
        const activeItem = mapListElement.querySelector('.active');
        if (activeItem) {
          activeItem.classList.remove('active');
        }
        
        const defaultItem = mapListElement.querySelector('[data-map="default"]');
        if (defaultItem) {
          defaultItem.classList.add('active');
        }
      }
    }
  }

  formatFileSize(bytes) {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  toggleCollisionMeshes(show) {
    if (this.mapLoader && this.mapLoader.mapCollisionMeshes) {
      this.mapLoader.mapCollisionMeshes.forEach(mesh => {
        mesh.visible = show;
        if (show) {
          mesh.material.wireframe = true;
          mesh.material.opacity = 0.3;
        }
      });
    }
  }

  toggleSpawnPoints(show) {
    if (this.mapLoader) {
      const spawnPoints = this.mapLoader.getMapSpawnPoints();
      
      // Remove existing spawn point markers
      const existingMarkers = this.scene.children.filter(child => 
        child.userData && child.userData.isSpawnPoint
      );
      existingMarkers.forEach(marker => this.scene.remove(marker));

      if (show) {
        // Add spawn point markers
        spawnPoints.forEach((point, index) => {
          const geometry = new THREE.SphereGeometry(0.5, 8, 6);
          const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.7
          });
          const marker = new THREE.Mesh(geometry, material);
          marker.position.copy(point);
          marker.userData = { isSpawnPoint: true, index: index };
          this.scene.add(marker);
        });
      }
    }
  }

  async connectToServer() {
    return new Promise((resolve, reject) => {
      this.socket = io('http://localhost:3001');

      this.socket.on('connect', () => {
        console.log('Connected to server');
        resolve();
      });

      this.socket.on('gameState', (data) => {
        this.playerId = data.yourPlayerId;
        this.updatePlayersFromServer(data.players);
        // Game objects are already created in setupEnvironment()
      });

      this.socket.on('playerJoined', (playerData) => {
        this.addPlayer(playerData);
      });

      this.socket.on('playerLeft', (playerId) => {
        this.removePlayer(playerId);
      });

      this.socket.on('playerMoved', (data) => {
        this.updatePlayerPosition(data);
      });

      this.socket.on('playerAction', (data) => {
        this.handlePlayerAction(data);
      });

      this.socket.on('chatMessage', (data) => {
        this.addChatMessage(data);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection failed:', error);
        reject(error);
      });
    });
  }

  updatePlayersFromServer(playersData) {
    Object.keys(playersData).forEach(playerId => {
      if (playerId !== this.playerId) {
        this.addPlayer(playersData[playerId]);
      }
    });
    this.updatePlayerCount(Object.keys(playersData).length);
  }

  addPlayer(playerData) {
    if (this.players[playerData.id]) return;

    // Use shared geometry and create player-specific material
    const playerMaterial = new THREE.MeshLambertMaterial({ color: playerData.color });
    const playerMesh = new THREE.Mesh(this.sharedGeometries.player, playerMaterial);
    
    playerMesh.position.set(playerData.position.x, playerData.position.y, playerData.position.z);
    playerMesh.castShadow = true;
    
    this.players[playerData.id] = {
      mesh: playerMesh,
      data: playerData,
      material: playerMaterial // Store reference for cleanup
    };
    
    this.scene.add(playerMesh);
  }

  removePlayer(playerId) {
    if (this.players[playerId]) {
      this.scene.remove(this.players[playerId].mesh);
      delete this.players[playerId];
    }
  }

  updatePlayerPosition(data) {
    if (this.players[data.id]) {
      this.players[data.id].mesh.position.copy(data.position);
      this.players[data.id].mesh.rotation.copy(data.rotation);
    }
  }

  handlePlayerAction(data) {
    // Handle different player actions
    console.log('Player action:', data);
  }

  addChatMessage(data) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.innerHTML = `<span class="chat-player">Player:</span> ${data.message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  updatePlayerCount(count) {
    document.getElementById('players').textContent = `Players: ${count}`;
  }

  updateScore(newScore) {
    this.score = newScore;
    document.getElementById('score').textContent = `Score: ${this.score}`;
  }

  updateHealth(newHealth) {
    this.health = newHealth;
    document.getElementById('health').textContent = `Health: ${this.health}`;
  }

  updateMapInfo() {
    if (this.mapLoader) {
      const mapInfo = this.mapLoader.getCurrentMapInfo();
      const mapElement = document.getElementById('mapInfo');
      const currentMapName = document.getElementById('currentMapName');
      
      const displayName = mapInfo.name || 'Default';
      
      if (mapElement) {
        mapElement.textContent = `Map: ${displayName}`;
      }
      
      if (currentMapName) {
        currentMapName.textContent = displayName;
      }
    }
  }

  // Memory management and cleanup
  dispose() {
    // Clean up shared geometries
    Object.values(this.sharedGeometries).forEach(geometry => {
      if (geometry) geometry.dispose();
    });
    
    // Clean up shared materials
    Object.values(this.sharedMaterials).forEach(material => {
      if (material) material.dispose();
    });
    
    // Clean up player-specific materials
    Object.values(this.players).forEach(player => {
      if (player.mesh) {
        this.scene.remove(player.mesh);
        if (player.material) player.material.dispose();
      }
    });
    
    // Clean up renderer
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // Clear arrays
    this.gameObjects.length = 0;
    this.defaultEnvironment.length = 0;
    this.players = {};
    
    // Clear object pools
    this.objectPool.players.length = 0;
    this.objectPool.collectibles.length = 0;
    
    console.log('🧹 Memory cleanup completed with shared resources');
  }

  requestPointerLock() {
    const canvas = document.getElementById('gameCanvas');
    canvas.requestPointerLock();
  }

  focusChat() {
    const chatInput = document.getElementById('chatInput');
    chatInput.focus();
  }

  updateLightingForMap() {
    if (!this.mapLoader || !this.mapLoader.currentMap) return;

    // Get map bounds to adjust lighting
    const box = new THREE.Box3().setFromObject(this.mapLoader.currentMap);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Update scene background and fog for map environment
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, size.length() * 0.5, size.length() * 2);
    
    // Find and update the directional light
    const directionalLight = this.scene.children.find(child => 
      child.type === 'DirectionalLight'
    );
    
    if (directionalLight) {
      // Position the directional light above the map center
      directionalLight.position.set(
        center.x + size.x * 0.3,
        center.y + size.y * 1.5,
        center.z + size.z * 0.3
      );
      
      // Update shadow camera to cover the map
      directionalLight.shadow.camera.left = center.x - size.x;
      directionalLight.shadow.camera.right = center.x + size.x;
      directionalLight.shadow.camera.top = center.z + size.z;
      directionalLight.shadow.camera.bottom = center.z - size.z;
      directionalLight.shadow.camera.near = 0.1;
      directionalLight.shadow.camera.far = size.y * 3;
      directionalLight.shadow.camera.updateProjectionMatrix();
    }
    
    // Increase ambient light for better visibility inside maps
    const ambientLight = this.scene.children.find(child => 
      child.type === 'AmbientLight'
    );
    
    if (ambientLight) {
      ambientLight.intensity = 0.6; // Increased from 0.3
    }
    
    console.log('💡 Lighting updated for map environment');
  }

  updateMovement(deltaTime) {
    if (!this.isPointerLocked) return;

    this.direction.set(0, 0, 0);

    // Check for key presses and build movement direction
    if (this.keys['KeyW'] || this.keys['ArrowUp']) this.direction.z -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) this.direction.z += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.direction.x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) this.direction.x += 1;

    // Normalize and apply camera rotation for movement direction
    if (this.direction.length() > 0) {
      this.direction.normalize();
      this.direction.applyQuaternion(this.cameraGroup.quaternion);
    }

    // Calculate intended movement with improved responsiveness
    const intendedVelocity = this.direction.clone().multiplyScalar(this.moveSpeed);
    
    // Apply movement with collision detection
    this.velocity.x = intendedVelocity.x;
    this.velocity.z = intendedVelocity.z;

    // Check for collisions with map geometry
    if (this.mapLoader && this.mapLoader.currentMap) {
      const collisions = this.mapLoader.checkCollisionWithMap(this.player.position, 0.8);
      
      // Handle horizontal collisions
      for (const collision of collisions) {
        if (collision.direction.y === 0) { // Not a vertical collision
          const pushBack = collision.normal.clone().multiplyScalar(0.8 - collision.distance);
          this.player.position.add(pushBack);
          
          // Stop velocity in the collision direction
          if (collision.direction.x !== 0) this.velocity.x = 0;
          if (collision.direction.z !== 0) this.velocity.z = 0;
        }
      }
      
      // Ground detection for jumping
      const groundHeight = this.mapLoader.getGroundHeight(this.player.position);
      const playerGroundLevel = groundHeight + 1.8; // Player height
      
      if (this.player.position.y <= playerGroundLevel + 0.1) {
        this.player.position.y = playerGroundLevel;
        this.velocity.y = 0;
        this.canJump = true;
      } else {
        // Apply gravity
        this.velocity.y -= this.gravity * deltaTime;
        this.canJump = false;
      }
    } else {
      // Default environment - simple ground collision
      if (this.player.position.y <= 1) {
        this.player.position.y = 1;
        this.velocity.y = 0;
        this.canJump = true;
      } else {
        this.velocity.y -= this.gravity * deltaTime;
      }
    }

    // Jump
    if (this.keys['Space'] && this.canJump) {
      this.velocity.y = this.jumpSpeed;
      this.canJump = false;
    }

    // Apply movement
    this.player.position.addScaledVector(this.velocity, deltaTime);

    // Send position to server (throttled)
    if (this.socket && this.frameCount % 3 === 0) {
      this.socket.emit('playerUpdate', {
        position: this.player.position,
        rotation: this.player.rotation
      });
    }
  }

  checkCollectibles() {
    // Use for loop for better performance than forEach
    for (let i = 0; i < this.gameObjects.length; i++) {
      const object = this.gameObjects[i];
      if (object.userData.type === 'collectible' && !object.userData.collected) {
        const distance = this.player.position.distanceTo(object.position);
        if (distance < 2) {
          object.userData.collected = true;
          object.visible = false;
          this.updateScore(this.score + 10);
          
          // Animate collectible collection
          object.rotation.y += 0.1;
          object.scale.multiplyScalar(0.95);
        }
      }
    }
  }

  animate(currentTime = 0) {
    requestAnimationFrame((time) => this.animate(time));
    
    // Calculate delta time
    const deltaTime = this.lastTime === 0 ? 0.016 : (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    // Update FPS counter
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
      
      // Update FPS display
      const fpsElement = document.getElementById('fps');
      if (fpsElement) {
        fpsElement.textContent = `FPS: ${this.fps}`;
        
        // Color-code FPS for performance indication
        if (this.fps >= 50) {
          fpsElement.style.color = '#2ecc71'; // Green for good performance
        } else if (this.fps >= 30) {
          fpsElement.style.color = '#f39c12'; // Yellow for moderate performance
        } else {
          fpsElement.style.color = '#e74c3c'; // Red for poor performance
        }
      }
    }
    
    // Clamp delta time to prevent large jumps
    const clampedDeltaTime = Math.min(deltaTime, 0.033); // Max 30 FPS
    
    this.updateMovement(clampedDeltaTime);
    
    // Optimize collision and animation checks (only every 3rd frame)
    if (this.frameCount % 3 === 0) {
      this.checkCollectibles();
      this.performFrustumCulling();
    }
    
    // Animate collectibles with optimized calculations (only visible ones)
    const time = currentTime * 0.001; // Convert to seconds
    const frameMultiplier = deltaTime / 0.016; // Normalize to 60 FPS
    
    // Only animate visible collectibles for performance
    for (let i = 0; i < this.gameObjects.length; i++) {
      const object = this.gameObjects[i];
      if (object.userData.type === 'collectible' && object.visible && !object.userData.collected) {
        object.rotation.y += 0.02 * frameMultiplier;
        object.position.y += Math.sin(time * 5) * 0.01 * frameMultiplier;
      }
    }
    
    // Manual shadow map update (only when needed)
    if (this.frameCount % 10 === 0) {
      this.renderer.shadowMap.needsUpdate = true;
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  performFrustumCulling() {
    if (!this.cullingEnabled) return;
    
    const frustum = new THREE.Frustum();
    const cameraMatrix = new THREE.Matrix4().multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(cameraMatrix);
    
    // Cull objects outside camera view
    this.gameObjects.forEach(object => {
      if (object.userData.type === 'collectible') {
        const distance = this.camera.position.distanceTo(object.position);
        const inFrustum = frustum.intersectsObject(object);
        
        // Hide objects that are too far or outside view
        object.visible = inFrustum && distance < this.renderDistance;
      }
    });
    
    // Cull other players
    Object.values(this.players).forEach(player => {
      const distance = this.camera.position.distanceTo(player.mesh.position);
      const inFrustum = frustum.intersectsObject(player.mesh);
      player.mesh.visible = inFrustum && distance < this.renderDistance;
    });
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new MultiplayerGame();
  
  // Clean up resources on page unload
  window.addEventListener('beforeunload', () => {
    game.dispose();
  });
  
  // Add global debug commands for testing
  window.gameDebug = {
    // Load a specific map
    loadMap: async (mapPath, mapName) => {
      if (game.mapLoader) {
        try {
          game.hideDefaultEnvironment();
          const mapResult = await game.mapLoader.loadMap(mapPath, mapName);
          
          // Position player at the spawn point inside the map
          if (mapResult.spawnPoint) {
            game.player.position.copy(mapResult.spawnPoint);
            game.player.position.y += 1.8; // Add player height
            console.log(`🎮 Player spawned at: ${game.player.position.x.toFixed(2)}, ${game.player.position.y.toFixed(2)}, ${game.player.position.z.toFixed(2)}`);
          }
          
          // Update lighting for the map environment
          game.updateLightingForMap();
          
          game.updateMapInfo();
          console.log(`✅ Map loaded: ${mapName}`);
        } catch (error) {
          console.error(`❌ Failed to load map: ${error.message}`);
          game.showDefaultEnvironment();
          game.player.position.set(0, 1, 0);
        }
      }
    },
    
    // Get available maps
    getAvailableMaps: async () => {
      if (game.mapLoader) {
        return await game.mapLoader.loadAvailableMaps();
      }
      return [];
    },
    
    // Get current map info
    getCurrentMapInfo: () => {
      if (game.mapLoader) {
        return game.mapLoader.getCurrentMapInfo();
      }
      return null;
    },
    
    // Clear current map
    clearMap: () => {
      if (game.mapLoader) {
        game.mapLoader.clearCurrentMap();
        game.showDefaultEnvironment();
        game.player.position.set(0, 1, 0);
        game.updateMapInfo();
        console.log('🗑️ Map cleared');
      }
    },
    
    // Load map from URL
    loadMapFromUrl: async (url, name) => {
      if (game.mapLoader) {
        try {
          game.hideDefaultEnvironment();
          const mapResult = await game.mapLoader.loadMap(url, name);
          
          // Position player at the spawn point inside the map
          if (mapResult.spawnPoint) {
            game.player.position.copy(mapResult.spawnPoint);
            game.player.position.y += 1.8; // Add player height
            console.log(`🎮 Player spawned at: ${game.player.position.x.toFixed(2)}, ${game.player.position.y.toFixed(2)}, ${game.player.position.z.toFixed(2)}`);
          }
          
          // Update lighting for the map environment
          game.updateLightingForMap();
          
          game.updateMapInfo();
          console.log(`✅ Map loaded from URL: ${name}`);
        } catch (error) {
          console.error(`❌ Failed to load map from URL: ${error.message}`);
          game.showDefaultEnvironment();
          game.player.position.set(0, 1, 0);
        }
      }
    }
  };
  
  // Print available debug commands
  console.log(`
🎮 Game Debug Commands Available:

gameDebug.loadMap(path, name)     - Load a specific map
gameDebug.getAvailableMaps()      - Get list of available maps
gameDebug.getCurrentMapInfo()     - Get current map information
gameDebug.clearMap()              - Clear current map
gameDebug.loadMapFromUrl(url, name) - Load map from external URL

Example usage:
gameDebug.loadMap('/maps/dust2.glb', 'dust2')
gameDebug.getAvailableMaps()
gameDebug.getCurrentMapInfo()
  `);
}); 