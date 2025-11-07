import { useState, useCallback, useEffect } from 'react';
import './App.css';
import { getValidMoves } from './game/game-logic';
import { ChessAI } from './ai/chess-ai';
import { ChessBoard } from './components/ChessBoard';
import { GameInfo } from './components/GameInfo';
import { GameControls } from './components/GameControls';
import { PawnPromotionDialog } from './components/PawnPromotionDialog';
import { chessGameManager } from './game/chess-game-manager';
import { analyzeGameState } from './game/move-validator';
import type { GameState, Position, PieceType } from './types/chess';

function App() {
  // Estado del juego
  const [gameState, setGameState] = useState<GameState>(() => chessGameManager.getGameState());
  const [gameAnalysis, setGameAnalysis] = useState(analyzeGameState(gameState));
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('pvp');
  const [aiDifficulty, setAIDifficulty] = useState<string>('easy');
  const [boardFlipped, setBoardFlipped] = useState<boolean>(false);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{
    position: Position;
    piece: any;
  } | null>(null);

  // Instancia de IA (con manejo de errores)
  const [ai, setAi] = useState<ChessAI | null>(null);

  useEffect(() => {
    try {
      const newAi = new ChessAI(aiDifficulty);
      setAi(newAi);
      setConfigError(null);
    } catch (error) {
      setAi(null);
      setConfigError(error instanceof Error ? error.message : 'Error de configuración de IA');
    }
  }, [aiDifficulty]);

  // Función para mostrar/ocultar estadísticas de rendimiento
  const [showPerformanceStats, setShowPerformanceStats] = useState<boolean>(false);

  const togglePerformanceStats = useCallback(() => {
    setShowPerformanceStats(prev => !prev);
  }, []);

  // Actualizar análisis del juego cuando cambie el estado
  useEffect(() => {
    setGameAnalysis(analyzeGameState(gameState));
  }, [gameState]);

  /**
   * Maneja el click en una casilla del tablero
   */
  const handleSquareClick = useCallback((position: Position) => {
    // Si hay una promoción pendiente, no permitir interacciones
    if (pendingPromotion) return;

    // Si la IA está pensando, no permitir interacciones
    if (isAIThinking) return;

    // Si no hay casilla seleccionada
    if (!selectedSquare) {
      const piece = gameState.board[position.row][position.col];

      // Solo seleccionar si hay una pieza del jugador actual
      if (piece && piece.color === gameState.currentPlayer) {
        setSelectedSquare(position);

        // En modo IA, solo permitir seleccionar piezas blancas (jugador humano)
        if (gameMode === 'ai' && piece.color !== 'white') return;

        // Calcular movimientos válidos para la pieza seleccionada
        const validMovesForPiece = getValidMoves(gameState.board, position, gameState);
        setValidMoves(validMovesForPiece);
      }
      return;
    }

    // Si se clickea la misma casilla, deseleccionar
    if (selectedSquare.row === position.row && selectedSquare.col === position.col) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // Si se clickea otra pieza del mismo color, cambiar selección
    const piece = gameState.board[position.row][position.col];
    if (piece && piece.color === gameState.currentPlayer) {
      setSelectedSquare(position);
      const validMovesForPiece = getValidMoves(gameState.board, position, gameState);
      setValidMoves(validMovesForPiece);
      return;
    }

    // Intentar hacer el movimiento si es válido
    if (selectedSquare && validMoves.some(move => move.row === position.row && move.col === position.col)) {
      const moveResult = chessGameManager.makeMove(selectedSquare, position);

      if (moveResult.success) {
        setGameState(moveResult.newState!);

        // Si hay una promoción pendiente, mostrar diálogo
        if (moveResult.pendingPromotion) {
          setPendingPromotion(moveResult.pendingPromotion);
        }

        setSelectedSquare(null);
        setValidMoves([]);

        // Si es modo IA y es turno de la IA (negras), hacer movimiento de IA
        if (gameMode === 'ai' && gameState.currentPlayer === 'black') {
          makeAIMove();
        }
      }
    } else {
      // Movimiento inválido, deseleccionar
      setSelectedSquare(null);
      setValidMoves([]);
    }
  }, [gameState, selectedSquare, gameMode, isAIThinking, validMoves, pendingPromotion]);

  /**
   * Completa la promoción de un peón
   */
  const completePawnPromotion = useCallback((promotionPieceType: PieceType) => {
    if (!pendingPromotion) return;

    const newState = chessGameManager.completePawnPromotion(
      pendingPromotion.position,
      pendingPromotion.piece,
      promotionPieceType
    );

    setGameState(newState);
    setPendingPromotion(null);
  }, [pendingPromotion]);

  /**
   * Realiza un movimiento de la IA
   */
  const makeAIMove = useCallback(async () => {
    if (gameMode !== 'ai' || gameState.currentPlayer !== 'black' || !ai) return;

    setIsAIThinking(true);

    try {
      // Tiempo de pensamiento adaptativo según dificultad (más rápido en niveles bajos)
      const getThinkingTime = (diff: string) => {
        switch (diff) {
          case 'easy': return 300;      // 0.3 segundos
          case 'intermediate': return 500;  // 0.5 segundos
          case 'hard': return 800;      // 0.8 segundos
          case 'expert': return 1000;   // 1 segundo
          case 'world-class': return 1200; // 1.2 segundos
          default: return 600;
        }
      };

      await new Promise(resolve => setTimeout(resolve, getThinkingTime(aiDifficulty)));

      // Obtener el mejor movimiento de la IA
      const bestMove = await ai.getBestMove(gameState);

      if (bestMove) {
        // Aplicar el movimiento
        const moveResult = chessGameManager.makeMove(bestMove.from, bestMove.to);

        if (moveResult.success) {
          setGameState(moveResult.newState!);

          // Si hay una promoción pendiente, completarla automáticamente (la IA siempre elige reina)
          if (moveResult.pendingPromotion) {
            const promotedState = chessGameManager.completePawnPromotion(
              moveResult.pendingPromotion.position,
              moveResult.pendingPromotion.piece,
              'queen'
            );
            setGameState(promotedState);
          }
        }
      }
    } catch (error) {
      console.error('Error en movimiento de IA:', error);
    } finally {
      setIsAIThinking(false);
    }
  }, [gameMode, gameState, ai]);

  /**
   * Inicia una nueva partida
   */
  const handleNewGame = useCallback(() => {
    const newState = chessGameManager.resetGame();
    setGameState(newState);
    setSelectedSquare(null);
    setValidMoves([]);
    setIsAIThinking(false);
    setPendingPromotion(null);
  }, []);

  /**
   * Deshace el último movimiento
   */
  const handleUndo = useCallback(() => {
    const newState = chessGameManager.undoLastMove();
    setGameState(newState);
  }, []);

  /**
   * Voltea el tablero
   */
  const handleFlipBoard = useCallback(() => {
    setBoardFlipped(prev => !prev);
  }, []);

  /**
   * Maneja el cambio de modo de juego
   */
  const handleGameModeChange = useCallback((mode: 'pvp' | 'ai') => {
    setGameMode(mode);
    if (mode === 'pvp') {
      setIsAIThinking(false);
    }
  }, []);

  /**
   * Maneja el cambio de dificultad de IA
   */
  const handleAIDifficultyChange = useCallback((difficulty: string) => {
    setAIDifficulty(difficulty);
    if (ai) {
      ai.setDifficulty(difficulty);
    }
  }, [ai]);

  // Efecto para hacer movimiento de IA cuando sea su turno
  useEffect(() => {
    if (gameMode === 'ai' && gameState.currentPlayer === 'black' && !isAIThinking && ai) {
      makeAIMove();
    }
  }, [gameMode, gameState.currentPlayer, makeAIMove, isAIThinking, ai]);

  // Función para optimizar rendimiento de la IA
  const handleOptimizePerformance = useCallback(() => {
    // Configurar límite de historial más conservador para sesiones largas
    chessGameManager.setMaxMoveHistory(30);

    // Reducir tiempo de pensamiento de IA para respuestas más rápidas
    if (ai) {
      // Nota: Esto podría requerir ajustes en la configuración de la IA
    }
  }, [ai]);

  // Efecto para limpiar recursos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      // Limpiar cualquier recurso pendiente si es necesario
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>♛ Ajedrez Avanzado ♛</h1>
        <p>Juega contra otro jugador o desafía a nuestra IA de clase mundial</p>
      </header>

      {configError && (
        <div className="config-error">
          <h2>⚠️ Error de Configuración</h2>
          <p>{configError}</p>
          <p>Por favor, configura tu API key de Gemini en el archivo <code>.env</code></p>
          <details>
            <summary>Instrucciones de configuración</summary>
            <ol>
              <li>Ve a <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
              <li>Crea una API key gratuita</li>
              <li>Copia el archivo <code>.env.example</code> a <code>.env</code></li>
              <li>Reemplaza <code>your_gemini_api_key_here</code> con tu API key real</li>
              <li>Reinicia el servidor de desarrollo</li>
            </ol>
          </details>
        </div>
      )}

      {!configError && (
        <>
          <main className="game-container">
            {/* Panel de información del juego */}
            <div className="game-info-panel">
              <GameInfo
                gameState={gameState}
                whiteTime={gameMode === 'ai' ? 300 : undefined}
                blackTime={gameMode === 'ai' ? 300 : undefined}
                gameMode={gameMode}
                aiDifficulty={aiDifficulty}
              />
            </div>

            <div className="board-container">
              <ChessBoard
                gameState={gameState}
                onSquareClick={handleSquareClick}
                selectedSquare={selectedSquare}
                validMoves={validMoves}
                flipped={boardFlipped}
              />

              {isAIThinking && !gameAnalysis.isCheckmate && !gameAnalysis.isStalemate && (
                <div className="ai-thinking">
                  <div className="thinking-indicator">
                    <span>🤔</span>
                    <p>La IA está pensando...</p>
                  </div>
                </div>
              )}

              {/* Diálogo de promoción de peón */}
              {pendingPromotion && (
                <PawnPromotionDialog
                  onSelectPiece={completePawnPromotion}
                  color={pendingPromotion.piece.color}
                />
              )}
            </div>
          </main>

          {/* Panel de controles */}
          <div className="game-controls-panel">
            <GameControls
              onNewGame={handleNewGame}
              onUndo={handleUndo}
              onFlipBoard={handleFlipBoard}
              canUndo={gameState.moveHistory.length > 0}
              gameMode={gameMode}
              onGameModeChange={handleGameModeChange}
              aiDifficulty={aiDifficulty}
              onAIDifficultyChange={handleAIDifficultyChange}
            />
          </div>

          <footer className="app-footer">
            <p>
              Dificultades disponibles: Fácil (ELO 500), Intermedio (ELO 1000), Difícil (ELO 1500), Experto (ELO 2500), Clase Mundial (ELO 3000)
            </p>
            <p>
              La IA utiliza la poderosa API de Gemini AI para análisis experto de posiciones
            </p>
            <button onClick={togglePerformanceStats} className="performance-toggle">
              {showPerformanceStats ? 'Ocultar' : 'Mostrar'} Estadísticas de Rendimiento
            </button>
          </footer>

          {/* Panel de estadísticas de rendimiento */}
          {showPerformanceStats && (
            <div className="performance-stats">
              <h3>📊 Estadísticas de Rendimiento</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Movimientos en historial:</span>
                  <span className="stat-value">{chessGameManager.getHistoryStats().currentLength}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Límite del historial:</span>
                  <span className="stat-value">{chessGameManager.getHistoryStats().maxLength}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Modelo de IA:</span>
                  <span className="stat-value">{ai?.getModelInfo() || 'Gemini 1.5 Flash'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tiempo de respuesta:</span>
                  <span className="stat-value">{ai?.getPerformanceStats?.()?.avgResponseTime || '~1-3s'}</span>
                </div>
              </div>
              <div className="performance-actions">
                <button
                  onClick={() => {
                    handleOptimizePerformance();
                    setShowPerformanceStats(false);
                  }}
                  className="optimize-btn"
                >
                  Aplicar Optimización
                </button>
                <button
                  onClick={() => chessGameManager.setMaxMoveHistory(100)}
                  className="expand-btn"
                >
                  Expandir (100 movimientos)
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
