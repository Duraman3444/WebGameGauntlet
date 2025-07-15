import { StealthGame } from './StealthGame.js';
import { Game } from './Game.js';

export class MainMenu {
    constructor() {
        this.currentMenu = 'main';
        this.gameInstance = null;
        this.gameMode = null;
        this.selectedMap = null;
        this.importedMaps = new Map(); // Store imported maps
        
        // Menu elements
        this.menuContainer = null;
        this.gameContainer = null;
        
        // Settings
        this.settings = {
            graphics: {
                shadows: true,
                particles: true,
                postProcessing: true,
                renderDistance: 100
            },
            audio: {
                masterVolume: 0.8,
                sfxVolume: 0.7,
                musicVolume: 0.6
            },
            controls: {
                mouseSensitivity: 0.5,
                invertY: false,
                fov: 75
            }
        };
        
        this.init();
    }
    
    init() {
        this.createMenuHTML();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.showMainMenu();
        // Add debug commands to global scope
        window.debugMapDetection = {
            testDirectFetch: async (filename = 'scene.gltf') => {
                console.log('🔧 Testing direct fetch for:', filename);
                try {
                    const response = await fetch(`/assets/maps/${filename}`);
                    console.log('🔧 Response:', response.status, response.statusText);
                    return response;
                } catch (error) {
                    console.error('🔧 Error:', error);
                    return null;
                }
            },
            refreshMapList: async () => {
                console.log('🔧 Refreshing map list...');
                await this.populateMapList();
                console.log('🔧 Done refreshing map list');
            }
        };
        
        console.log('🎮 Main Menu initialized');
    }
    
    createMenuHTML() {
        // Remove existing menu if it exists
        const existingMenu = document.getElementById('main-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Create main menu container
        this.menuContainer = document.createElement('div');
        this.menuContainer.id = 'main-menu';
        this.menuContainer.innerHTML = `
            <div class="menu-background">
                <div class="menu-content">
                    <!-- Main Menu -->
                    <div id="main-menu-screen" class="menu-screen">
                        <h1 class="game-title">SHADOW OPS</h1>
                        <p class="game-subtitle">Stealth Game</p>
                        
                        <div class="menu-buttons">
                            <button id="single-player-btn" class="menu-button">
                                <span class="button-icon">🥷</span>
                                SINGLE PLAYER
                            </button>
                            <button id="multiplayer-btn" class="menu-button">
                                <span class="button-icon">🌐</span>
                                MULTIPLAYER
                            </button>
                            <button id="server-list-btn" class="menu-button">
                                <span class="button-icon">🖥️</span>
                                SERVER LIST
                            </button>
                            <button id="settings-btn" class="menu-button">
                                <span class="button-icon">⚙️</span>
                                SETTINGS
                            </button>
                        </div>
                    </div>
                    
                    <!-- Settings Menu -->
                    <div id="settings-menu-screen" class="menu-screen hidden">
                        <h2 class="menu-title">SETTINGS</h2>
                        
                        <div class="settings-tabs">
                            <button id="graphics-tab" class="tab-button active">Graphics</button>
                            <button id="audio-tab" class="tab-button">Audio</button>
                            <button id="controls-tab" class="tab-button">Controls</button>
                        </div>
                        
                        <div class="settings-content">
                            <!-- Graphics Settings -->
                            <div id="graphics-settings" class="settings-panel">
                                <div class="setting-item">
                                    <label>Shadows</label>
                                    <input type="checkbox" id="shadows-toggle" checked>
                                </div>
                                <div class="setting-item">
                                    <label>Particles</label>
                                    <input type="checkbox" id="particles-toggle" checked>
                                </div>
                                <div class="setting-item">
                                    <label>Post Processing</label>
                                    <input type="checkbox" id="postprocessing-toggle" checked>
                                </div>
                                <div class="setting-item">
                                    <label>Render Distance</label>
                                    <input type="range" id="render-distance" min="50" max="200" value="100">
                                    <span id="render-distance-value">100</span>
                                </div>
                            </div>
                            
                            <!-- Audio Settings -->
                            <div id="audio-settings" class="settings-panel hidden">
                                <div class="setting-item">
                                    <label>Master Volume</label>
                                    <input type="range" id="master-volume" min="0" max="1" step="0.1" value="0.8">
                                    <span id="master-volume-value">80%</span>
                                </div>
                                <div class="setting-item">
                                    <label>SFX Volume</label>
                                    <input type="range" id="sfx-volume" min="0" max="1" step="0.1" value="0.7">
                                    <span id="sfx-volume-value">70%</span>
                                </div>
                                <div class="setting-item">
                                    <label>Music Volume</label>
                                    <input type="range" id="music-volume" min="0" max="1" step="0.1" value="0.6">
                                    <span id="music-volume-value">60%</span>
                                </div>
                            </div>
                            
                            <!-- Controls Settings -->
                            <div id="controls-settings" class="settings-panel hidden">
                                <div class="setting-item">
                                    <label>Mouse Sensitivity</label>
                                    <input type="range" id="mouse-sensitivity" min="0.1" max="2" step="0.1" value="0.5">
                                    <span id="mouse-sensitivity-value">0.5</span>
                                </div>
                                <div class="setting-item">
                                    <label>Invert Y-Axis</label>
                                    <input type="checkbox" id="invert-y-toggle">
                                </div>
                                <div class="setting-item">
                                    <label>Field of View</label>
                                    <input type="range" id="fov-slider" min="60" max="120" value="75">
                                    <span id="fov-value">75°</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="menu-buttons">
                            <button id="back-from-settings-btn" class="menu-button secondary">BACK</button>
                            <button id="apply-settings-btn" class="menu-button">APPLY</button>
                        </div>
                    </div>
                    
                    <!-- Server List Menu -->
                    <div id="server-list-screen" class="menu-screen hidden">
                        <h2 class="menu-title">SERVER LIST</h2>
                        
                        <div class="server-list-container">
                            <div class="server-list-header">
                                <span>Server Name</span>
                                <span>Players</span>
                                <span>Map</span>
                                <span>Ping</span>
                            </div>
                            
                            <div id="server-list" class="server-list">
                                <div class="server-item">
                                    <span>Official Server #1</span>
                                    <span>12/16</span>
                                    <span>Shipment</span>
                                    <span>45ms</span>
                                </div>
                                <div class="server-item">
                                    <span>Stealth Masters</span>
                                    <span>8/12</span>
                                    <span>Dust2</span>
                                    <span>78ms</span>
                                </div>
                                <div class="server-item">
                                    <span>Ninja Training</span>
                                    <span>4/8</span>
                                    <span>Rust</span>
                                    <span>102ms</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="menu-buttons">
                            <button id="back-from-servers-btn" class="menu-button secondary">BACK</button>
                            <button id="refresh-servers-btn" class="menu-button">REFRESH</button>
                            <button id="join-server-btn" class="menu-button">JOIN</button>
                        </div>
                    </div>
                    
                    <!-- Map Selection Screen -->
                    <div id="map-selection-screen" class="menu-screen hidden">
                        <h2 class="menu-title">IMPORT MAP</h2>
                        
                        <div class="map-selection-container">
                            <div class="map-import-section">
                                <h3>Select a Map File to Import</h3>
                                
                                <!-- Drag and Drop Zone -->
                                <div id="drag-drop-zone" class="drag-drop-zone">
                                    <div class="drag-drop-content">
                                        <div class="drag-drop-icon">📁</div>
                                        <h4>Drag & Drop Files Here</h4>
                                        <p>Or click to browse files</p>
                                        <div class="supported-formats">
                                            Supports: .gltf, .glb, .fbx, .obj
                                        </div>
                                    </div>
                                    <div class="drag-drop-overlay hidden">
                                        <div class="drag-drop-overlay-content">
                                            <div class="drag-drop-icon">⬇️</div>
                                            <h4>Drop your file here</h4>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="import-options">
                                    <div class="import-option">
                                        <input type="file" id="local-file-input" accept=".gltf,.glb,.fbx,.obj" style="display: none;">
                                        <button id="import-local-btn" class="import-button">
                                            📁 Browse Files
                                        </button>
                                        <p class="import-description">Upload a 3D model file from your computer</p>
                                    </div>
                                    <div class="import-option">
                                        <input type="text" id="sketchfab-url-input" placeholder="Enter Sketchfab URL...">
                                        <button id="import-sketchfab-btn" class="import-button">
                                            🌐 Import from Sketchfab
                                        </button>
                                        <p class="import-description">Import a model directly from Sketchfab</p>
                                    </div>
                                </div>
                                
                                <div id="selected-map-info" class="selected-map-info hidden">
                                    <h4>Selected Map:</h4>
                                    <p id="selected-map-name"></p>
                                    <p id="selected-map-details"></p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="menu-buttons">
                            <button id="back-from-maps-btn" class="menu-button secondary">BACK</button>
                            <button id="start-with-map-btn" class="menu-button" disabled>START GAME</button>
                        </div>
                    </div>
                    
                    <!-- Loading Screen -->
                    <div id="loading-screen" class="menu-screen hidden">
                        <div class="loading-content">
                            <div class="loading-spinner"></div>
                            <h2>Loading...</h2>
                            <p id="loading-text">Initializing game systems...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS styles
        this.addMenuStyles();
        
        // Add to page
        document.body.appendChild(this.menuContainer);
    }
    
    addMenuStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #main-menu {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                font-family: 'Courier New', monospace;
            }
            
            .menu-background {
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            
            .menu-background::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23000"/><circle cx="50" cy="50" r="2" fill="%23111"/></svg>') repeat;
                opacity: 0.3;
            }
            
            .menu-content {
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #333;
                border-radius: 10px;
                padding: 40px;
                text-align: center;
                max-width: 600px;
                width: 90%;
                position: relative;
                z-index: 1;
            }
            
            .menu-screen {
                display: block;
            }
            
            .menu-screen.hidden {
                display: none;
            }
            
            .game-title {
                font-size: 3.5rem;
                color: #00ff00;
                text-shadow: 0 0 20px #00ff00;
                margin: 0 0 10px 0;
                font-weight: bold;
                letter-spacing: 4px;
            }
            
            .game-subtitle {
                font-size: 1.5rem;
                color: #888;
                margin: 0 0 40px 0;
            }
            
            .menu-title {
                font-size: 2.5rem;
                color: #00ff00;
                text-shadow: 0 0 15px #00ff00;
                margin: 0 0 30px 0;
                font-weight: bold;
            }
            
            .menu-buttons {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .menu-button {
                background: linear-gradient(45deg, #1a1a1a, #333);
                border: 2px solid #555;
                color: #00ff00;
                padding: 15px 30px;
                font-size: 1.2rem;
                font-family: 'Courier New', monospace;
                cursor: pointer;
                transition: all 0.3s ease;
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .menu-button:hover {
                background: linear-gradient(45deg, #333, #555);
                border-color: #00ff00;
                box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
                transform: translateY(-2px);
            }
            
            .menu-button.secondary {
                background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
                color: #ccc;
            }
            
            .button-icon {
                font-size: 1.5rem;
            }
            
            .settings-tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                justify-content: center;
            }
            
            .tab-button {
                background: #1a1a1a;
                border: 2px solid #333;
                color: #888;
                padding: 10px 20px;
                cursor: pointer;
                border-radius: 5px;
                font-family: 'Courier New', monospace;
                transition: all 0.3s ease;
            }
            
            .tab-button.active {
                background: #333;
                color: #00ff00;
                border-color: #00ff00;
            }
            
            .settings-content {
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid #333;
                border-radius: 5px;
                padding: 20px;
                margin-bottom: 20px;
            }
            
            .settings-panel {
                display: block;
            }
            
            .settings-panel.hidden {
                display: none;
            }
            
            .setting-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 15px;
                color: #ccc;
            }
            
            .setting-item label {
                font-size: 1rem;
                min-width: 150px;
                text-align: left;
            }
            
            .setting-item input {
                margin-left: 10px;
            }
            
            .server-list-container {
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid #333;
                border-radius: 5px;
                padding: 20px;
                margin-bottom: 20px;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .server-list-header {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                gap: 15px;
                padding: 10px;
                border-bottom: 1px solid #333;
                color: #00ff00;
                font-weight: bold;
            }
            
            .server-list {
                margin-top: 10px;
            }
            
            .server-item {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                gap: 15px;
                padding: 10px;
                border-bottom: 1px solid #222;
                color: #ccc;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            .server-item:hover {
                background: rgba(0, 255, 0, 0.1);
            }
            
            .loading-content {
                text-align: center;
                color: #00ff00;
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid #333;
                border-top: 3px solid #00ff00;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Map Selection Styles */
            .map-selection-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 20px;
            }
            
            .map-import-section, .map-list-section {
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid #333;
                border-radius: 5px;
                padding: 20px;
            }
            
            .map-import-section h3, .map-list-section h3 {
                color: #00ff00;
                margin-bottom: 15px;
                font-size: 1.2rem;
                text-align: center;
            }
            
            .import-options {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .import-option {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .import-button {
                background: linear-gradient(45deg, #1a1a1a, #333);
                border: 2px solid #555;
                color: #00ff00;
                padding: 10px 15px;
                font-size: 0.9rem;
                font-family: 'Courier New', monospace;
                cursor: pointer;
                border-radius: 3px;
                transition: all 0.3s ease;
                white-space: nowrap;
            }
            
            .import-button:hover {
                background: linear-gradient(45deg, #333, #555);
                border-color: #00ff00;
                box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
            }
            
            #sketchfab-url-input {
                flex: 1;
                background: #1a1a1a;
                border: 2px solid #333;
                color: #ccc;
                padding: 10px;
                font-family: 'Courier New', monospace;
                border-radius: 3px;
                font-size: 0.9rem;
            }
            
            #sketchfab-url-input:focus {
                outline: none;
                border-color: #00ff00;
                box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
            }
            
            .map-list {
                max-height: 300px;
                overflow-y: auto;
                border: 1px solid #333;
                border-radius: 3px;
                background: #0a0a0a;
            }
            
            .map-item {
                display: flex;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #333;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            .map-item:hover {
                background: rgba(0, 255, 0, 0.1);
            }
            
            .map-item.selected {
                background: rgba(0, 255, 0, 0.2);
                border-color: #00ff00;
            }
            
            .map-item:last-child {
                border-bottom: none;
            }
            
            .map-info {
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            
            .map-name {
                font-size: 1.1rem;
                font-weight: bold;
                color: #00ff00;
                margin-bottom: 5px;
            }
            
            .map-details {
                display: flex;
                gap: 15px;
                font-size: 0.9rem;
                color: #888;
            }
            
            .map-game {
                color: #ccc;
            }
            
            .map-difficulty {
                color: #ffaa00;
            }
            
            .map-size {
                color: #00aaff;
            }
            
            .map-preview {
                width: 60px;
                height: 40px;
                background: #333;
                border: 1px solid #555;
                border-radius: 3px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
                font-size: 0.8rem;
                margin-left: 15px;
            }
            
            .map-placeholder {
                font-size: 1.5rem;
                color: #888;
            }
            
            .map-description {
                font-size: 0.8rem;
                color: #aaa;
                margin-top: 5px;
                text-align: left;
                padding-left: 10px;
            }
            
            .selected-map-info {
                margin-top: 20px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid #333;
                border-radius: 5px;
                text-align: left;
                color: #ccc;
            }
            
            .selected-map-info h4 {
                color: #00ff00;
                margin-bottom: 10px;
                font-size: 1.1rem;
            }
            
            .selected-map-info p {
                font-size: 0.9rem;
                margin-bottom: 5px;
            }
            
            .no-maps-message {
                text-align: center;
                color: #888;
                padding: 40px 20px;
                font-size: 1.1rem;
                background: rgba(0, 0, 0, 0.3);
                border: 1px dashed #555;
                border-radius: 8px;
                margin: 20px 0;
            }
            
            .import-description {
                font-size: 0.9rem;
                color: #aaa;
                margin-top: 5px;
                text-align: center;
            }
            
            /* Drag and Drop Zone Styles */
            .drag-drop-zone {
                width: 100%;
                height: 150px;
                border: 2px dashed #555;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                color: #888;
                background: rgba(0, 0, 0, 0.2);
                margin-bottom: 20px;
                position: relative;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .drag-drop-zone:hover {
                border-color: #00ff00;
                background: rgba(0, 255, 0, 0.1);
                box-shadow: 0 0 15px rgba(0, 255, 0, 0.2);
            }
            
            .drag-drop-zone.highlight {
                border-color: #00ff00;
                background: rgba(0, 255, 0, 0.2);
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.4);
                animation: pulse 1s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            .drag-drop-content {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1;
            }
            
            .drag-drop-icon {
                font-size: 3rem;
                margin-bottom: 10px;
            }
            
            .drag-drop-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .drag-drop-overlay.visible {
                opacity: 1;
            }
            
            .drag-drop-overlay-content {
                text-align: center;
                color: #fff;
            }
            
            .drag-drop-overlay-icon {
                font-size: 3rem;
                margin-bottom: 10px;
            }
            
            .supported-formats {
                font-size: 0.8rem;
                color: #aaa;
                margin-top: 10px;
            }
            
            @media (max-width: 800px) {
                .menu-container {
                    padding: 10px;
                }
                
                .map-selection-container {
                    flex-direction: column;
                    gap: 20px;
                }
                
                .map-import-section,
                .map-list-section {
                    width: 100%;
                }
                
                .drag-drop-zone {
                    height: 120px;
                }
                
                .drag-drop-icon {
                    font-size: 2rem;
                }
                
                .drag-drop-zone h4 {
                    font-size: 1rem;
                }
                
                .drag-drop-zone p {
                    font-size: 0.9rem;
                }
                
                .supported-formats {
                    font-size: 0.7rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        // Main menu buttons
        document.getElementById('single-player-btn').addEventListener('click', () => {
            this.startSinglePlayer();
        });
        
        document.getElementById('multiplayer-btn').addEventListener('click', () => {
            this.startMultiplayer();
        });
        
        document.getElementById('server-list-btn').addEventListener('click', () => {
            this.showServerList();
        });
        
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettings();
        });
        
        // Settings menu
        document.getElementById('back-from-settings-btn').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        document.getElementById('apply-settings-btn').addEventListener('click', () => {
            this.applySettings();
        });
        
        // Server list
        document.getElementById('back-from-servers-btn').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        document.getElementById('refresh-servers-btn').addEventListener('click', () => {
            this.refreshServers();
        });
        
        document.getElementById('join-server-btn').addEventListener('click', () => {
            this.joinSelectedServer();
        });
        
        // Settings tabs
        document.getElementById('graphics-tab').addEventListener('click', () => {
            this.showSettingsTab('graphics');
        });
        
        document.getElementById('audio-tab').addEventListener('click', () => {
            this.showSettingsTab('audio');
        });
        
        document.getElementById('controls-tab').addEventListener('click', () => {
            this.showSettingsTab('controls');
        });
        
        // Map selection
        document.getElementById('back-from-maps-btn').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        document.getElementById('start-with-map-btn').addEventListener('click', () => {
            this.startGameWithSelectedMap();
        });
        
        document.getElementById('import-local-btn').addEventListener('click', () => {
            document.getElementById('local-file-input').click();
        });
        
        document.getElementById('local-file-input').addEventListener('change', (e) => {
            this.handleLocalFileImport(e);
        });
        
        document.getElementById('import-sketchfab-btn').addEventListener('click', () => {
            this.handleSketchfabImport();
        });
        
        document.getElementById('sketchfab-url-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSketchfabImport();
            }
        });
        
        // Drag and drop functionality
        this.setupDragAndDrop();
        
        // Settings controls
        this.setupSettingsControls();
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC key to return to menu
            if (e.key === 'Escape' && this.gameInstance) {
                this.returnToMenu();
            }
        });
    }
    
    setupDragAndDrop() {
        const dragDropZone = document.getElementById('drag-drop-zone');
        const dragDropOverlay = dragDropZone.querySelector('.drag-drop-overlay');
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dragDropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });
        
        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dragDropZone.addEventListener(eventName, () => {
                dragDropZone.classList.add('highlight');
                dragDropOverlay.classList.remove('hidden');
                dragDropOverlay.classList.add('visible');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dragDropZone.addEventListener(eventName, () => {
                dragDropZone.classList.remove('highlight');
                dragDropOverlay.classList.add('hidden');
                dragDropOverlay.classList.remove('visible');
            }, false);
        });
        
        // Handle dropped files
        dragDropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleDroppedFiles(files);
            }
        }, false);
        
        // Also handle clicks on the drag drop zone
        dragDropZone.addEventListener('click', () => {
            document.getElementById('local-file-input').click();
        });
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    handleDroppedFiles(files) {
        const file = files[0]; // Take the first file
        
        if (!file) return;
        
        // Check if it's a valid file type
        const validExtensions = ['.gltf', '.glb', '.fbx', '.obj'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            alert(`Unsupported file type: ${fileExtension}\nSupported formats: ${validExtensions.join(', ')}`);
            return;
        }
        
        console.log('📁 Processing dropped file:', file.name);
        
        try {
            // Create a temporary URL for the file
            const fileUrl = URL.createObjectURL(file);
            
            // Extract file name without extension for map ID
            const mapId = 'local_' + file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
            
            // Create map info
            const mapInfo = {
                name: file.name.replace(/\.[^/.]+$/, ''),
                game: 'Custom',
                size: 'unknown',
                theme: 'custom',
                description: 'Imported via drag & drop',
                stealthProfile: {
                    difficulty: 'medium',
                    coverDensity: 'medium',
                    patrolComplexity: 'medium',
                    objectiveCount: 4
                },
                fileUrl: fileUrl,
                fileName: file.name
            };
            
            // Store the imported map
            this.importedMaps.set(mapId, mapInfo);
            
            // Show selected map info
            this.showSelectedMapInfo(mapId, mapInfo);
            
            // Enable start button
            document.getElementById('start-with-map-btn').disabled = false;
            
            console.log('✅ File dropped and imported successfully');
            
        } catch (error) {
            console.error('❌ Failed to process dropped file:', error);
            alert('Failed to process dropped file. Please try again.');
        }
    }
    
    setupSettingsControls() {
        // Graphics settings
        document.getElementById('shadows-toggle').addEventListener('change', (e) => {
            this.settings.graphics.shadows = e.target.checked;
        });
        
        document.getElementById('particles-toggle').addEventListener('change', (e) => {
            this.settings.graphics.particles = e.target.checked;
        });
        
        document.getElementById('postprocessing-toggle').addEventListener('change', (e) => {
            this.settings.graphics.postProcessing = e.target.checked;
        });
        
        document.getElementById('render-distance').addEventListener('input', (e) => {
            this.settings.graphics.renderDistance = parseInt(e.target.value);
            document.getElementById('render-distance-value').textContent = e.target.value;
        });
        
        // Audio settings
        document.getElementById('master-volume').addEventListener('input', (e) => {
            this.settings.audio.masterVolume = parseFloat(e.target.value);
            document.getElementById('master-volume-value').textContent = Math.round(e.target.value * 100) + '%';
        });
        
        document.getElementById('sfx-volume').addEventListener('input', (e) => {
            this.settings.audio.sfxVolume = parseFloat(e.target.value);
            document.getElementById('sfx-volume-value').textContent = Math.round(e.target.value * 100) + '%';
        });
        
        document.getElementById('music-volume').addEventListener('input', (e) => {
            this.settings.audio.musicVolume = parseFloat(e.target.value);
            document.getElementById('music-volume-value').textContent = Math.round(e.target.value * 100) + '%';
        });
        
        // Controls settings
        document.getElementById('mouse-sensitivity').addEventListener('input', (e) => {
            this.settings.controls.mouseSensitivity = parseFloat(e.target.value);
            document.getElementById('mouse-sensitivity-value').textContent = e.target.value;
        });
        
        document.getElementById('invert-y-toggle').addEventListener('change', (e) => {
            this.settings.controls.invertY = e.target.checked;
        });
        
        document.getElementById('fov-slider').addEventListener('input', (e) => {
            this.settings.controls.fov = parseInt(e.target.value);
            document.getElementById('fov-value').textContent = e.target.value + '°';
        });
    }
    
    showMainMenu() {
        this.hideAllScreens();
        document.getElementById('main-menu-screen').classList.remove('hidden');
        this.currentMenu = 'main';
    }
    
    showSettings() {
        this.hideAllScreens();
        document.getElementById('settings-menu-screen').classList.remove('hidden');
        this.currentMenu = 'settings';
    }
    
    showServerList() {
        this.hideAllScreens();
        document.getElementById('server-list-screen').classList.remove('hidden');
        this.currentMenu = 'servers';
        this.refreshServers();
    }
    
    showMapSelection() {
        this.hideAllScreens();
        document.getElementById('map-selection-screen').classList.remove('hidden');
        this.currentMenu = 'maps';
        
        // Reset selection state
        this.selectedMap = null;
        document.getElementById('selected-map-info').classList.add('hidden');
        document.getElementById('start-with-map-btn').disabled = true;
    }
    
    showSettingsTab(tabName) {
        // Hide all settings panels
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.add('hidden');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.tab-button').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected panel and activate tab
        document.getElementById(`${tabName}-settings`).classList.remove('hidden');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
    
    hideAllScreens() {
        document.querySelectorAll('.menu-screen').forEach(screen => {
            screen.classList.add('hidden');
        });
    }
    
    showLoading(message = 'Loading...') {
        this.hideAllScreens();
        document.getElementById('loading-screen').classList.remove('hidden');
        document.getElementById('loading-text').textContent = message;
    }
    
    async startSinglePlayer() {
        this.gameMode = 'singleplayer';
        this.showMapSelection();
    }
    
    async startMultiplayer() {
        this.gameMode = 'multiplayer';
        this.showMapSelection();
    }
    
    applySettings() {
        console.log('⚙️ Applying settings:', this.settings);
        
        if (this.gameInstance) {
            this.applyGameSettings();
        }
        
        // Save settings to localStorage
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
        
        this.showMainMenu();
    }
    
    applyGameSettings() {
        if (!this.gameInstance) return;
        
        // Apply graphics settings
        if (this.gameInstance.renderer) {
            this.gameInstance.renderer.shadowMap.enabled = this.settings.graphics.shadows;
            // Add more graphics settings as needed
        }
        
        // Apply audio settings
        // Add audio settings implementation
        
        // Apply controls settings
        if (this.gameInstance.mouse) {
            this.gameInstance.mouse.sensitivity = this.settings.controls.mouseSensitivity;
        }
        
        if (this.gameInstance.camera) {
            this.gameInstance.camera.fov = this.settings.controls.fov;
            this.gameInstance.camera.updateProjectionMatrix();
        }
    }
    
    refreshServers() {
        // Simulate server refresh
        console.log('🔄 Refreshing server list...');
        
        // In a real implementation, this would fetch from a server
        const serverList = document.getElementById('server-list');
        serverList.innerHTML = `
            <div class="server-item">
                <span>Official Server #1</span>
                <span>12/16</span>
                <span>Shipment</span>
                <span>45ms</span>
            </div>
            <div class="server-item">
                <span>Stealth Masters</span>
                <span>8/12</span>
                <span>Dust2</span>
                <span>78ms</span>
            </div>
            <div class="server-item">
                <span>Ninja Training</span>
                <span>4/8</span>
                <span>Rust</span>
                <span>102ms</span>
            </div>
        `;
    }
    
    joinSelectedServer() {
        console.log('🔗 Joining selected server...');
        this.startMultiplayer();
    }
    
    hideMenu() {
        this.menuContainer.style.display = 'none';
        
        // Ensure game container exists
        let gameContainer = document.getElementById('gameContainer');
        if (!gameContainer) {
            gameContainer = document.createElement('div');
            gameContainer.id = 'gameContainer';
            gameContainer.style.width = '100%';
            gameContainer.style.height = '100%';
            gameContainer.style.position = 'relative';
            document.body.appendChild(gameContainer);
        }
    }
    
    showMenu() {
        this.menuContainer.style.display = 'block';
        this.showMainMenu();
    }
    
    returnToMenu() {
        if (this.gameInstance) {
            if (this.gameInstance.destroy) {
                this.gameInstance.destroy();
            }
            this.gameInstance = null;
        }
        
        // Clear global reference
        window.currentGame = null;
        
        this.showMenu();
    }
    
    getSettings() {
        return this.settings;
    }
    
    getDefaultMaps() {
        return new Map([
            ['cod_shipment', {
                name: 'Shipment',
                game: 'Call of Duty',
                size: 'small',
                theme: 'industrial',
                description: 'Tight quarters combat in a shipping container yard',
                stealthProfile: {
                    difficulty: 'hard',
                    coverDensity: 'high',
                    patrolComplexity: 'medium',
                    objectiveCount: 3
                }
            }],
            ['cod_rust', {
                name: 'Rust',
                game: 'Call of Duty',
                size: 'small',
                theme: 'industrial',
                description: 'Abandoned industrial facility with multi-level gameplay',
                stealthProfile: {
                    difficulty: 'medium',
                    coverDensity: 'medium',
                    patrolComplexity: 'high',
                    objectiveCount: 4
                }
            }],
            ['cod_nuketown', {
                name: 'Nuketown',
                game: 'Call of Duty',
                size: 'small',
                theme: 'suburban',
                description: 'Nuclear test town with house-to-house combat',
                stealthProfile: {
                    difficulty: 'medium',
                    coverDensity: 'medium',
                    patrolComplexity: 'medium',
                    objectiveCount: 5
                }
            }],
            ['cs_dust2', {
                name: 'Dust 2',
                game: 'Counter-Strike',
                size: 'medium',
                theme: 'desert',
                description: 'Classic Middle Eastern town with long sightlines',
                stealthProfile: {
                    difficulty: 'hard',
                    coverDensity: 'low',
                    patrolComplexity: 'high',
                    objectiveCount: 4
                }
            }],
            ['cs_mirage', {
                name: 'Mirage',
                game: 'Counter-Strike',
                size: 'medium',
                theme: 'desert',
                description: 'Moroccan-inspired map with varied engagement distances',
                stealthProfile: {
                    difficulty: 'medium',
                    coverDensity: 'medium',
                    patrolComplexity: 'high',
                    objectiveCount: 6
                }
            }]
        ]);
    }
    
    async populateMapList() {
        const mapList = document.getElementById('map-list');
        mapList.innerHTML = '';
        
        // Show message if no maps are imported
        if (this.importedMaps.size === 0) {
            mapList.innerHTML = '<div class="no-maps-message">No maps imported yet. Please import a map file to get started.</div>';
            return;
        }
        
        // Add only imported maps
        this.importedMaps.forEach((mapInfo, mapId) => {
            const mapItem = this.createMapItem(mapId, mapInfo, true);
            mapList.appendChild(mapItem);
        });
        
        // Disable start button until map is selected
        document.getElementById('start-with-map-btn').disabled = true;
    }
    
    createMapItem(mapId, mapInfo, isImported) {
        const mapItem = document.createElement('div');
        mapItem.className = 'map-item';
        mapItem.dataset.mapId = mapId;
        
        mapItem.innerHTML = `
            <div class="map-info">
                <div class="map-name">${mapInfo.name}${isImported ? ' (Imported)' : ''}</div>
                <div class="map-details">
                    <span class="map-game">${mapInfo.game}</span>
                    <span class="map-difficulty">${mapInfo.stealthProfile.difficulty}</span>
                    <span class="map-size">${mapInfo.size}</span>
                </div>
            </div>
            <div class="map-preview">MAP</div>
        `;
        
        mapItem.addEventListener('click', () => {
            this.selectMap(mapId, mapItem);
        });
        
        return mapItem;
    }
    
    selectMap(mapId, mapItem) {
        // Remove previous selection
        document.querySelectorAll('.map-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Select new map
        mapItem.classList.add('selected');
        this.selectedMap = mapId;
        document.getElementById('start-with-map-btn').disabled = false;
    }
    
    async handleLocalFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log('📁 Importing local file:', file.name);
        
        try {
            // Create a temporary URL for the file
            const fileUrl = URL.createObjectURL(file);
            
            // Extract file name without extension for map ID
            const mapId = 'local_' + file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
            
            // Create map info
            const mapInfo = {
                name: file.name.replace(/\.[^/.]+$/, ''),
                game: 'Custom',
                size: 'unknown',
                theme: 'custom',
                description: 'Imported local file',
                stealthProfile: {
                    difficulty: 'medium',
                    coverDensity: 'medium',
                    patrolComplexity: 'medium',
                    objectiveCount: 4
                },
                fileUrl: fileUrl,
                fileName: file.name
            };
            
            // Store the imported map
            this.importedMaps.set(mapId, mapInfo);
            
            // Show selected map info
            this.showSelectedMapInfo(mapId, mapInfo);
            
            // Enable start button
            document.getElementById('start-with-map-btn').disabled = false;
            
            // Clear the file input
            event.target.value = '';
            
            console.log('✅ Local file imported successfully');
            
        } catch (error) {
            console.error('❌ Failed to import local file:', error);
            alert('Failed to import local file. Please try again.');
        }
    }
    
    showSelectedMapInfo(mapId, mapInfo) {
        const selectedMapInfo = document.getElementById('selected-map-info');
        const selectedMapName = document.getElementById('selected-map-name');
        const selectedMapDetails = document.getElementById('selected-map-details');
        
        selectedMapName.textContent = mapInfo.name;
        selectedMapDetails.textContent = `Format: ${mapInfo.fileName ? mapInfo.fileName.split('.').pop().toUpperCase() : 'Unknown'} | Source: ${mapInfo.game}`;
        
        selectedMapInfo.classList.remove('hidden');
        
        // Store the selected map
        this.selectedMap = mapId;
    }
    
    async handleSketchfabImport() {
        const urlInput = document.getElementById('sketchfab-url-input');
        const sketchfabUrl = urlInput.value.trim();
        
        if (!sketchfabUrl) {
            alert('Please enter a Sketchfab URL');
            return;
        }
        
        console.log('🌐 Importing from Sketchfab:', sketchfabUrl);
        
        try {
            // Extract model ID from URL
            const modelId = sketchfabUrl.match(/models\/([^\/]+)/)?.[1];
            if (!modelId) {
                throw new Error('Invalid Sketchfab URL');
            }
            
            // Create map info
            const mapInfo = {
                name: 'Sketchfab Model',
                game: 'Custom',
                size: 'unknown',
                theme: 'custom',
                description: 'Imported from Sketchfab',
                stealthProfile: {
                    difficulty: 'medium',
                    coverDensity: 'medium',
                    patrolComplexity: 'medium',
                    objectiveCount: 4
                },
                sketchfabUrl: sketchfabUrl,
                modelId: modelId
            };
            
            // Store the imported map
            const mapId = 'sketchfab_' + modelId;
            this.importedMaps.set(mapId, mapInfo);
            
            // Show selected map info
            this.showSelectedMapInfo(mapId, mapInfo);
            
            // Enable start button
            document.getElementById('start-with-map-btn').disabled = false;
            
            // Clear the input
            urlInput.value = '';
            
            console.log('✅ Sketchfab map imported successfully');
            
        } catch (error) {
            console.error('❌ Failed to import from Sketchfab:', error);
            alert('Failed to import from Sketchfab. Please check the URL and try again.');
        }
    }
    
    async startGameWithSelectedMap() {
        if (!this.selectedMap) {
            alert('Please select a map first');
            return;
        }
        
        console.log('🎮 Starting game with map:', this.selectedMap);
        
        this.showLoading(`Starting ${this.gameMode} mode with ${this.selectedMap}...`);
        
        try {
            // Create game instance based on mode
            if (this.gameMode === 'singleplayer') {
                this.gameInstance = new StealthGame();
            } else if (this.gameMode === 'multiplayer') {
                this.gameInstance = new Game();
            }
            
            // Make accessible globally
            window.currentGame = this.gameInstance;
            
            // Apply settings
            this.applyGameSettings();
            
            // Load the selected map
            await this.loadSelectedMap();
            
            // Hide menu
            this.hideMenu();
            
            console.log(`✅ ${this.gameMode} mode started with map: ${this.selectedMap}`);
            
        } catch (error) {
            console.error('❌ Failed to start game with map:', error);
            alert('Failed to start game. Please try again.');
            this.showMapSelection();
        }
    }
    
    async loadSelectedMap() {
        if (!this.gameInstance || !this.selectedMap) return;
        
        console.log('🎮 LoadSelectedMap called with:', this.selectedMap);
        console.log('🎮 Available imported maps:', Array.from(this.importedMaps.keys()));
        
        // Check if it's an imported map
        const importedMap = this.importedMaps.get(this.selectedMap);
        console.log('🎮 Found imported map:', importedMap);
        
        if (importedMap && this.gameInstance.mapLoader) {
            if (importedMap.fileUrl) {
                // Load local file
                console.log('🔄 Loading local map file...');
                await this.gameInstance.mapLoader.loadLocalMap(importedMap.fileUrl, this.selectedMap);
            } else if (importedMap.assetsPath) {
                // Load map from assets folder
                console.log('🔄 Loading map from assets folder:', importedMap.assetsPath);
                await this.gameInstance.mapLoader.loadLocalMap(importedMap.assetsPath, this.selectedMap);
            } else if (importedMap.sketchfabUrl) {
                // Load Sketchfab model
                console.log('🔄 Loading Sketchfab map...');
                await this.gameInstance.mapLoader.loadMapFromSketchfab(importedMap.sketchfabUrl, this.selectedMap);
            }
        } else if (this.gameInstance.mapLoader) {
            // Load default map (placeholder for now)
            console.log('🔄 Loading default map...');
            // For now, just log that we would load the default map
            // In a real implementation, this would load the default map geometry
        }
    }
} 