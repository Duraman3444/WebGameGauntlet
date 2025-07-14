import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '../game/config/GameConfig';

export class SocketClient {
  private socket: Socket | null = null;
  private serverUrl: string = 'http://localhost:3003'; // Development server
  private isConnected: boolean = false;
  private callbacks: Map<string, Function[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.socket = io(this.serverUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.emit('connected');
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log('Disconnected from server');
      this.isConnected = false;
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emit('connection_error', error);
    });

    // Player events
    this.socket.on(SOCKET_EVENTS.PLAYER_JOIN, (data) => {
      this.emit('player_joined', data);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_LEAVE, (data) => {
      this.emit('player_left', data);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_MOVE, (data) => {
      this.emit('player_moved', data);
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_ACTION, (data) => {
      this.emit('player_action', data);
    });

    // Game events
    this.socket.on(SOCKET_EVENTS.GAME_START, (data) => {
      this.emit('game_started', data);
    });

    this.socket.on(SOCKET_EVENTS.GAME_UPDATE, (data) => {
      this.emit('game_updated', data);
    });

    this.socket.on(SOCKET_EVENTS.GAME_END, (data) => {
      this.emit('game_ended', data);
    });

    // Room events
    this.socket.on(SOCKET_EVENTS.ROOM_UPDATE, (data) => {
      this.emit('room_updated', data);
    });

    this.socket.connect();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public joinRoom(roomId: string, playerName: string): void {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, playerName });
    }
  }

  public leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId });
    }
  }

  public sendPlayerMove(data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(SOCKET_EVENTS.PLAYER_MOVE, data);
    }
  }

  public sendPlayerAction(data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(SOCKET_EVENTS.PLAYER_ACTION, data);
    }
  }

  public sendGameUpdate(data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(SOCKET_EVENTS.GAME_UPDATE, data);
    }
  }

  public on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getPlayerId(): string | null {
    return this.socket?.id || null;
  }
}

// Singleton instance
export const socketClient = new SocketClient(); 