import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../config/GameConfig';

export class LevelManager {
  private scene: Phaser.Scene;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private currentWorld: number = 1;
  private currentLevel: number = 1;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createLevel(world: number, level: number): Phaser.Physics.Arcade.StaticGroup {
    this.currentWorld = world;
    this.currentLevel = level;
    
    // Create platforms group
    this.platforms = this.scene.physics.add.staticGroup();
    
    // Create level background
    this.createBackground();
    
    // Create level terrain
    this.createTerrain();
    
    // Create level decorations
    this.createDecorations();
    
    return this.platforms;
  }

  private createBackground(): void {
    // Choose background based on world
    const backgroundColors = [0x87CEEB, 0x90EE90, 0xF4A460, 0xB0C4DE]; // Sky blue, light green, sandy brown, light steel blue
    const bgColor = backgroundColors[this.currentWorld - 1] || backgroundColors[0];
    
    // Create background rectangle
    const background = this.scene.add.rectangle(0, 0, GAME_CONSTANTS.WORLD_WIDTH, GAME_CONSTANTS.WORLD_HEIGHT, bgColor);
    background.setOrigin(0, 0);
    background.setScrollFactor(0);
    
    // Add some simple background elements
    this.createBackgroundElements();
  }

  private createBackgroundElements(): void {
    // Add simple background decorations
    const decorations = ['apple', 'bananas', 'cherries', 'orange'];
    
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, GAME_CONSTANTS.WORLD_WIDTH);
      const y = Phaser.Math.Between(0, GAME_CONSTANTS.WORLD_HEIGHT - 200);
      const decoration = this.scene.add.image(x, y, Phaser.Utils.Array.GetRandom(decorations));
      decoration.setAlpha(0.1);
      decoration.setScale(0.5);
      decoration.setDepth(-1);
    }
  }

  private createTerrain(): void {
    // Create ground
    this.createGround();
    
    // Create platforms based on level
    this.createPlatforms();
    
    // Create walls
    this.createWalls();
  }

  private createGround(): void {
    // Create ground tiles
    const groundY = GAME_CONSTANTS.WORLD_HEIGHT - 50;
    const tileSize = 32;
    
    for (let x = 0; x < GAME_CONSTANTS.WORLD_WIDTH; x += tileSize) {
      const groundTile = this.scene.add.rectangle(x, groundY, tileSize, 50, 0x228B22);
      groundTile.setOrigin(0, 0);
      this.platforms.add(groundTile);
    }
  }

  private createPlatforms(): void {
    // Create platforms based on current level
    const platformData = this.getPlatformData();
    
    platformData.forEach(platform => {
      const platformSprite = this.scene.add.rectangle(
        platform.x, platform.y, 
        platform.width, platform.height, 
        0x8B4513
      );
      platformSprite.setOrigin(0, 0);
      this.platforms.add(platformSprite);
    });
  }

  private getPlatformData(): Array<{x: number, y: number, width: number, height: number}> {
    const baseHeight = GAME_CONSTANTS.WORLD_HEIGHT - 200;
    const platforms = [];
    
    // Level 1 platforms
    if (this.currentLevel === 1) {
      platforms.push(
        { x: 200, y: baseHeight, width: 150, height: 20 },
        { x: 400, y: baseHeight - 80, width: 150, height: 20 },
        { x: 600, y: baseHeight - 40, width: 150, height: 20 },
        { x: 800, y: baseHeight - 120, width: 150, height: 20 },
        { x: 1000, y: baseHeight - 60, width: 150, height: 20 }
      );
    }
    // Level 2 platforms
    else if (this.currentLevel === 2) {
      platforms.push(
        { x: 150, y: baseHeight, width: 100, height: 20 },
        { x: 300, y: baseHeight - 100, width: 100, height: 20 },
        { x: 450, y: baseHeight - 50, width: 100, height: 20 },
        { x: 600, y: baseHeight - 150, width: 100, height: 20 },
        { x: 750, y: baseHeight - 80, width: 100, height: 20 },
        { x: 900, y: baseHeight - 120, width: 100, height: 20 },
        { x: 1050, y: baseHeight - 40, width: 100, height: 20 }
      );
    }
    // Level 3 platforms
    else if (this.currentLevel === 3) {
      platforms.push(
        { x: 100, y: baseHeight - 50, width: 80, height: 20 },
        { x: 220, y: baseHeight - 120, width: 80, height: 20 },
        { x: 340, y: baseHeight - 80, width: 80, height: 20 },
        { x: 460, y: baseHeight - 160, width: 80, height: 20 },
        { x: 580, y: baseHeight - 100, width: 80, height: 20 },
        { x: 700, y: baseHeight - 140, width: 80, height: 20 },
        { x: 820, y: baseHeight - 60, width: 80, height: 20 },
        { x: 940, y: baseHeight - 180, width: 80, height: 20 },
        { x: 1060, y: baseHeight - 90, width: 80, height: 20 }
      );
    }
    
    return platforms;
  }

  private createWalls(): void {
    // Create invisible walls at screen edges
    const leftWall = this.scene.add.rectangle(0, 0, 10, GAME_CONSTANTS.WORLD_HEIGHT, 0x000000);
    leftWall.setOrigin(0, 0);
    leftWall.setAlpha(0);
    this.platforms.add(leftWall);
    
    const rightWall = this.scene.add.rectangle(GAME_CONSTANTS.WORLD_WIDTH - 10, 0, 10, GAME_CONSTANTS.WORLD_HEIGHT, 0x000000);
    rightWall.setOrigin(0, 0);
    rightWall.setAlpha(0);
    this.platforms.add(rightWall);
  }

  private createDecorations(): void {
    // Add decorative elements based on world theme
    const decorationData = this.getDecorationData();
    
    decorationData.forEach(decoration => {
      const sprite = this.scene.add.image(decoration.x, decoration.y, decoration.type);
      sprite.setScale(decoration.scale || 1);
      sprite.setAlpha(decoration.alpha || 1);
      sprite.setDepth(decoration.depth || 0);
    });
  }

  private getDecorationData(): Array<{x: number, y: number, type: string, scale?: number, alpha?: number, depth?: number}> {
    const decorations = [];
    const decorationTypes = ['apple', 'bananas', 'cherries', 'orange'];
    
    // Add some background decorations
    for (let i = 0; i < 10; i++) {
      decorations.push({
        x: Phaser.Math.Between(50, GAME_CONSTANTS.WORLD_WIDTH - 50),
        y: Phaser.Math.Between(50, GAME_CONSTANTS.WORLD_HEIGHT - 150),
        type: Phaser.Utils.Array.GetRandom(decorationTypes),
        scale: 0.3,
        alpha: 0.2,
        depth: -1
      });
    }
    
    return decorations;
  }

  // Get spawn point for current level
  getSpawnPoint(): {x: number, y: number} {
    return {
      x: 100,
      y: GAME_CONSTANTS.WORLD_HEIGHT - 200
    };
  }

  // Get exit point for current level
  getExitPoint(): {x: number, y: number} {
    return {
      x: GAME_CONSTANTS.WORLD_WIDTH - 100,
      y: GAME_CONSTANTS.WORLD_HEIGHT - 200
    };
  }

  // Clean up level
  destroy(): void {
    if (this.platforms) {
      this.platforms.clear(true, true);
    }
  }
} 