// src/components/ui/GameModeSelector.tsx
'use client';

import React from 'react';
import { GameMode, DifficultyLevel } from '@/types';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  selectedDifficulty?: DifficultyLevel;
  onModeChange: (mode: GameMode) => void;
  onDifficultyChange?: (difficulty: DifficultyLevel) => void;
  className?: string;
  showDifficulty?: boolean;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  selectedMode,
  selectedDifficulty,
  onModeChange,
  onDifficultyChange,
  className = '',
  showDifficulty = true
}) => {
  const modes: { mode: GameMode; title: string; description: string }[] = [
    {
      mode: 'pvp',
      title: 'Jugador vs Jugador',
      description: 'Juega contra otro jugador localmente'
    },
    {
      mode: 'ai',
      title: 'Jugador vs IA',
      description: 'Juega contra la inteligencia artificial'
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Modo de Juego
      </label>

      <div className="grid grid-cols-1 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.mode}
            onClick={() => onModeChange(mode.mode)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${selectedMode === mode.mode
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-500'
              }
            `}
          >
            <div className="font-medium text-gray-900 dark:text-white">
              {mode.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {mode.description}
            </div>
          </button>
        ))}
      </div>

      {/* Selector de dificultad (solo para modo IA) */}
      {showDifficulty && selectedMode === 'ai' && onDifficultyChange && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Nivel de Dificultad IA
          </label>
          <select
            value={selectedDifficulty || 'medio'}
            onChange={(e) => onDifficultyChange(e.target.value as DifficultyLevel)}
            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option value="facil">Fácil (ELO 500)</option>
            <option value="medio">Medio (ELO 1000)</option>
            <option value="dificil">Difícil (ELO 2000)</option>
            <option value="claseMundial">Clase Mundial (ELO 3000)</option>
            <option value="experto">Experto (ELO 3200)</option>
          </select>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
        <div className="font-medium mb-2 text-blue-900 dark:text-blue-100">Características del modo:</div>
        {selectedMode === 'pvp' ? (
          <div>• Juega contra otro jugador en el mismo dispositivo</div>
        ) : (
          <div>
            <div>• Juega contra IA avanzada con Stockfish 17.1</div>
            {selectedDifficulty && (
              <div>• Nivel seleccionado: {selectedDifficulty}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
