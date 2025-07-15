const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Game state
const players = {};
const gameState = {
  players: {},
  gameObjects: [],
  time: Date.now()
};

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log(`🎮 Player ${socket.id} connected`);

  // Initialize new player
  const newPlayer = {
    id: socket.id,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    health: 100,
    score: 0,
    color: getRandomColor(),
    lastUpdate: Date.now()
  };

  gameState.players[socket.id] = newPlayer;

  // Send initial game state to new player
  socket.emit('gameState', {
    players: gameState.players,
    gameObjects: gameState.gameObjects,
    yourPlayerId: socket.id
  });

  // Notify other players about new player
  socket.broadcast.emit('playerJoined', newPlayer);

  // Handle player movement updates
  socket.on('playerUpdate', (data) => {
    if (gameState.players[socket.id]) {
      gameState.players[socket.id].position = data.position;
      gameState.players[socket.id].rotation = data.rotation;
      gameState.players[socket.id].lastUpdate = Date.now();
      
      // Broadcast to other players
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        position: data.position,
        rotation: data.rotation
      });
    }
  });

  // Handle player actions
  socket.on('playerAction', (data) => {
    // Handle different actions like jumping, shooting, etc.
    socket.broadcast.emit('playerAction', {
      id: socket.id,
      action: data.action,
      data: data.data
    });
  });

  // Handle chat messages
  socket.on('chatMessage', (message) => {
    io.emit('chatMessage', {
      playerId: socket.id,
      message: message,
      timestamp: Date.now()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`👋 Player ${socket.id} disconnected`);
    delete gameState.players[socket.id];
    socket.broadcast.emit('playerLeft', socket.id);
  });
});

// Game loop for server-side updates
setInterval(() => {
  const currentTime = Date.now();
  
  // Remove inactive players (no updates for 30 seconds)
  Object.keys(gameState.players).forEach(playerId => {
    if (currentTime - gameState.players[playerId].lastUpdate > 30000) {
      delete gameState.players[playerId];
      io.emit('playerLeft', playerId);
    }
  });

  // Update game state timestamp
  gameState.time = currentTime;
}, 1000);

// Helper function to generate random player colors
function getRandomColor() {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    players: Object.keys(gameState.players).length,
    uptime: process.uptime()
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎮 Game ready for players!`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
}); 