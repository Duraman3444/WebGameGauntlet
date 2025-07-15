class GameManager {
    constructor() {
        this.players = new Map();
        this.gameState = {
            score: 0,
            playerCount: 0,
            gameTime: 0,
            collectiblesRemaining: 15,
            isGameActive: true
        };
        
        this.collectibles = [];
        this.initializeCollectibles();
        
        // Game settings
        this.maxPlayers = 8;
        this.gameStartTime = Date.now();
        
        // Start game update loop
        this.startGameLoop();
    }

    initializeCollectibles() {
        // Initialize collectibles positions (matching client-side)
        this.collectibles = [];
        for (let i = 0; i < 15; i++) {
            this.collectibles.push({
                id: i,
                position: {
                    x: (Math.random() - 0.5) * 40,
                    y: 0.5,
                    z: (Math.random() - 0.5) * 40
                },
                value: 10,
                collected: false
            });
        }
    }

    startGameLoop() {
        setInterval(() => {
            this.updateGameState();
        }, 1000 / 60); // 60 FPS server updates
    }

    updateGameState() {
        const now = Date.now();
        this.gameState.gameTime = (now - this.gameStartTime) / 1000; // Convert to seconds
        this.gameState.playerCount = this.players.size;
        this.gameState.collectiblesRemaining = this.collectibles.filter(c => !c.collected).length;
        
        // Check win conditions
        if (this.gameState.collectiblesRemaining === 0) {
            this.endGame('All collectibles collected!');
        }
    }

    addPlayer(playerId, position) {
        if (this.players.size >= this.maxPlayers) {
            throw new Error('Server is full');
        }

        const player = {
            id: playerId,
            position: position,
            rotation: { yaw: 0, pitch: 0 },
            score: 0,
            health: 100,
            joinTime: Date.now(),
            lastUpdate: Date.now()
        };

        this.players.set(playerId, player);
        console.log(`➕ Player ${playerId} added to game`);
        
        return player;
    }

    removePlayer(playerId) {
        if (this.players.has(playerId)) {
            this.players.delete(playerId);
            console.log(`➖ Player ${playerId} removed from game`);
        }
    }

    updatePlayer(playerId, data) {
        const player = this.players.get(playerId);
        if (player) {
            player.position = data.position;
            player.rotation = data.rotation;
            player.lastUpdate = Date.now();
            
            // Check for collectible collection
            this.checkCollectibleCollection(playerId, data.position);
        }
    }

    checkCollectibleCollection(playerId, position) {
        const collectibleRadius = 1.0;
        
        for (let i = 0; i < this.collectibles.length; i++) {
            const collectible = this.collectibles[i];
            
            if (!collectible.collected) {
                const distance = this.calculateDistance(position, collectible.position);
                
                if (distance < collectibleRadius) {
                    // Player collected this item
                    collectible.collected = true;
                    
                    const player = this.players.get(playerId);
                    if (player) {
                        player.score += collectible.value;
                        this.gameState.score += collectible.value;
                    }
                    
                    console.log(`💎 Player ${playerId} collected item ${i} (Score: ${player.score})`);
                    break; // Only collect one item per update
                }
            }
        }
    }

    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    collectItem(playerId, collectibleIndex) {
        if (collectibleIndex >= 0 && collectibleIndex < this.collectibles.length) {
            const collectible = this.collectibles[collectibleIndex];
            
            if (!collectible.collected) {
                const player = this.players.get(playerId);
                if (player) {
                    // Check if player is close enough to collect
                    const distance = this.calculateDistance(player.position, collectible.position);
                    
                    if (distance < 2.0) { // Collection radius
                        collectible.collected = true;
                        player.score += collectible.value;
                        this.gameState.score += collectible.value;
                        
                        console.log(`💎 Player ${playerId} manually collected item ${collectibleIndex}`);
                        return { success: true, score: player.score };
                    }
                }
            }
        }
        
        return { success: false };
    }

    damagePlayer(playerId, damage) {
        const player = this.players.get(playerId);
        if (player) {
            player.health -= damage;
            
            if (player.health <= 0) {
                player.health = 0;
                console.log(`💀 Player ${playerId} was eliminated`);
                // Handle player elimination
            }
            
            return { success: true, health: player.health };
        }
        
        return { success: false };
    }

    getPlayersList() {
        return Array.from(this.players.values()).map(player => ({
            playerId: player.id,
            position: player.position,
            rotation: player.rotation,
            score: player.score,
            health: player.health
        }));
    }

    getPlayerCount() {
        return this.players.size;
    }

    getGameState() {
        return {
            ...this.gameState,
            playerCount: this.players.size,
            topPlayers: this.getTopPlayers()
        };
    }

    getTopPlayers(limit = 5) {
        return Array.from(this.players.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(player => ({
                id: player.id,
                score: player.score
            }));
    }

    getPlayer(playerId) {
        return this.players.get(playerId);
    }

    isPlayerActive(playerId) {
        const player = this.players.get(playerId);
        if (!player) return false;
        
        const now = Date.now();
        const timeSinceLastUpdate = now - player.lastUpdate;
        
        // Consider player inactive if no updates for 30 seconds
        return timeSinceLastUpdate < 30000;
    }

    cleanupInactivePlayers() {
        const inactivePlayers = [];
        
        this.players.forEach((player, playerId) => {
            if (!this.isPlayerActive(playerId)) {
                inactivePlayers.push(playerId);
            }
        });
        
        inactivePlayers.forEach(playerId => {
            this.removePlayer(playerId);
            console.log(`🧹 Cleaned up inactive player: ${playerId}`);
        });
        
        return inactivePlayers;
    }

    resetGame() {
        console.log('🔄 Resetting game...');
        
        // Reset all players
        this.players.forEach(player => {
            player.score = 0;
            player.health = 100;
        });
        
        // Reset game state
        this.gameState.score = 0;
        this.gameState.gameTime = 0;
        this.gameState.isGameActive = true;
        this.gameStartTime = Date.now();
        
        // Reset collectibles
        this.initializeCollectibles();
        
        console.log('✅ Game reset complete');
    }

    endGame(reason) {
        console.log(`🏁 Game ended: ${reason}`);
        this.gameState.isGameActive = false;
        
        // Could trigger game restart after a delay
        setTimeout(() => {
            this.resetGame();
        }, 10000); // Restart after 10 seconds
    }

    // Utility methods
    getServerStats() {
        return {
            players: this.players.size,
            maxPlayers: this.maxPlayers,
            gameTime: this.gameState.gameTime,
            collectiblesRemaining: this.gameState.collectiblesRemaining,
            isGameActive: this.gameState.isGameActive,
            uptime: process.uptime(),
            memory: process.memoryUsage()
        };
    }

    // Admin methods
    setMaxPlayers(max) {
        this.maxPlayers = Math.max(1, Math.min(20, max));
    }

    kickPlayer(playerId) {
        this.removePlayer(playerId);
    }

    // Periodic cleanup
    performMaintenance() {
        const inactivePlayers = this.cleanupInactivePlayers();
        
        if (inactivePlayers.length > 0) {
            console.log(`🧹 Maintenance: Removed ${inactivePlayers.length} inactive players`);
        }
    }
}

module.exports = GameManager; 