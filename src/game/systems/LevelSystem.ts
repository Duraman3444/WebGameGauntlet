import Phaser from 'phaser';
import { GAME_CONSTANTS, COLORS, LEVEL_DATA, LEVEL_THEMES } from '../config/GameConfig';
import { Trap } from '../entities/Trap';
import { Enemy } from '../entities/Enemy';

export class LevelSystem {
  private scene: Phaser.Scene;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private boxes!: Phaser.Physics.Arcade.StaticGroup;
  private fruits!: Phaser.Physics.Arcade.Group;
  private checkpoints!: Phaser.Physics.Arcade.Group;
  private traps: Map<string, Trap> = new Map();
  private enemies: Enemy[] = [];
  private enemiesGroup!: Phaser.Physics.Arcade.Group;
  private goal!: Phaser.Physics.Arcade.Sprite;
  private background!: Phaser.GameObjects.TileSprite;
  private currentTheme: any;
  private backgroundLayers: Phaser.GameObjects.TileSprite[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.determineTheme();
    this.createLevel();
  }

  private determineTheme(): void {
    // Get selected stage from registry or default to grassland
    const selectedStage = this.scene.registry.get('selectedStage');
    
    if (selectedStage) {
      console.log(`🌍 Using selected stage: ${selectedStage.name} (${selectedStage.theme})`);
      
             // Use the selected stage's theme
       switch (selectedStage.theme) {
         case 'grassland':
           this.currentTheme = LEVEL_THEMES.GRASSLAND;
           break;
         case 'cave':
           this.currentTheme = LEVEL_THEMES.CAVE;
           break;
         case 'city':
           this.currentTheme = LEVEL_THEMES.CITY;
           break;
         case 'stringstar_fields':
           this.currentTheme = LEVEL_THEMES.STRINGSTAR_FIELDS;
           break;
         case 'winter':
           this.currentTheme = LEVEL_THEMES.WINTER;
           break;
         case 'desert':
           this.currentTheme = LEVEL_THEMES.DESERT;
           break;
         case 'autumn':
           this.currentTheme = LEVEL_THEMES.AUTUMN;
           break;
         case 'tropics':
           this.currentTheme = LEVEL_THEMES.TROPICS;
           break;
         case 'space':
           this.currentTheme = LEVEL_THEMES.SPACE;
           break;
         case 'sakura':
           this.currentTheme = LEVEL_THEMES.SAKURA;
           break;
         default:
           this.currentTheme = LEVEL_THEMES.GRASSLAND;
       }
      
      // Store the selected stage's background for use in background creation
      this.scene.registry.set('selectedBackground', selectedStage.background);
    } else {
      // Fallback to grassland if no stage selected
      this.currentTheme = LEVEL_THEMES.GRASSLAND;
      console.log(`🌍 Using default theme: ${this.currentTheme.name}`);
    }
  }

  private createLevel(): void {
    // Create background
    this.createBackground();
    
    // Create physics groups
    this.platforms = this.scene.physics.add.staticGroup();
    this.walls = this.scene.physics.add.staticGroup();
    this.boxes = this.scene.physics.add.staticGroup();
    this.fruits = this.scene.physics.add.group();
    this.checkpoints = this.scene.physics.add.group();
    this.enemiesGroup = this.scene.physics.add.group();
    
    // Create level elements
    this.createPlatforms();
    this.createTraps();
    this.createBoxes();
    this.createFruits();
    this.createEnemies();
    this.createCheckpoints();
    this.createGoal();
    
    // Set world bounds
    this.scene.physics.world.setBounds(0, 0, GAME_CONSTANTS.WORLD_WIDTH, GAME_CONSTANTS.WORLD_HEIGHT);
  }

  private createBackground(): void {
    console.log(`🎨 Creating background for theme: ${this.currentTheme.name}`);
    
    // Get selected background from stage selection
    const selectedBackground = this.scene.registry.get('selectedBackground');
    
    // Create solid background color
    const bgColor = Phaser.Display.Color.HexStringToColor(this.currentTheme.backgroundColor);
    this.scene.add.rectangle(
      GAME_CONSTANTS.WORLD_WIDTH / 2,
      GAME_CONSTANTS.WORLD_HEIGHT / 2,
      GAME_CONSTANTS.WORLD_WIDTH,
      GAME_CONSTANTS.WORLD_HEIGHT,
      bgColor.color
    );
    
    // Add background image if selected from stage selection
    if (selectedBackground && this.scene.textures.exists(selectedBackground)) {
      const backgroundImg = this.scene.add.tileSprite(
        0, 0,
        GAME_CONSTANTS.WORLD_WIDTH,
        GAME_CONSTANTS.WORLD_HEIGHT,
        selectedBackground
      ).setOrigin(0, 0);
      
      backgroundImg.setDepth(-15);
      backgroundImg.setScrollFactor(0.1, 1);
      backgroundImg.setAlpha(0.8);
      
      console.log(`🌄 Using selected background: ${selectedBackground}`);
    }
    
    // Add parallax background layers
    this.createParallaxLayers();
    
    // Create themed ground/terrain
    this.createThemedTerrain();
    
    // Add theme-specific decorations
    this.createThemedDecorations();
  }

  private createParallaxLayers(): void {
    const { backgroundLayers } = this.currentTheme;
    
    backgroundLayers.forEach((layerKey: string, index: number) => {
      if (this.scene.textures.exists(layerKey)) {
        const layer = this.scene.add.tileSprite(
          0, 0,
          GAME_CONSTANTS.WORLD_WIDTH * (1 + index * 0.5),
          GAME_CONSTANTS.WORLD_HEIGHT,
          layerKey
        ).setOrigin(0, 0);
        
        // Set depth for parallax effect
        layer.setDepth(-10 + index);
        layer.setScrollFactor(0.1 + index * 0.2, 1);
        
        this.backgroundLayers.push(layer);
        console.log(`🌄 Added background layer: ${layerKey}`);
      } else {
        console.warn(`⚠️ Background layer ${layerKey} not found`);
      }
    });
  }

  private createThemedTerrain(): void {
    const { tilesetKey } = this.currentTheme;
    
    // Map theme tileset keys to actual seasonal tileset paths
    const tilesetMapping: { [key: string]: string } = {
      'grassland_tileset': 'grassland_tileset',
      'autumn_tileset': 'autumn_tileset', 
      'tropics_tileset': 'tropics_tileset',
      'winter_tileset': 'winter_tileset',
      'cave_tileset': 'grassland_tileset', // Use grassland for cave
      'city_tileset': 'grassland_tileset', // Use grassland for city
      'desert_tileset': 'grassland_tileset', // Use grassland for desert
      'space_tileset': 'grassland_tileset', // Use grassland for space
      'sakura_tileset': 'grassland_tileset' // Use grassland for sakura
    };
    
    // Get the actual tileset to use
    const actualTilesetKey = tilesetMapping[tilesetKey] || 'grassland_tileset';
    
    // Check if the tileset exists, fallback to terrain_tileset if not
    const finalTilesetKey = this.scene.textures.exists(actualTilesetKey) ? actualTilesetKey : 'terrain_tileset';
    
    if (finalTilesetKey !== actualTilesetKey) {
      console.warn(`⚠️ Tileset ${actualTilesetKey} not found, using fallback terrain_tileset`);
    }
    
    // Create tiled ground texture
    this.background = this.scene.add.tileSprite(
      0,
      GAME_CONSTANTS.WORLD_HEIGHT * 0.6,
      GAME_CONSTANTS.WORLD_WIDTH,
      GAME_CONSTANTS.WORLD_HEIGHT * 0.4,
      finalTilesetKey,
      0 // ensure only the first tile frame is used repeatedly
    ).setOrigin(0, 0);
    
    this.background.setDepth(-5);
    console.log(`🏔️ Created terrain with tileset: ${finalTilesetKey}`);
  }

  private createThemedDecorations(): void {
    const { decorations } = this.currentTheme;
    
    // Create decorations based on theme
    switch (this.currentTheme.id) {
      case 'cave':
        this.createCaveDecorations();
        break;
      case 'city':
        this.createCityDecorations();
        break;
      case 'stringstar_fields':
        this.createSpaceDecorations();
        break;
      case 'winter':
        this.createWinterDecorations();
        break;
      case 'desert':
        this.createDesertDecorations();
        break;
      default:
        this.createGrasslandDecorations();
    }
  }

  private createGrasslandDecorations(): void {
    console.log('🌱 Creating grassland decorations');
    this.createClouds();
    this.createTrees();
  }

  private createCaveDecorations(): void {
    console.log('🦇 Creating cave decorations');
    this.createStalactites();
    this.createCrystals();
  }

  private createCityDecorations(): void {
    console.log('🏙️ Creating city decorations');
    this.createBuildings();
    this.createStreetLights();
  }

  private createSpaceDecorations(): void {
    console.log('🌟 Creating space decorations');
    this.createStars();
    this.createCosmicElements();
  }

  private createWinterDecorations(): void {
    console.log('❄️ Creating winter decorations');
    this.createSnowflakes();
    this.createPineTrees();
  }

  private createDesertDecorations(): void {
    console.log('🌵 Creating desert decorations');
    this.createCacti();
    this.createSandDunes();
  }

  private createStalactites(): void {
    const positions = [
      { x: 300, y: 0 }, { x: 800, y: 0 }, { x: 1200, y: 0 },
      { x: 1600, y: 0 }, { x: 2000, y: 0 }, { x: 2400, y: 0 }
    ];
    
    positions.forEach(pos => {
      const stalactite = this.scene.add.graphics();
      stalactite.fillStyle(0x666666);
      stalactite.fillTriangle(pos.x, pos.y, pos.x - 15, pos.y + 60, pos.x + 15, pos.y + 60);
      stalactite.setDepth(-3);
    });
  }

  private createCrystals(): void {
    const positions = [
      { x: 400, y: 520 }, { x: 900, y: 520 }, { x: 1400, y: 520 },
      { x: 1800, y: 520 }, { x: 2200, y: 520 }
    ];
    
    positions.forEach(pos => {
      const crystal = this.scene.add.graphics();
      crystal.fillStyle(0x9966FF);
      crystal.fillTriangle(pos.x, pos.y - 40, pos.x - 20, pos.y, pos.x + 20, pos.y);
      crystal.setDepth(-2);
      
      // Add glow effect
      this.scene.tweens.add({
        targets: crystal,
        alpha: 0.5,
        duration: 2000,
        yoyo: true,
        repeat: -1
      });
    });
  }

  private createBuildings(): void {
    const buildings = [
      { x: 200, y: 300, width: 80, height: 200 },
      { x: 600, y: 250, width: 100, height: 250 },
      { x: 1000, y: 200, width: 120, height: 300 },
      { x: 1400, y: 280, width: 90, height: 220 },
      { x: 1800, y: 220, width: 110, height: 280 }
    ];
    
    buildings.forEach(building => {
      const rect = this.scene.add.rectangle(
        building.x, building.y,
        building.width, building.height,
        0x333333
      );
      rect.setStrokeStyle(2, 0x666666);
      rect.setDepth(-4);
      
      // Add windows
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 5; j++) {
          const window = this.scene.add.rectangle(
            building.x - building.width/2 + 15 + i * 25,
            building.y - building.height/2 + 20 + j * 30,
            8, 12,
            Math.random() > 0.3 ? 0xFFFF00 : 0x000066
          );
          window.setDepth(-3);
        }
      }
    });
  }

  private createStreetLights(): void {
    const positions = [500, 1200, 1900, 2600, 3300];
    
    positions.forEach(x => {
      // Pole
      const pole = this.scene.add.rectangle(x, 450, 8, 100, 0x444444);
      pole.setDepth(-2);
      
      // Light
      const light = this.scene.add.circle(x, 400, 15, 0xFFFFAA);
      light.setDepth(-1);
      
      // Glow effect
      this.scene.tweens.add({
        targets: light,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 3000,
        yoyo: true,
        repeat: -1
      });
    });
  }

  private createStars(): void {
    for (let i = 0; i < 50; i++) {
      const star = this.scene.add.circle(
        Math.random() * GAME_CONSTANTS.WORLD_WIDTH,
        Math.random() * GAME_CONSTANTS.WORLD_HEIGHT * 0.6,
        Math.random() * 3 + 1,
        0xFFFFFF
      );
      star.setDepth(-8);
      star.setAlpha(Math.random() * 0.8 + 0.2);
      
      // Twinkling effect
      this.scene.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Math.random() * 2000 + 1000,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private createCosmicElements(): void {
    // Create floating energy orbs
    const positions = [
      { x: 300, y: 200 }, { x: 800, y: 150 }, { x: 1300, y: 180 },
      { x: 1800, y: 160 }, { x: 2300, y: 140 }
    ];
    
    positions.forEach(pos => {
      const orb = this.scene.add.circle(pos.x, pos.y, 20, 0xFF69B4);
      orb.setDepth(-2);
      orb.setAlpha(0.7);
      
      // Floating animation
      this.scene.tweens.add({
        targets: orb,
        y: pos.y - 20,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private createSnowflakes(): void {
    for (let i = 0; i < 30; i++) {
      const snowflake = this.scene.add.circle(
        Math.random() * GAME_CONSTANTS.WORLD_WIDTH,
        Math.random() * GAME_CONSTANTS.WORLD_HEIGHT * 0.8,
        Math.random() * 4 + 2,
        0xFFFFFF
      );
      snowflake.setDepth(-1);
      snowflake.setAlpha(0.8);
      
      // Falling animation
      this.scene.tweens.add({
        targets: snowflake,
        y: snowflake.y + 100,
        duration: Math.random() * 5000 + 3000,
        repeat: -1,
        ease: 'Linear'
      });
    }
  }

  private createPineTrees(): void {
    const positions = [400, 900, 1400, 1900, 2400, 2900];
    
    positions.forEach(x => {
      // Tree trunk
      const trunk = this.scene.add.rectangle(x, 520, 15, 60, 0x8B4513);
      trunk.setDepth(-2);
      
      // Tree layers (pine tree shape)
      for (let i = 0; i < 3; i++) {
        const layer = this.scene.add.triangle(
          x, 480 - i * 20,
          0, 30,
          -25, 0,
          25, 0,
          0x006400
        );
        layer.setDepth(-1);
      }
    });
  }

  private createCacti(): void {
    const positions = [350, 750, 1150, 1550, 1950, 2350];
    
    positions.forEach(x => {
      // Main cactus body
      const body = this.scene.add.rectangle(x, 480, 25, 80, 0x228B22);
      body.setDepth(-2);
      
      // Cactus arms
      if (Math.random() > 0.5) {
        const arm = this.scene.add.rectangle(x - 20, 460, 15, 40, 0x228B22);
        arm.setDepth(-2);
      }
      if (Math.random() > 0.5) {
        const arm = this.scene.add.rectangle(x + 20, 470, 15, 35, 0x228B22);
        arm.setDepth(-2);
      }
    });
  }

  private createSandDunes(): void {
    const positions = [200, 600, 1000, 1400, 1800, 2200];
    
    positions.forEach(x => {
      const dune = this.scene.add.graphics();
      dune.fillStyle(0xF4A460);
      dune.fillEllipse(x, 540, 200, 40);
      dune.setDepth(-3);
      dune.setAlpha(0.6);
    });
  }

  private createTrees(): void {
    const positions = [
      { x: 300, y: 520 },
      { x: 800, y: 520 },
      { x: 1500, y: 520 },
      { x: 2000, y: 520 },
      { x: 2500, y: 520 }
    ];

    positions.forEach(pos => {
      // Tree trunk
      const trunk = this.scene.add.rectangle(pos.x, pos.y - 20, 10, 40, 0x8B4513);
      trunk.setDepth(-2);
      
      // Tree leaves
      const leaves = this.scene.add.circle(pos.x, pos.y - 50, 25, 0x228B22);
      leaves.setDepth(-1);
    });
  }

  private createClouds(): void {
    const cloudPositions = [
      { x: 200, y: 100 },
      { x: 600, y: 150 },
      { x: 1000, y: 120 },
      { x: 1400, y: 140 },
      { x: 1800, y: 110 },
      { x: 2200, y: 130 },
      { x: 2600, y: 120 },
      { x: 3000, y: 100 }
    ];

    cloudPositions.forEach(pos => {
      this.createCloud(pos.x, pos.y);
    });
  }

  private createCloud(x: number, y: number): Phaser.GameObjects.Graphics {
    const cloud = this.scene.add.graphics();
    cloud.fillStyle(0xFFFFFF, 0.8);
    
    // Create cloud shape
    cloud.fillCircle(0, 0, 20);
    cloud.fillCircle(15, 0, 25);
    cloud.fillCircle(30, 0, 20);
    cloud.fillCircle(15, -10, 15);
    
    cloud.setPosition(x, y);
    cloud.setDepth(-6);
    return cloud;
  }

  private createTraps(): void {
    LEVEL_DATA.traps.forEach(trapData => {
      this.createTrap(trapData.x, trapData.y, trapData.type, trapData);
    });
  }

  private createTrap(x: number, y: number, type: string, config: any): Trap {
    const trap = new Trap(this.scene, x, y, type, config);
    this.traps.set(trap.id, trap);
    return trap;
  }

  private createPlatforms(): void {
    LEVEL_DATA.platforms.forEach(platform => {
      this.createPlatform(platform.x, platform.y, platform.width, platform.height, platform.type);
    });
  }

  private createPlatformTexture(type: string, width: number, height: number): string {
    // For now, use simple generated textures
    // Later, you can modify this to use actual tile sprites
    const graphics = this.scene.add.graphics();
    
    // Choose color based on platform type
    let fillColor: number;
    if (type === 'ground') {
      fillColor = 0x8B4513; // Brown for ground
    } else if (type === 'platform') {
      fillColor = 0x654321; // Darker brown for platforms
    } else if (type === 'falling_platform') {
      fillColor = 0xD2691E; // Orange-brown for falling platforms
    } else {
      fillColor = 0x696969; // Gray for other types
    }
    
    // Create the platform rectangle
    graphics.fillStyle(fillColor);
    graphics.fillRect(0, 0, width, height);
    
    // Add some texture/pattern
    graphics.fillStyle(0x000000, 0.2); // Semi-transparent black for texture
    for (let i = 0; i < width; i += 8) {
      for (let j = 0; j < height; j += 8) {
        if ((i + j) % 16 === 0) {
          graphics.fillRect(i, j, 4, 4);
        }
      }
    }
    
    // Generate texture from graphics
    const textureKey = `platform_${type}_${width}x${height}`;
    graphics.generateTexture(textureKey, width, height);
    graphics.destroy();
    
    return textureKey;
  }

  private createPlatform(
    x: number,
    y: number,
    width: number,
    height: number,
    type: string
  ): Phaser.Physics.Arcade.Sprite | null {
    // Boxes are handled separately to avoid duplicate sprites / physics bodies
    if (type === 'box') {
      return null; // Skip box handling here
    }

    console.log(`🏗️  Creating platform: ${type} at (${x}, ${y}) size ${width}x${height}`);

    // Use static bodies so they never respond to gravity or impulses
    const targetGroup = type === 'wall' ? this.walls : this.platforms;

    // Create texture for the platform
    const textureKey = this.createPlatformTexture(type, width, height);
    
    // Create sprite using the generated texture
    const platformSprite = this.scene.add.sprite(
      x + width / 2,
      y + height / 2,
      textureKey
    ).setOrigin(0.5);
    
    // Make sure the sprite is visible
    platformSprite.setVisible(true);
    platformSprite.setDepth(0); // Ensure it's above background but below players
    platformSprite.setAlpha(1); // Ensure it's fully opaque
    
    console.log(`🎨 Platform sprite created: ${width}x${height} at (${x + width / 2}, ${y + height / 2}) using texture: ${textureKey}`);
    console.log(`🎨 Platform sprite visible: ${platformSprite.visible}, alpha: ${platformSprite.alpha}, depth: ${platformSprite.depth}`);

    // Convert to a static physics body
    this.scene.physics.add.existing(platformSprite, true);
    targetGroup.add(platformSprite as unknown as Phaser.GameObjects.GameObject & { body: Phaser.Physics.Arcade.Body });

    console.log(`✅ Platform created successfully: ${type} with texture: ${textureKey}`);
    return platformSprite as unknown as Phaser.Physics.Arcade.Sprite;
  }

  private createBoxes(): void {
    LEVEL_DATA.platforms.forEach(platform => {
      if (platform.type === 'box') {
        this.createBox(platform.x, platform.y, platform.width, platform.height);
      }
    });
  }

  private createBox(x: number, y: number, width: number, height: number): Phaser.Physics.Arcade.Sprite {
    console.log(`📦 Creating box at (${x}, ${y}) size ${width}x${height}`);
    
    // Use box1 as default texture
    const boxTexture = 'box1';
    
    // Check if box texture exists
    if (!this.scene.textures.exists(boxTexture)) {
      console.warn(`❌ Box texture ${boxTexture} not found`);
    }
    
    const box = this.boxes.create(x + width / 2, y + height / 2, boxTexture) as Phaser.Physics.Arcade.Sprite;

    // Configure static properties
    box.setOrigin(0.5);
    box.setDisplaySize(width, height);
    box.refreshBody();

    // Custom data for gameplay
    box.setData('boxType', boxTexture);
    box.setData('canBreak', true);

    console.log(`✅ Box created successfully: ${boxTexture}`);
    return box;
  }

  private createFruits(): void {
    LEVEL_DATA.fruits.forEach(fruit => {
      this.createFruit(fruit.x, fruit.y, fruit.type);
    });
  }

  private createFruit(x: number, y: number, type: string): Phaser.Physics.Arcade.Sprite {
    console.log(`�� Creating fruit: ${type} at (${x}, ${y})`);
    
    // Check if fruit texture exists
    if (!this.scene.textures.exists(type)) {
      console.warn(`❌ Fruit texture ${type} not found`);
    }
    
    const fruit = this.fruits.create(x, y, type) as Phaser.Physics.Arcade.Sprite;

    fruit.setDisplaySize(24, 24);
    fruit.setData('fruitType', type);
    fruit.setData('value', GAME_CONSTANTS.FRUIT_VALUE);

    // Prevent fruit from falling due to gravity
    (fruit.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    // Add gentle floating animation for visual polish
    this.scene.tweens.add({
      targets: fruit,
      y: y - 5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    console.log(`✅ Fruit created successfully: ${type}`);
    return fruit;
  }

  private createEnemies(): void {
    LEVEL_DATA.enemies?.forEach(e => {
      this.createEnemy(e.x, e.y, e.type);
    });
  }

  private createEnemy(x: number, y: number, type: string): Enemy {
    const enemy = new Enemy(this.scene, x, y, type);
    this.enemies.push(enemy);
    this.enemiesGroup.add(enemy.sprite);
    return enemy;
  }

  private createCheckpoints(): void {
    LEVEL_DATA.checkpoints.forEach(checkpoint => {
      this.createCheckpoint(checkpoint.x, checkpoint.y);
    });
  }

  private createCheckpoint(x: number, y: number): Phaser.Physics.Arcade.Sprite {
    console.log(`🏁 Creating checkpoint at (${x}, ${y})`);
    
    // Check if checkpoint texture exists
    if (!this.scene.textures.exists('checkpoint')) {
      console.warn('❌ Checkpoint texture not found');
    }
    
    const checkpoint = this.scene.physics.add.sprite(x, y, 'checkpoint');
    
    // Set checkpoint properties
    checkpoint.setDisplaySize(32, 48);
    checkpoint.setImmovable(true);
    checkpoint.setData('activated', false);
    
    // Add to checkpoints group
    this.checkpoints.add(checkpoint);
    
    // Create visual representation
    this.createCheckpointGraphics(x, y);
    
    console.log('✅ Checkpoint created successfully');
    return checkpoint;
  }

  private createCheckpointGraphics(x: number, y: number): void {
    const graphics = this.scene.add.graphics();
    
    // Flag pole
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(x - 2, y - 24, 4, 48);
    
    // Flag
    graphics.fillStyle(0x32CD32);
    graphics.fillRect(x + 2, y - 20, 20, 16);
    
    // Add some details
    graphics.lineStyle(1, 0x000000, 0.5);
    graphics.strokeRect(x + 2, y - 20, 20, 16);
  }

  private createGoal(): void {
    const goalData = LEVEL_DATA.goal;
    console.log(`🎯 Creating goal at (${goalData.x}, ${goalData.y})`);
    
    // Check if goal texture exists
    if (!this.scene.textures.exists('goal')) {
      console.warn('❌ Goal texture not found');
    }
    
    this.goal = this.scene.physics.add.sprite(goalData.x, goalData.y, 'goal');
    
    // Set goal properties
    this.goal.setDisplaySize(64, 96);
    this.goal.setImmovable(true);
    
    // Create visual representation
    this.createGoalGraphics(goalData.x, goalData.y);
    
    // Add victory animation
    this.scene.tweens.add({
      targets: this.goal,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    console.log('✅ Goal created successfully');
  }

  private createGoalGraphics(x: number, y: number): void {
    const graphics = this.scene.add.graphics();
    
    // Flag pole
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(x - 4, y - 48, 8, 96);
    
    // Victory flag
    graphics.fillStyle(0xFFD700);
    graphics.fillRect(x + 4, y - 40, 40, 24);
    
    // Add sparkles
    const sparkles = [
      { x: x - 20, y: y - 20 },
      { x: x + 20, y: y - 30 },
      { x: x - 15, y: y - 40 },
      { x: x + 25, y: y - 15 }
    ];
    
    sparkles.forEach(sparkle => {
      graphics.fillStyle(0xFFFFFF);
      graphics.fillCircle(sparkle.x, sparkle.y, 3);
    });
  }

  // Getters for physics groups
  public getPlatforms(): Phaser.Physics.Arcade.StaticGroup {
    return this.platforms;
  }

  public getWalls(): Phaser.Physics.Arcade.StaticGroup {
    return this.walls;
  }

  public getBoxes(): Phaser.Physics.Arcade.StaticGroup {
    return this.boxes;
  }

  public getFruits(): Phaser.Physics.Arcade.Group {
    return this.fruits;
  }

  public getCheckpoints(): Phaser.Physics.Arcade.Group {
    return this.checkpoints;
  }

  public getTraps(): Map<string, Trap> {
    return this.traps;
  }

  public getEnemies(): Phaser.Physics.Arcade.Group {
    return this.enemiesGroup;
  }

  public getGoal(): Phaser.Physics.Arcade.Sprite {
    return this.goal;
  }

  // Update method for trap animations
  public update(): void {
    // Update parallax backgrounds
    this.backgroundLayers.forEach((layer, index) => {
      layer.tilePositionX = this.scene.cameras.main.scrollX * (0.1 + index * 0.2);
    });

    // Update enemies
    this.enemies.forEach(enemy => enemy.update());
  }

  // Trap interaction methods
  public checkTrapCollisions(player: any): void {
    this.traps.forEach(trap => {
      if (this.scene.physics.overlap(player.sprite, trap.sprite)) {
        this.handleTrapInteraction(player, trap);
      }
    });
  }

  private handleTrapInteraction(player: any, trap: Trap): void {
    const triggered = trap.triggerTrap(player);
    
    if (triggered && player.isLocal) {
      // Send network event
      this.scene.events.emit('trap_triggered', {
        playerId: player.id,
        trapId: trap.id,
        trapType: trap.type,
        damage: trap.getDamageAmount()
      });
    }
  }

  // Interaction methods
  public hitBox(box: Phaser.Physics.Arcade.Sprite): void {
    if (box.getData('canBreak')) {
      // Create break effect
      this.createBreakEffect(box.x, box.y);
      
      // Maybe spawn a fruit
      if (Math.random() < 0.3) {
        const fruitTypes = Object.values(GAME_CONSTANTS.FRUIT_TYPES);
        const randomFruit = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
        this.createFruit(box.x, box.y - 32, randomFruit);
      }
      
      // Remove box
      box.destroy();
    }
  }

  private createBreakEffect(x: number, y: number): void {
    // Create particle effect for broken box
    const particles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.3, end: 0 },
      lifespan: 800,
      quantity: 8,
      tint: 0xD2691E
    });
    
    // Clean up particles
    this.scene.time.delayedCall(800, () => {
      particles.destroy();
    });
  }

  public collectFruit(fruit: Phaser.Physics.Arcade.Sprite): string {
    const fruitType = fruit.getData('fruitType');
    
    // Create collection effect
    this.createCollectionEffect(fruit.x, fruit.y, fruitType);
    
    // Remove fruit
    fruit.destroy();
    
    return fruitType;
  }

  private createCollectionEffect(x: number, y: number, type: string): void {
    // Create sparkle effect
    const sparkles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 30, max: 80 },
      scale: { start: 0.4, end: 0 },
      lifespan: 600,
      quantity: 5,
      tint: 0xFFD700
    });
    
    // Add score text
    const scoreText = this.scene.add.text(x, y - 20, `+${GAME_CONSTANTS.FRUIT_VALUE}`, {
      fontSize: '16px',
      color: '#FFD700',
      fontStyle: 'bold'
    });
    scoreText.setOrigin(0.5);
    
    // Animate score text
    this.scene.tweens.add({
      targets: scoreText,
      y: y - 40,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        scoreText.destroy();
      }
    });
    
    // Clean up particles
    this.scene.time.delayedCall(600, () => {
      sparkles.destroy();
    });
  }

  public activateCheckpoint(checkpoint: Phaser.Physics.Arcade.Sprite): void {
    if (!checkpoint.getData('activated')) {
      checkpoint.setData('activated', true);
      
      // Change checkpoint appearance
      checkpoint.setTint(0x00FF00);
      
      // Create activation effect
      this.createActivationEffect(checkpoint.x, checkpoint.y);
    }
  }

  private createActivationEffect(x: number, y: number): void {
    // Create flash effect
    const flash = this.scene.add.graphics();
    flash.fillStyle(0x00FF00, 0.6);
    flash.fillCircle(x, y, 40);
    
    // Animate flash
    this.scene.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy();
      }
    });
  }

  public reachGoal(): void {
    // Create victory effect
    this.createVictoryEffect(this.goal.x, this.goal.y);
  }

  private createVictoryEffect(x: number, y: number): void {
    // Create fireworks effect
    const fireworks = this.scene.add.particles(x, y - 40, 'particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0 },
      lifespan: 1000,
      quantity: 15,
      tint: [0xFFD700, 0xFF69B4, 0x00FF00, 0x00BFFF]
    });
    
    // Clean up particles
    this.scene.time.delayedCall(1000, () => {
      fireworks.destroy();
    });
  }
} 