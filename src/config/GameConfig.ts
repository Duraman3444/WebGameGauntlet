import Phaser from 'phaser';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#2c3e50',
  
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: false,
      tileBias: 16,
      overlapBias: 4
    }
  },
  
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true
  },
  
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 640,
      height: 360
    },
    max: {
      width: 1920,
      height: 1080
    }
  },
  
  fps: {
    target: 60,
    forceSetTimeOut: true
  },
  
  audio: {
    disableWebAudio: false
  }
};

// Game constants
export const GAME_CONSTANTS = {
  // World settings
  WORLD_WIDTH: 1280,
  WORLD_HEIGHT: 720,
  TILE_SIZE: 32,
  
  // Player physics
  PLAYER_SPEED: 200,
  PLAYER_JUMP_SPEED: 500,
  PLAYER_DOUBLE_JUMP_SPEED: 450,
  PLAYER_WALL_JUMP_SPEED: 450,
  PLAYER_ACCELERATION: 800,
  PLAYER_FRICTION: 0.85,
  
  // Combat
  PLAYER_ATTACK_DAMAGE: 25,
  PLAYER_ATTACK_RANGE: 40,
  PLAYER_INVINCIBILITY_TIME: 1000,
  
  // Enemies
  ENEMY_SPEED: 50,
  ENEMY_HEALTH: 50,
  ENEMY_ATTACK_DAMAGE: 10,
  ENEMY_VISION_RANGE: 150,
  
  // Collectibles
  FRUITS_PER_LEVEL: 10,
  FRUIT_SCORE: 100,
  
  // Levels
  LEVELS_PER_WORLD: 3,
  TOTAL_WORLDS: 4
};

// Asset paths
export const ASSET_PATHS = {
  // Characters
  CHARACTERS: {
    PINK_MAN: 'sprites/players/Main Characters/Pink Man',
    MASK_DUDE: 'sprites/players/Main Characters/Mask Dude',
    NINJA_FROG: 'sprites/players/Main Characters/Ninja Frog',
    VIRTUAL_GUY: 'sprites/players/Main Characters/Virtual Guy',
    ADVENTURE_HERO: 'sprites/players/Main Characters/Adventure Hero',
    ROBOT: 'sprites/players/Main Characters/Robot',
    KING_HUMAN: 'sprites/players/Main Characters/King Human'
  },
  
  // Enemies
  ENEMIES: {
    FLYING_EYE: 'sprites/enemies/Flying eye',
    GOBLIN: 'sprites/enemies/Goblin',
    MUSHROOM: 'sprites/enemies/Mushroom',
    SKELETON: 'sprites/enemies/Skeleton'
  },
  
  // Fruits
  FRUITS: 'levels/common/objects/Fruits',
  
  // UI
  UI: 'ui/Menu',
  
  // Audio
  AUDIO: {
    SFX: 'audio/sfx',
    MUSIC: 'audio/music'
  },
  
  // Levels
  LEVELS: {
    BACKGROUNDS: 'levels/common/backgrounds',
    TERRAIN: 'levels/common/Terrain/Seasonal Tilesets',
    TRAPS: 'levels/common/Traps'
  }
}; 