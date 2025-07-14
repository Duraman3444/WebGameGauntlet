import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../config/GameConfig';

export class MenuScene extends Phaser.Scene {
  private selectedCharacter: string = 'pink_man';
  private characterPreview!: Phaser.GameObjects.Sprite;
  private characterNames: string[] = ['Pink Man', 'Mask Dude', 'Ninja Frog', 'Virtual Guy', 'Adventure Hero', 'Robot', 'King Human'];
  private characterKeys: string[] = ['pink_man', 'mask_dude', 'ninja_frog', 'virtual_guy', 'adventure_hero', 'robot', 'king_human'];
  private currentCharacterIndex: number = 0;
  private bgMusic!: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.createBackground();
    this.createTitle();
    this.createCharacterSelection();
    this.createMainMenu();
    this.createInstructions();
    this.setupAudio();
  }

  private createBackground(): void {
    // Create animated background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x3498db).setOrigin(0, 0);
    
    // Add some decorative elements
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      const fruit = this.add.image(x, y, Phaser.Utils.Array.GetRandom(['apple', 'banana', 'cherries', 'orange']));
      fruit.setAlpha(0.3);
      fruit.setScale(0.5);
      
      // Animate fruits
      this.tweens.add({
        targets: fruit,
        y: y - 50,
        duration: 2000 + Math.random() * 2000,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createTitle(): void {
    const centerX = this.cameras.main.width / 2;
    
    // Main title
    const title = this.add.text(centerX, 150, 'FRUIT RUNNERS', {
      fontSize: '64px',
      color: '#2c3e50',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Title animation
    this.tweens.add({
      targets: title,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 2000,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(centerX, 200, 'Multiplayer Platformer Adventure', {
      fontSize: '24px',
      color: '#34495e',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  private createCharacterSelection(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Character selection title
    this.add.text(centerX, centerY - 100, 'Choose Your Character', {
      fontSize: '32px',
      color: '#2c3e50',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Character preview
    this.characterPreview = this.add.sprite(centerX, centerY - 20, `${this.selectedCharacter}_idle`);
    this.characterPreview.setScale(3);
    this.characterPreview.play(`${this.selectedCharacter}_idle`);

    // Character name
    const characterNameText = this.add.text(centerX, centerY + 50, this.characterNames[this.currentCharacterIndex], {
      fontSize: '24px',
      color: '#2c3e50',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Navigation buttons
    const leftButton = this.add.text(centerX - 100, centerY - 20, '<', {
      fontSize: '48px',
      color: '#2c3e50',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const rightButton = this.add.text(centerX + 100, centerY - 20, '>', {
      fontSize: '48px',
      color: '#2c3e50',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Make buttons interactive
    leftButton.setInteractive({ useHandCursor: true });
    rightButton.setInteractive({ useHandCursor: true });

    leftButton.on('pointerdown', () => {
      this.currentCharacterIndex = (this.currentCharacterIndex - 1 + this.characterKeys.length) % this.characterKeys.length;
      this.updateCharacterPreview(characterNameText);
    });

    rightButton.on('pointerdown', () => {
      this.currentCharacterIndex = (this.currentCharacterIndex + 1) % this.characterKeys.length;
      this.updateCharacterPreview(characterNameText);
    });

    // Keyboard navigation
    this.input.keyboard?.on('keydown-LEFT', () => {
      this.currentCharacterIndex = (this.currentCharacterIndex - 1 + this.characterKeys.length) % this.characterKeys.length;
      this.updateCharacterPreview(characterNameText);
    });

    this.input.keyboard?.on('keydown-RIGHT', () => {
      this.currentCharacterIndex = (this.currentCharacterIndex + 1) % this.characterKeys.length;
      this.updateCharacterPreview(characterNameText);
    });
  }

  private updateCharacterPreview(nameText: Phaser.GameObjects.Text): void {
    this.selectedCharacter = this.characterKeys[this.currentCharacterIndex];
    this.characterPreview.play(`${this.selectedCharacter}_idle`);
    nameText.setText(this.characterNames[this.currentCharacterIndex]);
  }

  private createMainMenu(): void {
    const centerX = this.cameras.main.width / 2;
    const startY = this.cameras.main.height / 2 + 120;

    // Start Game button
    const startButton = this.add.text(centerX, startY, 'START GAME', {
      fontSize: '32px',
      color: '#27ae60',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    startButton.setInteractive({ useHandCursor: true });
    
    startButton.on('pointerover', () => {
      startButton.setColor('#2ecc71');
      startButton.setScale(1.1);
    });
    
    startButton.on('pointerout', () => {
      startButton.setColor('#27ae60');
      startButton.setScale(1);
    });
    
    startButton.on('pointerdown', () => {
      this.startGame();
    });

    // Instructions button
    const instructionsButton = this.add.text(centerX, startY + 60, 'HOW TO PLAY', {
      fontSize: '24px',
      color: '#34495e',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    instructionsButton.setInteractive({ useHandCursor: true });
    
    instructionsButton.on('pointerover', () => {
      instructionsButton.setColor('#2c3e50');
      instructionsButton.setScale(1.1);
    });
    
    instructionsButton.on('pointerout', () => {
      instructionsButton.setColor('#34495e');
      instructionsButton.setScale(1);
    });

    // Keyboard controls
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.startGame();
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.startGame();
    });
  }

  private createInstructions(): void {
    const instructions = [
      'Controls:',
      'A/D or Arrow Keys - Move',
      'W or Up Arrow - Jump',
      'Double Jump - Press jump again in air',
      'Spacebar - Attack',
      '',
      'Goal: Collect fruits to unlock the exit door!',
      `Collect ${GAME_CONSTANTS.FRUITS_PER_LEVEL} fruits per level`
    ];

    const startY = this.cameras.main.height - 200;
    
    instructions.forEach((instruction, index) => {
      this.add.text(50, startY + (index * 20), instruction, {
        fontSize: '16px',
        color: '#2c3e50',
        fontFamily: 'Arial'
      });
    });
  }

  private setupAudio(): void {
    if (!this.sound.get('bg_music')) {
      this.bgMusic = this.sound.add('bg_music', { loop: true, volume: 0.5 });
      this.bgMusic.play();
    }
  }

  private startGame(): void {
    // Store selected character in registry
    this.registry.set('selectedCharacter', this.selectedCharacter);
    this.registry.set('currentWorld', 1);
    this.registry.set('currentLevel', 1);
    
    // Start the game
    this.scene.start('GameScene');
  }
} 