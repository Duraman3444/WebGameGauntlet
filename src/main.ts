import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

// Register all scenes
const gameConfig: Phaser.Types.Core.GameConfig = {
  ...GameConfig,
  scene: [PreloadScene, MenuScene, GameScene, UIScene]
};

// Initialize the game
const game = new Phaser.Game(gameConfig);

// Hide loading screen once game is ready
game.events.once('ready', () => {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.add('hidden');
  }
});

// Export game instance for debugging
(window as any).game = game;

export default game; 