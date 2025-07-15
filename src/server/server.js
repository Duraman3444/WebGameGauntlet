const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const GameManager = require('./game/GameManager');
const RoomManager = require('./rooms/RoomManager');

class Server {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
                methods: ["GET", "POST"]
            }
        });
        
        this.port = process.env.PORT || 3001;
        this.gameManager = new GameManager();
        this.roomManager = new RoomManager();
        
        this.setupExpress();
        this.setupSocketIO();
    }

    setupExpress() {
        // Middleware
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, '../../dist')));
        
        // Basic routes
        this.app.get('/api/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                timestamp: new Date().toISOString(),
                players: this.gameManager.getPlayerCount(),
                rooms: this.roomManager.getRoomCount()
            });
        });
        
        this.app.get('/api/stats', (req, res) => {
            res.json({
                players: this.gameManager.getPlayerCount(),
                rooms: this.roomManager.getRoomCount(),
                uptime: process.uptime(),
                memory: process.memoryUsage()
            });
        });
        
        // Serve the game client
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../../dist/index.html'));
        });
    }

    setupSocketIO() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Player connected: ${socket.id}`);
            
            // Handle player joining
            this.handlePlayerJoin(socket);
            
            // Set up event listeners for this socket
            this.setupSocketEvents(socket);
            
            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`🔌 Player disconnected: ${socket.id}`);
                this.handlePlayerDisconnect(socket);
            });
        });
    }

    setupSocketEvents(socket) {
        // Player movement and game actions
        socket.on('playerUpdate', (data) => {
            this.gameManager.updatePlayer(socket.id, data);
            this.broadcastPlayerUpdate(socket, data);
        });

        // Item collection
        socket.on('collectItem', (data) => {
            const result = this.gameManager.collectItem(socket.id, data.collectibleIndex);
            if (result.success) {
                this.io.emit('collectibleCollected', {
                    playerId: socket.id,
                    collectibleIndex: data.collectibleIndex,
                    gameState: this.gameManager.getGameState()
                });
            }
        });

        // Chat system
        socket.on('chatMessage', (data) => {
            const message = {
                playerId: socket.id,
                message: data.message,
                timestamp: Date.now()
            };
            this.io.emit('chatMessage', message);
        });

        // Room management
        socket.on('createRoom', (data) => {
            const room = this.roomManager.createRoom(data.roomName, socket.id);
            socket.join(room.id);
            socket.emit('roomCreated', room);
        });

        socket.on('joinRoom', (data) => {
            const room = this.roomManager.joinRoom(data.roomId, socket.id);
            if (room) {
                socket.join(room.id);
                socket.emit('roomJoined', room);
                socket.to(room.id).emit('playerJoinedRoom', {
                    playerId: socket.id,
                    room: room
                });
            } else {
                socket.emit('error', { message: 'Room not found' });
            }
        });

        socket.on('leaveRoom', () => {
            const room = this.roomManager.leaveRoom(socket.id);
            if (room) {
                socket.leave(room.id);
                socket.emit('roomLeft', room);
                socket.to(room.id).emit('playerLeftRoom', {
                    playerId: socket.id,
                    room: room
                });
            }
        });

        // Ping/Pong for latency measurement
        socket.on('ping', (timestamp) => {
            socket.emit('pong', timestamp);
        });

        // Admin commands (for development)
        socket.on('adminCommand', (data) => {
            if (data.command === 'reset') {
                this.gameManager.resetGame();
                this.io.emit('gameReset');
            }
        });

        // Game state requests
        socket.on('requestGameState', () => {
            socket.emit('gameState', this.gameManager.getGameState());
        });

        // Player list requests
        socket.on('requestPlayersList', () => {
            socket.emit('playersList', this.gameManager.getPlayersList());
        });
    }

    handlePlayerJoin(socket) {
        // Generate random spawn position
        const spawnPosition = this.generateSpawnPosition();
        
        // Add player to game
        const player = this.gameManager.addPlayer(socket.id, spawnPosition);
        
        // Send initial game state to new player
        socket.emit('playerJoined', {
            playerId: socket.id,
            position: spawnPosition,
            gameState: this.gameManager.getGameState()
        });
        
        // Send existing players to new player
        const existingPlayers = this.gameManager.getPlayersList();
        socket.emit('playersList', existingPlayers);
        
        // Notify other players about new player
        socket.broadcast.emit('playerJoined', {
            playerId: socket.id,
            position: spawnPosition,
            gameState: this.gameManager.getGameState()
        });
        
        console.log(`👤 Player ${socket.id} joined the game`);
    }

    handlePlayerDisconnect(socket) {
        // Remove player from game
        this.gameManager.removePlayer(socket.id);
        
        // Remove from rooms
        this.roomManager.removePlayerFromAllRooms(socket.id);
        
        // Notify other players
        socket.broadcast.emit('playerLeft', {
            playerId: socket.id,
            gameState: this.gameManager.getGameState()
        });
    }

    broadcastPlayerUpdate(socket, data) {
        // Broadcast player position to other players
        socket.broadcast.emit('playerMoved', {
            playerId: socket.id,
            position: data.position,
            rotation: data.rotation,
            timestamp: data.timestamp
        });
    }

    generateSpawnPosition() {
        // Generate random spawn position within bounds
        const spawnRadius = 5;
        return {
            x: (Math.random() - 0.5) * spawnRadius,
            y: 1,
            z: (Math.random() - 0.5) * spawnRadius
        };
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`🚀 Server running on port ${this.port}`);
            console.log(`🎮 Game server ready for players!`);
            console.log(`📊 Health check: http://localhost:${this.port}/api/health`);
        });
    }

    stop() {
        this.server.close(() => {
            console.log('🛑 Server stopped');
        });
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

// Start the server
const server = new Server();
server.start();

module.exports = Server; 