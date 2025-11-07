// src/types/ai.ts
export type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'claseMundial' | 'experto';

export interface DifficultyConfig {
  elo: number;
  skillLevel: number;
  depth: number;
  thinkTime: number;
  errorRate: number;
  strategy: string;
  phases?: {
    opening: string;
    middlegame: string;
    endgame: string;
  };
}

export interface AIMoveRequest {
  fen: string;
  difficulty: DifficultyLevel;
  thinkTime?: number;
  gamePhase?: 'opening' | 'middlegame' | 'endgame';
}

export interface AIMoveResponse {
  move: string;
  confidence: number;
  reasoning: string;
  evaluation?: number;
}
