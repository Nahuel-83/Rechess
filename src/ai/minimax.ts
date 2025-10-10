import type { Position, GameState, Color } from '../types/chess';
import { cloneGameState, isKingInCheck, getValidMoves, setPieceAt, getPieceAt } from '../game/game-logic';

/**
 * Evalúa la posición del tablero desde la perspectiva del color dado
 */
const PAWN_TABLE_WHITE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const PAWN_TABLE_BLACK = PAWN_TABLE_WHITE.slice().reverse();

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_MIDDLE_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

const KING_END_TABLE = [
  [-50,-40,-30,-20,-20,-30,-40,-50],
  [-30,-20,-10,  0,  0,-10,-20,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-30,  0,  0,  0,  0,-30,-30],
  [-50,-30,-30,-30,-30,-30,-30,-50]
];

/**
 * Evalúa la posición del tablero desde la perspectiva del color dado
 */
export function evaluatePosition(gameState: GameState, color: Color): number {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece) {
        const pieceValue = getPieceValue(piece.type);
        const positionBonus = getPositionBonus(piece.type, { row, col }, piece.color, gameState);

        if (piece.color === color) {
          score += pieceValue + positionBonus;
        } else {
          score -= pieceValue + positionBonus;
        }
      }
    }
  }

  return score;
}

/**
 * Obtiene el valor relativo de una pieza
 */
function getPieceValue(pieceType: string): number {
  const values: Record<string, number> = {
    'pawn': 100,
    'knight': 320,
    'bishop': 330,
    'rook': 500,
    'queen': 900,
    'king': 20000
  };

  return values[pieceType] || 0;
}

/**
 * Obtiene bonus de posición para piezas específicas usando tablas estándar
 */
function getPositionBonus(pieceType: string, pos: Position, color: Color, gameState: GameState): number {
  let table: number[][];

  switch (pieceType) {
    case 'pawn':
      table = color === 'white' ? PAWN_TABLE_WHITE : PAWN_TABLE_BLACK;
      break;
    case 'knight':
      table = KNIGHT_TABLE;
      break;
    case 'bishop':
      table = BISHOP_TABLE;
      break;
    case 'rook':
      table = ROOK_TABLE;
      break;
    case 'queen':
      table = QUEEN_TABLE;
      break;
    case 'king':
      table = getGamePhase(gameState) === 'endgame' ? KING_END_TABLE : KING_MIDDLE_TABLE;
      break;
    default:
      return 0;
  }

  return table[pos.row][pos.col];
}

/**
 * Determina la fase del juego
 */
function getGamePhase(gameState: GameState): 'opening' | 'middlegame' | 'endgame' {
  const pieceCount = gameState.board.flat().filter(piece => piece !== null).length;

  if (pieceCount > 24) return 'opening';
  if (pieceCount > 12) return 'middlegame';
  return 'endgame';
}

/**
 * Implementación del algoritmo Minimax con poda alfa-beta
 */
export function minimax(
  gameState: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean
): number {
  // Caso base: profundidad máxima alcanzada o juego terminado
  if (depth === 0 || isGameOver(gameState)) {
    return evaluatePosition(gameState, maximizingPlayer ? gameState.currentPlayer : getOpponentColor(gameState.currentPlayer));
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;

    const moves = getAllValidMoves(gameState);
    for (const move of moves) {
      const newGameState = makeMove(gameState, move);
      const evaluation = minimax(newGameState, depth - 1, alpha, beta, false);

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);

      if (beta <= alpha) {
        break; // Poda alfa-beta
      }
    }

    return maxEval;
  } else {
    let minEval = Infinity;

    const moves = getAllValidMoves(gameState);
    for (const move of moves) {
      const newGameState = makeMove(gameState, move);
      const evaluation = minimax(newGameState, depth - 1, alpha, beta, true);

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);

      if (beta <= alpha) {
        break; // Poda alfa-beta
      }
    }

    return minEval;
  }
}

/**
 * Obtiene el mejor movimiento usando minimax
 */
export function getBestMove(gameState: GameState, depth: number): any {
  let bestMove = null;
  let bestValue = -Infinity;

  const moves = getAllValidMoves(gameState);

  for (const move of moves) {
    const newGameState = makeMove(gameState, move);
    const moveValue = minimax(newGameState, depth - 1, -Infinity, Infinity, false);

    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Obtiene todos los movimientos válidos para el jugador actual
 */
function getAllValidMoves(gameState: GameState): any[] {
  const moves: any[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === gameState.currentPlayer) {
        const validMoves = getValidMoves(gameState.board, { row, col }, gameState);
        for (const move of validMoves) {
          moves.push({
            from: { row, col },
            to: move,
            piece: piece
          });
        }
      }
    }
  }

  return moves;
}

/**
 * Crea una nueva posición aplicando un movimiento
 */
function makeMove(gameState: GameState, move: any): GameState {
  const newGameState = cloneGameState(gameState);

  // Mover pieza
  const piece = getPieceAt(newGameState.board, move.from);
  if (piece) {
    setPieceAt(newGameState.board, move.to, piece);
    setPieceAt(newGameState.board, move.from, null);

    // Cambiar turno
    newGameState.currentPlayer = getOpponentColor(newGameState.currentPlayer);

    // Actualizar estado de jaque
    newGameState.isInCheck = isKingInCheck(newGameState.board, newGameState.currentPlayer);
  }

  return newGameState;
}

/**
 * Verifica si el juego ha terminado
 */
function isGameOver(gameState: GameState): boolean {
  return gameState.isCheckmate || gameState.isStalemate || getAllValidMoves(gameState).length === 0;
}

/**
 * Obtiene el color contrario
 */
function getOpponentColor(color: Color): Color {
  return color === 'white' ? 'black' : 'white';
}
