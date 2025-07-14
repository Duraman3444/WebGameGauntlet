import Phaser from 'phaser';
import { GAME_CONSTANTS, COLORS } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { AssetVerifier } from '../../utils/assetVerifier';

export class MenuScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Rectangle;
  private startButtonText!: Phaser.GameObjects.Text;
  private background!: Phaser.GameObjects.Rectangle;
  private loadingText!: Phaser.GameObjects.Text;
  private assetsLoaded: boolean = false;
  private loadedAssets: string[] = [];
  private failedAssets: string[] = [];

  constructor() {
    super({ key: 'MenuScene' });
  }

  preload(): void {
    console.log('🎮 MenuScene: Starting asset preload...');
    
    // Verify assets exist before attempting to load
    this.verifyAssetsExist();
    
    // Show loading text
    this.loadingText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
      'Loading...', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // Set up detailed load event tracking
    this.setupLoadEventTracking();
    
    // Create placeholder graphics for missing assets
    this.createPlaceholderAssets();
    
    // Try to load character assets (with fallback to placeholders)
    this.loadCharacterAssets();
    
    // Load terrain and other assets
    this.loadGameAssets();
  }

  private async verifyAssetsExist(): Promise<void> {
    console.log('🔍 Verifying asset existence...');
    try {
      const { missing, found } = await AssetVerifier.verifyAssets();
      
      if (missing.length > 0) {
        console.warn('⚠️  Some assets are missing - placeholders will be used');
        const report = AssetVerifier.generateMissingAssetsReport(missing);
        console.log('📋 Missing Assets Report:\n', report);
      }
      
      console.log(`✅ Asset verification complete: ${found.length} found, ${missing.length} missing`);
    } catch (error) {
      console.error('❌ Asset verification failed:', error);
    }
  }

  private setupLoadEventTracking(): void {
    this.load.on('filecomplete', (key: string, type: string) => {
      console.log(`✅ Asset loaded successfully: ${key} (type: ${type})`);
      this.loadedAssets.push(key);
      
      // Debug spritesheet loading
      if (type === 'spritesheet') {
        const texture = this.textures.get(key);
        if (texture) {
          console.log(`  📊 Spritesheet ${key}: ${texture.frameTotal} frames`);
          // Log frame details
          if (texture.frameTotal > 1) {
            console.log(`  🎯 Spritesheet ${key} loaded successfully with ${texture.frameTotal} frames`);
          } else {
            console.warn(`  ⚠️  Spritesheet ${key} loaded but has only ${texture.frameTotal} frames - may be loaded as single image`);
          }
        } else {
          console.warn(`  ❌ Spritesheet ${key}: texture not found after loading`);
        }
      }
    });

    this.load.on('loaderror', (file: any) => {
      console.error(`❌ Asset loading failed: ${file.key} (${file.src})`);
      this.failedAssets.push(file.key);
      
      // If it's a character spritesheet that failed, try loading as single image
      if (file.key.includes('_') && (file.key.includes('pinkman') || file.key.includes('maskdude') || file.key.includes('ninjafrog') || file.key.includes('virtualguy') || file.key.includes('kinghuman') || file.key.includes('robot') || file.key.includes('adventurehero'))) {
        console.log(`  🔄 Attempting to load ${file.key} as single image instead of spritesheet`);
        // Try to load as single image
        this.load.image(file.key, file.src);
      }
    });

    this.load.on('progress', (progress: number) => {
      const percent = Math.round(progress * 100);
      console.log(`📊 Loading progress: ${percent}%`);
      if (this.loadingText) {
        this.loadingText.setText(`Loading assets... ${percent}%`);
      }
    });

    this.load.on('complete', () => {
      console.log('🎯 Asset loading complete!');
      console.log(`✅ Successfully loaded: ${this.loadedAssets.length} assets`);
      console.log(`❌ Failed to load: ${this.failedAssets.length} assets`);
      console.log(`📋 Loaded assets:`, this.loadedAssets);
      if (this.failedAssets.length > 0) {
        console.log(`📋 Failed assets:`, this.failedAssets);
      }
      
      // Create placeholder assets for any that failed to load
      this.createPlaceholderAssets();
      
      this.assetsLoaded = true;
      this.loadingText.destroy();

      // Generate Phaser animations now that all spritesheets are available
      Player.createAnimations(this);

      this.createMainMenu();
    });
  }

  private createPlaceholderAssets(): void {
    // Create placeholder spritesheets for characters
    const characters = ['pinkman', 'maskdude', 'ninjafrog', 'virtualguy', 'kinghuman', 'robot', 'adventurehero'];
    const animations = ['idle', 'run', 'jump', 'fall', 'double_jump', 'wall_jump', 'hit'];
    
    characters.forEach((character, index) => {
      const color = [0xFF69B4, 0x8A2BE2, 0x00FF00, 0x00BFFF, 0xFFD700, 0xC0C0C0, 0x8B4513][index];
      
      animations.forEach(animation => {
        const key = `${character}_${animation}`;
        
        // Skip if the asset was loaded successfully
        if (this.textures.exists(key)) {
          return;
        }
        
        console.log(`🎨 Creating placeholder spritesheet for ${key}`);
        
        // Create a simple single-frame texture for placeholders
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d')!;
        
        // Base character color
        ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, 32, 32);
        
        // Add animation-specific details
        ctx.fillStyle = '#ffffff';
        switch (animation) {
          case 'idle':
            ctx.fillRect(12, 8, 8, 8);
            break;
          case 'run':
            ctx.fillRect(8, 24, 6, 4);
            ctx.fillRect(18, 24, 6, 4);
            break;
          case 'jump':
            ctx.fillRect(4, 8, 4, 8);
            ctx.fillRect(24, 8, 4, 8);
            break;
          case 'fall':
            ctx.fillRect(4, 16, 4, 8);
            ctx.fillRect(24, 16, 4, 8);
            break;
          case 'wall_jump':
            ctx.fillRect(28, 8, 4, 16);
            break;
          case 'hit':
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(8, 8, 16, 16);
            break;
        }
        
        // Convert canvas to texture
        const texture = this.textures.addCanvas(key, canvas);
        
        // Single-frame texture is ready to use - no additional frame setup needed
      });
    });
    
    // Create placeholder terrain if needed
    if (!this.textures.exists('terrain_tileset')) {
      const terrainGraphics = this.add.graphics();
      terrainGraphics.fillStyle(0x8B4513);
      terrainGraphics.fillRect(0, 0, 16, 16);
      terrainGraphics.generateTexture('terrain_tileset', 16, 16);
      terrainGraphics.destroy();
    }
    
    // Create placeholder fruit assets if needed
    const fruits = ['apple', 'bananas', 'cherries', 'kiwi', 'melon', 'orange', 'pineapple', 'strawberry'];
    const fruitColors = [0xFF0000, 0xFFFF00, 0xFF1493, 0x8FBC8F, 0x90EE90, 0xFFA500, 0xFFD700, 0xFF69B4];
    
    fruits.forEach((fruit, index) => {
      if (!this.textures.exists(fruit)) {
        const fruitGraphics = this.add.graphics();
        fruitGraphics.fillStyle(fruitColors[index]);
        fruitGraphics.fillCircle(12, 12, 12);
        fruitGraphics.fillStyle(0xFFFFFF, 0.3);
        fruitGraphics.fillCircle(8, 8, 4);
        fruitGraphics.generateTexture(fruit, 24, 24);
        fruitGraphics.destroy();
      }
    });
    
    // Create placeholder box assets if needed
    const boxes = ['box1', 'box2', 'box3'];
    const boxColors = [0xD2691E, 0xCD853F, 0xA0522D];
    
    boxes.forEach((box, index) => {
      if (!this.textures.exists(box)) {
        const boxGraphics = this.add.graphics();
        boxGraphics.fillStyle(boxColors[index]);
        boxGraphics.fillRect(0, 0, 32, 32);
        boxGraphics.lineStyle(2, 0x000000, 0.5);
        boxGraphics.strokeRect(0, 0, 32, 32);
        boxGraphics.generateTexture(box, 32, 32);
        boxGraphics.destroy();
      }
    });
  }

  private loadCharacterAssets(): void {
    console.log('👤 Loading character assets...');
    
    // Try to load real character assets, fall back to placeholders if not found
    const characters = ['Pink Man', 'Mask Dude', 'Ninja Frog', 'Virtual Guy', 'King Human', 'Robot', 'Adventure Hero'];
    const characterKeys = ['pinkman', 'maskdude', 'ninjafrog', 'virtualguy', 'kinghuman', 'robot', 'adventurehero'];
    const animations = ['Idle', 'Run', 'Jump', 'Fall', 'Double Jump', 'Wall Jump', 'Hit'];
    
    characters.forEach((character, index) => {
      const characterKey = characterKeys[index];
      console.log(`👤 Loading character: ${character} (key: ${characterKey})`);
      
      animations.forEach(animation => {
        const animationKey = animation.toLowerCase().replace(' ', '_');
        // NOTE: Assets are located under public/assets/sprites/players/Main Characters/
        // Use encodeURI to handle spaces and parentheses in filenames.
        const rawPath = `assets/sprites/players/Main Characters/${character}/${animation} (32x32).png`;
        const assetPath = encodeURI(rawPath);
        const finalKey = `${characterKey}_${animationKey}`;
        
        console.log(`  🎭 Loading animation: ${animation}`);
        console.log(`    📁 Raw path: ${rawPath}`);
        console.log(`    🔗 Encoded path: ${assetPath}`);
        console.log(`    🔑 Asset key: ${finalKey}`);
        
        // Load as image first - we'll handle spritesheets vs single images in the animation system
        this.load.image(finalKey, assetPath);
        
        // Remove the spritesheet loading attempt for now
        // this.load.spritesheet(finalKey, assetPath, {
        //   frameWidth: 32,
        //   frameHeight: 32
        // });
        
        // Also try loading as single image as fallback
        // this.load.on('loaderror', (file: any) => {
        //   if (file.key === finalKey) {
        //     console.log(`  🔄 ${finalKey} failed as spritesheet, trying as single image`);
        //     this.load.image(finalKey, assetPath);
        //   }
        // });
      });
    });
  }

  private loadGameAssets(): void {
    console.log('🎮 Loading game assets...');
    
    // Load terrain assets (encode URI for special characters)
    const terrainPath = encodeURI('assets/sprites/Terrain/Terrain (16x16).png');
    console.log(`🏔️  Loading terrain: ${terrainPath}`);
    this.load.image('terrain_tileset', terrainPath);
    
    // Load fruit assets
    console.log('🍎 Loading fruit assets...');
    const fruits = ['Apple', 'Bananas', 'Cherries', 'Kiwi', 'Melon', 'Orange', 'Pineapple', 'Strawberry'];
    fruits.forEach(fruit => {
      const fruitPath = `assets/sprites/Items/Fruits/${fruit}.png`;
      const fruitKey = fruit.toLowerCase();
      console.log(`  🍓 Loading fruit: ${fruit} -> ${fruitKey} (${fruitPath})`);
      this.load.image(fruitKey, fruitPath);
    });

    // Load box assets (question/brick block replacements)
    console.log('📦 Loading box assets...');
    const boxes = ['Box1', 'Box2', 'Box3'];
    boxes.forEach((box, idx) => {
      const boxKey = `box${idx + 1}`;
      const boxPath = `assets/sprites/Items/Boxes/${box}/Idle.png`;
      console.log(`  📦 Loading box: ${box} -> ${boxKey} (${boxPath})`);
      this.load.image(boxKey, boxPath);
      
      // Also load the break animation
      const breakKey = `box${idx + 1}_break`;
      const breakPath = `assets/sprites/Items/Boxes/${box}/Break.png`;
      console.log(`  💥 Loading box break: ${box} -> ${breakKey} (${breakPath})`);
      this.load.image(breakKey, breakPath);
    });
    
    // Load background assets
    console.log('🌄 Loading background assets...');
    const backgrounds = ['Blue', 'Brown', 'Gray', 'Green', 'Pink', 'Purple', 'Yellow'];
    backgrounds.forEach(bg => {
      const bgKey = `bg_${bg.toLowerCase()}`;
      const bgPath = `assets/sprites/Background/${bg}.png`;
      console.log(`  🌈 Loading background: ${bg} -> ${bgKey} (${bgPath})`);
      this.load.image(bgKey, bgPath);
    });
    
    // Load professional button assets
    console.log('🔘 Loading button assets...');
    const buttons = ['Play', 'Back', 'Next', 'Previous', 'Settings', 'Restart', 'Levels', 'Achievements', 'Leaderboard', 'Close', 'Volume'];
    buttons.forEach(button => {
      const btnKey = `btn_${button.toLowerCase()}`;
      const btnPath = `assets/sprites/Menu/Buttons/${button}.png`;
      console.log(`  🔘 Loading button: ${button} -> ${btnKey} (${btnPath})`);
      this.load.image(btnKey, btnPath);
    });
    
    // Load trap assets with proper path encoding
    console.log('⚡ Loading trap assets...');
    const trapAssets = [
      { key: 'spike_idle', path: 'assets/sprites/Traps/Spikes/Idle.png' },
      { key: 'fire_off', path: 'assets/sprites/Traps/Fire/Off.png' },
      { key: 'fire_on', path: encodeURI('assets/sprites/Traps/Fire/On (16x32).png') },
      { key: 'fire_hit', path: encodeURI('assets/sprites/Traps/Fire/Hit (16x32).png') },
      { key: 'saw_on', path: encodeURI('assets/sprites/Traps/Saw/On (38x38).png') },
      { key: 'saw_off', path: 'assets/sprites/Traps/Saw/Off.png' },
      { key: 'saw_chain', path: 'assets/sprites/Traps/Saw/Chain.png' },
      { key: 'trampoline_idle', path: 'assets/sprites/Traps/Trampoline/Idle.png' },
      { key: 'trampoline_jump', path: encodeURI('assets/sprites/Traps/Trampoline/Jump (28x28).png') },
      { key: 'falling_platform_on', path: encodeURI('assets/sprites/Traps/Falling Platforms/On (32x10).png') },
      { key: 'falling_platform_off', path: 'assets/sprites/Traps/Falling Platforms/Off.png' }
    ];
    
    trapAssets.forEach(trap => {
      console.log(`  ⚡ Loading trap: ${trap.key} (${trap.path})`);
      this.load.image(trap.key, trap.path);
    });
    
    // Load Stringstar Fields level assets
    console.log('🌟 Loading Stringstar Fields level assets...');
    const stringsStarAssets = [
      { key: 'bg_stringstar_0', path: 'assets/levels/stringstar_fields/background_0.png' },
      { key: 'bg_stringstar_1', path: 'assets/levels/stringstar_fields/background_1.png' },
      { key: 'bg_stringstar_2', path: 'assets/levels/stringstar_fields/background_2.png' },
      { key: 'stringstar_tileset', path: 'assets/levels/stringstar_fields/tileset.png' }
    ];
    
    stringsStarAssets.forEach(asset => {
      console.log(`  🌟 Loading Stringstar asset: ${asset.key} (${asset.path})`);
      this.load.image(asset.key, asset.path);
    });
  }

  create(): void {
    // Wait for assets to load
    if (!this.assetsLoaded) {
      return;
    }
    
    this.createMainMenu();
  }

  private createMainMenu(): void {
    const { width, height } = this.cameras.main;
    
    // Create colorful background
    this.background = this.add.rectangle(width / 2, height / 2, width, height, 0x87CEEB);
    
    // Add some background decorations
    this.createBackgroundDecorations();
    
    // Create title
    this.titleText = this.add.text(width / 2, height / 4, 'Fruit Runners', {
      fontSize: '56px',
      color: '#FFD700',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Create subtitle
    this.add.text(width / 2, height / 4 + 60, 'A 2D Platformer Adventure', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Add level selection
    this.createLevelSelection();
    
    // Show character previews
    this.showCharacterPreviews();
    
    // Create professional start button using loaded asset
    try {
      this.startButton = this.add.image(width / 2, height / 2 + 100, 'btn_play') as any;
      this.startButton.setScale(2.5); // Make it bigger
    } catch (error) {
      // Fallback to rectangle if button asset not found
      this.startButton = this.add.rectangle(width / 2, height / 2 + 100, 250, GAME_CONSTANTS.BUTTON_HEIGHT, 0x32CD32);
    }
    
    this.startButton.setInteractive();
    this.startButton.on('pointerdown', this.startGame, this);
    this.startButton.on('pointerover', this.onButtonHover, this);
    this.startButton.on('pointerout', this.onButtonOut, this);
    
    this.startButtonText = this.add.text(width / 2, height / 2 + 100, 'Start Game', {
      fontSize: '28px',
      color: '#FFFFFF',
      fontFamily: 'Arial Bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Add feature descriptions with trap information
    this.add.text(width / 2, height - 150, 
      '• Multiple themed levels (Grassland, Caves, City, Space)\n• Double Jump and Wall Jump mechanics\n• Avoid dangerous spikes, fire, and spinning saws\n• Use trampolines for super jumps\n• Collect fruits and break boxes for points\n• Reach checkpoints to save progress', {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 8,
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);
    
    // Add controls
    this.add.text(width / 2, height - 40, 
      'Controls: WASD/Arrow Keys to move • SPACE/W/UP to jump • Hold direction key against wall to wall slide', {
      fontSize: '12px',
      color: '#CCCCCC',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    
    // Add title animation
    this.tweens.add({
      targets: this.titleText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 2000,
      ease: 'Power2',
      yoyo: true,
      repeat: -1
    });
  }

  private createLevelSelection(): void {
    const { width, height } = this.cameras.main;
    
    // Level selection title
    this.add.text(width / 2, height / 2 - 80, 'Select Level:', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial Bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Level buttons
    const levels = [
      { name: 'Green Hills', color: 0x90EE90, key: 'grassland' },
      { name: 'Crystal Caves', color: 0x8B4513, key: 'cave' },
      { name: 'Central City', color: 0x4169E1, key: 'city' },
      { name: 'Stringstar Fields', color: 0xFF69B4, key: 'stringstar' }
    ];
    
    levels.forEach((level, index) => {
      const x = width / 2 - 180 + (index * 120);
      const y = height / 2 - 40;
      
      // Level button
      const levelButton = this.add.rectangle(x, y, 100, 40, level.color);
      levelButton.setInteractive();
      levelButton.setStrokeStyle(2, 0x000000);
      
      // Level name
      const levelText = this.add.text(x, y, level.name, {
        fontSize: '12px',
        color: '#FFFFFF',
        fontFamily: 'Arial Bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 1
      }).setOrigin(0.5);
      
      // Button interactions
      levelButton.on('pointerover', () => {
        levelButton.setScale(1.1);
        levelText.setScale(1.1);
      });
      
      levelButton.on('pointerout', () => {
        levelButton.setScale(1);
        levelText.setScale(1);
      });
      
      levelButton.on('pointerdown', () => {
        // Store selected level theme
        this.registry.set('selectedLevel', level.key);
        console.log(`🌍 Selected level theme: ${level.name}`);
      });
    });
  }

  private createBackgroundDecorations(): void {
    const { width, height } = this.cameras.main;
    
    // Add some clouds
    for (let i = 0; i < 5; i++) {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xFFFFFF, 0.8);
      cloud.fillCircle(0, 0, 20);
      cloud.fillCircle(15, 0, 25);
      cloud.fillCircle(30, 0, 20);
      cloud.fillCircle(15, -10, 15);
      
      cloud.setPosition(
        Math.random() * width,
        50 + Math.random() * 100
      );
      
      // Animate clouds
      this.tweens.add({
        targets: cloud,
        x: width + 100,
        duration: 20000 + Math.random() * 10000,
        repeat: -1,
        ease: 'Linear'
      });
    }
    
    // Add some floating fruits
    const fruitTypes = ['apple', 'banana', 'cherry', 'orange'];
    for (let i = 0; i < 6; i++) {
      const fruitType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
      const fruit = this.add.image(
        Math.random() * width,
        height / 2 + Math.random() * 100,
        fruitType
      );
      fruit.setScale(0.8);
      fruit.setAlpha(0.6);
      
      // Animate fruits
      this.tweens.add({
        targets: fruit,
        y: fruit.y - 10,
        duration: 1000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private showCharacterPreviews(): void {
    const { width, height } = this.cameras.main;
    const characters = ['pinkman', 'maskdude', 'ninjafrog', 'virtualguy', 'kinghuman', 'robot', 'adventurehero'];
    const characterNames = ['Pink Man', 'Mask Dude', 'Ninja Frog', 'Virtual Guy', 'King Human', 'Robot', 'Adventure Hero'];
    
    // Show character selection preview
    this.add.text(width / 2, height / 2 - 50, 'Choose Your Character:', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial Bold'
    }).setOrigin(0.5);
    
    // Display characters in two rows
    characters.forEach((character, index) => {
      const isTopRow = index < 4;
      const rowIndex = isTopRow ? index : index - 4;
      const rowWidth = isTopRow ? 4 : 3;
      
      const x = width / 2 - (rowWidth * 80) / 2 + (rowIndex * 80) + 40;
      const y = height / 2 + (isTopRow ? 0 : 60);
      
      // Character sprite
      const sprite = this.add.image(x, y, `${character}_idle`);
      sprite.setScale(1.2);
      
      // Character name
      this.add.text(x, y + 25, characterNames[index], {
        fontSize: '10px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        align: 'center'
      }).setOrigin(0.5);
      
      // Add player number
      this.add.text(x, y - 25, `P${index + 1}`, {
        fontSize: '14px',
        color: '#FFD700',
        fontFamily: 'Arial Bold'
      }).setOrigin(0.5);
      
      // Add idle animation
      this.tweens.add({
        targets: sprite,
        scaleX: 1.6,
        scaleY: 1.6,
        duration: 1500 + index * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private startGame(): void {
    this.scene.start('GameScene');
  }

  private onButtonHover(): void {
    if (this.startButton instanceof Phaser.GameObjects.Image) {
      this.startButton.setTint(0xAAFFAA);
    } else {
      (this.startButton as Phaser.GameObjects.Rectangle).setFillStyle(0x228B22);
    }
    this.startButton.setScale(this.startButton.scaleX * 1.05);
  }

  private onButtonOut(): void {
    if (this.startButton instanceof Phaser.GameObjects.Image) {
      this.startButton.clearTint();
    } else {
      (this.startButton as Phaser.GameObjects.Rectangle).setFillStyle(0x32CD32);
    }
    this.startButton.setScale(this.startButton.scaleX / 1.05);
  }
} 