import type { Position, Piece, Color, GameState } from '../../types/chess';
import { isValidPosition, getPieceAt, isOpponentPiece } from '../game-logic';

/**
 * Obtiene todos los movimientos posibles para un peón
 */
export function getPawnMoves(board: (Piece | null)[][], pos: Position, color: Color, gameState: GameState): Position[] {
  const moves: Position[] = [];
  const direction = color === 'white' ? -1 : 1; // Blancas van hacia arriba (-1), negras hacia abajo (+1)
  const startRow = color === 'white' ? 6 : 1;

  // Movimiento hacia adelante
  const oneForward = { row: pos.row + direction, col: pos.col };
  if (isValidPosition(oneForward) && !getPieceAt(board, oneForward)) {
    moves.push(oneForward);

    // Movimiento inicial doble
    if (pos.row === startRow) {
      const twoForward = { row: pos.row + (direction * 2), col: pos.col };
      if (isValidPosition(twoForward) && !getPieceAt(board, twoForward)) {
        moves.push(twoForward);
      }
    }
  }

  // Capturas diagonales
  const captureLeft = { row: pos.row + direction, col: pos.col - 1 };
  const captureRight = { row: pos.row + direction, col: pos.col + 1 };

  // Captura normal izquierda
  if (isValidPosition(captureLeft) && isOpponentPiece(board, captureLeft, color)) {
    moves.push(captureLeft);
  }

  // Captura normal derecha
  if (isValidPosition(captureRight) && isOpponentPiece(board, captureRight, color)) {
    moves.push(captureRight);
  }

  // En passant
  if (gameState.enPassantTarget) {
    if (gameState.enPassantTarget.row === pos.row + direction) {
      if (gameState.enPassantTarget.col === pos.col - 1 || gameState.enPassantTarget.col === pos.col + 1) {
        // Verificar que el objetivo de en passant es válido
        const enPassantCapture = gameState.enPassantTarget;
        moves.push(enPassantCapture);
      }
    }
  }

  return moves;
}
