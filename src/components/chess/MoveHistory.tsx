// src/components/chess/MoveHistory.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { Move } from '@/types';

interface MoveHistoryProps {
  moves: Move[];
  className?: string;
  onMoveClick?: (moveIndex: number) => void;
  currentMoveIndex?: number;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  className = '',
  onMoveClick,
  currentMoveIndex = -1
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastMoveRef = useRef<HTMLDivElement>(null);
  const activeMoveRef = useRef<HTMLDivElement>(null);

  // Agrupar movimientos en pares (blancas/negras)
  const movePairs: Array<{ white?: Move; black?: Move; index: number }> = [];

  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      white: moves[i],
      black: moves[i + 1],
      index: Math.floor(i / 2) + 1
    });
  }

  // Auto-scroll al último movimiento cuando se agrega uno nuevo
  useEffect(() => {
    // Si no hay un movimiento activo seleccionado, hacer scroll al último
    if (currentMoveIndex === -1 || currentMoveIndex === moves.length - 1) {
      if (lastMoveRef.current && scrollContainerRef.current) {
        lastMoveRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [moves.length, currentMoveIndex]);

  // Scroll al movimiento activo cuando cambia
  useEffect(() => {
    if (currentMoveIndex >= 0 && activeMoveRef.current && scrollContainerRef.current) {
      activeMoveRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentMoveIndex]);

  return (
    <div className={`card rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Historial de Movimientos
      </h3>

      {moves.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hay movimientos aún
        </p>
      ) : (
        <div 
          ref={scrollContainerRef}
          className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
          role="list"
          aria-label="Historial de movimientos de la partida"
        >
          <div className="grid grid-cols-[auto_1fr_1fr] gap-1 text-sm">
            {/* Encabezado fijo */}
            <div className="sticky top-0 bg-slate-100 dark:bg-slate-700 font-semibold text-gray-700 dark:text-gray-200 px-2 py-1.5 text-center border-b border-gray-300 dark:border-gray-600">
              #
            </div>
            <div className="sticky top-0 bg-slate-100 dark:bg-slate-700 font-semibold text-gray-700 dark:text-gray-200 px-2 py-1.5 border-b border-gray-300 dark:border-gray-600">
              ♔ Blancas
            </div>
            <div className="sticky top-0 bg-slate-100 dark:bg-slate-700 font-semibold text-gray-700 dark:text-gray-200 px-2 py-1.5 border-b border-gray-300 dark:border-gray-600">
              ♚ Negras
            </div>

            {/* Movimientos en formato estándar de dos columnas */}
            {movePairs.map((pair, pairIndex) => {
              const isLastPair = pairIndex === movePairs.length - 1;
              const whiteIndex = (pair.index - 1) * 2;
              const blackIndex = whiteIndex + 1;
              const isWhiteActive = currentMoveIndex === whiteIndex;
              const isBlackActive = currentMoveIndex === blackIndex;
              const isWhiteLastMove = whiteIndex === moves.length - 1 && currentMoveIndex === -1;
              const isBlackLastMove = blackIndex === moves.length - 1 && currentMoveIndex === -1;

              return (
                <React.Fragment key={pair.index}>
                  {/* Número de movimiento */}
                  <div className="font-medium text-gray-500 dark:text-gray-400 px-2 py-1.5 text-center">
                    {pair.index}.
                  </div>
                  
                  {/* Movimiento de blancas */}
                  <div
                    ref={
                      isWhiteActive ? activeMoveRef : 
                      (isLastPair && !pair.black ? lastMoveRef : undefined)
                    }
                    className={`
                      px-2 py-1.5 rounded font-mono transition-all duration-200
                      ${onMoveClick && pair.white ? 'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 hover:shadow-sm' : ''}
                      ${isWhiteActive ? 'bg-blue-500 dark:bg-blue-600 text-white font-bold ring-2 ring-blue-400 dark:ring-blue-500 shadow-md' : ''}
                      ${isWhiteLastMove ? 'bg-green-100 dark:bg-green-900/40 font-semibold' : ''}
                      ${!isWhiteActive && !isWhiteLastMove ? 'hover:scale-105' : ''}
                    `}
                    onClick={() => pair.white && onMoveClick?.(whiteIndex)}
                    title={pair.white ? `${pair.white.lan} - Click para ver esta posición` : ''}
                    role={onMoveClick && pair.white ? 'button' : undefined}
                    tabIndex={onMoveClick && pair.white ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (pair.white && onMoveClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onMoveClick(whiteIndex);
                      }
                    }}
                  >
                    {pair.white?.san || '-'}
                  </div>
                  
                  {/* Movimiento de negras */}
                  <div
                    ref={
                      isBlackActive ? activeMoveRef : 
                      (isLastPair && pair.black ? lastMoveRef : undefined)
                    }
                    className={`
                      px-2 py-1.5 rounded font-mono transition-all duration-200
                      ${pair.black && onMoveClick ? 'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 hover:shadow-sm' : ''}
                      ${isBlackActive ? 'bg-blue-500 dark:bg-blue-600 text-white font-bold ring-2 ring-blue-400 dark:ring-blue-500 shadow-md' : ''}
                      ${isBlackLastMove ? 'bg-green-100 dark:bg-green-900/40 font-semibold' : ''}
                      ${!isBlackActive && !isBlackLastMove && pair.black ? 'hover:scale-105' : ''}
                    `}
                    onClick={() => pair.black && onMoveClick?.(blackIndex)}
                    title={pair.black ? `${pair.black.lan} - Click para ver esta posición` : ''}
                    role={onMoveClick && pair.black ? 'button' : undefined}
                    tabIndex={onMoveClick && pair.black ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (pair.black && onMoveClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onMoveClick(blackIndex);
                      }
                    }}
                  >
                    {pair.black?.san || ''}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-600 space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Total: {moves.length} movimientos</span>
          {moves.length > 0 && (
            <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
              Último: <span className="font-bold">{moves[moves.length - 1]?.san || ''}</span>
            </span>
          )}
        </div>
        
        {/* Indicador de navegación */}
        {onMoveClick && moves.length > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Click en un movimiento para ver esa posición</span>
          </div>
        )}
        
        {/* Indicador de posición actual */}
        {currentMoveIndex >= 0 && currentMoveIndex < moves.length && (
          <div className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1.5 rounded flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>
              Viendo movimiento {currentMoveIndex + 1}: <span className="font-mono font-bold">{moves[currentMoveIndex]?.san}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
