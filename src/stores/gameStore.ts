import { create } from 'zustand';
import { GAME_CONSTANTS } from '../game/config/GameConfig';
import { socketClient } from '../api/socketClient';

interface PlayerData {
  id: string;
  name: string;
  x: number;
  y: number;
  health: number;
  score: number;
  lives: number;
  coins: number;
  isLocal: boolean;
}

interface GameState {
  // Game state
  gameState: string;
  isGameRunning: boolean;
  gameTime: number;
  roomId: string | null;
  
  // Player state
  localPlayer: PlayerData | null;
  remotePlayers: Map<string, PlayerData>;
  playerName: string;
  
  // Connection state
  isConnected: boolean;
  connectionError: string | null;
  
  // Actions
  setGameState: (state: string) => void;
  setPlayerName: (name: string) => void;
  setLocalPlayer: (player: PlayerData) => void;
  addRemotePlayer: (player: PlayerData) => void;
  updateRemotePlayer: (id: string, data: Partial<PlayerData>) => void;
  removeRemotePlayer: (id: string) => void;
  setConnectionStatus: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  endGame: () => void;
  updateGameTime: (time: number) => void;
  
  // Multiplayer actions
  sendPlayerUpdate: (data: any) => void;
  sendPlayerAction: (data: any) => void;
  
  // Initialize/cleanup
  initializeMultiplayer: () => void;
  cleanup: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  gameState: GAME_CONSTANTS.GAME_STATES.MENU,
  isGameRunning: false,
  gameTime: 0,
  roomId: null,
  
  localPlayer: null,
  remotePlayers: new Map(),
  playerName: 'Player',
  
  isConnected: false,
  connectionError: null,
  
  // Actions
  setGameState: (state: string) => {
    set({ gameState: state });
  },
  
  setPlayerName: (name: string) => {
    set({ playerName: name });
  },
  
  setLocalPlayer: (player: PlayerData) => {
    set({ localPlayer: player });
  },
  
  addRemotePlayer: (player: PlayerData) => {
    const { remotePlayers } = get();
    const newPlayers = new Map(remotePlayers);
    newPlayers.set(player.id, player);
    set({ remotePlayers: newPlayers });
  },
  
  updateRemotePlayer: (id: string, data: Partial<PlayerData>) => {
    const { remotePlayers } = get();
    const player = remotePlayers.get(id);
    if (player) {
      const newPlayers = new Map(remotePlayers);
      newPlayers.set(id, { ...player, ...data });
      set({ remotePlayers: newPlayers });
    }
  },
  
  removeRemotePlayer: (id: string) => {
    const { remotePlayers } = get();
    const newPlayers = new Map(remotePlayers);
    newPlayers.delete(id);
    set({ remotePlayers: newPlayers });
  },
  
  setConnectionStatus: (connected: boolean) => {
    set({ isConnected: connected });
  },
  
  setConnectionError: (error: string | null) => {
    set({ connectionError: error });
  },
  
  joinRoom: (roomId: string) => {
    const { playerName } = get();
    set({ roomId });
    socketClient.joinRoom(roomId, playerName);
  },
  
  leaveRoom: () => {
    const { roomId } = get();
    if (roomId) {
      socketClient.leaveRoom(roomId);
      set({ roomId: null, remotePlayers: new Map() });
    }
  },
  
  startGame: () => {
    set({ 
      isGameRunning: true, 
      gameState: GAME_CONSTANTS.GAME_STATES.PLAYING,
      gameTime: 0 
    });
  },
  
  endGame: () => {
    set({ 
      isGameRunning: false, 
      gameState: GAME_CONSTANTS.GAME_STATES.GAME_OVER 
    });
  },
  
  updateGameTime: (time: number) => {
    set({ gameTime: time });
  },
  
  sendPlayerUpdate: (data: any) => {
    socketClient.sendPlayerMove(data);
  },
  
  sendPlayerAction: (data: any) => {
    socketClient.sendPlayerAction(data);
  },
  
  initializeMultiplayer: () => {
    // Set up socket event listeners
    socketClient.on('connected', () => {
      get().setConnectionStatus(true);
      get().setConnectionError(null);
    });
    
    socketClient.on('disconnected', () => {
      get().setConnectionStatus(false);
    });
    
    socketClient.on('connection_error', (error: any) => {
      get().setConnectionError(error.message || 'Connection failed');
    });
    
    socketClient.on('player_joined', (data: any) => {
      get().addRemotePlayer({
        id: data.id,
        name: data.name,
        x: data.x || 0,
        y: data.y || 0,
        health: data.health || 100,
        score: data.score || 0,
        lives: data.lives || 3,
        coins: data.coins || 0,
        isLocal: false
      });
    });
    
    socketClient.on('player_left', (data: any) => {
      get().removeRemotePlayer(data.id);
    });
    
    socketClient.on('player_moved', (data: any) => {
      get().updateRemotePlayer(data.id, {
        x: data.x,
        y: data.y,
        health: data.health,
        score: data.score
      });
    });
    
    socketClient.on('game_started', (data: any) => {
      get().startGame();
    });
    
    socketClient.on('game_ended', (data: any) => {
      get().endGame();
    });
  },
  
  cleanup: () => {
    socketClient.disconnect();
    set({
      gameState: GAME_CONSTANTS.GAME_STATES.MENU,
      isGameRunning: false,
      gameTime: 0,
      roomId: null,
      localPlayer: null,
      remotePlayers: new Map(),
      isConnected: false,
      connectionError: null
    });
  }
})); 