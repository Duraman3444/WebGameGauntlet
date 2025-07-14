import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../config/GameConfig';

interface PlacedObject {
  x: number;
  y: number;
  assetKey: string;
}

export class StageEditorScene extends Phaser.Scene {
  private assetKeys: string[] = ['spike_idle', 'trampoline_idle', 'fire_off', 'saw_on', 'bomb'];
  private currentAssetIndex: number = 0;
  private placedObjects: PlacedObject[] = [];
  private infoText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'StageEditorScene' });
  }

  preload(): void {
    // Load any assets that might not already be present. If already loaded, this is a no-op.
    const assetDefs: { key: string; path: string }[] = [
      { key: 'spike_idle', path: 'assets/sprites/Traps/Spikes/Idle.png' },
      { key: 'trampoline_idle', path: 'assets/sprites/Traps/Trampoline/Idle.png' },
      { key: 'fire_off', path: 'assets/sprites/Traps/Fire/Off.png' },
      { key: 'saw_on', path: 'assets/sprites/Traps/Saw/On (38x38).png' },
      { key: 'bomb', path: 'assets/sprites/sprites/09-Bomb/Bomb On (52x56).png' },
    ];

    assetDefs.forEach(def => {
      if (!this.textures.exists(def.key)) {
        this.load.image(def.key, encodeURI(def.path));
      }
    });
  }

  create(): void {
    // Draw grid for clarity
    this.drawGrid();

    // Info text
    this.infoText = this.add.text(16, 16, 'Asset: ' + this.assetKeys[this.currentAssetIndex], {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { left: 8, right: 8, top: 4, bottom: 4 },
    }).setScrollFactor(0);

    // Input events
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const gridX = Math.floor(pointer.worldX / GAME_CONSTANTS.TILE_SIZE) * GAME_CONSTANTS.TILE_SIZE;
      const gridY = Math.floor(pointer.worldY / GAME_CONSTANTS.TILE_SIZE) * GAME_CONSTANTS.TILE_SIZE;

      const key = this.assetKeys[this.currentAssetIndex];
      const sprite = this.add.sprite(gridX + GAME_CONSTANTS.TILE_SIZE / 2, gridY + GAME_CONSTANTS.TILE_SIZE / 2, key);
      sprite.setInteractive();

      this.placedObjects.push({ x: gridX, y: gridY, assetKey: key });
    });

    // Keyboard controls
    this.input.keyboard?.on('keydown-LEFT', () => {
      this.currentAssetIndex = (this.currentAssetIndex - 1 + this.assetKeys.length) % this.assetKeys.length;
      this.updateInfo();
    });

    this.input.keyboard?.on('keydown-RIGHT', () => {
      this.currentAssetIndex = (this.currentAssetIndex + 1) % this.assetKeys.length;
      this.updateInfo();
    });

    this.input.keyboard?.on('keydown-S', () => {
      // Export JSON to clipboard / console
      const json = JSON.stringify(this.placedObjects, null, 2);
      console.log('Stage JSON:', json);
      this.add.text(16, 40, 'Layout JSON logged to console (press ESC to exit)', { fontSize: '14px', color: '#FFFF00' }).setScrollFactor(0);
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  private updateInfo(): void {
    this.infoText.setText('Asset: ' + this.assetKeys[this.currentAssetIndex]);
  }

  private drawGrid(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x444444, 0.3);

    const cols = GAME_CONSTANTS.WORLD_WIDTH / GAME_CONSTANTS.TILE_SIZE;
    const rows = GAME_CONSTANTS.WORLD_HEIGHT / GAME_CONSTANTS.TILE_SIZE;

    for (let c = 0; c <= cols; c++) {
      graphics.lineBetween(
        c * GAME_CONSTANTS.TILE_SIZE,
        0,
        c * GAME_CONSTANTS.TILE_SIZE,
        GAME_CONSTANTS.WORLD_HEIGHT
      );
    }

    for (let r = 0; r <= rows; r++) {
      graphics.lineBetween(
        0,
        r * GAME_CONSTANTS.TILE_SIZE,
        GAME_CONSTANTS.WORLD_WIDTH,
        r * GAME_CONSTANTS.TILE_SIZE
      );
    }
  }
} 