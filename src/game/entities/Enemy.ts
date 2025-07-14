import Phaser from 'phaser';
import { GAME_CONSTANTS, COLORS } from '../config/GameConfig';

export class Enemy {
  public sprite!: Phaser.Physics.Arcade.Sprite;
  public type: string;
  public isAlive: boolean = true;
  public direction: number = -1; // -1 for left, 1 for right
  public health: number = 1;
  
  private scene: Phaser.Scene;
  private speed: number = GAME_CONSTANTS.ENEMY_SPEED;
  private originalX: number;
  private patrolDistance: number = 100;
  private stunned: boolean = false;
  private stunnedTimer: number = 0;
  private isFlying: boolean = false;
  private verticalOffset: number = 0;
  private verticalSpeed: number = 0.5;

  constructor(scene: Phaser.Scene, x: number, y: number, type: string) {
    this.scene = scene;
    this.type = type;
    this.originalX = x;
    
    this.create(x, y);
  }

  private create(x: number, y: number): void {
    // Create enemy sprite
    this.sprite = this.scene.physics.add.sprite(x, y, '');
    
    // Create enemy visual representation
    this.createEnemyGraphics();
    
    // Set up physics properties
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(GAME_CONSTANTS.ENEMY_BOUNCE);
    this.sprite.setVelocityX(this.direction * this.speed);
    
    // Configure different enemy types
    this.configureEnemyType();
  }

  private createEnemyGraphics(): void {
    // Try to load the actual enemy sprite first
    if (this.scene.textures.exists(this.type)) {
      this.sprite.setTexture(this.type);
      this.sprite.setDisplaySize(GAME_CONSTANTS.PLAYER_SIZE, GAME_CONSTANTS.PLAYER_SIZE);
      if (this.sprite.body) {
        this.sprite.body.setSize(GAME_CONSTANTS.PLAYER_SIZE * 0.8, GAME_CONSTANTS.PLAYER_SIZE * 0.8);
      }
      return;
    }
    
    // Fallback to generated graphics
    const graphics = this.scene.add.graphics();
    const size = GAME_CONSTANTS.PLAYER_SIZE;
    let color: number;
    
    switch (this.type) {
      case GAME_CONSTANTS.ENEMY_TYPES.FLYING_EYE:
        color = 0x8A2BE2; // Purple
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.GOBLIN:
        color = 0x00FF00; // Green
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.MUSHROOM:
        color = 0x8B4513; // Brown
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.SKELETON:
        color = 0xF5F5DC; // Bone white
        break;
      default:
        color = 0xFF69B4; // Pink fallback
    }
    
    // Create simple colored rectangle as fallback
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, size, size);
    graphics.fillStyle(0x000000);
    graphics.fillRect(2, 2, size - 4, size - 4);
    graphics.fillStyle(color);
    graphics.fillRect(4, 4, size - 8, size - 8);
    
    graphics.generateTexture(`enemy_${this.type}`, size, size);
    
    this.sprite.setTexture(`enemy_${this.type}`);
    this.sprite.setDisplaySize(size, size);
    if (this.sprite.body) {
      this.sprite.body.setSize(size * 0.8, size * 0.8);
    }
    
    graphics.destroy();
  }

  private configureEnemyType(): void {
    switch (this.type) {
      case GAME_CONSTANTS.ENEMY_TYPES.FLYING_EYE:
        this.speed = GAME_CONSTANTS.ENEMY_SPEED * 0.8;
        this.health = 1;
        this.patrolDistance = 120;
        this.isFlying = true;
        if (this.sprite.body && 'setGravityY' in this.sprite.body) {
          (this.sprite.body as Phaser.Physics.Arcade.Body).setGravityY(-300); // Reduce gravity for flying
        }
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.GOBLIN:
        this.speed = GAME_CONSTANTS.ENEMY_SPEED;
        this.health = 2;
        this.patrolDistance = 100;
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.MUSHROOM:
        this.speed = GAME_CONSTANTS.ENEMY_SPEED * 0.6;
        this.health = 1;
        this.patrolDistance = 80;
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.SKELETON:
        this.speed = GAME_CONSTANTS.ENEMY_SPEED * 1.1;
        this.health = 3;
        this.patrolDistance = 150;
        break;
    }
  }

  public update(): void {
    if (!this.isAlive) return;
    
    // Handle stunned state
    if (this.stunned) {
      this.stunnedTimer -= 16; // Assuming 60 FPS
      if (this.stunnedTimer <= 0) {
        this.stunned = false;
        this.sprite.clearTint();
      }
      return;
    }
    
    // Basic patrol behavior for all enemies
    const distanceFromOrigin = Math.abs(this.sprite.x - this.originalX);
    
    if (distanceFromOrigin > this.patrolDistance) {
      this.direction *= -1;
    }
    
    this.sprite.setVelocityX(this.direction * this.speed);
    
    // Special behavior for flying enemies
    if (this.isFlying) {
      this.verticalOffset += this.verticalSpeed;
      const verticalMovement = Math.sin(this.verticalOffset) * 20;
      this.sprite.setVelocityY(verticalMovement);
    }
    
    // Update sprite direction
    this.sprite.setFlipX(this.direction > 0);
    
    // Check for world bounds
    this.checkWorldBounds();
  }

  private checkWorldBounds(): void {
    if (this.sprite.x < 0 || this.sprite.x > GAME_CONSTANTS.WORLD_WIDTH) {
      this.direction *= -1;
    }
  }

  public takeDamage(damage: number = 1): void {
    if (this.stunned) return;
    
    this.health -= damage;
    
    if (this.health <= 0) {
      this.die();
    } else {
      this.stun();
    }
  }

  private stun(): void {
    this.stunned = true;
    this.stunnedTimer = 1000; // 1 second stun
    this.sprite.setTint(0xFF0000); // Red tint when stunned
  }

  private die(): void {
    this.isAlive = false;
    this.sprite.setTint(0x666666); // Gray tint when dead
    this.sprite.setVelocity(0, 0);
    
    // Remove after a short delay
    this.scene.time.delayedCall(500, () => {
      this.destroy();
    });
  }

  public getScoreValue(): number {
    switch (this.type) {
      case GAME_CONSTANTS.ENEMY_TYPES.FLYING_EYE:
        return 150;
      case GAME_CONSTANTS.ENEMY_TYPES.GOBLIN:
        return 200;
      case GAME_CONSTANTS.ENEMY_TYPES.MUSHROOM:
        return 100;
      case GAME_CONSTANTS.ENEMY_TYPES.SKELETON:
        return 300;
      default:
        return 100;
    }
  }

  public destroy(): void {
    this.sprite.destroy();
  }
} 