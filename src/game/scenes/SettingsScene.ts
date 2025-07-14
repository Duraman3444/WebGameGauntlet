import Phaser from 'phaser';

interface SettingOption {
  key: string;
  label: string;
  type: 'toggle' | 'slider' | 'select';
  value: any;
  options?: any[];
  min?: number;
  max?: number;
  step?: number;
}

export class SettingsScene extends Phaser.Scene {
  private settings: SettingOption[] = [];
  private currentSettingIndex: number = 0;
  private settingTexts: Phaser.GameObjects.Text[] = [];
  private valueTexts: Phaser.GameObjects.Text[] = [];
  private cursor: Phaser.GameObjects.Rectangle | null = null;
  private backButton: Phaser.GameObjects.Text | null = null;
  private titleText: Phaser.GameObjects.Text | null = null;
  private instructionsText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'SettingsScene' });
  }

  init(): void {
    this.initializeSettings();
    this.loadSettings();
  }

  create(): void {
    console.log('⚙️ SettingsScene: Creating settings screen...');
    
    // Create background
    this.createBackground();
    
    // Create title
    this.createTitle();
    
    // Create settings UI
    this.createSettingsUI();
    
    // Create navigation UI
    this.createNavigationUI();
    
    // Set up input handling
    this.setupInput();
  }

  private initializeSettings(): void {
    this.settings = [
      {
        key: 'masterVolume',
        label: 'Master Volume',
        type: 'slider',
        value: 1.0,
        min: 0,
        max: 1,
        step: 0.1
      },
      {
        key: 'musicVolume',
        label: 'Music Volume',
        type: 'slider',
        value: 0.8,
        min: 0,
        max: 1,
        step: 0.1
      },
      {
        key: 'sfxVolume',
        label: 'SFX Volume',
        type: 'slider',
        value: 0.9,
        min: 0,
        max: 1,
        step: 0.1
      },
      {
        key: 'showFPS',
        label: 'Show FPS',
        type: 'toggle',
        value: false
      },
      {
        key: 'vsync',
        label: 'VSync',
        type: 'toggle',
        value: true
      },
      {
        key: 'gameSpeed',
        label: 'Game Speed',
        type: 'select',
        value: 'Normal',
        options: ['Slow', 'Normal', 'Fast']
      },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        value: 'Normal',
        options: ['Easy', 'Normal', 'Hard', 'Expert']
      },
      {
        key: 'controlType',
        label: 'Controls',
        type: 'select',
        value: 'Keyboard',
        options: ['Keyboard', 'Gamepad']
      }
    ];
  }

  private loadSettings(): void {
    // Load settings from localStorage
    this.settings.forEach(setting => {
      const savedValue = localStorage.getItem(`fruitRunners_${setting.key}`);
      if (savedValue !== null) {
        switch (setting.type) {
          case 'toggle':
            setting.value = savedValue === 'true';
            break;
          case 'slider':
            setting.value = parseFloat(savedValue);
            break;
          case 'select':
            setting.value = savedValue;
            break;
        }
      }
    });
  }

  private saveSettings(): void {
    // Save settings to localStorage
    this.settings.forEach(setting => {
      localStorage.setItem(`fruitRunners_${setting.key}`, setting.value.toString());
    });
    
    // Apply settings to the game
    this.applySettings();
  }

  private applySettings(): void {
    // Apply volume settings
    const masterVolume = this.getSettingValue('masterVolume');
    const musicVolume = this.getSettingValue('musicVolume');
    const sfxVolume = this.getSettingValue('sfxVolume');
    
    // Store in registry for other scenes to access
    this.registry.set('masterVolume', masterVolume);
    this.registry.set('musicVolume', musicVolume);
    this.registry.set('sfxVolume', sfxVolume);
    this.registry.set('showFPS', this.getSettingValue('showFPS'));
    this.registry.set('vsync', this.getSettingValue('vsync'));
    this.registry.set('gameSpeed', this.getSettingValue('gameSpeed'));
    this.registry.set('difficulty', this.getSettingValue('difficulty'));
    this.registry.set('controlType', this.getSettingValue('controlType'));
    
    console.log('⚙️ Settings applied successfully!');
  }

  private getSettingValue(key: string): any {
    const setting = this.settings.find(s => s.key === key);
    return setting ? setting.value : null;
  }

  private createBackground(): void {
    // Create gradient background
    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1a1a2e);
    bg.setOrigin(0, 0);
    
    // Add subtle pattern
    for (let i = 0; i < 30; i++) {
      const gear = this.add.text(
        Math.random() * this.cameras.main.width,
        Math.random() * this.cameras.main.height,
        '⚙️',
        { fontSize: '20px' }
      );
      gear.setAlpha(0.1);
      gear.setRotation(Math.random() * Math.PI * 2);
    }
  }

  private createTitle(): void {
    const centerX = this.cameras.main.width / 2;
    
    // Title
    this.titleText = this.add.text(centerX, 80, 'SETTINGS', {
      fontSize: '48px',
      color: '#FFFFFF',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(centerX, 120, 'Configure your game experience', {
      fontSize: '18px',
      color: '#FFFF00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
  }

  private createSettingsUI(): void {
    const centerX = this.cameras.main.width / 2;
    const startY = 180;
    const itemHeight = 50;
    
    this.settings.forEach((setting, index) => {
      const y = startY + (index * itemHeight);
      
      // Setting label
      const labelText = this.add.text(centerX - 200, y, setting.label, {
        fontSize: '20px',
        color: '#FFFFFF',
        fontFamily: 'Arial Black'
      }).setOrigin(0, 0.5);
      this.settingTexts.push(labelText);
      
      // Setting value
      const valueText = this.add.text(centerX + 200, y, this.getValueDisplay(setting), {
        fontSize: '18px',
        color: '#FFFF00',
        fontFamily: 'Arial'
      }).setOrigin(1, 0.5);
      this.valueTexts.push(valueText);
    });
    
    // Create cursor
    this.cursor = this.add.rectangle(centerX - 220, startY, 20, 20, 0xFF6B6B);
    this.updateCursorPosition();
  }

  private createNavigationUI(): void {
    const centerX = this.cameras.main.width / 2;
    const bottomY = this.cameras.main.height - 80;
    
    // Instructions
    this.instructionsText = this.add.text(centerX, bottomY - 40, 'UP/DOWN: Navigate • LEFT/RIGHT: Change • ENTER: Apply • ESC: Back', {
      fontSize: '14px',
      color: '#CCCCCC',
      fontFamily: 'Arial',
      align: 'center'
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
    
    // Apply button
    const applyButton = this.add.text(centerX, bottomY, 'APPLY SETTINGS', {
      fontSize: '20px',
      color: '#00FF00',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    applyButton.setInteractive();
    applyButton.on('pointerdown', () => this.applyAndSaveSettings());
  }

  private setupInput(): void {
    // Keyboard navigation
    this.input.keyboard?.on('keydown-UP', () => this.navigateSettings(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.navigateSettings(1));
    this.input.keyboard?.on('keydown-LEFT', () => this.changeSetting(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.changeSetting(1));
    
    this.input.keyboard?.on('keydown-ENTER', () => this.applyAndSaveSettings());
    this.input.keyboard?.on('keydown-ESC', () => this.goBack());
  }

  private navigateSettings(direction: number): void {
    this.currentSettingIndex = Math.max(0, Math.min(this.settings.length - 1, this.currentSettingIndex + direction));
    this.updateCursorPosition();
    this.updateSettingHighlight();
  }

  private changeSetting(direction: number): void {
    const setting = this.settings[this.currentSettingIndex];
    
    switch (setting.type) {
      case 'toggle':
        setting.value = !setting.value;
        break;
      case 'slider':
        setting.value = Math.max(setting.min!, Math.min(setting.max!, setting.value + (direction * setting.step!)));
        setting.value = Math.round(setting.value * 10) / 10; // Round to 1 decimal place
        break;
      case 'select':
        const currentIndex = setting.options!.indexOf(setting.value);
        const newIndex = (currentIndex + direction + setting.options!.length) % setting.options!.length;
        setting.value = setting.options![newIndex];
        break;
    }
    
    this.updateValueDisplay(this.currentSettingIndex);
  }

  private updateCursorPosition(): void {
    if (this.cursor) {
      const centerX = this.cameras.main.width / 2;
      const startY = 180;
      const itemHeight = 50;
      this.cursor.setPosition(centerX - 220, startY + (this.currentSettingIndex * itemHeight));
    }
  }

  private updateSettingHighlight(): void {
    this.settingTexts.forEach((text, index) => {
      text.setColor(index === this.currentSettingIndex ? '#FFFF00' : '#FFFFFF');
    });
  }

  private updateValueDisplay(index: number): void {
    if (this.valueTexts[index]) {
      this.valueTexts[index].setText(this.getValueDisplay(this.settings[index]));
    }
  }

  private getValueDisplay(setting: SettingOption): string {
    switch (setting.type) {
      case 'toggle':
        return setting.value ? 'ON' : 'OFF';
      case 'slider':
        return `${Math.round(setting.value * 100)}%`;
      case 'select':
        return setting.value.toString();
      default:
        return setting.value.toString();
    }
  }

  private applyAndSaveSettings(): void {
    this.saveSettings();
    
    // Show confirmation message
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    const confirmationText = this.add.text(centerX, centerY, 'SETTINGS APPLIED!', {
      fontSize: '32px',
      color: '#00FF00',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Fade out confirmation after 2 seconds
    this.tweens.add({
      targets: confirmationText,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        confirmationText.destroy();
      }
    });
  }

  private goBack(): void {
    console.log('🔙 Going back to menu...');
    this.scene.start('MenuScene');
  }
} 