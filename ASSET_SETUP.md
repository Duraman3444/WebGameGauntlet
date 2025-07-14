# 🎮 Where to Drop Your Itch.io Assets

## 📁 Asset Directory (READY FOR YOUR FILES!)

Your asset folders are already created! Just drop your files here:

```
WebGameGauntlet/
└── public/
    └── assets/            👈 DROP YOUR ITCH.IO ASSETS HERE!
        ├── sprites/
        │   ├── players/   👈 Mario character sprites
        │   ├── enemies/   👈 Goomba, Koopa, Piranha sprites  
        │   ├── blocks/    👈 Question blocks, brick blocks
        │   ├── items/     👈 Mushroom, Fire Flower, Star, Coins
        │   ├── backgrounds/ 👈 Sky, clouds, hills
        │   └── effects/   👈 Explosions, particles
        ├── audio/
        │   ├── music/     👈 Background music (.mp3)
        │   └── sfx/       👈 Sound effects (.wav)
        ├── fonts/         👈 Mario-style fonts
        └── ui/            👈 Menu graphics, buttons
```

## 🚀 Quick Asset Setup

1. **Extract your itch.io download** (zip file)
2. **Open the assets folders** in Finder/Explorer
3. **Drag and drop files** into the matching folders above
4. **Restart the game** (`npm run dev`)

## 🎯 Priority Assets (Get These First!)

### Essential Sprites:
- `players/mario-small.png` - Small Mario sprite
- `enemies/goomba.png` - Goomba enemy
- `blocks/ground.png` - Ground platform
- `blocks/question.png` - Question block
- `items/coin.png` - Coin sprite

### Essential Audio:
- `music/overworld.mp3` - Main level music
- `sfx/jump.wav` - Jump sound effect
- `sfx/coin.wav` - Coin collection sound

## 📝 File Naming Tips

### Good Names:
- ✅ `mario-small-idle.png`
- ✅ `mario-small-walk-01.png`
- ✅ `goomba-walk-01.png`
- ✅ `question-block.png`
- ✅ `coin-spin-01.png`

### Avoid:
- ❌ `sprite_123.png`
- ❌ `mario (1).png`
- ❌ `untitled.png`

## 🔧 Supported Formats

### Images:
- **PNG** (recommended) - Transparent backgrounds
- **JPG** - For backgrounds without transparency  
- **GIF** - Simple animations

### Audio:
- **MP3** - Background music (smaller files)
- **WAV** - Sound effects (better quality, low latency)
- **OGG** - Web-optimized audio

## 💡 Pro Tips

1. **Start Simple**: Add basic Mario + Goomba sprites first
2. **Test Early**: Run the game after adding each asset type
3. **Organize**: Keep similar sprites in the same subfolder
4. **Backup**: Keep your original itch.io files safe!

---

**✨ Once your assets are in place, the game will automatically detect and use them!** 🍄 