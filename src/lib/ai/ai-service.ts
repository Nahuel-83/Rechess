// src/lib/ai/ai-service.ts
import { DifficultyLevel } from '@/types';
import { getDifficultyConfig } from './difficulty-config';

export interface AIMoveRequest {
  fen: string;
  difficulty: DifficultyLevel;
  gamePhase: 'opening' | 'middlegame' | 'endgame';
  moveHistory: string[];
  legalMoves: string[];
  thinkTime?: number;
}

export interface AIMoveResponse {
  move: string;
  confidence: number;
  evaluation?: number;
  reasoning?: string;
  model: string;
  thinkTime: number;
  isFallback?: boolean;
}

/**
 * Error personalizado para el servicio de IA
 */
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

/**
 * Configuración de Stockfish según nivel de dificultad
 */
interface StockfishConfig {
  skillLevel: number;
  depth: number;
  elo: number;
  threads: number;
  hash: number;
}

const STOCKFISH_CONFIGS: Record<DifficultyLevel, StockfishConfig> = {
  // Fácil: Muy débil - cualquiera puede ganar
  facil: { skillLevel: 20, depth: 1, elo: 600, threads: 1, hash: 8 },
  
  // Medio: Nivel adquisible para principiantes
  medio: { skillLevel: 20, depth: 3, elo: 1000, threads: 1, hash: 16 },
  
  // Difícil: Jugador intermedio fuerte
  dificil: { skillLevel: 20, depth: 15, elo: 1800, threads: 2, hash: 64 },
  
  // Clase Mundial: Nivel de Maestro Internacional
  claseMundial: { skillLevel: 20, depth: 25, elo: 2600, threads: 2, hash: 256 },
  
  // Experto: MÁXIMA FUERZA - Nivel sobrehumano
  experto: { skillLevel: 20, depth: 40, elo: 3500, threads: 4, hash: 1024 }
};

/**
 * AIService - Servicio para coordinar llamadas a IA con manejo robusto de errores
 * 
 * Características:
 * - Usa exclusivamente Stockfish WebAssembly
 * - Reintentos automáticos (hasta 3 intentos)
 * - Validación de movimientos
 * - Configuración de niveles de dificultad
 * - Fallback a movimiento aleatorio
 * - Manejo de timeouts
 */
export class AIService {
  private stockfish: Worker | null = null;
  private messageQueue: Array<(message: string) => void> = [];
  private isReady: boolean = false;

  constructor() {
    // Stockfish se inicializa bajo demanda
  }

  /**
   * Inicializa el motor Stockfish
   */
  private async initStockfish(): Promise<void> {
    if (this.stockfish && this.isReady) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Crear worker de Stockfish
        this.stockfish = new Worker('/stockfish.js');
        
        const timeout = setTimeout(() => {
          reject(new AIServiceError('Stockfish initialization timeout', 'INIT_TIMEOUT', false));
        }, 10000);

        this.stockfish.onmessage = (event) => {
          const message = event.data;
          
          if (message === 'uciok') {
            this.isReady = true;
            clearTimeout(timeout);
            resolve();
          }
          
          // Procesar mensajes en cola
          if (this.messageQueue.length > 0) {
            const handler = this.messageQueue.shift();
            if (handler) handler(message);
          }
        };

        this.stockfish.onerror = (error) => {
          clearTimeout(timeout);
          reject(new AIServiceError(
            `Stockfish error: ${error.message}`,
            'STOCKFISH_ERROR',
            false
          ));
        };

        // Iniciar protocolo UCI
        this.stockfish.postMessage('uci');
      } catch (error) {
        reject(new AIServiceError(
          `Failed to initialize Stockfish: ${(error as Error).message}`,
          'INIT_ERROR',
          false
        ));
      }
    });
  }

  /**
   * Envía un comando a Stockfish y espera respuesta
   */
  private sendCommand(command: string): Promise<string> {
    return new Promise((resolve) => {
      if (!this.stockfish) {
        resolve('');
        return;
      }

      this.messageQueue.push((message: string) => {
        resolve(message);
      });

      this.stockfish.postMessage(command);
    });
  }

  /**
   * Configura Stockfish según el nivel de dificultad
   * TODOS los niveles usan Skill Level 20 (máximo)
   * La dificultad se controla SOLO por UCI_Elo
   */
  private async configureStockfish(difficulty: DifficultyLevel): Promise<void> {
    if (!this.stockfish) return;

    const config = STOCKFISH_CONFIGS[difficulty];

    console.log('[STOCKFISH] Configuring for difficulty:', difficulty, 'ELO:', config.elo, 'Depth:', config.depth, 'Skill:', config.skillLevel);

    // Configuración base - TODOS con Skill Level 20
    this.stockfish.postMessage(`setoption name Threads value ${config.threads}`);
    this.stockfish.postMessage(`setoption name Hash value ${config.hash}`);
    this.stockfish.postMessage('setoption name Ponder value false');
    this.stockfish.postMessage('setoption name Skill Level value 20'); // ⚡ SIEMPRE 20
    
    // Configuración según nivel
    if (difficulty === 'experto') {
      // EXPERTO: MÁXIMA FUERZA - Sin limitaciones de ELO
      console.log('[STOCKFISH] ⚡ EXPERTO MODE - MAXIMUM STRENGTH - NO LIMITS');
      this.stockfish.postMessage('setoption name UCI_LimitStrength value false'); // SIN límites de ELO
      this.stockfish.postMessage('setoption name MultiPV value 1'); // Solo mejor movimiento
      this.stockfish.postMessage('setoption name Contempt value 50'); // Máxima agresividad
    } else {
      // Otros niveles: Limitar SOLO por ELO (Skill Level ya está en 20)
      console.log('[STOCKFISH] Limiting by ELO:', config.elo, '(Skill Level: 20)');
      this.stockfish.postMessage('setoption name UCI_LimitStrength value true');
      this.stockfish.postMessage(`setoption name UCI_Elo value ${config.elo}`);
      
      if (difficulty === 'claseMundial' || difficulty === 'dificil') {
        this.stockfish.postMessage('setoption name MultiPV value 1'); // Solo mejor movimiento
        this.stockfish.postMessage('setoption name Contempt value 24'); // Juega para ganar
      } else {
        // Niveles bajos: más variabilidad
        this.stockfish.postMessage('setoption name MultiPV value 5'); // Considera varias opciones
        this.stockfish.postMessage('setoption name Contempt value 0'); // Neutral
      }
    }
    
    console.log('[STOCKFISH] ✅ Configuration applied - Skill: 20, ELO:', config.elo);
  }

  /**
   * Solicita un movimiento de la IA con reintentos automáticos
   */
  async requestMoveWithRetry(
    request: AIMoveRequest,
    maxRetries: number = 3
  ): Promise<AIMoveResponse> {
    let lastError: Error | null = null;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.requestMove(request);

        // Validar que el movimiento es legal
        if (!this.validateAIMove(response.move, request.legalMoves)) {
          throw new AIServiceError(
            `AI returned illegal move: ${response.move}`,
            'INVALID_MOVE',
            true
          );
        }

        return response;

      } catch (error) {
        lastError = error as Error;

        // Si el error no es retryable, salir inmediatamente
        if (error instanceof AIServiceError && !error.retryable) {
          break;
        }

        // Esperar antes de reintentar (backoff exponencial)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 500;
          await this.delay(delay);
        }
      }
    }

    // Si todos los reintentos fallan, usar fallback
    const fallbackMove = this.selectRandomLegalMove(request.legalMoves);
    const thinkTime = Date.now() - startTime;

    return {
      move: fallbackMove,
      confidence: 0,
      reasoning: `Fallback after ${maxRetries} failed attempts: ${lastError?.message}`,
      model: 'fallback',
      thinkTime,
      isFallback: true
    };
  }

  /**
   * Limpia recursos de Stockfish
   */
  cleanup(): void {
    if (this.stockfish) {
      this.stockfish.postMessage('quit');
      this.stockfish.terminate();
      this.stockfish = null;
      this.isReady = false;
    }
  }

  /**
   * Solicita un movimiento de la IA (intento único)
   */
  async requestMove(request: AIMoveRequest): Promise<AIMoveResponse> {
    const startTime = Date.now();
    const config = STOCKFISH_CONFIGS[request.difficulty];
    
    // Aumentar timeout para niveles difíciles y situaciones complejas
    // Si no hay movimientos legales, es jaque mate o ahogado
    const baseTimeout = request.thinkTime || 5000;
    const isComplexPosition = request.legalMoves.length < 5; // Pocas opciones = posición crítica
    const timeout = isComplexPosition ? baseTimeout * 2 : baseTimeout;

    console.log('[STOCKFISH] AIService - requestMove() called:', {
      difficulty: request.difficulty,
      skillLevel: config.skillLevel,
      depth: config.depth,
      elo: config.elo,
      legalMovesCount: request.legalMoves.length,
      isComplexPosition,
      timeout,
      timestamp: new Date().toISOString()
    });

    // Validar que hay movimientos legales
    if (!request.legalMoves || request.legalMoves.length === 0) {
      console.error('[STOCKFISH] No legal moves available - game should be over');
      throw new AIServiceError(
        'No legal moves available - game is over',
        'NO_LEGAL_MOVES',
        false
      );
    }

    try {
      // Inicializar Stockfish si es necesario
      await this.initStockfish();

      // Configurar según dificultad
      await this.configureStockfish(request.difficulty);

      // Solicitar movimiento de Stockfish
      return await this.requestMoveFromStockfish(request, config, timeout, startTime);

    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }

      throw new AIServiceError(
        `Failed to request move: ${(error as Error).message}`,
        'API_ERROR',
        true
      );
    }
  }

  /**
   * Solicita movimiento usando Stockfish
   */
  private async requestMoveFromStockfish(
    request: AIMoveRequest,
    config: StockfishConfig,
    timeout: number,
    startTime: number
  ): Promise<AIMoveResponse> {
    if (!this.stockfish) {
      throw new AIServiceError('Stockfish not initialized', 'NOT_INITIALIZED', true);
    }

    return new Promise((resolve, reject) => {
      let bestMove = '';
      let evaluation = 0;
      let resolved = false;

      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          
          // Limpiar listener antes de rechazar
          if (this.stockfish) {
            this.stockfish.removeEventListener('message', messageHandler);
          }
          
          console.error('[STOCKFISH] Timeout after', timeout, 'ms');
          reject(new AIServiceError(
            `Stockfish timeout after ${timeout}ms`,
            'TIMEOUT',
            true
          ));
        }
      }, timeout);

      const messageHandler = (event: MessageEvent) => {
        const message = event.data;

        // Log para debugging
        if (message.includes('info') || message.includes('bestmove')) {
          console.log('[STOCKFISH] Message:', message.substring(0, 100));
        }

        // Capturar evaluación
        if (message.includes('score cp')) {
          const match = message.match(/score cp (-?\d+)/);
          if (match) {
            evaluation = parseInt(match[1]) / 100; // Convertir centipawns a pawns
          }
        }

        // Capturar evaluación de mate
        if (message.includes('score mate')) {
          const match = message.match(/score mate (-?\d+)/);
          if (match) {
            const mateIn = parseInt(match[1]);
            evaluation = mateIn > 0 ? 100 : -100; // Mate a favor o en contra
          }
        }

        // Capturar mejor movimiento
        if (message.startsWith('bestmove')) {
          const parts = message.split(' ');
          bestMove = parts[1];

          // Validar que el movimiento no sea "(none)" o inválido
          if (!bestMove || bestMove === '(none)' || bestMove === 'none') {
            console.error('[STOCKFISH] Invalid bestmove received:', message);
            
            if (!resolved) {
              resolved = true;
              clearTimeout(timeoutId);
              
              if (this.stockfish) {
                this.stockfish.removeEventListener('message', messageHandler);
              }
              
              reject(new AIServiceError(
                'Stockfish returned invalid move',
                'INVALID_MOVE',
                true
              ));
            }
            return;
          }

          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);

            if (this.stockfish) {
              this.stockfish.removeEventListener('message', messageHandler);
            }

            const thinkTime = Date.now() - startTime;

            console.log('[STOCKFISH] Move found:', bestMove, 'in', thinkTime, 'ms');

            resolve({
              move: bestMove,
              confidence: this.calculateConfidence(request.difficulty),
              evaluation,
              reasoning: `Stockfish (Skill ${config.skillLevel}, Depth ${config.depth}, ELO ~${config.elo})`,
              model: `stockfish-skill-${config.skillLevel}`,
              thinkTime
            });
          }
        }
      };

      if (this.stockfish) {
        this.stockfish.addEventListener('message', messageHandler);

        try {
          // Enviar posición y solicitar movimiento
          this.stockfish.postMessage('ucinewgame');
          this.stockfish.postMessage(`position fen ${request.fen}`);
          this.stockfish.postMessage(`go depth ${config.depth}`);
          
          console.log('[STOCKFISH] Commands sent, waiting for response...');
        } catch (error) {
          resolved = true;
          clearTimeout(timeoutId);
          this.stockfish.removeEventListener('message', messageHandler);
          
          reject(new AIServiceError(
            `Failed to send commands to Stockfish: ${(error as Error).message}`,
            'COMMAND_ERROR',
            true
          ));
        }
      }
    });
  }

  /**
   * Valida que un movimiento es legal
   */
  validateAIMove(move: string, legalMoves: string[]): boolean {
    if (!move || typeof move !== 'string') {
      return false;
    }

    const normalizedMove = move.toLowerCase().trim();
    return legalMoves.some(legal => legal.toLowerCase() === normalizedMove);
  }

  /**
   * Selecciona un movimiento aleatorio de los legales
   */
  private selectRandomLegalMove(legalMoves: string[]): string {
    if (!legalMoves || legalMoves.length === 0) {
      return 'e2e4'; // Movimiento por defecto
    }

    const randomIndex = Math.floor(Math.random() * legalMoves.length);
    return legalMoves[randomIndex];
  }

  /**
   * Calcula la confianza según el nivel de dificultad
   */
  private calculateConfidence(difficulty: DifficultyLevel): number {
    const confidenceMap: Record<DifficultyLevel, number> = {
      facil: 0.3,
      medio: 0.5,
      dificil: 0.7,
      claseMundial: 0.85,
      experto: 0.95
    };

    return confidenceMap[difficulty] || 0.5;
  }

  /**
   * Crea una promesa que rechaza después del timeout
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new AIServiceError(
          `Request timeout after ${ms}ms`,
          'TIMEOUT',
          true
        ));
      }, ms);
    });
  }

  /**
   * Espera un tiempo determinado
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
