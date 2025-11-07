// src/components/chess/PromotionDialog.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromotionDialogProps {
  isOpen: boolean;
  color: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}

export const PromotionDialog: React.FC<PromotionDialogProps> = ({
  isOpen,
  color,
  onSelect,
  onCancel
}) => {
  const pieces = [
    { type: 'q' as const, symbol: color === 'w' ? '♕' : '♛', name: 'Reina' },
    { type: 'r' as const, symbol: color === 'w' ? '♖' : '♜', name: 'Torre' },
    { type: 'b' as const, symbol: color === 'w' ? '♗' : '♝', name: 'Alfil' },
    { type: 'n' as const, symbol: color === 'w' ? '♘' : '♞', name: 'Caballo' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={onCancel}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
                ¡Promoción de Peón!
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                Elige la pieza a la que quieres promover:
              </p>

              {/* Grid de piezas */}
              <div className="grid grid-cols-2 gap-4">
                {pieces.map((piece) => (
                  <motion.button
                    key={piece.type}
                    onClick={() => onSelect(piece.type)}
                    className={`
                      relative p-6 rounded-lg border-2 transition-all
                      ${color === 'w' 
                        ? 'border-gray-300 hover:border-blue-500 bg-gray-50 dark:bg-slate-700' 
                        : 'border-gray-600 hover:border-blue-500 bg-gray-100 dark:bg-slate-700'
                      }
                      hover:shadow-lg hover:scale-105
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex flex-col items-center">
                      <div 
                        className={`text-6xl mb-2 ${
                          color === 'w' ? 'chess-piece-white' : 'chess-piece-black'
                        }`}
                      >
                        {piece.symbol}
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {piece.name}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Botón cancelar */}
              <button
                onClick={onCancel}
                className="mt-6 w-full py-2 px-4 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
