import type { Position, Piece, Color } from '../../types/chess';
import { isValidPosition, getPieceAt, isOpponentPiece } from '../game-logic';

/**
 * Obtiene todos los movimientos posibles para un caballo
 */
export function getKnightMoves(board: (Piece | null)[][], pos: Position, color: Color): Position[] {
  const moves: Position[] = [];
  const knightMoves = [
    { row: -2, col: -1 },
    { row: -2, col: 1 },
    { row: -1, col: -2 },
    { row: -1, col: 2 },
    { row: 1, col: -2 },
    { row: 1, col: 2 },
    { row: 2, col: -1 },
    { row: 2, col: 1 }
  ];

  for (const move of knightMoves) {
    const newPos = { row: pos.row + move.row, col: pos.col + move.col };

    if (isValidPosition(newPos)) {
      const pieceAt = getPieceAt(board, newPos);

      if (!pieceAt || isOpponentPiece(board, newPos, color)) {
        moves.push(newPos);
      }
    }
  }

  return moves;
}
