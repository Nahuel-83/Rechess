// src/components/chess/AIThinkingIndicator.tsx
'use client';

import React, { useEffect, useState } from 'react';
import type { DifficultyLevel } from '@/types';

interface AIThinkingIndicatorProps {
  difficulty: DifficultyLevel;
  thinkingTime: number; // ms transcurridos
  onCancel?: () => void;
}

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  facil: 'Fácil (ELO 500-900)',
  medio: 'Medio (ELO 1000-1600)',
  dificil: 'Avanzado (ELO 1800-2400)',
  claseMundial: 'Clase Mundial (ELO 2400+)',
  experto: 'Gran Maestro (ELO 2600+)',
};

export const AIThinkingIndicator: React.FC<AIThinkingIndicatorProps> = ({
  difficulty,
  thinkingTime,
  onCancel,
}) => {
  const [displayTime, setDisplayTime] = useState(thinkingTime);

  useEffect(() => {
    setDisplayTime(thinkingTime);
  }, [thinkingTime]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100);
    return `${seconds}.${milliseconds}s`;
  };

  const showCancelButton = displayTime > 10000; // Mostrar después de 10 segundos

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="card rounded-lg p-6 max-w-md mx-4 text-center shadow-2xl">
        {/* Icono animado de pensamiento */}
        <div className="mb-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center relative">
            {/* Círculo pulsante */}
            <div className="absolute w-20 h-20 bg-blue-400 dark:bg-blue-500 rounded-full animate-ping opacity-20"></div>
            
            {/* Icono de cerebro/pensamiento */}
            <div className="relative z-10">
              <svg
                className="w-10 h-10 text-blue-600 dark:text-blue-300 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          IA Pensando...
        </h3>

        {/* Nivel de dificultad */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            {DIFFICULTY_LABELS[difficulty]}
          </span>
        </div>

        {/* Tiempo transcurrido */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
            Tiempo de cálculo
          </p>
          <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
            {formatTime(displayTime)}
          </p>
        </div>

        {/* Indicador de actividad (puntos animados) */}
        <div className="flex justify-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>

        {/* Mensaje descriptivo */}
        <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">
          Analizando la posición y calculando el mejor movimiento...
        </p>

        {/* Botón de cancelar (opcional, aparece después de 10 segundos) */}
        {showCancelButton && onCancel && (
          <button
            onClick={onCancel}
            className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};
