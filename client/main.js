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
    
    // Initialize the game
    this.init();
  }

  async init() {
    try {
      this.setupScene();
      this.setupLighting();
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

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('gameCanvas'),
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0x4ecdc4, 0.5, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b6b, 0.5, 50);
    pointLight2.position.set(-10, 10, -10);
    this.scene.add(pointLight2);
  }

  setupPlayer() {
    // Create player geometry and material
    const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
    const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x4ecdc4 });
    
    this.player = new THREE.Mesh(playerGeometry, playerMaterial);
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
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
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
        await this.mapLoader.loadMap(firstMap.path, firstMap.name);
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
    }
  }

  createPlatforms() {
    const platformGeometry = new THREE.BoxGeometry(8, 1, 8);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x34495e });

    // Create several platforms
    const platformPositions = [
      { x: 20, y: 2, z: 0 },
      { x: -20, y: 4, z: 20 },
      { x: 0, y: 6, z: -30 },
      { x: 30, y: 3, z: 30 },
      { x: -30, y: 5, z: -20 }
    ];

    platformPositions.forEach(pos => {
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.set(pos.x, pos.y, pos.z);
      platform.castShadow = true;
      platform.receiveShadow = true;
      platform.userData = { isDefaultEnvironment: true };
      this.scene.add(platform);
      this.defaultEnvironment.push(platform);
      this.gameObjects.push(platform);
    });

    // Create walls for boundaries
    const wallGeometry = new THREE.BoxGeometry(4, 10, 4);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x7f8c8d });
    
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 80;
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
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
    const collectibleGeometry = new THREE.SphereGeometry(0.8, 8, 6);
    const collectibleMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xf9ca24,
      emissive: 0xf9ca24,
      emissiveIntensity: 0.2
    });

    // Create collectibles around the map
    for (let i = 0; i < 15; i++) {
      const collectible = new THREE.Mesh(collectibleGeometry, collectibleMaterial);
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
        this.mouseX -= event.movementX * 0.002;
        this.mouseY -= event.movementY * 0.002;
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

    showCollisionMeshes.addEventListener('change', (event) => {
      this.toggleCollisionMeshes(event.target.checked);
    });

    showSpawnPoints.addEventListener('change', (event) => {
      this.toggleSpawnPoints(event.target.checked);
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
        this.updateMapInfo();
        console.log('🏞️ Switched to default environment');
      } else {
        // Hide default environment and load the selected map
        this.hideDefaultEnvironment();
        await this.mapLoader.loadMap(mapPath, mapName);
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
      alert(`Failed to load map: ${mapName}`);
    }
  }

  clearCurrentMap() {
    if (this.mapLoader && this.mapLoader.currentMap) {
      this.mapLoader.clearCurrentMap();
      this.showDefaultEnvironment();
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

    const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
    const playerMaterial = new THREE.MeshLambertMaterial({ color: playerData.color });
    const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
    
    playerMesh.position.set(playerData.position.x, playerData.position.y, playerData.position.z);
    playerMesh.castShadow = true;
    
    this.players[playerData.id] = {
      mesh: playerMesh,
      data: playerData
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

  requestPointerLock() {
    const canvas = document.getElementById('gameCanvas');
    canvas.requestPointerLock();
  }

  focusChat() {
    const chatInput = document.getElementById('chatInput');
    chatInput.focus();
  }

  updateMovement(deltaTime) {
    if (!this.isPointerLocked) return;

    const speed = 20;
    const jumpHeight = 15;
    
    this.direction.set(0, 0, 0);

    if (this.keys['KeyW']) this.direction.z -= 1;
    if (this.keys['KeyS']) this.direction.z += 1;
    if (this.keys['KeyA']) this.direction.x -= 1;
    if (this.keys['KeyD']) this.direction.x += 1;

    this.direction.normalize();
    this.direction.applyQuaternion(this.player.quaternion);

    // Apply movement
    this.velocity.x = this.direction.x * speed;
    this.velocity.z = this.direction.z * speed;

    // Apply gravity
    this.velocity.y -= 9.8 * deltaTime;

    // Jump
    if (this.keys['Space'] && this.canJump) {
      this.velocity.y = jumpHeight;
      this.canJump = false;
    }

    // Update position
    this.player.position.addScaledVector(this.velocity, deltaTime);

    // Ground collision
    if (this.player.position.y <= 1) {
      this.player.position.y = 1;
      this.velocity.y = 0;
      this.canJump = true;
    }

    // Send position to server
    if (this.socket) {
      this.socket.emit('playerUpdate', {
        position: this.player.position,
        rotation: this.player.rotation
      });
    }
  }

  checkCollectibles() {
    this.gameObjects.forEach(object => {
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
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const deltaTime = 0.016; // Assuming 60 FPS
    
    this.updateMovement(deltaTime);
    this.checkCollectibles();
    
    // Animate collectibles
    this.gameObjects.forEach(object => {
      if (object.userData.type === 'collectible') {
        object.rotation.y += 0.02;
        object.position.y += Math.sin(Date.now() * 0.005) * 0.01;
      }
    });
    
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new MultiplayerGame();
  
  // Add global debug commands for testing
  window.gameDebug = {
    // Load a specific map
    loadMap: async (mapPath, mapName) => {
      if (game.mapLoader) {
        try {
          game.hideDefaultEnvironment();
          await game.mapLoader.loadMap(mapPath, mapName);
          game.updateMapInfo();
          console.log(`✅ Map loaded: ${mapName}`);
        } catch (error) {
          console.error(`❌ Failed to load map: ${error.message}`);
          game.showDefaultEnvironment();
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
        game.updateMapInfo();
        console.log('🗑️ Map cleared');
      }
    },
    
    // Load map from URL
    loadMapFromUrl: async (url, name) => {
      if (game.mapLoader) {
        try {
          game.hideDefaultEnvironment();
          await game.mapLoader.loadMap(url, name);
          game.updateMapInfo();
          console.log(`✅ Map loaded from URL: ${name}`);
        } catch (error) {
          console.error(`❌ Failed to load map from URL: ${error.message}`);
          game.showDefaultEnvironment();
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