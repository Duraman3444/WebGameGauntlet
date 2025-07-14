import Phaser from 'phaser';
import { GAME_CONFIG } from './config/GameConfig';
import { MenuScene } from './scenes/MenuScene';
import { LobbyScene } from './scenes/LobbyScene';
import { GameScene } from './scenes/GameScene';

export class PhaserGame {
  private game: Phaser.Game | null = null;
  private container: HTMLElement | null = null;

  constructor() {
    // Scenes will be added during initialization
  }

  public init(containerId: string): void {
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`Container with id '${containerId}' not found`);
      return;
    }

    // Configure Phaser game
    const config: Phaser.Types.Core.GameConfig = {
      ...GAME_CONFIG,
      parent: containerId,
      scene: [MenuScene, LobbyScene, GameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_CONFIG.width,
        height: GAME_CONFIG.height,
        min: {
          width: 800,
          height: 450
        },
        max: {
          width: 1600,
          height: 900
        }
      },
      backgroundColor: '#87CEEB'
    };

    this.game = new Phaser.Game(config);
    
    // Set up game event listeners
    this.setupGameEventListeners();
  }

  private setupGameEventListeners(): void {
    if (!this.game) return;

    // Handle game ready
    this.game.events.on('ready', () => {
      console.log('Phaser game is ready');
    });

    // Handle game destroy
    this.game.events.on('destroy', () => {
      console.log('Phaser game destroyed');
    });
  }

  public resize(): void {
    if (this.game) {
      this.game.scale.resize(
        this.container?.clientWidth || GAME_CONFIG.width,
        this.container?.clientHeight || GAME_CONFIG.height
      );
    }
  }

  public pause(): void {
    if (this.game) {
      this.game.pause();
    }
  }

  public resume(): void {
    if (this.game) {
      this.game.resume();
    }
  }

  public destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  public getCurrentScene(): Phaser.Scene | null {
    if (!this.game) return null;
    return this.game.scene.getScene('GameScene') || 
           this.game.scene.getScene('MenuScene') || 
           this.game.scene.getScene('LobbyScene');
  }

  public getGame(): Phaser.Game | null {
    return this.game;
  }

  public startScene(sceneKey: string): void {
    if (this.game) {
      this.game.scene.start(sceneKey);
    }
  }

  public switchToScene(sceneKey: string): void {
    if (this.game) {
      this.game.scene.switch(this.game.scene.getScenes(true)[0].scene.key, sceneKey);
    }
  }

  // Static instance for singleton pattern
  private static instance: PhaserGame;

  public static getInstance(): PhaserGame {
    if (!PhaserGame.instance) {
      PhaserGame.instance = new PhaserGame();
    }
    return PhaserGame.instance;
  }
}

// Export singleton instance
export const phaserGame = PhaserGame.getInstance(); 