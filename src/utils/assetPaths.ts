export const ASSET_ROOTS = {
  SPRITES: 'assets/sprites',
  BACKGROUNDS: 'assets/levels/common/Background',
  BACKGROUNDS_ALT: 'assets/levels/common/backgrounds',
  TERRAIN: 'assets/levels/common/terrain',
  TRAPS: 'assets/levels/common/Traps',
  OBJECTS: 'assets/levels/common/objects',
  UI: 'assets/ui',
  LEVELS: 'assets/levels'
};

// Helper functions for common asset paths
export const AssetPaths = {
  // Backgrounds
  background: (name: string) => `${ASSET_ROOTS.BACKGROUNDS}/${name}.png`,
  backgroundAlt: (name: string) => `${ASSET_ROOTS.BACKGROUNDS_ALT}/${name}.png`,
  
  // Terrain
  terrain: (name: string) => `${ASSET_ROOTS.TERRAIN}/${name}`,
  seasonalTileset: (season: string) => `${ASSET_ROOTS.TERRAIN}/Seasonal Tilesets/${season}/Terrain (16 x 16).png`,
  
  // Traps
  trap: (folder: string, file: string) => `${ASSET_ROOTS.TRAPS}/${folder}/${file}`,
  spike: () => `${ASSET_ROOTS.TRAPS}/Spikes/Idle.png`,
  trampoline: () => `${ASSET_ROOTS.TRAPS}/Trampoline/Idle.png`,
  fire: (state: 'off' | 'on') => `${ASSET_ROOTS.TRAPS}/Fire/${state === 'off' ? 'Off.png' : 'On (16x32).png'}`,
  saw: () => `${ASSET_ROOTS.TRAPS}/Saw/On (38x38).png`,
  fallingPlatform: () => `${ASSET_ROOTS.TRAPS}/Falling Platforms/On (32x10).png`,
  
  // Objects
  object: (folder: string, file: string) => `${ASSET_ROOTS.OBJECTS}/${folder}/${file}`,
  fruit: (name: string) => `${ASSET_ROOTS.OBJECTS}/Fruits/${name}.png`,
  box: (type: string) => `${ASSET_ROOTS.OBJECTS}/Boxes/${type}/Idle.png`,
  checkpoint: () => `${ASSET_ROOTS.OBJECTS}/Checkpoints/Checkpoint/Checkpoint (Flag Idle)(64x64).png`,
  
  // UI
  ui: (folder: string, file: string) => `${ASSET_ROOTS.UI}/${folder}/${file}`,
  menuButton: (name: string) => `${ASSET_ROOTS.UI}/Menu/Buttons/${name}.png`,
  
  // Sprites (characters, weapons, etc.)
  sprite: (folder: string, file: string) => `${ASSET_ROOTS.SPRITES}/${folder}/${file}`,
  player: (character: string, animation: string) => `${ASSET_ROOTS.SPRITES}/players/Main Characters/${character}/${animation} (32x32).png`,
  enemy: (name: string) => {
    // Handle different enemy types
    if (['slime_green', 'slime_purple', 'knight'].includes(name)) {
      return `${ASSET_ROOTS.SPRITES}/brackeys_platformer_assets/sprites/${name}.png`;
    }
    return `${ASSET_ROOTS.SPRITES}/enemies/${name}.png`;
  },
  
  // Level-specific
  levelAsset: (levelName: string, file: string) => `${ASSET_ROOTS.LEVELS}/${levelName}/${file}`
}; 