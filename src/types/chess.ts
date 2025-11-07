// src/types/chess.ts
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type PieceColor = 'w' | 'b';
export type GamePhase = 'opening' | 'middlegame' | 'endgame';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export interface Square {
  file: string;
  rank: number;
}

export interface Move {
  from: Square;
  to: Square;
  piece: ChessPiece;
  captured?: ChessPiece;
  promotion?: PieceType;
  flags: string;
  san: string;
  lan: string;
  before: string;
  after: string;
}

export interface CapturedPieces {
  white: ChessPiece[];
  black: ChessPiece[];
}

export interface GameState {
  fen: string;
  pgn: string;
  turn: PieceColor;
  isGameOver: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
  winner?: PieceColor;
  legalMoves: string[];
  history: Move[];
  position: Record<string, ChessPiece | null>;
  capturedPieces: CapturedPieces;
  settings?: {
    mode?: 'pvp' | 'ai';
    playerColor?: PieceColor;
  };
  status?: string;
}
