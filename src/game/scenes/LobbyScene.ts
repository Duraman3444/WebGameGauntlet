import Phaser from 'phaser';
import { GAME_CONSTANTS, COLORS } from '../config/GameConfig';

export class LobbyScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private playersText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Rectangle;
  private startButtonText!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Rectangle;
  private backButtonText!: Phaser.GameObjects.Text;
  private connectedPlayers: string[] = [];

  constructor() {
    super({ key: 'LobbyScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    
    // Create background
    this.background = this.add.rectangle(width / 2, height / 2, width, height, 0x2a2a2a);
    
    // Create title
    this.titleText = this.add.text(width / 2, 100, 'Game Lobby', {
      fontSize: '36px',
      color: COLORS.WHITE,
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    // Players list
    this.playersText = this.add.text(width / 2, 200, 'Connected Players: 0/4', {
      fontSize: '24px',
      color: COLORS.WHITE,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Start game button
    this.startButton = this.add.rectangle(width / 2, height / 2 + 50, 200, GAME_CONSTANTS.BUTTON_HEIGHT, 0x10B981);
    this.startButton.setInteractive();
    this.startButton.on('pointerdown', this.startGame, this);
    this.startButton.on('pointerover', () => this.onButtonHover(this.startButton, 0x059669), this);
    this.startButton.on('pointerout', () => this.onButtonOut(this.startButton, 0x10B981), this);
    
    this.startButtonText = this.add.text(width / 2, height / 2 + 50, 'Start Game', {
      fontSize: '24px',
      color: COLORS.WHITE,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Back button
    this.backButton = this.add.rectangle(width / 2, height / 2 + 120, 200, GAME_CONSTANTS.BUTTON_HEIGHT, 0x6B7280);
    this.backButton.setInteractive();
    this.backButton.on('pointerdown', this.goBack, this);
    this.backButton.on('pointerover', () => this.onButtonHover(this.backButton, 0x4B5563), this);
    this.backButton.on('pointerout', () => this.onButtonOut(this.backButton, 0x6B7280), this);
    
    this.backButtonText = this.add.text(width / 2, height / 2 + 120, 'Back to Menu', {
      fontSize: '24px',
      color: COLORS.WHITE,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Add connection status
    this.add.text(width / 2, height - 100, 'Connecting to server...', {
      fontSize: '18px',
      color: COLORS.GRAY,
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Initialize multiplayer connection
    this.initializeMultiplayer();
  }

  private initializeMultiplayer(): void {
    // This will be connected to the actual socket implementation
    // For now, simulate some players joining
    this.time.delayedCall(1000, () => {
      this.addPlayer('Player 1');
    });
    
    this.time.delayedCall(2000, () => {
      this.addPlayer('Player 2');
    });
  }

  private addPlayer(playerName: string): void {
    this.connectedPlayers.push(playerName);
    this.updatePlayersList();
  }

  private updatePlayersList(): void {
    const playerCount = this.connectedPlayers.length;
    this.playersText.setText(`Connected Players: ${playerCount}/${GAME_CONSTANTS.MAX_PLAYERS}`);
    
    // Enable start button if we have at least 1 player
    if (playerCount >= 1) {
      this.startButton.setFillStyle(0x10B981);
      this.startButtonText.setColor(COLORS.WHITE);
    } else {
      this.startButton.setFillStyle(0x6B7280);
      this.startButtonText.setColor(COLORS.GRAY);
    }
  }

  private startGame(): void {
    if (this.connectedPlayers.length >= 1) {
      this.scene.start('GameScene');
    }
  }

  private goBack(): void {
    this.scene.start('MenuScene');
  }

  private onButtonHover(button: Phaser.GameObjects.Rectangle, color: number): void {
    button.setFillStyle(color);
    button.setScale(1.05);
  }

  private onButtonOut(button: Phaser.GameObjects.Rectangle, color: number): void {
    button.setFillStyle(color);
    button.setScale(1);
  }
} 