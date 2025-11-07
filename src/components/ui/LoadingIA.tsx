// src/components/ui/LoadingIA.tsx
'use client';

import React from 'react';

interface LoadingIAProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  className?: string;
}

export const LoadingIA: React.FC<LoadingIAProps> = ({
  isVisible,
  message = 'La IA está pensando...',
  progress,
  className = ''
}) => {
  if (!isVisible) return null;

  return (
    <div className={`
      fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50
      ${className}
    `}>
      <div className="card rounded-lg p-6 max-w-sm mx-4 text-center">
        {/* Icono animado */}
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Mensaje */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Pensando...
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          {message}
        </p>

        {/* Barra de progreso */}
        {progress !== undefined && (
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4">
            <div
              className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        )}

        {/* Indicador de actividad */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Información técnica */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Utilizando Stockfish 17.1 WebAssembly para análisis avanzado
        </div>
      </div>
    </div>
  );
};
