import Phaser from 'phaser';
import { GAME_CONSTANTS, COLORS } from '../config/GameConfig';

export class Trap {
  public sprite!: Phaser.Physics.Arcade.Sprite;
  public type: string;
  public subtype?: string;
  public id: string;
  public isActive: boolean = true;
  public isDangerous: boolean = true;
  
  private scene: Phaser.Scene;
  private originalX: number;
  private originalY: number;
  
  // Animation and behavior properties
  private cycleTimer: number = 0;
  private cycle: number = 0;
  private movementDirection: number = 1;
  private movementRange: number = 0;
  private isMoving: boolean = false;
  private currentAnimation: string = 'idle';
  
  // Falling platform specific
  private isFalling: boolean = false;
  private fallTimer: number = 0;
  private respawnTimer: number = 0;
  private hasBeenTriggered: boolean = false;
  
  // Trampoline specific
  private bounceAnimation: boolean = false;
  private bounceTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: string, config: any = {}) {
    this.scene = scene;
    this.originalX = x;
    this.originalY = y;
    this.type = type;
    this.subtype = config.subtype;
    this.id = `trap_${type}_${x}_${y}`;
    this.cycle = config.cycle || GAME_CONSTANTS.FIRE_CYCLE_TIME;
    this.movementRange = config.range || 100;
    
    this.create(x, y, config);
  }

  private create(x: number, y: number, config: any): void {
    // Create sprite based on trap type
    this.sprite = this.scene.physics.add.sprite(x, y, this.getTrapTexture());
    
    // Configure physics and properties based on trap type
    this.setupTrapProperties(config);
    
    // Create visual representation
    this.updateTrapGraphics();
    
    // Set up collision body
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    
    this.setupTrapBehavior(config);
  }

  private getTrapTexture(): string {
    switch (this.type) {
      case 'spike':
        return 'spike_idle';
      case 'fire':
        return 'fire_off';
      case 'saw':
        return 'saw_on';
      case 'trampoline':
        return 'trampoline_idle';
      case 'falling_platform':
        return 'falling_platform_on';
      default:
        return 'trap_generic';
    }
  }

  private setupTrapProperties(config: any): void {
    switch (this.type) {
      case 'spike':
        this.sprite.setSize(32, 16);
        this.sprite.setOffset(0, 16);
        this.isDangerous = true;
        break;
        
      case 'fire':
        this.sprite.setSize(16, 32);
        this.isDangerous = false; // Starts as off
        break;
        
      case 'saw':
        this.sprite.setSize(38, 38);
        this.isDangerous = true;
        this.isMoving = true;
        break;
        
      case 'trampoline':
        this.sprite.setSize(28, 28);
        this.isDangerous = false; // Helpful, not harmful
        break;
        
      case 'falling_platform':
        this.sprite.setSize(32, 10);
        this.isDangerous = false; // Platform, not trap
        break;
    }
  }

  private updateTrapGraphics(): void {
    // Create visual representation for each trap type
    const graphics = this.scene.add.graphics();
    
    switch (this.type) {
      case 'spike':
        this.createSpikeGraphics(graphics);
        break;
      case 'fire':
        this.createFireGraphics(graphics);
        break;
      case 'saw':
        this.createSawGraphics(graphics);
        break;
      case 'trampoline':
        this.createTrampolineGraphics(graphics);
        break;
      case 'falling_platform':
        this.createFallingPlatformGraphics(graphics);
        break;
    }
    
    graphics.destroy();
  }

  private createSpikeGraphics(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0x808080); // Gray color for spikes
    
    // Draw spike shape
    graphics.beginPath();
    graphics.moveTo(this.sprite.x - 16, this.sprite.y + 8);
    graphics.lineTo(this.sprite.x, this.sprite.y - 8);
    graphics.lineTo(this.sprite.x + 16, this.sprite.y + 8);
    graphics.closePath();
    graphics.fillPath();
    
    // Add some texture
    graphics.lineStyle(1, 0x000000, 0.3);
    graphics.strokePath();
  }

  private createFireGraphics(graphics: Phaser.GameObjects.Graphics): void {
    const color = this.isDangerous ? 0xFF4500 : 0x666666; // Fire red or gray
    graphics.fillStyle(color);
    
    if (this.isDangerous) {
      // Draw flames
      graphics.fillRect(this.sprite.x - 8, this.sprite.y - 16, 16, 32);
      graphics.fillStyle(0xFF6600);
      graphics.fillRect(this.sprite.x - 6, this.sprite.y - 12, 12, 24);
      graphics.fillStyle(0xFFFF00);
      graphics.fillRect(this.sprite.x - 4, this.sprite.y - 8, 8, 16);
    } else {
      // Draw base/off state
      graphics.fillRect(this.sprite.x - 8, this.sprite.y + 8, 16, 8);
    }
  }

  private createSawGraphics(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0xC0C0C0); // Silver color for saw
    graphics.fillCircle(this.sprite.x, this.sprite.y, 19);
    
    // Add saw teeth
    graphics.fillStyle(0x888888);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const x = this.sprite.x + Math.cos(angle) * 19;
      const y = this.sprite.y + Math.sin(angle) * 19;
      graphics.fillTriangle(
        x, y,
        x + Math.cos(angle) * 5, y + Math.sin(angle) * 5,
        x + Math.cos(angle + 0.3) * 5, y + Math.sin(angle + 0.3) * 5
      );
    }
    
    // Center
    graphics.fillStyle(0x000000);
    graphics.fillCircle(this.sprite.x, this.sprite.y, 5);
  }

  private createTrampolineGraphics(graphics: Phaser.GameObjects.Graphics): void {
    const bounceOffset = this.bounceAnimation ? 3 : 0;
    graphics.fillStyle(0x4169E1); // Blue color for trampoline
    
    // Trampoline base
    graphics.fillRect(this.sprite.x - 14, this.sprite.y + 10 + bounceOffset, 28, 8);
    
    // Springs
    graphics.fillStyle(0x888888);
    graphics.fillRect(this.sprite.x - 10, this.sprite.y + bounceOffset, 4, 10);
    graphics.fillRect(this.sprite.x - 2, this.sprite.y + bounceOffset, 4, 10);
    graphics.fillRect(this.sprite.x + 6, this.sprite.y + bounceOffset, 4, 10);
    
    // Bounce surface
    graphics.fillStyle(0xFF0000);
    graphics.fillRect(this.sprite.x - 14, this.sprite.y + 6 + bounceOffset, 28, 4);
  }

  private createFallingPlatformGraphics(graphics: Phaser.GameObjects.Graphics): void {
    const shakeOffset = this.hasBeenTriggered && !this.isFalling ? Math.random() * 2 - 1 : 0;
    const alpha = this.isFalling ? 0.5 : 1;
    
    graphics.fillStyle(0x8B4513, alpha);
    graphics.fillRect(this.sprite.x - 16 + shakeOffset, this.sprite.y - 5, 32, 10);
    
    // Add cracks if triggered
    if (this.hasBeenTriggered && !this.isFalling) {
      graphics.lineStyle(1, 0x000000, 0.5);
      graphics.lineBetween(
        this.sprite.x - 10 + shakeOffset, this.sprite.y - 5,
        this.sprite.x - 8 + shakeOffset, this.sprite.y + 5
      );
      graphics.lineBetween(
        this.sprite.x + 5 + shakeOffset, this.sprite.y - 5,
        this.sprite.x + 7 + shakeOffset, this.sprite.y + 5
      );
    }
  }

  private setupTrapBehavior(config: any): void {
    switch (this.type) {
      case 'fire':
        // Set up fire cycle timer
        this.cycleTimer = Math.random() * this.cycle; // Random start
        break;
        
      case 'saw':
        // Set up saw movement
        this.setupSawMovement(config.movement);
        break;
        
      case 'falling_platform':
        // Platform starts stable
        this.isFalling = false;
        this.fallTimer = 0;
        break;
    }
  }

  private setupSawMovement(movement: string): void {
    if (movement === 'vertical') {
      this.scene.tweens.add({
        targets: this.sprite,
        y: this.originalY + this.movementRange,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    } else if (movement === 'horizontal') {
      this.scene.tweens.add({
        targets: this.sprite,
        x: this.originalX + this.movementRange,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }
    
    // Add spinning animation
    this.scene.tweens.add({
      targets: this.sprite,
      angle: 360,
      duration: 1000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  public update(): void {
    switch (this.type) {
      case 'fire':
        this.updateFire();
        break;
        
      case 'trampoline':
        this.updateTrampoline();
        break;
        
      case 'falling_platform':
        this.updateFallingPlatform();
        break;
    }
  }

  private updateFire(): void {
    this.cycleTimer += 16; // 60fps
    
    const wasActive = this.isDangerous;
    this.isDangerous = (this.cycleTimer % this.cycle) < (this.cycle / 2);
    
    // Update graphics if state changed
    if (wasActive !== this.isDangerous) {
      this.updateTrapGraphics();
      
      // Update sprite texture
      try {
        this.sprite.setTexture(this.isDangerous ? 'fire_on' : 'fire_off');
      } catch (error) {
        // Fallback to graphics if texture not found
      }
    }
  }

  private updateTrampoline(): void {
    if (this.bounceTimer > 0) {
      this.bounceTimer -= 16;
      if (this.bounceTimer <= 0) {
        this.bounceAnimation = false;
        this.updateTrapGraphics();
      }
    }
  }

  private updateFallingPlatform(): void {
    if (this.hasBeenTriggered && !this.isFalling) {
      this.fallTimer += 16;
      
      if (this.fallTimer >= GAME_CONSTANTS.FALLING_PLATFORM_DELAY) {
        this.startFalling();
      }
    }
    
    if (this.isFalling) {
      this.respawnTimer += 16;
      
      if (this.respawnTimer >= GAME_CONSTANTS.FALLING_PLATFORM_RESPAWN) {
        this.respawnPlatform();
      }
    }
  }

  public triggerTrap(player?: any): boolean {
    switch (this.type) {
      case 'spike':
        return this.triggerSpike(player);
        
      case 'fire':
        return this.triggerFire(player);
        
      case 'saw':
        return this.triggerSaw(player);
        
      case 'trampoline':
        return this.triggerTrampoline(player);
        
      case 'falling_platform':
        return this.triggerFallingPlatform(player);
        
      default:
        return false;
    }
  }

  private triggerSpike(player: any): boolean {
    if (this.isDangerous && player) {
      player.takeDamage();
      this.createDamageEffect();
      return true;
    }
    return false;
  }

  private triggerFire(player: any): boolean {
    if (this.isDangerous && player) {
      player.takeDamage();
      this.createFireEffect();
      return true;
    }
    return false;
  }

  private triggerSaw(player: any): boolean {
    if (this.isDangerous && player) {
      player.takeDamage();
      this.createSawEffect();
      return true;
    }
    return false;
  }

  private triggerTrampoline(player: any): boolean {
    if (player) {
      // Give player extra jump boost
      player.sprite.setVelocityY(-GAME_CONSTANTS.PLAYER_TRAMPOLINE_BOOST);
      player.jumpCount = 0; // Reset jump count for double jump
      
      this.bounceAnimation = true;
      this.bounceTimer = 300;
      this.updateTrapGraphics();
      
      this.createBounceEffect();
      
      // Send network event
      if (player.isLocal) {
        this.scene.events.emit('trampoline_bounced', {
          playerId: player.id,
          trapId: this.id,
          x: this.sprite.x,
          y: this.sprite.y
        });
      }
      
      return true;
    }
    return false;
  }

  private triggerFallingPlatform(player: any): boolean {
    if (!this.hasBeenTriggered && !this.isFalling && player) {
      this.hasBeenTriggered = true;
      this.fallTimer = 0;
      this.updateTrapGraphics();
      return true;
    }
    return false;
  }

  private startFalling(): void {
    this.isFalling = true;
    this.isDangerous = false; // No longer solid
    this.respawnTimer = 0;
    
    // Disable collision
    if (this.sprite.body) {
      this.sprite.body.enable = false;
    }
    
    // Add falling animation
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y + 200,
      alpha: 0,
      duration: 1000,
      ease: 'Power2'
    });
    
    this.updateTrapGraphics();
  }

  private respawnPlatform(): void {
    this.isFalling = false;
    this.hasBeenTriggered = false;
    this.isDangerous = false; // Reset to platform
    this.fallTimer = 0;
    this.respawnTimer = 0;
    
    // Reset position and enable collision
    this.sprite.setPosition(this.originalX, this.originalY);
    this.sprite.setAlpha(1);
    
    if (this.sprite.body) {
      this.sprite.body.enable = true;
    }
    
    this.updateTrapGraphics();
  }

  private createDamageEffect(): void {
    const effect = this.scene.add.graphics();
    effect.fillStyle(0xFF0000, 0.7);
    effect.fillCircle(this.sprite.x, this.sprite.y, 30);
    
    this.scene.tweens.add({
      targets: effect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => effect.destroy()
    });
  }

  private createFireEffect(): void {
    const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle', {
      speed: { min: 20, max: 60 },
      scale: { start: 0.4, end: 0 },
      lifespan: 400,
      quantity: 5,
      tint: [0xFF4500, 0xFF6600, 0xFFFF00]
    });
    
    this.scene.time.delayedCall(400, () => particles.destroy());
  }

  private createSawEffect(): void {
    const sparks = this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle', {
      speed: { min: 40, max: 100 },
      scale: { start: 0.3, end: 0 },
      lifespan: 500,
      quantity: 8,
      tint: [0xFFFFFF, 0xFFFF00, 0xFFA500]
    });
    
    this.scene.time.delayedCall(500, () => sparks.destroy());
  }

  private createBounceEffect(): void {
    const bounceRings = this.scene.add.graphics();
    bounceRings.lineStyle(3, 0x4169E1, 0.8); // Blue color for bounce effect
    bounceRings.strokeCircle(this.sprite.x, this.sprite.y, 20);
    
    this.scene.tweens.add({
      targets: bounceRings,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 400,
      onComplete: () => bounceRings.destroy()
    });
  }

  public getDamageAmount(): number {
    switch (this.type) {
      case 'spike':
        return GAME_CONSTANTS.SPIKE_DAMAGE;
      case 'fire':
        return GAME_CONSTANTS.FIRE_DAMAGE;
      case 'saw':
        return GAME_CONSTANTS.SAW_DAMAGE;
      default:
        return 0;
    }
  }

  public destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
} 