# Three.js Multiplayer Game - Game Week Project

A real-time 3D multiplayer web game built with Three.js and Socket.io. Players can join together in a shared 3D environment, explore custom maps, collect items, and compete in various game modes.

## 🎮 Features

- **Real-time 3D Multiplayer**: Multiple players in shared 3D space
- **First-Person Controls**: WASD movement + mouse look with pointer lock
- **Custom Map Loading**: Import GLB/GLTF 3D models as playable maps
- **Collectible System**: Gather items to increase your score
- **Physics System**: Gravity, jumping, and collision detection
- **Live Chat**: Communicate with other players in real-time
- **Dynamic Lighting**: Atmospheric lighting with shadows
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
   - Navigate to `http://localhost:3000`
   - Click anywhere to enable mouse controls
   - Multiple players can join the same game

### Production Build

```bash
npm run build
npm start
```

## 🎯 How to Play

1. **Join the Game**: Open the game in your browser
2. **Enable Controls**: Click anywhere to enable mouse look controls
3. **Move**: Use WASD keys to move around the 3D world
4. **Look**: Move your mouse to look around (first-person view)
5. **Jump**: Press Spacebar to jump over obstacles
6. **Collect**: Walk into golden collectibles to increase your score
7. **Chat**: Press Enter to chat with other players
8. **Compete**: See other players in real-time and compete for the highest score

## 🗺️ Custom Map System

### Supported 3D Formats
- **GLB** (Binary GLTF) - Recommended for best performance
- **GLTF** - JSON format with external assets
- **OBJ** - Basic geometry support

### Loading Custom Maps

1. **Place your 3D model files** in the `public/maps/` directory
2. **Supported filenames**: `map.glb`, `level.glb`, `scene.glb`, or any `.glb` file
3. **The game will automatically detect and load** your custom maps
4. **Maps are converted** into playable environments with:
   - Collision detection
   - Spawn points
   - Lighting optimization
   - Performance optimization

### Map Requirements
- **Scale**: Recommended size 100-500 units
- **Optimization**: Keep polygon count under 100k for best performance
- **Textures**: Include textures in GLB file or use GLTF with external assets
- **Lighting**: Baked lighting preferred for better performance

## 🏗️ Project Structure

```
WebGameGauntlet/
├── client/                     # Frontend (Three.js)
│   ├── index.html             # Main HTML file
│   └── main.js                # Game client with Three.js
├── server/                    # Backend (Node.js + Socket.io)
│   └── index.js               # Express + Socket.io server
├── public/                    # Static assets
│   └── maps/                  # 3D map files (GLB/GLTF)
├── package.json               # Dependencies and scripts
├── vite.config.js            # Vite configuration
└── README.md                 # This file
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

## 🎨 Game Features

### Player System
- First-person 3D movement with physics
- Smooth mouse look controls
- Jump mechanics with gravity
- Collision detection with environment
- Health and score tracking

### Multiplayer
- Real-time position synchronization
- Player spawn management
- Automatic cleanup of inactive players
- Chat system
- Player identification with colors

### 3D Environment
- Dynamic lighting with shadows
- Atmospheric fog and effects
- Collision detection with all objects
- Collectible items with animations
- Custom map support

### Map Loading System
- Automatic GLB/GLTF file detection
- Model optimization for gameplay
- Collision mesh generation
- Lighting setup for imported models
- Performance optimization

## 🚧 API Endpoints

- `GET /health` - Server health check
- `GET /` - Serve game client
- **Socket.io Events:**
  - `gameState` - Initial game state
  - `playerUpdate` - Player position updates
  - `playerJoined` - New player joined
  - `playerLeft` - Player disconnected
  - `chatMessage` - Chat messages

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server (client + server)
- `npm run client:dev` - Start only client development server
- `npm run server:dev` - Start only server with auto-reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm start` - Start production server

### Development Workflow

1. **Client Development**: Edit files in `client/`
2. **Server Development**: Edit files in `server/`
3. **3D Models**: Add GLB/GLTF files to `public/maps/`
4. **Testing**: Open multiple browser tabs for multiplayer testing

### Adding Custom Maps

1. **Create or download** a 3D model in GLB format
2. **Name it** `map.glb`, `level.glb`, or similar
3. **Place it** in the `public/maps/` directory
4. **Restart the server** - the map will be automatically loaded
5. **Test in browser** - the map should render with collision detection

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
| Enter | Chat |
| ESC | Release Mouse Look |

## 🔮 Game Development Features

### Implemented
- ✅ 3D multiplayer environment
- ✅ Real-time player synchronization
- ✅ Physics-based movement
- ✅ Collectible system
- ✅ Chat system
- ✅ Custom map loading
- ✅ Performance optimization

### In Development
- 🔄 Advanced collision detection
- 🔄 Combat system
- 🔄 Power-ups and abilities
- 🔄 Level progression
- 🔄 Mobile controls
- 🔄 Audio system

### Planned Features
- 📋 Tournament system
- 📋 Player customization
- 📋 Voice chat
- 📋 Map editor
- 📋 Different game modes
- 📋 Leaderboards

## 🐛 Known Issues

- Map loading performance depends on model complexity
- Mobile controls need optimization
- Some browsers may have WebGL compatibility issues
- Large GLB files may cause initial loading delays

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with multiple players
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Three.js community for excellent 3D web graphics
- Socket.io team for real-time communication
- GLTF/GLB format creators for efficient 3D model storage
- Game development community for inspiration

## 🎯 Game Week Project Notes

This project demonstrates:
- **Rapid technology adoption** using Three.js from scratch
- **AI-assisted development** for faster learning and implementation
- **Real-time multiplayer** with Socket.io
- **3D graphics programming** with modern web technologies
- **Performance optimization** for smooth gameplay

**Development Timeline**: 7 days from zero Three.js knowledge to functional multiplayer game
**AI Tools Used**: ChatGPT, Cursor AI, and GitHub Copilot for accelerated learning
**Key Learning**: 3D mathematics, WebGL, multiplayer networking, and game physics

---

**Ready to play! 🎮** Open `http://localhost:3000` in your browser after running `npm run dev` 