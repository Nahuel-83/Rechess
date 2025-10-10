import type { Position, Piece, GameState } from '../types/chess';
import { isValidPosition, getPieceAt, isOpponentPiece, isSameColorPiece } from './chess-utils';

/**
 * Validador de movimientos de ajedrez
 * Contiene toda la lógica para validar si un movimiento es legal
 */

/**
 * Valida si un movimiento es legal según las reglas del ajedrez
 */
export function isValidMove(gameState: GameState, from: Position, to: Position): boolean {
  const piece = getPieceAt(gameState.board, from);

  if (!piece || piece.color !== gameState.currentPlayer) {
    return false;
  }

  // Verificar que no se capture una pieza propia
  const targetPiece = getPieceAt(gameState.board, to);
  if (targetPiece && isSameColorPiece(gameState.board, to, piece.color)) {
    return false;
  }

  // Obtener movimientos posibles para esta pieza
  const possibleMoves = getPossibleMovesForPiece(gameState.board, from, gameState);

  // Verificar si el movimiento destino está en la lista de movimientos posibles
  return possibleMoves.some(move => move.row === to.row && move.col === to.col);
}

/**
 * Obtiene todos los movimientos posibles para una pieza en una posición dada
 */
export function getPossibleMovesForPiece(board: (Piece | null)[][], pos: Position, gameState: GameState): Position[] {
  const piece = getPieceAt(board, pos);

  if (!piece) return [];

  // Importar dinámicamente para evitar dependencia circular
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, pos, piece.color, gameState);
    case 'rook':
      return getRookMoves(board, pos, piece.color);
    case 'bishop':
      return getBishopMoves(board, pos, piece.color);
    case 'queen':
      return getQueenMoves(board, pos, piece.color);
    case 'knight':
      return getKnightMoves(board, pos, piece.color);
    case 'king':
      return getKingMoves(board, pos, piece.color, gameState);
    default:
      return [];
  }
}

/**
 * Obtiene movimientos de peón
 */
function getPawnMoves(board: (Piece | null)[][], pos: Position, color: 'white' | 'black', gameState: GameState): Position[] {
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
        moves.push(gameState.enPassantTarget);
      }
    }
  }

  return moves;
}

/**
 * Obtiene movimientos de torre
 */
function getRookMoves(board: (Piece | null)[][], pos: Position, color: 'white' | 'black'): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: 0, col: 1 },   // Derecha
    { row: 0, col: -1 },  // Izquierda
    { row: 1, col: 0 },   // Abajo
    { row: -1, col: 0 }   // Arriba
  ];

  for (const direction of directions) {
    let currentPos = { row: pos.row + direction.row, col: pos.col + direction.col };

    while (isValidPosition(currentPos)) {
      const pieceAt = getPieceAt(board, currentPos);

      if (!pieceAt) {
        moves.push({ ...currentPos });
      } else {
        if (isOpponentPiece(board, currentPos, color)) {
          moves.push({ ...currentPos });
        }
        break;
      }

      currentPos.row += direction.row;
      currentPos.col += direction.col;
    }
  }

  return moves;
}

/**
 * Obtiene movimientos de alfil
 */
function getBishopMoves(board: (Piece | null)[][], pos: Position, color: 'white' | 'black'): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: 1, col: 1 },   // Diagonal abajo-derecha
    { row: 1, col: -1 },  // Diagonal abajo-izquierda
    { row: -1, col: 1 },  // Diagonal arriba-derecha
    { row: -1, col: -1 }  // Diagonal arriba-izquierda
  ];

  for (const direction of directions) {
    let currentPos = { row: pos.row + direction.row, col: pos.col + direction.col };

    while (isValidPosition(currentPos)) {
      const pieceAt = getPieceAt(board, currentPos);

      if (!pieceAt) {
        moves.push({ ...currentPos });
      } else {
        if (isOpponentPiece(board, currentPos, color)) {
          moves.push({ ...currentPos });
        }
        break;
      }

      currentPos.row += direction.row;
      currentPos.col += direction.col;
    }
  }

  return moves;
}

/**
 * Obtiene movimientos de reina
 */
function getQueenMoves(board: (Piece | null)[][], pos: Position, color: 'white' | 'black'): Position[] {
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

    while (isValidPosition(currentPos)) {
      const pieceAt = getPieceAt(board, currentPos);

      if (!pieceAt) {
        moves.push({ ...currentPos });
      } else {
        if (isOpponentPiece(board, currentPos, color)) {
          moves.push({ ...currentPos });
        }
        break;
      }

      currentPos.row += direction.row;
      currentPos.col += direction.col;
    }
  }

  return moves;
}

/**
 * Obtiene movimientos de caballo
 */
function getKnightMoves(board: (Piece | null)[][], pos: Position, color: 'white' | 'black'): Position[] {
  const moves: Position[] = [];
  const knightMoves = [
    { row: -2, col: -1 }, { row: -2, col: 1 },
    { row: -1, col: -2 }, { row: -1, col: 2 },
    { row: 1, col: -2 },  { row: 1, col: 2 },
    { row: 2, col: -1 },  { row: 2, col: 1 }
  ];

  for (const move of knightMoves) {
    const newPos = { row: pos.row + move.row, col: pos.col + move.col };

    if (isValidPosition(newPos)) {
      const pieceAt = getPieceAt(board, newPos);

      if (!pieceAt || isOpponentPiece(board, newPos, color)) {
        moves.push({ ...newPos });
      }
    }
  }

  return moves;
}

/**
 * Obtiene movimientos de rey
 */
function getKingMoves(board: (Piece | null)[][], pos: Position, color: 'white' | 'black', gameState: GameState): Position[] {
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
function canCastle(board: (Piece | null)[][], kingPos: Position, color: 'white' | 'black', side: 'king' | 'queen', gameState: GameState): boolean {
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
function isPositionAttacked(board: (Piece | null)[][], pos: Position, byColor: 'white' | 'black'): boolean {
  // Verificar ataques de peones
  const pawnDirection = byColor === 'white' ? 1 : -1;
  const pawnAttacks = [
    { row: pos.row - pawnDirection, col: pos.col - 1 },
    { row: pos.row - pawnDirection, col: pos.col + 1 }
  ];

  for (const attack of pawnAttacks) {
    if (isValidPosition(attack)) {
      const piece = getPieceAt(board, attack);
      if (piece && piece.type === 'pawn' && piece.color === byColor) {
        return true;
      }
    }
  }

  // Verificar ataques de otras piezas
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor && !(piece.type === 'pawn' && piece.type === 'pawn')) {
        const moves = getPossibleMovesForPiece(board, { row, col }, {
          board,
          currentPlayer: byColor,
          moveHistory: [],
          isInCheck: false,
          isCheckmate: false,
          isStalemate: false,
          castlingRights: {
            whiteKingSide: false,
            whiteQueenSide: false,
            blackKingSide: false,
            blackQueenSide: false
          }
        });

        if (moves.some(move => move.row === pos.row && move.col === pos.col)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Encuentra la posición del rey de un color específico
 */
function findKingPosition(board: (Piece | null)[][], color: 'white' | 'black'): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

/**
 * Verifica si el rey de un color específico está en jaque
 */
export function isKingInCheck(board: (Piece | null)[][], kingColor: 'white' | 'black'): boolean {
  const kingPos = findKingPosition(board, kingColor);
  if (!kingPos) return false;

  const opponentColor = kingColor === 'white' ? 'black' : 'white';
  return isPositionAttacked(board, kingPos, opponentColor);
}

/**
 * Verifica si un movimiento dejaría al rey propio en jaque
 */
export function wouldMoveLeaveKingInCheck(
  board: (Piece | null)[][],
  from: Position,
  to: Position,
  playerColor: 'white' | 'black'
): boolean {
  // Crear una copia temporal del tablero con el movimiento aplicado
  const tempBoard = board.map(row => [...row]);
  const piece = tempBoard[from.row][from.col];

  if (!piece) return false;

  // Aplicar el movimiento temporalmente
  tempBoard[to.row][to.col] = piece;
  tempBoard[from.row][from.col] = null;

  // Verificar si el rey propio queda en jaque
  return isKingInCheck(tempBoard, playerColor);
}

/**
 * Verifica si hay jaque mate para un color específico
 */
export function isCheckmate(board: (Piece | null)[][], playerColor: 'white' | 'black'): boolean {
  // Primero verificar si está en jaque
  if (!isKingInCheck(board, playerColor)) {
    return false;
  }

  // Verificar si hay algún movimiento legal que salve al rey
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === playerColor) {
        const from = { row, col };
        const possibleMoves = getPossibleMovesForPiece(board, from, {
          board,
          currentPlayer: playerColor,
          moveHistory: [],
          isInCheck: true,
          isCheckmate: false,
          isStalemate: false,
          castlingRights: {
            whiteKingSide: false,
            whiteQueenSide: false,
            blackKingSide: false,
            blackQueenSide: false
          }
        });

        // Verificar si algún movimiento salva al rey
        for (const move of possibleMoves) {
          if (!wouldMoveLeaveKingInCheck(board, from, move, playerColor)) {
            return false; // Hay un movimiento legal que salva al rey
          }
        }
      }
    }
  }

  return true; // No hay movimientos legales, es jaque mate
}

/**
 * Verifica si hay tablas por ahogado (rey no puede moverse y no está en jaque)
 */
export function isStalemate(board: (Piece | null)[][], playerColor: 'white' | 'black'): boolean {
  // Verificar que no esté en jaque
  if (isKingInCheck(board, playerColor)) {
    return false;
  }

  // Verificar si el rey puede moverse
  const kingPos = findKingPosition(board, playerColor);
  if (!kingPos) return false;

  const kingMoves = getKingMoves(board, kingPos, playerColor, {
    board,
    currentPlayer: playerColor,
    moveHistory: [],
    isInCheck: false,
    isCheckmate: false,
    isStalemate: false,
    castlingRights: {
      whiteKingSide: false,
      whiteQueenSide: false,
      blackKingSide: false,
      blackQueenSide: false
    }
  });

  // Verificar si el rey puede moverse a alguna posición segura
  for (const move of kingMoves) {
    if (!wouldMoveLeaveKingInCheck(board, kingPos, move, playerColor)) {
      return false; // El rey puede moverse
    }
  }

  // Verificar si alguna otra pieza puede moverse
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === playerColor && !(piece.type === 'king')) {
        const from = { row, col };
        const possibleMoves = getPossibleMovesForPiece(board, from, {
          board,
          currentPlayer: playerColor,
          moveHistory: [],
          isInCheck: false,
          isCheckmate: false,
          isStalemate: false,
          castlingRights: {
            whiteKingSide: false,
            whiteQueenSide: false,
            blackKingSide: false,
            blackQueenSide: false
          }
        });

        // Verificar si alguna pieza puede moverse
        for (const move of possibleMoves) {
          if (!wouldMoveLeaveKingInCheck(board, from, move, playerColor)) {
            return false; // Hay un movimiento legal disponible
          }
        }
      }
    }
  }

  return true; // Es ahogado (rey no puede moverse y ninguna pieza puede moverse)
}

/**
 * Analiza completamente el estado del juego
 */
export function analyzeGameState(gameState: GameState): {
  isInCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  gameResult: 'white-wins' | 'black-wins' | 'draw' | 'ongoing';
  resultMessage: string;
} {
  const currentPlayer = gameState.currentPlayer;
  const isInCheck = isKingInCheck(gameState.board, currentPlayer);
  const isCheckmateResult = isInCheck && isCheckmate(gameState.board, currentPlayer);
  const isStalemateResult = !isInCheck && isStalemate(gameState.board, currentPlayer);

  let gameResult: 'white-wins' | 'black-wins' | 'draw' | 'ongoing' = 'ongoing';
  let resultMessage = '';

  if (isCheckmateResult) {
    gameResult = currentPlayer === 'white' ? 'black-wins' : 'white-wins';
    resultMessage = `¡Jaque mate! ${currentPlayer === 'white' ? 'Negras' : 'Blancas'} ganan`;
  } else if (isStalemateResult) {
    gameResult = 'draw';
    resultMessage = '¡Tablas por ahogado! Ningún bando puede ganar';
  } else if (isInCheck) {
    resultMessage = `¡Jaque! El rey de ${currentPlayer === 'white' ? 'blancas' : 'negras'} está en peligro`;
  } else {
    resultMessage = `Turno de ${currentPlayer === 'white' ? 'blancas' : 'negras'}`;
  }

  return {
    isInCheck,
    isCheckmate: isCheckmateResult,
    isStalemate: isStalemateResult,
    gameResult,
    resultMessage
  };
}
