import * as THREE from 'three';
import { io } from 'socket.io-client';
import { MapLoader } from './MapLoader.js';
import { AssetManager } from './AssetManager.js';

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
    
    // Third-person camera variables
    this.cameraDistance = 8;
    this.cameraHeight = 3;
    this.cameraTarget = new THREE.Vector3();
    this.cameraAngle = { horizontal: 0, vertical: 0 };
    this.cameraMinDistance = 3;
    this.cameraMaxDistance = 15;
    
    // Shooting system
    this.weapon = {
      type: 'rifle',
      damage: 25,
      range: 100,
      fireRate: 600, // rounds per minute
      ammo: 30,
      maxAmmo: 30,
      reloading: false,
      lastFired: 0
    };
    this.projectiles = [];
    this.isAiming = false;
    this.crosshair = null;
    
    // Performance tracking
    this.lastTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.fpsUpdateInterval = 1000;
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
      ground: null,
      bullet: null,
      weapon: null
    };
    
    this.sharedMaterials = {
      player: null,
      collectible: null,
      platform: null,
      wall: null,
      ground: null,
      bullet: null,
      weapon: null
    };
    
    // Object pooling for better performance
    this.objectPool = {
      players: [],
      collectibles: [],
      bullets: []
    };
    
    this.maxPoolSize = 20;
    this.renderDistance = 200;
    this.cullingEnabled = true;
    
    // Asset Management
    this.assetManager = new AssetManager();
    this.currentCharacter = 'soldier';
    this.currentWeapon = 'assault_rifle';
    this.isCharacterMenuOpen = false;
    this.isWeaponMenuOpen = false;
    this.selectedCharacterMesh = null;
    this.selectedWeaponMesh = null;
    
    // Keyboard navigation for menus
    this.characterMenuSelectedIndex = 0;
    this.weaponMenuSelectedIndex = 0;
    this.mapMenuSelectedIndex = 0;
    this.menuKeyboardHandler = null;
    
    // Character scaling based on map size
    this.basePlayerScale = 1.0;
    this.currentPlayerScale = 1.0;
    
    // Initialize the game
    this.init();
  }

  async init() {
    try {
      this.setupScene();
      this.setupLighting();
      this.createSharedResources();
      await this.setupPlayer();
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
    // Create shared geometries
    this.sharedGeometries.player = new THREE.BoxGeometry(1, 2, 1);
    this.sharedGeometries.collectible = new THREE.SphereGeometry(0.5, 16, 16);
    this.sharedGeometries.platform = new THREE.BoxGeometry(4, 1, 4);
    this.sharedGeometries.wall = new THREE.BoxGeometry(1, 3, 1);
    this.sharedGeometries.ground = new THREE.PlaneGeometry(200, 200);
    this.sharedGeometries.bullet = new THREE.SphereGeometry(0.05, 8, 8);
    this.sharedGeometries.weapon = new THREE.BoxGeometry(0.3, 0.15, 1.5);
    
    // Create shared materials
    this.sharedMaterials.player = new THREE.MeshLambertMaterial({ color: 0x4a90e2 });
    this.sharedMaterials.collectible = new THREE.MeshLambertMaterial({ color: 0xf39c12 });
    this.sharedMaterials.platform = new THREE.MeshLambertMaterial({ color: 0x95a5a6 });
    this.sharedMaterials.wall = new THREE.MeshLambertMaterial({ color: 0x7f8c8d });
    this.sharedMaterials.ground = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
    this.sharedMaterials.bullet = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    this.sharedMaterials.weapon = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
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

  async setupPlayer() {
    // Use placeholder character directly - no 3D model loading
    console.log('🎮 Creating placeholder player character with 3D weapon');
    
    // Get character color based on current selection
    const characterColors = {
      soldier: 0x2e7d32,  // Green
      sniper: 0x1565c0,   // Blue
      assault: 0x8e24aa,  // Purple
      medic: 0xe53935     // Red
    };
    
    const playerColor = characterColors[this.currentCharacter] || 0x4a90e2;
    const playerMaterial = new THREE.MeshLambertMaterial({ color: playerColor });
    
    // Create player using shared geometry
    this.player = new THREE.Mesh(this.sharedGeometries.player, playerMaterial);
    this.player.position.set(0, 1, 0);
    this.player.castShadow = true;
    this.player.receiveShadow = true;
    this.scene.add(this.player);
    
    // Apply initial character scale (will be updated when map loads)
    this.updateCharacterScale();
    
    // Load weapon model and attach to player
    try {
      this.playerWeapon = await this.assetManager.loadWeapon(this.currentWeapon);
      this.playerWeapon.position.set(0.5, 0.3, 0.5);
      this.playerWeapon.rotation.y = Math.PI / 4;
      this.playerWeapon.castShadow = true;
      this.player.add(this.playerWeapon);
    } catch (error) {
      console.error('Error loading weapon:', error);
      // Fallback to placeholder weapon
      const weaponMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
      this.playerWeapon = new THREE.Mesh(this.sharedGeometries.weapon, weaponMaterial);
      this.playerWeapon.position.set(0.5, 0.3, 0.5);
      this.playerWeapon.rotation.y = Math.PI / 4;
      this.playerWeapon.castShadow = true;
      this.player.add(this.playerWeapon);
    }

    // Set up third-person camera
    this.camera.position.set(0, 5, 10);
    this.cameraTarget.copy(this.player.position);
    this.cameraTarget.y += 2;
    this.camera.lookAt(this.cameraTarget);
    
    // Initialize camera angles based on current position
    const direction = new THREE.Vector3().subVectors(this.camera.position, this.player.position).normalize();
    this.cameraAngle.horizontal = Math.atan2(direction.x, direction.z);
    this.cameraAngle.vertical = Math.asin(direction.y);
    
    console.log(`✅ Player setup complete with placeholder ${this.currentCharacter} and 3D weapon ${this.currentWeapon}`);
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
        
        // For de_dust2 and other maps, use safe spawn position
        if (firstMap.name.includes('dust2') || firstMap.name.includes('de_dust2')) {
          const safeSpawn = this.mapLoader.getSafeSpawnPosition();
          this.player.position.copy(safeSpawn);
          console.log(`🛡️ Using safe spawn for ${firstMap.name} at: ${this.player.position.x.toFixed(2)}, ${this.player.position.y.toFixed(2)}, ${this.player.position.z.toFixed(2)}`);
        }
        
        // Update lighting for the map environment
        this.updateLightingForMap();
        
        // Update character scale for the map
        this.updateCharacterScale();
        
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
      
      if (event.code === 'Comma') {
        event.preventDefault();
        this.focusChat();
      }
      
      // Reload weapon
      if (event.code === 'KeyR') {
        this.reloadWeapon();
      }
      
      // Menu controls
      if (event.code === 'KeyC') {
        this.toggleCharacterMenu();
      }
      
      if (event.code === 'KeyV') {
        this.toggleWeaponMenu();
      }
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.code] = false;
    });

    // Mouse controls for third-person camera
    document.addEventListener('click', (event) => {
      if (!this.isPointerLocked) {
        this.requestPointerLock();
      } else {
        // Left click to shoot
        if (event.button === 0) {
          this.shoot();
        }
      }
    });

    document.addEventListener('mousedown', (event) => {
      if (this.isPointerLocked) {
        if (event.button === 0) { // Left click
          this.shoot();
        } else if (event.button === 2) { // Right click
          this.isAiming = true;
        }
      }
    });

    document.addEventListener('mouseup', (event) => {
      if (this.isPointerLocked) {
        if (event.button === 2) { // Right click
          this.isAiming = false;
        }
      }
    });

    // Prevent right-click context menu
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === document.getElementById('gameCanvas');
    });

    document.addEventListener('mousemove', (event) => {
      if (this.isPointerLocked) {
        // Update camera angles for third-person view
        this.cameraAngle.horizontal -= event.movementX * this.mouseSensitivity;
        this.cameraAngle.vertical -= event.movementY * this.mouseSensitivity;
        
        // Clamp vertical angle
        this.cameraAngle.vertical = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.cameraAngle.vertical));
        
        this.updateThirdPersonCamera();
      }
    });

    // Mouse wheel for camera distance
    document.addEventListener('wheel', (event) => {
      if (this.isPointerLocked) {
        event.preventDefault();
        this.cameraDistance += event.deltaY * 0.01;
        this.cameraDistance = Math.max(this.cameraMinDistance, Math.min(this.cameraMaxDistance, this.cameraDistance));
        this.updateThirdPersonCamera();
      }
    });

    // Escape key to release pointer lock
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Escape') {
        document.exitPointerLock();
      }
    });
  }

  updateThirdPersonCamera() {
    // Calculate camera position based on angles and distance
    const horizontalDistance = this.cameraDistance * Math.cos(this.cameraAngle.vertical);
    const verticalDistance = this.cameraDistance * Math.sin(this.cameraAngle.vertical);
    
    // Position camera behind and above player
    this.cameraTarget.copy(this.player.position);
    this.cameraTarget.y += 2; // Camera looks at player's upper body
    
    this.camera.position.x = this.player.position.x + horizontalDistance * Math.sin(this.cameraAngle.horizontal);
    this.camera.position.z = this.player.position.z + horizontalDistance * Math.cos(this.cameraAngle.horizontal);
    this.camera.position.y = this.player.position.y + this.cameraHeight + verticalDistance;
    
    this.camera.lookAt(this.cameraTarget);
  }

  shoot() {
    if (this.weapon.reloading) return;
    if (this.weapon.ammo <= 0) {
      this.reloadWeapon();
      return;
    }
    
    const currentTime = Date.now();
    const fireDelay = 60000 / this.weapon.fireRate; // Convert RPM to milliseconds
    
    if (currentTime - this.weapon.lastFired < fireDelay) return;
    
    this.weapon.lastFired = currentTime;
    this.weapon.ammo--;
    
    // Create bullet
    const bullet = this.createBullet();
    this.projectiles.push(bullet);
    
    // Update UI
    this.updateWeaponUI();
    
    // Send shooting event to server
    if (this.socket) {
      this.socket.emit('playerShoot', {
        position: this.player.position,
        direction: this.getShootDirection(),
        weapon: this.weapon.type
      });
    }
    
    // Weapon recoil effect
    this.applyRecoil();
  }

  createBullet() {
    const bullet = new THREE.Mesh(this.sharedGeometries.bullet, this.sharedMaterials.bullet);
    
    // Position bullet at weapon muzzle
    const muzzlePosition = new THREE.Vector3();
    this.playerWeapon.getWorldPosition(muzzlePosition);
    bullet.position.copy(muzzlePosition);
    
    // Set bullet direction
    bullet.userData.direction = this.getShootDirection();
    bullet.userData.speed = 100;
    bullet.userData.damage = this.weapon.damage;
    bullet.userData.range = this.weapon.range;
    bullet.userData.distanceTraveled = 0;
    bullet.userData.shooter = this.playerId;
    
    this.scene.add(bullet);
    return bullet;
  }

  getShootDirection() {
    // Calculate shoot direction based on camera look direction
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return direction.normalize();
  }

  applyRecoil() {
    // Simple recoil effect - move camera slightly
    this.cameraAngle.vertical += (Math.random() - 0.5) * 0.02;
    this.cameraAngle.horizontal += (Math.random() - 0.5) * 0.01;
    this.updateThirdPersonCamera();
  }

  reloadWeapon() {
    if (this.weapon.reloading || this.weapon.ammo === this.weapon.maxAmmo) return;
    
    this.weapon.reloading = true;
    this.updateWeaponUI();
    
    setTimeout(() => {
      this.weapon.ammo = this.weapon.maxAmmo;
      this.weapon.reloading = false;
      this.updateWeaponUI();
    }, 2000); // 2 second reload time
  }

  updateWeaponUI() {
    const ammoElement = document.getElementById('ammo');
    if (ammoElement) {
      if (this.weapon.reloading) {
        ammoElement.textContent = 'Reloading...';
        ammoElement.style.color = '#f39c12';
      } else {
        ammoElement.textContent = `${this.weapon.ammo}/${this.weapon.maxAmmo}`;
        ammoElement.style.color = this.weapon.ammo === 0 ? '#e74c3c' : '#fff';
      }
    }
  }

  updateBullets(deltaTime) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const bullet = this.projectiles[i];
      
      // Move bullet
      const movement = bullet.userData.direction.clone().multiplyScalar(bullet.userData.speed * deltaTime);
      bullet.position.add(movement);
      bullet.userData.distanceTraveled += bullet.userData.speed * deltaTime;
      
      // Check if bullet exceeded range
      if (bullet.userData.distanceTraveled >= bullet.userData.range) {
        this.scene.remove(bullet);
        this.projectiles.splice(i, 1);
        continue;
      }
      
      // Check collision with map
      if (this.mapLoader && this.mapLoader.currentMap) {
        const collisions = this.mapLoader.checkCollisionWithMap(bullet.position, 0.1);
        if (collisions.length > 0) {
          // Bullet hit something
          this.createBulletImpact(bullet.position);
          this.scene.remove(bullet);
          this.projectiles.splice(i, 1);
          continue;
        }
      }
      
      // Check collision with other players
      for (const playerId in this.players) {
        if (playerId === bullet.userData.shooter) continue;
        
        const otherPlayer = this.players[playerId];
        const distance = bullet.position.distanceTo(otherPlayer.mesh.position);
        
        if (distance < 1.5) { // Hit detection radius
          // Player hit
          this.handlePlayerHit(playerId, bullet.userData.damage);
          this.scene.remove(bullet);
          this.projectiles.splice(i, 1);
          break;
        }
      }
      
      // Check collision with ground (fallback)
      if (bullet.position.y <= 0) {
        this.createBulletImpact(bullet.position);
        this.scene.remove(bullet);
        this.projectiles.splice(i, 1);
      }
    }
  }

  createBulletImpact(position) {
    // Create a simple spark effect
    const sparkGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const sparkMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
    
    spark.position.copy(position);
    this.scene.add(spark);
    
    // Remove spark after a short time
    setTimeout(() => {
      this.scene.remove(spark);
    }, 100);
  }

  handlePlayerHit(playerId, damage) {
    console.log(`Player ${playerId} hit for ${damage} damage`);
    
    // Send hit event to server
    if (this.socket) {
      this.socket.emit('playerHit', {
        targetId: playerId,
        damage: damage,
        shooter: this.playerId
      });
    }
  }

  handlePlayerShoot(data) {
    // Create visual bullet for other players' shots
    const otherPlayer = this.players[data.id];
    if (otherPlayer) {
      const bullet = new THREE.Mesh(this.sharedGeometries.bullet, this.sharedMaterials.bullet);
      bullet.position.copy(data.position);
      bullet.userData.direction = new THREE.Vector3(data.direction.x, data.direction.y, data.direction.z);
      bullet.userData.speed = 100;
      bullet.userData.range = 50; // Shorter range for visual bullets
      bullet.userData.distanceTraveled = 0;
      bullet.userData.visual = true; // Mark as visual only
      
      this.scene.add(bullet);
      this.projectiles.push(bullet);
    }
  }

  handlePlayerHitEvent(data) {
    if (data.targetId === this.playerId) {
      // We were hit
      this.health = data.newHealth;
      this.updateHealthUI();
      
      // Flash red effect
      this.showDamageEffect();
      
      console.log(`You took ${data.damage} damage! Health: ${this.health}`);
    } else {
      // Someone else was hit
      const targetPlayer = this.players[data.targetId];
      if (targetPlayer) {
        targetPlayer.health = data.newHealth;
        // Show damage indicator on target
        this.showDamageIndicator(targetPlayer.mesh.position);
      }
    }
  }

  handlePlayerDeath(data) {
    if (data.victim === this.playerId) {
      // We died
      this.health = 0;
      this.updateHealthUI();
      this.showDeathScreen();
      console.log(`You were killed by player ${data.killer}`);
    } else {
      // Someone else died
      const victimPlayer = this.players[data.victim];
      if (victimPlayer) {
        victimPlayer.health = 0;
        // Hide player mesh temporarily
        victimPlayer.mesh.visible = false;
      }
      
      if (data.killer === this.playerId) {
        // We got a kill
        this.score += 100;
        this.updateScoreUI();
        console.log(`You killed player ${data.victim}! +100 points`);
      }
    }
  }

  handlePlayerRespawn(data) {
    if (data.id === this.playerId) {
      // We respawned
      this.health = data.health;
      this.player.position.set(data.position.x, data.position.y, data.position.z);
      this.updateHealthUI();
      this.hideDeathScreen();
      console.log('You respawned!');
    } else {
      // Someone else respawned
      const respawnedPlayer = this.players[data.id];
      if (respawnedPlayer) {
        respawnedPlayer.health = data.health;
        respawnedPlayer.mesh.position.set(data.position.x, data.position.y, data.position.z);
        respawnedPlayer.mesh.visible = true;
      }
    }
  }

  showDamageEffect() {
    // Create a red overlay effect
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '999';
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 200);
  }

  showDamageIndicator(position) {
    // Create a damage indicator at the hit position
    const indicator = document.createElement('div');
    indicator.textContent = '-25';
    indicator.style.position = 'absolute';
    indicator.style.color = '#ff0000';
    indicator.style.fontSize = '24px';
    indicator.style.fontWeight = 'bold';
    indicator.style.pointerEvents = 'none';
    indicator.style.zIndex = '1000';
    
    // Convert 3D position to screen coordinates
    const screenPosition = position.clone();
    screenPosition.project(this.camera);
    
    const x = (screenPosition.x + 1) / 2 * window.innerWidth;
    const y = -(screenPosition.y - 1) / 2 * window.innerHeight;
    
    indicator.style.left = x + 'px';
    indicator.style.top = y + 'px';
    
    document.body.appendChild(indicator);
    
    // Animate and remove
    let opacity = 1;
    const fadeOut = setInterval(() => {
      opacity -= 0.05;
      indicator.style.opacity = opacity;
      if (opacity <= 0) {
        clearInterval(fadeOut);
        document.body.removeChild(indicator);
      }
    }, 50);
  }

  showDeathScreen() {
    const deathScreen = document.createElement('div');
    deathScreen.id = 'deathScreen';
    deathScreen.style.position = 'fixed';
    deathScreen.style.top = '0';
    deathScreen.style.left = '0';
    deathScreen.style.width = '100%';
    deathScreen.style.height = '100%';
    deathScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    deathScreen.style.display = 'flex';
    deathScreen.style.alignItems = 'center';
    deathScreen.style.justifyContent = 'center';
    deathScreen.style.color = '#fff';
    deathScreen.style.fontSize = '48px';
    deathScreen.style.fontWeight = 'bold';
    deathScreen.style.zIndex = '1001';
    deathScreen.textContent = 'You Died!';
    
    document.body.appendChild(deathScreen);
  }

  hideDeathScreen() {
    const deathScreen = document.getElementById('deathScreen');
    if (deathScreen) {
      document.body.removeChild(deathScreen);
    }
  }

  updateHealthUI() {
    const healthElement = document.getElementById('health');
    if (healthElement) {
      healthElement.textContent = `Health: ${this.health}`;
      healthElement.style.color = this.health > 50 ? '#2ecc71' : this.health > 25 ? '#f39c12' : '#e74c3c';
    }
  }

  updateScoreUI() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.score}`;
    }
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

    // Initialize weapon UI
    this.updateWeaponUI();
    this.updateHealthUI();
    this.updateScoreUI();

    // Create asset menus
    this.createCharacterMenu();
    this.createWeaponMenu();
    this.updateCharacterUI();
    this.updateWeaponInfoUI();

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
    
    // Setup keyboard navigation for map settings
    this.setupMapSettingsKeyboardNavigation();
    this.updateMapSelection();
  }

  closeSettings() {
    this.isSettingsOpen = false;
    document.getElementById('settingsPanel').classList.add('hidden');
    
    // Remove keyboard navigation
    this.removeMenuKeyboardNavigation();
  }

  async loadAvailableMapsToUI() {
    const mapListElement = document.getElementById('mapList');
    mapListElement.innerHTML = '<div class="loading">Loading maps...</div>';

    try {
      this.availableMaps = await this.mapLoader.loadAvailableMaps();
      
      // Filter out only the default environment from the main list (it's added separately)
      const validMaps = this.availableMaps.filter(map => !map.isDefault);
      
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
            <div class="map-size">${map.description || 'Available'}</div>
          </div>
        </div>
      `).join('');

      mapListElement.innerHTML = defaultMapHTML + mapListHTML;

      // Add click handlers for map items
      const mapItems = mapListElement.querySelectorAll('.map-item');
      mapItems.forEach((item, index) => {
        item.addEventListener('click', () => {
          const mapName = item.dataset.map;
          const mapPath = item.dataset.path || mapName;
          this.switchMap(mapName, mapPath);
        });
        
        // Add mouse hover support for keyboard navigation
        item.addEventListener('mouseenter', () => {
          this.mapMenuSelectedIndex = index;
          this.updateMapSelection();
        });
      });

      // Update available maps count
      console.log(`📂 Loaded ${this.availableMaps.length} total maps in UI (${validMaps.length} custom maps + default)`);

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
        // Reset character scale to default
        this.updateCharacterScale();
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
        
        // Update character scale for the map
        this.updateCharacterScale();
        
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

      this.socket.on('playerShoot', (data) => {
        this.handlePlayerShoot(data);
      });

      this.socket.on('playerHit', (data) => {
        this.handlePlayerHitEvent(data);
      });

      this.socket.on('playerDeath', (data) => {
        this.handlePlayerDeath(data);
      });

      this.socket.on('playerRespawn', (data) => {
        this.handlePlayerRespawn(data);
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

  // Calculate appropriate character scale based on map scale factor
  calculateCharacterScale() {
    // Get the current map scale factor
    const mapScaleFactor = this.mapLoader?.mapScaleFactor || 1.0;
    
    // For default environment, use normal scale
    if (!this.mapLoader?.currentMap) {
      return 1.0;
    }
    
    // Character scale should be proportional to map scale
    // Small maps need smaller characters to fit properly
    const characterScale = mapScaleFactor * 8; // Base multiplier for good proportion
    
    // Ensure reasonable bounds
    return Math.max(Math.min(characterScale, 1.5), 0.3);
  }

  // Update character scale based on current map
  updateCharacterScale() {
    if (!this.player) return;
    
    const newScale = this.calculateCharacterScale();
    this.currentPlayerScale = newScale;
    this.player.scale.setScalar(newScale);
    
    console.log(`🎮 Updated character scale to ${newScale.toFixed(2)} for map: ${this.mapLoader?.mapName || 'Default'}`);
  }

  updateMovement(deltaTime) {
    if (!this.isPointerLocked) return;

    this.direction.set(0, 0, 0);

    // Check for key presses and build movement direction
    if (this.keys['KeyW'] || this.keys['ArrowUp']) this.direction.z -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) this.direction.z += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.direction.x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) this.direction.x += 1;

    // Normalize movement direction
    if (this.direction.length() > 0) {
      this.direction.normalize();
      
      // For third-person, apply camera rotation to movement direction
      const cameraRotation = new THREE.Quaternion();
      cameraRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraAngle.horizontal);
      this.direction.applyQuaternion(cameraRotation);
      
      // Rotate player to face movement direction
      const targetRotation = Math.atan2(this.direction.x, this.direction.z);
      this.player.rotation.y = targetRotation;
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
      
      // Ground detection for jumping - improved for de_dust2 and other maps
      const groundHeight = this.mapLoader.getGroundHeight(this.player.position);
      const playerGroundLevel = groundHeight + 1.8; // Player height
      
      // Add some tolerance for ground detection
      if (groundHeight > -1000) { // Valid ground height detected
        if (this.player.position.y <= playerGroundLevel + 0.2) {
          this.player.position.y = playerGroundLevel;
          this.velocity.y = 0;
          this.canJump = true;
        } else {
          // Apply gravity
          this.velocity.y -= this.gravity * deltaTime;
          this.canJump = false;
        }
      } else {
        // No ground detected - emergency fallback
        console.log(`⚠️ No ground detected, falling back to emergency ground level`);
        if (this.player.position.y <= 1) {
          this.player.position.y = 1;
          this.velocity.y = 0;
          this.canJump = true;
        } else {
          this.velocity.y -= this.gravity * deltaTime;
        }
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
    
    // Update third-person camera to follow player
    this.updateThirdPersonCamera();

    // Check if player is falling through the map (emergency check)
    if (this.mapLoader && this.mapLoader.currentMap && this.player.position.y < -50) {
      console.log('🚨 Player fell through map! Resetting to safe position...');
      const safeSpawn = this.mapLoader.getSafeSpawnPosition();
      this.player.position.copy(safeSpawn);
      this.velocity.set(0, 0, 0);
    }

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
    
    // Update asset manager animations
    this.assetManager.updateAnimations(clampedDeltaTime);
    
    this.updateMovement(clampedDeltaTime);
    
    // Update bullet physics
    this.updateBullets(clampedDeltaTime);
    
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

  // Asset Menu Methods
  toggleCharacterMenu() {
    this.isCharacterMenuOpen = !this.isCharacterMenuOpen;
    const menu = document.getElementById('characterMenu');
    if (menu) {
      menu.style.display = this.isCharacterMenuOpen ? 'block' : 'none';
      
      if (this.isCharacterMenuOpen) {
        this.setupMenuKeyboardNavigation('character');
        this.updateMenuSelection('character');
      } else {
        this.removeMenuKeyboardNavigation();
      }
    }
  }

  toggleWeaponMenu() {
    this.isWeaponMenuOpen = !this.isWeaponMenuOpen;
    const menu = document.getElementById('weaponMenu');
    if (menu) {
      menu.style.display = this.isWeaponMenuOpen ? 'block' : 'none';
      
      if (this.isWeaponMenuOpen) {
        this.setupMenuKeyboardNavigation('weapon');
        this.updateMenuSelection('weapon');
      } else {
        this.removeMenuKeyboardNavigation();
      }
    }
  }

  // Keyboard Navigation Helper Functions
  setupMenuKeyboardNavigation(menuType) {
    this.removeMenuKeyboardNavigation();
    
    this.menuKeyboardHandler = (event) => {
      const isCharacterMenu = menuType === 'character';
      const menuItems = document.querySelectorAll(`#${menuType}Menu .menu-item`);
      const currentIndex = isCharacterMenu ? this.characterMenuSelectedIndex : this.weaponMenuSelectedIndex;
      
      switch(event.code) {
        case 'ArrowUp':
          event.preventDefault();
          if (isCharacterMenu) {
            this.characterMenuSelectedIndex = Math.max(0, currentIndex - 1);
          } else {
            this.weaponMenuSelectedIndex = Math.max(0, currentIndex - 1);
          }
          this.updateMenuSelection(menuType);
          break;
          
        case 'ArrowDown':
          event.preventDefault();
          if (isCharacterMenu) {
            this.characterMenuSelectedIndex = Math.min(menuItems.length - 1, currentIndex + 1);
          } else {
            this.weaponMenuSelectedIndex = Math.min(menuItems.length - 1, currentIndex + 1);
          }
          this.updateMenuSelection(menuType);
          break;
          
        case 'Enter':
          event.preventDefault();
          this.selectMenuItemByIndex(menuType, currentIndex);
          break;
          
        case 'Escape':
          event.preventDefault();
          if (isCharacterMenu) {
            this.toggleCharacterMenu();
          } else {
            this.toggleWeaponMenu();
          }
          break;
      }
    };
    
    document.addEventListener('keydown', this.menuKeyboardHandler);
  }
  
  removeMenuKeyboardNavigation() {
    if (this.menuKeyboardHandler) {
      document.removeEventListener('keydown', this.menuKeyboardHandler);
      this.menuKeyboardHandler = null;
    }
  }
  
  updateMenuSelection(menuType) {
    const menuItems = document.querySelectorAll(`#${menuType}Menu .menu-item`);
    const selectedIndex = menuType === 'character' ? this.characterMenuSelectedIndex : this.weaponMenuSelectedIndex;
    
    menuItems.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }
  
  selectMenuItemByIndex(menuType, index) {
    const menuItems = document.querySelectorAll(`#${menuType}Menu .menu-item`);
    if (menuItems[index]) {
      menuItems[index].click();
    }
  }

  // Map Settings Keyboard Navigation
  setupMapSettingsKeyboardNavigation() {
    this.removeMenuKeyboardNavigation();
    
    this.menuKeyboardHandler = (event) => {
      if (!this.isSettingsOpen) return;
      
      const mapItems = document.querySelectorAll('#mapList .map-item');
      
      switch(event.code) {
        case 'ArrowUp':
          event.preventDefault();
          this.mapMenuSelectedIndex = Math.max(0, this.mapMenuSelectedIndex - 1);
          this.updateMapSelection();
          break;
          
        case 'ArrowDown':
          event.preventDefault();
          this.mapMenuSelectedIndex = Math.min(mapItems.length - 1, this.mapMenuSelectedIndex + 1);
          this.updateMapSelection();
          break;
          
        case 'Enter':
          event.preventDefault();
          if (mapItems[this.mapMenuSelectedIndex]) {
            mapItems[this.mapMenuSelectedIndex].click();
          }
          break;
          
        case 'Escape':
          event.preventDefault();
          this.closeSettings();
          break;
      }
    };
    
    document.addEventListener('keydown', this.menuKeyboardHandler);
  }

  updateMapSelection() {
    const mapItems = document.querySelectorAll('#mapList .map-item');
    
    mapItems.forEach((item, index) => {
      if (index === this.mapMenuSelectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  async selectCharacter(characterId) {
    console.log(`🎮 Selecting character: ${characterId}`);
    
    // Remove current player from scene
    if (this.player) {
      this.scene.remove(this.player);
    }
    
    // Update current character
    this.currentCharacter = characterId;
    
    // Create new placeholder character
    const characterColors = {
      soldier: 0x2e7d32,  // Green
      sniper: 0x1565c0,   // Blue
      assault: 0x8e24aa,  // Purple
      medic: 0xe53935     // Red
    };
    
    const playerColor = characterColors[characterId] || 0x4a90e2;
    const playerMaterial = new THREE.MeshLambertMaterial({ color: playerColor });
    
    this.player = new THREE.Mesh(this.sharedGeometries.player, playerMaterial);
    this.player.position.set(0, 1, 0);
    this.player.castShadow = true;
    this.player.receiveShadow = true;
    this.scene.add(this.player);
    
    // Update weapon attachment
    if (this.playerWeapon) {
      this.player.add(this.playerWeapon);
      this.playerWeapon.position.set(0.5, 0.3, 0.5);
      this.playerWeapon.rotation.y = Math.PI / 4;
    }
    
    // Apply current map scale to the new character
    this.updateCharacterScale();
    
    // Update UI
    this.updateCharacterUI();
    
    // Close menu
    this.toggleCharacterMenu();
    
    console.log(`✅ Character changed to placeholder ${characterId} with 3D weapon`);
  }

  async selectWeapon(weaponId) {
    console.log(`🔫 Selecting weapon: ${weaponId}`);
    
    // Remove current weapon from player
    if (this.playerWeapon) {
      this.player.remove(this.playerWeapon);
    }
    
    // Update current weapon
    this.currentWeapon = weaponId;
    
    // Load new 3D weapon model
    try {
      this.playerWeapon = await this.assetManager.loadWeapon(weaponId);
      this.playerWeapon.position.set(0.5, 0.3, 0.5);
      this.playerWeapon.rotation.y = Math.PI / 4;
      this.playerWeapon.castShadow = true;
    } catch (error) {
      console.error('Error loading weapon:', error);
      // Fallback to placeholder weapon
      const weaponMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
      this.playerWeapon = new THREE.Mesh(this.sharedGeometries.weapon, weaponMaterial);
      this.playerWeapon.position.set(0.5, 0.3, 0.5);
      this.playerWeapon.rotation.y = Math.PI / 4;
      this.playerWeapon.castShadow = true;
    }
    
    // Attach to player
    if (this.player) {
      this.player.add(this.playerWeapon);
    }
    
    // Update weapon stats
    const weaponStats = this.assetManager.assets.weapons[weaponId].stats;
    this.weapon.maxAmmo = weaponStats.ammo;
    this.weapon.damage = weaponStats.damage;
    this.weapon.fireRate = weaponStats.fireRate;
    
    // Update UI
    this.updateWeaponUI();
    
    // Close menu
    this.toggleWeaponMenu();
    
    console.log(`✅ Weapon changed to 3D model ${weaponId}`);
  }

  updateCharacterUI() {
    const characterInfo = document.getElementById('characterInfo');
    if (characterInfo) {
      const character = this.assetManager.assets.characters[this.currentCharacter];
      characterInfo.innerHTML = `
        <strong>${character.name}</strong><br>
        Health: ${character.stats.health}<br>
        Speed: ${character.stats.speed}<br>
        Damage: ${character.stats.damage}
      `;
    }
  }

  updateWeaponInfoUI() {
    const weaponInfo = document.getElementById('weaponInfo');
    if (weaponInfo) {
      const weapon = this.assetManager.assets.weapons[this.currentWeapon];
      weaponInfo.innerHTML = `
        <strong>${weapon.name}</strong><br>
        Damage: ${weapon.stats.damage}<br>
        Fire Rate: ${weapon.stats.fireRate}<br>
        Ammo: ${weapon.stats.ammo}<br>
        Range: ${weapon.stats.range}
      `;
    }
  }

  createCharacterMenu() {
    const characters = this.assetManager.getCharacterList();
    const characterMenu = document.getElementById('characterMenu');
    
    characters.forEach((character, index) => {
      const button = document.createElement('button');
      button.className = 'menu-item';
      button.innerHTML = `
        <div class="character-preview" style="background-color: #${character.color.toString(16).padStart(6, '0')}"></div>
        <div class="character-info">
          <strong>${character.name}</strong>
          <div class="character-stats">
            <span>Health: ${character.stats.health}</span>
            <span>Speed: ${character.stats.speed}</span>
            <span>Damage: ${character.stats.damage}</span>
          </div>
        </div>
      `;
      
      button.addEventListener('click', () => {
        this.characterMenuSelectedIndex = index;
        this.selectCharacter(character.id);
      });
      
      button.addEventListener('mouseenter', () => {
        this.characterMenuSelectedIndex = index;
        this.updateMenuSelection('character');
      });
      
      characterMenu.appendChild(button);
    });
  }

  createWeaponMenu() {
    const weapons = this.assetManager.getWeaponList();
    const weaponMenu = document.getElementById('weaponMenu');
    
    weapons.forEach((weapon, index) => {
      const button = document.createElement('button');
      button.className = 'menu-item';
      button.innerHTML = `
        <div class="weapon-preview" style="background-color: #${weapon.color.toString(16).padStart(6, '0')}"></div>
        <div class="weapon-info">
          <strong>${weapon.name}</strong>
          <div class="weapon-stats">
            <span>Damage: ${weapon.stats.damage}</span>
            <span>Rate: ${weapon.stats.fireRate}</span>
            <span>Ammo: ${weapon.stats.ammo}</span>
            <span>Range: ${weapon.stats.range}</span>
          </div>
        </div>
      `;
      
      button.addEventListener('click', () => {
        this.weaponMenuSelectedIndex = index;
        this.selectWeapon(weapon.id);
      });
      
      button.addEventListener('mouseenter', () => {
        this.weaponMenuSelectedIndex = index;
        this.updateMenuSelection('weapon');
      });
      
      weaponMenu.appendChild(button);
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
          
          // Update character scale for the map
          game.updateCharacterScale();
          
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
        // Reset character scale to default
        game.updateCharacterScale();
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
          
          // Update character scale for the map
          game.updateCharacterScale();
          
          game.updateMapInfo();
          console.log(`✅ Map loaded from URL: ${name}`);
        } catch (error) {
          console.error(`❌ Failed to load map from URL: ${error.message}`);
          game.showDefaultEnvironment();
          game.player.position.set(0, 1, 0);
        }
      }
    },
    
    // Debug collision detection
    debugGround: () => {
      if (game.mapLoader) {
        return game.mapLoader.debugGroundDetection(game.player.position);
      }
      return null;
    },
    
    // Get ground height at current position
    getGroundHeight: () => {
      if (game.mapLoader) {
        const height = game.mapLoader.getGroundHeight(game.player.position);
        console.log(`Ground height at player position: ${height.toFixed(2)}`);
        return height;
      }
      return 0;
    },
    
    // Teleport to safe position
    teleportToSafePosition: () => {
      if (game.mapLoader) {
        const safeSpawn = game.mapLoader.getSafeSpawnPosition();
        game.player.position.copy(safeSpawn);
        console.log(`🛡️ Teleported to safe position: ${safeSpawn.x.toFixed(2)}, ${safeSpawn.y.toFixed(2)}, ${safeSpawn.z.toFixed(2)}`);
      }
    },
    
    // Get current player position
    getPlayerPosition: () => {
      const pos = game.player.position;
      console.log(`Player position: ${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}`);
      return pos;
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

🔍 Collision Debug Commands:
gameDebug.debugGround()           - Debug ground detection at current position
gameDebug.getGroundHeight()       - Get ground height at current position
gameDebug.teleportToSafePosition() - Teleport to safe spawn position
gameDebug.getPlayerPosition()     - Get current player position

Example usage:
gameDebug.loadMap('/maps/dust2.glb', 'dust2')
gameDebug.getAvailableMaps()
gameDebug.getCurrentMapInfo()
gameDebug.debugGround()
gameDebug.teleportToSafePosition()
  `);
}); 