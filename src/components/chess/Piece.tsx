// src/components/chess/Piece.tsx
'use client';

import React from 'react';
import { ChessPiece, Square } from '@/types';

interface PieceProps {
  piece: ChessPiece;
  square: Square;
  size?: number;
  className?: string;
  onDragStart?: (square: Square, piece: ChessPiece) => void;
  onDragEnd?: (square: Square) => void;
  isDragging?: boolean;
  isValidMove?: boolean;
  isLastMove?: boolean;
}

export const Piece: React.FC<PieceProps> = ({
  piece,
  square,
  size = 48,
  className = '',
  onDragStart,
  onDragEnd,
  isDragging = false,
  isValidMove = false,
  isLastMove = false
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDragStart) {
      onDragStart(square, piece);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDragEnd) {
      onDragEnd(square);
    }
  };

  const pieceSymbol = getPieceSymbol(piece.type, piece.color);

  return (
    <div
      className={`
        absolute inset-0 flex items-center justify-center
        cursor-grab active:cursor-grabbing select-none
        transition-transform duration-200
        ${isDragging ? 'scale-110 z-50 opacity-80' : 'hover:scale-105'}
        ${isValidMove ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
        ${isLastMove ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        ${className}
      `}
      style={{
        fontSize: `${size}px`,
        width: `${size}px`,
        height: `${size}px`
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      draggable={false}
    >
      <span className="drop-shadow-sm">
        {pieceSymbol}
      </span>
    </div>
  );
};

// Función auxiliar para obtener símbolo de pieza Unicode
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

// Función auxiliar para obtener símbolo de pieza SVG (para futuro uso)
export function getPieceSvgSymbol(type: string, color: string): string {
  const symbols: Record<string, Record<string, string>> = {
    w: {
      k: 'K',
      q: 'Q',
      r: 'R',
      b: 'B',
      n: 'N',
      p: 'P'
    },
    b: {
      k: 'k',
      q: 'q',
      r: 'r',
      b: 'b',
      n: 'n',
      p: 'p'
    }
  };

  return symbols[color]?.[type] || '';
}
