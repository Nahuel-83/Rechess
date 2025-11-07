// src/app/game/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GameMode, DifficultyLevel, GameSettings } from '@/types';
import { SimpleBoard, MoveHistory, CapturedPieces, GameInfo } from '@/components/chess';
import { useChessGame, useChessAI, useGameTimer } from '@/hooks';
import { LoadingIA } from '@/components/ui/LoadingIA';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DifficultyValidator } from '@/lib/validation/difficulty-validator';

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Hooks del juego
  const { game, gameState, makeMove, createGame, startGame, pauseGame, resumeGame, resetGame, undoMove, canUndo } = useChessGame();
  const { requestAIMove, isThinking, error: aiError } = useChessAI();

  // Estado de configuración
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);

  // Configurar temporizadores
  const {
    whiteTime,
    blackTime,
    startTimer,
    pauseTimer,
    stopTimer,
    switchTurn,
    getFormattedTime,
    isTimeUp
  } = useGameTimer(
    gameSettings?.timeControl?.initial || 10,
    gameSettings?.timeControl?.increment || 0
  );

  // Cargar configuración desde URL
  useEffect(() => {
    const mode = searchParams.get('mode') as GameMode;
    const difficultyParam = searchParams.get('difficulty');
    const playerColor = searchParams.get('playerColor') as 'w' | 'b';
    const initialTime = parseInt(searchParams.get('initialTime') || '10');
    const increment = parseInt(searchParams.get('increment') || '0');

    console.log('[DIFFICULTY_TRACKING] Game Page - Reading URL params:', {
      mode,
      difficulty: difficultyParam,
      playerColor,
      initialTime,
      increment,
      allParams: Object.fromEntries(searchParams.entries()),
      timestamp: new Date().toISOString()
    });

    if (mode && playerColor) {
      const settings: GameSettings = {
        mode,
        playerColor,
        timeControl: {
          initial: initialTime,
          increment
        }
      };

      if (mode === 'ai' && difficultyParam) {
        // Validate difficulty from URL params
        const isValidDifficulty = DifficultyValidator.isValid(difficultyParam);
        
        if (!isValidDifficulty) {
          console.warn('[DIFFICULTY_TRACKING] Game Page - Invalid difficulty in URL params:', {
            receivedDifficulty: difficultyParam,
            difficultyType: typeof difficultyParam,
            timestamp: new Date().toISOString()
          });
        }
        
        // Normalize difficulty (will use 'medio' as default if invalid)
        const normalizedDifficulty = DifficultyValidator.normalize(difficultyParam);
        
        if (normalizedDifficulty !== difficultyParam) {
          console.warn('[DIFFICULTY_TRACKING] Game Page - Difficulty normalized:', {
            original: difficultyParam,
            normalized: normalizedDifficulty,
            timestamp: new Date().toISOString()
          });
        }
        
        settings.difficulty = normalizedDifficulty;
      }

      console.log('[DIFFICULTY_TRACKING] Game Page - Creating GameSettings object:', {
        settings,
        hasDifficulty: !!settings.difficulty,
        validatedDifficulty: settings.difficulty,
        timestamp: new Date().toISOString()
      });

      setGameSettings(settings);
      setIsLoadingConfig(false);
    }
  }, [searchParams]);

  // Crear y empezar partida cuando se carga la configuración
  useEffect(() => {
    if (gameSettings && !game) {
      console.log('[DIFFICULTY_TRACKING] Game Page - Creating game with settings:', {
        settings: gameSettings,
        difficulty: gameSettings.difficulty,
        mode: gameSettings.mode,
        timestamp: new Date().toISOString()
      });
      createGame(gameSettings);
    }
  }, [gameSettings, game, createGame]);

  // Iniciar partida cuando se crea
  useEffect(() => {
    if (game && !gameState?.isGameOver && game.status === 'waiting') {
      console.log('Starting game:', game);
      startGame();
      startTimer();
    }
  }, [game, gameState, startGame, startTimer]);



  // Manejar movimiento de IA
  useEffect(() => {
    // Evitar bucle: solo ejecutar si no está pensando y es turno de IA
    if (!game || !gameState || isThinking) return;
    if (game.settings.mode !== 'ai') return;
    if (gameState.turn === game.settings.playerColor) return;
    if (gameState.isGameOver) return;

    const playAIMove = async () => {
      try {
        const history = gameState.history.map(h => h.san);
        const legalMoves = gameState.legalMoves || [];
        
        // Solicitar movimiento de IA (con fallback automático a movimiento aleatorio)
        const aiMove = await requestAIMove(
          gameState.fen, 
          game.settings.difficulty || 'medio', 
          history,
          legalMoves
        );

        // Convertir movimiento LAN a formato interno
        const from = aiMove.move.substring(0, 2);
        const to = aiMove.move.substring(2, 4);
        const promotion = aiMove.move.length === 5 ? aiMove.move[4] : undefined;

        makeMove(from, to, promotion);

        // Cambiar turno después del movimiento de IA
        setTimeout(() => {
          switchTurn();
        }, 500);
      } catch (error) {
        console.error('Error making AI move:', error);
        // El hook ya maneja el fallback, esto solo captura errores críticos
      }
    };

    playAIMove();
  }, [gameState?.fen, gameState?.turn, game?.settings.mode, isThinking]);

  // Manejar fin de tiempo
  useEffect(() => {
    if (gameState && (isTimeUp('w') || isTimeUp('b'))) {
      pauseGame();
      stopTimer();
    }
  }, [isTimeUp, pauseGame, stopTimer, gameState]);

  if (isLoadingConfig) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando configuración de partida...</p>
        </div>
      </div>
    );
  }

  if (!game || !gameState) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error al cargar la partida</p>
          <button
            onClick={() => router.push('/lobby')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Volver al Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel izquierdo - Información del juego */}
          <div className="lg:col-span-1 space-y-4">
            <GameInfo
              game={game}
              gameState={gameState}
              whiteTime={getFormattedTime('w')}
              blackTime={getFormattedTime('b')}
              onPause={pauseGame}
              onResume={resumeGame}
              onReset={resetGame}
              onUndo={undoMove}
              canUndo={canUndo}
            />

            <CapturedPieces
              whiteCaptured={gameState?.capturedPieces?.white || []}
              blackCaptured={gameState?.capturedPieces?.black || []}
            />
          </div>

          {/* Panel central - Tablero */}
          <div className="lg:col-span-2 flex justify-center">
            <SimpleBoard
              size={480}
              flipped={game.settings.playerColor === 'b'}
              fen={gameState.fen}
              playerColor={game.settings.mode === 'ai' ? game.settings.playerColor : undefined}
              isAIThinking={isThinking}
              onMove={(from, to, promotion) => {
                // Hacer el movimiento (con promoción si aplica)
                makeMove(from, to, promotion);
                // Cambiar turno después del movimiento del jugador
                if (game.settings.mode === 'ai') {
                  setTimeout(() => {
                    switchTurn();
                  }, 300);
                }
              }}
            />
          </div>

          {/* Panel derecho - Historial y controles */}
          <div className="lg:col-span-1 space-y-4">
            <MoveHistory
              moves={gameState.history}
              onMoveClick={(moveIndex) => {
                // TODO: Implementar navegación al movimiento específico
                console.log('Navigate to move:', moveIndex);
              }}
            />

            {/* Información de IA */}
            {game.settings.mode === 'ai' && (
              <div className="card rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Información IA
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <div>• Nivel: {game.settings.difficulty}</div>
                  <div>• Estado: {isThinking ? 'Pensando...' : 'Esperando'}</div>
                  {aiError && (
                    <div className="text-red-600 dark:text-red-400">Error: {aiError}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Loading overlay para movimientos de IA */}
      <LoadingIA
        isVisible={isThinking}
        message="La IA está analizando la posición..."
      />

      <Footer />
    </div>
  );
}
