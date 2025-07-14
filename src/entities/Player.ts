import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../config/GameConfig';

export class Player {
  public sprite!: Phaser.Physics.Arcade.Sprite;
  public health: number = 100;
  public maxHealth: number = 100;
  public isInvincible: boolean = false;
  public jumpCount: number = 0;
  public maxJumps: number = 2;
  public isGrounded: boolean = false;
  public canAttack: boolean = true;
  
  private scene: Phaser.Scene;
  private character: string;
  private x: number;
  private y: number;
  private invincibilityTimer?: Phaser.Time.TimerEvent;
  private attackCooldownTimer?: Phaser.Time.TimerEvent;
  private lastDirection: number = 1; // 1 for right, -1 for left

  constructor(scene: Phaser.Scene, x: number, y: number, character: string) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.character = character;
  }

  create(): void {
    // Create player sprite
    this.sprite = this.scene.physics.add.sprite(this.x, this.y, `${this.character}_idle`);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.2);
    this.sprite.setSize(28, 30);
    this.sprite.setOffset(2, 2);
    
    // Start with idle animation
    this.sprite.play(`${this.character}_idle`);
    
    // Set up physics body
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setMaxVelocity(GAME_CONSTANTS.PLAYER_SPEED, 1000);
    body.setDrag(GAME_CONSTANTS.PLAYER_ACCELERATION, 0);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasdKeys: any, spaceKey: Phaser.Input.Keyboard.Key): void {
    if (!this.sprite) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.isGrounded = body.touching.down || body.blocked.down;

    // Reset jump count when grounded
    if (this.isGrounded) {
      this.jumpCount = 0;
    }

    // Handle movement
    this.handleMovement(cursors, wasdKeys);
    
    // Handle jumping
    this.handleJumping(cursors, wasdKeys);
    
    // Handle attacking
    this.handleAttacking(spaceKey);
    
    // Update animations
    this.updateAnimations();
  }

  private handleMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasdKeys: any): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // Left movement
    if (cursors.left.isDown || wasdKeys.A.isDown) {
      body.setVelocityX(-GAME_CONSTANTS.PLAYER_SPEED);
      this.sprite.setFlipX(true);
      this.lastDirection = -1;
    }
    // Right movement
    else if (cursors.right.isDown || wasdKeys.D.isDown) {
      body.setVelocityX(GAME_CONSTANTS.PLAYER_SPEED);
      this.sprite.setFlipX(false);
      this.lastDirection = 1;
    }
    // No horizontal input
    else {
      body.setVelocityX(0);
    }
  }

  private handleJumping(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasdKeys: any): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // Jump input
    if ((cursors.up.isDown || wasdKeys.W.isDown) && 
        (Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(wasdKeys.W))) {
      
      if (this.jumpCount < this.maxJumps) {
        // First jump
        if (this.jumpCount === 0) {
          body.setVelocityY(-GAME_CONSTANTS.PLAYER_JUMP_SPEED);
          this.scene.sound.play('jump_sound', { volume: 0.3 });
        }
        // Double jump
        else if (this.jumpCount === 1) {
          body.setVelocityY(-GAME_CONSTANTS.PLAYER_DOUBLE_JUMP_SPEED);
          this.scene.sound.play('jump_sound', { volume: 0.3 });
        }
        
        this.jumpCount++;
      }
    }
  }

  private handleAttacking(spaceKey: Phaser.Input.Keyboard.Key): void {
    if (Phaser.Input.Keyboard.JustDown(spaceKey) && this.canAttack) {
      this.attack();
    }
  }

  private attack(): void {
    if (!this.canAttack) return;

    this.canAttack = false;
    
    // Play attack animation
    this.sprite.play(`${this.character}_hit`);
    
    // Create attack hitbox
    const attackX = this.sprite.x + (this.lastDirection * GAME_CONSTANTS.PLAYER_ATTACK_RANGE);
    const attackY = this.sprite.y;
    
    // Check for enemies in attack range
    this.checkAttackHit(attackX, attackY);
    
    // Attack cooldown
    this.attackCooldownTimer = this.scene.time.delayedCall(300, () => {
      this.canAttack = true;
    });
  }

  private checkAttackHit(attackX: number, attackY: number): void {
    // This will be implemented when enemy system is integrated
    const gameScene = this.scene as any;
    if (gameScene.enemies) {
      gameScene.enemies.children.entries.forEach((enemy: any) => {
        const distance = Phaser.Math.Distance.Between(attackX, attackY, enemy.x, enemy.y);
        if (distance < GAME_CONSTANTS.PLAYER_ATTACK_RANGE) {
          // Deal damage to enemy
          if (enemy.getData('enemy')) {
            enemy.getData('enemy').takeDamage(GAME_CONSTANTS.PLAYER_ATTACK_DAMAGE);
          }
        }
      });
    }
  }

  private updateAnimations(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // Don't change animation if attacking
    if (this.sprite.anims.currentAnim?.key.includes('hit') && this.sprite.anims.isPlaying) {
      return;
    }
    
    // Animation priority: Jump > Fall > Run > Idle
    if (body.velocity.y < -50) {
      // Jumping up
      if (this.jumpCount > 1) {
        this.sprite.play(`${this.character}_double_jump`, true);
      } else {
        this.sprite.play(`${this.character}_jump`, true);
      }
    } else if (body.velocity.y > 50) {
      // Falling
      this.sprite.play(`${this.character}_fall`, true);
    } else if (Math.abs(body.velocity.x) > 10) {
      // Running
      this.sprite.play(`${this.character}_run`, true);
    } else {
      // Idle
      this.sprite.play(`${this.character}_idle`, true);
    }
  }

  takeDamage(damage: number): void {
    if (this.isInvincible) return;

    this.health -= damage;
    this.health = Math.max(0, this.health);

    // Emit health changed event
    this.scene.events.emit('playerHealthChanged', this.health, this.maxHealth);

    if (this.health <= 0) {
      this.die();
      return;
    }

    // Make player invincible temporarily
    this.isInvincible = true;
    
    // Visual feedback
    this.sprite.setTint(0xff0000);
    this.sprite.setAlpha(0.5);
    
    // Remove invincibility after timer
    this.invincibilityTimer = this.scene.time.delayedCall(GAME_CONSTANTS.PLAYER_INVINCIBILITY_TIME, () => {
      this.isInvincible = false;
      this.sprite.clearTint();
      this.sprite.setAlpha(1);
    });
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.scene.events.emit('playerHealthChanged', this.health, this.maxHealth);
  }

  private die(): void {
    // Play death animation
    this.sprite.play(`${this.character}_hit`);
    
    // Disable player control
    this.sprite.setVelocity(0, 0);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    
    // Respawn after delay
    this.scene.time.delayedCall(2000, () => {
      this.respawn();
    });
  }

  private respawn(): void {
    this.health = this.maxHealth;
    this.sprite.setPosition(100, GAME_CONSTANTS.WORLD_HEIGHT - 200);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    this.sprite.clearTint();
    this.sprite.setAlpha(1);
    this.isInvincible = false;
    this.scene.events.emit('playerHealthChanged', this.health, this.maxHealth);
  }

  destroy(): void {
    if (this.invincibilityTimer) {
      this.invincibilityTimer.destroy();
    }
    if (this.attackCooldownTimer) {
      this.attackCooldownTimer.destroy();
    }
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
} 