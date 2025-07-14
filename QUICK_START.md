# 🚀 Fruit Runners - Quick Start Guide

Get up and running with **Fruit Runners** in minutes! This guide will help you set up the development environment and start playing the game.

## ⚡ Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Git** for version control

## 🏃‍♂️ Quick Setup (2 minutes)

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd WebGameGauntlet

# Install dependencies
npm install
```

### 2. Start Development Server
```bash
# Start the game
npm run dev

# Server will start on http://localhost:5173
```

### 3. Play the Game!
- Open your browser to `http://localhost:5173`
- Click **"Start Game"** to begin your platforming adventure
- Use **WASD** or **Arrow Keys** to move, **SPACE** to jump

## 🎮 Game Controls

| Action | Keys | Description |
|--------|------|-------------|
| **Move** | `A/D` or `←/→` | Move left and right |
| **Jump** | `W`, `SPACE`, or `↑` | Jump (press again for double jump) |
| **Wall Slide** | Hold direction against wall | Slide down walls slowly |
| **Wall Jump** | Jump while wall sliding | Jump away from walls |
| **Restart** | `R` | Restart current level |
| **Pause** | `ESC` | Pause/resume game |

## 🔧 Development Features

### Asset Loading System
The game includes a comprehensive asset management system:

- **✅ Automatic Fallbacks**: Missing assets are replaced with colorful placeholders
- **🔍 Debug Logging**: Detailed console output shows asset loading progress
- **📊 Asset Verification**: Built-in tools to check for missing files

### Debug Console
Open browser dev tools (F12) and look for:
- ✅ = Asset loaded successfully
- ❌ = Required asset failed to load
- ⚠️ = Optional asset missing (using placeholder)
- 🎭 = Animation system messages
- 🏗️ = Level construction progress

### Asset Verification
Run in browser console to check assets:
```javascript
AssetVerifier.verifyAssets().then(result => {
  console.log('Assets found:', result.found.length);
  console.log('Assets missing:', result.missing.length);
});
```

## 📁 Project Structure

```
WebGameGauntlet/
├── src/
│   ├── game/
│   │   ├── scenes/          # Game scenes (Menu, Game)
│   │   ├── entities/        # Game objects (Player, Trap)
│   │   ├── systems/         # Game systems (LevelSystem)
│   │   └── config/          # Game configuration
│   ├── stores/              # State management
│   ├── utils/               # Utilities (logger, assetVerifier)
│   └── api/                 # Network communication
├── public/assets/           # Game assets
│   ├── sprites/
│   │   ├── players/         # Character spritesheets
│   │   ├── items/           # Collectibles (fruits, boxes)
│   │   ├── traps/           # Hazards and interactive elements
│   │   ├── terrain/         # Level tiles and platforms
│   │   └── menu/            # UI elements
│   └── levels/              # Level-specific assets
└── server/                  # Multiplayer server
```

## 🎯 Game Features

### Characters
- **🌸 Pink Man** - The agile main character (Player 1)
- **🎭 Mask Dude** - The mysterious warrior (Player 2)
- **🐸 Ninja Frog** - The swift amphibian (Player 3)
- **🤖 Virtual Guy** - The digital hero (Player 4)

### Gameplay Elements
- **🚀 Double Jumping** - Enhanced mobility in mid-air
- **🧗 Wall Mechanics** - Slide down walls and jump off them
- **🍎 Fruit Collection** - 8 different fruits to collect for points
- **📦 Breakable Boxes** - Smash boxes for rewards
- **⚡ Traps & Hazards** - Spikes, fire, saws, trampolines, falling platforms
- **🏁 Checkpoints** - Save progress at strategic locations

### Level Design
- **Mario 1-1 Inspired** - Classic platformer layout with modern mechanics
- **4032px World** - Expansive side-scrolling adventure
- **Progressive Difficulty** - Increasing challenges as you advance

## 🌐 Multiplayer Setup (Optional)

### Start the Server
```bash
# In a separate terminal
cd server
npm install
npm start

# Server runs on http://localhost:3001
```

### Features
- **Real-time Multiplayer** - Up to 4 players simultaneously
- **Character Assignment** - Automatic character selection
- **Shared World** - All players interact with the same level
- **Synchronized Actions** - Fruit collection, box breaking, trap triggers

## 🐛 Troubleshooting

### Common Issues

**Game not loading?**
- Check console for errors (F12 → Console)
- Verify Node.js version: `node --version`
- Clear browser cache and refresh

**Assets not displaying?**
- Check console for asset loading messages
- Missing assets will show colorful placeholders
- Use `AssetVerifier.verifyAssets()` to check missing files

**Characters appear as rectangles?**
- Character spritesheets are missing or failed to load
- Look for "❌ Texture [character]_idle not found" in console
- Game will use placeholder graphics automatically

**No animations playing?**
- Spritesheets may be single-frame images
- Check for "Animation creation complete!" in console
- Fallback texture swapping will be used

**Performance issues?**
- Close other browser tabs
- Check for console errors
- Verify 60fps target in game settings

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Check TypeScript errors
npm run type-check       # Type checking only

# Server
cd server && npm start   # Start multiplayer server
```

## 📊 Performance Notes

- **Optimized Physics**: Static bodies for platforms, dynamic for players
- **Efficient Rendering**: Proper sprite management and collision detection
- **Asset Fallbacks**: No crashes from missing assets
- **60fps Target**: Smooth gameplay experience
- **Memory Management**: Proper cleanup and object pooling

## 🎨 Asset Integration

### Adding Your Own Assets
1. Place assets in appropriate `public/assets/` subdirectories
2. Follow the existing naming conventions
3. Use `encodeURI()` for filenames with spaces
4. Test with AssetVerifier to ensure proper loading

### Asset Structure
```
public/assets/sprites/
├── players/Main Characters/
│   ├── Pink Man/
│   │   ├── Idle (32x32).png
│   │   ├── Run (32x32).png
│   │   └── Jump (32x32).png
│   └── ...
├── items/
│   ├── Fruits/
│   │   ├── Apple.png
│   │   └── Bananas.png
│   └── Boxes/
│       └── Box1.png
└── traps/
    ├── Spikes/Idle.png
    └── Fire/On (16x32).png
```

## 🚀 Next Steps

1. **Play the Game** - Test all mechanics and features
2. **Check Console** - Monitor asset loading and debug messages
3. **Add Assets** - Enhance visuals with your own sprite files
4. **Test Multiplayer** - Start server and play with friends
5. **Customize Levels** - Modify game configuration for new challenges

## 📞 Support

- **Console Debugging**: Use F12 → Console for detailed error messages
- **Asset Verification**: Run `AssetVerifier.verifyAssets()` in browser console
- **Performance Monitoring**: Check for 60fps and memory usage
- **Network Issues**: Verify server is running on port 3001

---

**🍓 Ready to start your platforming adventure? The game is fully playable with or without custom assets!**

**Happy Gaming! 🎮** 