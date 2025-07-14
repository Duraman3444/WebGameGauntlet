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
    tilesetKey: 'terrain_tileset',
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
    tilesetKey: 'terrain_tileset',
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
    tilesetKey: 'terrain_tileset',
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
    tilesetKey: 'terrain_tileset',
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
    tilesetKey: 'terrain_tileset',
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
    tilesetKey: 'terrain_tileset',
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
    tilesetKey: 'terrain_tileset',
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
    tilesetKey: 'terrain_tileset',
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
    tilesetKey: 'terrain_tileset',
    backgroundLayers: ['bg_pink'],
    music: 'sakura_theme',
    decorations: ['sakura', 'petal', 'tree'],
    enemyTypes: ['spike', 'trampoline', 'fire']
  }
};

export const LEVELS = {
  LEVEL_1: {
    id: 'level_1',
    name: 'Green Hills - World 1-1',
    theme: LEVEL_THEMES.GRASSLAND,
    worldWidth: 3200,
    worldHeight: 720,
    spawnPoint: { x: 100, y: 600 },
    timeLimit: 300,
    difficulty: 1
  },
  LEVEL_2: {
    id: 'level_2',
    name: 'Crystal Caverns - World 1-2',
    theme: LEVEL_THEMES.CAVE,
    worldWidth: 3200,
    worldHeight: 720,
    spawnPoint: { x: 100, y: 600 },
    timeLimit: 250,
    difficulty: 2
  },
  LEVEL_3: {
    id: 'level_3',
    name: 'Central City - World 1-3',
    theme: LEVEL_THEMES.CITY,
    worldWidth: 3200,
    worldHeight: 720,
    spawnPoint: { x: 100, y: 600 },
    timeLimit: 280,
    difficulty: 3
  },
  LEVEL_4: {
    id: 'level_4',
    name: 'Stringstar Fields - World 1-4',
    theme: LEVEL_THEMES.STRINGSTAR_FIELDS,
    worldWidth: 3200,
    worldHeight: 720,
    spawnPoint: { x: 100, y: 600 },
    timeLimit: 320,
    difficulty: 2
  }
};

export const LEVEL_DATA = {
  // World 1-1 inspired layout - platforms and obstacles (adjusted for 720p)
  platforms: [
    // Starting ground area (classic Mario 1-1 beginning) - now at bottom of 720p screen
    { x: 0, y: 688, width: 832, height: 32, type: 'ground' },
    
    // Gap before first obstacles (like original)
    { x: 896, y: 688, width: 192, height: 32, type: 'ground' },
    
    // Platform after first pit
    { x: 1152, y: 688, width: 256, height: 32, type: 'ground' },
    
    // Mid-level ground section
    { x: 1472, y: 688, width: 320, height: 32, type: 'ground' },
    
    // Section before the "pipe area"
    { x: 1856, y: 688, width: 384, height: 32, type: 'ground' },
    
    // Pipe area ground
    { x: 2304, y: 688, width: 256, height: 32, type: 'ground' },
    
    // Ground before stairs
    { x: 2624, y: 688, width: 320, height: 32, type: 'ground' },
    
    // Staircase section (classic Mario 1-1 stairs) - adjusted for 720p
    { x: 3008, y: 656, width: 64, height: 64, type: 'platform' },   // Step 1
    { x: 3072, y: 624, width: 64, height: 96, type: 'platform' },    // Step 2
    { x: 3136, y: 592, width: 64, height: 128, type: 'platform' },   // Step 3
    { x: 3200, y: 560, width: 64, height: 160, type: 'platform' },   // Step 4
    
    // Top of stairs platform
    { x: 3264, y: 560, width: 128, height: 160, type: 'platform' },
    
    // Down stairs (reverse)
    { x: 3392, y: 592, width: 64, height: 128, type: 'platform' },   // Step 3
    { x: 3456, y: 624, width: 64, height: 96, type: 'platform' },    // Step 2
    { x: 3520, y: 656, width: 64, height: 64, type: 'platform' },   // Step 1
    
    // Final ground section to flagpole
    { x: 3584, y: 688, width: 416, height: 32, type: 'ground' },
    
    // Classic floating question block platforms (adjusted heights for 720p)
    { x: 512, y: 496, width: 32, height: 32, type: 'platform' },      // First question block position
    { x: 640, y: 496, width: 96, height: 32, type: 'platform' },      // Triple question block area
    { x: 768, y: 496, width: 32, height: 32, type: 'platform' },      // End of question block area
    
    // High question block (like original Mario)
    { x: 640, y: 400, width: 32, height: 32, type: 'platform' },      // High question block
    
    // Brick block area platforms
    { x: 1024, y: 496, width: 32, height: 32, type: 'platform' },
    { x: 1280, y: 496, width: 128, height: 32, type: 'platform' },    // Brick block area
    { x: 1280, y: 400, width: 32, height: 32, type: 'platform' },     // High brick block
    
    // Mid-level elevated platforms
    { x: 1792, y: 624, width: 64, height: 96, type: 'platform' },     // Small pipe equivalent
    { x: 2176, y: 560, width: 64, height: 160, type: 'platform' },    // Medium pipe equivalent
    { x: 2432, y: 496, width: 64, height: 224, type: 'platform' },    // Large pipe equivalent
    { x: 2688, y: 560, width: 64, height: 160, type: 'platform' },    // Medium pipe equivalent
    
    // Additional floating platforms for more Mario-like feel
    { x: 2176, y: 524, width: 64, height: 32, type: 'platform' },     // Platform on top of pipe
    
    // Falling platforms for added challenge
    { x: 1600, y: 464, width: 96, height: 16, type: 'falling_platform' },
    { x: 1920, y: 544, width: 96, height: 16, type: 'falling_platform' },
    { x: 2800, y: 544, width: 96, height: 16, type: 'falling_platform' },
    
    // Box platforms (destructible blocks)
    { x: 512, y: 464, width: 32, height: 32, type: 'box' },           // Above ground level
    { x: 640, y: 464, width: 32, height: 32, type: 'box' },           // Question block area
    { x: 672, y: 464, width: 32, height: 32, type: 'box' },
    { x: 704, y: 464, width: 32, height: 32, type: 'box' },
    { x: 768, y: 464, width: 32, height: 32, type: 'box' },
    { x: 640, y: 368, width: 32, height: 32, type: 'box' },           // High question block
    
    // Brick block boxes
    { x: 1024, y: 464, width: 32, height: 32, type: 'box' },
    { x: 1280, y: 464, width: 32, height: 32, type: 'box' },
    { x: 1312, y: 464, width: 32, height: 32, type: 'box' },
    { x: 1344, y: 464, width: 32, height: 32, type: 'box' },
    { x: 1376, y: 464, width: 32, height: 32, type: 'box' },
    { x: 1280, y: 368, width: 32, height: 32, type: 'box' },          // High brick block
    
    // Additional boxes throughout level
    { x: 1600, y: 464, width: 32, height: 32, type: 'box' },
    { x: 2000, y: 464, width: 32, height: 32, type: 'box' },
    { x: 2500, y: 464, width: 32, height: 32, type: 'box' }
  ],
  
  // Trap obstacles (replacing classic Mario enemies)
  traps: [
    // Starting area - first Goomba positions
    { x: 704, y: 656, type: 'spike', subtype: 'ground' },             // First enemy position
    { x: 832, y: 656, type: 'spike', subtype: 'ground' },             // Second Goomba position
    
    // Pit areas with spikes
    { x: 864, y: 656, type: 'spike', subtype: 'ground' },             // Gap hazard
    { x: 1120, y: 656, type: 'spike', subtype: 'ground' },            // Another gap hazard
    
    // Fire traps replacing some enemies
    { x: 960, y: 624, type: 'fire', cycle: 3000 },                    // Mid-level fire trap
    { x: 1440, y: 624, type: 'fire', cycle: 3000 },                   // Before pipe area
    { x: 1824, y: 624, type: 'fire', cycle: 3000 },                   // Pipe area
    
    // Trampolines to help with platforming (replacing some power-ups)
    { x: 448, y: 656, type: 'trampoline' },                           // Early trampoline
    { x: 1088, y: 656, type: 'trampoline' },                          // Help cross gap
    { x: 1664, y: 656, type: 'trampoline' },                          // Mid-level boost
    { x: 2272, y: 656, type: 'trampoline' },                          // Pipe area boost
    { x: 2960, y: 656, type: 'trampoline' },                          // Before stairs
    
    // Saws in strategic positions (replacing Koopa Troopas)
    { x: 1200, y: 544, type: 'saw', movement: 'horizontal', range: 100 },  // Patrol area
    { x: 1500, y: 444, type: 'saw', movement: 'vertical', range: 80 },     // Vertical patrol
    { x: 1900, y: 544, type: 'saw', movement: 'horizontal', range: 120 },  // Pipe area patrol
    { x: 2600, y: 544, type: 'saw', movement: 'horizontal', range: 100 },  // Pre-stairs area
    
    // Additional ground spikes
    { x: 1312, y: 656, type: 'spike', subtype: 'ground' },
    { x: 1520, y: 656, type: 'spike', subtype: 'ground' },
    { x: 1728, y: 656, type: 'spike', subtype: 'ground' },
    { x: 2080, y: 656, type: 'spike', subtype: 'ground' },
    { x: 2368, y: 656, type: 'spike', subtype: 'ground' },
    { x: 2592, y: 656, type: 'spike', subtype: 'ground' },
    
    // Falling platforms for added challenge
    { x: 1600, y: 544, type: 'falling_platform' },
    { x: 1920, y: 494, type: 'falling_platform' },
    { x: 2800, y: 594, type: 'falling_platform' }
  ],
  
  // Fruits (replacing coins in classic Mario 1-1 positions)
  fruits: [
    // Starting area fruits
    { x: 256, y: 594, type: 'apple' },
    { x: 384, y: 594, type: 'bananas' },
    { x: 512, y: 424, type: 'cherries' },                               // Above first question block
    
    // Question block area fruits
    { x: 640, y: 424, type: 'melon' },                                // Above triple blocks
    { x: 672, y: 424, type: 'kiwi' },
    { x: 704, y: 424, type: 'orange' },
    { x: 640, y: 324, type: 'pineapple' },                            // Above high question block
    { x: 768, y: 424, type: 'strawberry' },
    
    // Brick block area fruits
    { x: 1024, y: 424, type: 'apple' },
    { x: 1280, y: 424, type: 'bananas' },
    { x: 1312, y: 424, type: 'cherries' },
    { x: 1344, y: 424, type: 'kiwi' },
    { x: 1376, y: 424, type: 'melon' },
    { x: 1280, y: 324, type: 'pineapple' },                           // Above high brick block
    
    // Pipe area fruits
    { x: 1792, y: 494, type: 'orange' },                              // On small pipe
    { x: 2176, y: 494, type: 'strawberry' },                          // On medium pipe
    { x: 2432, y: 424, type: 'apple' },                               // On large pipe
    { x: 2688, y: 494, type: 'bananas' },                              // On medium pipe
    
    // Scattered fruits throughout level
    { x: 800, y: 594, type: 'cherries' },
    { x: 1152, y: 594, type: 'kiwi' },
    { x: 1472, y: 594, type: 'melon' },
    { x: 1600, y: 424, type: 'orange' },                              // On moving platform
    { x: 1856, y: 594, type: 'pineapple' },
    { x: 2304, y: 594, type: 'strawberry' },
    { x: 2624, y: 594, type: 'apple' },
    
    // Stairs area fruits
    { x: 3008, y: 594, type: 'bananas' },                              // On first step
    { x: 3136, y: 524, type: 'cherries' },                              // On third step
    { x: 3264, y: 494, type: 'kiwi' },                                // On top platform
    { x: 3456, y: 554, type: 'melon' },                               // On down stairs
    
    // High-value fruits in dangerous areas
    { x: 880, y: 594, type: 'pineapple' },                            // Near gap
    { x: 1400, y: 344, type: 'strawberry' },                          // High reward
    { x: 2000, y: 444, type: 'melon' },                               // Near saw
    { x: 2700, y: 494, type: 'pineapple' },                           // Before stairs
    
    // Final area fruits
    { x: 3584, y: 594, type: 'apple' },
    { x: 3700, y: 594, type: 'bananas' },
    { x: 3800, y: 594, type: 'cherries' },
    { x: 3900, y: 594, type: 'kiwi' }
  ],
  // Enemies for stage 1
  enemies: [
    { x: 640, y: 656, type: 'flying_eye' },
    { x: 1280, y: 656, type: 'goblin' },
    { x: 2000, y: 656, type: 'mushroom' },
    { x: 2600, y: 656, type: 'skeleton' }
  ],
  
  // Checkpoints (strategic save points like Mario 1-1)
  checkpoints: [
    { x: 800, y: 644, type: 'checkpoint' },                           // After first obstacles
    { x: 1600, y: 644, type: 'checkpoint' },                          // Mid-level
    { x: 2400, y: 644, type: 'checkpoint' },                          // Before stairs
    { x: 3264, y: 524, type: 'checkpoint' }                           // Top of stairs
  ],
  
  // Goal at the end (classic Mario 1-1 flagpole position)
  goal: {
    x: 3936,                                                           // Classic flagpole distance
    y: 494,
    type: 'end_flag'
  }
}; 

export const INITIAL_DATA = {
  GRASSLAND: {
    theme: LEVEL_THEMES.GRASSLAND,
    worldWidth: 3200,
    worldHeight: 720,
    spawnPoint: { x: 100, y: 600 },
    timeLimit: 400,
    difficulty: 1
  },
  CAVE: {
    theme: LEVEL_THEMES.CAVE,
    worldWidth: 3200,
    worldHeight: 720,
    spawnPoint: { x: 100, y: 600 },
    timeLimit: 350,
    difficulty: 3
  },
  CITY: {
    theme: LEVEL_THEMES.CITY,
    worldWidth: 3200,
    worldHeight: 720,
    spawnPoint: { x: 100, y: 600 },
    timeLimit: 320,
    difficulty: 2
  },
  STRINGSTAR_FIELDS: {
    theme: LEVEL_THEMES.STRINGSTAR_FIELDS,
    worldWidth: 3200,
    worldHeight: 720,
    spawnPoint: { x: 100, y: 600 },
    timeLimit: 400,
    difficulty: 1
  },
  WINTER: {
    theme: LEVEL_THEMES.WINTER,
    worldWidth: 3200,
    worldHeight: 720,
    spawnPoint: { x: 100, y: 600 },
    timeLimit: 350,
    difficulty: 2
  },
  DESERT: {
    theme: LEVEL_THEMES.DESERT,
    worldWidth: 3200,
    worldHeight: 720,
    spawnPoint: { x: 100, y: 600 },
    timeLimit: 320,
    difficulty: 2
  }
}; 