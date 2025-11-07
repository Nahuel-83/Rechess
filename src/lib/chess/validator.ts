// src/lib/chess/validator.ts
import { Move, Square, PieceColor, PieceType } from '@/types';
import { ChessEngine } from './engine';

export class MoveValidator {
  private engine: ChessEngine;

  constructor(engine: ChessEngine) {
    this.engine = engine;
  }

  // Validar movimiento básico
  isValidMove(from: Square, to: Square): boolean {
    const legalMoves = this.engine.getLegalMoves();
    const moveString = `${from.file}${from.rank}${to.file}${to.rank}`;

    return legalMoves.some(move => move.lan === moveString);
  }

  // Validar movimiento con promoción
  isValidMoveWithPromotion(from: Square, to: Square, promotion?: string): boolean {
    if (!promotion) {
      return this.isValidMove(from, to);
    }

    try {
      const testEngine = new ChessEngine(this.engine.getFen());
      return testEngine.makeMove(from, to, promotion as PieceType);
    } catch (error) {
      return false;
    }
  }

  // Obtener movimientos válidos para una pieza
  getValidMovesForPiece(square: Square): Square[] {
    const legalMoves = this.engine.getLegalMoves(square);
    return legalMoves.map(move => move.to);
  }

  // Verificar si el rey está en jaque
  isKingInCheck(color: PieceColor): boolean {
    return this.engine.isCheck() && this.engine.getGameState().turn === color;
  }

  // Verificar si el movimiento deja al rey en jaque
  doesMoveLeaveKingInCheck(from: Square, to: Square): boolean {
    try {
      const testEngine = new ChessEngine(this.engine.getFen());
      testEngine.makeMove(from, to);

      // Si después del movimiento nuestro rey está en jaque, el movimiento es inválido
      const gameState = testEngine.getGameState();
      return gameState.isCheck && gameState.turn === this.engine.getGameState().turn;
    } catch (error) {
      return true; // Si hay error, asumir que es inválido
    }
  }

  // Obtener todas las piezas de un color
  getPiecesOfColor(color: PieceColor): Square[] {
    const position = this.engine.getGameState().position;
    const squares: Square[] = [];

    Object.entries(position).forEach(([squareKey, piece]) => {
      if (piece && piece.color === color) {
        squares.push({
          file: squareKey[0],
          rank: parseInt(squareKey[1])
        });
      }
    });

    return squares;
  }

  // Verificar si hay movimientos legales disponibles
  hasLegalMoves(color: PieceColor): boolean {
    const pieces = this.getPiecesOfColor(color);

    return pieces.some(piece => {
      const validMoves = this.getValidMovesForPiece(piece);
      return validMoves.length > 0;
    });
  }
}
