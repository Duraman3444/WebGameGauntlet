import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../config/GameConfig';
import { AssetPaths } from '../../utils/assetPaths';

interface PlacedObject {
  x: number;
  y: number;
  assetKey: string;
}

export class StageEditorScene extends Phaser.Scene {
  private assetKeys: string[] = [
    // Traps
    'spike_idle', 'trampoline_idle', 'fire_off', 'fire_on', 'saw_on', 'falling_platform_on',
    // Boxes
    'box1', 'box2', 'box3',
    // Enemies
    'flying_eye', 'goblin', 'mushroom', 'skeleton',
    // Fruits
    'apple', 'bananas', 'cherries', 'kiwi', 'melon', 'orange', 'pineapple', 'strawberry',
    // Checkpoints
    'checkpoint',
    // Terrain
    'terrain_tileset'
  ];
  private currentAssetIndex: number = 0;
  private placedObjects: PlacedObject[] = [];
  private placedSprites: Phaser.GameObjects.Sprite[] = [];
  private paletteSprites: Phaser.GameObjects.Sprite[] = [];
  private infoText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'StageEditorScene' });
  }

  preload(): void {
    // Load any assets that might not already be present. If already loaded, this is a no-op.
    const assetDefs: { key: string; path: string }[] = [
      // Traps
      { key: 'spike_idle', path: AssetPaths.spike() },
      { key: 'trampoline_idle', path: AssetPaths.trampoline() },
      { key: 'fire_off', path: AssetPaths.fire('off') },
      { key: 'fire_on', path: AssetPaths.fire('on') },
      { key: 'saw_on', path: AssetPaths.saw() },
      { key: 'falling_platform_on', path: AssetPaths.fallingPlatform() },
      // Boxes
      { key: 'box1', path: AssetPaths.box('Box1') },
      { key: 'box2', path: AssetPaths.box('Box2') },
      { key: 'box3', path: AssetPaths.box('Box3') },
      // Enemies
      { key: 'flying_eye', path: AssetPaths.enemy('flying_eye') },
      { key: 'goblin', path: AssetPaths.enemy('goblin') },
      { key: 'mushroom', path: AssetPaths.enemy('mushroom') },
      { key: 'skeleton', path: AssetPaths.enemy('skeleton') },
      // Fruits
      { key: 'apple', path: AssetPaths.fruit('Apple') },
      { key: 'bananas', path: AssetPaths.fruit('Bananas') },
      { key: 'cherries', path: AssetPaths.fruit('Cherries') },
      { key: 'kiwi', path: AssetPaths.fruit('Kiwi') },
      { key: 'melon', path: AssetPaths.fruit('Melon') },
      { key: 'orange', path: AssetPaths.fruit('Orange') },
      { key: 'pineapple', path: AssetPaths.fruit('Pineapple') },
      { key: 'strawberry', path: AssetPaths.fruit('Strawberry') },
      // Checkpoints
      { key: 'checkpoint', path: AssetPaths.checkpoint() },
      // Terrain
      { key: 'terrain_tileset', path: AssetPaths.terrain('Terrain (16x16).png') }
    ];

    assetDefs.forEach(def => {
      if (!this.textures.exists(def.key)) {
        if (def.key === 'terrain_tileset') {
          this.load.spritesheet(def.key, encodeURI(def.path), {
            frameWidth: 16,
            frameHeight: 16
          });
        } else {
          this.load.image(def.key, encodeURI(def.path));
        }
      }
    });
  }

  create(): void {
    // Disable context menu so right-click works for deletion
    (this.input.mouse as any)?.disableContextMenu?.();

    // Draw grid for clarity
    this.drawGrid();

    // Draw palette UI (fixed to camera)
    this.createPalette();

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

      // Right-click deletes object if present
      if (pointer.rightButtonDown()) {
        const idx = this.placedObjects.findIndex(obj => obj.x === gridX && obj.y === gridY);
        if (idx !== -1) {
          // Destroy sprite and remove data
          this.placedSprites[idx].destroy();
          this.placedSprites.splice(idx, 1);
          this.placedObjects.splice(idx, 1);
        }
        return;
      }

      const key = this.assetKeys[this.currentAssetIndex];

      // Prevent duplicate placement at same tile
      if (this.placedObjects.some(o => o.x === gridX && o.y === gridY)) {
        return;
      }

      const sprite = this.add.sprite(gridX + GAME_CONSTANTS.TILE_SIZE / 2, gridY + GAME_CONSTANTS.TILE_SIZE / 2, key);
      sprite.setOrigin(0.5);
      this.placedObjects.push({ x: gridX, y: gridY, assetKey: key });
      this.placedSprites.push(sprite);
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

  private createPalette(): void {
    const startX = 16;
    const startY = 60;
    const iconSize = 32;
    const padding = 8;
    const cols = 10;

    this.assetKeys.forEach((key, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (iconSize + padding);
      const y = startY + row * (iconSize + padding);

      const sprite = this.add.sprite(x, y, key).setScrollFactor(0);
      sprite.setDisplaySize(iconSize, iconSize);
      sprite.setInteractive({ useHandCursor: true });

      sprite.on('pointerdown', () => {
        this.currentAssetIndex = index;
        this.updateInfo();
        this.highlightPalette();
      });

      this.paletteSprites.push(sprite);
    });

    this.highlightPalette();
  }

  private highlightPalette(): void {
    this.paletteSprites.forEach((sprite, idx) => {
      sprite.setTint(idx === this.currentAssetIndex ? 0xffff00 : 0xffffff);
      sprite.setScale(idx === this.currentAssetIndex ? 1.2 : 1);
    });
  }

  private updateInfo(): void {
    this.infoText.setText('Asset: ' + this.assetKeys[this.currentAssetIndex]);
    this.highlightPalette();
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