const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

// Enable CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004"],
  credentials: true
}));

// Create Socket.io server with CORS
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004"],
    methods: ["GET", "POST"]
  }
});

// Game state
const gameState = {
  players: new Map(),
  rooms: new Map(),
  fruits: new Map(),
  levels: new Map()
};

// Player class
class Player {
  constructor(id, name, character) {
    this.id = id;
    this.name = name;
    this.character = character;
    this.x = 100;
    this.y = 500;
    this.velocityX = 0;
    this.velocityY = 0;
    this.health = 100;
    this.score = 0;
    this.currentWorld = 1;
    this.currentLevel = 1;
    this.isAlive = true;
    this.lastUpdate = Date.now();
  }

  update(data) {
    this.x = data.x || this.x;
    this.y = data.y || this.y;
    this.velocityX = data.velocityX || this.velocityX;
    this.velocityY = data.velocityY || this.velocityY;
    this.lastUpdate = Date.now();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      character: this.character,
      x: this.x,
      y: this.y,
      velocityX: this.velocityX,
      velocityY: this.velocityY,
      health: this.health,
      score: this.score,
      currentWorld: this.currentWorld,
      currentLevel: this.currentLevel,
      isAlive: this.isAlive
    };
  }
}

// Room class
class GameRoom {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.fruits = new Map();
    this.maxPlayers = 4;
    this.currentWorld = 1;
    this.currentLevel = 1;
    this.isActive = true;
  }

  addPlayer(player) {
    if (this.players.size < this.maxPlayers) {
      this.players.set(player.id, player);
      return true;
    }
    return false;
  }

  removePlayer(playerId) {
    return this.players.delete(playerId);
  }

  getPlayers() {
    return Array.from(this.players.values());
  }

  broadcast(event, data, excludeId = null) {
    this.players.forEach((player, playerId) => {
      if (playerId !== excludeId) {
        const socket = Array.from(io.sockets.sockets.values()).find(s => s.id === playerId);
        if (socket) {
          socket.emit(event, data);
        }
      }
    });
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🎮 Player connected: ${socket.id}`);
  
  // Send initial connection status
  socket.emit('connection_status', { connected: true, playerId: socket.id });

  // Handle player joining game
  socket.on('join_game', (data) => {
    console.log(`👤 Player ${socket.id} joining game:`, data);
    
    // Create or get room
    let room = gameState.rooms.get('default') || new GameRoom('default');
    if (!gameState.rooms.has('default')) {
      gameState.rooms.set('default', room);
    }
    
    // Create player
    const player = new Player(socket.id, data.playerName || 'Anonymous', data.character || 'pink_man');
    
    // Add player to room
    if (room.addPlayer(player)) {
      gameState.players.set(socket.id, player);
      socket.join('default');
      
      // Notify all players in room
      room.broadcast('player_joined', {
        player: player.toJSON(),
        totalPlayers: room.players.size
      });
      
      // Send current room state to new player
      socket.emit('game_state_updated', {
        players: room.getPlayers(),
        world: room.currentWorld,
        level: room.currentLevel
      });
      
      // Update player count
      io.to('default').emit('player_count_changed', room.players.size);
      
      console.log(`✅ Player ${socket.id} joined room. Total players: ${room.players.size}`);
    } else {
      socket.emit('join_error', { message: 'Room is full' });
    }
  });

  // Handle player movement
  socket.on('player_movement', (data) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.update(data);
      
      // Broadcast to other players in room
      const room = gameState.rooms.get('default');
      if (room) {
        room.broadcast('player_moved', {
          playerId: socket.id,
          x: player.x,
          y: player.y,
          velocityX: player.velocityX,
          velocityY: player.velocityY
        }, socket.id);
      }
    }
  });

  // Handle player jump
  socket.on('player_jump', (data) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.update(data);
      
      const room = gameState.rooms.get('default');
      if (room) {
        room.broadcast('player_jumped', {
          playerId: socket.id,
          x: player.x,
          y: player.y
        }, socket.id);
      }
    }
  });

  // Handle player double jump
  socket.on('player_double_jump', (data) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.update(data);
      
      const room = gameState.rooms.get('default');
      if (room) {
        room.broadcast('player_double_jumped', {
          playerId: socket.id,
          x: player.x,
          y: player.y
        }, socket.id);
      }
    }
  });

  // Handle player attack
  socket.on('player_attack', (data) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      const room = gameState.rooms.get('default');
      if (room) {
        room.broadcast('player_attacked', {
          playerId: socket.id,
          x: data.x,
          y: data.y,
          direction: data.direction
        }, socket.id);
      }
    }
  });

  // Handle fruit collection
  socket.on('fruit_collected', (data) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.score += 100; // Fruit value
      
      const room = gameState.rooms.get('default');
      if (room) {
        room.broadcast('fruit_collected', {
          playerId: socket.id,
          fruitId: data.fruitId,
          x: data.x,
          y: data.y,
          newScore: player.score
        });
      }
    }
  });

  // Handle level completion
  socket.on('level_completed', (data) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.currentWorld = data.world;
      player.currentLevel = data.level;
      player.score = data.score;
      
      const room = gameState.rooms.get('default');
      if (room) {
        room.broadcast('level_completed', {
          playerId: socket.id,
          world: data.world,
          level: data.level,
          score: data.score
        });
      }
    }
  });

  // Handle player leaving
  socket.on('leave_game', () => {
    handlePlayerDisconnect(socket.id);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🚪 Player disconnected: ${socket.id}`);
    handlePlayerDisconnect(socket.id);
  });

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });
});

// Helper function to handle player disconnect
function handlePlayerDisconnect(playerId) {
  const player = gameState.players.get(playerId);
  if (player) {
    // Remove player from room
    const room = gameState.rooms.get('default');
    if (room) {
      room.removePlayer(playerId);
      
      // Notify other players
      room.broadcast('player_left', {
        playerId: playerId,
        playerName: player.name,
        totalPlayers: room.players.size
      });
      
      // Update player count
      io.to('default').emit('player_count_changed', room.players.size);
      
      console.log(`❌ Player ${playerId} left room. Total players: ${room.players.size}`);
    }
    
    // Remove player from global state
    gameState.players.delete(playerId);
  }
}

// Periodic game state sync
setInterval(() => {
  gameState.rooms.forEach((room, roomId) => {
    if (room.players.size > 0) {
      const players = room.getPlayers();
      io.to(roomId).emit('game_state_sync', {
        players: players,
        timestamp: Date.now()
      });
    }
  });
}, 1000 / 30); // 30 FPS sync rate

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    players: gameState.players.size,
    rooms: gameState.rooms.size,
    uptime: process.uptime()
  });
});

// Game statistics endpoint
app.get('/stats', (req, res) => {
  const stats = {
    totalPlayers: gameState.players.size,
    totalRooms: gameState.rooms.size,
    roomDetails: {}
  };
  
  gameState.rooms.forEach((room, roomId) => {
    stats.roomDetails[roomId] = {
      playerCount: room.players.size,
      maxPlayers: room.maxPlayers,
      currentWorld: room.currentWorld,
      currentLevel: room.currentLevel
    };
  });
  
  res.json(stats);
});

const PORT = process.env.PORT || 3003;

httpServer.listen(PORT, () => {
  console.log(`🎮 Fruit Runners Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for client connections`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`📈 Game stats available at http://localhost:${PORT}/stats`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  httpServer.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down server...');
  httpServer.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
}); 