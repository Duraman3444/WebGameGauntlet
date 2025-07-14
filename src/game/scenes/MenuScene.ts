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
    
    // Show loading text
    this.loadingText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
      'Loading...', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    // Set up detailed load event tracking
    this.setupLoadEventTracking();
    
    // Try to load character assets first (real assets)
    this.loadCharacterAssets();
    
    // Load other game assets
    this.loadGameAssets();
    
    // Start the load process
    this.load.start();
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
    });

    this.load.on('loaderror', (file: any) => {
      console.warn(`❌ Failed to load asset: ${file.key} (${file.src})`);
      this.failedAssets.push(file.key);
      
      // Create placeholder for failed character assets
      if (file.key.includes('_')) {
        const [character, animation] = file.key.split('_');
        if (['pinkman', 'maskdude', 'ninjafrog', 'virtualguy', 'kinghuman', 'robot', 'adventurehero'].includes(character)) {
          console.log(`🎨 Creating placeholder for failed character asset: ${file.key}`);
          this.createCharacterPlaceholder(file.key, character, animation);
        }
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
        console.log(`❌ Failed assets:`, this.failedAssets);
      }
      
      // Clean up loading text
      if (this.loadingText) {
        this.loadingText.destroy();
      }
      
      // Create animations for all loaded characters
      this.createCharacterAnimations();
      
      // Auto-transition to game scene
      this.time.delayedCall(1000, () => {
        this.scene.start('GameScene');
      });
    });
  }

  private drawCharacterPlaceholder(ctx: CanvasRenderingContext2D, color: string, animation: string, width: number, height: number): void {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Base character body
    ctx.fillStyle = color;
    ctx.fillRect(6, 8, 20, 24);
    
    // Head
    ctx.fillStyle = color;
    ctx.fillRect(8, 2, 16, 12);
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(10, 6, 3, 3);
    ctx.fillRect(19, 6, 3, 3);
    
    // Add animation-specific details
    ctx.fillStyle = '#FFFFFF';
    switch (animation) {
      case 'idle':
        // Normal stance
        ctx.fillRect(4, 26, 6, 6); // left foot
        ctx.fillRect(22, 26, 6, 6); // right foot
        break;
      case 'run':
        // Running stance
        ctx.fillRect(2, 24, 6, 8); // left foot forward
        ctx.fillRect(24, 26, 6, 6); // right foot back
        break;
      case 'jump':
        // Jumping stance
        ctx.fillRect(2, 20, 6, 4); // left arm up
        ctx.fillRect(24, 20, 6, 4); // right arm up
        ctx.fillRect(8, 26, 6, 6); // feet together
        ctx.fillRect(18, 26, 6, 6);
        break;
      case 'fall':
        // Falling stance
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(2, 16, 6, 8); // left arm down
        ctx.fillRect(24, 16, 6, 8); // right arm down
        break;
      case 'double_jump':
        // Double jump effect
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(12, 20, 8, 4); // jump effect
        break;
      case 'wall_jump':
        // Wall jump stance
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(0, 12, 4, 8); // touching wall
        break;
      case 'hit':
        // Hit effect
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(4, 4, 24, 4); // hit flash
        break;
    }
  }

  private loadCharacterAssets(): void {
    console.log('👤 Loading character assets...');
    
    // Define character data with proper sprite dimensions
    const characterData = [
      { name: 'Pink Man', key: 'pinkman', color: '#FF69B4' },
      { name: 'Mask Dude', key: 'maskdude', color: '#8A2BE2' },
      { name: 'Ninja Frog', key: 'ninjafrog', color: '#00FF00' },
      { name: 'Virtual Guy', key: 'virtualguy', color: '#00BFFF' },
      { name: 'King Human', key: 'kinghuman', color: '#FFD700' },
      { name: 'Robot', key: 'robot', color: '#C0C0C0' },
      { name: 'Adventure Hero', key: 'adventurehero', color: '#8B4513' }
    ];
    
    const animations = [
      { name: 'Idle', key: 'idle' },
      { name: 'Run', key: 'run' },
      { name: 'Jump', key: 'jump' },
      { name: 'Fall', key: 'fall' },
      { name: 'Double Jump', key: 'double_jump' },
      { name: 'Wall Jump', key: 'wall_jump' },
      { name: 'Hit', key: 'hit' }
    ];
    
    characterData.forEach(character => {
      console.log(`👤 Loading character: ${character.name} (key: ${character.key})`);
      
      animations.forEach(animation => {
        console.log(`  🎭 Loading animation: ${animation.name}`);
        
        const rawPath = `assets/sprites/players/Main Characters/${character.name}/${animation.name} (32x32).png`;
        const encodedPath = encodeURI(rawPath);
        const assetKey = `${character.key}_${animation.key}`;
        
        console.log(`    📁 Raw path: ${rawPath}`);
        console.log(`    🔗 Encoded path: ${encodedPath}`);
        console.log(`    🔑 Asset key: ${assetKey}`);
        
        // Load as individual image files, not spritesheets
        this.load.image(assetKey, encodedPath);
      });
    });
  }

  private loadGameAssets(): void {
    // Load terrain tileset
    const terrainPath = `assets/sprites/Terrain/Terrain (16x16).png`;
    console.log(`🏔️  Loading terrain: ${encodeURI(terrainPath)}`);
    this.load.image('terrain_tileset', encodeURI(terrainPath));

    // Load fruit assets (collectibles)
    console.log('🍎 Loading fruit assets...');
    // Fix: Use actual fruit file names
    const fruits = ['Apple', 'Bananas', 'Cherries', 'Kiwi', 'Melon', 'Orange', 'Pineapple', 'Strawberry'];
    const fruitKeys = ['apple', 'bananas', 'cherries', 'kiwi', 'melon', 'orange', 'pineapple', 'strawberry'];
    
    fruits.forEach((fruit, index) => {
      const fruitPath = `assets/sprites/Items/Fruits/${fruit}.png`;
      const fruitKey = fruitKeys[index];
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
      const buttonKey = `btn_${button.toLowerCase()}`;
      const buttonPath = `assets/sprites/Menu/Buttons/${button}.png`;
      console.log(`  🔘 Loading button: ${button} -> ${buttonKey} (${buttonPath})`);
      this.load.image(buttonKey, buttonPath);
    });

    // Load trap assets
    console.log('⚡ Loading trap assets...');
    const traps = [
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
    
    traps.forEach(trap => {
      console.log(`  ⚡ Loading trap: ${trap.key} (${trap.path})`);
      this.load.image(trap.key, trap.path);
    });

    // Load Stringstar Fields level assets
    console.log('🌟 Loading Stringstar Fields level assets...');
    const stringstarAssets = [
      { key: 'bg_stringstar_0', path: 'assets/levels/stringstar_fields/background_0.png' },
      { key: 'bg_stringstar_1', path: 'assets/levels/stringstar_fields/background_1.png' },
      { key: 'bg_stringstar_2', path: 'assets/levels/stringstar_fields/background_2.png' },
      { key: 'stringstar_tileset', path: 'assets/levels/stringstar_fields/tileset.png' }
    ];
    
    stringstarAssets.forEach(asset => {
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

  private createCharacterPlaceholder(key: string, character: string, animation: string): void {
    const colors = {
      'pinkman': '#FF69B4',
      'maskdude': '#8A2BE2', 
      'ninjafrog': '#00FF00',
      'virtualguy': '#00BFFF',
      'kinghuman': '#FFD700',
      'robot': '#C0C0C0',
      'adventurehero': '#8B4513'
    };
    
    const frameWidth = 32;
    const frameHeight = 32;
    
    // Create canvas for placeholder
    const canvas = document.createElement('canvas');
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    const ctx = canvas.getContext('2d')!;
    
    // Create a character-like placeholder sprite
    this.drawCharacterPlaceholder(ctx, colors[character as keyof typeof colors] || '#FFFFFF', animation, frameWidth, frameHeight);
    
    // Convert canvas to texture and add to Phaser
    const texture = this.textures.createCanvas(key, frameWidth, frameHeight);
    if (texture) {
      const context = texture.getContext();
      context.drawImage(canvas, 0, 0);
      texture.refresh();
    }
  }

  private createCharacterAnimations(): void {
    console.log('🎭 Creating character animations...');
    
    const characters = ['pinkman', 'maskdude', 'ninjafrog', 'virtualguy', 'kinghuman', 'robot', 'adventurehero'];
    const animations = ['idle', 'run', 'jump', 'fall', 'double_jump', 'wall_jump', 'hit'];
    
    characters.forEach(character => {
      console.log(`🎭 Creating animations for character: ${character}`);
      
      animations.forEach(animation => {
        const animKey = `${character}_${animation}`;
        const textureKey = `${character}_${animation}`;
        
        // Only create animation if texture exists
        if (this.textures.exists(textureKey)) {
          // Create simple single-frame animation
          if (!this.anims.exists(animKey)) {
            this.anims.create({
              key: animKey,
              frames: [{ key: textureKey, frame: 0 }],
              frameRate: 10,
              repeat: animation === 'idle' || animation === 'run' ? -1 : 0
            });
            console.log(`  📸 Created animation: ${animKey}`);
          }
        }
      });
    });
  }
} 