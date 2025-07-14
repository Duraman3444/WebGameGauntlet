import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private pauseButton!: Phaser.GameObjects.Text;
  private connectionStatus!: Phaser.GameObjects.Text;
  private playerCount!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this.createHealthBar();
    this.createPauseButton();
    this.createConnectionStatus();
    this.createPlayerCount();
    this.setupEventListeners();
  }

  private createHealthBar(): void {
    const barWidth = 200;
    const barHeight = 20;
    const x = this.cameras.main.width - barWidth - 20;
    const y = 20;

    // Health bar background
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x404040);
    this.healthBarBg.fillRect(x, y, barWidth, barHeight);
    this.healthBarBg.lineStyle(2, 0x000000);
    this.healthBarBg.strokeRect(x, y, barWidth, barHeight);

    // Health bar fill
    this.healthBar = this.add.graphics();
    this.updateHealthBar(100, 100); // Full health initially

    // Health label
    this.add.text(x, y - 25, 'Health', {
      fontSize: '16px',
      color: '#2c3e50',
      fontFamily: 'Arial'
    });
  }

  private updateHealthBar(currentHealth: number, maxHealth: number): void {
    const barWidth = 200;
    const barHeight = 20;
    const x = this.cameras.main.width - barWidth - 20;
    const y = 20;

    this.healthBar.clear();
    
    // Calculate health percentage
    const healthPercentage = Math.max(0, currentHealth / maxHealth);
    const currentBarWidth = barWidth * healthPercentage;
    
    // Choose color based on health
    let healthColor = 0x27ae60; // Green
    if (healthPercentage < 0.5) {
      healthColor = 0xf39c12; // Orange
    }
    if (healthPercentage < 0.25) {
      healthColor = 0xe74c3c; // Red
    }
    
    this.healthBar.fillStyle(healthColor);
    this.healthBar.fillRect(x, y, currentBarWidth, barHeight);
  }

  private createPauseButton(): void {
    this.pauseButton = this.add.text(this.cameras.main.width - 100, 60, 'PAUSE', {
      fontSize: '18px',
      color: '#34495e',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    
    this.pauseButton.setInteractive({ useHandCursor: true });
    
    this.pauseButton.on('pointerdown', () => {
      this.scene.pause('GameScene');
      this.showPauseMenu();
    });
    
    this.pauseButton.on('pointerover', () => {
      this.pauseButton.setColor('#2c3e50');
    });
    
    this.pauseButton.on('pointerout', () => {
      this.pauseButton.setColor('#34495e');
    });
  }

  private createConnectionStatus(): void {
    this.connectionStatus = this.add.text(20, this.cameras.main.height - 40, 'Status: Offline', {
      fontSize: '14px',
      color: '#e74c3c',
      fontFamily: 'Arial'
    });
  }

  private createPlayerCount(): void {
    this.playerCount = this.add.text(20, this.cameras.main.height - 20, 'Players: 1', {
      fontSize: '14px',
      color: '#2c3e50',
      fontFamily: 'Arial'
    });
  }

  private setupEventListeners(): void {
    // Listen for events from GameScene
    this.scene.get('GameScene').events.on('playerHealthChanged', (health: number, maxHealth: number) => {
      this.updateHealthBar(health, maxHealth);
    });
    
    this.scene.get('GameScene').events.on('connectionStatusChanged', (isConnected: boolean) => {
      this.connectionStatus.setText(`Status: ${isConnected ? 'Online' : 'Offline'}`);
      this.connectionStatus.setColor(isConnected ? '#27ae60' : '#e74c3c');
    });
    
    this.scene.get('GameScene').events.on('playerCountChanged', (count: number) => {
      this.playerCount.setText(`Players: ${count}`);
    });
  }

  private showPauseMenu(): void {
    const pauseMenu = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    
    // Semi-transparent background
    const pauseBg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
    pauseBg.setOrigin(0.5);
    
    // Pause menu title
    const pauseTitle = this.add.text(0, -100, 'GAME PAUSED', {
      fontSize: '48px',
      color: '#ecf0f1',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Resume button
    const resumeButton = this.add.text(0, -20, 'RESUME', {
      fontSize: '32px',
      color: '#27ae60',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    resumeButton.setInteractive({ useHandCursor: true });
    
    resumeButton.on('pointerdown', () => {
      pauseMenu.destroy();
      this.scene.resume('GameScene');
    });
    
    resumeButton.on('pointerover', () => {
      resumeButton.setColor('#2ecc71');
      resumeButton.setScale(1.1);
    });
    
    resumeButton.on('pointerout', () => {
      resumeButton.setColor('#27ae60');
      resumeButton.setScale(1);
    });
    
    // Main menu button
    const menuButton = this.add.text(0, 40, 'MAIN MENU', {
      fontSize: '24px',
      color: '#e74c3c',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    menuButton.setInteractive({ useHandCursor: true });
    
    menuButton.on('pointerdown', () => {
      this.scene.stop('GameScene');
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
    
    menuButton.on('pointerover', () => {
      menuButton.setColor('#c0392b');
      menuButton.setScale(1.1);
    });
    
    menuButton.on('pointerout', () => {
      menuButton.setColor('#e74c3c');
      menuButton.setScale(1);
    });
    
    // Settings button
    const settingsButton = this.add.text(0, 100, 'SETTINGS', {
      fontSize: '24px',
      color: '#34495e',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    settingsButton.setInteractive({ useHandCursor: true });
    
    settingsButton.on('pointerover', () => {
      settingsButton.setColor('#2c3e50');
      settingsButton.setScale(1.1);
    });
    
    settingsButton.on('pointerout', () => {
      settingsButton.setColor('#34495e');
      settingsButton.setScale(1);
    });
    
    pauseMenu.add([pauseBg, pauseTitle, resumeButton, menuButton, settingsButton]);
    
    // ESC key to resume
    this.input.keyboard?.on('keydown-ESC', () => {
      pauseMenu.destroy();
      this.scene.resume('GameScene');
    });
  }
} 