# Assets Directory

This directory contains all the 3D models, textures, and animations for the third-person shooter game.

## Structure:
- `characters/` - Character models (GLB/GLTF format)
- `weapons/` - Weapon models (GLB/GLTF format)
- `animations/` - Animation files (GLB/GLTF format)
- `textures/` - Texture files (PNG/JPG format)

## Character Models:
Place these GLB files in the `characters/` folder:
- soldier.glb - Balanced character (Green colored fallback)
- sniper.glb - Long-range specialist (Blue colored fallback)  
- assault.glb - Fast assault character (Red colored fallback)
- medic.glb - Support character (Orange colored fallback)

## Weapon Models:
Place these GLB files in the `weapons/` folder:
- assault_rifle.glb - Standard assault rifle
- sniper_rifle.glb - Long-range sniper rifle
- shotgun.glb - Close-range shotgun
- pistol.glb - Sidearm pistol

## Animation Files:
Place these GLB files in the `animations/` folder:
- idle.glb - Character idle animation
- walk.glb - Walking animation
- run.glb - Running animation
- shoot.glb - Shooting animation
- reload.glb - Weapon reload animation
- death.glb - Death animation

## Fallback System:
If GLB files are not found, the system will automatically create colored placeholder meshes:
- Characters: Box geometry with character-specific colors
- Weapons: Box geometry with weapon-specific colors
- The game will still function normally with these placeholders

## Supported Formats:
- GLB (recommended) - Binary glTF format
- GLTF - Text-based glTF format
- Textures: PNG, JPG

## Creating Assets:
1. Use Blender, Maya, or other 3D software
2. Export models as GLB format
3. Keep file sizes reasonable for web (under 5MB per model)
4. Include materials and textures in the GLB file
5. Test assets in the game before finalizing

## Testing:
The asset management system will log loading status to the browser console:
- ✅ Successfully loaded assets
- ⚠️ Failed to load assets (using fallback)
