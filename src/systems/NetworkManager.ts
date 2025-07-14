import { io, Socket } from 'socket.io-client';

export class NetworkManager {
  private socket: Socket | null = null;
  private scene: Phaser.Scene;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  connect(): void {
    try {
      // Connect to Socket.io server
      this.socket = io('http://localhost:3003', {
        transports: ['websocket'],
        timeout: 5000,
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts
      });

      this.setupEventHandlers();
    } catch (error) {
      console.warn('Failed to connect to server:', error);
      this.handleConnectionError();
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.scene.events.emit('connectionStatusChanged', true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
      this.scene.events.emit('connectionStatusChanged', false);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('Connection error:', error);
      this.handleConnectionError();
    });

    // Game events
    this.socket.on('player_joined', (data) => {
      console.log('Player joined:', data);
      this.handlePlayerJoined(data);
    });

    this.socket.on('player_left', (data) => {
      console.log('Player left:', data);
      this.handlePlayerLeft(data);
    });

    this.socket.on('player_moved', (data) => {
      this.handlePlayerMoved(data);
    });

    this.socket.on('player_jumped', (data) => {
      this.handlePlayerJumped(data);
    });

    this.socket.on('player_double_jumped', (data) => {
      this.handlePlayerDoubleJumped(data);
    });

    this.socket.on('player_attacked', (data) => {
      this.handlePlayerAttacked(data);
    });

    this.socket.on('fruit_collected', (data) => {
      this.handleFruitCollected(data);
    });

    this.socket.on('level_completed', (data) => {
      this.handleLevelCompleted(data);
    });

    this.socket.on('game_state_updated', (data) => {
      this.handleGameStateUpdated(data);
    });

    this.socket.on('player_count_changed', (count) => {
      this.scene.events.emit('playerCountChanged', count);
    });
  }

  private handleConnectionError(): void {
    this.isConnected = false;
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnection attempts reached. Running in offline mode.');
      this.scene.events.emit('connectionStatusChanged', false);
      return;
    }

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private handlePlayerJoined(data: any): void {
    console.log('New player joined the game:', data);
    // Add visual indicator for new player
    // This would be implemented when multiplayer sprites are added
  }

  private handlePlayerLeft(data: any): void {
    console.log('Player left the game:', data);
    // Remove player sprite from scene
    // This would be implemented when multiplayer sprites are added
  }

  private handlePlayerMoved(data: any): void {
    // Update other player positions
    // This would be implemented when multiplayer sprites are added
  }

  private handlePlayerJumped(data: any): void {
    console.log('Player jumped:', data);
    // Play jump animation for other players
  }

  private handlePlayerDoubleJumped(data: any): void {
    console.log('Player double jumped:', data);
    // Play double jump animation for other players
  }

  private handlePlayerAttacked(data: any): void {
    console.log('Player attacked:', data);
    // Play attack animation for other players
  }

  private handleFruitCollected(data: any): void {
    console.log('Fruit collected by player:', data);
    // Sync fruit collection across all players
  }

  private handleLevelCompleted(data: any): void {
    console.log('Level completed:', data);
    // Handle level completion for all players
  }

  private handleGameStateUpdated(data: any): void {
    console.log('Game state updated:', data);
    // Update game state based on server data
  }

  // Send player movement to server
  sendPlayerMovement(x: number, y: number, velocityX: number, velocityY: number): void {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('player_movement', {
      x,
      y,
      velocityX,
      velocityY,
      timestamp: Date.now()
    });
  }

  // Send player jump to server
  sendPlayerJump(x: number, y: number, isDoubleJump: boolean = false): void {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit(isDoubleJump ? 'player_double_jump' : 'player_jump', {
      x,
      y,
      timestamp: Date.now()
    });
  }

  // Send player attack to server
  sendPlayerAttack(x: number, y: number, direction: number): void {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('player_attack', {
      x,
      y,
      direction,
      timestamp: Date.now()
    });
  }

  // Send fruit collection to server
  sendFruitCollected(fruitId: string, x: number, y: number): void {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('fruit_collected', {
      fruitId,
      x,
      y,
      timestamp: Date.now()
    });
  }

  // Send level completion to server
  sendLevelCompleted(world: number, level: number, score: number): void {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('level_completed', {
      world,
      level,
      score,
      timestamp: Date.now()
    });
  }

  // Join game room
  joinGame(playerName: string, character: string): void {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('join_game', {
      playerName,
      character,
      timestamp: Date.now()
    });
  }

  // Leave game room
  leaveGame(): void {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('leave_game', {
      timestamp: Date.now()
    });
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Disconnect from server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.scene.events.emit('connectionStatusChanged', false);
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
  }
} 