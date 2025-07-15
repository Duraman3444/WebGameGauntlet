const { v4: uuidv4 } = require('uuid');

class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.playerRooms = new Map(); // playerId -> roomId mapping
        
        // Room settings
        this.maxRoomsPerPlayer = 3;
        this.maxPlayersPerRoom = 8;
        this.roomTimeout = 30 * 60 * 1000; // 30 minutes
        
        // Start cleanup interval
        this.startCleanupInterval();
    }

    createRoom(roomName, creatorId) {
        const roomId = uuidv4();
        const now = Date.now();
        
        const room = {
            id: roomId,
            name: roomName || `Room ${roomId.substring(0, 8)}`,
            creator: creatorId,
            players: new Set([creatorId]),
            maxPlayers: this.maxPlayersPerRoom,
            isPrivate: false,
            gameState: {
                isActive: false,
                startTime: null,
                endTime: null
            },
            createdAt: now,
            lastActivity: now,
            settings: {
                gameMode: 'collection',
                timeLimit: 300, // 5 minutes
                collectiblesNeeded: 15
            }
        };
        
        this.rooms.set(roomId, room);
        this.playerRooms.set(creatorId, roomId);
        
        console.log(`🏠 Room created: ${roomName} (${roomId}) by ${creatorId}`);
        return room;
    }

    joinRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        
        if (!room) {
            console.log(`❌ Room not found: ${roomId}`);
            return null;
        }
        
        if (room.players.size >= room.maxPlayers) {
            console.log(`❌ Room full: ${roomId}`);
            return null;
        }
        
        if (room.players.has(playerId)) {
            console.log(`⚠️ Player ${playerId} already in room ${roomId}`);
            return room;
        }
        
        // Remove player from any existing room
        this.leaveRoom(playerId);
        
        // Add player to new room
        room.players.add(playerId);
        room.lastActivity = Date.now();
        this.playerRooms.set(playerId, roomId);
        
        console.log(`👤 Player ${playerId} joined room ${roomId}`);
        return room;
    }

    leaveRoom(playerId) {
        const currentRoomId = this.playerRooms.get(playerId);
        
        if (!currentRoomId) {
            return null;
        }
        
        const room = this.rooms.get(currentRoomId);
        if (!room) {
            this.playerRooms.delete(playerId);
            return null;
        }
        
        // Remove player from room
        room.players.delete(playerId);
        room.lastActivity = Date.now();
        this.playerRooms.delete(playerId);
        
        console.log(`👤 Player ${playerId} left room ${currentRoomId}`);
        
        // If room is empty, delete it
        if (room.players.size === 0) {
            this.deleteRoom(currentRoomId);
        }
        // If creator left, transfer ownership
        else if (room.creator === playerId) {
            const newCreator = Array.from(room.players)[0];
            room.creator = newCreator;
            console.log(`👑 Room ${currentRoomId} ownership transferred to ${newCreator}`);
        }
        
        return room;
    }

    deleteRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            // Remove all players from this room
            room.players.forEach(playerId => {
                this.playerRooms.delete(playerId);
            });
            
            this.rooms.delete(roomId);
            console.log(`🗑️ Room deleted: ${roomId}`);
        }
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    getRoomByPlayer(playerId) {
        const roomId = this.playerRooms.get(playerId);
        return roomId ? this.rooms.get(roomId) : null;
    }

    getAllRooms() {
        return Array.from(this.rooms.values()).map(room => ({
            id: room.id,
            name: room.name,
            playerCount: room.players.size,
            maxPlayers: room.maxPlayers,
            isPrivate: room.isPrivate,
            gameState: room.gameState,
            createdAt: room.createdAt
        }));
    }

    getPublicRooms() {
        return Array.from(this.rooms.values())
            .filter(room => !room.isPrivate)
            .map(room => ({
                id: room.id,
                name: room.name,
                playerCount: room.players.size,
                maxPlayers: room.maxPlayers,
                gameState: room.gameState,
                createdAt: room.createdAt
            }));
    }

    getRoomCount() {
        return this.rooms.size;
    }

    getPlayerRoomId(playerId) {
        return this.playerRooms.get(playerId);
    }

    isPlayerInRoom(playerId, roomId) {
        const room = this.rooms.get(roomId);
        return room ? room.players.has(playerId) : false;
    }

    updateRoomSettings(roomId, settings, requesterId) {
        const room = this.rooms.get(roomId);
        
        if (!room) {
            return { success: false, error: 'Room not found' };
        }
        
        if (room.creator !== requesterId) {
            return { success: false, error: 'Only room creator can change settings' };
        }
        
        // Update settings
        room.settings = { ...room.settings, ...settings };
        room.lastActivity = Date.now();
        
        console.log(`⚙️ Room ${roomId} settings updated by ${requesterId}`);
        return { success: true, settings: room.settings };
    }

    startGame(roomId, requesterId) {
        const room = this.rooms.get(roomId);
        
        if (!room) {
            return { success: false, error: 'Room not found' };
        }
        
        if (room.creator !== requesterId) {
            return { success: false, error: 'Only room creator can start game' };
        }
        
        if (room.gameState.isActive) {
            return { success: false, error: 'Game already active' };
        }
        
        // Start game
        room.gameState.isActive = true;
        room.gameState.startTime = Date.now();
        room.gameState.endTime = null;
        room.lastActivity = Date.now();
        
        console.log(`🎮 Game started in room ${roomId} by ${requesterId}`);
        return { success: true, gameState: room.gameState };
    }

    endGame(roomId, reason = 'Game ended') {
        const room = this.rooms.get(roomId);
        
        if (!room) {
            return { success: false, error: 'Room not found' };
        }
        
        if (!room.gameState.isActive) {
            return { success: false, error: 'Game not active' };
        }
        
        // End game
        room.gameState.isActive = false;
        room.gameState.endTime = Date.now();
        room.lastActivity = Date.now();
        
        console.log(`🏁 Game ended in room ${roomId}: ${reason}`);
        return { success: true, gameState: room.gameState, reason };
    }

    removePlayerFromAllRooms(playerId) {
        const roomId = this.playerRooms.get(playerId);
        if (roomId) {
            this.leaveRoom(playerId);
        }
    }

    kickPlayer(roomId, playerId, requesterId) {
        const room = this.rooms.get(roomId);
        
        if (!room) {
            return { success: false, error: 'Room not found' };
        }
        
        if (room.creator !== requesterId) {
            return { success: false, error: 'Only room creator can kick players' };
        }
        
        if (!room.players.has(playerId)) {
            return { success: false, error: 'Player not in room' };
        }
        
        if (playerId === requesterId) {
            return { success: false, error: 'Cannot kick yourself' };
        }
        
        // Remove player
        room.players.delete(playerId);
        this.playerRooms.delete(playerId);
        room.lastActivity = Date.now();
        
        console.log(`👢 Player ${playerId} kicked from room ${roomId} by ${requesterId}`);
        return { success: true };
    }

    setRoomPrivate(roomId, isPrivate, requesterId) {
        const room = this.rooms.get(roomId);
        
        if (!room) {
            return { success: false, error: 'Room not found' };
        }
        
        if (room.creator !== requesterId) {
            return { success: false, error: 'Only room creator can change privacy' };
        }
        
        room.isPrivate = isPrivate;
        room.lastActivity = Date.now();
        
        console.log(`🔒 Room ${roomId} privacy set to ${isPrivate} by ${requesterId}`);
        return { success: true };
    }

    // Cleanup methods
    startCleanupInterval() {
        setInterval(() => {
            this.cleanupInactiveRooms();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    cleanupInactiveRooms() {
        const now = Date.now();
        const roomsToDelete = [];
        
        this.rooms.forEach((room, roomId) => {
            const timeSinceActivity = now - room.lastActivity;
            
            // Delete empty rooms or rooms inactive for too long
            if (room.players.size === 0 || timeSinceActivity > this.roomTimeout) {
                roomsToDelete.push(roomId);
            }
        });
        
        roomsToDelete.forEach(roomId => {
            this.deleteRoom(roomId);
        });
        
        if (roomsToDelete.length > 0) {
            console.log(`🧹 Cleaned up ${roomsToDelete.length} inactive rooms`);
        }
    }

    // Statistics
    getStats() {
        const stats = {
            totalRooms: this.rooms.size,
            activeRooms: 0,
            totalPlayers: 0,
            publicRooms: 0,
            privateRooms: 0,
            gamesInProgress: 0
        };
        
        this.rooms.forEach(room => {
            stats.totalPlayers += room.players.size;
            
            if (room.isPrivate) {
                stats.privateRooms++;
            } else {
                stats.publicRooms++;
            }
            
            if (room.gameState.isActive) {
                stats.gamesInProgress++;
            }
            
            if (room.players.size > 0) {
                stats.activeRooms++;
            }
        });
        
        return stats;
    }
}

module.exports = RoomManager; 