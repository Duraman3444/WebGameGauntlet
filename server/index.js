const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store game rooms and player data
const gameRooms = new Map();
const playerRooms = new Map();

// Game constants
const MAX_PLAYERS_PER_ROOM = 4;
const GAME_LOOP_INTERVAL = 16; // ~60 FPS

class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = new Map();
    this.gameState = 'lobby'; // lobby, playing, finished
    this.gameStartTime = null;
    this.enemies = new Map();
    this.coins = new Set();
    this.powerUps = new Set();
  }

  addPlayer(playerId, playerData) {
    if (this.players.size >= MAX_PLAYERS_PER_ROOM) {
      return false;
    }
    
    this.players.set(playerId, {
      id: playerId,
      name: playerData.name || `Player${this.players.size + 1}`,
      x: 100 + (this.players.size * 50),
      y: 400,
      score: 0,
      lives: 3,
      coins: 0,
      powerUpState: 'small',
      isAlive: true,
      lastUpdate: Date.now()
    });
    
    return true;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    if (this.players.size === 0) {
      // Clean up empty room
      gameRooms.delete(this.roomId);
    }
  }

  startGame() {
    if (this.gameState === 'lobby' && this.players.size > 0) {
      this.gameState = 'playing';
      this.gameStartTime = Date.now();
      return true;
    }
    return false;
  }

  updatePlayer(playerId, playerData) {
    const player = this.players.get(playerId);
    if (player) {
      Object.assign(player, playerData, { lastUpdate: Date.now() });
    }
  }

  getGameState() {
    return {
      roomId: this.roomId,
      gameState: this.gameState,
      players: Array.from(this.players.values()),
      gameTime: this.gameStartTime ? Date.now() - this.gameStartTime : 0
    };
  }
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Join room
  socket.on('join_room', (data) => {
    const { roomId, playerName } = data;
    
    let room = gameRooms.get(roomId);
    if (!room) {
      room = new GameRoom(roomId);
      gameRooms.set(roomId, room);
    }

    if (room.addPlayer(socket.id, { name: playerName })) {
      socket.join(roomId);
      playerRooms.set(socket.id, roomId);
      
      // Notify all players in room
      socket.to(roomId).emit('player_join', {
        id: socket.id,
        name: playerName,
        x: 100 + (room.players.size * 50),
        y: 400
      });
      
      // Send current room state to new player
      socket.emit('room_update', room.getGameState());
      
      console.log(`Player ${socket.id} joined room ${roomId}`);
    } else {
      socket.emit('join_error', { message: 'Room is full' });
    }
  });

  // Leave room
  socket.on('leave_room', () => {
    const roomId = playerRooms.get(socket.id);
    if (roomId) {
      const room = gameRooms.get(roomId);
      if (room) {
        room.removePlayer(socket.id);
        socket.to(roomId).emit('player_leave', { id: socket.id });
        socket.leave(roomId);
      }
      playerRooms.delete(socket.id);
    }
  });

  // Player movement
  socket.on('player_move', (data) => {
    const roomId = playerRooms.get(socket.id);
    if (roomId) {
      const room = gameRooms.get(roomId);
      if (room) {
        room.updatePlayer(socket.id, data);
        // Broadcast to other players in room
        socket.to(roomId).emit('player_moved', {
          id: socket.id,
          ...data
        });
      }
    }
  });

  // Player actions (jump, power-up, etc.)
  socket.on('player_action', (data) => {
    const roomId = playerRooms.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit('player_action', {
        playerId: socket.id,
        ...data
      });
    }
  });

  // Game start
  socket.on('start_game', () => {
    const roomId = playerRooms.get(socket.id);
    if (roomId) {
      const room = gameRooms.get(roomId);
      if (room && room.startGame()) {
        io.to(roomId).emit('game_start', room.getGameState());
        console.log(`Game started in room ${roomId}`);
      }
    }
  });

  // Game events (coin collected, enemy defeated, etc.)
  socket.on('game_event', (data) => {
    const roomId = playerRooms.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit('game_event', {
        playerId: socket.id,
        ...data
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    const roomId = playerRooms.get(socket.id);
    if (roomId) {
      const room = gameRooms.get(roomId);
      if (room) {
        room.removePlayer(socket.id);
        socket.to(roomId).emit('player_leave', { id: socket.id });
      }
      playerRooms.delete(socket.id);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    rooms: gameRooms.size,
    players: playerRooms.size
  });
});

// Get room info
app.get('/rooms/:roomId', (req, res) => {
  const room = gameRooms.get(req.params.roomId);
  if (room) {
    res.json(room.getGameState());
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`🎮 Mario Clone Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for http://localhost:3000 and http://localhost:3002`);
}); 