# 🎮 Fruit Runners - Godot Platformer Game

A 2D platformer game built with Godot Engine, featuring fruit collection mechanics and multiple characters.

## 📁 Project Structure

```
WebGameGauntlet/
├── assets/                    # All game assets (sprites, audio, fonts, etc.)
│   ├── audio/                 # Sound effects and music
│   ├── sprites/               # Character and enemy sprites
│   ├── levels/                # Level tilesets and backgrounds
│   ├── ui/                    # Menu and HUD elements
│   ├── fonts/                 # Game fonts
│   └── ...
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites
- [Godot Engine 4.x](https://godotengine.org/download) installed
- Basic understanding of Godot and GDScript

### Setting Up the Project
1. Open Godot Engine
2. Click "Import" and navigate to this project folder
3. Select the project folder and click "Import & Edit"
4. Godot will create the necessary project files

### 🎨 Available Assets

#### Character Sprites
- **Main Characters**: Pink Man, Mask Dude, Ninja Frog, Virtual Guy, etc.
- **Animations**: Idle, Run, Jump, Fall, Double Jump, Wall Jump, Hit
- **Format**: 32x32 pixel sprites

#### Enemy Sprites
- **Types**: Flying Eye, Goblin, Mushroom, Skeleton, Slime, Worm
- **Animations**: Attack, Death, Hit animations
- **Format**: Various sizes, animation strips included

#### Collectibles
- **Fruits**: Apple, Banana, Cherries, Kiwi, Melon, Orange, Pineapple, Strawberry
- **Format**: Individual PNG files

#### Level Assets
- **Backgrounds**: Multiple colored backgrounds
- **Tilesets**: Terrain, decorations, platforms
- **Traps**: Spikes, saws, trampolines
- **Objects**: Boxes, checkpoints, doors

#### Audio
- **Music**: Adventure background music
- **SFX**: Jump, coin collection, hurt sounds, explosions

#### UI Elements
- **Menu**: Buttons, level selection, text elements
- **HUD**: Health bars, coin counters, score displays

## 🎯 Game Features to Implement

### Core Mechanics
- [ ] Player movement (run, jump, double jump)
- [ ] Fruit collection system
- [ ] Enemy AI and combat
- [ ] Level progression
- [ ] Score and lives system

### Characters
- [ ] Multiple playable characters with unique abilities
- [ ] Character selection screen
- [ ] Different character animations

### Levels
- [ ] Multiple worlds and levels
- [ ] Dynamic fruit spawning
- [ ] Environmental hazards
- [ ] Checkpoints and respawn system

### Audio
- [ ] Background music management
- [ ] Sound effects for actions
- [ ] Volume controls

## 🛠️ Recommended Godot Project Structure

```
res://
├── scenes/
│   ├── Main.tscn              # Main game scene
│   ├── Player.tscn            # Player character
│   ├── Enemy.tscn             # Enemy template
│   ├── Fruit.tscn             # Collectible fruit
│   ├── Level.tscn             # Level template
│   └── UI/
│       ├── MainMenu.tscn      # Main menu
│       ├── GameHUD.tscn       # In-game HUD
│       └── PauseMenu.tscn     # Pause menu
├── scripts/
│   ├── Player.gd              # Player controller
│   ├── Enemy.gd               # Enemy AI
│   ├── GameManager.gd         # Game state management
│   └── AudioManager.gd        # Audio system
├── assets/                    # Import all assets here
└── project.godot              # Project configuration
```

## 📝 Development Tips

### Asset Import Settings
- **Sprites**: Import as Texture2D, disable Filter for pixel art
- **Audio**: Import music as OGG, SFX as WAV
- **Fonts**: Import as FontFile resources

### Animation Setup
- Use AnimationPlayer nodes for character animations
- Create separate animations for each character state
- Use AnimationTree for complex state machines

### Physics
- Use RigidBody2D for physics-based objects
- Use CharacterBody2D for player controller
- Set up collision layers and masks properly

## 🎮 Controls (Suggested)
- **Movement**: Arrow keys or WASD
- **Jump**: Space or Up arrow
- **Action**: Enter or Z key
- **Pause**: Escape key

## 🔧 Next Steps

1. **Create the project in Godot**
2. **Import all assets** from the assets folder
3. **Create basic player controller** with movement and jumping
4. **Build a simple level** with platforms and collectibles
5. **Add enemy behavior** and collision detection
6. **Implement game UI** and menus
7. **Add audio and visual effects**
8. **Create level progression system**

## 📚 Resources

- [Godot Documentation](https://docs.godotengine.org/)
- [GDScript Language Reference](https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/index.html)
- [2D Platformer Tutorial](https://docs.godotengine.org/en/stable/tutorials/2d/2d_movement.html)

---

**Happy coding! 🚀** 