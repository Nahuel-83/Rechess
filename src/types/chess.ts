<<<<<<< HEAD
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
=======
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type Color = 'white' | 'black';

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  type: PieceType;
  color: Color;
  id: string;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  isPromotion?: boolean;
  promotionPiece?: PieceType;
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: Color;
  moveHistory: Move[];
  isInCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  enPassantTarget?: Position;
  castlingRights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
}

export interface AIDifficulty {
  name: string;
  depth: number;
  timeLimit?: number;
  description: string;
}

export const DIFFICULTY_LEVELS: Record<string, AIDifficulty> = {
  easy: {
    name: 'Fácil',
    depth: 2,
    description: 'Nivel básico para principiantes'
  },
  medium: {
    name: 'Intermedio',
    depth: 4,
    description: 'Nivel moderado para jugadores casuales'
  },
  hard: {
    name: 'Difícil',
    depth: 6,
    description: 'Nivel avanzado para jugadores experimentados'
  },
  worldclass: {
    name: 'Clase Mundial',
    depth: 10,
    timeLimit: 8000,
    description: 'Nivel de gran maestro (ELO 2500+)'
  }
};

export const INITIAL_BOARD_STATE: (Piece | null)[][] = [
  // Fila 8 (negra)
  [
    { type: 'rook', color: 'black', id: 'black-rook-1' },
    { type: 'knight', color: 'black', id: 'black-knight-1' },
    { type: 'bishop', color: 'black', id: 'black-bishop-1' },
    { type: 'queen', color: 'black', id: 'black-queen' },
    { type: 'king', color: 'black', id: 'black-king' },
    { type: 'bishop', color: 'black', id: 'black-bishop-2' },
    { type: 'knight', color: 'black', id: 'black-knight-2' },
    { type: 'rook', color: 'black', id: 'black-rook-2' }
  ],
  // Fila 7 (negra)
  [
    { type: 'pawn', color: 'black', id: 'black-pawn-1' },
    { type: 'pawn', color: 'black', id: 'black-pawn-2' },
    { type: 'pawn', color: 'black', id: 'black-pawn-3' },
    { type: 'pawn', color: 'black', id: 'black-pawn-4' },
    { type: 'pawn', color: 'black', id: 'black-pawn-5' },
    { type: 'pawn', color: 'black', id: 'black-pawn-6' },
    { type: 'pawn', color: 'black', id: 'black-pawn-7' },
    { type: 'pawn', color: 'black', id: 'black-pawn-8' }
  ],
  // Filas 6-3 vacías
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  // Fila 2 (blanca)
  [
    { type: 'pawn', color: 'white', id: 'white-pawn-1' },
    { type: 'pawn', color: 'white', id: 'white-pawn-2' },
    { type: 'pawn', color: 'white', id: 'white-pawn-3' },
    { type: 'pawn', color: 'white', id: 'white-pawn-4' },
    { type: 'pawn', color: 'white', id: 'white-pawn-5' },
    { type: 'pawn', color: 'white', id: 'white-pawn-6' },
    { type: 'pawn', color: 'white', id: 'white-pawn-7' },
    { type: 'pawn', color: 'white', id: 'white-pawn-8' }
  ],
  // Fila 1 (blanca)
  [
    { type: 'rook', color: 'white', id: 'white-rook-1' },
    { type: 'knight', color: 'white', id: 'white-knight-1' },
    { type: 'bishop', color: 'white', id: 'white-bishop-1' },
    { type: 'queen', color: 'white', id: 'white-queen' },
    { type: 'king', color: 'white', id: 'white-king' },
    { type: 'bishop', color: 'white', id: 'white-bishop-2' },
    { type: 'knight', color: 'white', id: 'white-knight-2' },
    { type: 'rook', color: 'white', id: 'white-rook-2' }
  ]
];

export const INITIAL_GAME_STATE: GameState = {
  board: INITIAL_BOARD_STATE,
  currentPlayer: 'white',
  moveHistory: [],
  isInCheck: false,
  isCheckmate: false,
  isStalemate: false,
  castlingRights: {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true
  }
};
>>>>>>> ce7de1929af02f496e3847fecdcf5dd517cefe79
