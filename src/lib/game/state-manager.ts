// src/lib/game/state-manager.ts
import { Game, GameState, GameSettings, GameStatus, PieceType, Move } from '@/types';
import { ChessEngine } from '@/lib/chess';
import type { AIMoveRequest, AIMoveResponse } from '@/lib/ai/ai-service';

/**
 * Tipo de finalización de partida
 */
export type GameEndReason = 
  | { type: 'checkmate', winner: 'w' | 'b' }
  | { type: 'stalemate' }
  | { type: 'threefold_repetition' }
  | { type: 'fifty_move_rule' }
  | { type: 'insufficient_material' }
  | { type: 'timeout', winner: 'w' | 'b' }
  | { type: 'resignation', winner: 'w' | 'b' };

/**
 * Error personalizado para GameStateManager
 */
export class GameStateError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'GameStateError';
  }
}

export class GameStateManager {
  private game: Game | null = null;
  private engine: ChessEngine;

  constructor() {
    this.engine = new ChessEngine();
  }

  // Crear nueva partida
  createGame(settings: GameSettings): Game {
    this.engine = new ChessEngine();

    this.game = {
      id: this.generateGameId(),
      status: 'waiting',
      settings,
      state: this.engine.getGameState(),
      players: {
        white: settings.playerColor === 'w' ? 'player' : 'ai',
        black: settings.playerColor === 'b' ? 'player' : 'ai'
      },
      timers: {
        white: settings.timeControl ? settings.timeControl.initial * 60 : 0,
        black: settings.timeControl ? settings.timeControl.initial * 60 : 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.game;
  }

  // Obtener partida actual
  getCurrentGame(): Game | null {
    return this.game;
  }

  // Realizar movimiento
  makeMove(from: string, to: string, promotion?: string): boolean {
    if (!this.game || this.game.status !== 'playing') {
      return false;
    }

    const fromSquare = {
      file: from[0],
      rank: parseInt(from[1])
    };

    const toSquare = {
      file: to[0],
      rank: parseInt(to[1])
    };

    const success = this.engine.makeMove(fromSquare, toSquare, promotion as PieceType);

    if (success) {
      this.game.state = this.engine.getGameState();
      this.game.updatedAt = new Date().toISOString();

      // Verificar si la partida terminó y actualizar con información detallada
      const gameEnd = this.checkGameEnd();
      if (gameEnd) {
        this.game.status = 'finished';
        // Almacenar el resultado en el juego (si el tipo Game lo soporta)
        // Por ahora solo actualizamos el estado
      }
    }

    return success;
  }

  // Obtener movimientos legales
  getLegalMoves(square?: string): Move[] {
    if (square) {
      return this.engine.getLegalMoves({
        file: square[0],
        rank: parseInt(square[1])
      });
    }
    return this.engine.getLegalMoves();
  }

  /**
   * Realiza un movimiento de la IA
   * Integra con AIService mejorado, pasa información de fase del juego
   * y maneja errores apropiadamente
   */
  async makeAIMove(): Promise<boolean> {
    if (!this.game || this.game.status !== 'playing') {
      throw new GameStateError('No active game or game not in playing state', 'NO_ACTIVE_GAME');
    }

    if (!this.game.settings.difficulty) {
      throw new GameStateError('AI difficulty not configured', 'NO_DIFFICULTY');
    }

    // Verificar que es el turno de la IA
    const currentTurn = this.game.state.turn;
    const isAITurn = (
      (currentTurn === 'w' && this.game.players.white === 'ai') ||
      (currentTurn === 'b' && this.game.players.black === 'ai')
    );

    if (!isAITurn) {
      throw new GameStateError('Not AI turn', 'WRONG_TURN');
    }

    try {
      // Obtener información necesaria para la IA
      const gamePhase = this.engine.getGamePhase();
      const legalMoves = this.game.state.legalMoves;
      const moveHistory = this.game.state.history.map(m => m.san);

      // Verificar que hay movimientos legales antes de solicitar a la IA
      if (!legalMoves || legalMoves.length === 0) {
        console.error('[STATE_MANAGER] No legal moves available for AI');
        throw new GameStateError('No legal moves available - game should be over', 'NO_LEGAL_MOVES');
      }

      console.log('[STATE_MANAGER] Requesting AI move:', {
        fen: this.game.state.fen,
        difficulty: this.game.settings.difficulty,
        gamePhase,
        legalMovesCount: legalMoves.length,
        isCheck: this.game.state.isCheck
      });

      // Construir request para AIService
      const request: AIMoveRequest = {
        fen: this.game.state.fen,
        difficulty: this.game.settings.difficulty,
        gamePhase,
        moveHistory,
        legalMoves
      };

      // Solicitar movimiento a través de la API
      const apiResponse = await fetch('/api/ai/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new GameStateError(
          `AI API error: ${errorData.message || 'Unknown error'}`,
          'AI_API_ERROR'
        );
      }

      const response: AIMoveResponse = await apiResponse.json();

      console.log('[STATE_MANAGER] AI response received:', {
        move: response.move,
        model: response.model,
        isFallback: response.isFallback,
        thinkTime: response.thinkTime
      });

      // Parsear el movimiento (formato UCI: e2e4)
      const move = response.move;
      if (!move || move.length < 4) {
        console.error('[STATE_MANAGER] Invalid move format:', move);
        throw new GameStateError('Invalid move format from AI', 'INVALID_AI_MOVE');
      }

      const from = move.substring(0, 2);
      const to = move.substring(2, 4);
      const promotion = move.length === 5 ? move[4] : undefined;

      console.log('[STATE_MANAGER] Attempting to make move:', { from, to, promotion });

      // Realizar el movimiento
      const success = this.makeMove(from, to, promotion);

      if (!success) {
        console.error('[STATE_MANAGER] Move failed:', { from, to, promotion, move });
        throw new GameStateError(`AI move failed: ${move}`, 'AI_MOVE_FAILED');
      }

      console.log('[STATE_MANAGER] AI move successful');
      return true;

    } catch (error) {
      if (error instanceof GameStateError) {
        throw error;
      }

      // Error inesperado
      throw new GameStateError(
        `Unexpected error during AI move: ${(error as Error).message}`,
        'UNEXPECTED_ERROR'
      );
    }
  }

  // Iniciar partida
  startGame(): boolean {
    if (!this.game) return false;

    this.game.status = 'playing';
    this.game.updatedAt = new Date().toISOString();
    return true;
  }

  // Pausar partida
  pauseGame(): boolean {
    if (!this.game || this.game.status !== 'playing') return false;

    this.game.status = 'paused';
    this.game.updatedAt = new Date().toISOString();
    return true;
  }

  // Reanudar partida
  resumeGame(): boolean {
    if (!this.game || this.game.status !== 'paused') return false;

    this.game.status = 'playing';
    this.game.updatedAt = new Date().toISOString();
    return true;
  }

  // Terminar partida
  endGame(): boolean {
    if (!this.game) return false;

    this.game.status = 'finished';
    this.game.updatedAt = new Date().toISOString();
    return true;
  }

  // Obtener estado del juego
  getGameState(): GameState | null {
    return this.game ? this.game.state : null;
  }

  // Cargar posición FEN
  loadPosition(fen: string): boolean {
    const success = this.engine.loadFen(fen);

    if (success && this.game) {
      this.game.state = this.engine.getGameState();
      this.game.updatedAt = new Date().toISOString();
    }

    return success;
  }

  // Exportar PGN
  exportPGN(): string | null {
    return this.game ? this.game.state.pgn : null;
  }

  // Exportar FEN
  exportFEN(): string | null {
    return this.game ? this.game.state.fen : null;
  }

  /**
   * Verifica el final de la partida y retorna el tipo específico de finalización
   * Detecta: jaque mate, ahogado, tablas por repetición, 50 movimientos, material insuficiente
   */
  checkGameEnd(): GameEndReason | null {
    if (!this.game) return null;

    const state = this.game.state;

    // Jaque mate
    if (state.isCheckmate) {
      // El ganador es el oponente del jugador en turno
      const winner = state.turn === 'w' ? 'b' : 'w';
      return { type: 'checkmate', winner };
    }

    // Ahogado
    if (state.isStalemate) {
      return { type: 'stalemate' };
    }

    // Tablas por repetición triple
    if (state.isThreefoldRepetition) {
      return { type: 'threefold_repetition' };
    }

    // Tablas por material insuficiente
    if (state.isInsufficientMaterial) {
      return { type: 'insufficient_material' };
    }

    // Tablas por regla de 50 movimientos
    // chess.js incluye esto en isDraw(), pero podemos verificarlo específicamente
    if (state.isDraw && !state.isStalemate && !state.isThreefoldRepetition && !state.isInsufficientMaterial) {
      return { type: 'fifty_move_rule' };
    }

    // No hay final de partida
    return null;
  }

  /**
   * Verifica si se puede deshacer un movimiento
   * No se puede deshacer si la partida terminó o no hay movimientos
   */
  canUndo(): boolean {
    if (!this.game) return false;
    if (this.game.status === 'finished') return false;
    if (this.game.state.history.length === 0) return false;
    return true;
  }

  /**
   * Deshace el último movimiento
   * Útil en modo PvP o para deshacer un movimiento del jugador
   */
  undoLastMove(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    const success = this.engine.undoMove();

    if (success && this.game) {
      this.game.state = this.engine.getGameState();
      this.game.updatedAt = new Date().toISOString();
    }

    return success;
  }

  /**
   * Deshace los últimos dos movimientos
   * Útil en modo PvE para deshacer tanto el movimiento del jugador como el de la IA
   */
  undoLastTwoMoves(): boolean {
    if (!this.canUndo()) {
      return false;
    }

    // Verificar que hay al menos 2 movimientos
    if (this.game && this.game.state.history.length < 2) {
      return false;
    }

    // Deshacer primer movimiento
    const firstUndo = this.engine.undoMove();
    if (!firstUndo) {
      return false;
    }

    // Deshacer segundo movimiento
    const secondUndo = this.engine.undoMove();
    if (!secondUndo) {
      // Si falla el segundo, intentar rehacer el primero para mantener consistencia
      // (chess.js no tiene redo, así que el estado quedará con un movimiento menos)
      return false;
    }

    if (this.game) {
      this.game.state = this.engine.getGameState();
      this.game.updatedAt = new Date().toISOString();
    }

    return true;
  }

  private generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
