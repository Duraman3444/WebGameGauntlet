# Three.js Multiplayer Game - GLB/GLTF Integration Guide

## Overview
This guide explains how to use GLB/GLTF 3D models from Sketchfab and other sources to load custom maps into your Three.js multiplayer game.

## Supported Map Types
The system has built-in scaling profiles for these classic maps:

### Call of Duty Maps
- **Shipment** (`shipment.glb`) - Tight quarters container yard
- **Rust** (`rust.glb`) - Industrial facility with multi-level gameplay
- **Nuketown** (`nuketown.glb`) - Nuclear test suburban environment

### Counter-Strike Maps
- **Dust 2** (`dust2.glb`) - Classic Middle Eastern town
- **Mirage** (`mirage.glb`) - Moroccan-inspired architecture

### Generic Maps
- **Map** (`map.glb`) - Generic map with default scaling
- **Level** (`level.glb`) - Level-specific map
- **Scene** (`scene.glb`) - Scene-based map

## How to Use

### Step 1: Find Maps on Sketchfab
1. Go to [Sketchfab.com](https://sketchfab.com)
2. Search for your desired map (e.g., "Call of Duty Shipment" or "CS Dust2")
3. Look for models with good geometry and reasonable polygon counts
4. Download the model as GLB format

### Step 2: Add to Game
1. Place the GLB file in the `public/maps/` directory
2. Name it according to the map type (e.g., `dust2.glb`, `shipment.glb`)
3. Restart the development server
4. The map will be automatically loaded

### Step 3: Test with Console Commands
Open the browser console (F12) and use these commands:

```javascript
// Get available maps
await gameDebug.getAvailableMaps()

// Load a specific map
await gameDebug.loadMap('/maps/dust2.glb', 'dust2')

// Get current map info
gameDebug.getCurrentMapInfo()

// Clear current map
gameDebug.clearMap()

// Load map from external URL
await gameDebug.loadMapFromUrl('https://example.com/map.glb', 'external-map')
```

## Conversion Process
When you load a map, the system automatically:

1. **Analyzes Geometry** - Processes all mesh objects for rendering
2. **Applies Optimizations** - Optimizes materials and textures for web performance
3. **Generates Collision Meshes** - Creates invisible collision geometry for physics
4. **Sets up Lighting** - Configures shadows and lighting for the 3D environment
5. **Creates Spawn Points** - Generates player spawn locations around the map
6. **Scales and Centers** - Adjusts model size and position for optimal gameplay

## Map Processing Features
Each map is processed with these features:

- **Automatic Scaling**: Models are scaled based on filename and type
- **Collision Detection**: All geometry becomes collidable for physics
- **Shadow Casting**: Proper shadow casting and receiving setup
- **Performance Optimization**: Materials and textures optimized for 60fps gameplay
- **Multiplayer Support**: Spawn points and boundaries for multiplayer gameplay

## Supported Formats
- **GLTF/GLB** (Preferred) - Best compatibility
- **FBX** - Good for complex models
- **OBJ** - Basic geometry support

## Tips for Best Results

### Finding Good Models
- Look for models with clean geometry
- Avoid overly complex models (>100k polygons)
- Check that the model has proper scale
- Prefer models with textures included

### Scale Considerations
- Models are automatically scaled based on map profile
- Shipment: 0.8x scale (smaller, tighter combat)
- Dust2: 1.2x scale (larger, more open)
- Default: 1.0x scale

### Performance Tips
- Use GLTF format when possible
- Models with fewer materials perform better
- Avoid models with excessive detail

## Creating Custom Profiles
You can create custom map profiles by modifying the MapLoader:

```javascript
// Add to availableMaps in MapLoader.js
'custom_map': {
    name: 'Custom Map',
    game: 'Custom Game',
    size: 'medium',
    theme: 'urban',
    description: 'Custom map description',
    stealthProfile: {
        difficulty: 'medium',
        coverDensity: 'high',
        patrolComplexity: 'medium',
        objectiveCount: 4
    }
}
```

## Troubleshooting

### Common Issues
- **CORS Errors**: Sketchfab models may have CORS restrictions
- **Large File Sizes**: Complex models may take time to load
- **Format Issues**: Some OBJ files may not have proper materials

### Solutions
- Use Sketchfab's download API for better access
- Optimize models before loading
- Convert models to GLTF format for best compatibility

## Future Enhancements
- Direct Sketchfab API integration
- Automatic model optimization
- User-generated map profiles
- Multiplayer map sharing

## Example Workflow
1. Find a Shipment recreation on Sketchfab
2. Download as GLB format
3. Rename to `shipment.glb`
4. Place in `public/maps/` directory
5. Restart server - the map loads automatically
6. The system converts it to a multiplayer environment with:
   - Optimized performance for web browsers
   - Collision detection for player movement
   - Proper lighting and shadows
   - Spawn points for multiplayer matches
   - Physics integration for realistic gameplay

This transforms any 3D model into a playable multiplayer map! 