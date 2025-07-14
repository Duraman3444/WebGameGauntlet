import Phaser from 'phaser';
import { AssetPaths } from '../../utils/assetPaths';

interface StageData {
  name: string;
  background: string;
  tileset: string;
  theme: string;
  difficulty: string;
  locked: boolean;
}

export class StageSelectScene extends Phaser.Scene {
  private stages: StageData[] = [];
  private currentStageIndex: number = 0;
  private stagePreview: Phaser.GameObjects.Rectangle | null = null;
  private stageNameText: Phaser.GameObjects.Text | null = null;
  private stageInfoText: Phaser.GameObjects.Text | null = null;
  private navigationText: Phaser.GameObjects.Text | null = null;
  private backButton: Phaser.GameObjects.Text | null = null;
  private selectedCharacter: string = 'pinkman';
  private gameMode: string = 'single';
  private stagePreviews: Phaser.GameObjects.Container[] = [];
  private cursor: Phaser.GameObjects.Rectangle | null = null;

  constructor() {
    super({ key: 'StageSelectScene' });
  }

  init(): void {
    // Get selected character and game mode from registry
    this.selectedCharacter = this.registry.get('selectedCharacter') || 'pinkman';
    this.gameMode = this.registry.get('gameMode') || 'single';
    
    // Initialize stage data
    this.initializeStages();
  }

  preload(): void {
    console.log('🎭 StageSelectScene: Loading stage assets...');
    
    // Load background images
    const backgrounds = ['Blue', 'Brown', 'Gray', 'Green', 'Pink', 'Purple', 'Yellow'];
    backgrounds.forEach(bg => {
      const bgKey = `bg_${bg.toLowerCase()}`;
      const bgPath = AssetPaths.background(bg);
      this.load.image(bgKey, bgPath);
    });
    
    // Load seasonal tileset previews
    const seasonalTilesets = ['1 - Grassland', '2 - Autumn Forest', '3 - Tropics', '4 - Winter World'];
    seasonalTilesets.forEach(tileset => {
      const key = `tileset_${tileset.split(' - ')[1].toLowerCase().replace(' ', '_')}`;
      const path = AssetPaths.seasonalTileset(tileset.split(' - ')[1]);
      this.load.image(key, encodeURI(path));
    });
    
    // Load terrain tileset as spritesheet for accurate previews
    const terrainPath = AssetPaths.terrain('Terrain (16x16).png');
    this.load.spritesheet('terrain_tileset', encodeURI(terrainPath), {
      frameWidth: 16,
      frameHeight: 16
    });
  }

  create(): void {
    console.log('🎭 StageSelectScene: Creating stage select screen...');
    
    // Create background
    this.createBackground();
    
    // Create title
    this.createTitle();
    
    // Create stage selection UI
    this.createStageSelection();
    
    // Create navigation UI
    this.createNavigationUI();
    
    // Set up input handling
    this.setupInput();
  }

  private initializeStages(): void {
    this.stages = [
      {
        name: 'Green Hills - World 1-1',
        background: 'bg_blue',
        tileset: 'terrain_tileset',
        theme: 'grassland',
        difficulty: 'Easy',
        locked: false
      },
      {
        name: 'Crystal Caverns - World 1-2',
        background: 'bg_gray',
        tileset: 'terrain_tileset',
        theme: 'cave',
        difficulty: 'Medium',
        locked: false
      },
      {
        name: 'Central City - World 1-3',
        background: 'bg_blue',
        tileset: 'terrain_tileset',
        theme: 'city',
        difficulty: 'Hard',
        locked: false
      },
      {
        name: 'Stringstar Fields - World 1-4',
        background: 'bg_stringstar_0',
        tileset: 'stringstar_tileset',
        theme: 'stringstar_fields',
        difficulty: 'Medium',
        locked: false
      },
      {
        name: 'Frozen Peaks - World 2-1',
        background: 'bg_purple',
        tileset: 'terrain_tileset',
        theme: 'winter',
        difficulty: 'Hard',
        locked: false
      },
      {
        name: 'Sandy Dunes - World 2-2',
        background: 'bg_yellow',
        tileset: 'terrain_tileset',
        theme: 'desert',
        difficulty: 'Hard',
        locked: false
      }
    ];
  }

  private createBackground(): void {
    // Create animated background
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1a1a2e);
    bg.setOrigin(0, 0);
    
    // Add stars
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Math.random() * this.cameras.main.width,
        Math.random() * this.cameras.main.height,
        Math.random() * 2 + 1,
        0xffffff
      );
      star.setAlpha(Math.random() * 0.8 + 0.2);
    }
  }

  private createTitle(): void {
    const centerX = this.cameras.main.width / 2;
    
    // Title
    this.add.text(centerX, 80, 'STAGE SELECT', {
      fontSize: '48px',
      color: '#FFFFFF',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(centerX, 120, 'Choose your adventure!', {
      fontSize: '20px',
      color: '#FFFF00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
  }

  private createStageSelection(): void {
    const centerX = this.cameras.main.width / 2;
    const startY = 200;
    const stageWidth = 180;
    const stageHeight = 120;
    const columns = 3;
    const spacing = 220;
    
    this.stages.forEach((stage, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = centerX - spacing + (col * spacing);
      const y = startY + (row * 150);
      
      // Create stage preview container
      const stageContainer = this.add.container(x, y);
      
      // Stage preview background
      const previewBg = this.add.rectangle(0, 0, stageWidth, stageHeight, 0x000000);
      previewBg.setStrokeStyle(3, stage.locked ? 0x666666 : 0xffffff);
      stageContainer.add(previewBg);
      
      // Stage background preview
      if (this.textures.exists(stage.background)) {
        const bgPreview = this.add.image(0, -20, stage.background);
        bgPreview.setDisplaySize(stageWidth - 10, stageHeight - 40);
        bgPreview.setAlpha(stage.locked ? 0.3 : 0.8);
        stageContainer.add(bgPreview);
      }
      
      // Stage name
      const nameText = this.add.text(0, 40, stage.name, {
        fontSize: '14px',
        color: stage.locked ? '#666666' : '#FFFFFF',
        fontFamily: 'Arial Black',
        align: 'center'
      }).setOrigin(0.5);
      stageContainer.add(nameText);
      
      // Difficulty indicator
      const difficultyColor = this.getDifficultyColor(stage.difficulty);
      const difficultyText = this.add.text(0, 55, stage.difficulty, {
        fontSize: '12px',
        color: stage.locked ? '#666666' : difficultyColor,
        fontFamily: 'Arial',
        align: 'center'
      }).setOrigin(0.5);
      stageContainer.add(difficultyText);
      
      // Lock icon for locked stages
      if (stage.locked) {
        const lockIcon = this.add.text(0, -10, '🔒', {
          fontSize: '32px'
        }).setOrigin(0.5);
        stageContainer.add(lockIcon);
      }
      
      this.stagePreviews.push(stageContainer);
    });
    
    // Create cursor
    this.cursor = this.add.rectangle(0, 0, stageWidth + 10, stageHeight + 10, 0x000000, 0);
    this.cursor.setStrokeStyle(4, 0xffff00);
    this.updateCursorPosition();
  }

  private createNavigationUI(): void {
    const centerX = this.cameras.main.width / 2;
    const bottomY = this.cameras.main.height - 100;
    
    // Current stage info
    this.stageNameText = this.add.text(centerX, bottomY - 40, '', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    this.stageInfoText = this.add.text(centerX, bottomY - 15, '', {
      fontSize: '16px',
      color: '#CCCCCC',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Navigation instructions
    this.navigationText = this.add.text(centerX, bottomY + 10, 'ARROW KEYS: Navigate • ENTER: Select • ESC: Back', {
      fontSize: '14px',
      color: '#FFFF00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Back button
    this.backButton = this.add.text(50, 50, '← BACK', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);
    
    this.backButton.setInteractive();
    this.backButton.on('pointerdown', () => this.goBack());
    
    // Update stage info
    this.updateStageInfo();
  }

  private setupInput(): void {
    // Keyboard navigation
    this.input.keyboard?.on('keydown-LEFT', () => this.navigateStage(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.navigateStage(1));
    this.input.keyboard?.on('keydown-UP', () => this.navigateStage(-3));
    this.input.keyboard?.on('keydown-DOWN', () => this.navigateStage(3));
    
    this.input.keyboard?.on('keydown-ENTER', () => this.selectStage());
    this.input.keyboard?.on('keydown-SPACE', () => this.selectStage());
    this.input.keyboard?.on('keydown-ESC', () => this.goBack());
  }

  private navigateStage(direction: number): void {
    this.currentStageIndex = Math.max(0, Math.min(this.stages.length - 1, this.currentStageIndex + direction));
    this.updateCursorPosition();
    this.updateStageInfo();
  }

  private updateCursorPosition(): void {
    if (this.cursor && this.stagePreviews[this.currentStageIndex]) {
      const container = this.stagePreviews[this.currentStageIndex];
      this.cursor.setPosition(container.x, container.y);
    }
  }

  private updateStageInfo(): void {
    const stage = this.stages[this.currentStageIndex];
    if (this.stageNameText && this.stageInfoText) {
      this.stageNameText.setText(stage.name);
      const themeName = this.getThemeName(stage.theme);
      this.stageInfoText.setText(`Difficulty: ${stage.difficulty} • Theme: ${themeName}`);
    }
  }
  
  private getThemeName(theme: string): string {
    switch (theme) {
      case 'grassland': return 'Green Hills';
      case 'cave': return 'Crystal Caverns';
      case 'city': return 'Central City';
      case 'stringstar_fields': return 'Stringstar Fields';
      case 'winter': return 'Frozen Peaks';
      case 'desert': return 'Sandy Dunes';
      case 'autumn': return 'Autumn Forest';
      case 'tropics': return 'Tropical Paradise';
      case 'space': return 'Purple Dimension';
      case 'sakura': return 'Cherry Blossom';
      default: return theme.charAt(0).toUpperCase() + theme.slice(1);
    }
  }

  private selectStage(): void {
    const stage = this.stages[this.currentStageIndex];
    
    if (stage.locked) {
      console.log('⚠️ Stage is locked!');
      return;
    }
    
    console.log(`🎭 Selected stage: ${stage.name}`);
    
    // Store selected stage data
    this.registry.set('selectedStage', stage);
    
    // Start the game with selected stage
    this.scene.start('GameScene');
  }

  private goBack(): void {
    console.log('🔙 Going back to menu...');
    this.scene.start('MenuScene');
  }

  private getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Easy': return '#00FF00';
      case 'Medium': return '#FFFF00';
      case 'Hard': return '#FF8800';
      case 'Expert': return '#FF0000';
      default: return '#FFFFFF';
    }
  }
} 