import { MainMenu } from './game/MainMenu.js';

// Global instances
let mainMenu = null;
let currentGame = null;

// Initialize the main menu
async function initGame() {
    try {
        console.log('🎮 Initializing Main Menu...');
        
        // Hide initial loading screen
        const loadingScreen = document.getElementById('loading');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // Create main menu instance
        mainMenu = new MainMenu();
        
        // Make accessible globally for debugging
        window.mainMenu = mainMenu;
        
        console.log('✅ Main Menu initialized successfully!');
        
    } catch (error) {
        console.error('❌ Failed to initialize main menu:', error);
        showError(error);
    }
}

// Error handling
function showError(error) {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div style="text-align: center; color: #ff0000;">
                <h2>🚨 SYSTEM ERROR</h2>
                <p>Failed to initialize tactical systems</p>
                <p style="font-size: 0.9rem; margin-top: 20px;">Error: ${error.message}</p>
                <button onclick="location.reload()" style="
                    background: rgba(255, 0, 0, 0.2);
                    border: 2px solid #ff0000;
                    color: #ff0000;
                    padding: 15px 30px;
                    margin-top: 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                ">
                    RESTART SYSTEM
                </button>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 DOM loaded, initializing game...');
    initGame();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (currentGame && currentGame.onWindowResize) {
        currentGame.onWindowResize();
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (currentGame && currentGame.destroy) {
        currentGame.destroy();
    }
});

// Debug functions for development
window.debugGame = {
    // Menu functions
    showMenu: () => {
        if (mainMenu) {
            mainMenu.showMenu();
        }
    },
    
    hideMenu: () => {
        if (mainMenu) {
            mainMenu.hideMenu();
        }
    },
    
    returnToMenu: () => {
        if (mainMenu) {
            mainMenu.returnToMenu();
        }
    },
    
    startSinglePlayer: () => {
        if (mainMenu) {
            mainMenu.startSinglePlayer();
        }
    },
    
    startMultiplayer: () => {
        if (mainMenu) {
            mainMenu.startMultiplayer();
        }
    },
    
    showMapSelection: () => {
        if (mainMenu) {
            mainMenu.showMapSelection();
        }
    },
    
    importLocalMap: (file) => {
        if (mainMenu) {
            mainMenu.handleLocalFileImport({ target: { files: [file] } });
        }
    },
    
    importSketchfabMap: (url) => {
        if (mainMenu) {
            document.getElementById('sketchfab-url-input').value = url;
            mainMenu.handleSketchfabImport();
        }
    },
    
    // Game functions (work with both single and multiplayer)
    toggleDebug: () => {
        if (currentGame) {
            currentGame.debugMode = !currentGame.debugMode;
            console.log(`🔍 Debug mode: ${currentGame.debugMode ? 'ON' : 'OFF'}`);
        }
    },
    
    getGameState: () => {
        if (currentGame && currentGame.gameState) {
            return currentGame.gameState;
        }
        return null;
    },
    
    completeObjective: (id) => {
        if (currentGame && currentGame.missionManager) {
            currentGame.missionManager.completeObjective(id);
        }
    },
    
    setHealth: (health) => {
        if (currentGame && currentGame.gameState) {
            currentGame.gameState.health = Math.max(0, Math.min(100, health));
        }
    },
    
    setStamina: (stamina) => {
        if (currentGame && currentGame.gameState) {
            currentGame.gameState.stamina = Math.max(0, Math.min(100, stamina));
        }
    },
    
    triggerAlarm: () => {
        if (currentGame && currentGame.environment) {
            currentGame.environment.triggerAlarm();
        }
    },
    
    completeAllObjectives: () => {
        if (currentGame && currentGame.missionManager) {
            currentGame.missionManager.completeAllObjectives();
        }
    },
    
    // Map loading functions
    loadMap: (sketchfabUrl, mapId) => {
        if (currentGame && currentGame.mapLoader) {
            return currentGame.mapLoader.loadMapFromSketchfab(sketchfabUrl, mapId);
        }
    },
    
    loadLocalMap: (filePath, mapId) => {
        if (currentGame && currentGame.mapLoader) {
            return currentGame.mapLoader.loadLocalMap(filePath, mapId);
        }
    },
    
    getAvailableMaps: () => {
        if (currentGame && currentGame.mapLoader) {
            return currentGame.mapLoader.getAvailableMaps();
        }
    },
    
    getCurrentMap: () => {
        if (currentGame && currentGame.mapLoader) {
            return currentGame.mapLoader.getCurrentMap();
        }
    },
    
    clearMap: () => {
        if (currentGame && currentGame.mapLoader) {
            currentGame.mapLoader.clearCurrentMap();
        }
    }
};

// Make debug functions available
if (typeof window !== 'undefined') {
    console.log(`
🎮 SHADOW OPS DEBUG COMMANDS:

🎯 MENU COMMANDS:
- debugGame.showMenu() - Show main menu
- debugGame.hideMenu() - Hide main menu
- debugGame.returnToMenu() - Return to main menu from game
- debugGame.startSinglePlayer() - Start single player mode
- debugGame.startMultiplayer() - Start multiplayer mode
- debugGame.showMapSelection() - Show map selection screen
- debugGame.importSketchfabMap(url) - Import map from Sketchfab URL

🎮 GAME COMMANDS:
- debugGame.toggleDebug() - Toggle debug mode
- debugGame.getGameState() - Get current game state
- debugGame.completeObjective(id) - Complete specific objective
- debugGame.setHealth(value) - Set player health (0-100)
- debugGame.setStamina(value) - Set player stamina (0-100)
- debugGame.triggerAlarm() - Trigger facility alarm
- debugGame.completeAllObjectives() - Complete all objectives

🗺️ MAP LOADING COMMANDS:
- debugGame.loadMap(sketchfabUrl, mapId) - Load map from Sketchfab
- debugGame.loadLocalMap(filePath, mapId) - Load local map file
- debugGame.getAvailableMaps() - Get list of available maps
- debugGame.getCurrentMap() - Get current loaded map info
- debugGame.clearMap() - Clear current map

📋 AVAILABLE MAPS:
- cod_shipment (Shipment - Call of Duty)
- cod_rust (Rust - Call of Duty)
- cod_nuketown (Nuketown - Call of Duty)
- cs_dust2 (Dust 2 - Counter-Strike)
- cs_mirage (Mirage - Counter-Strike)

🎯 QUICK START:
- Use the main menu to choose Single Player or Multiplayer
- Single Player works offline with all features
- Multiplayer requires server connection
    `);
}

export { mainMenu }; 