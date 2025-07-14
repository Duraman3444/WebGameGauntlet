# Fruit Runners 🍎🏃‍♂️

A modern 2D platformer game built with React, Vite, and Phaser 3. Experience classic Mario-style gameplay with enhanced mechanics like double-jumping, wall-sliding, and real-time multiplayer support.

## ✨ Features

### Core Gameplay
- **Advanced Movement**: Double-jump, wall-jump, wall-slide mechanics
- **Character Selection**: 4 unique characters (Pink Man, Mask Dude, Ninja Frog, Virtual Guy)
- **Animated Sprites**: Full character animations (idle, run, jump, fall, wall-jump, hit)
- **Collectibles**: Fruits scattered throughout levels for scoring
- **Interactive Elements**: Breakable boxes, checkpoints, and goal flags
- **Hazards & Traps**: Spikes, fire traps, moving saws, trampolines, falling platforms

### Technical Features
- **Real-time Multiplayer**: Socket.io integration for 2-4 players
- **Responsive Design**: Scales properly across different screen sizes
- **Asset Management**: Comprehensive loading system with fallback placeholders
- **Debug Tools**: Extensive logging and asset verification utilities
- **Performance Optimized**: Static physics bodies and efficient rendering

### Level Design
- **Mario 1-1 Inspired**: Classic platformer layout with modern twists
- **4032px World**: Expansive side-scrolling level with varied challenges
- **Strategic Checkpoints**: Save progress at key locations
- **Progressive Difficulty**: Increasing challenge as you advance

## 🎮 Controls

| Action | Keys |
|--------|------|
| Move Left/Right | `A/D` or `←/→` |
| Jump | `W`, `SPACE`, or `↑` |
| Double Jump | Press jump again in mid-air |
| Wall Jump | Hold against wall + jump |
| Wall Slide | Hold direction key against wall while falling |

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd WebGameGauntlet

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Asset Setup
The game includes a comprehensive asset management system:

1. **Automatic Fallbacks**: Missing assets are replaced with colorful placeholders
2. **Debug Logging**: Console shows detailed asset loading progress
3. **Asset Verification**: Built-in utility to check for missing files

#### Expected Asset Structure:
```
public/assets/
├── sprites/
│   ├── players/Main Characters/
│   │   ├── Pink Man/
│   │   ├── Mask Dude/
│   │   ├── Ninja Frog/
│   │   └── Virtual Guy/
│   ├── items/
│   │   ├── Fruits/ (Apple.png, Bananas.png, etc.)
│   │   └── Boxes/ (Box1.png, Box2.png, Box3.png)
│   ├── traps/
│   │   ├── Spikes/, Fire/, Saw/, Trampoline/
│   │   └── Falling Platforms/
│   ├── terrain/Terrain (16x16).png
│   └── menu/Buttons/
└── levels/stringstar_fields/
```

## 🔧 Development

### Debug Tools
The game includes extensive debugging capabilities:

```javascript
// Verify all assets exist
AssetVerifier.verifyAssets().then(result => {
  console.log('Assets found:', result.found.length);
  console.log('Assets missing:', result.missing.length);
});
```

### Console Logging
- ✅ = Asset loaded successfully
- ❌ = Required asset failed to load
- ⚠️ = Optional asset missing (using placeholder)
- 🎭 = Animation system messages
- 🏗️ = Level construction progress

### Build Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # TypeScript checking
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Game Engine**: Phaser 3.70
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Multiplayer**: Socket.io
- **Physics**: Phaser Arcade Physics

### Project Structure
```
src/
├── game/
│   ├── scenes/          # Game scenes (Menu, Game, Lobby)
│   ├── entities/        # Game objects (Player, Trap)
│   ├── systems/         # Game systems (LevelSystem)
│   └── config/          # Game configuration
├── stores/              # State management
├── utils/               # Utilities (logger, assetVerifier)
└── api/                 # Network communication
```

### Key Components
- **MenuScene**: Asset loading, character selection, main menu
- **GameScene**: Core gameplay, collision detection, UI
- **Player**: Character movement, animations, physics
- **LevelSystem**: Level generation, collectibles, hazards
- **AssetVerifier**: Asset existence checking and reporting

## 🎯 Game Mechanics

### Movement System
- **Ground Movement**: 160px/s base speed with drag
- **Jumping**: 400px initial jump, 350px double-jump
- **Wall Mechanics**: 80px/s slide speed, 300px wall-jump
- **Trampoline Boost**: 500px super jump

### Collision System
- **Static Bodies**: Platforms, walls, boxes use static physics
- **Dynamic Bodies**: Players, fruits use dynamic physics
- **Overlap Detection**: Fruits, checkpoints, goal detection
- **Damage System**: Invincibility frames, knockback effects

### Scoring System
- **Fruits**: 100 points each
- **Boxes**: 50 points when broken
- **Time Bonus**: Remaining time × 10 at level completion
- **Lives System**: 3 lives with respawn at checkpoints

## 🌐 Multiplayer

### Features
- **Real-time Sync**: Player positions and actions
- **Character Assignment**: Automatic character selection for players
- **Shared World**: All players interact with same level
- **Network Events**: Fruit collection, box breaking, trap triggers

### Server Setup
```bash
cd server
npm install
npm start  # Starts Socket.io server on port 3001
```

## 🐛 Troubleshooting

### Common Issues

**Assets not loading?**
- Check browser console for detailed error messages
- Verify file paths match exactly (case-sensitive)
- Use AssetVerifier to generate missing assets report

**Characters appear as rectangles?**
- Character spritesheets missing from `assets/sprites/players/Main Characters/`
- Check console for "❌ Texture [character]_idle not found" messages

**No animations playing?**
- Spritesheets loaded but may be single-frame images
- Look for "Animation creation complete!" in console

**Collision issues?**
- Platforms use static bodies for better performance
- Check "Platform created successfully" messages in console

## 🚧 Roadmap

### Phase 1: Core Polish ✅
- [x] Asset loading system with fallbacks
- [x] Character animations and movement
- [x] Level design and collision system
- [x] Debug tools and logging

### Phase 2: Enhanced Features
- [ ] Sound effects and background music
- [ ] Additional levels (Stringstar Fields ready)
- [ ] Particle effects and visual polish
- [ ] Mobile touch controls

### Phase 3: Advanced Systems
- [ ] Level editor
- [ ] Leaderboards and achievements
- [ ] Custom character skins
- [ ] Mod support

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🎮 Play Now!

The game is fully playable with placeholder assets. Real assets enhance the visual experience but aren't required for gameplay. Start the development server and begin your platforming adventure!

---

**Built with ❤️ using modern web technologies** 