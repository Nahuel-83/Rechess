// src/components/chess/PromotionModal.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieceType, PieceColor } from '@/types';

interface PromotionModalProps {
  isOpen: boolean;
  color: PieceColor;
  onSelect: (piece: PieceType) => void;
  onCancel?: () => void;
}

/**
 * PromotionModal - Modal para selección de pieza de promoción
 * Cumple con Requisito 9.3: Implementar modal de promoción de peón
 * 
 * Características:
 * - Detecta cuando un peón alcanza la última fila
 * - Muestra modal con opciones de promoción (dama, torre, alfil, caballo)
 * - Bloquea otros movimientos hasta que se seleccione promoción
 */
export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  color,
  onSelect,
  onCancel
}) => {
  // Opciones de promoción en orden de popularidad
  const promotionOptions: { type: PieceType; label: string }[] = [
    { type: 'q', label: 'Dama' },
    { type: 'r', label: 'Torre' },
    { type: 'b', label: 'Alfil' },
    { type: 'n', label: 'Caballo' }
  ];

  // Obtener símbolo de pieza
  const getPieceSymbol = (type: PieceType): string => {
    const symbols: Record<string, Record<string, string>> = {
      w: {
        q: '♕',
        r: '♖',
        b: '♗',
        n: '♘'
      },
      b: {
        q: '♛',
        r: '♜',
        b: '♝',
        n: '♞'
      }
    };

    return symbols[color]?.[type] || '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - bloquea interacción con el tablero */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
            onClick={onCancel}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Título */}
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                Promoción de Peón
              </h2>

              <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                Selecciona la pieza a la que deseas promocionar tu peón:
              </p>

              {/* Opciones de promoción */}
              <div className="grid grid-cols-2 gap-4">
                {promotionOptions.map(({ type, label }) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(type)}
                    className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                  >
                    <span className="text-6xl mb-2">
                      {getPieceSymbol(type)}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {label}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Nota informativa */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
                La dama es la opción más común y poderosa
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
