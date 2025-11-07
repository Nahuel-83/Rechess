// src/lib/chess/engine.ts
import { Chess, Move as ChessJsMove, PieceSymbol, Square as ChessJsSquare } from 'chess.js';
import { ChessPiece, GameState, Move, PieceColor, PieceType, Square } from '@/types';

export class ChessEngine {
  private game: Chess;

  constructor(fen?: string) {
    this.game = fen ? new Chess(fen) : new Chess();
  }

  // Estado del juego
  getGameState(): GameState {
    return {
      fen: this.game.fen(),
      pgn: this.game.pgn(),
      turn: this.game.turn() as PieceColor,
      isGameOver: this.game.isGameOver(),
      isCheck: this.game.isCheck(),
      isCheckmate: this.game.isCheckmate(),
      isStalemate: this.game.isStalemate(),
      isDraw: this.game.isDraw(),
      isThreefoldRepetition: this.game.isThreefoldRepetition(),
      isInsufficientMaterial: this.game.isInsufficientMaterial(),
      winner: this.game.isCheckmate() ? (this.game.turn() === 'w' ? 'b' : 'w') as PieceColor : undefined,
      legalMoves: this.game.moves({ verbose: true }).map(move => move.lan),
      history: this.game.history({ verbose: true }).map(this.mapChessJsMoveToMove),
      position: this.mapPosition(),
      capturedPieces: this.getCapturedPieces()
    };
  }

  // Obtener movimientos legales
  getLegalMoves(square?: Square): Move[] {
    if (square) {
      const moves = this.game.moves({
        square: `${square.file}${square.rank}` as ChessJsSquare,
        verbose: true
      });
      return moves.map(this.mapChessJsMoveToMove);
    }
    const moves = this.game.moves({ verbose: true });
    return moves.map(this.mapChessJsMoveToMove);
  }

  // Realizar movimiento
  makeMove(from: Square, to: Square, promotion?: PieceType): boolean {
    try {
      const move = this.game.move({
        from: `${from.file}${from.rank}` as ChessJsSquare,
        to: `${to.file}${to.rank}` as ChessJsSquare,
        promotion: promotion as PieceSymbol
      });
      return !!move;
    } catch (error) {
      return false;
    }
  }

  // Deshacer último movimiento
  undoMove(): boolean {
    return this.game.undo() !== null;
  }

  // Cargar posición FEN
  loadFen(fen: string): boolean {
    try {
      this.game.load(fen);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Obtener pieza en posición
  getPiece(square: Square): ChessPiece | null {
    const piece = this.game.get(`${square.file}${square.rank}` as ChessJsSquare);
    if (!piece) return null;

    return {
      type: piece.type as PieceType,
      color: piece.color as PieceColor
    };
  }

  // Verificar si es jaque
  isCheck(): boolean {
    return this.game.isCheck();
  }

  // Verificar si es jaque mate
  isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  // Verificar si es tablas
  isDraw(): boolean {
    return this.game.isDraw();
  }

  // Verificar si es ahogado
  isStalemate(): boolean {
    return this.game.isStalemate();
  }

  // Verificar si hay repetición triple
  isThreefoldRepetition(): boolean {
    return this.game.isThreefoldRepetition();
  }

  // Verificar si hay material insuficiente
  isInsufficientMaterial(): boolean {
    return this.game.isInsufficientMaterial();
  }

  // Obtener historial de movimientos
  getHistory(): Move[] {
    return this.game.history({ verbose: true }).map(this.mapChessJsMoveToMove);
  }

  // Obtener posición actual en formato FEN
  getFen(): string {
    return this.game.fen();
  }

  // Obtener PGN completo
  getPgn(): string {
    return this.game.pgn();
  }

  // Reiniciar juego
  reset(): void {
    this.game.reset();
  }

  // Obtener piezas capturadas
  getCapturedPieces(): { white: ChessPiece[], black: ChessPiece[] } {
    const captured = {
      white: [] as ChessPiece[],
      black: [] as ChessPiece[]
    };

    const history = this.game.history({ verbose: true });
    
    for (const move of history) {
      if (move.captured) {
        const capturedPiece: ChessPiece = {
          type: move.captured as PieceType,
          color: move.color === 'w' ? 'b' : 'w' as PieceColor
        };
        
        // La pieza capturada se agrega al jugador que hizo la captura
        if (move.color === 'w') {
          captured.white.push(capturedPiece);
        } else {
          captured.black.push(capturedPiece);
        }
      }
    }

    return captured;
  }

  // Determinar fase del juego
  getGamePhase(): 'opening' | 'middlegame' | 'endgame' {
    const moveCount = this.game.history().length;
    const board = this.game.board();
    
    // Contar piezas en el tablero
    let totalPieces = 0;
    let queens = 0;
    
    for (const row of board) {
      for (const square of row) {
        if (square) {
          totalPieces++;
          if (square.type === 'q') {
            queens++;
          }
        }
      }
    }
    
    // Final: pocas piezas en el tablero o sin damas
    if (totalPieces <= 12 || (queens === 0 && totalPieces <= 16)) {
      return 'endgame';
    }
    
    // Apertura: primeros 10-15 movimientos
    if (moveCount < 10) {
      return 'opening';
    }
    
    // Medio juego: todo lo demás
    return 'middlegame';
  }

  private mapChessJsMoveToMove = (move: ChessJsMove): Move => ({
    from: {
      file: move.from[0],
      rank: parseInt(move.from[1])
    },
    to: {
      file: move.to[0],
      rank: parseInt(move.to[1])
    },
    piece: {
      type: move.piece as PieceType,
      color: move.color as PieceColor
    },
    captured: move.captured ? {
      type: move.captured as PieceType,
      color: move.color === 'w' ? 'b' : 'w' as PieceColor
    } : undefined,
    promotion: move.promotion as PieceType,
    flags: move.flags,
    san: move.san,
    lan: move.lan,
    before: move.before,
    after: move.after
  });

  private mapPosition(): Record<string, ChessPiece | null> {
    const position: Record<string, ChessPiece | null> = {};
    const board = this.game.board();

    for (let rank = 8; rank >= 1; rank--) {
      for (let file = 0; file < 8; file++) {
        const square = String.fromCharCode(97 + file) + rank;
        const piece = board[8 - rank][file];

        if (piece) {
          position[square] = {
            type: piece.type as PieceType,
            color: piece.color as PieceColor
          };
        } else {
          position[square] = null;
        }
      }
    }

    return position;
  }
}
