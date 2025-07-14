import Phaser from 'phaser';
import { GAME_CONSTANTS, COLORS, LEVEL_DATA } from '../config/GameConfig';
import { AssetPaths } from '../../utils/assetPaths';
import { Player } from '../entities/Player';
import { LevelSystem } from '../systems/LevelSystem';
import { useGameStore } from '../../stores/gameStore';

export class GameScene extends Phaser.Scene {
  private players: Map<string, Player> = new Map();
  private localPlayer!: Player;
  private levelSystem!: LevelSystem;
  private gameStore: any;
  private playerIndex: number = 0;
  
  // UI elements
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private fruitsText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private playersText!: Phaser.GameObjects.Text;
  private characterText!: Phaser.GameObjects.Text;
  
  // Game state
  private gameTime: number = 0;
  private gameStartTime: number = 0;
  private gameTimer!: Phaser.Time.TimerEvent;
  private levelCompleted: boolean = false;
  private lastCheckpoint: { x: number; y: number } = { x: 100, y: 600 };

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    console.log('🎮 GameScene: Starting asset preload...');
    console.log('🎮 GameScene: Base URL:', this.load.baseURL);
    console.log('🎮 GameScene: Path:', this.load.path);
    
    // Set up loading event handlers first
    this.setupLoadEventHandlers();
    
    // Load character assets (ensuring they're available in GameScene)
    this.loadCharacterAssets();
    
    // Load fruit assets
    this.loadFruitAssets();
    
    // Load game object assets
    this.loadGameObjectAssets();
    
    // Load background assets
    this.loadBackgroundAssets();
    
    console.log('🎮 GameScene: All asset loads queued, starting load...');
  }

  private loadCharacterAssets(): void {
    console.log('👤 GameScene: Loading character assets...');
    
    const characterData = [
      { name: 'Pink Man', key: 'pinkman' },
      { name: 'Mask Dude', key: 'maskdude' },
      { name: 'Ninja Frog', key: 'ninjafrog' },
      { name: 'Virtual Guy', key: 'virtualguy' },
      { name: 'Adventure Hero', key: 'adventurehero' },
      { name: 'Robot', key: 'robot' },
      { name: 'King Human', key: 'kinghuman' }
    ];
    
    // Include all animation states that Player.createAnimations expects so we
    // avoid runtime warnings / errors when those animations are played. Each
    // object maps the filename segment ("name") to the texture key suffix
    // ("key") that Player.ts uses.
    const animations = [
      { name: 'Idle', key: 'idle' },
      { name: 'Run', key: 'run' },
      { name: 'Jump', key: 'jump' },
      { name: 'Fall', key: 'fall' },
      { name: 'Double Jump', key: 'double_jump' },
      { name: 'Wall Jump', key: 'wall_jump' },
      { name: 'Hit', key: 'hit' }
    ];
    
    characterData.forEach(character => {
      animations.forEach(animation => {
        const rawPath = AssetPaths.player(character.name, animation.name);
        const encodedPath = encodeURI(rawPath);
        const assetKey = `${character.key}_${animation.key}`;
        
        this.load.image(assetKey, encodedPath);
        console.log(`👤 Loading character: ${assetKey} from ${encodedPath}`);
      });
    });
  }

  private loadFruitAssets(): void {
    console.log('🍎 GameScene: Loading fruit assets...');
    
    const fruits = [
      { name: 'Apple', key: 'apple' },
      { name: 'Bananas', key: 'bananas' },
      { name: 'Cherries', key: 'cherries' },
      { name: 'Kiwi', key: 'kiwi' },
      { name: 'Melon', key: 'melon' },
      { name: 'Orange', key: 'orange' },
      { name: 'Pineapple', key: 'pineapple' },
      { name: 'Strawberry', key: 'strawberry' }
    ];
    
    fruits.forEach(fruit => {
      const rawPath = AssetPaths.fruit(fruit.name);
      const encodedPath = encodeURI(rawPath);
      this.load.image(fruit.key, encodedPath);
      console.log(`🍎 Loading fruit: ${fruit.key} from ${encodedPath}`);
    });
  }

  private loadGameObjectAssets(): void {
    console.log('📦 GameScene: Loading game object assets...');
    
    // Load box assets
    const boxes = ['Box1', 'Box2', 'Box3'];
    boxes.forEach(box => {
      const rawPath = AssetPaths.box(box);
      const encodedPath = encodeURI(rawPath);
      this.load.image(box.toLowerCase(), encodedPath);
    });
    
    // Load checkpoint assets
    const checkpointPath = AssetPaths.checkpoint();
    const encodedCheckpointPath = encodeURI(checkpointPath);
    this.load.image('checkpoint', encodedCheckpointPath);
    
    // Load enemy assets
    const enemies = ['flying_eye', 'goblin', 'mushroom', 'skeleton'];
    enemies.forEach(enemy => {
      const rawPath = AssetPaths.enemy(enemy);
      const encodedPath = encodeURI(rawPath);
      this.load.image(enemy, encodedPath);
      console.log(`👹 Loading enemy: ${enemy} from ${encodedPath}`);
    });
    
    // ---- Trap textures (match keys used in Trap.ts) ----
    // Spikes (idle)
    const spikePath = AssetPaths.spike();
    this.load.image('spike_idle', encodeURI(spikePath));

    // Trampoline (idle)
    const trampolinePath = AssetPaths.trampoline();
    this.load.image('trampoline_idle', encodeURI(trampolinePath));

    // Fire (off / on)
    const fireOffPath = AssetPaths.fire('off');
    const fireOnPath = AssetPaths.fire('on');
    this.load.image('fire_off', encodeURI(fireOffPath));
    this.load.image('fire_on', encodeURI(fireOnPath));

    // Saw (on)
    const sawOnPath = AssetPaths.saw();
    this.load.image('saw_on', encodeURI(sawOnPath));

    // Falling platform (on)
    const fpOnPath = AssetPaths.fallingPlatform();
    this.load.image('falling_platform_on', encodeURI(fpOnPath));

    // Keep basic spike & trampoline keys for backward compatibility
    this.load.image('spike', encodeURI(spikePath));
    this.load.image('trampoline', encodeURI(trampolinePath));

    // Load terrain tileset
    const terrainPath = AssetPaths.terrain('Terrain (16x16).png');
    this.load.spritesheet('terrain_tileset', encodeURI(terrainPath), {
      frameWidth: 16,
      frameHeight: 16
    });
    
    // Load seasonal tilesets for better visuals
    const seasonalTilesets = [
      { key: 'grassland_tileset', season: '1 - Grassland' },
      { key: 'autumn_tileset', season: '2 - Autumn Forest' },
      { key: 'tropics_tileset', season: '3 - Tropics' },
      { key: 'winter_tileset', season: '4 - Winter World' }
    ];
    
    seasonalTilesets.forEach(tileset => {
      const seasonalPath = AssetPaths.seasonalTileset(tileset.season);
      this.load.spritesheet(tileset.key, encodeURI(seasonalPath), {
        frameWidth: 16,
        frameHeight: 16
      });
      console.log(`🌍 Loading seasonal tileset: ${tileset.key} from ${seasonalPath}`);
    });

    // ---- Goal texture (reuse checkpoint flag) ----
    const goalPath = `assets/sprites/Items/Checkpoints/Checkpoint/Checkpoint (Flag Idle)(64x64).png`;
    this.load.image('goal', encodeURI(goalPath));
  }

  private loadBackgroundAssets(): void {
    console.log('🌄 GameScene: Loading background assets...');
    
    // Load backgrounds
    const backgrounds = ['Blue', 'Brown', 'Gray', 'Green', 'Pink', 'Purple', 'Yellow'];
    backgrounds.forEach(bg => {
      const bgKey = `bg_${bg.toLowerCase()}`;
      const bgPath = AssetPaths.background(bg);
      this.load.image(bgKey, bgPath);
    });
    
    // Load stringstar backgrounds if available
    try {
      const stringstarBgs = ['background_0', 'background_1', 'background_2'];
      stringstarBgs.forEach((bg, index) => {
        const bgKey = `bg_stringstar_${index}`;
        const bgPath = `assets/levels/stringstar_fields/${bg}.png`;
        this.load.image(bgKey, bgPath);
      });
    } catch (error) {
      console.warn('⚠️ Stringstar backgrounds not found, using fallback');
    }
  }

  private setupLoadEventHandlers(): void {
    this.load.on('complete', () => {
      console.log('🎯 GameScene: Asset loading complete!');
      this.verifyAssetsLoaded();
    });

    this.load.on('loaderror', (file: any) => {
      console.error(`❌ GameScene: Failed to load asset: ${file.key} from ${file.url}`);
      // Create placeholder for failed assets
      this.createAssetPlaceholder(file.key);
    });
    
    this.load.on('filecomplete', (key: string, type: string, data: any) => {
      console.log(`✅ GameScene: Successfully loaded ${type}: ${key}`);
    });
  }

  private verifyAssetsLoaded(): void {
    console.log('🔍 GameScene: Verifying assets loaded...');
    
    // Check fruits
    const fruits = ['apple', 'bananas', 'cherries', 'kiwi', 'melon', 'orange', 'pineapple', 'strawberry'];
    fruits.forEach(fruit => {
      if (this.textures.exists(fruit)) {
        console.log(`✅ Fruit texture exists: ${fruit}`);
      } else {
        console.warn(`❌ Fruit texture missing: ${fruit}`);
      }
    });
    
    // Check characters
    const characters = ['pinkman', 'maskdude', 'ninjafrog', 'virtualguy', 'adventurehero', 'robot', 'kinghuman'];
    characters.forEach(character => {
      const idleKey = `${character}_idle`;
      if (this.textures.exists(idleKey)) {
        console.log(`✅ Character texture exists: ${idleKey}`);
      } else {
        console.warn(`❌ Character texture missing: ${idleKey}`);
      }
    });
  }

  private createAssetPlaceholder(key: string): void {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    
    // Different colors for different asset types
    let fillColor = '#FF69B4'; // Default pink
    if (key.includes('fruit') || key.includes('apple') || key.includes('banana')) {
      fillColor = '#FFD700'; // Gold for fruits
    } else if (key.includes('box')) {
      fillColor = '#8B4513'; // Brown for boxes
    } else if (key.includes('checkpoint')) {
      fillColor = '#00FF00'; // Green for checkpoints
    } else if (key.includes('spike')) {
      fillColor = '#FF0000'; // Red for spikes
    }
    
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#000000';
    ctx.fillRect(2, 2, 28, 28);
    ctx.fillStyle = fillColor;
    ctx.fillRect(4, 4, 24, 24);
    
    const texture = this.textures.createCanvas(key, 32, 32);
    if (texture) {
      const context = texture.getContext();
      context.drawImage(canvas, 0, 0);
      texture.refresh();
    }
  }

  create(): void {
    // Get game store instance
    this.gameStore = useGameStore.getState();
    
    // Create level system
    this.levelSystem = new LevelSystem(this);
    
    // Create local player
    this.createLocalPlayer();
    
    // Set up collision detection
    this.setupCollisions();
    
    // Create UI
    this.createUI();
    
    // Set up camera
    this.setupCamera();
    
    // Start game timer
    this.startGameTimer();
    
    // Initialize multiplayer
    this.initializeMultiplayer();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  private createLocalPlayer(): void {
    const spawnPoint = this.lastCheckpoint;
    
    // Get selected character from registry or default to Pink Man
    const selectedCharacter = this.registry.get('selectedCharacter') || 'pinkman';
    const gameMode = this.registry.get('gameMode') || 'single';
    
    // Map character names to player indexes
    const characterMap: { [key: string]: number } = {
      'pinkman': 0,
      'maskdude': 1,
      'ninjafrog': 2,
      'virtualguy': 3,
      'adventurehero': 4,
      'robot': 5,
      'captainclownnose': 6,
      'kinghuman': 7
    };
    
    this.playerIndex = characterMap[selectedCharacter] || 0;
    
    console.log(`🎮 Creating local player with character: ${selectedCharacter} (index: ${this.playerIndex})`);
    
    // Create local player with selected character
    this.localPlayer = new Player(this, spawnPoint.x, spawnPoint.y, 'local', this.playerIndex);
    this.players.set('local', this.localPlayer);
    
    // Set up input events
    this.setupPlayerEvents();
  }

  private setupPlayerEvents(): void {
    // Listen for fruit collection
    this.events.on('fruit_collected', (data: any) => {
      console.log(`Player ${data.playerId} collected ${data.fruitType}`);
    });
    
    // Listen for jump events
    this.events.on('player_jump', (data: any) => {
      console.log(`Player ${data.playerId} jumped`);
    });
    
    this.events.on('player_double_jump', (data: any) => {
      console.log(`Player ${data.playerId} double jumped`);
    });
    
    this.events.on('player_wall_jump', (data: any) => {
      console.log(`Player ${data.playerId} wall jumped`);
    });
    
    // Listen for trap events
    this.events.on('trap_triggered', (data: any) => {
      console.log(`Player ${data.playerId} triggered ${data.trapType} trap for ${data.damage} damage`);
    });
    
    this.events.on('trampoline_bounced', (data: any) => {
      console.log(`Player ${data.playerId} bounced on trampoline at (${data.x}, ${data.y})`);
    });
    
    // Listen for game over
    this.events.on('player_game_over', (data: any) => {
      this.handleGameOver();
    });
    
    // Listen for respawn
    this.events.on('player_respawn', (data: any) => {
      console.log(`Player ${data.playerId} respawned`);
    });
  }

  private setupCollisions(): void {
    // Player-Platform collisions
    this.players.forEach(player => {
      this.physics.add.collider(player.sprite, this.levelSystem.getPlatforms());
      this.physics.add.collider(player.sprite, this.levelSystem.getWalls());
      this.physics.add.collider(player.sprite, this.levelSystem.getBoxes());
    });

    // Player-Fruit collisions
    this.players.forEach(player => {
      this.physics.add.overlap(player.sprite, this.levelSystem.getFruits(), 
        (playerSprite, fruit) => this.handleFruitCollection(player, fruit as Phaser.Physics.Arcade.Sprite), 
        undefined, this);
    });

    // Player-Box collisions (for breaking boxes)
    this.players.forEach(player => {
      this.physics.add.overlap(player.sprite, this.levelSystem.getBoxes(), 
        (playerSprite, box) => this.handleBoxHit(player, box as Phaser.Physics.Arcade.Sprite), 
        undefined, this);
    });

    // Player-Checkpoint collisions
    this.players.forEach(player => {
      this.physics.add.overlap(player.sprite, this.levelSystem.getCheckpoints(), 
        (playerSprite, checkpoint) => this.handleCheckpointReached(player, checkpoint as Phaser.Physics.Arcade.Sprite), 
        undefined, this);
    });

    // Player-Goal collisions
    this.players.forEach(player => {
      this.physics.add.overlap(player.sprite, this.levelSystem.getGoal(), 
        (playerSprite, goal) => this.handleGoalReached(player), 
        undefined, this);
    });

    // Player vs traps handled in LevelSystem checkTrapCollisions
    // Player vs enemies
    this.physics.add.collider(this.localPlayer.sprite, this.levelSystem.getEnemies(), () => {
      this.localPlayer.takeDamage();
    });

    // Enemies vs level geometry
    this.physics.add.collider(this.levelSystem.getEnemies(), this.levelSystem.getPlatforms());
    this.physics.add.collider(this.levelSystem.getEnemies(), this.levelSystem.getWalls());
    this.physics.add.collider(this.levelSystem.getEnemies(), this.levelSystem.getBoxes());
  }

  private handleFruitCollection(player: Player, fruit: Phaser.Physics.Arcade.Sprite): void {
    if (player.isLocal) {
      const fruitType = this.levelSystem.collectFruit(fruit);
      player.collectFruit(fruitType);
      
      // Send network event
      this.gameStore.sendPlayerAction?.({
        type: 'fruit_collected',
        playerId: player.id,
        fruitType: fruitType,
        fruitX: fruit.x,
        fruitY: fruit.y,
        newScore: player.score,
        fruitsCollected: player.fruitsCollected
      });
    }
  }

  private handleBoxHit(player: Player, box: Phaser.Physics.Arcade.Sprite): void {
    if (player.isLocal) {
      const playerBody = player.sprite.body as Phaser.Physics.Arcade.Body;
      const boxBody = box.body as Phaser.Physics.Arcade.Body;

      // Check if player is hitting box from below or above
      if (playerBody.touching.up && boxBody.touching.down) {
        // Player hit box from below
        this.levelSystem.hitBox(box);
        player.hitBox();
        
        // Send network event
        this.gameStore.sendPlayerAction?.({
          type: 'box_broken',
          playerId: player.id,
          boxX: box.x,
          boxY: box.y,
          newScore: player.score
        });
      }
    }
  }

  private handleCheckpointReached(player: Player, checkpoint: Phaser.Physics.Arcade.Sprite): void {
    if (player.isLocal && !checkpoint.getData('activated')) {
      this.levelSystem.activateCheckpoint(checkpoint);
      
      // Update last checkpoint
      this.lastCheckpoint = { x: checkpoint.x, y: checkpoint.y };
      
      // Send network event
      this.gameStore.sendPlayerAction?.({
        type: 'checkpoint_reached',
        playerId: player.id,
        checkpointX: checkpoint.x,
        checkpointY: checkpoint.y
      });
    }
  }

  private handleGoalReached(player: Player): void {
    if (!this.levelCompleted) {
      this.levelCompleted = true;
      this.completeLevel();
    }
  }

  private completeLevel(): void {
    // Stop game timer
    if (this.gameTimer) {
      this.gameTimer.destroy();
    }
    
    // Create victory effect
    this.levelSystem.reachGoal();
    
    // Calculate final score
    const timeBonus = Math.max(0, (GAME_CONSTANTS.LEVEL_TIME_LIMIT - this.gameTime) * 10);
    const finalScore = this.localPlayer.score + timeBonus;
    
    // Create victory text
    const victoryText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
      `Level Complete!\n\nScore: ${finalScore}\nTime Bonus: ${timeBonus}\n\nPress SPACE to continue`, {
      fontSize: '32px',
      color: '#FFD700',
      fontStyle: 'bold',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 20, y: 20 }
    });
    victoryText.setOrigin(0.5);
    victoryText.setScrollFactor(0);
    
    // Handle continue input
    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey?.on('down', () => {
      this.scene.start('MenuScene');
    });
    
    // Send network event
    this.gameStore.sendPlayerAction?.({
      type: 'level_complete',
      playerId: this.localPlayer.id,
      finalScore: finalScore,
      timeBonus: timeBonus
    });
  }

  private createUI(): void {
    const padding = GAME_CONSTANTS.UI_PADDING;
    
    // Character display
    this.characterText = this.add.text(padding, padding, 
      `Character: ${this.localPlayer.character.toUpperCase()}`, {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.characterText.setScrollFactor(0);
    
    // Score display
    this.scoreText = this.add.text(padding, padding + 40, 
      `Score: ${this.localPlayer.score}`, {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.scoreText.setScrollFactor(0);
    
    // Lives display
    this.livesText = this.add.text(padding, padding + 80, 
      `Lives: ${this.localPlayer.lives}`, {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.livesText.setScrollFactor(0);
    
    // Fruits collected display
    this.fruitsText = this.add.text(padding, padding + 120, 
      `Fruits: ${this.localPlayer.fruitsCollected}`, {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.fruitsText.setScrollFactor(0);
    
    // Time display
    this.timeText = this.add.text(this.cameras.main.width - padding, padding, 
      `Time: ${GAME_CONSTANTS.LEVEL_TIME_LIMIT}`, {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.timeText.setOrigin(1, 0);
    this.timeText.setScrollFactor(0);
    
    // Players count display
    this.playersText = this.add.text(this.cameras.main.width - padding, padding + 40, 
      `Players: ${this.players.size}`, {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.playersText.setOrigin(1, 0);
    this.playersText.setScrollFactor(0);
    
    // Controls display
    const controlsText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - padding, 
      `Controls: WASD/Arrow Keys to move • SPACE/W/UP to jump • Double jump in air • Wall jump when sliding`, {
      fontSize: '12px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 },
      align: 'center'
    });
    controlsText.setOrigin(0.5, 1);
    controlsText.setScrollFactor(0);
  }

  private setupCamera(): void {
    // Follow the local player
    this.cameras.main.startFollow(this.localPlayer.sprite);
    this.cameras.main.setBounds(0, 0, GAME_CONSTANTS.WORLD_WIDTH, GAME_CONSTANTS.WORLD_HEIGHT);
    
    // Camera settings for platformer
    this.cameras.main.setDeadzone(100, 50);
    this.cameras.main.setLerp(0.1, 0.1);
  }

  private startGameTimer(): void {
    this.gameStartTime = Date.now();
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateGameTime,
      callbackScope: this,
      loop: true
    });
  }

  private updateGameTime(): void {
    this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    
    if (this.gameTime >= GAME_CONSTANTS.LEVEL_TIME_LIMIT) {
      this.gameTimeUp();
    }
  }

  private gameTimeUp(): void {
    // Time's up - trigger game over
    this.handleGameOver();
  }

  private initializeMultiplayer(): void {
    // Set up multiplayer connections
    this.gameStore.joinRoom?.('game');
  }

  private setupNetworkEventHandlers(): void {
    // Handle network events for multiplayer
    this.gameStore.onPlayerJoin?.((data: any) => {
      this.addRemotePlayer(data.playerId, data);
    });
    
    this.gameStore.onPlayerLeave?.((data: any) => {
      this.removePlayer(data.playerId);
    });
    
    this.gameStore.onPlayerUpdate?.((data: any) => {
      this.updateRemotePlayer(data.playerId, data);
    });
  }

  private setupEventListeners(): void {
    // ESC key for pause
    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey?.on('down', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
    
    // R key for restart
    const rKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    rKey?.on('down', () => {
      this.scene.restart();
    });
  }

  private handleGameOver(): void {
    // Stop game timer
    if (this.gameTimer) {
      this.gameTimer.destroy();
    }
    
    // Create game over screen
    const gameOverText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
      `Game Over!\n\nFinal Score: ${this.localPlayer.score}\nFruits Collected: ${this.localPlayer.fruitsCollected}\n\nPress R to restart or ESC for menu`, {
      fontSize: '24px',
      color: '#FF0000',
      fontStyle: 'bold',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 20, y: 20 }
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);
    
    // Handle restart input
    const rKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    rKey?.on('down', () => {
      this.scene.restart();
    });
    
    // Handle menu input
    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey?.on('down', () => {
      this.scene.start('MenuScene');
    });
  }

  update(): void {
    // Update all players
    this.players.forEach(player => {
      player.update();
    });
    
    // Update level system (for trap animations)
    this.levelSystem.update();
    
    // Check trap collisions for all players
    this.players.forEach(player => {
      this.levelSystem.checkTrapCollisions(player);
    });
    
    // Update UI
    this.updateUI();
    
    // Send network updates
    this.sendNetworkUpdates();
  }

  private updateUI(): void {
    if (this.localPlayer) {
      this.scoreText.setText(`Score: ${this.localPlayer.score}`);
      this.livesText.setText(`Lives: ${this.localPlayer.lives}`);
      this.fruitsText.setText(`Fruits: ${this.localPlayer.fruitsCollected}`);
      this.playersText.setText(`Players: ${this.players.size}`);
      
      const remainingTime = Math.max(0, GAME_CONSTANTS.LEVEL_TIME_LIMIT - this.gameTime);
      this.timeText.setText(`Time: ${remainingTime}`);
      
      // Change time color when running low
      if (remainingTime <= 30) {
        this.timeText.setColor('#FF0000'); // Red when low
      } else if (remainingTime <= 60) {
        this.timeText.setColor('#FFA500'); // Orange when medium
      } else {
        this.timeText.setColor('#FFFFFF'); // White when normal
      }
    }
  }

  private sendNetworkUpdates(): void {
    // Send player updates to other players
    if (this.localPlayer && this.gameStore.sendPlayerUpdate) {
      this.gameStore.sendPlayerUpdate(this.localPlayer.getNetworkData());
    }
  }

  public addRemotePlayer(playerId: string, data: any): void {
    if (!this.players.has(playerId)) {
      // Assign character based on player count
      const playerIndex = this.players.size;
      const remotePlayer = new Player(this, data.x || 100, data.y || 400, playerId, playerIndex);
      this.players.set(playerId, remotePlayer);
      
      // Set up collisions for new player
      this.physics.add.collider(remotePlayer.sprite, this.levelSystem.getPlatforms());
      this.physics.add.collider(remotePlayer.sprite, this.levelSystem.getWalls());
      this.physics.add.collider(remotePlayer.sprite, this.levelSystem.getBoxes());
    }
  }

  public removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) {
      player.destroy();
      this.players.delete(playerId);
    }
  }

  public updateRemotePlayer(playerId: string, data: any): void {
    const player = this.players.get(playerId);
    if (player && !player.isLocal) {
      player.updateFromNetwork(data);
    }
  }

  public getLocalPlayerData(): any {
    return this.localPlayer ? this.localPlayer.getNetworkData() : null;
  }
} 