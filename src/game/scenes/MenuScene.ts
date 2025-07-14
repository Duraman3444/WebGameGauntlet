import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class MenuScene extends Phaser.Scene {
  private selectedCharacter: string = 'pinkman';
  private selectedMode: string = 'single';
  private characterSprites: Phaser.GameObjects.Sprite[] = [];
  private menuCursor: Phaser.GameObjects.Rectangle | null = null;
  private currentSelection: number = 0;
  private menuOptions: string[] = ['1 PLAYER GAME', '2 PLAYER GAME', 'CHARACTER SELECT'];
  private characterPreview: Phaser.GameObjects.Sprite | null = null;
  private characterNames: string[] = ['PINK MAN', 'MASK DUDE', 'NINJA FROG', 'VIRTUAL GUY'];
  private characters: string[] = ['pinkman', 'maskdude', 'ninjafrog', 'virtualguy'];
  private currentCharacterIndex: number = 0;
  private gameTitle: Phaser.GameObjects.Text | null = null;
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private backgroundSprite: Phaser.GameObjects.TileSprite | null = null;
  private showingCharacterSelect: boolean = false;

  constructor() {
    super({ key: 'MenuScene' });
  }

  preload(): void {
    console.log('🎮 MenuScene: Starting asset preload...');
    
    // Load character assets
    this.loadCharacterAssets();
    
    // Load other game assets
    this.loadGameAssets();
    
    // Set up loading event handlers
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
      { name: 'Virtual Guy', key: 'virtualguy' }
    ];
    
    const animations = [
      { name: 'Idle', key: 'idle' },
      { name: 'Run', key: 'run' },
      { name: 'Jump', key: 'jump' }
    ];
    
    characterData.forEach(character => {
      animations.forEach(animation => {
        const rawPath = `assets/sprites/players/Main Characters/${character.name}/${animation.name} (32x32).png`;
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
      const bgPath = `assets/sprites/Background/${bg}.png`;
      this.load.image(bgKey, bgPath);
    });
    
    // Load terrain
    const terrainPath = `assets/sprites/Terrain/Terrain (16x16).png`;
    this.load.image('terrain_tileset', encodeURI(terrainPath));
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
    
    // Create title box like Super Mario Bros
    const titleBox = this.add.graphics();
    titleBox.fillStyle(0x8B4513);
    titleBox.fillRoundedRect(centerX - 200, 150, 400, 120, 10);
    titleBox.lineStyle(4, 0x000000);
    titleBox.strokeRoundedRect(centerX - 200, 150, 400, 120, 10);
    
    // Main title
    this.gameTitle = this.add.text(centerX, 180, 'SUPER', {
      fontSize: '32px',
      color: '#FFFFFF',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    const subtitle = this.add.text(centerX, 220, 'FRUIT RUNNERS', {
      fontSize: '28px',
      color: '#FFFF00',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Copyright
    this.add.text(centerX, 250, '©2024 FRUIT RUNNERS', {
      fontSize: '12px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  private createMenu(): void {
    const centerX = this.cameras.main.width / 2;
    const startY = 350;
    
    // Create menu options
    this.menuOptions.forEach((option, index) => {
      const menuText = this.add.text(centerX, startY + (index * 40), option, {
        fontSize: '24px',
        color: '#FFFFFF',
        fontFamily: 'Arial Black',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      
      this.menuTexts.push(menuText);
    });
    
    // Create cursor (Mario mushroom style)
    this.menuCursor = this.add.rectangle(centerX - 150, startY, 20, 20, 0xFF6B6B);
    this.updateCursorPosition();
  }

  private createCharacterPreview(): void {
    const centerX = this.cameras.main.width / 2;
    const previewY = 550;
    
    // Character preview box
    const previewBox = this.add.graphics();
    previewBox.fillStyle(0x000000, 0.7);
    previewBox.fillRoundedRect(centerX - 100, previewY - 50, 200, 100, 10);
    previewBox.lineStyle(2, 0xFFFFFF);
    previewBox.strokeRoundedRect(centerX - 100, previewY - 50, 200, 100, 10);
    
    // Character sprite
    const characterKey = `${this.selectedCharacter}_idle`;
    if (this.textures.exists(characterKey)) {
      this.characterPreview = this.add.sprite(centerX - 50, previewY, characterKey);
      this.characterPreview.setScale(2);
    }
    
    // Character name
    this.add.text(centerX + 20, previewY - 20, this.characterNames[this.currentCharacterIndex], {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    // Instructions
    this.add.text(centerX, previewY + 20, 'LEFT/RIGHT: Choose Character', {
      fontSize: '12px',
      color: '#FFFF00',
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
      this.menuCursor.setPosition(centerX - 150, startY + (this.currentSelection * 40));
    }
  }

  private updateCharacterPreview(): void {
    if (this.characterPreview) {
      const characterKey = `${this.selectedCharacter}_idle`;
      if (this.textures.exists(characterKey)) {
        this.characterPreview.setTexture(characterKey);
      }
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
    }
  }

  private updateMenuVisibility(): void {
    this.menuTexts.forEach((text, index) => {
      if (index === 2) { // Character Select option
        text.setColor(this.showingCharacterSelect ? '#FFFF00' : '#FFFFFF');
      }
    });
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