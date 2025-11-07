// src/app/test-board/page.tsx
'use client';

import React, { useState } from 'react';
import { SimpleBoard } from '@/components/chess';

export default function TestBoardPage() {
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | undefined>('w');
  const [flipped, setFlipped] = useState(false);

  const handleMove = (from: string, to: string) => {
    console.log(`Movimiento: ${from} -> ${to}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Tablero de Ajedrez - Prueba
        </h1>
        
        {/* Controles */}
        <div className="mb-6 flex justify-center space-x-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selecciona tu color:
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setPlayerColor('w');
                  setFlipped(false);
                }}
                className={`px-4 py-2 rounded ${
                  playerColor === 'w'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                ⚪ Blancas
              </button>
              <button
                onClick={() => {
                  setPlayerColor('b');
                  setFlipped(true);
                }}
                className={`px-4 py-2 rounded ${
                  playerColor === 'b'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                ⚫ Negras
              </button>
              <button
                onClick={() => {
                  setPlayerColor(undefined);
                  setFlipped(false);
                }}
                className={`px-4 py-2 rounded ${
                  playerColor === undefined
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                👥 Ambos
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <SimpleBoard
            size={480}
            flipped={flipped}
            playerColor={playerColor}
            onMove={handleMove}
          />
        </div>

        <div className="mt-8 text-center text-gray-600 dark:text-gray-300">
          <p className="mb-2 font-medium">Instrucciones:</p>
          <ul className="text-sm space-y-1">
            <li>1. Selecciona tu color arriba</li>
            <li>2. Haz click en una pieza para seleccionarla</li>
            <li>3. Haz click en una casilla válida para mover</li>
            <li>4. Los círculos indican movimientos legales</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
