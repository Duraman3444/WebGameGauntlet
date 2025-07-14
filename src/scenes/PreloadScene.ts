import Phaser from 'phaser';
import { ASSET_PATHS } from '../config/GameConfig';

export class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.createLoadingScreen();
    this.loadAssets();
    this.setupLoadingEvents();
  }

  private createLoadingScreen(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Background
    this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x2c3e50);

    // Title
    this.add.text(centerX, centerY - 100, 'FRUIT RUNNERS', {
      fontSize: '48px',
      color: '#ecf0f1',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Loading text
    this.loadingText = this.add.text(centerX, centerY + 50, 'Loading...', {
      fontSize: '24px',
      color: '#ecf0f1',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Progress bar background
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x34495e);
    this.loadingBar.fillRect(centerX - 150, centerY + 80, 300, 30);

    // Progress bar fill
    this.progressBar = this.add.graphics();
  }

  private loadAssets(): void {
    // Load character spritesheets
    this.loadCharacters();
    
    // Load enemy spritesheets
    this.loadEnemies();
    
    // Load fruits
    this.loadFruits();
    
    // Load UI elements
    this.loadUI();
    
    // Load audio
    this.loadAudio();
    
    // Load level assets
    this.loadLevels();
  }

  private loadCharacters(): void {
    const characters = [
      { key: 'pink_man', path: ASSET_PATHS.CHARACTERS.PINK_MAN },
      { key: 'mask_dude', path: ASSET_PATHS.CHARACTERS.MASK_DUDE },
      { key: 'ninja_frog', path: ASSET_PATHS.CHARACTERS.NINJA_FROG },
      { key: 'virtual_guy', path: ASSET_PATHS.CHARACTERS.VIRTUAL_GUY },
      { key: 'adventure_hero', path: ASSET_PATHS.CHARACTERS.ADVENTURE_HERO },
      { key: 'robot', path: ASSET_PATHS.CHARACTERS.ROBOT },
      { key: 'king_human', path: ASSET_PATHS.CHARACTERS.KING_HUMAN }
    ];

    characters.forEach(char => {
      const animations = ['Idle', 'Run', 'Jump', 'Fall', 'Double Jump', 'Wall Jump', 'Hit'];
      animations.forEach(anim => {
        this.load.spritesheet(`${char.key}_${anim.toLowerCase().replace(' ', '_')}`, 
          `${char.path}/${anim} (32x32).png`, 
          { frameWidth: 32, frameHeight: 32 }
        );
      });
    });
  }

  private loadEnemies(): void {
    const enemies = [
      { key: 'flying_eye', path: ASSET_PATHS.ENEMIES.FLYING_EYE },
      { key: 'goblin', path: ASSET_PATHS.ENEMIES.GOBLIN },
      { key: 'mushroom', path: ASSET_PATHS.ENEMIES.MUSHROOM },
      { key: 'skeleton', path: ASSET_PATHS.ENEMIES.SKELETON }
    ];

    enemies.forEach(enemy => {
      this.load.spritesheet(`${enemy.key}`, `${enemy.path}/Attack3.png`, { frameWidth: 32, frameHeight: 32 });
    });
  }

  private loadFruits(): void {
    const fruits = ['Apple', 'Bananas', 'Cherries', 'Kiwi', 'Melon', 'Orange', 'Pineapple', 'Strawberry'];
    
    fruits.forEach(fruit => {
      this.load.image(fruit.toLowerCase(), `${ASSET_PATHS.FRUITS}/${fruit}.png`);
    });
  }

  private loadUI(): void {
    this.load.image('play_button', `${ASSET_PATHS.UI}/Buttons/Play.png`);
    this.load.image('settings_button', `${ASSET_PATHS.UI}/Buttons/Settings.png`);
    this.load.image('back_button', `${ASSET_PATHS.UI}/Buttons/Back.png`);
  }

  private loadAudio(): void {
    this.load.audio('coin_sound', `${ASSET_PATHS.AUDIO.SFX}/coin.wav`);
    this.load.audio('jump_sound', `${ASSET_PATHS.AUDIO.SFX}/jump.wav`);
    this.load.audio('hurt_sound', `${ASSET_PATHS.AUDIO.SFX}/hurt.wav`);
    this.load.audio('bg_music', `${ASSET_PATHS.AUDIO.MUSIC}/time_for_adventure.mp3`);
  }

  private loadLevels(): void {
    // Load background images
    const backgrounds = ['Blue', 'Green', 'Brown', 'Gray', 'Pink', 'Purple', 'Yellow'];
    backgrounds.forEach(bg => {
      this.load.image(`bg_${bg.toLowerCase()}`, `${ASSET_PATHS.LEVELS.BACKGROUNDS}/${bg}.png`);
    });

    // Load terrain tilesets
    const terrains = ['1 - Grassland', '2 - Autumn Forest', '3 - Tropics', '4 - Winter World'];
    terrains.forEach(terrain => {
      this.load.spritesheet(`terrain_${terrain.split(' - ')[1].toLowerCase().replace(' ', '_')}`, 
        `${ASSET_PATHS.LEVELS.TERRAIN}/${terrain}/Terrain (16 x 16).png`, 
        { frameWidth: 16, frameHeight: 16 }
      );
    });

    // Load trap assets
    this.load.spritesheet('spikes', `${ASSET_PATHS.LEVELS.TRAPS}/Spikes/Idle.png`, { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('trampoline', `${ASSET_PATHS.LEVELS.TRAPS}/Trampoline/Idle.png`, { frameWidth: 28, frameHeight: 28 });
    this.load.spritesheet('saw', `${ASSET_PATHS.LEVELS.TRAPS}/Saw/On (38x38).png`, { frameWidth: 38, frameHeight: 38 });
  }

  private setupLoadingEvents(): void {
    this.load.on('progress', (progress: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0x27ae60);
      this.progressBar.fillRect(
        this.cameras.main.width / 2 - 150, 
        this.cameras.main.height / 2 + 80, 
        300 * progress, 
        30
      );
      
      this.loadingText.setText(`Loading... ${Math.round(progress * 100)}%`);
    });

    this.load.on('complete', () => {
      this.loadingText.setText('Loading Complete!');
      this.time.delayedCall(500, () => {
        this.scene.start('MenuScene');
      });
    });
  }

  create(): void {
    // Create animations after assets are loaded
    this.createAnimations();
  }

  private createAnimations(): void {
    const characters = ['pink_man', 'mask_dude', 'ninja_frog', 'virtual_guy', 'adventure_hero', 'robot', 'king_human'];
    
    characters.forEach(char => {
      // Idle animation
      this.anims.create({
        key: `${char}_idle`,
        frames: this.anims.generateFrameNumbers(`${char}_idle`, { start: 0, end: -1 }),
        frameRate: 8,
        repeat: -1
      });

      // Run animation
      this.anims.create({
        key: `${char}_run`,
        frames: this.anims.generateFrameNumbers(`${char}_run`, { start: 0, end: -1 }),
        frameRate: 12,
        repeat: -1
      });

      // Jump animation
      this.anims.create({
        key: `${char}_jump`,
        frames: this.anims.generateFrameNumbers(`${char}_jump`, { start: 0, end: -1 }),
        frameRate: 10,
        repeat: 0
      });

      // Fall animation
      this.anims.create({
        key: `${char}_fall`,
        frames: this.anims.generateFrameNumbers(`${char}_fall`, { start: 0, end: -1 }),
        frameRate: 8,
        repeat: -1
      });

      // Double jump animation
      this.anims.create({
        key: `${char}_double_jump`,
        frames: this.anims.generateFrameNumbers(`${char}_double_jump`, { start: 0, end: -1 }),
        frameRate: 10,
        repeat: 0
      });

      // Wall jump animation
      this.anims.create({
        key: `${char}_wall_jump`,
        frames: this.anims.generateFrameNumbers(`${char}_wall_jump`, { start: 0, end: -1 }),
        frameRate: 10,
        repeat: 0
      });

      // Hit animation
      this.anims.create({
        key: `${char}_hit`,
        frames: this.anims.generateFrameNumbers(`${char}_hit`, { start: 0, end: -1 }),
        frameRate: 8,
        repeat: 0
      });
    });

    // Enemy animations
    const enemies = ['flying_eye', 'goblin', 'mushroom', 'skeleton'];
    enemies.forEach(enemy => {
      this.anims.create({
        key: `${enemy}_attack`,
        frames: this.anims.generateFrameNumbers(enemy, { start: 0, end: -1 }),
        frameRate: 8,
        repeat: -1
      });
    });

    // Trap animations
    this.anims.create({
      key: 'saw_spin',
      frames: this.anims.generateFrameNumbers('saw', { start: 0, end: -1 }),
      frameRate: 15,
      repeat: -1
    });
  }
} 