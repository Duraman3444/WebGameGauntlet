# Maps Assets Folder

This folder is for storing your custom 3D map files.

## Supported Formats
- `.gltf` - Recommended for web (with textures)
- `.glb` - Binary GLTF format
- `.fbx` - Autodesk format
- `.obj` - Wavefront format

## How to Use

1. **Drop your map files here** with one of these common names:
   - `map.gltf` / `map.glb` / `map.fbx` / `map.obj`
   - `scene.gltf` / `scene.glb` / `scene.fbx` / `scene.obj`
   - `model.gltf` / `model.glb` / `model.fbx` / `model.obj`
   - `level.gltf` / `level.glb` / `level.fbx` / `level.obj`

2. **Restart the game** and they will automatically appear in the map selection screen

3. **The game will automatically convert** your map into a stealth environment with:
   - 🕵️ Enemy patrols
   - 🔒 Security cameras & lasers
   - 🎯 Mission objectives
   - 🌑 Stealth lighting

## Example
If you have a map called `dust2.gltf`, rename it to `map.gltf` and place it here.
The game will detect it and show it in the map selection as "map". 