import type { Position, Piece, GameState } from '../types/chess';

/**
 * Utilidades generales para el juego de ajedrez
 */

/**
 * Formatea el tiempo en segundos a formato mm:ss
 */
export function formatTime(seconds?: number): string {
  if (seconds === undefined) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Verifica si una posición está dentro del tablero
 */
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

/**
 * Obtiene una pieza del tablero en una posición dada
 */
export function getPieceAt(board: (Piece | null)[][], pos: Position): Piece | null {
  if (!isValidPosition(pos)) return null;
  return board[pos.row][pos.col];
}

/**
 * Coloca una pieza en el tablero en una posición dada
 */
export function setPieceAt(board: (Piece | null)[][], pos: Position, piece: Piece | null): void {
  if (isValidPosition(pos)) {
    board[pos.row][pos.col] = piece;
  }
}

/**
 * Verifica si una pieza es enemiga respecto a un color dado
 */
export function isOpponentPiece(board: (Piece | null)[][], pos: Position, color: 'white' | 'black'): boolean {
  const piece = getPieceAt(board, pos);
  return piece !== null && piece.color !== color;
}

/**
 * Verifica si una pieza es del mismo color
 */
export function isSameColorPiece(board: (Piece | null)[][], pos: Position, color: 'white' | 'black'): boolean {
  const piece = getPieceAt(board, pos);
  return piece !== null && piece.color === color;
}

/**
 * Clona profundamente un tablero de ajedrez
 */
export function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map(row => [...row]);
}

/**
 * Clona profundamente el estado del juego
 */
export function cloneGameState(gameState: GameState): GameState {
  return {
    board: cloneBoard(gameState.board),
    currentPlayer: gameState.currentPlayer,
    moveHistory: [...gameState.moveHistory],
    isInCheck: gameState.isInCheck,
    isCheckmate: gameState.isCheckmate,
    isStalemate: gameState.isStalemate,
    castlingRights: { ...gameState.castlingRights },
    enPassantTarget: gameState.enPassantTarget ? { ...gameState.enPassantTarget } : undefined
  };
}

/**
 * Convierte posición algebraica (ej: "e4") a coordenadas numéricas
 */
export function algebraicToPosition(algebraic: string): Position | null {
  if (algebraic.length !== 2) return null;

  const col = algebraic.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(algebraic[1]);

  if (col < 0 || col > 7 || row < 0 || row > 7) return null;

  return { row, col };
}

/**
 * Convierte coordenadas numéricas a posición algebraica
 */
export function positionToAlgebraic(pos: Position): string {
  return String.fromCharCode('a'.charCodeAt(0) + pos.col) + (8 - pos.row).toString();
}

/**
 * Obtiene el símbolo Unicode de una pieza
 */
export function getPieceSymbol(piece: Piece): string {
  const symbols: Record<string, string> = {
    'king': '♔',
    'queen': '♕',
    'rook': '♖',
    'bishop': '♗',
    'knight': '♘',
    'pawn': '♙'
  };

  return symbols[piece.type] || '?';
}

/**
 * Obtiene el nombre de una pieza en español
 */
export function getPieceName(piece: Piece): string {
  const names: Record<string, string> = {
    'king': 'Rey',
    'queen': 'Reina',
    'rook': 'Torre',
    'bishop': 'Alfil',
    'knight': 'Caballo',
    'pawn': 'Peón'
  };

  return names[piece.type] || 'Pieza desconocida';
}

/**
 * Calcula la diferencia de material entre jugadores
 */
export function calculateMaterialDifference(gameState: GameState): { white: number; black: number } {
  const pieceValues = {
    'pawn': 1,
    'knight': 3,
    'bishop': 3,
    'rook': 5,
    'queen': 9,
    'king': 0 // El rey no cuenta para el material
  };

  let whiteMaterial = 0;
  let blackMaterial = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece) {
        const value = pieceValues[piece.type];
        if (piece.color === 'white') {
          whiteMaterial += value;
        } else {
          blackMaterial += value;
        }
      }
    }
  }

  return { white: whiteMaterial, black: blackMaterial };
}

/**
 * Verifica si el juego ha terminado
 */
export function isGameOver(gameState: GameState): boolean {
  return gameState.isCheckmate || gameState.isStalemate;
}

/**
 * Obtiene el resultado del juego como texto
 */
export function getGameResult(gameState: GameState): string {
  if (gameState.isCheckmate) {
    return `Jaque mate - ${gameState.currentPlayer === 'white' ? 'Negras' : 'Blancas'} ganan`;
  }
  if (gameState.isStalemate) {
    return 'Tablas por ahogado';
  }
  return 'Partida en progreso';
}

/**
 * Cuenta el número de piezas de cada tipo en el tablero
 */
export function countPieces(gameState: GameState): Record<string, { white: number; black: number }> {
  const counts = {
    pawn: { white: 0, black: 0 },
    knight: { white: 0, black: 0 },
    bishop: { white: 0, black: 0 },
    rook: { white: 0, black: 0 },
    queen: { white: 0, black: 0 },
    king: { white: 0, black: 0 }
  };

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece) {
        counts[piece.type][piece.color]++;
      }
    }
  }

  return counts;
}
