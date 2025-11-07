// src/types/game.ts
import type { PieceColor, GameState } from './chess';
import type { DifficultyLevel } from './ai';

export type GameMode = 'pvp' | 'ai';
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'paused';

export interface GameSettings {
  mode: GameMode;
  difficulty?: DifficultyLevel;
  timeControl?: {
    initial: number; // minutes
    increment: number; // seconds
  };
  playerColor?: PieceColor;
}

export interface Game {
  id: string;
  status: GameStatus;
  settings: GameSettings;
  state: GameState;
  players: {
    white?: string;
    black?: string;
  };
  timers: {
    white: number;
    black: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TimerState {
  white: number;
  black: number;
  isRunning: boolean;
  currentPlayer: PieceColor;
}
