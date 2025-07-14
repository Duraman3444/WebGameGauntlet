import Phaser from 'phaser';

export const GAME_CONFIG = {
  // Game dimensions - traditional platformer screen size
  width: 1280,
  height: 720,
  
  // Physics settings for platformer
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 }, // Strong gravity for platformer feel
      debug: false
    }
  },
  
  // Rendering settings optimized for pixel art
  render: {
    antialias: false, // Pixel art style
    pixelArt: true,
    roundPixels: true, // Prevents sub-pixel positioning
    transparent: false, // Solid background
    clearBeforeRender: true,
    preserveDrawingBuffer: false,
    premultipliedAlpha: false // Prevents transparency issues
  },
  
  // Scene configuration
  scene: [], // Will be populated with scenes
  
  // Performance settings
  fps: {
    target: 60,
    forceSetTimeOut: true,
    deltaHistory: 10,
    panicMax: 120
  },
  
  // Audio settings
  audio: {
    disableWebAudio: false
  }
};

export const GAME_CONSTANTS = {
  // World dimensions - traditional platformer level size
  WORLD_WIDTH: 3200,
  WORLD_HEIGHT: 720,
  TILE_SIZE: 32,
  
  // Player settings
  PLAYER_SPEED: 160,
  PLAYER_JUMP_SPEED: 400,
  PLAYER_DOUBLE_JUMP_SPEED: 350, // Slightly less than first jump
  PLAYER_WALL_JUMP_SPEED: 300,
  PLAYER_WALL_SLIDE_SPEED: 80,
  PLAYER_SIZE: 32,
  PLAYER_BOUNCE: 0.2,
  PLAYER_DRAG: 600,
  PLAYER_WALL_DRAG: 300,
  PLAYER_TRAMPOLINE_BOOST: 500, // Extra jump from trampolines
  
  // Game settings
  MAX_PLAYERS: 4,
  RESPAWN_TIME: 3000,
  LEVEL_TIME_LIMIT: 300, // 5 minutes
  
  // Collectibles
  FRUIT_VALUE: 100,
  BONUS_FRUIT_VALUE: 500,

  // Enemy settings
  ENEMY_SPEED: 60,
  ENEMY_BOUNCE: 0.1,

  // Enemy types
  ENEMY_TYPES: {
    FLYING_EYE: 'flying_eye',
    GOBLIN: 'goblin',
    MUSHROOM: 'mushroom',
    SKELETON: 'skeleton'
  },
  
  // Trap settings
  SPIKE_DAMAGE: 50,
  FIRE_DAMAGE: 25,
  SAW_DAMAGE: 75,
  FIRE_CYCLE_TIME: 3000, // 3 seconds on/off cycle
  SAW_SPEED: 100,
  FALLING_PLATFORM_DELAY: 1000, // 1 second before falling
  FALLING_PLATFORM_RESPAWN: 5000, // 5 seconds to respawn
  
  // Network settings
  NETWORK_UPDATE_RATE: 60,
  
  // UI settings
  UI_PADDING: 20,
  BUTTON_HEIGHT: 50,
  
  // Game states
  GAME_STATES: {
    MENU: 'menu',
    LOBBY: 'lobby',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    LEVEL_COMPLETE: 'level_complete'
  },
  
  // Player characters
  PLAYER_CHARACTERS: {
    PINK_MAN: 'pinkman',
    MASK_DUDE: 'maskdude',
    NINJA_FROG: 'ninjafrog',
    VIRTUAL_GUY: 'virtualguy'
  },
  
  // Character assignments for multiplayer
  PLAYER_CHARACTER_ASSIGNMENTS: [
    'pinkman',    // Player 1 - Pink Man (main character)
    'maskdude',   // Player 2 - Mask Dude
    'ninjafrog',  // Player 3 - Ninja Frog
    'virtualguy'  // Player 4 - Virtual Guy
  ],
  
  // Fruit types for collection
  FRUIT_TYPES: {
    APPLE: 'apple',
    BANANA: 'banana',
    CHERRY: 'cherry',
    KIWI: 'kiwi',
    MELON: 'melon',
    ORANGE: 'orange',
    PINEAPPLE: 'pineapple',
    STRAWBERRY: 'strawberry'
  },
  
  // Box types
  BOX_TYPES: {
    BOX1: 'box1',
    BOX2: 'box2',
    BOX3: 'box3'
  },
  
  // Trap types
  TRAP_TYPES: {
    SPIKE: 'spike',
    FIRE: 'fire',
    SAW: 'saw',
    TRAMPOLINE: 'trampoline',
    FALLING_PLATFORM: 'falling_platform'
  }
};

export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#10B981',
  ACCENT: '#F59E0B',
  DANGER: '#EF4444',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#6B7280',
  
  // Character theme colors
  PINK_MAN: '#FF69B4',
  MASK_DUDE: '#8A2BE2',
  NINJA_FROG: '#00FF00',
  VIRTUAL_GUY: '#00BFFF',
  
  // Environment colors
  SKY_BLUE: '#87CEEB',
  GROUND_BROWN: '#8B4513',
  PLATFORM_GRAY: '#696969',
  FRUIT_YELLOW: '#FFD700',
  
  // Trap colors
  SPIKE_GRAY: '#808080',
  FIRE_RED: '#FF4500',
  SAW_SILVER: '#C0C0C0',
  TRAMPOLINE_BLUE: '#4169E1'
};

export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Player events
  PLAYER_JOIN: 'player_join',
  PLAYER_LEAVE: 'player_leave',
  PLAYER_MOVE: 'player_move',
  PLAYER_JUMP: 'player_jump',
  PLAYER_DOUBLE_JUMP: 'player_double_jump',
  PLAYER_WALL_JUMP: 'player_wall_jump',
  PLAYER_ACTION: 'player_action',
  PLAYER_DEATH: 'player_death',
  PLAYER_DAMAGE: 'player_damage',
  
  // Game events
  GAME_START: 'game_start',
  GAME_UPDATE: 'game_update',
  GAME_END: 'game_end',
  LEVEL_COMPLETE: 'level_complete',
  
  // World events
  FRUIT_COLLECTED: 'fruit_collected',
  BOX_BROKEN: 'box_broken',
  CHECKPOINT_REACHED: 'checkpoint_reached',
  TRAP_TRIGGERED: 'trap_triggered',
  TRAMPOLINE_BOUNCED: 'trampoline_bounced',
  
  // Room events
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_UPDATE: 'room_update'
};

export const LEVEL_THEMES = {
  GRASSLAND: {
    id: 'grassland',
    name: 'Green Hills',
    backgroundColor: '#87CEEB',
    groundColor: '#90EE90',
    tilesetKey: 'grassland_tileset',
    backgroundLayers: ['bg_blue'],
    music: 'grassland_theme',
    decorations: ['tree', 'bush', 'flower'],
    enemyTypes: ['spike', 'trampoline']
  },
  CAVE: {
    id: 'cave',
    name: 'Crystal Caverns',
    backgroundColor: '#2F2F2F',
    groundColor: '#8B4513',
    tilesetKey: 'cave_tileset',
    backgroundLayers: ['bg_gray'],
    music: 'cave_theme',
    decorations: ['stalactite', 'crystal', 'torch'],
    enemyTypes: ['spike', 'fire', 'falling_platform']
  },
  CITY: {
    id: 'city',
    name: 'Central City',
    backgroundColor: '#4169E1',
    groundColor: '#696969',
    tilesetKey: 'city_tileset',
    backgroundLayers: ['bg_blue'],
    music: 'city_theme',
    decorations: ['building', 'streetlight', 'sign'],
    enemyTypes: ['saw', 'fire', 'falling_platform']
  },
  STRINGSTAR_FIELDS: {
    id: 'stringstar_fields',
    name: 'Stringstar Fields',
    backgroundColor: '#FFB6C1',
    groundColor: '#32CD32',
    tilesetKey: 'stringstar_tileset',
    backgroundLayers: ['bg_stringstar_0', 'bg_stringstar_1', 'bg_stringstar_2'],
    music: 'stringstar_theme',
    decorations: ['flower', 'crystal', 'tree'],
    enemyTypes: ['spike', 'trampoline', 'fire']
  },
  WINTER: {
    id: 'winter',
    name: 'Frozen Peaks',
    backgroundColor: '#B0E0E6',
    groundColor: '#FFFFFF',
    tilesetKey: 'winter_tileset',
    backgroundLayers: ['bg_purple'],
    music: 'winter_theme',
    decorations: ['snowflake', 'tree', 'crystal'],
    enemyTypes: ['spike', 'falling_platform']
  },
  DESERT: {
    id: 'desert',
    name: 'Sandy Dunes',
    backgroundColor: '#F4A460',
    groundColor: '#DEB887',
    tilesetKey: 'desert_tileset',
    backgroundLayers: ['bg_yellow'],
    music: 'desert_theme',
    decorations: ['cactus', 'rock', 'dune'],
    enemyTypes: ['spike', 'fire', 'saw']
  },
  AUTUMN: {
    id: 'autumn',
    name: 'Autumn Forest',
    backgroundColor: '#8B4513',
    groundColor: '#D2691E',
    tilesetKey: 'autumn_tileset',
    backgroundLayers: ['bg_brown'],
    music: 'autumn_theme',
    decorations: ['tree', 'leaves', 'branch'],
    enemyTypes: ['spike', 'fire', 'falling_platform']
  },
  TROPICS: {
    id: 'tropics',
    name: 'Tropical Paradise',
    backgroundColor: '#00CED1',
    groundColor: '#F0E68C',
    tilesetKey: 'tropics_tileset',
    backgroundLayers: ['bg_blue'],
    music: 'tropics_theme',
    decorations: ['palm', 'coconut', 'flower'],
    enemyTypes: ['spike', 'trampoline', 'saw']
  },
  SPACE: {
    id: 'space',
    name: 'Purple Dimension',
    backgroundColor: '#4B0082',
    groundColor: '#8A2BE2',
    tilesetKey: 'space_tileset',
    backgroundLayers: ['bg_purple'],
    music: 'space_theme',
    decorations: ['star', 'crystal', 'void'],
    enemyTypes: ['spike', 'fire', 'saw']
  },
  SAKURA: {
    id: 'sakura',
    name: 'Cherry Blossom',
    backgroundColor: '#FFB6C1',
    groundColor: '#90EE90',
    tilesetKey: 'sakura_tileset',
    backgroundLayers: ['bg_pink'],
    music: 'sakura_theme',
    decorations: ['sakura', 'petal', 'tree'],
    enemyTypes: ['spike', 'trampoline', 'fire']
  }
};

// Level definitions with different themes and designs
export const LEVELS = {
  // Level 1: Grassland Tutorial - Easy introduction level
  GRASSLAND_TUTORIAL: {
    id: 'grassland_tutorial',
    name: 'Sunny Meadows',
    theme: 'grassland',
    background: 'Green',
    tileset: 'grassland_tileset',
    difficulty: 'Easy',
    timeLimit: 300,
    description: 'A peaceful grassland perfect for learning the basics',
    
    // Simple tutorial layout
    platforms: [
      // Ground platforms
      { x: 0, y: 688, width: 400, height: 32, type: 'ground' },
      { x: 500, y: 688, width: 300, height: 32, type: 'ground' },
      { x: 900, y: 688, width: 400, height: 32, type: 'ground' },
      { x: 1400, y: 688, width: 300, height: 32, type: 'ground' },
      { x: 1800, y: 688, width: 400, height: 32, type: 'ground' },
      
      // Tutorial platforms - gradually increasing difficulty
      { x: 400, y: 600, width: 100, height: 16, type: 'platform' },
      { x: 550, y: 550, width: 100, height: 16, type: 'platform' },
      { x: 700, y: 500, width: 100, height: 16, type: 'platform' },
      { x: 850, y: 450, width: 100, height: 16, type: 'platform' },
      
      // Mid-level platforms
      { x: 1050, y: 600, width: 150, height: 16, type: 'platform' },
      { x: 1250, y: 550, width: 100, height: 16, type: 'platform' },
      
      // End area platforms
      { x: 1600, y: 600, width: 100, height: 16, type: 'platform' },
      { x: 1750, y: 550, width: 100, height: 16, type: 'platform' },
    ],
    
    // Simple fruit collection
    fruits: [
      { x: 450, y: 570, type: 'apple' },
      { x: 600, y: 520, type: 'bananas' },
      { x: 750, y: 470, type: 'cherries' },
      { x: 900, y: 420, type: 'orange' },
      { x: 1100, y: 570, type: 'strawberry' },
      { x: 1300, y: 520, type: 'kiwi' },
      { x: 1650, y: 570, type: 'melon' },
      { x: 1800, y: 520, type: 'pineapple' },
    ],
    
    // Minimal traps for tutorial
    traps: [
      { x: 1200, y: 624, type: 'trampoline' },
      { x: 1500, y: 624, type: 'trampoline' },
    ],
    
    // Tutorial boxes for jumping practice
    boxes: [
      { x: 320, y: 656, type: 'box1' },
      { x: 1320, y: 656, type: 'box2' },
    ],
    
    checkpoints: [
      { x: 800, y: 600 },
      { x: 1600, y: 600 },
    ],
    
    enemies: [],
    
    playerStart: { x: 100, y: 600 },
    levelEnd: { x: 2000, y: 600 },
  },

  // Level 2: Autumn Forest - Medium difficulty with more complex platforming
  AUTUMN_FOREST: {
    id: 'autumn_forest',
    name: 'Autumn Canopy',
    theme: 'autumn',
    background: 'Brown',
    tileset: 'autumn_tileset',
    difficulty: 'Medium',
    timeLimit: 400,
    description: 'Navigate through the colorful autumn forest',
    
    platforms: [
      // Ground with gaps for challenge
      { x: 0, y: 688, width: 300, height: 32, type: 'ground' },
      { x: 400, y: 688, width: 200, height: 32, type: 'ground' },
      { x: 700, y: 688, width: 150, height: 32, type: 'ground' },
      { x: 950, y: 688, width: 200, height: 32, type: 'ground' },
      { x: 1250, y: 688, width: 300, height: 32, type: 'ground' },
      { x: 1650, y: 688, width: 200, height: 32, type: 'ground' },
      { x: 1950, y: 688, width: 300, height: 32, type: 'ground' },
      
      // Tree branch platforms - varying heights
      { x: 320, y: 600, width: 80, height: 16, type: 'platform' },
      { x: 450, y: 550, width: 100, height: 16, type: 'platform' },
      { x: 600, y: 500, width: 80, height: 16, type: 'platform' },
      { x: 750, y: 450, width: 100, height: 16, type: 'platform' },
      { x: 900, y: 400, width: 80, height: 16, type: 'platform' },
      
      // Mid-level canopy
      { x: 1100, y: 550, width: 120, height: 16, type: 'platform' },
      { x: 1280, y: 500, width: 100, height: 16, type: 'platform' },
      { x: 1450, y: 450, width: 120, height: 16, type: 'platform' },
      
      // High canopy section
      { x: 1700, y: 400, width: 100, height: 16, type: 'platform' },
      { x: 1850, y: 350, width: 100, height: 16, type: 'platform' },
      { x: 2000, y: 300, width: 150, height: 16, type: 'platform' },
    ],
    
    fruits: [
      { x: 360, y: 570, type: 'apple' },
      { x: 500, y: 520, type: 'bananas' },
      { x: 640, y: 470, type: 'cherries' },
      { x: 800, y: 420, type: 'orange' },
      { x: 950, y: 370, type: 'strawberry' },
      { x: 1150, y: 520, type: 'kiwi' },
      { x: 1330, y: 470, type: 'melon' },
      { x: 1500, y: 420, type: 'pineapple' },
      { x: 1750, y: 370, type: 'apple' },
      { x: 1900, y: 320, type: 'bananas' },
      { x: 2050, y: 270, type: 'cherries' },
    ],
    
    traps: [
      { x: 600, y: 624, type: 'fire', cycle: 3000 },
      { x: 1000, y: 624, type: 'fire', cycle: 2500 },
      { x: 1400, y: 624, type: 'trampoline' },
      { x: 1800, y: 624, type: 'trampoline' },
      { x: 1300, y: 456, type: 'saw' },
    ],
    
    boxes: [
      { x: 250, y: 656, type: 'box1' },
      { x: 500, y: 656, type: 'box2' },
      { x: 850, y: 656, type: 'box3' },
      { x: 1200, y: 656, type: 'box1' },
      { x: 1900, y: 656, type: 'box2' },
    ],
    
    checkpoints: [
      { x: 600, y: 600 },
      { x: 1200, y: 600 },
      { x: 1800, y: 600 },
    ],
    
    enemies: [
      { x: 500, y: 656, type: 'goblin' },
      { x: 1100, y: 656, type: 'mushroom' },
      { x: 1700, y: 656, type: 'goblin' },
    ],
    
    playerStart: { x: 100, y: 600 },
    levelEnd: { x: 2200, y: 600 },
  },

  // Level 3: Tropical Paradise - Advanced platforming with water elements
  TROPICAL_PARADISE: {
    id: 'tropical_paradise',
    name: 'Tropical Paradise',
    theme: 'tropics',
    background: 'Blue',
    tileset: 'tropics_tileset',
    difficulty: 'Hard',
    timeLimit: 450,
    description: 'Navigate through palm trees and tropical challenges',
    
    platforms: [
      // Beach ground with water gaps
      { x: 0, y: 688, width: 250, height: 32, type: 'ground' },
      { x: 350, y: 688, width: 200, height: 32, type: 'ground' },
      { x: 650, y: 688, width: 150, height: 32, type: 'ground' },
      { x: 900, y: 688, width: 200, height: 32, type: 'ground' },
      { x: 1200, y: 688, width: 250, height: 32, type: 'ground' },
      { x: 1550, y: 688, width: 200, height: 32, type: 'ground' },
      { x: 1850, y: 688, width: 300, height: 32, type: 'ground' },
      
      // Palm tree platforms - challenging jumps
      { x: 280, y: 600, width: 60, height: 16, type: 'platform' },
      { x: 380, y: 550, width: 80, height: 16, type: 'platform' },
      { x: 500, y: 500, width: 60, height: 16, type: 'platform' },
      { x: 620, y: 450, width: 80, height: 16, type: 'platform' },
      { x: 750, y: 400, width: 60, height: 16, type: 'platform' },
      { x: 850, y: 350, width: 80, height: 16, type: 'platform' },
      
      // Floating island platforms
      { x: 1050, y: 550, width: 100, height: 16, type: 'platform' },
      { x: 1200, y: 500, width: 80, height: 16, type: 'platform' },
      { x: 1350, y: 450, width: 100, height: 16, type: 'platform' },
      { x: 1500, y: 400, width: 80, height: 16, type: 'platform' },
      
      // High palm canopy
      { x: 1650, y: 350, width: 100, height: 16, type: 'platform' },
      { x: 1800, y: 300, width: 120, height: 16, type: 'platform' },
      { x: 1950, y: 250, width: 100, height: 16, type: 'platform' },
      
      // Moving platforms (falling platforms for challenge)
      { x: 820, y: 500, width: 60, height: 16, type: 'falling_platform' },
      { x: 1120, y: 450, width: 60, height: 16, type: 'falling_platform' },
      { x: 1720, y: 400, width: 60, height: 16, type: 'falling_platform' },
    ],
    
    fruits: [
      { x: 320, y: 570, type: 'pineapple' },
      { x: 420, y: 520, type: 'bananas' },
      { x: 540, y: 470, type: 'kiwi' },
      { x: 660, y: 420, type: 'melon' },
      { x: 790, y: 370, type: 'pineapple' },
      { x: 890, y: 320, type: 'bananas' },
      { x: 1090, y: 520, type: 'kiwi' },
      { x: 1240, y: 470, type: 'melon' },
      { x: 1390, y: 420, type: 'pineapple' },
      { x: 1540, y: 370, type: 'bananas' },
      { x: 1690, y: 320, type: 'kiwi' },
      { x: 1840, y: 270, type: 'melon' },
      { x: 1990, y: 220, type: 'pineapple' },
    ],
    
    traps: [
      { x: 300, y: 624, type: 'trampoline' },
      { x: 580, y: 624, type: 'fire', cycle: 2000 },
      { x: 950, y: 624, type: 'trampoline' },
      { x: 1300, y: 624, type: 'fire', cycle: 2500 },
      { x: 1600, y: 624, type: 'trampoline' },
      { x: 1900, y: 624, type: 'fire', cycle: 3000 },
      { x: 1400, y: 406, type: 'saw' },
      { x: 1750, y: 306, type: 'saw' },
    ],
    
    boxes: [
      { x: 200, y: 656, type: 'box1' },
      { x: 450, y: 656, type: 'box2' },
      { x: 700, y: 656, type: 'box3' },
      { x: 1150, y: 656, type: 'box1' },
      { x: 1500, y: 656, type: 'box2' },
      { x: 1800, y: 656, type: 'box3' },
    ],
    
    checkpoints: [
      { x: 500, y: 600 },
      { x: 1000, y: 600 },
      { x: 1500, y: 600 },
      { x: 2000, y: 600 },
    ],
    
    enemies: [
      { x: 400, y: 656, type: 'flying_eye' },
      { x: 800, y: 656, type: 'skeleton' },
      { x: 1250, y: 656, type: 'flying_eye' },
      { x: 1650, y: 656, type: 'skeleton' },
      { x: 2000, y: 656, type: 'flying_eye' },
    ],
    
    playerStart: { x: 100, y: 600 },
    levelEnd: { x: 2250, y: 600 },
  },

  // Level 4: Winter Wonderland - Ice physics and challenging jumps
  WINTER_WONDERLAND: {
    id: 'winter_wonderland',
    name: 'Frozen Peaks',
    theme: 'winter',
    background: 'Gray',
    tileset: 'winter_tileset',
    difficulty: 'Expert',
    timeLimit: 500,
    description: 'Brave the icy peaks and frozen challenges',
    
    platforms: [
      // Icy ground with slippery sections
      { x: 0, y: 688, width: 200, height: 32, type: 'ground' },
      { x: 300, y: 688, width: 150, height: 32, type: 'ground' },
      { x: 550, y: 688, width: 200, height: 32, type: 'ground' },
      { x: 850, y: 688, width: 150, height: 32, type: 'ground' },
      { x: 1100, y: 688, width: 200, height: 32, type: 'ground' },
      { x: 1400, y: 688, width: 150, height: 32, type: 'ground' },
      { x: 1650, y: 688, width: 200, height: 32, type: 'ground' },
      { x: 1950, y: 688, width: 300, height: 32, type: 'ground' },
      
      // Ice platforms - precise jumping required
      { x: 220, y: 600, width: 60, height: 16, type: 'platform' },
      { x: 350, y: 550, width: 80, height: 16, type: 'platform' },
      { x: 480, y: 500, width: 60, height: 16, type: 'platform' },
      { x: 600, y: 450, width: 80, height: 16, type: 'platform' },
      { x: 720, y: 400, width: 60, height: 16, type: 'platform' },
      { x: 820, y: 350, width: 80, height: 16, type: 'platform' },
      { x: 950, y: 300, width: 60, height: 16, type: 'platform' },
      
      // Mountain ledges
      { x: 1050, y: 550, width: 100, height: 16, type: 'platform' },
      { x: 1200, y: 500, width: 80, height: 16, type: 'platform' },
      { x: 1350, y: 450, width: 100, height: 16, type: 'platform' },
      { x: 1500, y: 400, width: 80, height: 16, type: 'platform' },
      { x: 1650, y: 350, width: 100, height: 16, type: 'platform' },
      
      // Peak platforms
      { x: 1800, y: 300, width: 120, height: 16, type: 'platform' },
      { x: 1950, y: 250, width: 100, height: 16, type: 'platform' },
      { x: 2100, y: 200, width: 120, height: 16, type: 'platform' },
      
      // Challenging falling platforms
      { x: 780, y: 500, width: 60, height: 16, type: 'falling_platform' },
      { x: 1020, y: 450, width: 60, height: 16, type: 'falling_platform' },
      { x: 1280, y: 400, width: 60, height: 16, type: 'falling_platform' },
      { x: 1580, y: 350, width: 60, height: 16, type: 'falling_platform' },
      { x: 1880, y: 300, width: 60, height: 16, type: 'falling_platform' },
    ],
    
    fruits: [
      { x: 260, y: 570, type: 'apple' },
      { x: 390, y: 520, type: 'cherries' },
      { x: 520, y: 470, type: 'strawberry' },
      { x: 640, y: 420, type: 'apple' },
      { x: 760, y: 370, type: 'cherries' },
      { x: 860, y: 320, type: 'strawberry' },
      { x: 990, y: 270, type: 'apple' },
      { x: 1090, y: 520, type: 'cherries' },
      { x: 1240, y: 470, type: 'strawberry' },
      { x: 1390, y: 420, type: 'apple' },
      { x: 1540, y: 370, type: 'cherries' },
      { x: 1690, y: 320, type: 'strawberry' },
      { x: 1840, y: 270, type: 'apple' },
      { x: 1990, y: 220, type: 'cherries' },
      { x: 2140, y: 170, type: 'strawberry' },
    ],
    
    traps: [
      { x: 250, y: 624, type: 'trampoline' },
      { x: 500, y: 624, type: 'fire', cycle: 1500 },
      { x: 750, y: 624, type: 'trampoline' },
      { x: 1000, y: 624, type: 'fire', cycle: 2000 },
      { x: 1250, y: 624, type: 'trampoline' },
      { x: 1500, y: 624, type: 'fire', cycle: 1800 },
      { x: 1750, y: 624, type: 'trampoline' },
      { x: 2000, y: 624, type: 'fire', cycle: 2200 },
      { x: 900, y: 356, type: 'saw' },
      { x: 1450, y: 406, type: 'saw' },
      { x: 1850, y: 306, type: 'saw' },
    ],
    
    boxes: [
      { x: 150, y: 656, type: 'box1' },
      { x: 400, y: 656, type: 'box2' },
      { x: 650, y: 656, type: 'box3' },
      { x: 950, y: 656, type: 'box1' },
      { x: 1200, y: 656, type: 'box2' },
      { x: 1550, y: 656, type: 'box3' },
      { x: 1850, y: 656, type: 'box1' },
    ],
    
    checkpoints: [
      { x: 400, y: 600 },
      { x: 800, y: 600 },
      { x: 1200, y: 600 },
      { x: 1700, y: 600 },
      { x: 2100, y: 600 },
    ],
    
    enemies: [
      { x: 350, y: 656, type: 'skeleton' },
      { x: 700, y: 656, type: 'flying_eye' },
      { x: 1050, y: 656, type: 'skeleton' },
      { x: 1400, y: 656, type: 'flying_eye' },
      { x: 1750, y: 656, type: 'skeleton' },
      { x: 2050, y: 656, type: 'flying_eye' },
    ],
    
    playerStart: { x: 100, y: 600 },
    levelEnd: { x: 2350, y: 600 },
  },

  // Level 5: Cave Adventure - Dark underground level
  CAVE_ADVENTURE: {
    id: 'cave_adventure',
    name: 'Crystal Caverns',
    theme: 'cave',
    background: 'Purple',
    tileset: 'grassland_tileset', // Using grassland as base, will add cave-specific assets later
    difficulty: 'Hard',
    timeLimit: 400,
    description: 'Explore the mysterious underground caverns',
    
    platforms: [
      // Cave floor with stalactites
      { x: 0, y: 688, width: 300, height: 32, type: 'ground' },
      { x: 400, y: 688, width: 200, height: 32, type: 'ground' },
      { x: 700, y: 688, width: 250, height: 32, type: 'ground' },
      { x: 1050, y: 688, width: 200, height: 32, type: 'ground' },
      { x: 1350, y: 688, width: 300, height: 32, type: 'ground' },
      { x: 1750, y: 688, width: 250, height: 32, type: 'ground' },
      
      // Cave ledges - multi-level exploration
      { x: 150, y: 600, width: 100, height: 16, type: 'platform' },
      { x: 300, y: 550, width: 80, height: 16, type: 'platform' },
      { x: 450, y: 500, width: 100, height: 16, type: 'platform' },
      { x: 600, y: 450, width: 80, height: 16, type: 'platform' },
      { x: 750, y: 400, width: 100, height: 16, type: 'platform' },
      { x: 900, y: 350, width: 80, height: 16, type: 'platform' },
      
      // Upper cave system
      { x: 1100, y: 550, width: 120, height: 16, type: 'platform' },
      { x: 1280, y: 500, width: 100, height: 16, type: 'platform' },
      { x: 1450, y: 450, width: 120, height: 16, type: 'platform' },
      { x: 1620, y: 400, width: 100, height: 16, type: 'platform' },
      { x: 1800, y: 350, width: 120, height: 16, type: 'platform' },
      
      // Crystal chamber
      { x: 1950, y: 300, width: 150, height: 16, type: 'platform' },
      { x: 2150, y: 250, width: 100, height: 16, type: 'platform' },
      
      // Unstable cave platforms
      { x: 520, y: 600, width: 60, height: 16, type: 'falling_platform' },
      { x: 820, y: 500, width: 60, height: 16, type: 'falling_platform' },
      { x: 1020, y: 450, width: 60, height: 16, type: 'falling_platform' },
      { x: 1720, y: 400, width: 60, height: 16, type: 'falling_platform' },
    ],
    
    fruits: [
      { x: 200, y: 570, type: 'kiwi' },
      { x: 340, y: 520, type: 'melon' },
      { x: 490, y: 470, type: 'kiwi' },
      { x: 640, y: 420, type: 'melon' },
      { x: 790, y: 370, type: 'kiwi' },
      { x: 940, y: 320, type: 'melon' },
      { x: 1140, y: 520, type: 'kiwi' },
      { x: 1320, y: 470, type: 'melon' },
      { x: 1490, y: 420, type: 'kiwi' },
      { x: 1660, y: 370, type: 'melon' },
      { x: 1840, y: 320, type: 'kiwi' },
      { x: 1990, y: 270, type: 'melon' },
      { x: 2190, y: 220, type: 'kiwi' },
    ],
    
    traps: [
      { x: 350, y: 624, type: 'fire', cycle: 2500 },
      { x: 650, y: 624, type: 'trampoline' },
      { x: 950, y: 624, type: 'fire', cycle: 2000 },
      { x: 1200, y: 624, type: 'trampoline' },
      { x: 1500, y: 624, type: 'fire', cycle: 1800 },
      { x: 1850, y: 624, type: 'trampoline' },
      { x: 700, y: 456, type: 'saw' },
      { x: 1350, y: 506, type: 'saw' },
      { x: 1750, y: 406, type: 'saw' },
    ],
    
    boxes: [
      { x: 250, y: 656, type: 'box1' },
      { x: 550, y: 656, type: 'box2' },
      { x: 850, y: 656, type: 'box3' },
      { x: 1150, y: 656, type: 'box1' },
      { x: 1450, y: 656, type: 'box2' },
      { x: 1900, y: 656, type: 'box3' },
    ],
    
    checkpoints: [
      { x: 500, y: 600 },
      { x: 1000, y: 600 },
      { x: 1500, y: 600 },
      { x: 2000, y: 600 },
    ],
    
    enemies: [
      { x: 450, y: 656, type: 'goblin' },
      { x: 800, y: 656, type: 'mushroom' },
      { x: 1100, y: 656, type: 'goblin' },
      { x: 1400, y: 656, type: 'mushroom' },
      { x: 1800, y: 656, type: 'goblin' },
    ],
    
    playerStart: { x: 100, y: 600 },
    levelEnd: { x: 2300, y: 600 },
  },
};

// Current level data - will be replaced by level selection
export const LEVEL_DATA = LEVELS.GRASSLAND_TUTORIAL; 