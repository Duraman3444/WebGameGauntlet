const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002"],
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

// CORS middleware for Express routes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3002'];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/maps', express.static(path.join(__dirname, '../public/maps')));

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

  // Handle player shooting
  socket.on('playerShoot', (data) => {
    // Broadcast shooting event to all other players
    socket.broadcast.emit('playerShoot', {
      id: socket.id,
      position: data.position,
      direction: data.direction,
      weapon: data.weapon,
      timestamp: Date.now()
    });
  });

  // Handle player hits
  socket.on('playerHit', (data) => {
    const targetPlayer = gameState.players[data.targetId];
    if (targetPlayer) {
      // Apply damage
      targetPlayer.health -= data.damage;
      
      // Check if player is dead
      if (targetPlayer.health <= 0) {
        targetPlayer.health = 0;
        
        // Award points to shooter
        if (gameState.players[data.shooter]) {
          gameState.players[data.shooter].score += 100;
        }
        
        // Broadcast player death
        io.emit('playerDeath', {
          victim: data.targetId,
          killer: data.shooter,
          timestamp: Date.now()
        });
        
        // Respawn player after delay
        setTimeout(() => {
          if (gameState.players[data.targetId]) {
            gameState.players[data.targetId].health = 100;
            gameState.players[data.targetId].position = { x: 0, y: 1, z: 0 };
            
            io.emit('playerRespawn', {
              id: data.targetId,
              position: { x: 0, y: 1, z: 0 },
              health: 100
            });
          }
        }, 3000); // 3 second respawn delay
      }
      
      // Broadcast hit event
      io.emit('playerHit', {
        targetId: data.targetId,
        damage: data.damage,
        shooter: data.shooter,
        newHealth: targetPlayer.health,
        timestamp: Date.now()
      });
    }
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

// Maps endpoint - dynamically scan maps directory
app.get('/api/maps', async (req, res) => {
  try {
    const mapsDir = path.join(__dirname, '../public/maps');
    const files = await fs.readdir(mapsDir);
    
    // Filter for .glb files and get their stats
    const mapFiles = [];
    for (const file of files) {
      if (file.toLowerCase().endsWith('.glb')) {
        try {
          const filePath = path.join(mapsDir, file);
          const stats = await fs.stat(filePath);
          
          mapFiles.push({
            name: file.replace('.glb', ''),
            filename: file,
            path: `/maps/${file}`,
            size: stats.size,
            modified: stats.mtime
          });
        } catch (error) {
          console.warn(`Warning: Could not get stats for ${file}:`, error.message);
        }
      }
    }
    
    // Sort by modification time (newest first)
    mapFiles.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    
    res.json({
      success: true,
      maps: mapFiles,
      count: mapFiles.length
    });
    
  } catch (error) {
    console.error('Error scanning maps directory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scan maps directory',
      maps: [],
      count: 0
    });
  }
});

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