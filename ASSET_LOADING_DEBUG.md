# Asset Loading Debug Guide

## 🔧 Debugging Features Added

### 1. Comprehensive Logging System
- **MenuScene**: Detailed asset loading progress with emojis
- **Player**: Animation creation and texture loading logs
- **LevelSystem**: Sprite creation and texture validation logs
- **AssetVerifier**: Pre-load asset existence verification

### 2. Asset Organization
- Moved assets to consistent lowercase directories:
  - `assets/sprites/players/Main Characters/`
  - `assets/sprites/items/Fruits/` & `assets/sprites/items/Boxes/`
  - `assets/sprites/traps/` (lowercase)
  - `assets/sprites/terrain/` (lowercase)
  - `assets/sprites/menu/` (lowercase)
  - `assets/levels/stringstar_fields/` (new level assets)

### 3. Path Encoding
- All paths with spaces/parentheses use `encodeURI()`
- Fixes 404 errors for files like `"On (16x32).png"`

### 4. Error Handling
- Fallback to placeholders when real assets fail
- Detailed error messages with file paths
- Distinction between required and optional assets

## 🚀 How to Use

### Check Console Logs
1. Open browser dev tools (F12)
2. Go to Console tab
3. Look for asset loading messages:
   - ✅ = Successfully loaded
   - ❌ = Failed to load (required)
   - ⚠️ = Missing optional asset

### Asset Verification
Run in browser console:
```javascript
AssetVerifier.verifyAssets().then(result => {
  console.log('Verification complete:', result);
});
```

### Debug Player Animations
Look for these log messages:
- `🎭 Player.createAnimations() called`
- `🎭 Creating animations for all characters...`
- `✅ Creating animation pinkman_idle with X frames`
- `❌ Animation pinkman_run not found, falling back to texture swap`

### Debug Level Sprites
Look for these log messages:
- `🏗️ Creating platform: ground at (0, 544) size 832x32`
- `📦 Creating box: box1 at (512, 320)`
- `🍎 Creating fruit: apple at (256, 450)`
- `❌ Fruit texture apple not found`

## 📁 Expected Asset Structure

```
public/assets/
├── sprites/
│   ├── players/
│   │   └── Main Characters/
│   │       ├── Pink Man/
│   │       │   ├── Idle (32x32).png
│   │       │   ├── Run (32x32).png
│   │       │   └── ...
│   │       └── ...
│   ├── items/
│   │   ├── Fruits/
│   │   │   ├── Apple.png
│   │   │   ├── Bananas.png
│   │   │   └── ...
│   │   └── Boxes/
│   │       ├── Box1.png
│   │       └── ...
│   ├── traps/
│   │   ├── Spikes/
│   │   ├── Fire/
│   │   └── ...
│   ├── terrain/
│   │   └── Terrain (16x16).png
│   └── menu/
│       └── Buttons/
│           ├── Play.png
│           └── ...
└── levels/
    └── stringstar_fields/
        ├── background_0.png
        ├── tileset.png
        └── ...
```

## 🔍 Common Issues & Solutions

### Issue: Character sprites not loading
**Symptoms**: Players appear as colored rectangles
**Debug**: Look for `❌ Texture pinkman_idle not found`
**Solution**: Check `assets/sprites/players/Main Characters/Pink Man/Idle (32x32).png` exists

### Issue: Fruits/boxes not visible
**Symptoms**: Invisible collectibles
**Debug**: Look for `❌ Fruit texture apple not found`
**Solution**: Verify `assets/sprites/items/Fruits/Apple.png` exists

### Issue: Terrain appears as solid color
**Symptoms**: Platforms are single-colored rectangles
**Debug**: Look for `❌ terrain_tileset texture not found`
**Solution**: Check `assets/sprites/terrain/Terrain (16x16).png` exists

### Issue: Animations not playing
**Symptoms**: Characters don't animate
**Debug**: Look for `❌ Animation pinkman_run not found, falling back to texture swap`
**Solution**: Ensure spritesheets loaded correctly and have multiple frames

## 🎯 Next Steps

1. **Run the game** and check console for errors
2. **Use AssetVerifier** to get missing assets report
3. **Add missing assets** to correct directories
4. **Test character animations** by moving around
5. **Verify collision works** with platforms/boxes/fruits

## 📊 Performance Notes

- Placeholders are generated for missing assets (no crashes)
- Asset verification runs before loading (catches issues early)
- Proper static bodies used for platforms (better collision)
- Fruits have gravity disabled (stay in place)

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Check for TypeScript errors
npm run build

# View in browser
http://localhost:5173
```

The comprehensive logging system will help identify exactly which assets are missing and why sprites aren't loading properly! 