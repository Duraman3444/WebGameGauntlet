import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../config/GameConfig';

export class Enemy {
  public sprite!: Phaser.Physics.Arcade.Sprite;
  public health: number = GAME_CONSTANTS.ENEMY_HEALTH;
  public maxHealth: number = GAME_CONSTANTS.ENEMY_HEALTH;
  public isDead: boolean = false;
  public isAttacking: boolean = false;
  
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private type: string;
  private direction: number = 1; // 1 for right, -1 for left
  private patrolDistance: number = 100;
  private startX: number;
  private player: any;
  private attackCooldown: number = 0;
  private lastAttackTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: string) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.startX = x;
    this.type = type;
  }

  create(): void {
    // Create enemy sprite
    this.sprite = this.scene.physics.add.sprite(this.x, this.y, this.type);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.1);
    this.sprite.setSize(28, 30);
    this.sprite.setOffset(2, 2);
    
    // Store reference to this enemy in the sprite
    this.sprite.setData('enemy', this);
    
    // Start with attack animation (idle for enemies)
    this.sprite.play(`${this.type}_attack`);
    
    // Set up physics body
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setMaxVelocity(GAME_CONSTANTS.ENEMY_SPEED, 1000);
    body.setDrag(100, 0);
    
    // Get reference to player
    this.findPlayer();
  }

  private findPlayer(): void {
    const gameScene = this.scene as any;
    if (gameScene.player) {
      this.player = gameScene.player;
    }
  }

  update(): void {
    if (!this.sprite || this.isDead) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // Check if player is in vision range
    if (this.player && this.isPlayerInRange()) {
      this.pursuePlayer();
    } else {
      this.patrol();
    }
    
    // Update attack cooldown
    this.updateAttackCooldown();
    
    // Check if should attack
    if (this.player && this.canAttackPlayer()) {
      this.attack();
    }
  }

  private isPlayerInRange(): boolean {
    if (!this.player) return false;
    
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      this.player.sprite.x, this.player.sprite.y
    );
    
    return distance < GAME_CONSTANTS.ENEMY_VISION_RANGE;
  }

  private pursuePlayer(): void {
    if (!this.player) return;
    
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const playerX = this.player.sprite.x;
    
    // Move towards player
    if (playerX < this.sprite.x) {
      body.setVelocityX(-GAME_CONSTANTS.ENEMY_SPEED);
      this.sprite.setFlipX(true);
      this.direction = -1;
    } else if (playerX > this.sprite.x) {
      body.setVelocityX(GAME_CONSTANTS.ENEMY_SPEED);
      this.sprite.setFlipX(false);
      this.direction = 1;
    }
  }

  private patrol(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // Simple patrol behavior
    const distanceFromStart = this.sprite.x - this.startX;
    
    // Change direction if reached patrol limits
    if (distanceFromStart > this.patrolDistance) {
      this.direction = -1;
    } else if (distanceFromStart < -this.patrolDistance) {
      this.direction = 1;
    }
    
    // Move in patrol direction
    body.setVelocityX(this.direction * GAME_CONSTANTS.ENEMY_SPEED * 0.5);
    this.sprite.setFlipX(this.direction < 0);
  }

  private updateAttackCooldown(): void {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= this.scene.game.loop.delta;
    }
  }

  private canAttackPlayer(): boolean {
    if (!this.player || this.attackCooldown > 0) return false;
    
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      this.player.sprite.x, this.player.sprite.y
    );
    
    return distance < 50; // Attack range
  }

  private attack(): void {
    if (!this.player || this.isAttacking) return;
    
    this.isAttacking = true;
    this.attackCooldown = 1000; // 1 second cooldown
    
    // Play attack animation
    this.sprite.play(`${this.type}_attack`);
    
    // Deal damage to player if still in range
    this.scene.time.delayedCall(300, () => {
      if (this.canAttackPlayer()) {
        this.player.takeDamage(GAME_CONSTANTS.ENEMY_ATTACK_DAMAGE);
      }
      this.isAttacking = false;
    });
  }

  takeDamage(damage: number): void {
    if (this.isDead) return;

    this.health -= damage;
    this.health = Math.max(0, this.health);

    // Visual feedback
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  private die(): void {
    if (this.isDead) return;
    
    this.isDead = true;
    
    // Stop movement
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;
    
    // Play death effect
    this.sprite.setTint(0x666666);
    this.sprite.setAlpha(0.5);
    
    // Remove after delay
    this.scene.time.delayedCall(2000, () => {
      this.destroy();
    });
  }

  destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
} 