import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameStateManager, GameStateError } from '@/lib/game/state-manager';
import { AIService } from '@/lib/ai/ai-service';
import { GameSettings } from '@/types';

describe('GameStateManager - Integration Tests', () => {
  let manager: GameStateManager;

  beforeEach(() => {
    manager = new GameStateManager();
  });

  describe('Flujo completo de partida PvP', () => {
    it('debe completar una partida PvP desde inicio hasta jaque mate', () => {
      // Configurar partida PvP
      const settings: GameSettings = {
        mode: 'pvp'
      };

      manager.createGame(settings);
      manager.startGame();

      // Mate del pastor
      expect(manager.makeMove('e2', 'e4')).toBe(true);
      expect(manager.makeMove('e7', 'e5')).toBe(true);
      expect(manager.makeMove('d1', 'h5')).toBe(true);
      expect(manager.makeMove('b8', 'c6')).toBe(true);
      expect(manager.makeMove('f1', 'c4')).toBe(true);
      expect(manager.makeMove('g8', 'f6')).toBe(true);
      expect(manager.makeMove('h5', 'f7')).toBe(true); // Jaque mate

      const state = manager.getGameState();
      expect(state?.isCheckmate).toBe(true);
      expect(state?.isGameOver).toBe(true);

      const endReason = manager.checkGameEnd();
      expect(endReason?.type).toBe('checkmate');
      if (endReason?.type === 'checkmate') {
        expect(endReason.winner).toBe('w');
      }
    });

    it('debe rastrear correctamente el historial de movimientos', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);
      manager.startGame();

      manager.makeMove('e2', 'e4');
      manager.makeMove('e7', 'e5');
      manager.makeMove('g1', 'f3');

      const state = manager.getGameState();
      expect(state?.history.length).toBe(3);
      expect(state?.history[0].san).toBe('e4');
      expect(state?.history[1].san).toBe('e5');
      expect(state?.history[2].san).toBe('Nf3');
    });

    it('debe detectar ahogado correctamente', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);
      manager.startGame();

      // Cargar posición de ahogado
      manager.loadPosition('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');

      const state = manager.getGameState();
      expect(state?.isStalemate).toBe(true);
      expect(state?.isDraw).toBe(true);

      const endReason = manager.checkGameEnd();
      expect(endReason?.type).toBe('stalemate');
    });
  });

  describe('Flujo completo de partida PvE con IA', () => {
    it('debe manejar turno de IA correctamente', async () => {
      // Mock del AIService
      const mockAIService = {
        requestMoveWithRetry: vi.fn().mockResolvedValue({
          move: 'e7e5',
          confidence: 0.8,
          model: 'test',
          thinkTime: 100
        })
      } as unknown as AIService;

      const managerWithAI = new GameStateManager(mockAIService);

      const settings: GameSettings = {
        mode: 'ai',
        difficulty: 'facil',
        playerColor: 'w'
      };

      managerWithAI.createGame(settings);
      managerWithAI.startGame();

      // Jugador mueve
      expect(managerWithAI.makeMove('e2', 'e4')).toBe(true);

      // IA debe responder
      const aiMoved = await managerWithAI.makeAIMove();
      expect(aiMoved).toBe(true);

      const state = managerWithAI.getGameState();
      expect(state?.history.length).toBe(2);
      expect(mockAIService.requestMoveWithRetry).toHaveBeenCalledTimes(1);
    });

    it('debe pasar información de fase del juego a AIService', async () => {
      const mockAIService = {
        requestMoveWithRetry: vi.fn().mockResolvedValue({
          move: 'e7e5',
          confidence: 0.8,
          model: 'test',
          thinkTime: 100
        })
      } as unknown as AIService;

      const managerWithAI = new GameStateManager(mockAIService);

      const settings: GameSettings = {
        mode: 'ai',
        difficulty: 'medio',
        playerColor: 'w'
      };

      managerWithAI.createGame(settings);
      managerWithAI.startGame();
      managerWithAI.makeMove('e2', 'e4');

      await managerWithAI.makeAIMove();

      expect(mockAIService.requestMoveWithRetry).toHaveBeenCalledWith(
        expect.objectContaining({
          gamePhase: 'opening',
          difficulty: 'medio',
          legalMoves: expect.any(Array),
          moveHistory: expect.any(Array)
        })
      );
    });

    it('debe lanzar error si no es turno de la IA', async () => {
      const mockAIService = {
        requestMoveWithRetry: vi.fn()
      } as unknown as AIService;

      const managerWithAI = new GameStateManager(mockAIService);

      const settings: GameSettings = {
        mode: 'ai',
        difficulty: 'facil',
        playerColor: 'w'
      };

      managerWithAI.createGame(settings);
      managerWithAI.startGame();

      // Es turno del jugador blanco, no de la IA
      await expect(managerWithAI.makeAIMove()).rejects.toThrow(GameStateError);
      await expect(managerWithAI.makeAIMove()).rejects.toThrow('Not AI turn');
    });

    it('debe manejar errores de IA apropiadamente', async () => {
      const mockAIService = {
        requestMoveWithRetry: vi.fn().mockRejectedValue(new Error('API Error'))
      } as unknown as AIService;

      const managerWithAI = new GameStateManager(mockAIService);

      const settings: GameSettings = {
        mode: 'ai',
        difficulty: 'medio',
        playerColor: 'w'
      };

      managerWithAI.createGame(settings);
      managerWithAI.startGame();
      managerWithAI.makeMove('e2', 'e4');

      await expect(managerWithAI.makeAIMove()).rejects.toThrow(GameStateError);
    });
  });

  describe('Deshacer movimientos', () => {
    it('debe deshacer un movimiento en modo PvP', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);
      manager.startGame();

      manager.makeMove('e2', 'e4');
      const fenAfterMove = manager.exportFEN();

      expect(manager.undoLastMove()).toBe(true);

      const state = manager.getGameState();
      expect(state?.history.length).toBe(0);
      expect(manager.exportFEN()).not.toBe(fenAfterMove);
    });

    it('debe deshacer dos movimientos en modo PvE', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);
      manager.startGame();

      manager.makeMove('e2', 'e4');
      manager.makeMove('e7', 'e5');
      manager.makeMove('g1', 'f3');

      expect(manager.undoLastTwoMoves()).toBe(true);

      const state = manager.getGameState();
      expect(state?.history.length).toBe(1);
    });

    it('no debe permitir deshacer si la partida terminó', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);
      manager.startGame();

      // Mate del pastor
      manager.makeMove('e2', 'e4');
      manager.makeMove('e7', 'e5');
      manager.makeMove('d1', 'h5');
      manager.makeMove('b8', 'c6');
      manager.makeMove('f1', 'c4');
      manager.makeMove('g8', 'f6');
      manager.makeMove('h5', 'f7'); // Jaque mate

      expect(manager.canUndo()).toBe(false);
      expect(manager.undoLastMove()).toBe(false);
    });

    it('no debe permitir deshacer si no hay movimientos', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);
      manager.startGame();

      expect(manager.canUndo()).toBe(false);
      expect(manager.undoLastMove()).toBe(false);
    });

    it('no debe permitir deshacer dos movimientos si solo hay uno', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);
      manager.startGame();

      manager.makeMove('e2', 'e4');

      expect(manager.undoLastTwoMoves()).toBe(false);
    });
  });

  describe('Detección de finales de partida', () => {
    it('debe detectar jaque mate y el ganador', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);
      manager.startGame();

      // Mate del pastor
      manager.makeMove('e2', 'e4');
      manager.makeMove('e7', 'e5');
      manager.makeMove('d1', 'h5');
      manager.makeMove('b8', 'c6');
      manager.makeMove('f1', 'c4');
      manager.makeMove('g8', 'f6');
      manager.makeMove('h5', 'f7');

      const endReason = manager.checkGameEnd();
      expect(endReason?.type).toBe('checkmate');
      if (endReason?.type === 'checkmate') {
        expect(endReason.winner).toBe('w');
      }
    });

    it('debe detectar ahogado', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);
      manager.startGame();

      manager.loadPosition('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');

      const endReason = manager.checkGameEnd();
      expect(endReason?.type).toBe('stalemate');
    });

    it('debe detectar material insuficiente', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);
      manager.startGame();

      manager.loadPosition('8/8/8/8/8/4k3/8/4K3 w - - 0 1');

      const endReason = manager.checkGameEnd();
      expect(endReason?.type).toBe('insufficient_material');
    });

    it('debe detectar repetición triple', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);
      manager.startGame();

      // Repetir la misma posición 3 veces
      manager.makeMove('g1', 'f3');
      manager.makeMove('g8', 'f6');
      manager.makeMove('f3', 'g1');
      manager.makeMove('f6', 'g8');
      manager.makeMove('g1', 'f3');
      manager.makeMove('g8', 'f6');
      manager.makeMove('f3', 'g1');
      manager.makeMove('f6', 'g8');

      const state = manager.getGameState();
      expect(state?.isThreefoldRepetition).toBe(true);

      const endReason = manager.checkGameEnd();
      expect(endReason?.type).toBe('threefold_repetition');
    });

    it('debe retornar null si la partida no ha terminado', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);
      manager.startGame();

      manager.makeMove('e2', 'e4');

      const endReason = manager.checkGameEnd();
      expect(endReason).toBeNull();
    });
  });

  describe('Gestión de estado de partida', () => {
    it('debe crear partida con configuración correcta', () => {
      const settings: GameSettings = {
        mode: 'ai',
        difficulty: 'medio',
        playerColor: 'w',
        timeControl: {
          initial: 10,
          increment: 5
        }
      };

      const game = manager.createGame(settings);

      expect(game.settings).toEqual(settings);
      expect(game.status).toBe('waiting');
      expect(game.players.white).toBe('player');
      expect(game.players.black).toBe('ai');
      expect(game.timers.white).toBe(600); // 10 minutos en segundos
      expect(game.timers.black).toBe(600);
    });

    it('debe cambiar estado de partida correctamente', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);

      expect(manager.getCurrentGame()?.status).toBe('waiting');

      manager.startGame();
      expect(manager.getCurrentGame()?.status).toBe('playing');

      manager.pauseGame();
      expect(manager.getCurrentGame()?.status).toBe('paused');

      manager.resumeGame();
      expect(manager.getCurrentGame()?.status).toBe('playing');

      manager.endGame();
      expect(manager.getCurrentGame()?.status).toBe('finished');
    });

    it('no debe permitir movimientos si la partida no está en estado playing', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);

      // Estado: waiting
      expect(manager.makeMove('e2', 'e4')).toBe(false);

      manager.startGame();
      expect(manager.makeMove('e2', 'e4')).toBe(true);

      manager.pauseGame();
      expect(manager.makeMove('e7', 'e5')).toBe(false);
    });

    it('debe exportar PGN y FEN correctamente', () => {
      const settings: GameSettings = { mode: 'pvp' };
      manager.createGame(settings);
      manager.startGame();

      manager.makeMove('e2', 'e4');
      manager.makeMove('e7', 'e5');

      const pgn = manager.exportPGN();
      const fen = manager.exportFEN();

      expect(pgn).toContain('e4');
      expect(pgn).toContain('e5');
      expect(fen).toBeTruthy();
      expect(fen).toContain('rnbqkbnr');
    });
  });
});
