import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../config/GameConfig';

export class Fruit {
  public sprite!: Phaser.Physics.Arcade.Sprite;
  public isCollected: boolean = false;
  public value: number = GAME_CONSTANTS.FRUIT_SCORE;
  
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private type: string;
  private floatTween?: Phaser.Tweens.Tween;
  private glowTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, type: string) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.type = type;
  }

  create(): void {
    // Create fruit sprite
    this.sprite = this.scene.physics.add.sprite(this.x, this.y, this.type);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.3);
    this.sprite.setSize(24, 24);
    this.sprite.setOffset(4, 4);
    
    // Store reference to this fruit in the sprite
    this.sprite.setData('fruit', this);
    
    // Set up physics body
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(200); // Light gravity for fruits
    body.setDrag(50, 0);
    
    // Create floating animation
    this.createFloatingAnimation();
    
    // Create glow effect
    this.createGlowEffect();
  }

  private createFloatingAnimation(): void {
    // Gentle floating up and down
    this.floatTween = this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 10,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  private createGlowEffect(): void {
    // Gentle glow effect
    this.glowTween = this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.7,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  collect(): void {
    if (this.isCollected) return;
    
    this.isCollected = true;
    
    // Stop animations
    if (this.floatTween) {
      this.floatTween.stop();
    }
    if (this.glowTween) {
      this.glowTween.stop();
    }
    
    // Create collection effect
    this.createCollectionEffect();
    
    // Disable physics
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    
    // Hide sprite
    this.sprite.setVisible(false);
  }

  private createCollectionEffect(): void {
    // Create particle effect
    const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, this.type, {
      speed: { min: 50, max: 100 },
      scale: { start: 0.3, end: 0 },
      lifespan: 300,
      quantity: 5
    });
    
    // Remove particles after effect
    this.scene.time.delayedCall(500, () => {
      particles.destroy();
    });
    
    // Create score popup
    this.createScorePopup();
  }

  private createScorePopup(): void {
    const scoreText = this.scene.add.text(this.sprite.x, this.sprite.y - 30, `+${this.value}`, {
      fontSize: '16px',
      color: '#f39c12',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    
    scoreText.setOrigin(0.5);
    
    // Animate score popup
    this.scene.tweens.add({
      targets: scoreText,
      y: scoreText.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        scoreText.destroy();
      }
    });
  }

  // Static method to get fruit types
  static getFruitTypes(): string[] {
    return ['apple', 'bananas', 'cherries', 'kiwi', 'melon', 'orange', 'pineapple', 'strawberry'];
  }

  // Static method to get random fruit type
  static getRandomFruitType(): string {
    const types = Fruit.getFruitTypes();
    return Phaser.Utils.Array.GetRandom(types);
  }

  // Get fruit color for UI effects
  getFruitColor(): number {
    const colorMap: { [key: string]: number } = {
      apple: 0xff0000,
      bananas: 0xffff00,
      cherries: 0x8b0000,
      kiwi: 0x32cd32,
      melon: 0x90ee90,
      orange: 0xffa500,
      pineapple: 0xffd700,
      strawberry: 0xff69b4
    };
    
    return colorMap[this.type] || 0xffffff;
  }

  destroy(): void {
    if (this.floatTween) {
      this.floatTween.stop();
    }
    if (this.glowTween) {
      this.glowTween.stop();
    }
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
} 