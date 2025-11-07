import { describe, it, expect, beforeEach } from 'vitest';
import { ChessEngine } from '@/lib/chess/engine';

describe('ChessEngine', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe('Movimientos de Peón', () => {
    it('debe permitir avance de un paso', () => {
      const result = engine.makeMove({ file: 'e', rank: 2 }, { file: 'e', rank: 3 });
      expect(result).toBe(true);
    });

    it('debe permitir avance de dos pasos desde posición inicial', () => {
      const result = engine.makeMove({ file: 'e', rank: 2 }, { file: 'e', rank: 4 });
      expect(result).toBe(true);
    });

    it('debe rechazar avance de tres pasos', () => {
      const result = engine.makeMove({ file: 'e', rank: 2 }, { file: 'e', rank: 5 });
      expect(result).toBe(false);
    });

    it('debe permitir captura diagonal', () => {
      engine.loadFen('rnbqkbnr/ppp2ppp/8/3pp3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3');
      const result = engine.makeMove({ file: 'e', rank: 4 }, { file: 'd', rank: 5 });
      expect(result).toBe(true);
    });
  });

  describe('Movimientos de Torre', () => {
    it('debe permitir movimiento horizontal', () => {
      engine.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      const result = engine.makeMove({ file: 'a', rank: 1 }, { file: 'd', rank: 1 });
      expect(result).toBe(true);
    });

    it('debe permitir movimiento vertical', () => {
      engine.loadFen('rnbqkbnr/1ppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      const result = engine.makeMove({ file: 'a', rank: 1 }, { file: 'a', rank: 7 });
      expect(result).toBe(true);
    });

    it('debe rechazar movimiento diagonal', () => {
      engine.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      const result = engine.makeMove({ file: 'a', rank: 1 }, { file: 'b', rank: 2 });
      expect(result).toBe(false);
    });
  });

  describe('Movimientos de Alfil', () => {
    it('debe permitir movimiento diagonal', () => {
      engine.loadFen('rnbqkbnr/pppp1ppp/8/4p3/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 2');
      const result = engine.makeMove({ file: 'f', rank: 1 }, { file: 'c', rank: 4 });
      expect(result).toBe(true);
    });

    it('debe rechazar movimiento horizontal', () => {
      engine.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKB1R w KQkq - 0 1');
      const result = engine.makeMove({ file: 'f', rank: 1 }, { file: 'g', rank: 1 });
      expect(result).toBe(false);
    });
  });

  describe('Movimientos de Caballo', () => {
    it('debe permitir movimiento en L', () => {
      const result = engine.makeMove({ file: 'g', rank: 1 }, { file: 'f', rank: 3 });
      expect(result).toBe(true);
    });

    it('debe permitir saltar sobre piezas', () => {
      const result = engine.makeMove({ file: 'b', rank: 1 }, { file: 'c', rank: 3 });
      expect(result).toBe(true);
    });

    it('debe rechazar movimiento no en L', () => {
      const result = engine.makeMove({ file: 'g', rank: 1 }, { file: 'g', rank: 3 });
      expect(result).toBe(false);
    });
  });

  describe('Movimientos de Dama', () => {
    it('debe permitir movimiento horizontal', () => {
      engine.loadFen('rnbqkbnr/ppp1pppp/8/3p4/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 2');
      const result = engine.makeMove({ file: 'd', rank: 1 }, { file: 'd', rank: 5 });
      expect(result).toBe(true);
    });

    it('debe permitir movimiento diagonal', () => {
      engine.loadFen('rnbqkbnr/pppp1ppp/8/4p3/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 2');
      const result = engine.makeMove({ file: 'd', rank: 1 }, { file: 'h', rank: 5 });
      expect(result).toBe(true);
    });
  });

  describe('Movimientos de Rey', () => {
    it('debe permitir movimiento de un paso', () => {
      engine.loadFen('rnbqkbnr/pppp1ppp/8/4p3/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 2');
      const result = engine.makeMove({ file: 'e', rank: 1 }, { file: 'e', rank: 2 });
      expect(result).toBe(true);
    });

    it('debe rechazar movimiento de dos pasos', () => {
      engine.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      const result = engine.makeMove({ file: 'e', rank: 1 }, { file: 'e', rank: 3 });
      expect(result).toBe(false);
    });
  });

  describe('Enroque', () => {
    it('debe permitir enroque corto cuando es legal', () => {
      engine.loadFen('r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPPBPPP/RNBQK2R w KQkq - 0 1');
      const result = engine.makeMove({ file: 'e', rank: 1 }, { file: 'g', rank: 1 });
      expect(result).toBe(true);
    });

    it('debe permitir enroque largo cuando es legal', () => {
      engine.loadFen('r3kbnr/pppbpppp/2nq4/3p4/3P4/2NQ4/PPPBPPPP/R3KBNR w KQkq - 0 1');
      const result = engine.makeMove({ file: 'e', rank: 1 }, { file: 'c', rank: 1 });
      expect(result).toBe(true);
    });

    it('debe rechazar enroque si el rey está en jaque', () => {
      engine.loadFen('r1bqkb1r/pppp1ppp/2n2n2/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 0 1');
      const result = engine.makeMove({ file: 'e', rank: 1 }, { file: 'g', rank: 1 });
      expect(result).toBe(false);
    });

    it('debe rechazar enroque si hay piezas en el camino', () => {
      engine.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      const result = engine.makeMove({ file: 'e', rank: 1 }, { file: 'g', rank: 1 });
      expect(result).toBe(false);
    });
  });

  describe('Captura al Paso', () => {
    it('debe permitir captura al paso', () => {
      engine.loadFen('rnbqkbnr/ppp2ppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3');
      const result = engine.makeMove({ file: 'e', rank: 5 }, { file: 'd', rank: 6 });
      expect(result).toBe(true);
    });
  });

  describe('Promoción de Peón', () => {
    it('debe permitir promoción a dama', () => {
      engine.loadFen('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
      const result = engine.makeMove({ file: 'e', rank: 7 }, { file: 'e', rank: 8 }, 'q');
      expect(result).toBe(true);
    });

    it('debe permitir promoción a torre', () => {
      engine.loadFen('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
      const result = engine.makeMove({ file: 'e', rank: 7 }, { file: 'e', rank: 8 }, 'r');
      expect(result).toBe(true);
    });

    it('debe permitir promoción a alfil', () => {
      engine.loadFen('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
      const result = engine.makeMove({ file: 'e', rank: 7 }, { file: 'e', rank: 8 }, 'b');
      expect(result).toBe(true);
    });

    it('debe permitir promoción a caballo', () => {
      engine.loadFen('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
      const result = engine.makeMove({ file: 'e', rank: 7 }, { file: 'e', rank: 8 }, 'n');
      expect(result).toBe(true);
    });
  });

  describe('Detección de Jaque', () => {
    it('debe detectar jaque', () => {
      engine.loadFen('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1');
      expect(engine.isCheck()).toBe(true);
    });

    it('debe rechazar movimientos que dejan al propio rey en jaque', () => {
      engine.loadFen('rnb1kbnr/pppp1ppp/8/4p2q/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1');
      const result = engine.makeMove({ file: 'g', rank: 2 }, { file: 'g', rank: 3 });
      expect(result).toBe(false);
    });
  });

  describe('Detección de Jaque Mate', () => {
    it('debe detectar jaque mate', () => {
      engine.loadFen('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1');
      expect(engine.isCheckmate()).toBe(true);
    });

    it('debe identificar al ganador en jaque mate', () => {
      engine.loadFen('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1');
      const state = engine.getGameState();
      expect(state.isCheckmate).toBe(true);
      expect(state.winner).toBe('b');
    });
  });

  describe('Detección de Ahogado', () => {
    it('debe detectar ahogado', () => {
      engine.loadFen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
      expect(engine.isStalemate()).toBe(true);
    });

    it('debe marcar el juego como tablas en ahogado', () => {
      engine.loadFen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
      const state = engine.getGameState();
      expect(state.isStalemate).toBe(true);
      expect(state.isDraw).toBe(true);
    });
  });

  describe('Detección de Material Insuficiente', () => {
    it('debe detectar material insuficiente (solo reyes)', () => {
      engine.loadFen('8/8/8/8/8/4k3/8/4K3 w - - 0 1');
      expect(engine.isInsufficientMaterial()).toBe(true);
    });

    it('debe detectar material insuficiente (rey y alfil vs rey)', () => {
      engine.loadFen('8/8/8/8/8/4k3/8/4KB2 w - - 0 1');
      expect(engine.isInsufficientMaterial()).toBe(true);
    });

    it('debe detectar material insuficiente (rey y caballo vs rey)', () => {
      engine.loadFen('8/8/8/8/8/4k3/8/4KN2 w - - 0 1');
      expect(engine.isInsufficientMaterial()).toBe(true);
    });
  });

  describe('Detección de Repetición Triple', () => {
    it('debe detectar repetición triple', () => {
      // Repetir la misma posición 3 veces
      engine.makeMove({ file: 'g', rank: 1 }, { file: 'f', rank: 3 });
      engine.makeMove({ file: 'g', rank: 8 }, { file: 'f', rank: 6 });
      engine.makeMove({ file: 'f', rank: 3 }, { file: 'g', rank: 1 });
      engine.makeMove({ file: 'f', rank: 6 }, { file: 'g', rank: 8 });
      engine.makeMove({ file: 'g', rank: 1 }, { file: 'f', rank: 3 });
      engine.makeMove({ file: 'g', rank: 8 }, { file: 'f', rank: 6 });
      engine.makeMove({ file: 'f', rank: 3 }, { file: 'g', rank: 1 });
      engine.makeMove({ file: 'f', rank: 6 }, { file: 'g', rank: 8 });
      
      expect(engine.isThreefoldRepetition()).toBe(true);
    });
  });

  describe('Piezas Capturadas', () => {
    it('debe rastrear piezas capturadas por blancas', () => {
      engine.loadFen('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
      engine.makeMove({ file: 'e', rank: 4 }, { file: 'd', rank: 5 });
      engine.makeMove({ file: 'e', rank: 5 }, { file: 'd', rank: 5 });
      
      const captured = engine.getCapturedPieces();
      expect(captured.white.length).toBe(1);
      expect(captured.white[0].type).toBe('p');
      expect(captured.white[0].color).toBe('b');
    });

    it('debe rastrear piezas capturadas por negras', () => {
      engine.loadFen('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
      engine.makeMove({ file: 'd', rank: 2 }, { file: 'd', rank: 4 });
      engine.makeMove({ file: 'e', rank: 5 }, { file: 'd', rank: 4 });
      
      const captured = engine.getCapturedPieces();
      expect(captured.black.length).toBe(1);
      expect(captured.black[0].type).toBe('p');
      expect(captured.black[0].color).toBe('w');
    });

    it('debe rastrear múltiples capturas', () => {
      engine.makeMove({ file: 'e', rank: 2 }, { file: 'e', rank: 4 });
      engine.makeMove({ file: 'd', rank: 7 }, { file: 'd', rank: 5 });
      engine.makeMove({ file: 'e', rank: 4 }, { file: 'd', rank: 5 });
      engine.makeMove({ file: 'c', rank: 7 }, { file: 'c', rank: 6 });
      engine.makeMove({ file: 'd', rank: 5 }, { file: 'c', rank: 6 });
      
      const captured = engine.getCapturedPieces();
      expect(captured.white.length).toBe(2);
    });
  });

  describe('Fase del Juego', () => {
    it('debe identificar apertura en los primeros movimientos', () => {
      engine.makeMove({ file: 'e', rank: 2 }, { file: 'e', rank: 4 });
      engine.makeMove({ file: 'e', rank: 7 }, { file: 'e', rank: 5 });
      
      expect(engine.getGamePhase()).toBe('opening');
    });

    it('debe identificar medio juego después de la apertura', () => {
      // Simular 15 movimientos
      const moves = [
        [{ file: 'e', rank: 2 }, { file: 'e', rank: 4 }],
        [{ file: 'e', rank: 7 }, { file: 'e', rank: 5 }],
        [{ file: 'g', rank: 1 }, { file: 'f', rank: 3 }],
        [{ file: 'b', rank: 8 }, { file: 'c', rank: 6 }],
        [{ file: 'f', rank: 1 }, { file: 'c', rank: 4 }],
        [{ file: 'f', rank: 8 }, { file: 'c', rank: 5 }],
        [{ file: 'd', rank: 2 }, { file: 'd', rank: 3 }],
        [{ file: 'g', rank: 8 }, { file: 'f', rank: 6 }],
        [{ file: 'b', rank: 1 }, { file: 'c', rank: 3 }],
        [{ file: 'd', rank: 7 }, { file: 'd', rank: 6 }],
      ];
      
      for (const [from, to] of moves) {
        engine.makeMove(from, to);
      }
      
      expect(engine.getGamePhase()).toBe('middlegame');
    });

    it('debe identificar final con pocas piezas', () => {
      engine.loadFen('8/8/4k3/8/8/4K3/4R3/8 w - - 0 1');
      expect(engine.getGamePhase()).toBe('endgame');
    });

    it('debe identificar final sin damas', () => {
      engine.loadFen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
      expect(engine.getGamePhase()).toBe('endgame');
    });
  });

  describe('Estado del Juego', () => {
    it('debe incluir todas las propiedades en getGameState', () => {
      const state = engine.getGameState();
      
      expect(state).toHaveProperty('fen');
      expect(state).toHaveProperty('pgn');
      expect(state).toHaveProperty('turn');
      expect(state).toHaveProperty('isGameOver');
      expect(state).toHaveProperty('isCheck');
      expect(state).toHaveProperty('isCheckmate');
      expect(state).toHaveProperty('isStalemate');
      expect(state).toHaveProperty('isDraw');
      expect(state).toHaveProperty('isThreefoldRepetition');
      expect(state).toHaveProperty('isInsufficientMaterial');
      expect(state).toHaveProperty('legalMoves');
      expect(state).toHaveProperty('history');
      expect(state).toHaveProperty('position');
      expect(state).toHaveProperty('capturedPieces');
    });

    it('debe actualizar el estado después de un movimiento', () => {
      const stateBefore = engine.getGameState();
      engine.makeMove({ file: 'e', rank: 2 }, { file: 'e', rank: 4 });
      const stateAfter = engine.getGameState();
      
      expect(stateAfter.fen).not.toBe(stateBefore.fen);
      expect(stateAfter.turn).not.toBe(stateBefore.turn);
      expect(stateAfter.history.length).toBe(stateBefore.history.length + 1);
    });
  });

  describe('Deshacer Movimiento', () => {
    it('debe deshacer el último movimiento', () => {
      const fenBefore = engine.getFen();
      engine.makeMove({ file: 'e', rank: 2 }, { file: 'e', rank: 4 });
      engine.undoMove();
      const fenAfter = engine.getFen();
      
      expect(fenAfter).toBe(fenBefore);
    });

    it('debe retornar false si no hay movimientos para deshacer', () => {
      const result = engine.undoMove();
      expect(result).toBe(false);
    });
  });

  describe('Cargar FEN', () => {
    it('debe cargar una posición FEN válida', () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
      const result = engine.loadFen(fen);
      expect(result).toBe(true);
      expect(engine.getFen()).toBe(fen);
    });

    it('debe rechazar una posición FEN inválida', () => {
      const result = engine.loadFen('invalid-fen');
      expect(result).toBe(false);
    });
  });

  describe('Reiniciar Juego', () => {
    it('debe reiniciar el juego a la posición inicial', () => {
      engine.makeMove({ file: 'e', rank: 2 }, { file: 'e', rank: 4 });
      engine.reset();
      
      const state = engine.getGameState();
      expect(state.history.length).toBe(0);
      expect(state.turn).toBe('w');
    });
  });
});
