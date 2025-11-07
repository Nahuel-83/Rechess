import type { Position, Piece, Color, GameState } from '../../types/chess';
import { isValidPosition, getPieceAt, isOpponentPiece } from '../game-logic';

/**
 * Obtiene todos los movimientos posibles para un rey
 * Un rey se mueve una casilla en cualquier dirección y puede hacer enroque
 */
export function getKingMoves(board: (Piece | null)[][], pos: Position, color: Color, gameState: GameState): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 },                       { row: 0, col: 1 },
    { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
  ];

  // Movimientos básicos del rey (una casilla en cualquier dirección)
  for (const direction of directions) {
    const newPos = { row: pos.row + direction.row, col: pos.col + direction.col };

    if (isValidPosition(newPos)) {
      const pieceAt = getPieceAt(board, newPos);

      // Puede moverse a casillas vacías o capturar piezas enemigas
      if (!pieceAt || isOpponentPiece(board, newPos, color)) {
        moves.push({ ...newPos });
      }
    }
  }

  // Enroque corto (rey-side)
  if (canCastle(board, pos, color, 'king', gameState)) {
    moves.push({ row: pos.row, col: pos.col + 2 });
  }

  // Enroque largo (queen-side)
  if (canCastle(board, pos, color, 'queen', gameState)) {
    moves.push({ row: pos.row, col: pos.col - 2 });
  }

  return moves;
}

/**
 * Verifica si el rey puede hacer enroque
 */
function canCastle(board: (Piece | null)[][], kingPos: Position, color: Color, side: 'king' | 'queen', gameState: GameState): boolean {
  const row = color === 'white' ? 7 : 0;
  const kingSide = side === 'king';

  // Verificar derechos de enroque
  if (kingSide) {
    if (color === 'white' && !gameState.castlingRights.whiteKingSide) return false;
    if (color === 'black' && !gameState.castlingRights.blackKingSide) return false;
  } else {
    if (color === 'white' && !gameState.castlingRights.whiteQueenSide) return false;
    if (color === 'black' && !gameState.castlingRights.blackQueenSide) return false;
  }

  // Verificar que el rey no esté en jaque actualmente
  if (gameState.isInCheck) return false;

  // Verificar que las casillas entre rey y torre estén vacías
  const rookCol = kingSide ? 7 : 0;
  const direction = kingSide ? 1 : -1;

  for (let col = kingPos.col + direction; col !== rookCol; col += direction) {
    if (getPieceAt(board, { row, col })) return false;
  }

  // Verificar que la torre existe y no se ha movido
  const rook = getPieceAt(board, { row, col: rookCol });
  if (!rook || rook.type !== 'rook' || rook.color !== color) return false;

  // Verificar que las casillas por las que pasa el rey no estén atacadas
  const kingPath = [
    { row, col: kingPos.col + direction },
    { row, col: kingPos.col + (direction * 2) }
  ];

  for (const pos of kingPath) {
    if (isPositionAttacked(board, pos, color === 'white' ? 'black' : 'white')) {
      return false;
    }
  }

  return true;
}

/**
 * Verifica si una posición está siendo atacada por el color contrario
 */
function isPositionAttacked(board: (Piece | null)[][], pos: Position, byColor: Color): boolean {
  // Verificar si alguna pieza del color contrario puede atacar esta posición
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        // Crear una copia temporal del tablero para obtener movimientos
        const tempBoard = board.map(r => [...r]);

        // Obtener movimientos posibles para esta pieza usando funciones directas
        let moves: Position[] = [];
        switch (piece.type) {
          case 'pawn':
            // Para peones necesitamos usar la función auxiliar (sin en passant para ataques)
            moves = getPawnMovesForAttack(tempBoard, { row, col }, piece.color);
            break;
          case 'rook':
            moves = getRookMoves(tempBoard, { row, col }, piece.color);
            break;
          case 'bishop':
            moves = getBishopMoves(tempBoard, { row, col }, piece.color);
            break;
          case 'queen':
            moves = getQueenMoves(tempBoard, { row, col }, piece.color);
            break;
          case 'knight':
            moves = getKnightMoves(tempBoard, { row, col }, piece.color);
            break;
          case 'king':
            // Para el rey, calcular movimientos básicos directamente sin enroque
            moves = getBasicKingMoves(tempBoard, { row, col }, piece.color);
            break;
        }

        if (moves.some(move => move.row === pos.row && move.col === pos.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Obtiene movimientos básicos del rey (sin enroque) para evitar recursión
 */
function getBasicKingMoves(board: (Piece | null)[][], pos: Position, color: Color): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 },                       { row: 0, col: 1 },
    { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
  ];

  for (const direction of directions) {
    const newPos = { row: pos.row + direction.row, col: pos.col + direction.col };

    if (isValidPosition(newPos)) {
      const pieceAt = getPieceAt(board, newPos);

      // Puede moverse a casillas vacías o capturar piezas enemigas
      if (!pieceAt || isOpponentPiece(board, newPos, color)) {
        moves.push({ ...newPos });
      }
    }
  }

  return moves;
}

// Necesitamos importar estas funciones para la detección de ataques
import { getRookMoves } from './rook';
import { getKnightMoves } from './knight';
import { getBishopMoves } from './bishop';
import { getQueenMoves } from './queen';

// Función auxiliar para obtener movimientos de ataque de peón (sin considerar en passant)
function getPawnMovesForAttack(board: (Piece | null)[][], pos: Position, color: Color): Position[] {
  const moves: Position[] = [];
  const direction = color === 'white' ? -1 : 1;

  // Solo capturas diagonales
  const captureLeft = { row: pos.row + direction, col: pos.col - 1 };
  const captureRight = { row: pos.row + direction, col: pos.col + 1 };

  if (isValidPosition(captureLeft) && isOpponentPiece(board, captureLeft, color)) {
    moves.push(captureLeft);
  }

  if (isValidPosition(captureRight) && isOpponentPiece(board, captureRight, color)) {
    moves.push(captureRight);
  }

  return moves;
}
