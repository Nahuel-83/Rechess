// src/app/lobby/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameMode, DifficultyLevel, PieceColor } from '@/types';
import { GameModeSelector } from '@/components/ui/GameModeSelector';
import { DifficultySelector } from '@/components/ui/DifficultySelector';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

type ColorSelection = PieceColor | 'random';

export default function LobbyPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<GameMode>('ai');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medio');
  const [playerColor, setPlayerColor] = useState<ColorSelection>('w');
  const [timeControl, setTimeControl] = useState<{ initial: number; increment: number } | null>({ initial: 10, increment: 0 });
  const [validationError, setValidationError] = useState<string>('');

  // Log difficulty selection changes
  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    console.log('[DIFFICULTY_TRACKING] Lobby - Difficulty selected:', {
      difficulty,
      mode: selectedMode,
      timestamp: new Date().toISOString()
    });
    setSelectedDifficulty(difficulty);
  };

  const validateConfiguration = (): boolean => {
    setValidationError('');

    // Validar modo de juego
    if (!selectedMode) {
      setValidationError('Debes seleccionar un modo de juego');
      return false;
    }

    // Validar dificultad si es modo IA
    if (selectedMode === 'ai' && !selectedDifficulty) {
      setValidationError('Debes seleccionar un nivel de dificultad para jugar contra la IA');
      return false;
    }

    // Validar color del jugador
    if (!playerColor) {
      setValidationError('Debes seleccionar un color');
      return false;
    }

    // Validar control de tiempo si está configurado
    if (timeControl) {
      if (timeControl.initial < 0 || timeControl.increment < 0) {
        setValidationError('Los valores de tiempo no pueden ser negativos');
        return false;
      }
    }

    return true;
  };

  const handleStartGame = () => {
    // Validar configuración antes de iniciar
    if (!validateConfiguration()) {
      return;
    }

    // Determinar color del jugador (aleatorio si se seleccionó random)
    const finalPlayerColor: PieceColor = playerColor === 'random' 
      ? (Math.random() < 0.5 ? 'w' : 'b')
      : playerColor as PieceColor;

    // Generar ID único para la partida
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Navegar a la página del juego con la configuración
    const params = new URLSearchParams({
      mode: selectedMode,
      ...(selectedMode === 'ai' && { difficulty: selectedDifficulty }),
      playerColor: finalPlayerColor,
      ...(timeControl && {
        initialTime: timeControl.initial.toString(),
        increment: timeControl.increment.toString()
      })
    });

    console.log('[DIFFICULTY_TRACKING] Lobby - Starting game with final settings:', {
      mode: selectedMode,
      difficulty: selectedMode === 'ai' ? selectedDifficulty : 'N/A',
      playerColor: finalPlayerColor,
      timeControl,
      gameId,
      urlParams: params.toString(),
      timestamp: new Date().toISOString()
    });

    router.push(`/game/${gameId}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Configuración de Partida
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Elige tu modo de juego y configura la partida
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Selección de modo y dificultad */}
          <div className="space-y-6">
            <GameModeSelector
              selectedMode={selectedMode}
              selectedDifficulty={selectedDifficulty}
              onModeChange={setSelectedMode}
              onDifficultyChange={handleDifficultyChange}
            />

            {selectedMode === 'ai' && (
              <DifficultySelector
                selected={selectedDifficulty}
                onChange={handleDifficultyChange}
              />
            )}
          </div>

          {/* Configuración adicional */}
          <div className="space-y-6">
            {/* Color del jugador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {selectedMode === 'ai' ? 'Tu Color' : 'Color de Jugador 1'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPlayerColor('w')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    playerColor === 'w'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-1">⚪</div>
                  <div className="font-medium text-sm">Blancas</div>
                </button>
                <button
                  onClick={() => setPlayerColor('b')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    playerColor === 'b'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl mb-1">⚫</div>
                  <div className="font-medium text-sm">Negras</div>
                </button>
                {selectedMode === 'ai' && (
                  <button
                    onClick={() => setPlayerColor('random')}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      playerColor === 'random'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">🎲</div>
                    <div className="font-medium text-sm">Aleatorio</div>
                  </button>
                )}
              </div>
            </div>

            {/* Control de tiempo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Control de Tiempo
              </label>
              
              {/* Opción de sin tiempo */}
              <div className="mb-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={timeControl === null}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTimeControl(null);
                      } else {
                        setTimeControl({ initial: 10, increment: 0 });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Sin límite de tiempo
                  </span>
                </label>
              </div>

              {timeControl !== null && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Tiempo Inicial (minutos)
                    </label>
                    <select
                      value={timeControl.initial}
                      onChange={(e) => setTimeControl(prev => prev ? { ...prev, initial: parseInt(e.target.value) } : { initial: parseInt(e.target.value), increment: 0 })}
                      className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value={1}>1 minuto</option>
                      <option value={3}>3 minutos</option>
                      <option value={5}>5 minutos</option>
                      <option value={10}>10 minutos</option>
                      <option value={15}>15 minutos</option>
                      <option value={30}>30 minutos</option>
                      <option value={60}>60 minutos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Incremento (segundos)
                    </label>
                    <select
                      value={timeControl.increment}
                      onChange={(e) => setTimeControl(prev => prev ? { ...prev, increment: parseInt(e.target.value) } : { initial: 10, increment: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value={0}>Sin incremento</option>
                      <option value={1}>1 segundo</option>
                      <option value={2}>2 segundos</option>
                      <option value={3}>3 segundos</option>
                      <option value={5}>5 segundos</option>
                      <option value={10}>10 segundos</option>
                      <option value={15}>15 segundos</option>
                      <option value={30}>30 segundos</option>
                    </select>
                  </div>
                </div>
              )}
              
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {timeControl === null ? (
                  <span>⏱️ Partida sin límite de tiempo</span>
                ) : (
                  <span>
                    ⏱️ Cada jugador tendrá {timeControl.initial} minuto{timeControl.initial !== 1 ? 's' : ''}
                    {timeControl.increment > 0 && ` + ${timeControl.increment}s por movimiento`}
                  </span>
                )}
              </div>
            </div>

            {/* Información de la configuración */}
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Resumen de Configuración</h3>
              <div className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                <div>• Modo: {selectedMode === 'ai' ? 'Jugador vs IA' : 'Jugador vs Jugador'}</div>
                {selectedMode === 'ai' && (
                  <div>• Dificultad IA: {
                    selectedDifficulty === 'facil' ? 'Fácil' :
                    selectedDifficulty === 'medio' ? 'Medio' :
                    selectedDifficulty === 'dificil' ? 'Difícil' :
                    selectedDifficulty === 'claseMundial' ? 'Clase Mundial' : 'Experto'
                  }</div>
                )}
                <div>• {selectedMode === 'ai' ? 'Tu color' : 'Jugador 1'}: {
                  playerColor === 'w' ? 'Blancas' : 
                  playerColor === 'b' ? 'Negras' : 
                  'Aleatorio'
                }</div>
                <div>• Tiempo: {
                  timeControl === null ? 'Sin límite' : 
                  `${timeControl.initial}min${timeControl.increment > 0 ? ` + ${timeControl.increment}s` : ''}`
                }</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error de validación */}
        {validationError && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-600 dark:text-red-300 text-sm">
                ⚠️ {validationError}
              </span>
            </div>
          </div>
        )}

        {/* Botón de inicio */}
        <div className="mt-8 text-center">
          <button
            onClick={handleStartGame}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Iniciar Partida
          </button>
          
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Revisa la configuración antes de iniciar
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
