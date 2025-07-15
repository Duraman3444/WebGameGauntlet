# Web Game Gauntlet - 3D Multiplayer Game

A real-time 3D multiplayer web game built with Three.js and Socket.io. Players can join together in a shared 3D environment, collect items, and compete in various game modes.

## 🎮 Features

- **Real-time 3D Multiplayer**: Up to 8 players per room
- **First-Person Controls**: WASD movement + mouse look with pointer lock
- **Collectible System**: Gather golden items to increase your score
- **Room System**: Create and join private or public game rooms
- **Live Chat**: Communicate with other players (feature ready)
- **Responsive UI**: Modern web interface with real-time updates
- **Cross-Platform**: Works on desktop and mobile browsers

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WebGameGauntlet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3003`
   - The game runs in offline mode (no multiplayer needed)

### Production Build

```bash
npm run build
npm start
```

## 🎯 How to Play

1. **Join the Game**: Open the game in your browser
2. **Get Control**: Click anywhere to enable mouse look controls
3. **Move**: Use WASD keys to move around
4. **Look**: Move your mouse to look around (first-person view)
5. **Jump**: Press Spacebar to jump
6. **Collect**: Walk into golden collectibles to increase your score
7. **Compete**: See other players in real-time and compete for the highest score

## 🏗️ Project Structure

```
WebGameGauntlet/
├── src/
│   ├── client/                 # Frontend (Three.js)
│   │   ├── game/
│   │   │   ├── Game.js         # Main game controller
│   │   │   ├── Player.js       # Player controls and rendering
│   │   │   ├── Environment.js  # 3D world and objects
│   │   │   └── NetworkManager.js # Socket.io client
│   │   ├── index.html          # Main HTML file
│   │   └── main.js            # Entry point
│   └── server/                 # Backend (Node.js + Socket.io)
│       ├── game/
│       │   └── GameManager.js  # Server-side game logic
│       ├── rooms/
│       │   └── RoomManager.js  # Room management
│       └── server.js          # Express + Socket.io server
├── assets/                    # Game assets (sprites, audio, etc.)
├── public/                    # Static files
├── dist/                      # Production build
├── package.json
├── vite.config.js            # Vite configuration
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **Three.js** - 3D graphics and rendering
- **Socket.io-client** - Real-time communication
- **Vite** - Fast development server and build tool
- **Modern ES6+** - JavaScript features

### Backend
- **Node.js** - Server runtime
- **Express** - Web framework
- **Socket.io** - Real-time websocket communication
- **UUID** - Unique ID generation

## 🎨 Game Features

### Player System
- First-person 3D movement with physics
- Smooth mouse look controls
- Jump mechanics with gravity
- Collision detection
- Health system (extendable)

### Multiplayer
- Real-time position synchronization
- Player spawn management
- Room-based gameplay
- Automatic cleanup of inactive players

### Game World
- 3D environment with obstacles and platforms
- Collectible items with animations
- Boundary walls and collision systems
- Dynamic lighting and shadows

## 🚧 API Endpoints

- `GET /api/health` - Server health check
- `GET /api/stats` - Game statistics
- `GET /` - Serve game client

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server (client + server)
- `npm run client:dev` - Start only client development server
- `npm run server:dev` - Start only server with auto-reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm start` - Start production server

### Development Workflow

1. **Client Development**: Edit files in `src/client/`
2. **Server Development**: Edit files in `src/server/`
3. **Assets**: Add game assets to `assets/` folder
4. **Testing**: Open multiple browser tabs for multiplayer testing

## 🎮 Controls

| Key | Action |
|-----|--------|
| W | Move Forward |
| S | Move Backward |
| A | Move Left |
| D | Move Right |
| Space | Jump |
| Mouse | Look Around |
| Click | Enable Mouse Look |
| ESC | Release Mouse Look |

## 🔮 Future Enhancements

- [ ] Sound effects and background music
- [ ] Power-ups and special items
- [ ] Different game modes (races, battles, etc.)
- [ ] Player customization and avatars
- [ ] Leaderboards and statistics
- [ ] Mobile touch controls
- [ ] Voice chat integration
- [ ] Map editor
- [ ] Tournament system

## 🐛 Known Issues

- Server needs to be running for the game to work
- Mobile controls need optimization
- Some browsers may have WebGL compatibility issues

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Three.js community for excellent documentation
- Socket.io team for real-time communication tools
- Game asset creators for sprites and audio files

---

**Happy Gaming! 🎮** 