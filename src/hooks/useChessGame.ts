// src/hooks/useChessGame.ts
import { useState, useCallback, useEffect } from 'react';
import { Game, GameState, GameSettings, Move } from '@/types';
import { GameStateManager } from '@/lib/game';
import { ChessEngine } from '@/lib/chess';

export interface UseChessGameReturn {
  game: Game | null;
  gameState: GameState | null;
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  createGame: (settings: GameSettings) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  undoMove: () => void;
  canUndo: boolean;
  loadPosition: (fen: string) => void;
  exportPGN: () => string | null;
  exportFEN: () => string | null;
  isLoading: boolean;
  error: string | null;
}

export function useChessGame(): UseChessGameReturn {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameManager] = useState(() => new GameStateManager());

  // Crear nueva partida
  const createGame = useCallback((settings: GameSettings) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[DIFFICULTY_TRACKING] useChessGame - createGame() called with settings:', {
        settings,
        difficulty: settings.difficulty,
        mode: settings.mode,
        timestamp: new Date().toISOString()
      });

      const newGame = gameManager.createGame(settings);
      
      console.log('[DIFFICULTY_TRACKING] useChessGame - Game created, storing with difficulty:', {
        gameId: newGame.id,
        difficulty: newGame.settings.difficulty,
        mode: newGame.settings.mode,
        timestamp: new Date().toISOString()
      });
      
      setGame(newGame);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating game');
    } finally {
      setIsLoading(false);
    }
  }, [gameManager]);

  // Realizar movimiento
  const makeMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (!game) return false;

    try {
      setError(null);
      const success = gameManager.makeMove(from, to, promotion);

      if (success) {
        const updatedGame = gameManager.getCurrentGame();
        setGame(updatedGame);

        // Si es modo IA y no es el turno del jugador, hacer movimiento de IA
        if (updatedGame && updatedGame.settings.mode === 'ai' && !updatedGame.state.isGameOver) {
          // Aquí se llamaría al hook de IA
        }
      }

      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error making move');
      return false;
    }
  }, [game, gameManager]);

  // Iniciar partida
  const startGame = useCallback(() => {
    try {
      setError(null);
      gameManager.startGame();
      const updatedGame = gameManager.getCurrentGame();
      setGame(updatedGame);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error starting game');
    }
  }, [gameManager]);

  // Pausar partida
  const pauseGame = useCallback(() => {
    try {
      setError(null);
      gameManager.pauseGame();
      const updatedGame = gameManager.getCurrentGame();
      setGame(updatedGame);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error pausing game');
    }
  }, [gameManager]);

  // Reanudar partida
  const resumeGame = useCallback(() => {
    try {
      setError(null);
      gameManager.resumeGame();
      const updatedGame = gameManager.getCurrentGame();
      setGame(updatedGame);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error resuming game');
    }
  }, [gameManager]);

  // Reiniciar partida
  const resetGame = useCallback(() => {
    try {
      setError(null);
      if (game) {
        const newGame = gameManager.createGame(game.settings);
        setGame(newGame);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error resetting game');
    }
  }, [game, gameManager]);

  // Cargar posición FEN
  const loadPosition = useCallback((fen: string) => {
    try {
      setError(null);
      gameManager.loadPosition(fen);
      const updatedGame = gameManager.getCurrentGame();
      setGame(updatedGame);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading position');
    }
  }, [gameManager]);

  // Exportar PGN
  const exportPGN = useCallback((): string | null => {
    return gameManager.exportPGN();
  }, [gameManager]);

  // Exportar FEN
  const exportFEN = useCallback((): string | null => {
    return gameManager.exportFEN();
  }, [gameManager]);

  // Deshacer movimiento
  const undoMove = useCallback(() => {
    try {
      setError(null);
      
      // Si es modo IA, deshacer dos movimientos (jugador + IA)
      if (game?.settings.mode === 'ai') {
        gameManager.undoLastTwoMoves();
      } else {
        gameManager.undoLastMove();
      }
      
      const updatedGame = gameManager.getCurrentGame();
      setGame(updatedGame);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error undoing move');
    }
  }, [game, gameManager]);

  // Verificar si se puede deshacer
  const canUndo = gameManager.canUndo();

  // Obtener estado del juego con settings incluidos
  const gameState = game ? {
    ...game.state,
    settings: {
      mode: game.settings.mode,
      playerColor: game.settings.playerColor
    },
    status: game.status
  } : null;

  return {
    game,
    gameState,
    makeMove,
    createGame,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    undoMove,
    canUndo,
    loadPosition,
    exportPGN,
    exportFEN,
    isLoading,
    error
  };
}
