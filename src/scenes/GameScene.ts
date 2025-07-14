import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Fruit } from '../entities/Fruit';
import { LevelManager } from '../systems/LevelManager';
import { NetworkManager } from '../systems/NetworkManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private fruits!: Phaser.Physics.Arcade.Group;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private traps!: Phaser.Physics.Arcade.Group;
  private levelManager!: LevelManager;
  private networkManager!: NetworkManager;
  
  private selectedCharacter!: string;
  private currentWorld!: number;
  private currentLevel!: number;
  private fruitsCollected: number = 0;
  private isLevelComplete: boolean = false;
  
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  
  private gameUI!: Phaser.GameObjects.Group;
  private scoreText!: Phaser.GameObjects.Text;
  private fruitCountText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(): void {
    // Get game state from registry
    this.selectedCharacter = this.registry.get('selectedCharacter') || 'pink_man';
    this.currentWorld = this.registry.get('currentWorld') || 1;
    this.currentLevel = this.registry.get('currentLevel') || 1;
    this.fruitsCollected = 0;
    this.isLevelComplete = false;
  }

  create(): void {
    this.setupPhysics();
    this.createLevel();
    this.createPlayer();
    this.createEnemies();
    this.createFruits();
    this.createUI();
    this.setupInput();
    this.setupCollisions();
    this.setupNetworking();
    
    // Start the UI scene as overlay
    this.scene.launch('UIScene');
  }

  private setupPhysics(): void {
    this.physics.world.setBounds(0, 0, GAME_CONSTANTS.WORLD_WIDTH, GAME_CONSTANTS.WORLD_HEIGHT);
  }

  private createLevel(): void {
    this.levelManager = new LevelManager(this);
    this.platforms = this.levelManager.createLevel(this.currentWorld, this.currentLevel);
  }

  private createPlayer(): void {
    // Create player at spawn point
    const spawnX = 100;
    const spawnY = GAME_CONSTANTS.WORLD_HEIGHT - 200;
    
    this.player = new Player(this, spawnX, spawnY, this.selectedCharacter);
    this.player.create();
    
    // Setup camera to follow player
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(200, 100);
    this.cameras.main.setBounds(0, 0, GAME_CONSTANTS.WORLD_WIDTH, GAME_CONSTANTS.WORLD_HEIGHT);
  }

  private createEnemies(): void {
    this.enemies = this.physics.add.group();
    
    // Create enemies based on current level
    const enemyPositions = this.getEnemyPositions();
    const enemyTypes = ['flying_eye', 'goblin', 'mushroom', 'skeleton'];
    
    enemyPositions.forEach(pos => {
      const enemyType = Phaser.Utils.Array.GetRandom(enemyTypes);
      const enemy = new Enemy(this, pos.x, pos.y, enemyType);
      enemy.create();
      this.enemies.add(enemy.sprite);
    });
  }

  private createFruits(): void {
    this.fruits = this.physics.add.group();
    
    // Create fruits based on current level
    const fruitPositions = this.getFruitPositions();
    const fruitTypes = ['apple', 'bananas', 'cherries', 'kiwi', 'melon', 'orange', 'pineapple', 'strawberry'];
    
    fruitPositions.forEach(pos => {
      const fruitType = Phaser.Utils.Array.GetRandom(fruitTypes);
      const fruit = new Fruit(this, pos.x, pos.y, fruitType);
      fruit.create();
      this.fruits.add(fruit.sprite);
    });
  }

  private createUI(): void {
    this.gameUI = this.add.group();
    
    // Score display
    this.scoreText = this.add.text(20, 20, `Score: ${this.registry.get('score') || 0}`, {
      fontSize: '24px',
      color: '#2c3e50',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.scoreText.setScrollFactor(0);
    
    // Fruit count display
    this.fruitCountText = this.add.text(20, 50, `Fruits: ${this.fruitsCollected}/${GAME_CONSTANTS.FRUITS_PER_LEVEL}`, {
      fontSize: '20px',
      color: '#27ae60',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.fruitCountText.setScrollFactor(0);
    
    // Level display
    this.levelText = this.add.text(20, 80, `World ${this.currentWorld} - Level ${this.currentLevel}`, {
      fontSize: '18px',
      color: '#34495e',
      fontFamily: 'Arial'
    });
    this.levelText.setScrollFactor(0);
    
    this.gameUI.addMultiple([this.scoreText, this.fruitCountText, this.levelText]);
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys('W,S,A,D');
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Pause key
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
  }

  private setupCollisions(): void {
    // Player collisions
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.overlap(this.player.sprite, this.fruits, this.collectFruit, undefined, this);
    this.physics.add.overlap(this.player.sprite, this.enemies, this.playerHitEnemy, undefined, this);
    
    // Enemy collisions
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.enemies);
    
    // Fruit collisions
    this.physics.add.collider(this.fruits, this.platforms);
  }

  private setupNetworking(): void {
    this.networkManager = new NetworkManager(this);
    this.networkManager.connect();
  }

  private getEnemyPositions(): { x: number; y: number }[] {
    // Generate enemy positions based on level
    const positions = [];
    const baseY = GAME_CONSTANTS.WORLD_HEIGHT - 100;
    
    for (let i = 0; i < 3 + this.currentLevel; i++) {
      positions.push({
        x: 300 + (i * 200),
        y: baseY - (Math.random() * 200)
      });
    }
    
    return positions;
  }

  private getFruitPositions(): { x: number; y: number }[] {
    // Generate fruit positions based on level
    const positions = [];
    const baseY = GAME_CONSTANTS.WORLD_HEIGHT - 100;
    
    for (let i = 0; i < GAME_CONSTANTS.FRUITS_PER_LEVEL; i++) {
      positions.push({
        x: 150 + (i * 100),
        y: baseY - (Math.random() * 300)
      });
    }
    
    return positions;
  }

  private collectFruit(player: any, fruit: any): void {
    if (fruit.visible) {
      fruit.setVisible(false);
      fruit.body.setEnable(false);
      
      this.fruitsCollected++;
      const currentScore = this.registry.get('score') || 0;
      this.registry.set('score', currentScore + GAME_CONSTANTS.FRUIT_SCORE);
      
      // Update UI
      this.scoreText.setText(`Score: ${this.registry.get('score')}`);
      this.fruitCountText.setText(`Fruits: ${this.fruitsCollected}/${GAME_CONSTANTS.FRUITS_PER_LEVEL}`);
      
      // Play collection sound
      this.sound.play('coin_sound', { volume: 0.3 });
      
      // Check if level is complete
      if (this.fruitsCollected >= GAME_CONSTANTS.FRUITS_PER_LEVEL) {
        this.completeLevel();
      }
    }
  }

  private playerHitEnemy(player: any, enemy: any): void {
    if (!this.player.isInvincible) {
      this.player.takeDamage(GAME_CONSTANTS.ENEMY_ATTACK_DAMAGE);
      this.sound.play('hurt_sound', { volume: 0.5 });
      
      // Knockback effect
      const knockbackForce = 200;
      const direction = player.x < enemy.x ? -1 : 1;
      player.setVelocityX(direction * knockbackForce);
      player.setVelocityY(-knockbackForce);
    }
  }

  private completeLevel(): void {
    if (this.isLevelComplete) return;
    
    this.isLevelComplete = true;
    
    // Level completion effects
    this.add.text(GAME_CONSTANTS.WORLD_WIDTH / 2, 200, 'LEVEL COMPLETE!', {
      fontSize: '48px',
      color: '#27ae60',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);
    
    // Progress to next level
    this.time.delayedCall(2000, () => {
      this.nextLevel();
    });
  }

  private nextLevel(): void {
    this.currentLevel++;
    
    // Check if moving to next world
    if (this.currentLevel > GAME_CONSTANTS.LEVELS_PER_WORLD) {
      this.currentWorld++;
      this.currentLevel = 1;
      
      // Check if game is complete
      if (this.currentWorld > GAME_CONSTANTS.TOTAL_WORLDS) {
        this.gameComplete();
        return;
      }
    }
    
    // Update registry and restart scene
    this.registry.set('currentWorld', this.currentWorld);
    this.registry.set('currentLevel', this.currentLevel);
    this.scene.restart();
  }

  private gameComplete(): void {
    this.add.text(GAME_CONSTANTS.WORLD_WIDTH / 2, GAME_CONSTANTS.WORLD_HEIGHT / 2, 'GAME COMPLETE!', {
      fontSize: '64px',
      color: '#f39c12',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);
    
    this.time.delayedCall(3000, () => {
      this.scene.start('MenuScene');
    });
  }

  update(): void {
    if (this.player) {
      this.player.update(this.cursors, this.wasdKeys, this.spaceKey);
    }
    
    // Update enemies
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.getData('enemy')) {
        enemy.getData('enemy').update();
      }
    });
    
    // Check for player falling off screen
    if (this.player.sprite.y > GAME_CONSTANTS.WORLD_HEIGHT + 100) {
      this.respawnPlayer();
    }
  }

  private respawnPlayer(): void {
    this.player.sprite.setPosition(100, GAME_CONSTANTS.WORLD_HEIGHT - 200);
    this.player.sprite.setVelocity(0, 0);
    this.player.takeDamage(10);
  }
} 