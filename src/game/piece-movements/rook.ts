import type { Position, Piece, Color } from '../../types/chess';
import { isValidPosition, getPieceAt, isOpponentPiece } from '../game-logic';

/**
 * Obtiene todos los movimientos posibles para una torre
 * Una torre se mueve en líneas horizontales y verticales cualquier número de casillas
 */
export function getRookMoves(board: (Piece | null)[][], pos: Position, color: Color): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: 0, col: 1 },   // Derecha
    { row: 0, col: -1 },  // Izquierda
    { row: 1, col: 0 },   // Abajo
    { row: -1, col: 0 }   // Arriba
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
