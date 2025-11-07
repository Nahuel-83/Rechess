import type { Position, Piece, Color } from '../../types/chess';
import { isValidPosition, getPieceAt, isOpponentPiece } from '../game-logic';

/**
 * Obtiene todos los movimientos posibles para una reina
 * Una reina combina los movimientos de torre y alfil (8 direcciones)
 */
export function getQueenMoves(board: (Piece | null)[][], pos: Position, color: Color): Position[] {
  const moves: Position[] = [];
  const directions = [
    // Direcciones de torre (horizontales y verticales)
    { row: 0, col: 1 },   // Derecha
    { row: 0, col: -1 },  // Izquierda
    { row: 1, col: 0 },   // Abajo
    { row: -1, col: 0 },  // Arriba
    // Direcciones de alfil (diagonales)
    { row: 1, col: 1 },   // Diagonal abajo-derecha
    { row: 1, col: -1 },  // Diagonal abajo-izquierda
    { row: -1, col: 1 },  // Diagonal arriba-derecha
    { row: -1, col: -1 }  // Diagonal arriba-izquierda
  ];

  for (const direction of directions) {
    let currentPos = { row: pos.row + direction.row, col: pos.col + direction.col };

    // Continuar moviéndose en esta dirección hasta encontrar un obstáculo
    while (isValidPosition(currentPos)) {
      const pieceAt = getPieceAt(board, currentPos);

      if (!pieceAt) {
        // Casilla vacía, puede moverse aquí
        moves.push({ ...currentPos });
      } else {
        // Hay una pieza en esta casilla
        if (isOpponentPiece(board, currentPos, color)) {
          // Es una pieza enemiga, puede capturarla (y este será el último movimiento en esta dirección)
          moves.push({ ...currentPos });
        }
        // Si es pieza propia o enemiga, no puede continuar más allá
        break;
      }

      // Mover a la siguiente casilla en esta dirección
      currentPos.row += direction.row;
      currentPos.col += direction.col;
    }
  }

  return moves;
}
