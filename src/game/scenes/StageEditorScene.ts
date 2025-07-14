import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../config/GameConfig';
import { AssetPaths } from '../../utils/assetPaths';

interface PlacedObject {
  x: number;
  y: number;
  assetKey: string;
  type: string;
}

interface EditorConfig {
  selectedWorld: string;
  selectedTileset: string;
  selectedBackground: string;
  selectedCharacter: string;
  levelName: string;
  difficulty: string;
  timeLimit: number;
}

export class StageEditorScene extends Phaser.Scene {
  // Asset categories for the editor
  private assetCategories = {
    terrain: [
      { key: 'grassland_tileset', name: 'Grassland', frame: 17 },
      { key: 'autumn_tileset', name: 'Autumn', frame: 17 },
      { key: 'tropics_tileset', name: 'Tropics', frame: 17 },
      { key: 'winter_tileset', name: 'Winter', frame: 17 },
    ],
    traps: [
      { key: 'spike_idle', name: 'Spikes', type: 'trap' },
      { key: 'trampoline_idle', name: 'Trampoline', type: 'trap' },
      { key: 'fire_off', name: 'Fire', type: 'trap' },
      { key: 'saw_on', name: 'Saw', type: 'trap' },
      { key: 'falling_platform_on', name: 'Falling Platform', type: 'trap' },
    ],
    boxes: [
      { key: 'box1', name: 'Box 1', type: 'box' },
      { key: 'box2', name: 'Box 2', type: 'box' },
      { key: 'box3', name: 'Box 3', type: 'box' },
    ],
    enemies: [
      { key: 'flying_eye', name: 'Flying Eye', type: 'enemy' },
      { key: 'goblin', name: 'Goblin', type: 'enemy' },
      { key: 'mushroom', name: 'Mushroom', type: 'enemy' },
      { key: 'skeleton', name: 'Skeleton', type: 'enemy' },
    ],
    fruits: [
      { key: 'apple', name: 'Apple', type: 'fruit' },
      { key: 'bananas', name: 'Bananas', type: 'fruit' },
      { key: 'cherries', name: 'Cherries', type: 'fruit' },
      { key: 'kiwi', name: 'Kiwi', type: 'fruit' },
      { key: 'melon', name: 'Melon', type: 'fruit' },
      { key: 'orange', name: 'Orange', type: 'fruit' },
      { key: 'pineapple', name: 'Pineapple', type: 'fruit' },
      { key: 'strawberry', name: 'Strawberry', type: 'fruit' },
    ],
    checkpoints: [
      { key: 'checkpoint', name: 'Checkpoint', type: 'checkpoint' },
    ],
  };

  private currentCategory: string = 'terrain';
  private currentAssetIndex: number = 0;
  private placedObjects: PlacedObject[] = [];
  private placedSprites: Phaser.GameObjects.Sprite[] = [];
  
  // UI elements
  private categoryButtons: Phaser.GameObjects.Container[] = [];
  private assetPalette: Phaser.GameObjects.Container | null = null;
  private configPanel: Phaser.GameObjects.Container | null = null;
  private infoPanel: Phaser.GameObjects.Container | null = null;
  
  // Editor configuration
  private editorConfig: EditorConfig = {
    selectedWorld: 'grassland',
    selectedTileset: 'grassland_tileset',
    selectedBackground: 'Green',
    selectedCharacter: 'pinkman',
    levelName: 'Custom Level',
    difficulty: 'Medium',
    timeLimit: 300,
  };

  // World themes
  private worldThemes = {
    grassland: {
      name: 'Grassland',
      background: 'Green',
      tileset: 'grassland_tileset',
      color: 0x90EE90,
    },
    autumn: {
      name: 'Autumn Forest',
      background: 'Brown',
      tileset: 'autumn_tileset',
      color: 0xCD853F,
    },
    tropics: {
      name: 'Tropical Paradise',
      background: 'Blue',
      tileset: 'tropics_tileset',
      color: 0x87CEEB,
    },
    winter: {
      name: 'Winter Wonderland',
      background: 'Gray',
      tileset: 'winter_tileset',
      color: 0xB0C4DE,
    },
    cave: {
      name: 'Crystal Caverns',
      background: 'Purple',
      tileset: 'grassland_tileset',
      color: 0x9370DB,
    },
  };

  private characters = [
    { key: 'pinkman', name: 'Pink Man' },
    { key: 'maskdude', name: 'Mask Dude' },
    { key: 'ninjafrog', name: 'Ninja Frog' },
    { key: 'virtualguy', name: 'Virtual Guy' },
    { key: 'adventurehero', name: 'Adventure Hero' },
    { key: 'robot', name: 'Robot' },
    { key: 'captainclownnose', name: 'Captain Clown Nose' },
    { key: 'kinghuman', name: 'King Human' },
  ];

  constructor() {
    super({ key: 'StageEditorScene' });
  }

  preload(): void {
    console.log('🎨 StageEditorScene: Loading assets...');
    
    // Load Wood and Paper UI assets
    this.load.image('yellow_paper_1', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Yellow Paper/1.png');
    this.load.image('yellow_paper_2', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Yellow Paper/2.png');
    this.load.image('yellow_paper_3', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Yellow Paper/3.png');
    this.load.image('yellow_button_1', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Yellow Button/1.png');
    this.load.image('yellow_button_2', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Yellow Button/2.png');
    this.load.image('green_button_1', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Green Button/1.png');
    this.load.image('green_button_2', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Green Button/2.png');
    this.load.image('small_banner_1', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Small Banner/1.png');
    this.load.image('small_banner_2', 'assets/sprites/Treasure Hunters/Wood and Paper UI/Sprites/Small Banner/2.png');
    
    // Load all necessary game assets
    this.loadGameAssets();
  }

  private loadGameAssets(): void {
    // Load backgrounds
    const backgrounds = ['Blue', 'Green', 'Brown', 'Gray', 'Purple', 'Pink', 'Yellow'];
    backgrounds.forEach(bg => {
      this.load.image(`background_${bg.toLowerCase()}`, AssetPaths.background(bg));
    });

    // Load tilesets
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

    // Load characters
    this.characters.forEach(character => {
      this.load.spritesheet(`${character.key}_idle`, AssetPaths.characterSpritesheet(character.key, 'Idle'), {
        frameWidth: 32,
        frameHeight: 32
      });
    });

    // Load fruits
    const fruits = ['apple', 'bananas', 'cherries', 'kiwi', 'melon', 'orange', 'pineapple', 'strawberry'];
    fruits.forEach(fruit => {
      this.load.image(fruit, AssetPaths.fruit(fruit));
    });

    // Load boxes
    const boxes = ['Box1', 'Box2', 'Box3'];
    boxes.forEach(box => {
      this.load.image(box.toLowerCase(), AssetPaths.box(box));
    });

    // Load traps
    this.load.image('spike_idle', AssetPaths.spike());
    this.load.image('trampoline_idle', AssetPaths.trampoline());
    this.load.image('fire_off', AssetPaths.fire('off'));
    this.load.image('fire_on', AssetPaths.fire('on'));
    this.load.image('saw_on', AssetPaths.saw());
    this.load.image('falling_platform_on', AssetPaths.fallingPlatform());

    // Load checkpoint
    this.load.image('checkpoint', AssetPaths.checkpoint());
  }

  create(): void {
    console.log('🎨 StageEditorScene: Creating editor interface...');
    
    // Set up the editor background
    this.setupEditorBackground();
    
    // Create the main UI panels
    this.createConfigPanel();
    this.createCategoryButtons();
    this.createAssetPalette();
    this.createInfoPanel();
    
    // Set up input handling
    this.setupInputHandling();
    
    // Draw grid for easier placement
    this.drawGrid();
    
    console.log('🎨 StageEditorScene: Editor ready!');
  }

  private setupEditorBackground(): void {
    // Create scrollable background based on selected world
    const worldTheme = this.worldThemes[this.editorConfig.selectedWorld as keyof typeof this.worldThemes];
    const bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, `background_${worldTheme.background.toLowerCase()}`);
    bg.setOrigin(0, 0);
    bg.setDepth(-10);
  }

  private createConfigPanel(): void {
    const panel = this.add.container(20, 20);
    
    // Panel background
    const panelBg = this.add.image(0, 0, 'yellow_paper_3');
    panelBg.setOrigin(0, 0);
    panelBg.setScale(6, 4);
    panel.add(panelBg);
    
    // Title
    const title = this.add.text(20, 20, 'STAGE CREATOR', {
      fontSize: '20px',
      color: '#654321',
      fontFamily: 'Arial Black'
    });
    panel.add(title);
    
    // World selection
    const worldLabel = this.add.text(20, 60, 'World:', {
      fontSize: '14px',
      color: '#654321',
      fontFamily: 'Arial Bold'
    });
    panel.add(worldLabel);
    
    // Create world selection buttons
    let worldY = 80;
    Object.entries(this.worldThemes).forEach(([key, theme], index) => {
      const worldBtn = this.add.image(30 + (index * 45), worldY, 'yellow_button_1');
      worldBtn.setScale(1.5);
      worldBtn.setInteractive();
      worldBtn.on('pointerdown', () => this.selectWorld(key));
      
      const worldText = this.add.text(30 + (index * 45), worldY, theme.name.charAt(0), {
        fontSize: '12px',
        color: '#654321',
        fontFamily: 'Arial Bold'
      });
      worldText.setOrigin(0.5);
      
      panel.add(worldBtn);
      panel.add(worldText);
    });
    
    // Character selection
    const charLabel = this.add.text(20, 120, 'Character:', {
      fontSize: '14px',
      color: '#654321',
      fontFamily: 'Arial Bold'
    });
    panel.add(charLabel);
    
    // Character preview
    const charPreview = this.add.sprite(80, 150, `${this.editorConfig.selectedCharacter}_idle`);
    charPreview.setScale(2);
    panel.add(charPreview);
    
    // Character selection buttons
    const prevCharBtn = this.add.image(40, 150, 'yellow_button_1');
    prevCharBtn.setScale(1.2);
    prevCharBtn.setInteractive();
    prevCharBtn.on('pointerdown', () => this.changeCharacter(-1));
    
    const nextCharBtn = this.add.image(120, 150, 'yellow_button_1');
    nextCharBtn.setScale(1.2);
    nextCharBtn.setInteractive();
    nextCharBtn.on('pointerdown', () => this.changeCharacter(1));
    
    panel.add(prevCharBtn);
    panel.add(nextCharBtn);
    
    // Add arrow symbols
    const prevArrow = this.add.text(40, 150, '←', {
      fontSize: '16px',
      color: '#654321',
      fontFamily: 'Arial Bold'
    });
    prevArrow.setOrigin(0.5);
    
    const nextArrow = this.add.text(120, 150, '→', {
      fontSize: '16px',
      color: '#654321',
      fontFamily: 'Arial Bold'
    });
    nextArrow.setOrigin(0.5);
    
    panel.add(prevArrow);
    panel.add(nextArrow);
    
    // Action buttons
    const testBtn = this.add.image(200, 60, 'green_button_1');
    testBtn.setScale(2);
    testBtn.setInteractive();
    testBtn.on('pointerdown', () => this.testLevel());
    
    const testText = this.add.text(200, 60, 'TEST', {
      fontSize: '12px',
      color: '#FFFFFF',
      fontFamily: 'Arial Bold'
    });
    testText.setOrigin(0.5);
    
    const saveBtn = this.add.image(200, 100, 'green_button_1');
    saveBtn.setScale(2);
    saveBtn.setInteractive();
    saveBtn.on('pointerdown', () => this.saveLevel());
    
    const saveText = this.add.text(200, 100, 'SAVE', {
      fontSize: '12px',
      color: '#FFFFFF',
      fontFamily: 'Arial Bold'
    });
    saveText.setOrigin(0.5);
    
    const clearBtn = this.add.image(200, 140, 'yellow_button_1');
    clearBtn.setScale(2);
    clearBtn.setInteractive();
    clearBtn.on('pointerdown', () => this.clearLevel());
    
    const clearText = this.add.text(200, 140, 'CLEAR', {
      fontSize: '12px',
      color: '#654321',
      fontFamily: 'Arial Bold'
    });
    clearText.setOrigin(0.5);
    
    panel.add(testBtn);
    panel.add(testText);
    panel.add(saveBtn);
    panel.add(saveText);
    panel.add(clearBtn);
    panel.add(clearText);
    
    // Make panel fixed to camera
    panel.setScrollFactor(0);
    this.configPanel = panel;
  }

  private createCategoryButtons(): void {
    const startX = 20;
    const startY = 220;
    const buttonWidth = 60;
    const buttonHeight = 30;
    
    Object.keys(this.assetCategories).forEach((category, index) => {
      const container = this.add.container(startX, startY + (index * 40));
      
      // Button background
      const btnBg = this.add.image(0, 0, this.currentCategory === category ? 'green_button_1' : 'yellow_button_1');
      btnBg.setScale(2, 1.5);
      btnBg.setInteractive();
      btnBg.on('pointerdown', () => this.selectCategory(category));
      
      // Button text
      const btnText = this.add.text(0, 0, category.toUpperCase(), {
        fontSize: '10px',
        color: this.currentCategory === category ? '#FFFFFF' : '#654321',
        fontFamily: 'Arial Bold'
      });
      btnText.setOrigin(0.5);
      
      container.add(btnBg);
      container.add(btnText);
      container.setScrollFactor(0);
      
      this.categoryButtons.push(container);
    });
  }

  private createAssetPalette(): void {
    const container = this.add.container(20, 450);
    
    // Panel background
    const panelBg = this.add.image(0, 0, 'yellow_paper_2');
    panelBg.setOrigin(0, 0);
    panelBg.setScale(8, 3);
    container.add(panelBg);
    
    // Title
    const title = this.add.text(20, 10, 'ASSETS', {
      fontSize: '16px',
      color: '#654321',
      fontFamily: 'Arial Black'
    });
    container.add(title);
    
    this.updateAssetPalette();
    
    container.setScrollFactor(0);
    this.assetPalette = container;
  }

  private updateAssetPalette(): void {
    if (!this.assetPalette) return;
    
    // Clear existing asset sprites (keep background and title)
    const children = this.assetPalette.list.slice(2);
    children.forEach(child => child.destroy());
    
    // Add current category assets
    const assets = this.assetCategories[this.currentCategory as keyof typeof this.assetCategories];
    assets.forEach((asset: any, index: number) => {
      const x = 30 + (index * 50);
      const y = 50;
      
      // Asset sprite
      let assetSprite: Phaser.GameObjects.Sprite;
      if (asset.frame !== undefined) {
        assetSprite = this.add.sprite(x, y, asset.key, asset.frame);
      } else {
        assetSprite = this.add.sprite(x, y, asset.key);
      }
      
      assetSprite.setScale(2);
      assetSprite.setInteractive();
      assetSprite.on('pointerdown', () => {
        this.currentAssetIndex = index;
        this.updateAssetSelection();
      });
      
      // Selection indicator
      if (index === this.currentAssetIndex) {
        const selection = this.add.image(x, y, 'small_banner_1');
        selection.setScale(1.5);
        selection.setTint(0x00FF00);
        this.assetPalette!.add(selection);
      }
      
      // Asset name
      const assetName = this.add.text(x, y + 30, asset.name, {
        fontSize: '8px',
        color: '#654321',
        fontFamily: 'Arial'
      });
      assetName.setOrigin(0.5);
      
      this.assetPalette!.add(assetSprite);
      this.assetPalette!.add(assetName);
    });
  }

  private createInfoPanel(): void {
    const container = this.add.container(this.cameras.main.width - 300, 20);
    
    // Panel background
    const panelBg = this.add.image(0, 0, 'yellow_paper_1');
    panelBg.setOrigin(0, 0);
    panelBg.setScale(5, 6);
    container.add(panelBg);
    
    // Instructions
    const instructions = [
      'STAGE CREATOR CONTROLS:',
      '',
      'Left Click: Place selected asset',
      'Right Click: Delete asset',
      'Mouse Wheel: Zoom in/out',
      'Arrow Keys: Move camera',
      'Space: Reset camera',
      '',
      'TIPS:',
      '• Start with terrain platforms',
      '• Add checkpoints for long levels',
      '• Balance difficulty with rewards',
      '• Test your level before saving',
    ];
    
    instructions.forEach((instruction, index) => {
      const text = this.add.text(10, 20 + (index * 16), instruction, {
        fontSize: '10px',
        color: '#654321',
        fontFamily: instruction.includes('CONTROLS:') || instruction.includes('TIPS:') ? 'Arial Bold' : 'Arial'
      });
      container.add(text);
    });
    
    container.setScrollFactor(0);
    this.infoPanel = container;
  }

  private setupInputHandling(): void {
    // Disable context menu for right-click
    this.input.mouse?.disableContextMenu();
    
    // Mouse input for placing/deleting objects
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Skip if clicking on UI
      if (pointer.x < 300 || pointer.y < 200 || pointer.x > this.cameras.main.width - 320) {
        return;
      }
      
      const worldX = pointer.worldX;
      const worldY = pointer.worldY;
      const gridX = Math.floor(worldX / GAME_CONSTANTS.TILE_SIZE) * GAME_CONSTANTS.TILE_SIZE;
      const gridY = Math.floor(worldY / GAME_CONSTANTS.TILE_SIZE) * GAME_CONSTANTS.TILE_SIZE;
      
      if (pointer.rightButtonDown()) {
        // Delete object
        this.deleteObject(gridX, gridY);
      } else {
        // Place object
        this.placeObject(gridX, gridY);
      }
    });
    
    // Keyboard controls
    const cursors = this.input.keyboard?.createCursorKeys();
    const wasd = this.input.keyboard?.addKeys('W,S,A,D,SPACE');
    
    // Camera movement
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const speed = 200;
      
      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.cameras.main.scrollX -= speed;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.cameras.main.scrollX += speed;
          break;
        case 'ArrowUp':
        case 'KeyW':
          this.cameras.main.scrollY -= speed;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.cameras.main.scrollY += speed;
          break;
        case 'Space':
          this.cameras.main.scrollX = 0;
          this.cameras.main.scrollY = 0;
          break;
      }
    });
    
    // Mouse wheel zoom
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      const zoomSpeed = 0.1;
      const currentZoom = this.cameras.main.zoom;
      
      if (deltaY > 0) {
        this.cameras.main.setZoom(Math.max(0.5, currentZoom - zoomSpeed));
      } else {
        this.cameras.main.setZoom(Math.min(2, currentZoom + zoomSpeed));
      }
    });
  }

  private drawGrid(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x888888, 0.3);
    
    // Draw vertical lines
    for (let x = 0; x < 3000; x += GAME_CONSTANTS.TILE_SIZE) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 800);
    }
    
    // Draw horizontal lines
    for (let y = 0; y < 800; y += GAME_CONSTANTS.TILE_SIZE) {
      graphics.moveTo(0, y);
      graphics.lineTo(3000, y);
    }
    
    graphics.strokePath();
    graphics.setDepth(-5);
  }

  private selectCategory(category: string): void {
    this.currentCategory = category;
    this.currentAssetIndex = 0;
    this.updateCategoryButtons();
    this.updateAssetPalette();
  }

  private updateCategoryButtons(): void {
    this.categoryButtons.forEach((container, index) => {
      const category = Object.keys(this.assetCategories)[index];
      const btnBg = container.list[0] as Phaser.GameObjects.Image;
      const btnText = container.list[1] as Phaser.GameObjects.Text;
      
      if (category === this.currentCategory) {
        btnBg.setTexture('green_button_1');
        btnText.setColor('#FFFFFF');
      } else {
        btnBg.setTexture('yellow_button_1');
        btnText.setColor('#654321');
      }
    });
  }

  private updateAssetSelection(): void {
    this.updateAssetPalette();
  }

  private selectWorld(worldKey: string): void {
    this.editorConfig.selectedWorld = worldKey;
    const theme = this.worldThemes[worldKey as keyof typeof this.worldThemes];
    this.editorConfig.selectedBackground = theme.background;
    this.editorConfig.selectedTileset = theme.tileset;
    
    // Update background
    this.setupEditorBackground();
    
    console.log(`🌍 Selected world: ${theme.name}`);
  }

  private changeCharacter(direction: number): void {
    const currentIndex = this.characters.findIndex(char => char.key === this.editorConfig.selectedCharacter);
    const newIndex = (currentIndex + direction + this.characters.length) % this.characters.length;
    this.editorConfig.selectedCharacter = this.characters[newIndex].key;
    
    // Update character preview
    if (this.configPanel) {
      const charPreview = this.configPanel.list.find(child => 
        child instanceof Phaser.GameObjects.Sprite && child.texture.key.includes('_idle')
      ) as Phaser.GameObjects.Sprite;
      
      if (charPreview) {
        charPreview.setTexture(`${this.editorConfig.selectedCharacter}_idle`);
      }
    }
    
    console.log(`👤 Selected character: ${this.characters[newIndex].name}`);
  }

  private placeObject(gridX: number, gridY: number): void {
    const currentAssets = this.assetCategories[this.currentCategory as keyof typeof this.assetCategories];
    const selectedAsset = currentAssets[this.currentAssetIndex];
    
    // Check if object already exists at this position
    const existingIndex = this.placedObjects.findIndex(obj => obj.x === gridX && obj.y === gridY);
    if (existingIndex !== -1) {
      return; // Don't place on top of existing object
    }
    
    // Create sprite
    let sprite: Phaser.GameObjects.Sprite;
    if (selectedAsset.frame !== undefined) {
      sprite = this.add.sprite(gridX + GAME_CONSTANTS.TILE_SIZE / 2, gridY + GAME_CONSTANTS.TILE_SIZE / 2, selectedAsset.key, selectedAsset.frame);
    } else {
      sprite = this.add.sprite(gridX + GAME_CONSTANTS.TILE_SIZE / 2, gridY + GAME_CONSTANTS.TILE_SIZE / 2, selectedAsset.key);
    }
    
    sprite.setOrigin(0.5);
    
    // Store object data
    this.placedObjects.push({
      x: gridX,
      y: gridY,
      assetKey: selectedAsset.key,
      type: selectedAsset.type || this.currentCategory
    });
    
    this.placedSprites.push(sprite);
    
    console.log(`📦 Placed ${selectedAsset.name} at (${gridX}, ${gridY})`);
  }

  private deleteObject(gridX: number, gridY: number): void {
    const index = this.placedObjects.findIndex(obj => obj.x === gridX && obj.y === gridY);
    if (index !== -1) {
      // Remove sprite
      this.placedSprites[index].destroy();
      this.placedSprites.splice(index, 1);
      
      // Remove data
      this.placedObjects.splice(index, 1);
      
      console.log(`🗑️ Deleted object at (${gridX}, ${gridY})`);
    }
  }

  private clearLevel(): void {
    // Clear all placed objects
    this.placedSprites.forEach(sprite => sprite.destroy());
    this.placedSprites = [];
    this.placedObjects = [];
    
    console.log('🧹 Level cleared');
  }

  private testLevel(): void {
    if (this.placedObjects.length === 0) {
      console.warn('⚠️ No objects placed! Add some platforms and items first.');
      return;
    }
    
    // Generate level data from placed objects
    const levelData = this.generateLevelData();
    
    // Start game scene with custom level
    this.scene.start('GameScene', { customLevel: levelData });
    
    console.log('🎮 Testing level...');
  }

  private saveLevel(): void {
    if (this.placedObjects.length === 0) {
      console.warn('⚠️ No objects placed! Add some platforms and items first.');
      return;
    }
    
    const levelData = this.generateLevelData();
    
    // Save to localStorage (in a real game, this would be saved to a server)
    const savedLevels = JSON.parse(localStorage.getItem('customLevels') || '[]');
    savedLevels.push(levelData);
    localStorage.setItem('customLevels', JSON.stringify(savedLevels));
    
    console.log('💾 Level saved successfully!');
  }

  private generateLevelData(): any {
    // Organize placed objects by type
    const platforms: any[] = [];
    const fruits: any[] = [];
    const traps: any[] = [];
    const boxes: any[] = [];
    const enemies: any[] = [];
    const checkpoints: any[] = [];
    
    this.placedObjects.forEach(obj => {
      const baseData = { x: obj.x, y: obj.y };
      
      switch (obj.type) {
        case 'terrain':
          platforms.push({
            ...baseData,
            width: GAME_CONSTANTS.TILE_SIZE,
            height: GAME_CONSTANTS.TILE_SIZE,
            type: 'platform'
          });
          break;
        case 'fruit':
          fruits.push({
            ...baseData,
            type: obj.assetKey
          });
          break;
        case 'trap':
          traps.push({
            ...baseData,
            type: obj.assetKey.replace('_idle', '').replace('_off', '').replace('_on', '')
          });
          break;
        case 'box':
          boxes.push({
            ...baseData,
            type: obj.assetKey
          });
          break;
        case 'enemy':
          enemies.push({
            ...baseData,
            type: obj.assetKey
          });
          break;
        case 'checkpoint':
          checkpoints.push(baseData);
          break;
      }
    });
    
    return {
      id: `custom_${Date.now()}`,
      name: this.editorConfig.levelName,
      theme: this.editorConfig.selectedWorld,
      background: this.editorConfig.selectedBackground,
      tileset: this.editorConfig.selectedTileset,
      difficulty: this.editorConfig.difficulty,
      timeLimit: this.editorConfig.timeLimit,
      description: `Custom level created in Stage Creator`,
      platforms,
      fruits,
      traps,
      boxes,
      enemies,
      checkpoints,
      playerStart: { x: 100, y: 600 },
      levelEnd: { x: Math.max(...this.placedObjects.map(obj => obj.x)) + 200, y: 600 }
    };
  }

  update(): void {
    // Update any animations or dynamic elements
  }
} 