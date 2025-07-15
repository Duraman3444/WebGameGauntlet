import { io } from 'socket.io-client';

export class NetworkManager {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.playerId = null;
        this.isConnected = false;
        this.connectionStatus = document.getElementById('connectionStatus');
        
        // Network update rate
        this.updateRate = 1000 / 60; // 60 FPS
        this.lastUpdateTime = 0;
    }

    async connect() {
        try {
            console.log('🔌 Attempting to connect to server...');
            this.socket = io('http://localhost:3001', {
                transports: ['websocket', 'polling'],
                upgrade: true,
                timeout: 10000,
                forceNew: true
            });

            // Set up event listeners
            this.setupEventListeners();

            // Wait for connection
            await new Promise((resolve, reject) => {
                this.socket.on('connect', () => {
                    this.isConnected = true;
                    this.updateConnectionStatus('connected');
                    console.log('🔌 Connected to server');
                    resolve();
                });

                this.socket.on('connect_error', (error) => {
                    this.isConnected = false;
                    this.updateConnectionStatus('disconnected');
                    console.error('❌ Connection error:', error);
                    // Don't reject immediately, allow fallback
                    setTimeout(() => {
                        if (!this.isConnected) {
                            console.log('⚠️ Connection failed, continuing in offline mode');
                            resolve(); // Continue anyway
                        }
                    }, 2000);
                });

                // Set a timeout for connection
                setTimeout(() => {
                    if (!this.isConnected) {
                        console.log('⚠️ Connection timeout, continuing in offline mode');
                        resolve(); // Continue anyway
                    }
                }, 8000);
            });

            // Start sending player updates
            this.startUpdateLoop();

        } catch (error) {
            console.error('❌ Failed to connect:', error);
            this.updateConnectionStatus('disconnected');
            console.log('⚠️ Continuing in offline mode');
            // Don't throw error, continue with offline mode
        }
    }

    setupEventListeners() {
        // Connection events
        this.socket.on('disconnect', () => {
            this.isConnected = false;
            this.updateConnectionStatus('disconnected');
            console.log('🔌 Disconnected from server');
        });

        this.socket.on('reconnect', () => {
            this.isConnected = true;
            this.updateConnectionStatus('connected');
            console.log('🔌 Reconnected to server');
        });

        // Player events
        this.socket.on('playerJoined', (data) => {
            console.log('👤 Player joined:', data);
            
            if (data.playerId === this.socket.id) {
                // This is the local player
                this.playerId = data.playerId;
                this.game.spawnPlayer(data.playerId, data.position, true);
            } else {
                // This is a remote player
                this.game.spawnPlayer(data.playerId, data.position, false);
            }
            
            this.updateGameState(data.gameState);
        });

        this.socket.on('playerLeft', (data) => {
            console.log('👤 Player left:', data);
            this.game.removePlayer(data.playerId);
            this.updateGameState(data.gameState);
        });

        this.socket.on('playerMoved', (data) => {
            if (data.playerId !== this.playerId) {
                const player = this.game.players.get(data.playerId);
                if (player) {
                    player.setPosition(data.position);
                    player.setRotation(data.rotation.yaw, data.rotation.pitch);
                }
            }
        });

        this.socket.on('playersList', (players) => {
            console.log('📋 Players list:', players);
            
            // Spawn existing players
            players.forEach(playerData => {
                if (playerData.playerId !== this.socket.id) {
                    this.game.spawnPlayer(playerData.playerId, playerData.position, false);
                }
            });
        });

        // Game events
        this.socket.on('gameState', (gameState) => {
            this.updateGameState(gameState);
        });

        this.socket.on('collectibleCollected', (data) => {
            console.log('💎 Collectible collected:', data);
            this.game.environment.removeCollectible(data.collectibleIndex);
            this.updateGameState(data.gameState);
        });

        this.socket.on('playerDamaged', (data) => {
            console.log('💔 Player damaged:', data);
            const player = this.game.players.get(data.playerId);
            if (player) {
                player.takeDamage(data.damage);
            }
        });

        // Chat events (if you want to add chat later)
        this.socket.on('chatMessage', (data) => {
            console.log('💬 Chat message:', data);
            // Handle chat message display
        });

        // Game room events
        this.socket.on('roomCreated', (data) => {
            console.log('🏠 Room created:', data);
        });

        this.socket.on('roomJoined', (data) => {
            console.log('🏠 Room joined:', data);
        });

        this.socket.on('roomLeft', (data) => {
            console.log('🏠 Room left:', data);
        });

        // Error handling
        this.socket.on('error', (error) => {
            console.error('🚨 Socket error:', error);
        });
    }

    startUpdateLoop() {
        const sendUpdate = () => {
            if (this.isConnected && this.game.localPlayer) {
                const now = Date.now();
                
                if (now - this.lastUpdateTime >= this.updateRate) {
                    this.sendPlayerUpdate();
                    this.lastUpdateTime = now;
                }
            }
            
            // Continue the loop
            requestAnimationFrame(sendUpdate);
        };
        
        sendUpdate();
    }

    sendPlayerUpdate() {
        if (!this.game.localPlayer) return;
        
        const playerData = {
            position: this.game.localPlayer.getPosition(),
            rotation: this.game.localPlayer.getRotation(),
            timestamp: Date.now()
        };
        
        this.socket.emit('playerUpdate', playerData);
    }

    updateConnectionStatus(status) {
        if (this.connectionStatus) {
            this.connectionStatus.className = status;
            if (status === 'connected') {
                this.connectionStatus.textContent = 'Connected';
            } else {
                this.connectionStatus.textContent = 'Offline Mode';
            }
        }
    }

    updateGameState(gameState) {
        if (gameState) {
            this.game.updateGameState(gameState);
        }
    }

    // Game actions
    collectItem(collectibleIndex) {
        if (this.isConnected) {
            this.socket.emit('collectItem', { collectibleIndex });
        }
    }

    sendChatMessage(message) {
        if (this.isConnected) {
            this.socket.emit('chatMessage', { message });
        }
    }

    joinRoom(roomId) {
        if (this.isConnected) {
            this.socket.emit('joinRoom', { roomId });
        }
    }

    leaveRoom() {
        if (this.isConnected) {
            this.socket.emit('leaveRoom');
        }
    }

    createRoom(roomName) {
        if (this.isConnected) {
            this.socket.emit('createRoom', { roomName });
        }
    }

    // Utility methods
    getLatency() {
        if (!this.isConnected) return -1;
        
        return new Promise((resolve) => {
            const start = Date.now();
            this.socket.emit('ping', start);
            
            this.socket.once('pong', (timestamp) => {
                const latency = Date.now() - timestamp;
                resolve(latency);
            });
        });
    }

    isPlayerConnected() {
        return this.isConnected && this.playerId !== null;
    }

    getPlayerId() {
        return this.playerId;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.playerId = null;
            this.isConnected = false;
            this.updateConnectionStatus('disconnected');
            console.log('🔌 Manually disconnected');
        }
    }
} 