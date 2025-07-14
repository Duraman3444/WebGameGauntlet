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
    const graphics = this.scene.add.graphics();
    const size = GAME_CONSTANTS.PLAYER_SIZE;
    
    switch (this.type) {
      case GAME_CONSTANTS.ENEMY_TYPES.GOOMBA:
        this.createGoombaGraphics(graphics, size);
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.KOOPA:
        this.createKoopaGraphics(graphics, size);
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.PIRANHA:
        this.createPiranhaGraphics(graphics, size);
        break;
      default:
        this.createGoombaGraphics(graphics, size);
    }
    
    graphics.generateTexture(`enemy_${this.type}`, size, size);
    
    this.sprite.setTexture(`enemy_${this.type}`);
    this.sprite.setDisplaySize(size, size);
    if (this.sprite.body) {
      this.sprite.body.setSize(size * 0.8, size * 0.8);
    }
    
    graphics.destroy();
  }

  private createGoombaGraphics(graphics: Phaser.GameObjects.Graphics, size: number): void {
    // Body
    graphics.fillStyle(0x8B4513); // Brown
    graphics.fillRect(0, size * 0.4, size, size * 0.6);
    
    // Head
    graphics.fillStyle(0xA0522D); // Sandy brown
    graphics.fillCircle(size / 2, size * 0.3, size * 0.3);
    
    // Eyes
    graphics.fillStyle(0x000000); // Black
    graphics.fillCircle(size * 0.35, size * 0.25, 3);
    graphics.fillCircle(size * 0.65, size * 0.25, 3);
    
    // Eyebrows (angry look)
    graphics.fillStyle(0x654321); // Dark brown
    graphics.fillRect(size * 0.3, size * 0.2, size * 0.1, 2);
    graphics.fillRect(size * 0.6, size * 0.2, size * 0.1, 2);
    
    // Feet
    graphics.fillStyle(0x000000); // Black
    graphics.fillRect(size * 0.2, size * 0.9, size * 0.2, size * 0.1);
    graphics.fillRect(size * 0.6, size * 0.9, size * 0.2, size * 0.1);
  }

  private createKoopaGraphics(graphics: Phaser.GameObjects.Graphics, size: number): void {
    // Shell
    graphics.fillStyle(0x32CD32); // Green
    graphics.fillRect(size * 0.1, size * 0.3, size * 0.8, size * 0.7);
    
    // Shell pattern
    graphics.fillStyle(0x228B22); // Dark green
    graphics.fillRect(size * 0.2, size * 0.4, size * 0.6, size * 0.2);
    graphics.fillRect(size * 0.2, size * 0.7, size * 0.6, size * 0.2);
    
    // Head
    graphics.fillStyle(0xFFFF00); // Yellow
    graphics.fillCircle(size / 2, size * 0.2, size * 0.15);
    
    // Eyes
    graphics.fillStyle(0x000000); // Black
    graphics.fillCircle(size * 0.45, size * 0.18, 2);
    graphics.fillCircle(size * 0.55, size * 0.18, 2);
    
    // Beak
    graphics.fillStyle(0xFF8C00); // Orange
    graphics.fillTriangle(size * 0.5, size * 0.22, size * 0.48, size * 0.25, size * 0.52, size * 0.25);
    
    // Legs
    graphics.fillStyle(0xFFFF00); // Yellow
    graphics.fillRect(size * 0.25, size * 0.8, size * 0.1, size * 0.2);
    graphics.fillRect(size * 0.65, size * 0.8, size * 0.1, size * 0.2);
  }

  private createPiranhaGraphics(graphics: Phaser.GameObjects.Graphics, size: number): void {
    // Plant body
    graphics.fillStyle(0x32CD32); // Green
    graphics.fillRect(size * 0.2, size * 0.5, size * 0.6, size * 0.5);
    
    // Head
    graphics.fillStyle(0xFF0000); // Red
    graphics.fillCircle(size / 2, size * 0.3, size * 0.25);
    
    // Mouth
    graphics.fillStyle(0x000000); // Black
    graphics.fillRect(size * 0.35, size * 0.3, size * 0.3, size * 0.1);
    
    // Teeth
    graphics.fillStyle(0xFFFFFF); // White
    for (let i = 0; i < 4; i++) {
      const x = size * 0.37 + i * size * 0.06;
      graphics.fillTriangle(x, size * 0.28, x + size * 0.02, size * 0.32, x + size * 0.04, size * 0.28);
    }
    
    // Spots
    graphics.fillStyle(0x8B0000); // Dark red
    graphics.fillCircle(size * 0.4, size * 0.25, 2);
    graphics.fillCircle(size * 0.6, size * 0.25, 2);
    
    // Leaves
    graphics.fillStyle(0x228B22); // Dark green
    graphics.fillRect(size * 0.1, size * 0.15, size * 0.15, size * 0.3);
    graphics.fillRect(size * 0.75, size * 0.15, size * 0.15, size * 0.3);
  }

  private configureEnemyType(): void {
    switch (this.type) {
      case GAME_CONSTANTS.ENEMY_TYPES.GOOMBA:
        this.speed = GAME_CONSTANTS.ENEMY_SPEED;
        this.health = 1;
        this.patrolDistance = 100;
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.KOOPA:
        this.speed = GAME_CONSTANTS.ENEMY_SPEED * 1.2;
        this.health = 2;
        this.patrolDistance = 150;
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.PIRANHA:
        this.speed = 0; // Piranha plants don't move horizontally
        this.health = 2;
        this.patrolDistance = 0;
        this.setupPiranhaMovement();
        break;
    }
  }

  private setupPiranhaMovement(): void {
    // Piranha plants move up and down
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 40,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
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
    
    // Different update logic for different enemy types
    switch (this.type) {
      case GAME_CONSTANTS.ENEMY_TYPES.GOOMBA:
        this.updateGoomba();
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.KOOPA:
        this.updateKoopa();
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.PIRANHA:
        this.updatePiranha();
        break;
    }
    
    // Check for world bounds
    this.checkWorldBounds();
  }

  private updateGoomba(): void {
    // Simple back and forth movement
    const distanceFromOrigin = Math.abs(this.sprite.x - this.originalX);
    
    if (distanceFromOrigin > this.patrolDistance) {
      this.direction *= -1;
    }
    
    this.sprite.setVelocityX(this.direction * this.speed);
    
    // Update sprite direction
    this.sprite.setFlipX(this.direction > 0);
  }

  private updateKoopa(): void {
    // Koopa behavior - similar to Goomba but faster
    const distanceFromOrigin = Math.abs(this.sprite.x - this.originalX);
    
    if (distanceFromOrigin > this.patrolDistance) {
      this.direction *= -1;
    }
    
    this.sprite.setVelocityX(this.direction * this.speed);
    
    // Update sprite direction
    this.sprite.setFlipX(this.direction > 0);
  }

  private updatePiranha(): void {
    // Piranha plants don't move horizontally, just up and down
    // Movement is handled by the tween in setupPiranhaMovement()
    this.sprite.setVelocityX(0);
  }

  private checkWorldBounds(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // Reverse direction if hitting world bounds
    if (body.blocked.left || body.blocked.right) {
      this.direction *= -1;
    }
  }

  public takeDamage(damage: number = 1): void {
    this.health -= damage;
    
    if (this.health <= 0) {
      this.die();
    } else {
      this.stun();
    }
  }

  public jumpedOn(): void {
    switch (this.type) {
      case GAME_CONSTANTS.ENEMY_TYPES.GOOMBA:
        this.die();
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.KOOPA:
        this.enterShell();
        break;
      case GAME_CONSTANTS.ENEMY_TYPES.PIRANHA:
        this.takeDamage(2); // Piranha plants take 2 damage to die
        break;
    }
  }

  private enterShell(): void {
    if (this.type === GAME_CONSTANTS.ENEMY_TYPES.KOOPA) {
      this.speed = 0;
      this.sprite.setVelocityX(0);
      this.sprite.setTint(0x888888); // Gray tint for shell
      
      // After 3 seconds, come back out
      this.scene.time.delayedCall(3000, () => {
        if (this.isAlive) {
          this.speed = GAME_CONSTANTS.ENEMY_SPEED * 1.2;
          this.sprite.clearTint();
        }
      });
    }
  }

  private stun(): void {
    this.stunned = true;
    this.stunnedTimer = 1000; // 1 second stun
    this.sprite.setTint(0xff0000); // Red tint
    this.sprite.setVelocityX(0);
  }

  private die(): void {
    this.isAlive = false;
    
    // Create death effect
    this.createDeathEffect();
    
    // Remove sprite
    this.sprite.destroy();
    
    // Emit death event
    this.scene.events.emit('enemy_defeated', {
      type: this.type,
      x: this.sprite.x,
      y: this.sprite.y,
      score: this.getScoreValue()
    });
  }

  private createDeathEffect(): void {
    // Create particles or animation for death
    const effect = this.scene.add.circle(this.sprite.x, this.sprite.y, 16, 0xFFFF00, 0.7);
    
    this.scene.tweens.add({
      targets: effect,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        effect.destroy();
      }
    });
    
    // Create score text
    const scoreText = this.scene.add.text(this.sprite.x, this.sprite.y - 20, `+${this.getScoreValue()}`, {
      fontSize: '16px',
      color: '#FFD700',
      fontFamily: 'Arial Bold'
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: scoreText,
      y: this.sprite.y - 60,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        scoreText.destroy();
      }
    });
  }

  public getScoreValue(): number {
    switch (this.type) {
      case GAME_CONSTANTS.ENEMY_TYPES.GOOMBA:
        return 100;
      case GAME_CONSTANTS.ENEMY_TYPES.KOOPA:
        return 200;
      case GAME_CONSTANTS.ENEMY_TYPES.PIRANHA:
        return 300;
      default:
        return 100;
    }
  }

  public getNetworkData(): any {
    return {
      type: this.type,
      x: this.sprite.x,
      y: this.sprite.y,
      direction: this.direction,
      isAlive: this.isAlive,
      health: this.health,
      stunned: this.stunned
    };
  }

  public updateFromNetwork(data: any): void {
    this.sprite.setPosition(data.x, data.y);
    this.direction = data.direction;
    this.isAlive = data.isAlive;
    this.health = data.health;
    this.stunned = data.stunned;
    
    if (this.stunned) {
      this.sprite.setTint(0xff0000);
    } else {
      this.sprite.clearTint();
    }
  }

  public destroy(): void {
    this.sprite.destroy();
  }
} 