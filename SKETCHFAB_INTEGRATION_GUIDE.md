# Sketchfab Integration Guide

## Overview
This guide explains how to use Sketchfab models to load iconic multiplayer maps from classic games and convert them into stealth environments.

## Supported Maps
The system has built-in profiles for these classic maps:

### Call of Duty Maps
- **Shipment** (`cod_shipment`) - Tight quarters container yard
- **Rust** (`cod_rust`) - Industrial facility with multi-level gameplay
- **Nuketown** (`cod_nuketown`) - Nuclear test suburban environment

### Counter-Strike Maps
- **Dust 2** (`cs_dust2`) - Classic Middle Eastern town
- **Mirage** (`cs_mirage`) - Moroccan-inspired architecture

## How to Use

### Step 1: Find Maps on Sketchfab
1. Go to [Sketchfab.com](https://sketchfab.com)
2. Search for your desired map (e.g., "Call of Duty Shipment" or "CS Dust2")
3. Look for models with good geometry and reasonable polygon counts
4. Copy the Sketchfab URL

### Step 2: Load the Map
Open the browser console (F12) and use the debug commands:

```javascript
// Get available map profiles
debugGame.getAvailableMaps();

// Load a map from Sketchfab
debugGame.loadMap('https://sketchfab.com/3d-models/...', 'cod_shipment');

// Check current map
debugGame.getCurrentMap();

// Clear current map
debugGame.clearMap();
```

### Step 3: Test Local Files
If you have downloaded 3D models locally:

```javascript
// Load local file (must be in public folder)
debugGame.loadLocalMap('/models/shipment.gltf', 'cod_shipment');
```

## Conversion Process
When you load a map, the system automatically:

1. **Analyzes Geometry** - Identifies cover spots, patrol routes, and objective locations
2. **Applies Stealth Lighting** - Reduces ambient light and adds strategic shadows
3. **Adds Security Elements** - Places cameras, laser grids, and alarm systems
4. **Creates Patrol Routes** - Generates enemy movement patterns
5. **Places Objectives** - Distributes mission objectives throughout the map

## Map Profiles
Each map has a stealth profile that controls:

- **Difficulty**: Easy, Medium, Hard
- **Cover Density**: How much cover is available
- **Patrol Complexity**: How sophisticated enemy AI routes are
- **Objective Count**: Number of mission objectives

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
2. Copy the URL
3. Load with `debugGame.loadMap(url, 'cod_shipment')`
4. The system converts it to a stealth environment with:
   - Patrolling guards around containers
   - Security cameras on elevated positions
   - Laser grids between containers
   - Objectives hidden in strategic locations
   - Atmospheric lighting for stealth gameplay

This transforms the classic fast-paced multiplayer map into a tense stealth experience! 