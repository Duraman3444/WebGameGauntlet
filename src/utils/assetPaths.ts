export const ASSET_ROOTS = {
  SPRITES: 'assets/sprites',
  BACKGROUNDS: 'assets/levels/common/Background',
  BACKGROUNDS_ALT: 'assets/levels/common/backgrounds',
  TERRAIN: 'assets/levels/common/terrain',
  SEASONAL_TERRAIN: 'assets/levels/common/Terrain/Seasonal Tilesets',
  TRAPS: 'assets/levels/common/Traps',
  OBJECTS: 'assets/levels/common/objects',
  UI: 'assets/ui',
  LEVELS: 'assets/levels',
  SOUNDS: 'assets/sprites/sounds',
  MUSIC: 'assets/sprites/music'
};

// Helper functions for common asset paths
export const AssetPaths = {
  // Backgrounds
  background: (name: string) => `${ASSET_ROOTS.BACKGROUNDS}/${name}.png`,
  backgroundAlt: (name: string) => `${ASSET_ROOTS.BACKGROUNDS_ALT}/${name}.png`,
  
  // Terrain - Use grassland tileset as default instead of generic green blocks
  terrain: (name: string) => {
    // Use proper grassland terrain for better visuals
    if (name === 'Terrain (16x16).png') {
      return `${ASSET_ROOTS.SEASONAL_TERRAIN}/1 - Grassland/Terrain (16 x 16).png`;
    }
    return `${ASSET_ROOTS.TERRAIN}/${name}`;
  },
  seasonalTileset: (season: string) => `${ASSET_ROOTS.SEASONAL_TERRAIN}/${season}/Terrain (16 x 16).png`,
  
  // Traps
  trap: (folder: string, file: string) => `${ASSET_ROOTS.TRAPS}/${folder}/${file}`,
  spike: () => `${ASSET_ROOTS.TRAPS}/Spikes/Idle.png`,
  trampoline: () => `${ASSET_ROOTS.TRAPS}/Trampoline/Idle.png`,
  fire: (state: string) => `${ASSET_ROOTS.TRAPS}/Fire/${state === 'on' ? 'On (16x32).png' : 'Off.png'}`,
  saw: () => `${ASSET_ROOTS.TRAPS}/Saw/On (38x38).png`,
  fallingPlatform: () => `${ASSET_ROOTS.TRAPS}/Falling Platforms/On (32x10).png`,
  
  // Items - Use the correct organized paths
  fruit: (name: string) => `${ASSET_ROOTS.OBJECTS}/Fruits/${name}.png`,
  box: (name: string) => `${ASSET_ROOTS.OBJECTS}/Boxes/${name}/Idle.png`,
  checkpoint: () => `${ASSET_ROOTS.OBJECTS}/Checkpoints/Checkpoint/Checkpoint (Flag Idle)(64x64).png`,
  
  // Players
  player: (character: string, animation: string) => `${ASSET_ROOTS.SPRITES}/players/Main Characters/${character}/${animation} (32x32).png`,
  
  // Character spritesheets for animations
  characterSpritesheet: (character: string, animation: string) => `${ASSET_ROOTS.SPRITES}/players/Main Characters/${character}/${animation} (32x32).png`,
  
  // Enemies
  enemy: (name: string) => {
    // Handle different enemy types
    if (['slime_green', 'slime_purple', 'knight'].includes(name)) {
      return `${ASSET_ROOTS.SPRITES}/brackeys_platformer_assets/sprites/${name}.png`;
    }
    // Handle new tile-based enemies
    if (['flying_eye', 'goblin', 'mushroom', 'skeleton'].includes(name)) {
      const folderName = name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      return `${ASSET_ROOTS.SPRITES}/enemies/${folderName}/Attack3.png`;
    }
    return `${ASSET_ROOTS.SPRITES}/enemies/${name}.png`;
  },
  
  // Audio
  sound: (name: string) => `${ASSET_ROOTS.SOUNDS}/${name}.wav`,
  music: (name: string) => `${ASSET_ROOTS.MUSIC}/${name}.mp3`,
  
  // UI
  ui: (name: string) => `${ASSET_ROOTS.UI}/${name}`,
  
  // Levels
  level: (name: string) => `${ASSET_ROOTS.LEVELS}/${name}`
}; 