/**
 * Test Utilities
 * 
 * Shared utilities and helpers for testing across the application.
 */

import { Chess } from 'chess.js';
import type { PieceColor, PieceType } from '@/types/chess';

/**
 * Creates a Chess instance with a specific position
 */
export function createChessInstance(fen?: string): Chess {
  const chess = new Chess();
  if (fen) {
    chess.load(fen);
  }
  return chess;
}

/**
 * Common test FEN positions
 */
export const TEST_POSITIONS = {
  // Starting position
  INITIAL: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  
  // Checkmate positions
  SCHOLARS_MATE: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4',
  BACK_RANK_MATE: 'r5rk/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
  
  // Stalemate
  STALEMATE: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1',
  
  // En passant
  EN_PASSANT: 'rnbqkbnr/ppp2ppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3',
  
  // Castling
  CASTLING_KINGSIDE: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
  CASTLING_QUEENSIDE: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/8/PPPPNPPP/RNBQKB1R w KQkq - 0 1',
  
  // Promotion
  PROMOTION: '8/4P3/8/8/8/8/8/4k2K w - - 0 1',
  
  // Insufficient material
  INSUFFICIENT_MATERIAL_KK: '8/8/8/8/8/4k3/8/4K3 w - - 0 1',
  INSUFFICIENT_MATERIAL_KBK: '8/8/8/8/8/4kb2/8/4K3 w - - 0 1',
  INSUFFICIENT_MATERIAL_KNK: '8/8/8/8/8/4kn2/8/4K3 w - - 0 1',
  
  // Complex middlegame
  MIDDLEGAME: 'r1bq1rk1/pp2bppp/2n1pn2/3p4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 9',
  
  // Endgame
  ENDGAME: '8/5pk1/6p1/8/8/6P1/5PK1/8 w - - 0 1',
};

/**
 * Validates that a move string is in UCI format (e.g., "e2e4")
 */
export function isValidUCIMove(move: string): boolean {
  const uciPattern = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
  return uciPattern.test(move);
}

/**
 * Converts a move from SAN to UCI format using a Chess instance
 */
export function sanToUci(chess: Chess, san: string): string | null {
  try {
    const moves = chess.moves({ verbose: true });
    const move = moves.find(m => m.san === san);
    return move ? `${move.from}${move.to}${move.promotion || ''}` : null;
  } catch {
    return null;
  }
}

/**
 * Gets all legal moves in UCI format
 */
export function getLegalMovesUCI(chess: Chess): string[] {
  const moves = chess.moves({ verbose: true });
  return moves.map(m => `${m.from}${m.to}${m.promotion || ''}`);
}

/**
 * Counts pieces on the board
 */
export function countPieces(chess: Chess): {
  total: number;
  white: number;
  black: number;
  queens: number;
  rooks: number;
  bishops: number;
  knights: number;
  pawns: number;
} {
  const board = chess.board();
  let total = 0;
  let white = 0;
  let black = 0;
  let queens = 0;
  let rooks = 0;
  let bishops = 0;
  let knights = 0;
  let pawns = 0;

  board.forEach(row => {
    row.forEach(square => {
      if (square) {
        total++;
        if (square.color === 'w') white++;
        else black++;
        
        switch (square.type) {
          case 'q': queens++; break;
          case 'r': rooks++; break;
          case 'b': bishops++; break;
          case 'n': knights++; break;
          case 'p': pawns++; break;
        }
      }
    });
  });

  return { total, white, black, queens, rooks, bishops, knights, pawns };
}

/**
 * Simulates a sequence of moves
 */
export function playMoves(chess: Chess, moves: string[]): boolean {
  for (const move of moves) {
    try {
      chess.move(move);
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Creates a mock AI response
 */
export function createMockAIResponse(move: string, options?: {
  confidence?: number;
  evaluation?: number;
  reasoning?: string;
  model?: string;
  thinkTime?: number;
}) {
  return {
    move,
    confidence: options?.confidence ?? 0.8,
    evaluation: options?.evaluation,
    reasoning: options?.reasoning,
    model: options?.model ?? 'test-model',
    thinkTime: options?.thinkTime ?? 100,
  };
}

/**
 * Waits for a specified amount of time (useful for async tests)
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a random legal move from a position
 */
export function getRandomLegalMove(chess: Chess): string {
  const moves = getLegalMovesUCI(chess);
  return moves[Math.floor(Math.random() * moves.length)];
}
