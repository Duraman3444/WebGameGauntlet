# 🎮 Asset Organization Guide

## 📁 Directory Structure

Drop your itch.io assets into these organized folders:

### 🎨 Sprites (`/public/assets/sprites/`)
```
sprites/
├── players/          # Mario character sprites
│   ├── mario-small/  # Small Mario animations
│   ├── mario-big/    # Big Mario animations  
│   ├── mario-fire/   # Fire Mario animations
│   └── mario-star/   # Star Mario animations
├── enemies/          # Enemy sprites
│   ├── goomba/       # Goomba animations
│   ├── koopa/        # Koopa Troopa animations
│   └── piranha/      # Piranha Plant animations
├── blocks/           # Block and platform sprites
│   ├── question/     # Question blocks
│   ├── brick/        # Brick blocks
│   ├── pipe/         # Warp pipes
│   └── platform/     # Platform tiles
├── items/            # Power-ups and collectibles
│   ├── mushroom/     # Super Mushroom
│   ├── fireflower/   # Fire Flower
│   ├── star/         # Super Star
│   └── coin/         # Coin animations
├── backgrounds/      # Background elements
│   ├── sky/          # Sky textures
│   ├── clouds/       # Cloud sprites
│   ├── hills/        # Hill backgrounds
│   └── castle/       # Castle elements
└── effects/          # Visual effects
    ├── explosions/   # Explosion animations
    ├── particles/    # Particle effects
    └── ui/           # UI effect sprites
```

### 🎵 Audio (`/public/assets/audio/`)
```
audio/
├── music/            # Background music
│   ├── overworld.mp3 # Main level theme
│   ├── underground.mp3 # Underground theme
│   └── castle.mp3    # Castle theme
└── sfx/              # Sound effects
    ├── jump.wav      # Jump sound
    ├── coin.wav      # Coin collection
    ├── powerup.wav   # Power-up sound
    ├── stomp.wav     # Enemy stomp
    ├── fireball.wav  # Fireball sound
    └── death.wav     # Player death
```

### 🔤 Fonts (`/public/assets/fonts/`)
```
fonts/
├── mario.ttf         # Mario-style font
└── score.ttf         # Score display font
```

### 🖼️ UI (`/public/assets/ui/`)
```
ui/
├── hud/              # HUD elements
│   ├── health.png    # Health/lives icons
│   ├── score.png     # Score display
│   └── timer.png     # Timer display
├── menus/            # Menu graphics
│   ├── logo.png      # Game logo
│   ├── buttons/      # Button sprites
│   └── backgrounds/  # Menu backgrounds
└── icons/            # Game icons
    ├── player-icons/ # Player indicator icons
    └── item-icons/   # Item/power-up icons
```

## 🎯 Asset Loading

Assets are automatically loaded by the game using these paths:
- Sprites: `assets/sprites/[category]/[name].png`
- Audio: `assets/audio/[music|sfx]/[name].[mp3|wav]`
- Fonts: `assets/fonts/[name].ttf`

## 📝 File Naming Conventions

### Sprites:
- **Static sprites**: `sprite-name.png`
- **Animations**: `sprite-name-frame-01.png`, `sprite-name-frame-02.png`, etc.
- **States**: `mario-small-idle.png`, `mario-small-walk-01.png`, etc.

### Audio:
- **Music**: Use `.mp3` for background music (smaller file size)
- **SFX**: Use `.wav` for sound effects (low latency)
- **Names**: Use descriptive names like `jump.wav`, `coin-collect.wav`

## 🚀 Quick Setup

1. **Download your itch.io assets**
2. **Extract them to your desktop**
3. **Organize them into the folder structure above**
4. **Copy the organized folders to** `public/assets/`
5. **The game will automatically detect and load them**

## 🎮 Supported Formats

### Images:
- ✅ PNG (recommended for sprites)
- ✅ JPG (for backgrounds)
- ✅ GIF (for simple animations)

### Audio:
- ✅ MP3 (music, background audio)
- ✅ WAV (sound effects)
- ✅ OGG (web-optimized audio)

### Fonts:
- ✅ TTF (TrueType fonts)
- ✅ WOFF (web fonts)

---

**💡 Tip**: Start with basic sprites (mario, goomba, blocks) to get the game running, then add more detailed assets during the polish phase! 