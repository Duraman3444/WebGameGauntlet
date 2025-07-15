# Maps Directory - GLB/GLTF 3D Model Support

This directory contains 3D models that can be loaded as playable maps in the Three.js multiplayer game.

## 📁 Supported File Formats

- **GLB** (Binary GLTF) - ✅ **Recommended** for best performance
- **GLTF** (JSON GLTF) - ✅ Supported with external assets
- **OBJ** - ⚠️ Limited support (geometry only)

## 🎮 How to Add Maps

### Step 1: Prepare Your 3D Model

1. **Scale**: Ensure your model is appropriately sized (100-500 units recommended)
2. **Optimization**: Keep polygon count under 100,000 for smooth performance
3. **Textures**: Include all textures in GLB file or use external files for GLTF
4. **Origin**: Position your model at (0, 0, 0) for proper centering

### Step 2: Naming Convention

Use one of these filenames for automatic detection:
- `map.glb` - Generic map
- `level.glb` - Level-specific map
- `scene.glb` - Scene-based map
- `dust2.glb` - Counter-Strike Dust2 map
- `shipment.glb` - Call of Duty Shipment map
- `nuketown.glb` - Call of Duty Nuketown map

### Step 3: Place in Directory

1. Copy your GLB file to this directory (`public/maps/`)
2. Restart the development server (`npm run dev`)
3. The map will be automatically detected and loaded

## 🚀 Testing Your Map

### Browser Console Commands

Open your browser's developer console (F12) and use these commands:

```javascript
// Get list of available maps
await gameDebug.getAvailableMaps()

// Load a specific map
await gameDebug.loadMap('/maps/your-map.glb', 'your-map')

// Get current map information
gameDebug.getCurrentMapInfo()

// Clear current map
gameDebug.clearMap()

// Load map from external URL
await gameDebug.loadMapFromUrl('https://example.com/map.glb', 'external-map')
```

### Testing Checklist

- [ ] Map loads without errors
- [ ] Model appears at correct scale
- [ ] Textures render properly
- [ ] Collision detection works
- [ ] Performance is smooth (60fps)
- [ ] Lighting looks appropriate

## 📊 Map Specifications

### Performance Guidelines

| Aspect | Recommendation | Maximum |
|--------|----------------|---------|
| Polygons | < 50,000 | 100,000 |
| Textures | 1024x1024 | 2048x2048 |
| Materials | < 10 | 20 |
| File Size | < 10MB | 50MB |

### Scale Guidelines

| Map Type | Scale Factor | Size Range |
|----------|--------------|------------|
| Small (Shipment) | 0.08 | 50-100 units |
| Medium (Nuketown) | 0.10 | 100-200 units |
| Large (Dust2) | 0.12 | 200-500 units |

## 🛠️ Map Creation Tips

### Recommended Tools

- **Blender** (Free, open-source)
- **Maya** (Professional)
- **3ds Max** (Professional)
- **Sketchfab** (Online models)

### Export Settings

#### Blender GLB Export:
```
Format: GLB
Include: Selected Objects
Transform: +Y Up
Geometry: Apply Modifiers
Materials: Export
Textures: Auto
Compression: Draco (optional)
```

#### Optimization Tips:
- Use baked lighting for better performance
- Combine similar materials
- Use texture atlases when possible
- Remove unnecessary geometry
- Use LOD (Level of Detail) if available

## 🎯 Map Features

### Automatic Processing

When a map is loaded, the system automatically:

1. **Scales** the model based on filename/type
2. **Centers** the model at origin (0, 0, 0)
3. **Optimizes** materials for web performance
4. **Generates** collision meshes for physics
5. **Sets up** shadow casting/receiving
6. **Creates** spawn points around the map

### Collision Detection

- All mesh geometry becomes collidable
- Invisible collision meshes are generated
- Players can walk on all surfaces
- Proper physics interactions

### Lighting Integration

- Existing lighting is preserved
- Shadows are enabled automatically
- Materials are optimized for performance
- Atmospheric effects are applied

## 🔧 Troubleshooting

### Common Issues

**Map doesn't load:**
- Check console for error messages
- Verify file format is supported
- Ensure file is in correct directory
- Check file permissions

**Performance issues:**
- Reduce polygon count
- Optimize textures
- Use simpler materials
- Enable compression

**Incorrect scale:**
- Adjust scale factor in MapLoader.js
- Re-export with correct units
- Use scale commands in console

**Missing textures:**
- Ensure textures are embedded in GLB
- Check texture paths in GLTF
- Use absolute paths for external assets

### Debug Information

Enable detailed logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true')
location.reload()
```

## 📁 Example File Structure

```
public/maps/
├── README.md (this file)
├── map.glb (your main map)
├── dust2.glb (Counter-Strike map)
├── shipment.glb (Call of Duty map)
└── level.glb (custom level)
```

## 🌐 External Resources

### Free 3D Models
- [Sketchfab](https://sketchfab.com) - Large collection of 3D models
- [Poly](https://poly.google.com) - Google's 3D model library
- [TurboSquid](https://turbosquid.com) - Professional 3D models

### Game Maps
- [GameBanana](https://gamebanana.com) - Game mod community
- [MapCore](https://mapcore.org) - Level design community
- [Valve Developer Wiki](https://developer.valvesoftware.com) - Source engine maps

### Tools
- [Blender](https://blender.org) - Free 3D modeling software
- [GLTF Validator](https://github.khronos.org/glTF-Validator/) - Validate GLB files
- [Three.js Editor](https://threejs.org/editor/) - Online 3D editor

---

**Ready to create amazing maps! 🎮** Drop your GLB files here and start playing! 