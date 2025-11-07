// src/components/chess/CapturedPieces.tsx
'use client';

import React, { useMemo } from 'react';
import { ChessPiece, PieceType } from '@/types';

interface CapturedPiecesProps {
  whiteCaptured: ChessPiece[];
  blackCaptured: ChessPiece[];
  className?: string;
}

// Valores estándar de piezas para cálculo de ventaja material
const PIECE_VALUES: Record<PieceType, number> = {
  p: 1,  // Peón
  n: 3,  // Caballo
  b: 3,  // Alfil
  r: 5,  // Torre
  q: 9,  // Dama
  k: 0   // Rey (no cuenta para material)
};

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  whiteCaptured,
  blackCaptured,
  className = ''
}) => {
  // Agrupar piezas por tipo
  const groupPiecesByType = (pieces: ChessPiece[]) => {
    const grouped: Partial<Record<PieceType, ChessPiece[]>> = {};
    pieces.forEach(piece => {
      if (!grouped[piece.type]) {
        grouped[piece.type] = [];
      }
      grouped[piece.type]!.push(piece);
    });
    return grouped;
  };

  // Calcular valor material total
  const calculateMaterialValue = (pieces: ChessPiece[]) => {
    return pieces.reduce((total, piece) => total + PIECE_VALUES[piece.type], 0);
  };

  // Agrupar piezas capturadas
  const whiteGrouped = useMemo(() => groupPiecesByType(whiteCaptured), [whiteCaptured]);
  const blackGrouped = useMemo(() => groupPiecesByType(blackCaptured), [blackCaptured]);

  // Calcular ventaja material
  const whiteMaterial = useMemo(() => calculateMaterialValue(blackCaptured), [blackCaptured]);
  const blackMaterial = useMemo(() => calculateMaterialValue(whiteCaptured), [whiteCaptured]);
  const materialAdvantage = whiteMaterial - blackMaterial;

  // Orden de piezas para mostrar (de mayor a menor valor)
  const pieceOrder: PieceType[] = ['q', 'r', 'b', 'n', 'p'];

  return (
    <div className={`card rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Piezas Capturadas
      </h3>

      {whiteCaptured.length === 0 && blackCaptured.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hay piezas capturadas aún
        </p>
      ) : (
        <div className="space-y-4">
          {/* Piezas capturadas por blancas (piezas negras capturadas) */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-white border-2 border-gray-800"></span>
                Blancas
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {blackCaptured.length} {blackCaptured.length === 1 ? 'pieza' : 'piezas'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 min-h-[2rem]">
              {pieceOrder.map(type => 
                blackGrouped[type]?.map((piece, index) => (
                  <div
                    key={`${type}-${index}`}
                    className="w-8 h-8 bg-white dark:bg-gray-700 rounded flex items-center justify-center text-xl border border-gray-300 dark:border-gray-600 shadow-sm"
                    title={`${getPieceName(piece.type)} (${PIECE_VALUES[piece.type]} puntos)`}
                  >
                    {getPieceSymbol(piece.type, piece.color)}
                  </div>
                ))
              )}
            </div>
            {whiteMaterial > 0 && (
              <div className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
                +{whiteMaterial} puntos
              </div>
            )}
          </div>

          {/* Piezas capturadas por negras (piezas blancas capturadas) */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-gray-800 dark:bg-gray-900 border-2 border-gray-300"></span>
                Negras
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {whiteCaptured.length} {whiteCaptured.length === 1 ? 'pieza' : 'piezas'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 min-h-[2rem]">
              {pieceOrder.map(type => 
                whiteGrouped[type]?.map((piece, index) => (
                  <div
                    key={`${type}-${index}`}
                    className="w-8 h-8 bg-gray-800 dark:bg-gray-900 rounded flex items-center justify-center text-xl border border-gray-600 dark:border-gray-700 shadow-sm"
                    title={`${getPieceName(piece.type)} (${PIECE_VALUES[piece.type]} puntos)`}
                  >
                    {getPieceSymbol(piece.type, piece.color)}
                  </div>
                ))
              )}
            </div>
            {blackMaterial > 0 && (
              <div className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
                +{blackMaterial} puntos
              </div>
            )}
          </div>

          {/* Ventaja material */}
          {materialAdvantage !== 0 && (
            <div className={`p-3 rounded-lg text-center font-semibold ${
              materialAdvantage > 0 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
            }`}>
              <div className="text-xs mb-1">Ventaja Material</div>
              <div className="text-lg">
                {materialAdvantage > 0 ? '♔ Blancas' : '♚ Negras'} +{Math.abs(materialAdvantage)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Función auxiliar para obtener símbolo de pieza
function getPieceSymbol(type: string, color: string): string {
  const symbols: Record<string, Record<string, string>> = {
    w: {
      k: '♔',
      q: '♕',
      r: '♖',
      b: '♗',
      n: '♘',
      p: '♙'
    },
    b: {
      k: '♚',
      q: '♛',
      r: '♜',
      b: '♝',
      n: '♞',
      p: '♟'
    }
  };

  return symbols[color]?.[type] || '';
}

// Función auxiliar para obtener nombre de pieza
function getPieceName(type: string): string {
  const names: Record<string, string> = {
    k: 'Rey',
    q: 'Reina',
    r: 'Torre',
    b: 'Alfil',
    n: 'Caballo',
    p: 'Peón'
  };

  return names[type] || 'Desconocida';
}
