import type { GameState } from '../types/chess';
import { loadConfig, validateConfig } from '../config/app-config';
import { GeminiService } from '../services/gemini-service';
import { getValidMoves } from '../game/game-logic';

export class ChessAI {
  private difficulty: string;
  private config: any;
  private geminiService: GeminiService;

  constructor(difficulty: string = 'easy') {
    this.difficulty = difficulty;

    // Cargar configuración
    this.config = loadConfig();
    const configErrors = validateConfig(this.config);
    if (configErrors.length > 0) {
      throw new Error(`Errores de configuración: ${configErrors.join(', ')}`);
    }

    // Inicializar servicio de Gemini
    this.geminiService = new GeminiService(
      this.config.gemini.apiKey,
      this.config.gemini.model
    );
  }

  /**
   * Obtiene el mejor movimiento para la posición actual usando Gemini AI
   */
  async getBestMove(gameState: GameState): Promise<any> {
    const config = this.getDifficultyConfig();

    if (!config) {
      throw new Error(`Dificultad no válida: ${this.difficulty}`);
    }

    // Obtener movimientos válidos
    const validMoves = this.getAllValidMoves(gameState);

    if (validMoves.length === 0) {
      return null;
    }

    try {
      // Convertir el estado del juego a formato FEN
      const fen = this.gameStateToFEN(gameState);

      // Usar Gemini para analizar la posición y obtener el mejor movimiento
      const bestMove = await this.geminiService.analyzeChessPosition(fen, this.difficulty);

      // Convertir la notación algebraica a formato interno
      const move = this.parseAlgebraicMove(bestMove, gameState);

      // Verificar que el movimiento sea válido
      if (move && validMoves.some(m =>
        m.from.row === move.from.row &&
        m.from.col === move.from.col &&
        m.to.row === move.to.row &&
        m.to.col === move.to.col
      )) {
        return move;
      }

      // Si el movimiento sugerido no es válido, elegir uno aleatorio válido
      console.warn(`Movimiento sugerido por Gemini no válido: ${bestMove}. Usando movimiento alternativo.`);
      return this.getRandomValidMove(validMoves);

    } catch (error) {
      console.error('Error al obtener movimiento de Gemini:', error);
      // Fallback: elegir movimiento aleatorio válido
      return this.getRandomValidMove(validMoves);
    }
  }

  /**
   * Obtiene todos los movimientos válidos para el jugador actual
   */
  private getAllValidMoves(gameState: GameState): any[] {
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
   * Convierte el estado del juego a formato FEN
   */
  private gameStateToFEN(gameState: GameState): string {
    let fen = '';

    // Generar la posición del tablero
    for (let row = 0; row < 8; row++) {
      let emptyCount = 0;

      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row][col];

        if (piece) {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }

          const pieceChar = this.getPieceChar(piece);
          fen += piece.color === 'white' ? pieceChar.toUpperCase() : pieceChar.toLowerCase();
        } else {
          emptyCount++;
        }
      }

      if (emptyCount > 0) {
        fen += emptyCount;
      }

      if (row < 7) {
        fen += '/';
      }
    }

    // Agregar turno del jugador
    fen += ` ${gameState.currentPlayer === 'white' ? 'w' : 'b'}`;

    // Agregar derechos de enroque (simplificado)
    fen += ' KQkq';

    // Agregar posición de en passant (simplificada)
    fen += ' -';

    // Agregar conteos de medio movimientos y movimientos totales
    fen += ' 0 1';

    return fen;
  }

  /**
   * Convierte una pieza a su representación FEN
   */
  private getPieceChar(piece: any): string {
    switch (piece.type) {
      case 'pawn': return 'p';
      case 'rook': return 'r';
      case 'knight': return 'n';
      case 'bishop': return 'b';
      case 'queen': return 'q';
      case 'king': return 'k';
      default: return '';
    }
  }

  /**
   * Convierte notación algebraica a formato interno
   */
  private parseAlgebraicMove(algebraic: string, gameState: GameState): any | null {
    // Limpiar la notación (eliminar símbolos especiales)
    algebraic = algebraic.trim().replace(/[+#!?]/g, '');

    // Manejar enroque
    if (algebraic === 'O-O' || algebraic === 'O-O-O') {
      return this.parseCastlingMove(algebraic, gameState);
    }

    // Convertir formato largo (e2e4) a formato estándar (e4)
    if (algebraic.length === 4 && algebraic[0] >= 'a' && algebraic[0] <= 'h' &&
        algebraic[1] >= '1' && algebraic[1] <= '8' &&
        algebraic[2] >= 'a' && algebraic[2] <= 'h' &&
        algebraic[3] >= '1' && algebraic[3] <= '8') {

      const fromCol = algebraic.charCodeAt(0) - 'a'.charCodeAt(0);
      const fromRow = 8 - parseInt(algebraic[1]);
      const toCol = algebraic.charCodeAt(2) - 'a'.charCodeAt(0);
      const toRow = 8 - parseInt(algebraic[3]);

      return {
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol }
      };
    }

    // Si no se puede parsear, devolver null
    return null;
  }

  /**
   * Maneja movimientos de enroque
   */
  private parseCastlingMove(algebraic: string, gameState: GameState): any | null {
    const isKingSide = algebraic === 'O-O';
    const row = gameState.currentPlayer === 'white' ? 7 : 0;
    const kingCol = 4;
    const rookCol = isKingSide ? 7 : 0;

    // Verificar que el rey esté en la posición correcta
    const king = gameState.board[row][kingCol];
    if (!king || king.type !== 'king' || king.color !== gameState.currentPlayer) {
      return null;
    }

    // Verificar que la torre esté en la posición correcta
    const rook = gameState.board[row][rookCol];
    if (!rook || rook.type !== 'rook' || rook.color !== gameState.currentPlayer) {
      return null;
    }

    return {
      from: { row, col: kingCol },
      to: { row, col: isKingSide ? 6 : 2 }
    };
  }

  /**
   * Elige un movimiento válido aleatorio
   */
  private getRandomValidMove(validMoves: any[]): any {
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }

  /**
   * Cambia la dificultad de la IA
   */
  setDifficulty(difficulty: string): void {
    this.difficulty = difficulty;
  }

  /**
   * Obtiene la configuración específica de dificultad basada en ELO
   */
  private getDifficultyConfig(): any {
    const eloLevels = {
      'easy': { elo: 500, maxTime: 5, description: 'Principiante - ELO 500' },
      'intermediate': { elo: 1000, maxTime: 10, description: 'Intermedio - ELO 1000' },
      'hard': { elo: 1500, maxTime: 15, description: 'Difícil - ELO 1500' },
      'expert': { elo: 2500, maxTime: 25, description: 'Experto - ELO 2500' },
      'world-class': { elo: 3000, maxTime: 35, description: 'Clase Mundial - ELO 3000' }
    };

    return eloLevels[this.difficulty as keyof typeof eloLevels] || eloLevels.easy;
  }

  /**
   * Obtiene información del modelo de IA actual
   */
  getModelInfo(): string {
    return this.geminiService.getPerformanceStats().model;
  }

  /**
   * Obtiene estadísticas de rendimiento de la IA
   */
  getPerformanceStats(): { model: string; avgResponseTime: string; difficulty: string } {
    return this.geminiService.getPerformanceStats();
  }
}
