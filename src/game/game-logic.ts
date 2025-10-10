import type { Position, Piece, GameState, Color } from '../types/chess';
import { INITIAL_GAME_STATE } from '../types/chess';

// Importar funciones específicas de movimiento
import { getPawnMoves } from './piece-movements/pawn';
import { getRookMoves } from './piece-movements/rook';
import { getKnightMoves } from './piece-movements/knight';
import { getBishopMoves } from './piece-movements/bishop';
import { getQueenMoves } from './piece-movements/queen';
import { getKingMoves } from './piece-movements/king';

/**
 * Verifica si una posición está dentro del tablero
 */
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

/**
 * Obtiene una pieza del tablero en una posición específica
 */
export function getPieceAt(board: (Piece | null)[][], pos: Position): Piece | null {
  if (!isValidPosition(pos)) return null;
  return board[pos.row][pos.col];
}

/**
 * Coloca una pieza en el tablero en una posición específica
 */
export function setPieceAt(board: (Piece | null)[][], pos: Position, piece: Piece | null): void {
  if (isValidPosition(pos)) {
    board[pos.row][pos.col] = piece;
  }
}

/**
 * Crea una copia profunda del tablero
 */
export function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map(row => [...row]);
}

/**
 * Crea una copia profunda del estado del juego
 */
export function cloneGameState(gameState: GameState): GameState {
  return {
    ...gameState,
    board: cloneBoard(gameState.board),
    moveHistory: [...gameState.moveHistory],
    castlingRights: { ...gameState.castlingRights }
  };
}

/**
 * Verifica si una posición está ocupada por una pieza del color opuesto
 */
export function isOpponentPiece(board: (Piece | null)[][], pos: Position, color: Color): boolean {
  const piece = getPieceAt(board, pos);
  return piece !== null && piece.color !== color;
}

/**
 * Verifica si una posición está ocupada por una pieza del mismo color
 */
export function isSameColorPiece(board: (Piece | null)[][], pos: Position, color: Color): boolean {
  const piece = getPieceAt(board, pos);
  return piece !== null && piece.color === color;
}

/**
 * Convierte coordenadas de ajedrez (ej: 'e4') a posición numérica
 */
export function algebraicToPosition(algebraic: string): Position {
  const col = algebraic.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(algebraic[1]);
  return { row, col };
}

/**
 * Convierte posición numérica a coordenadas de ajedrez
 */
export function positionToAlgebraic(pos: Position): string {
  const col = String.fromCharCode('a'.charCodeAt(0) + pos.col);
  const row = (8 - pos.row).toString();
  return col + row;
}

/**
 * Obtiene todas las posiciones posibles para una pieza específica
 */
export function getPossibleMovesForPiece(board: (Piece | null)[][], pos: Position, gameState: GameState): Position[] {
  const piece = getPieceAt(board, pos);
  if (!piece) return [];

  const moves: Position[] = [];

  switch (piece.type) {
    case 'pawn':
      moves.push(...getPawnMoves(board, pos, piece.color, gameState));
      break;
    case 'rook':
      moves.push(...getRookMoves(board, pos, piece.color));
      break;
    case 'knight':
      moves.push(...getKnightMoves(board, pos, piece.color));
      break;
    case 'bishop':
      moves.push(...getBishopMoves(board, pos, piece.color));
      break;
    case 'queen':
      moves.push(...getQueenMoves(board, pos, piece.color));
      break;
    case 'king':
      moves.push(...getKingMoves(board, pos, piece.color, gameState));
      break;
  }

  return moves;
}

/**
 * Verifica si el rey está en jaque
 */
export function isKingInCheck(board: (Piece | null)[][], color: Color): boolean {
  // Encontrar la posición del rey
  let kingPos: Position | null = null;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        kingPos = { row, col };
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return false;

  // Verificar si alguna pieza enemiga puede atacar al rey
  const opponentColor: Color = color === 'white' ? 'black' : 'white';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        const moves = getPossibleMovesForPiece(board, { row, col }, {
          ...INITIAL_GAME_STATE,
          board,
          currentPlayer: opponentColor
        });
        if (moves.some(move => move.row === kingPos!.row && move.col === kingPos!.col)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Obtiene movimientos válidos considerando jaque
 */
export function getValidMoves(board: (Piece | null)[][], pos: Position, gameState: GameState): Position[] {
  const piece = getPieceAt(board, pos);
  if (!piece || piece.color !== gameState.currentPlayer) return [];

  const possibleMoves = getPossibleMovesForPiece(board, pos, gameState);
  return possibleMoves.filter(move => {
    // Crear tablero temporal para simular el movimiento
    const tempBoard = cloneBoard(board);

    // Hacer el movimiento
    setPieceAt(tempBoard, move, piece);
    setPieceAt(tempBoard, pos, null);

    // Verificar si el rey queda en jaque después del movimiento
    return !isKingInCheck(tempBoard, piece.color);
  });
}
