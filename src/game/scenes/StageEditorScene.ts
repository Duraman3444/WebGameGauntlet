import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../config/GameConfig';

interface PlacedObject {
  x: number;
  y: number;
  assetKey: string;
}

export class StageEditorScene extends Phaser.Scene {
  private assetKeys: string[] = [
    // Traps / terrain
    'spike_idle', 'trampoline_idle', 'fire_off', 'saw_on', 'bomb',
    // Boxes
    'box1', 'box2', 'box3',
    // Enemies (generated icons)
    'enemy_goomba', 'enemy_koopa', 'enemy_piranha'
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
    const assetDefs: { key: string; path?: string; generate?: () => void }[] = [
      { key: 'spike_idle', path: 'assets/sprites/Traps/Spikes/Idle.png' },
      { key: 'trampoline_idle', path: 'assets/sprites/Traps/Trampoline/Idle.png' },
      { key: 'fire_off', path: 'assets/sprites/Traps/Fire/Off.png' },
      { key: 'saw_on', path: 'assets/sprites/Traps/Saw/On (38x38).png' },
      { key: 'bomb', path: 'assets/sprites/sprites/09-Bomb/Bomb On (52x56).png' },
      // Boxes
      { key: 'box1', path: 'assets/sprites/Items/Boxes/Box1/Idle.png' },
      { key: 'box2', path: 'assets/sprites/Items/Boxes/Box2/Idle.png' },
      { key: 'box3', path: 'assets/sprites/Items/Boxes/Box3/Idle.png' },
      // Enemy icons generated via graphics
      {
        key: 'enemy_goomba',
        generate: () => {
          const g = this.add.graphics();
          const s = 16;
          g.fillStyle(0x8B4513).fillRect(0, s * 0.4, s, s * 0.6);
          g.fillStyle(0xA0522D).fillCircle(s / 2, s * 0.3, s * 0.3);
          g.fillStyle(0x000000);
          g.fillCircle(s * 0.35, s * 0.25, 2);
          g.fillCircle(s * 0.65, s * 0.25, 2);
          g.generateTexture('enemy_goomba', s, s);
          g.destroy();
        }
      },
      {
        key: 'enemy_koopa',
        generate: () => {
          const g = this.add.graphics();
          const s = 16;
          g.fillStyle(0x32CD32).fillRect(s * 0.1, s * 0.3, s * 0.8, s * 0.7);
          g.fillStyle(0xFFFF00).fillCircle(s / 2, s * 0.2, s * 0.15);
          g.fillStyle(0x000000).fillCircle(s * 0.45, s * 0.18, 1.5);
          g.fillCircle(s * 0.55, s * 0.18, 1.5);
          g.generateTexture('enemy_koopa', s, s);
          g.destroy();
        }
      },
      {
        key: 'enemy_piranha',
        generate: () => {
          const g = this.add.graphics();
          const s = 16;
          g.fillStyle(0x32CD32).fillRect(s * 0.2, s * 0.5, s * 0.6, s * 0.5);
          g.fillStyle(0xFF0000).fillCircle(s / 2, s * 0.3, s * 0.25);
          g.fillStyle(0x000000).fillRect(s * 0.35, s * 0.3, s * 0.3, s * 0.05);
          g.generateTexture('enemy_piranha', s, s);
          g.destroy();
        }
      }
    ];

    assetDefs.forEach(def => {
      if (def.path) {
        if (!this.textures.exists(def.key)) {
          this.load.image(def.key, encodeURI(def.path));
        }
      } else if (def.generate) {
        // Generate after load completes
        this.textures.exists(def.key) || def.generate();
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
    const iconSize = 28;

    this.assetKeys.forEach((key, index) => {
      const sprite = this.add.sprite(startX + index * (iconSize + 8), startY, key).setScrollFactor(0);
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