import * as THREE from 'three';
import { io } from 'socket.io-client';
import { Player } from './Player.js';
import { Environment } from './Environment.js';
import { NetworkManager } from './NetworkManager.js';

export class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.players = new Map();
        this.localPlayer = null;
        this.environment = null;
        this.networkManager = null;
        
        this.clock = new THREE.Clock();
        this.isRunning = false;
        
        // Game state
        this.gameState = {
            score: 0,
            playerCount: 0,
            gameTime: 0
        };
        
        // UI elements
        this.ui = {
            loading: document.getElementById('loading'),
            score: document.getElementById('score'),
            playerCount: document.getElementById('playerCount'),
            connectionStatus: document.getElementById('connectionStatus')
        };
    }

    async init() {
        try {
            console.log('🎮 Starting game initialization...');
            
            console.log('🖥️ Setting up renderer...');
            this.setupRenderer();
            
            console.log('🌍 Setting up scene...');
            this.setupScene();
            
            console.log('📷 Setting up camera...');
            this.setupCamera();
            
            console.log('💡 Setting up lighting...');
            this.setupLighting();
            
            console.log('🏞️ Creating environment...');
            this.environment = new Environment(this.scene);
            
            console.log('🌐 Setting up network manager...');
            this.networkManager = new NetworkManager(this);
            
            console.log('🎛️ Setting up event listeners...');
            this.setupEventListeners();
            
            console.log('🔗 Connecting to server...');
            await this.networkManager.connect();
            
            // Create local player if not already created by server
            if (!this.localPlayer) {
                console.log('🚀 Creating local player...');
                this.spawnPlayer('local-player', { x: 0, y: 1, z: 0 }, true);
            }
            
            console.log('🎮 Starting game loop...');
            this.start();
            
            console.log('👁️ Hiding loading screen...');
            this.ui.loading.style.display = 'none';
            
            console.log('✅ Game initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            // Hide loading screen even on error
            this.ui.loading.style.display = 'none';
            
            // Show error message
            document.body.innerHTML = `
                <div style="color: white; text-align: center; padding: 50px; font-family: Arial;">
                    <h2>Game Loading Error</h2>
                    <p>Error: ${error.message}</p>
                    <p>Check the browser console for more details.</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px; margin-top: 20px;">
                        Reload Game
                    </button>
                </div>
            `;
        }
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            canvas: document.getElementById('gameCanvas')
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Append canvas to container
        const container = document.getElementById('gameContainer');
        container.appendChild(this.renderer.domElement);
        this.renderer.domElement.id = 'gameCanvas';
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Add fog for depth
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    setupEventListeners() {
        // Pointer lock for first-person controls
        document.addEventListener('click', () => {
            if (this.localPlayer) {
                this.localPlayer.requestPointerLock();
            }
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    spawnPlayer(playerId, position, isLocal = false) {
        const player = new Player(this.scene, this.camera, isLocal);
        player.setPosition(position);
        this.players.set(playerId, player);
        
        if (isLocal) {
            this.localPlayer = player;
            console.log('🚀 Local player spawned');
        }
        
        return player;
    }

    removePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            player.destroy();
            this.players.delete(playerId);
            console.log('👋 Player removed:', playerId);
        }
    }

    updateGameState(newState) {
        this.gameState = { ...this.gameState, ...newState };
        this.updateUI();
    }

    updateUI() {
        this.ui.score.textContent = `Score: ${this.gameState.score}`;
        this.ui.playerCount.textContent = `Players: ${this.gameState.playerCount}`;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop();
            console.log('▶️ Game started');
        }
    }

    pause() {
        this.isRunning = false;
        console.log('⏸️ Game paused');
    }

    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop();
            console.log('▶️ Game resumed');
        }
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        const deltaTime = this.clock.getDelta();
        
        // Update game objects
        this.players.forEach(player => {
            player.update(deltaTime);
        });
        
        // Update environment
        if (this.environment) {
            this.environment.update(deltaTime);
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy() {
        this.isRunning = false;
        
        // Clean up players
        this.players.forEach(player => player.destroy());
        this.players.clear();
        
        // Clean up environment
        if (this.environment) {
            this.environment.destroy();
        }
        
        // Clean up network
        if (this.networkManager) {
            this.networkManager.disconnect();
        }
        
        // Clean up renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        console.log('🧹 Game destroyed');
    }
} 