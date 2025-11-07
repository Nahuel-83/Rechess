// src/components/chess/GameEndModal.tsx
'use client';

import React from 'react';
import type { PieceColor } from '@/types';

export type GameEndReason =
  | { type: 'checkmate'; winner: PieceColor }
  | { type: 'stalemate' }
  | { type: 'threefold_repetition' }
  | { type: 'fifty_move_rule' }
  | { type: 'insufficient_material' }
  | { type: 'timeout'; winner: PieceColor }
  | { type: 'resignation'; winner: PieceColor };

interface GameEndModalProps {
  isOpen: boolean;
  result: GameEndReason;
  pgn: string;
  moveCount: number;
  elapsedTime?: number; // segundos
  onNewGame: () => void;
  onReview: () => void;
  onExportPGN: () => void;
  onClose?: () => void;
}

const getResultTitle = (result: GameEndReason): string => {
  switch (result.type) {
    case 'checkmate':
      return result.winner === 'w' ? '¡Blancas Ganan!' : '¡Negras Ganan!';
    case 'stalemate':
      return '¡Tablas por Ahogado!';
    case 'threefold_repetition':
      return '¡Tablas por Repetición!';
    case 'fifty_move_rule':
      return '¡Tablas por Regla de 50 Movimientos!';
    case 'insufficient_material':
      return '¡Tablas por Material Insuficiente!';
    case 'timeout':
      return result.winner === 'w' ? '¡Blancas Ganan por Tiempo!' : '¡Negras Ganan por Tiempo!';
    case 'resignation':
      return result.winner === 'w' ? '¡Blancas Ganan por Rendición!' : '¡Negras Ganan por Rendición!';
  }
};

const getResultDescription = (result: GameEndReason): string => {
  switch (result.type) {
    case 'checkmate':
      return `${result.winner === 'w' ? 'Las blancas' : 'Las negras'} han dado jaque mate.`;
    case 'stalemate':
      return 'El jugador no tiene movimientos legales pero su rey no está en jaque.';
    case 'threefold_repetition':
      return 'La misma posición se ha repetido tres veces.';
    case 'fifty_move_rule':
      return 'Se han realizado 50 movimientos sin capturas ni movimientos de peón.';
    case 'insufficient_material':
      return 'No hay suficiente material en el tablero para dar jaque mate.';
    case 'timeout':
      return `${result.winner === 'w' ? 'Las negras' : 'Las blancas'} se quedaron sin tiempo.`;
    case 'resignation':
      return `${result.winner === 'w' ? 'Las negras' : 'Las blancas'} se rindieron.`;
  }
};

const getResultIcon = (result: GameEndReason): React.ReactElement => {
  const isDraw = ['stalemate', 'threefold_repetition', 'fifty_move_rule', 'insufficient_material'].includes(
    result.type
  );

  if (isDraw) {
    return (
      <div className="w-20 h-20 mx-auto bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
        <svg
          className="w-12 h-12 text-yellow-600 dark:text-yellow-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
      <svg
        className="w-12 h-12 text-green-600 dark:text-green-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

export const GameEndModal: React.FC<GameEndModalProps> = ({
  isOpen,
  result,
  pgn,
  moveCount,
  elapsedTime,
  onNewGame,
  onReview,
  onExportPGN,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleExportPGN = () => {
    // Crear un blob con el contenido PGN
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Crear un enlace temporal y hacer clic en él
    const link = document.createElement('a');
    link.href = url;
    link.download = `chess-game-${new Date().toISOString().split('T')[0]}.pgn`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpiar el URL del blob
    URL.revokeObjectURL(url);
    
    onExportPGN();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-black dark:bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="card rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-fade-in">
        {/* Icono de resultado */}
        <div className="mb-6">{getResultIcon(result)}</div>

        {/* Título del resultado */}
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-3">
          {getResultTitle(result)}
        </h2>

        {/* Descripción del resultado */}
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          {getResultDescription(result)}
        </p>

        {/* Resumen de la partida */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Resumen de la Partida
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Movimientos:</span>
              <span className="font-medium text-gray-900 dark:text-white">{moveCount}</span>
            </div>
            {elapsedTime !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tiempo total:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Resultado:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {result.type === 'checkmate' || result.type === 'timeout' || result.type === 'resignation'
                  ? `${result.winner === 'w' ? '1-0' : '0-1'}`
                  : '½-½'}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          {/* Nueva Partida */}
          <button
            onClick={onNewGame}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Nueva Partida</span>
          </button>

          {/* Revisar Partida */}
          <button
            onClick={onReview}
            className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>Revisar Partida</span>
          </button>

          {/* Exportar PGN */}
          <button
            onClick={handleExportPGN}
            className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Exportar PGN</span>
          </button>
        </div>

        {/* Botón de cerrar (opcional) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Cerrar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
