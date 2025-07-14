import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { AssetPaths } from '../../utils/assetPaths';

export class MenuScene extends Phaser.Scene {
  private selectedCharacter: string = 'pinkman';
  private selectedMode: string = 'single';
  private characterSprites: Phaser.GameObjects.Sprite[] = [];
  private menuCursor: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image | null = null;
  private currentSelection: number = 0;
  private menuOptions: string[] = ['1 PLAYER GAME', '2 PLAYER GAME', 'CHARACTER SELECT', 'STAGE SELECT', 'STAGE EDITOR', 'SETTINGS'];
  private characterPreview: Phaser.GameObjects.Sprite | null = null;
  private characterNames: string[] = ['PINK MAN', 'MASK DUDE', 'NINJA FROG', 'VIRTUAL GUY', 'ADVENTURE HERO', 'ROBOT', 'CAPTAIN CLOWN NOSE', 'KING HUMAN'];
  private characters: string[] = ['pinkman', 'maskdude', 'ninjafrog', 'virtualguy', 'adventurehero', 'robot', 'captainclownnose', 'kinghuman'];
  private currentCharacterIndex: number = 0;
  private gameTitle: Phaser.GameObjects.Text | null = null;
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private backgroundSprite: Phaser.GameObjects.TileSprite | null = null;
  private showingCharacterSelect: boolean = false;
  private characterNameText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'MenuScene' });
  }

  preload(): void {
    console.log('🎮 MenuScene: Starting asset preload...');
    
    // Load background
    this.load.image('background_blue', AssetPaths.background('Blue'));
    this.load.image('background_green', AssetPaths.background('Green'));
    this.load.image('background_pink', AssetPaths.background('Pink'));
    this.load.image('background_purple', AssetPaths.background('Purple'));
    this.load.image('background_yellow', AssetPaths.background('Yellow'));
    
    // Load Wood and Paper UI assets
    console.log('🎨 Loading Wood and Paper UI assets...');
    
    // Load banners for title
    this.load.image('big_banner_1', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Big Banner/1.png');
    this.load.image('big_banner_2', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Big Banner/2.png');
    this.load.image('big_banner_3', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Big Banner/3.png');
    
    // Load buttons
    this.load.image('yellow_button_1', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Yellow Button/1.png');
    this.load.image('yellow_button_2', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Yellow Button/2.png');
    this.load.image('yellow_button_3', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Yellow Button/3.png');
    this.load.image('yellow_button_4', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Yellow Button/4.png');
    
    // Load green buttons for different states
    this.load.image('green_button_1', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Green Button/1.png');
    this.load.image('green_button_2', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Green Button/2.png');
    this.load.image('green_button_3', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Green Button/3.png');
    
    // Load paper backgrounds
    this.load.image('yellow_paper_1', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Yellow Paper/1.png');
    this.load.image('yellow_paper_2', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Yellow Paper/2.png');
    this.load.image('yellow_paper_3', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Yellow Paper/3.png');
    this.load.image('yellow_paper_4', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Yellow Paper/4.png');
    
    // Load small banners for character selection
    this.load.image('small_banner_1', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Small Banner/1.png');
    this.load.image('small_banner_2', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Small Banner/2.png');
    this.load.image('small_banner_3', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Small Banner/3.png');
    
    // Load character assets
    console.log('👤 Loading character assets...');
    const characters = ['pinkman', 'maskdude', 'ninjafrog', 'virtualguy', 'adventurehero', 'robot', 'captainclownnose', 'kinghuman'];
    
    characters.forEach(character => {
      const idleKey = `${character}_idle`;
      const runKey = `${character}_run`;
      const jumpKey = `${character}_jump`;
      const fallKey = `${character}_fall`;
      const hitKey = `${character}_hit`;
      
      // Load idle animation
      this.load.spritesheet(idleKey, AssetPaths.characterSpritesheet(character, 'Idle'), {
        frameWidth: 32,
        frameHeight: 32
      });
      
      // Load run animation
      this.load.spritesheet(runKey, AssetPaths.characterSpritesheet(character, 'Run'), {
        frameWidth: 32,
        frameHeight: 32
      });
      
      // Load jump animation
      this.load.spritesheet(jumpKey, AssetPaths.characterSpritesheet(character, 'Jump'), {
        frameWidth: 32,
        frameHeight: 32
      });
      
      // Load fall animation
      this.load.spritesheet(fallKey, AssetPaths.characterSpritesheet(character, 'Fall'), {
        frameWidth: 32,
        frameHeight: 32
      });
      
      // Load hit animation
      this.load.spritesheet(hitKey, AssetPaths.characterSpritesheet(character, 'Hit'), {
        frameWidth: 32,
        frameHeight: 32
      });
    });
    
    // Load game assets
    console.log('🎮 Loading game assets...');
    
    // Load seasonal tilesets
    this.load.spritesheet('grassland_tileset', AssetPaths.seasonalTileset('1 - Grassland'), {
      frameWidth: 16,
      frameHeight: 16
    });
    
    this.load.spritesheet('autumn_tileset', AssetPaths.seasonalTileset('2 - Autumn Forest'), {
      frameWidth: 16,
      frameHeight: 16
    });
    
    this.load.spritesheet('tropics_tileset', AssetPaths.seasonalTileset('3 - Tropics'), {
      frameWidth: 16,
      frameHeight: 16
    });
    
    this.load.spritesheet('winter_tileset', AssetPaths.seasonalTileset('4 - Winter World'), {
      frameWidth: 16,
      frameHeight: 16
    });
    
    // Load terrain tileset as fallback
    this.load.image('terrain_tileset', AssetPaths.terrain('Terrain (16x16).png'));
    
    // Load fruits
    const fruits = ['apple', 'bananas', 'cherries', 'kiwi', 'melon', 'orange', 'pineapple', 'strawberry'];
    fruits.forEach(fruit => {
      this.load.image(fruit, AssetPaths.fruit(fruit));
    });
    
    // Load sound effects
    this.load.audio('coin_sound', AssetPaths.sound('coin'));
    this.load.audio('jump_sound', AssetPaths.sound('jump'));
    this.load.audio('hurt_sound', AssetPaths.sound('hurt'));
    this.load.audio('explosion_sound', AssetPaths.sound('explosion'));
    this.load.audio('powerup_sound', AssetPaths.sound('powerup'));
    this.load.audio('stomp_sound', AssetPaths.sound('stomp'));
    
    // Load music
    this.load.audio('time_for_adventure', AssetPaths.music('time_for_adventure'));
    
    // Set up load event handlers
    this.setupLoadEventHandlers();
  }

  private setupLoadEventHandlers(): void {
    this.load.on('complete', () => {
      console.log('🎯 Asset loading complete!');
      this.createTitleScreen();
    });

    this.load.on('loaderror', (file: any) => {
      console.warn(`❌ Failed to load asset: ${file.key}`);
      // Create placeholder for failed character assets
      if (file.key.includes('_')) {
        this.createCharacterPlaceholder(file.key);
      }
    });
  }

  private createCharacterPlaceholder(key: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    
    // Simple colored rectangle as placeholder
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#000000';
    ctx.fillRect(10, 6, 3, 3);
    ctx.fillRect(19, 6, 3, 3);
    
    const texture = this.textures.createCanvas(key, 32, 32);
    if (texture) {
      const context = texture.getContext();
      context.drawImage(canvas, 0, 0);
      texture.refresh();
    }
  }

  private loadCharacterAssets(): void {
    console.log('👤 Loading character assets...');
    
    const characterData = [
      { name: 'Pink Man', key: 'pinkman' },
      { name: 'Mask Dude', key: 'maskdude' },
      { name: 'Ninja Frog', key: 'ninjafrog' },
      { name: 'Virtual Guy', key: 'virtualguy' },
      { name: 'Adventure Hero', key: 'adventurehero' },
      { name: 'Robot', key: 'robot' },
      { name: 'Captain Clown Nose', key: 'captainclownnose' },
      { name: 'King Human', key: 'kinghuman' }
    ];
    
    const animations = [
      { name: 'Idle', key: 'idle' },
      { name: 'Run', key: 'run' },
      { name: 'Jump', key: 'jump' }
    ];
    
    characterData.forEach(character => {
      animations.forEach(animation => {
        const rawPath = AssetPaths.player(character.name, animation.name);
        const encodedPath = encodeURI(rawPath);
        const assetKey = `${character.key}_${animation.key}`;
        
        this.load.image(assetKey, encodedPath);
      });
    });
  }

  private loadGameAssets(): void {
    console.log('🎮 Loading game assets...');
    
    // Load backgrounds
    const backgrounds = ['Blue', 'Brown', 'Gray', 'Green', 'Pink', 'Purple', 'Yellow'];
    backgrounds.forEach(bg => {
      const bgKey = `bg_${bg.toLowerCase()}`;
      const bgPath = AssetPaths.background(bg);
      this.load.image(bgKey, bgPath);
    });
    
    // Load terrain tileset as spritesheet
    const terrainPath = AssetPaths.terrain('Terrain (16x16).png');
    this.load.spritesheet('terrain_tileset', encodeURI(terrainPath), {
      frameWidth: 16,
      frameHeight: 16
    });
    
    // Load seasonal tilesets for better visuals
    const seasonalTilesets = [
      { key: 'grassland_tileset', season: '1 - Grassland' },
      { key: 'autumn_tileset', season: '2 - Autumn Forest' },
      { key: 'tropics_tileset', season: '3 - Tropics' },
      { key: 'winter_tileset', season: '4 - Winter World' }
    ];
    
    seasonalTilesets.forEach(tileset => {
      const seasonalPath = AssetPaths.seasonalTileset(tileset.season);
      this.load.spritesheet(tileset.key, encodeURI(seasonalPath), {
        frameWidth: 16,
        frameHeight: 16
      });
    });
  }

  private createTitleScreen(): void {
    console.log('🎨 Creating title screen...');
    
    // Create background
    this.createScrollingBackground();
    
    // Create ground
    this.createGround();
    
    // Create title
    this.createTitle();
    
    // Create menu options
    this.createMenu();
    
    // Create character preview
    this.createCharacterPreview();
    
    // Set up input handling
    this.setupInput();
    
    // Create animations
    this.createAnimations();
  }

  private createScrollingBackground(): void {
    // Create a tiled background that scrolls
    const bg = this.add.rectangle(0, 0, this.cameras.main.width * 2, this.cameras.main.height, 0x5c94fc);
    bg.setOrigin(0, 0);
    
    // Add some clouds
    for (let i = 0; i < 8; i++) {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff);
      cloud.fillRoundedRect(0, 0, 80, 40, 20);
      cloud.setPosition(i * 200 + 100, 100 + Math.random() * 200);
      cloud.setAlpha(0.8);
    }
  }

  private createGround(): void {
    // Create ground at bottom like Mario
    const groundY = this.cameras.main.height - 100;
    
    // Create ground tiles
    for (let x = 0; x < this.cameras.main.width; x += 32) {
      for (let y = groundY; y < this.cameras.main.height; y += 32) {
        const tile = this.add.rectangle(x, y, 32, 32, 0x8B4513);
        tile.setOrigin(0, 0);
        tile.setStrokeStyle(2, 0x654321);
      }
    }
  }

  private createTitle(): void {
    const centerX = this.cameras.main.width / 2;
    
    // Create title using Wood and Paper UI banner
    const titleBanner = this.add.image(centerX, 200, 'big_banner_2');
    titleBanner.setScale(4); // Make it bigger for title
    
    // Main title text
    this.gameTitle = this.add.text(centerX, 170, 'SUPER', {
      fontSize: '28px',
      color: '#8B4513',
      fontFamily: 'Arial Black',
      stroke: '#FFFFFF',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    const subtitle = this.add.text(centerX, 200, 'FRUIT RUNNERS', {
      fontSize: '24px',
      color: '#654321',
      fontFamily: 'Arial Black',
      stroke: '#FFFFFF',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Copyright with paper background
    const copyrightPaper = this.add.image(centerX, 240, 'yellow_paper_1');
    copyrightPaper.setScale(2);
    
    this.add.text(centerX, 240, '©2024 FRUIT RUNNERS', {
      fontSize: '12px',
      color: '#654321',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  private createMenu(): void {
    const centerX = this.cameras.main.width / 2;
    const startY = 350;
    
    // Create menu options with Wood and Paper UI buttons
    this.menuOptions.forEach((option, index) => {
      const y = startY + (index * 50);
      
      // Create button background using Wood and Paper UI
      const buttonBg = this.add.image(centerX, y, 'yellow_button_1');
      buttonBg.setScale(3, 2); // Scale to fit text
      
      // Create menu text
      const menuText = this.add.text(centerX, y, option, {
        fontSize: '18px',
        color: '#654321',
        fontFamily: 'Arial Black',
        stroke: '#FFFFFF',
        strokeThickness: 1
      }).setOrigin(0.5);
      
      this.menuTexts.push(menuText);
      
      // Store button background for hover effects
      (menuText as any).buttonBg = buttonBg;
    });
    
    // Create cursor using a small Wood and Paper UI element
    this.menuCursor = this.add.image(centerX - 120, startY, 'small_banner_1');
    this.menuCursor.setScale(1.5);
    this.updateCursorPosition();
  }

  private createCharacterPreview(): void {
    const centerX = this.cameras.main.width / 2;
    const previewY = this.cameras.main.height - 200; // Position closer to bottom
    
    // Character preview using Wood and Paper UI background
    const previewBg = this.add.image(centerX, previewY, 'yellow_paper_3');
    previewBg.setScale(4, 3); // Scale to fit character and text
    
    // Create single character sprite that will update
    const characterKey = `${this.selectedCharacter}_idle`;
    if (this.textures.exists(characterKey)) {
      this.characterPreview = this.add.sprite(centerX, previewY - 20, characterKey);
      this.characterPreview.setScale(3); // Make it bigger and centered
    } else {
      // Create placeholder if texture doesn't exist
      this.characterPreview = this.add.rectangle(centerX, previewY - 20, 32, 32, 0xFF69B4) as any;
      (this.characterPreview as any).setScale(3);
    }
    
    // Character name with Wood and Paper UI banner
    const nameBanner = this.add.image(centerX, previewY + 35, 'small_banner_2');
    nameBanner.setScale(2);
    
    this.characterNameText = this.add.text(centerX, previewY + 35, this.characterNames[this.currentCharacterIndex], {
      fontSize: '14px',
      color: '#654321',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    // Instructions with paper background
    const instructionsBg = this.add.image(centerX, previewY + 60, 'yellow_paper_2');
    instructionsBg.setScale(3, 1.5);
    
    this.add.text(centerX, previewY + 60, 'LEFT/RIGHT: Choose Character', {
      fontSize: '12px',
      color: '#654321',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  private setupInput(): void {
    // Keyboard input
    this.input.keyboard?.on('keydown-UP', () => {
      if (!this.showingCharacterSelect) {
        this.navigateMenu(-1);
      }
    });
    
    this.input.keyboard?.on('keydown-DOWN', () => {
      if (!this.showingCharacterSelect) {
        this.navigateMenu(1);
      }
    });
    
    this.input.keyboard?.on('keydown-LEFT', () => {
      if (this.showingCharacterSelect) {
        this.changeCharacter(-1);
      }
    });
    
    this.input.keyboard?.on('keydown-RIGHT', () => {
      if (this.showingCharacterSelect) {
        this.changeCharacter(1);
      }
    });
    
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.selectOption();
    });
    
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.selectOption();
    });
  }

  private navigateMenu(direction: number): void {
    this.currentSelection = (this.currentSelection + direction + this.menuOptions.length) % this.menuOptions.length;
    this.updateCursorPosition();
  }

  private changeCharacter(direction: number): void {
    this.currentCharacterIndex = (this.currentCharacterIndex + direction + this.characters.length) % this.characters.length;
    this.selectedCharacter = this.characters[this.currentCharacterIndex];
    this.updateCharacterPreview();
  }

  private updateCursorPosition(): void {
    if (this.menuCursor) {
      const centerX = this.cameras.main.width / 2;
      const startY = 350;
      this.menuCursor.setPosition(centerX - 120, startY + (this.currentSelection * 50));
    }
  }

  private updateCharacterPreview(): void {
    if (this.characterPreview) {
      const characterKey = `${this.selectedCharacter}_idle`;
      if (this.textures.exists(characterKey)) {
        this.characterPreview.setTexture(characterKey);
      }
    }
    if (this.characterNameText) {
      this.characterNameText.setText(this.characterNames[this.currentCharacterIndex]);
    }
  }

  private selectOption(): void {
    switch (this.currentSelection) {
      case 0: // 1 Player Game
        this.selectedMode = 'single';
        this.startGame();
        break;
      case 1: // 2 Player Game
        this.selectedMode = 'multi';
        this.startGame();
        break;
      case 2: // Character Select
        this.showingCharacterSelect = !this.showingCharacterSelect;
        this.updateMenuVisibility();
        break;
      case 3: // Stage Select
        this.showStageSelect();
        break;
      case 4: // Stage Editor
        this.showStageEditor();
        break;
      case 5: // Settings
        this.showSettings();
        break;
    }
  }

  private updateMenuVisibility(): void {
    this.menuTexts.forEach((text, index) => {
      if (index === 2) { // Character Select option
        text.setColor(this.showingCharacterSelect ? '#FFFF00' : '#FFFFFF');
      }
    });
  }

  private showStageSelect(): void {
    console.log('🎭 Showing stage select screen...');
    
    // Store selected character and mode in registry
    this.registry.set('selectedCharacter', this.selectedCharacter);
    this.registry.set('gameMode', this.selectedMode);
    
    // Transition to stage select scene
    this.scene.start('StageSelectScene');
  }

  private showStageEditor(): void {
    console.log('🛠️  Opening Stage Editor...');

    // Store current selections in registry if needed
    this.registry.set('selectedCharacter', this.selectedCharacter);
    this.registry.set('gameMode', this.selectedMode);

    this.scene.start('StageEditorScene');
  }

  private showSettings(): void {
    console.log('⚙️ Showing settings screen...');
    
    // Transition to settings scene
    this.scene.start('SettingsScene');
  }

  private startGame(): void {
    console.log(`🚀 Starting game with character: ${this.selectedCharacter}, mode: ${this.selectedMode}`);
    
    // Store selected character and mode in registry
    this.registry.set('selectedCharacter', this.selectedCharacter);
    this.registry.set('gameMode', this.selectedMode);
    
    // Transition to game scene
    this.scene.start('GameScene');
  }

  private createAnimations(): void {
    // Create animations for character preview
    this.characters.forEach(character => {
      const animKey = `${character}_idle_anim`;
      if (!this.anims.exists(animKey)) {
        this.anims.create({
          key: animKey,
          frames: [{ key: `${character}_idle`, frame: 0 }],
          frameRate: 8,
          repeat: -1
        });
      }
    });
  }

  create(): void {
    // This will be called after preload completes
    console.log('🎮 MenuScene: Create called');
  }

  update(): void {
    // Add any update logic here if needed
  }
} 