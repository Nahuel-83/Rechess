// src/components/chess/GameInfo.tsx
'use client';

import React from 'react';
import { GameState, Game, PieceColor } from '@/types';

interface GameInfoProps {
  game: Game | null;
  gameState: GameState | null;
  whiteTime?: string;
  blackTime?: string;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  className?: string;
}

export const GameInfo: React.FC<GameInfoProps> = ({
  game,
  gameState,
  whiteTime,
  blackTime,
  onPause,
  onResume,
  onReset,
  onUndo,
  canUndo = false,
  className = ''
}) => {
  const currentPlayer = gameState?.turn || 'w';
  const isGameOver = gameState?.isGameOver || false;

  // Determinar el estado del juego para mostrar
  const getGameStatus = () => {
    if (gameState?.isCheckmate) return 'Jaque Mate';
    if (gameState?.isCheck) return 'Jaque';
    if (gameState?.isStalemate) return 'Ahogado';
    if (gameState?.isThreefoldRepetition) return 'Tablas (Repetición)';
    if (gameState?.isInsufficientMaterial) return 'Tablas (Material Insuficiente)';
    if (gameState?.isDraw) return 'Tablas';
    return 'Normal';
  };

  const gameStatus = getGameStatus();

  return (
    <div className={`card rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Información del Juego
      </h3>

      {/* Estado del juego */}
      <div className="space-y-3">
        {/* Estado de la partida */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Estado:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            isGameOver
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : game?.status === 'playing'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            {isGameOver ? 'Finalizado' : game?.status === 'playing' ? 'En juego' : 'Pausado'}
          </span>
        </div>

        {/* Estado del tablero (jaque, jaque mate, etc.) */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Situación:</span>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            gameState?.isCheckmate
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : gameState?.isCheck
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                : gameState?.isDraw || gameState?.isStalemate
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {gameStatus}
          </span>
        </div>

        {/* Turno actual con indicador visual mejorado */}
        {!isGameOver && (
          <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg border-2 border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Turno:</span>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                  currentPlayer === 'w' 
                    ? 'bg-white dark:bg-gray-200 shadow-md ring-2 ring-blue-500 dark:ring-blue-400' 
                    : 'bg-gray-200 dark:bg-gray-600 opacity-50'
                }`}>
                  <span className="w-3 h-3 rounded-full bg-gray-800 dark:bg-gray-900"></span>
                  <span className="text-xs font-bold text-gray-900">Blancas</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                  currentPlayer === 'b' 
                    ? 'bg-gray-800 dark:bg-gray-900 shadow-md ring-2 ring-blue-500 dark:ring-blue-400' 
                    : 'bg-gray-300 dark:bg-gray-700 opacity-50'
                }`}>
                  <span className="w-3 h-3 rounded-full bg-white dark:bg-gray-200"></span>
                  <span className="text-xs font-bold text-white dark:text-gray-200">Negras</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Temporizadores */}
        {whiteTime && blackTime && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Blancas:</span>
              <span className={`text-sm font-mono font-semibold ${
                currentPlayer === 'w' && !isGameOver ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {whiteTime}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Negras:</span>
              <span className={`text-sm font-mono font-semibold ${
                currentPlayer === 'b' && !isGameOver ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {blackTime}
              </span>
            </div>
          </>
        )}

        {/* Información del resultado */}
        {isGameOver && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="text-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Resultado:</span>
              <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {gameState?.isCheckmate && (
                  <>Jaque mate - {gameState.winner === 'w' ? 'Blancas' : 'Negras'} ganan</>
                )}
                {gameState?.isStalemate && (
                  <>Tablas por ahogado</>
                )}
                {gameState?.isDraw && !gameState?.isStalemate && (
                  <>Tablas</>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        {game && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div>Modo: {game.settings.mode === 'ai' ? 'Contra IA' : 'Jugador vs Jugador'}</div>
              {game.settings.difficulty && (
                <div>Dificultad IA: {game.settings.difficulty}</div>
              )}
              {game.settings.timeControl && (
                <div>
                  Tiempo: {game.settings.timeControl.initial}min
                  {game.settings.timeControl.increment > 0 && ` + ${game.settings.timeControl.increment}s`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controles del juego */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-600">
          <div className="space-y-2">
            {/* Botones de control de partida */}
            <div className="flex gap-2">
              {game?.status === 'playing' && onPause && (
                <button
                  onClick={onPause}
                  className="flex-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Pausar partida"
                >
                  ⏸ Pausar
                </button>
              )}
              {game?.status === 'paused' && onResume && (
                <button
                  onClick={onResume}
                  className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                  title="Reanudar partida"
                >
                  ▶ Reanudar
                </button>
              )}
              {onReset && (
                <button
                  onClick={onReset}
                  className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-slate-600 dark:hover:bg-slate-700 text-white text-sm font-medium rounded transition-colors"
                  title="Reiniciar partida"
                >
                  🔄 Reiniciar
                </button>
              )}
            </div>
            
            {/* Botón de deshacer */}
            {onUndo && (
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 dark:disabled:hover:bg-blue-600"
                title={canUndo ? 'Deshacer último movimiento' : 'No se puede deshacer'}
              >
                ↶ Deshacer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
