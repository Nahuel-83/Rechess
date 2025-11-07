// src/components/ui/DifficultySelector.tsx
'use client';

import React from 'react';
import { DifficultyLevel } from '@/types';
import { DIFFICULTY_LEVELS } from '@/lib/ai/difficulty-config';

interface DifficultySelectorProps {
  selected: DifficultyLevel;
  onChange: (difficulty: DifficultyLevel) => void;
  className?: string;
  disabled?: boolean;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selected,
  onChange,
  className = '',
  disabled = false
}) => {
  const difficulties: DifficultyLevel[] = ['facil', 'medio', 'dificil', 'claseMundial', 'experto'];

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Nivel de Dificultad IA
      </label>

      <div className="grid grid-cols-1 gap-2">
        {difficulties.map((difficulty) => {
          const config = DIFFICULTY_LEVELS[difficulty];
          const isSelected = selected === difficulty;

          return (
            <button
              key={difficulty}
              onClick={() => !disabled && onChange(difficulty)}
              disabled={disabled}
              className={`
                p-3 rounded-lg border-2 text-left transition-all
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-500'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium capitalize text-gray-900 dark:text-white">
                    {difficulty === 'facil' ? 'Fácil' :
                     difficulty === 'medio' ? 'Medio' :
                     difficulty === 'dificil' ? 'Difícil' :
                     difficulty === 'claseMundial' ? 'Clase Mundial' : 'Experto'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ELO: {config.elo}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400 dark:text-gray-500">
                  <div>Skill {config.skillLevel}</div>
                  <div>Depth {config.depth}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-slate-50 dark:bg-slate-700 p-2 rounded">
        <div className="font-medium mb-1 text-gray-700 dark:text-gray-300">Características del nivel seleccionado:</div>
        <div>• Motor: Stockfish 17.1 WebAssembly</div>
        <div>• Skill Level: {DIFFICULTY_LEVELS[selected].skillLevel}</div>
        <div>• Profundidad: {DIFFICULTY_LEVELS[selected].depth}</div>
        <div>• Tiempo de análisis: {DIFFICULTY_LEVELS[selected].thinkTime / 1000}s</div>
      </div>
    </div>
  );
};
