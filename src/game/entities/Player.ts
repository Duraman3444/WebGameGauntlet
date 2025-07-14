import Phaser from 'phaser';
import { GAME_CONSTANTS, COLORS } from '../config/GameConfig';

export class Player {
  public sprite!: Phaser.Physics.Arcade.Sprite;
  public id: string;
  public health: number = 100;
  public score: number = 0;
  public lives: number = 3;
  public fruitsCollected: number = 0;
  public isLocal: boolean;
  public character: string;
  public isInvincible: boolean = false;
  public canJump: boolean = true;
  public jumpCount: number = 0;
  public maxJumps: number = 2; // Allow double jump
  public canWallJump: boolean = false;
  public wallJumpCooldown: number = 0;
  public isWallSliding: boolean = false;
  public wallSide: 'left' | 'right' | null = null;
  
  private scene: Phaser.Scene;
  private nameText!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private lastAction: number = 0;
  private invincibilityTimer: number = 0;
  private facingRight: boolean = true;
  private isGrounded: boolean = false;
  private jumpPressed: boolean = false;
  private wallJumpTimer: number = 0;
  private wallJumpDirection: number = 0;
  
  // Animation states
  private currentAnimation: string = 'idle';
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private animationSpeed: number = 100; // ms per frame
  
  // Character theme colors
  private characterColors: { [key: string]: number } = {
    'pinkman': 0xFF69B4,
    'maskdude': 0x8A2BE2,
    'ninjafrog': 0x00FF00,
    'virtualguy': 0x00BFFF,
    'kinghuman': 0xFFD700,
    'robot': 0xC0C0C0,
    'adventurehero': 0x8B4513
  };

  private static animationsCreated = false;

  /**
   * Generate Phaser animations for all characters once. This must be called after the
   * spritesheets are loaded but before any player attempts to play an animation.
   */
  public static createAnimations(scene: Phaser.Scene): void {
    console.log('🎭 Player.createAnimations() called');
    if (Player.animationsCreated) return;
    console.log('🎭 Creating animations for all characters...');

    const characters = ['pinkman', 'maskdude', 'ninjafrog', 'virtualguy', 'kinghuman', 'robot', 'adventurehero'];
    const animations = ['idle', 'run', 'jump', 'fall', 'double_jump', 'wall_jump', 'hit'];

    characters.forEach(character => {
      console.log(`🎭 Processing character: ${character}`);
      animations.forEach(animation => {
        const sheetKey = `${character}_${animation}`;
        // Skip if the animation already exists (important when switching scenes)
        if (scene.anims.exists(sheetKey)) {
          console.log(`  ⏭️  Animation ${sheetKey} already exists, skipping`);
          return;
        }

        const texture = scene.textures.get(sheetKey);
        if (!texture) {
          console.warn(`  ❌ Texture ${sheetKey} not found, skipping animation creation`);
          return; // Spritesheet failed to load – placeholders will handle
        }

        // Check if this is a spritesheet (multiple frames) or single image
        const totalFrames = texture.frameTotal - 1;
        
        if (totalFrames <= 0) {
          // Single-frame textures will be swapped manually (no animation needed)
          console.log(`  ⏭️  Skipping animation creation for single-frame texture ${sheetKey}`);
          return;
        } else {
          // Multi-frame spritesheet - create normal animation
          console.log(`  ✅ Creating animation ${sheetKey} with ${totalFrames + 1} frames`);
          scene.anims.create({
            key: sheetKey,
            frames: scene.anims.generateFrameNumbers(sheetKey, { start: 0, end: totalFrames }),
            frameRate: animation === 'run' ? 12 : 8,
            repeat: ['idle', 'run', 'fall'].includes(animation) ? -1 : 0
          });
        }
      });
    });

    Player.animationsCreated = true;
    console.log('🎭 Animation creation complete!');
  }

  constructor(scene: Phaser.Scene, x: number, y: number, id: string, playerIndex: number = 0) {
    this.scene = scene;
    this.id = id;
    this.isLocal = id === 'local';
    this.character = GAME_CONSTANTS.PLAYER_CHARACTER_ASSIGNMENTS[playerIndex] || 'pinkman';
    
    console.log(`👤 Creating player: ${this.character} (${this.id}) at (${x}, ${y})`);
    this.create(x, y);

    // Ensure the required animations exist (runs once thanks to static guard)
    Player.createAnimations(this.scene);
    if (this.isLocal) {
      this.setupInput();
    }
  }

  private create(x: number, y: number): void {
    // Create player sprite with character-specific assets
    const initialTexture = this.character + '_idle';
    console.log(`👤 Creating sprite with texture: ${initialTexture}`);
    
    // Check if texture exists before creating sprite
    if (!this.scene.textures.exists(initialTexture)) {
      console.warn(`❌ Texture ${initialTexture} not found, creating placeholder`);
      this.createCharacterPlaceholder(initialTexture);
    }
    
    this.sprite = this.scene.physics.add.sprite(x, y, initialTexture);
    
    // Create player visual representation
    this.updatePlayerGraphics();
    
    // Set up physics properties
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(GAME_CONSTANTS.PLAYER_BOUNCE);
    this.sprite.setDrag(GAME_CONSTANTS.PLAYER_DRAG, 0);
    this.sprite.setMaxVelocity(GAME_CONSTANTS.PLAYER_SPEED, 600);
    
    // Set up character-specific physics
    this.sprite.setSize(24, 30); // Adjust hitbox for 32x32 sprites
    this.sprite.setOffset(4, 2); // Center the hitbox
    
    // Create name text
    this.nameText = this.scene.add.text(x, y - 40, this.character, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    this.nameText.setOrigin(0.5);
    
    // Set up physics body
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    
    this.setupCollisions();
  }

  private createCharacterPlaceholder(key: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    
    // Use character-specific color
    const characterColor = this.characterColors[this.character] || 0xFF69B4;
    
    // Convert hex to RGB
    const r = (characterColor >> 16) & 0xFF;
    const g = (characterColor >> 8) & 0xFF;
    const b = characterColor & 0xFF;
    
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, 6, 3, 3); // Left eye
    ctx.fillRect(21, 6, 3, 3); // Right eye
    ctx.fillRect(12, 20, 8, 2); // Smile
    
    const texture = this.scene.textures.createCanvas(key, 32, 32);
    if (texture) {
      const context = texture.getContext();
      context.drawImage(canvas, 0, 0);
      texture.refresh();
    }
  }

  private updatePlayerGraphics(): void {
    // Get the current texture key
    const textureKey = this.sprite.texture.key;
    
    // Ensure the sprite displays at correct size without color tinting
    this.sprite.clearTint();
    this.sprite.setDisplaySize(GAME_CONSTANTS.PLAYER_SIZE, GAME_CONSTANTS.PLAYER_SIZE);
    
    // If using a placeholder texture, improve it
    if (textureKey.includes('placeholder') || !this.scene.textures.exists(textureKey)) {
      this.createBetterCharacterPlaceholder();
    }
    
    console.log(`👤 Updated graphics for ${this.character}, texture: ${textureKey}`);
  }

  private createBetterCharacterPlaceholder(): void {
    const graphics = this.scene.add.graphics();
    const size = GAME_CONSTANTS.PLAYER_SIZE;
    
    // Choose color based on character type
    let baseColor: number;
    let highlightColor: number;
    let shadowColor: number;
    
    switch (this.character) {
      case 'pinkman':
        baseColor = 0xFF69B4;    // Pink
        highlightColor = 0xFFB6C1; // Light pink
        shadowColor = 0xC71585;   // Medium violet red
        break;
      case 'maskdude':
        baseColor = 0x4169E1;    // Royal blue
        highlightColor = 0x87CEEB; // Sky blue
        shadowColor = 0x191970;   // Midnight blue
        break;
      case 'ninjafrog':
        baseColor = 0x32CD32;    // Lime green
        highlightColor = 0x98FB98; // Pale green
        shadowColor = 0x228B22;   // Forest green
        break;
      case 'virtualguy':
        baseColor = 0xFF4500;    // Orange red
        highlightColor = 0xFFA500; // Orange
        shadowColor = 0xB22222;   // Fire brick
        break;
      case 'adventurehero':
        baseColor = 0x8B4513;    // Saddle brown
        highlightColor = 0xD2691E; // Chocolate
        shadowColor = 0x654321;   // Dark brown
        break;
      case 'robot':
        baseColor = 0x708090;    // Slate gray
        highlightColor = 0xC0C0C0; // Silver
        shadowColor = 0x2F4F4F;   // Dark slate gray
        break;
      case 'kinghuman':
        baseColor = 0xFFD700;    // Gold
        highlightColor = 0xFFFF00; // Yellow
        shadowColor = 0xB8860B;   // Dark goldenrod
        break;
      default:
        baseColor = 0xFF69B4;    // Default pink
        highlightColor = 0xFFB6C1;
        shadowColor = 0xC71585;
    }
    
    // Create character body with rounded corners
    graphics.fillStyle(baseColor);
    graphics.fillRoundedRect(4, 8, size - 8, size - 12, 4);
    
    // Add highlight on top for 3D effect
    graphics.fillStyle(highlightColor);
    graphics.fillRoundedRect(4, 8, size - 8, 4, 2);
    
    // Add shadow on bottom for 3D effect
    graphics.fillStyle(shadowColor);
    graphics.fillRoundedRect(4, size - 8, size - 8, 4, 2);
    
    // Add simple face
    graphics.fillStyle(0x000000);
    graphics.fillCircle(size * 0.35, size * 0.4, 2);  // Left eye
    graphics.fillCircle(size * 0.65, size * 0.4, 2);  // Right eye
    graphics.fillRoundedRect(size * 0.4, size * 0.55, size * 0.2, 2, 1); // Mouth
    
    // Add character-specific details
    if (this.character === 'robot') {
      // Add antenna
      graphics.fillStyle(shadowColor);
      graphics.fillRect(size * 0.48, 4, 2, 6);
      graphics.fillCircle(size * 0.5, 4, 2);
    } else if (this.character === 'kinghuman') {
      // Add crown
      graphics.fillStyle(0xFFD700);
      graphics.fillTriangle(size * 0.3, 8, size * 0.5, 2, size * 0.7, 8);
    }
    
    // Generate texture
    const placeholderKey = `${this.character}_better_placeholder`;
    graphics.generateTexture(placeholderKey, size, size);
    graphics.destroy();
    
    this.sprite.setTexture(placeholderKey);
    this.sprite.setDisplaySize(size, size);
    
    console.log(`👤 Created better placeholder for ${this.character}`);
  }

  private setupInput(): void {
    this.cursors = this.scene.input.keyboard?.createCursorKeys()!;
    this.wasdKeys = this.scene.input.keyboard?.addKeys('W,S,A,D,SPACE')!;
  }

  private setupCollisions(): void {
    // This will be handled by the GameScene
  }

  public update(): void {
    if (!this.sprite || !this.sprite.body) return;
    
    // Update timers
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= 16; // Assuming 60fps
      if (this.invincibilityTimer <= 0) {
        this.isInvincible = false;
      }
    }
    
    if (this.wallJumpCooldown > 0) {
      this.wallJumpCooldown -= 16;
    }
    
    if (this.wallJumpTimer > 0) {
      this.wallJumpTimer -= 16;
    }
    
    this.checkGrounded();
    this.checkWallContact();
    
    if (this.isLocal) {
      this.handleInput();
    }
    
    this.updateAnimation();
    this.updateNameText();
  }

  private handleInput(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // Handle wall jump direction override
    if (this.wallJumpTimer > 0) {
      this.sprite.setVelocityX(this.wallJumpDirection * GAME_CONSTANTS.PLAYER_WALL_JUMP_SPEED);
    } else {
      // Normal horizontal movement
      if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
        this.sprite.setVelocityX(-GAME_CONSTANTS.PLAYER_SPEED);
        this.facingRight = false;
      } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
        this.sprite.setVelocityX(GAME_CONSTANTS.PLAYER_SPEED);
        this.facingRight = true;
      } else {
        this.sprite.setVelocityX(0);
      }
    }
    
    // Handle wall sliding
    if (this.isWallSliding) {
      if (body.velocity.y > GAME_CONSTANTS.PLAYER_WALL_SLIDE_SPEED) {
        this.sprite.setVelocityY(GAME_CONSTANTS.PLAYER_WALL_SLIDE_SPEED);
        this.sprite.setDrag(GAME_CONSTANTS.PLAYER_WALL_DRAG, 0);
      }
    } else {
      this.sprite.setDrag(GAME_CONSTANTS.PLAYER_DRAG, 0);
    }
    
    // Jumping and wall jumping
    const jumpKey = this.cursors.up.isDown || this.wasdKeys.W.isDown || this.wasdKeys.SPACE.isDown;
    
    if (jumpKey && !this.jumpPressed) {
      if (this.canWallJump && this.wallJumpCooldown <= 0) {
        this.wallJump();
      } else {
        this.jump();
      }
      this.jumpPressed = true;
    } else if (!jumpKey) {
      this.jumpPressed = false;
    }
  }

  private jump(): void {
    if (this.jumpCount < this.maxJumps) {
      const jumpSpeed = this.jumpCount === 0 ? 
        GAME_CONSTANTS.PLAYER_JUMP_SPEED : 
        GAME_CONSTANTS.PLAYER_DOUBLE_JUMP_SPEED;
      
      this.sprite.setVelocityY(-jumpSpeed);
      this.jumpCount++;
      this.isGrounded = false;
      
      // Set animation based on jump count
      this.currentAnimation = this.jumpCount === 1 ? 'jump' : 'double_jump';
      
      // Send jump event to multiplayer
      if (this.isLocal) {
        const event = this.jumpCount === 1 ? 'player_jump' : 'player_double_jump';
        this.scene.events.emit(event, {
          playerId: this.id,
          x: this.sprite.x,
          y: this.sprite.y
        });
      }
    }
  }

  private wallJump(): void {
    if (!this.wallSide) return;
    
    // Jump away from wall
    const jumpDirection = this.wallSide === 'left' ? 1 : -1;
    this.sprite.setVelocityY(-GAME_CONSTANTS.PLAYER_WALL_JUMP_SPEED);
    this.wallJumpDirection = jumpDirection;
    this.wallJumpTimer = 300; // 300ms of forced horizontal movement
    
    // Reset jump count and wall state
    this.jumpCount = 1; // Wall jump counts as first jump
    this.isWallSliding = false;
    this.canWallJump = false;
    this.wallJumpCooldown = 500; // 500ms cooldown
    this.wallSide = null;
    
    this.currentAnimation = 'wall_jump';
    
    // Send wall jump event
    if (this.isLocal) {
      this.scene.events.emit('player_wall_jump', {
        playerId: this.id,
        x: this.sprite.x,
        y: this.sprite.y,
        direction: jumpDirection
      });
    }
  }

  private checkGrounded(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const wasGrounded = this.isGrounded;
    
    this.isGrounded = body.touching.down || body.blocked.down;
    
    if (!wasGrounded && this.isGrounded) {
      this.jumpCount = 0;
      this.wallJumpTimer = 0;
    }
  }

  private checkWallContact(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // Check for wall contact
    const touchingLeft = body.touching.left || body.blocked.left;
    const touchingRight = body.touching.right || body.blocked.right;
    
    // Only consider wall sliding if not grounded and moving down
    if (!this.isGrounded && body.velocity.y > 0) {
      if (touchingLeft && (this.cursors.left.isDown || this.wasdKeys.A.isDown)) {
        this.isWallSliding = true;
        this.canWallJump = true;
        this.wallSide = 'left';
        this.currentAnimation = 'wall_jump';
      } else if (touchingRight && (this.cursors.right.isDown || this.wasdKeys.D.isDown)) {
        this.isWallSliding = true;
        this.canWallJump = true;
        this.wallSide = 'right';
        this.currentAnimation = 'wall_jump';
      } else {
        this.isWallSliding = false;
        this.canWallJump = false;
        this.wallSide = null;
      }
    } else {
      this.isWallSliding = false;
      this.canWallJump = false;
      this.wallSide = null;
    }
  }

  private updateAnimation(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // Determine animation based on state
    if (this.isWallSliding) {
      this.currentAnimation = 'wall_jump';
    } else if (!this.isGrounded) {
      if (body.velocity.y < 0) {
        this.currentAnimation = this.jumpCount > 1 ? 'double_jump' : 'jump';
      } else {
        this.currentAnimation = 'fall';
      }
    } else if (Math.abs(body.velocity.x) > 10) {
      this.currentAnimation = 'run';
    } else {
      this.currentAnimation = 'idle';
    }
    
    // Update sprite texture based on animation
    const desiredKey = `${this.character}_${this.currentAnimation}`;
    if (this.sprite.anims.currentAnim?.key !== desiredKey) {
      // If the animation is missing (e.g. real spritesheet failed to load) fall back to texture swapping
      if (this.scene.anims.exists(desiredKey)) {
        console.log(`🎭 Playing animation: ${desiredKey}`);
        this.sprite.anims.play(desiredKey, true);
      } else {
        console.warn(`❌ Animation ${desiredKey} not found, falling back to texture swap`);
        try {
          this.sprite.setTexture(desiredKey);
          console.log(`🖼️  Set texture to: ${desiredKey}`);
        } catch (e) {
          console.error(`❌ Failed to set texture ${desiredKey}, using idle:`, e);
          this.sprite.setTexture(`${this.character}_idle`);
        }
      }
    }
    
    // Handle sprite flipping
    if (body.velocity.x > 0) {
      this.sprite.setFlipX(false);
      this.facingRight = true;
    } else if (body.velocity.x < 0) {
      this.sprite.setFlipX(true);
      this.facingRight = false;
    }
    
    // Add invincibility flashing
    if (this.isInvincible) {
      this.sprite.setAlpha(Math.sin(Date.now() * 0.01) * 0.3 + 0.7);
    } else {
      this.sprite.setAlpha(1);
    }
  }

  private updateNameText(): void {
    if (this.nameText) {
      this.nameText.setPosition(this.sprite.x, this.sprite.y - 40);
    }
  }

  public collectFruit(type: string): void {
    this.fruitsCollected++;
    this.score += GAME_CONSTANTS.FRUIT_VALUE;
    
    // Create collection effect
    this.createCollectionEffect(type);
    
    // Send network event
    if (this.isLocal) {
      this.scene.events.emit('fruit_collected', {
        playerId: this.id,
        fruitType: type,
        score: this.score
      });
    }
  }

  public hitBox(): void {
    // Simple box breaking mechanic
    this.score += 50;
    this.createActionEffect();
  }

  private createCollectionEffect(type: string): void {
    // Create a simple particle effect for fruit collection
    const particles = this.scene.add.particles(this.sprite.x, this.sprite.y - 20, 'particle', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.3, end: 0 },
      lifespan: 500,
      quantity: 3,
      tint: 0xFFD700 // Gold color for fruit collection
    });
    
    // Clean up particles after animation
    this.scene.time.delayedCall(500, () => {
      particles.destroy();
    });
  }

  private createActionEffect(): void {
    // Create a simple effect for actions
    const effect = this.scene.add.graphics();
    effect.fillStyle(0xFFFFFF, 0.8);
    effect.fillCircle(this.sprite.x, this.sprite.y, 20);
    
    // Animate the effect
    this.scene.tweens.add({
      targets: effect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        effect.destroy();
      }
    });
  }

  public takeDamage(): void {
    if (this.isInvincible) return;
    
    this.health -= 25;
    this.isInvincible = true;
    this.invincibilityTimer = 2000; // 2 seconds
    
    // Knockback effect
    const knockbackDirection = this.facingRight ? -1 : 1;
    this.sprite.setVelocityX(knockbackDirection * 200);
    this.sprite.setVelocityY(-100);
    
    if (this.health <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.lives--;
    this.health = 100;
    
    if (this.lives <= 0) {
      // Game over logic
      this.scene.events.emit('player_game_over', { playerId: this.id });
    } else {
      // Respawn
      this.respawn();
    }
  }

  private respawn(): void {
    // Reset position to spawn point
    this.sprite.setPosition(100, 400);
    this.sprite.setVelocity(0, 0);
    
    // Reset states
    this.isInvincible = true;
    this.invincibilityTimer = 3000; // 3 seconds of invincibility after respawn
    this.jumpCount = 0;
    this.isWallSliding = false;
    this.canWallJump = false;
    this.wallSide = null;
    
    this.scene.events.emit('player_respawn', { playerId: this.id });
  }

  public getNetworkData(): any {
    return {
      id: this.id,
      x: this.sprite.x,
      y: this.sprite.y,
      velocityX: this.sprite.body?.velocity.x || 0,
      velocityY: this.sprite.body?.velocity.y || 0,
      facingRight: this.facingRight,
      character: this.character,
      health: this.health,
      score: this.score,
      fruitsCollected: this.fruitsCollected,
      currentAnimation: this.currentAnimation
    };
  }

  public updateFromNetwork(data: any): void {
    if (this.isLocal) return;
    
    this.sprite.setPosition(data.x, data.y);
    this.sprite.setVelocity(data.velocityX, data.velocityY);
    this.facingRight = data.facingRight;
    this.health = data.health;
    this.score = data.score;
    this.fruitsCollected = data.fruitsCollected;
    this.currentAnimation = data.currentAnimation;
    
    // Update visual representation
    this.updateAnimation();
  }

  public destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
    if (this.nameText) {
      this.nameText.destroy();
    }
  }
} 