// src/components/chess/SimpleBoard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { motion } from 'framer-motion';
import { PromotionDialog } from './PromotionDialog';

interface SimpleBoardProps {
  className?: string;
  size?: number;
  flipped?: boolean;
  onMove?: (from: string, to: string, promotion?: string) => void;
  fen?: string;
  playerColor?: 'w' | 'b';
  isAIThinking?: boolean;
}

export const SimpleBoard: React.FC<SimpleBoardProps> = ({
  className = '',
  size = 480,
  flipped = false,
  onMove,
  fen,
  playerColor,
  isAIThinking = false
}) => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [promotionState, setPromotionState] = useState<{
    from: string;
    to: string;
    color: 'w' | 'b';
  } | null>(null);

  // Actualizar el juego cuando cambia el FEN
  useEffect(() => {
    if (fen) {
      const newGame = new Chess(fen);
      setGame(newGame);
      // Limpiar selección cuando cambia el FEN (nuevo turno)
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [fen]);

  // Manejar selección de pieza de promoción
  const handlePromotionSelect = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (!promotionState) return;

    try {
      const move = game.move({
        from: promotionState.from as any,
        to: promotionState.to as any,
        promotion: piece
      });

      if (move) {
        // Actualizar estado local para feedback inmediato
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setLastMove({ from: promotionState.from, to: promotionState.to });
        setPromotionState(null);
        setSelectedSquare(null);
        setLegalMoves([]);
        
        // Notificar al componente padre con la promoción
        if (onMove) {
          onMove(promotionState.from, promotionState.to, piece);
        }
        
        // Anunciar jaque o jaque mate
        if (newGame.isCheckmate()) {
          console.log('¡Jaque Mate!');
        } else if (newGame.isCheck()) {
          console.log('¡Jaque!');
        }
      }
    } catch (error) {
      console.error('Error en promoción:', error);
      setPromotionState(null);
    }
  };

  // Cancelar promoción
  const handlePromotionCancel = () => {
    setPromotionState(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const files = flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const squareSize = size / 8;

  // Obtener pieza en una casilla
  const getPieceAt = (square: string) => {
    return game.get(square as any);
  };

  // Obtener símbolo Unicode de la pieza
  const getPieceSymbol = (piece: any) => {
    if (!piece) return '';
    
    const symbols: Record<string, Record<string, string>> = {
      w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
      b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
    };
    
    return symbols[piece.color]?.[piece.type] || '';
  };

  // Manejar click en casilla
  const handleSquareClick = (square: string) => {
    // No permitir clicks si la IA está pensando
    if (isAIThinking) return;
    
    // Si hay un color de jugador definido, solo permitir mover piezas de ese color
    if (playerColor && game.turn() !== playerColor) return;
    
    const piece = getPieceAt(square);

    // Si no hay casilla seleccionada
    if (!selectedSquare) {
      // Solo seleccionar si hay una pieza del turno actual
      if (piece && piece.color === game.turn()) {
        // Si hay color de jugador, verificar que sea su pieza
        if (playerColor && piece.color !== playerColor) return;
        
        setSelectedSquare(square);
        // Obtener movimientos legales desde esta casilla
        const moves = game.moves({ square: square as any, verbose: true });
        setLegalMoves(moves.map(m => m.to));
      }
      return;
    }

    // Si se hace click en la misma casilla, deseleccionar
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // Verificar si es una promoción
    const fromRank = selectedSquare[1];
    const toRank = square[1];
    const movingPiece = getPieceAt(selectedSquare);
    
    const isPromotion = movingPiece?.type === 'p' && 
                       ((movingPiece.color === 'w' && fromRank === '7' && toRank === '8') ||
                        (movingPiece.color === 'b' && fromRank === '2' && toRank === '1'));

    if (isPromotion) {
      // Mostrar modal de promoción
      setPromotionState({
        from: selectedSquare,
        to: square,
        color: movingPiece.color
      });
      return;
    }

    // Intentar hacer el movimiento
    try {
      const move = game.move({
        from: selectedSquare as any,
        to: square as any
      });

      if (move) {
        // Actualizar estado local para feedback inmediato
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setLastMove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setLegalMoves([]);
        
        // Notificar al padre para que actualice su estado y la IA juegue
        if (onMove) {
          onMove(selectedSquare, square);
        }
        
        // Anunciar jaque o jaque mate
        if (newGame.isCheckmate()) {
          console.log('¡Jaque Mate!');
        } else if (newGame.isCheck()) {
          console.log('¡Jaque!');
        }
      } else {
        // Movimiento inválido - intentar seleccionar nueva pieza
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
          const moves = game.moves({ square: square as any, verbose: true });
          setLegalMoves(moves.map(m => m.to));
        } else {
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      }
    } catch (error) {
      // Error en el movimiento - intentar seleccionar nueva pieza
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square as any, verbose: true });
        setLegalMoves(moves.map(m => m.to));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  // Renderizar el tablero
  const renderBoard = () => {
    const squares = [];

    for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
      for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
        const file = files[fileIndex];
        const rank = ranks[rankIndex];
        const square = `${file}${rank}`;
        const piece = getPieceAt(square);
        const isLight = (fileIndex + rankIndex) % 2 === 0;
        const isSelected = selectedSquare === square;
        const isLegalMove = legalMoves.includes(square);
        const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);

        squares.push(
          <motion.div
            key={square}
            className={`
              relative flex items-center justify-center cursor-pointer
              ${isLight ? 'chess-square-light' : 'chess-square-dark'}
              ${isSelected ? 'ring-4 ring-yellow-400 ring-inset' : ''}
            `}
            style={{
              width: squareSize,
              height: squareSize,
              backgroundColor: isLastMoveSquare 
                ? 'rgba(134, 239, 172, 0.4)' 
                : undefined
            }}
            onClick={() => handleSquareClick(square)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.1 }}
          >
            {/* Coordenadas */}
            {fileIndex === 0 && (
              <div className={`
                absolute left-1 top-1 text-xs font-bold pointer-events-none
                ${isLight ? 'text-amber-800' : 'text-amber-100'}
              `}>
                {rank}
              </div>
            )}
            {rankIndex === 7 && (
              <div className={`
                absolute right-1 bottom-1 text-xs font-bold pointer-events-none
                ${isLight ? 'text-amber-800' : 'text-amber-100'}
              `}>
                {file}
              </div>
            )}

            {/* Pieza */}
            {piece && (
              <motion.div 
                className={`chess-piece ${piece.color === 'w' ? 'chess-piece-white' : 'chess-piece-black'} text-5xl select-none pointer-events-none`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {getPieceSymbol(piece)}
              </motion.div>
            )}

            {/* Indicador de movimiento legal */}
            {isLegalMove && !piece && (
              <div className="absolute w-4 h-4 rounded-full bg-gray-600 opacity-30" />
            )}
            {isLegalMove && piece && (
              <div className="absolute inset-0 border-4 border-gray-600 opacity-40 rounded-full" 
                   style={{ margin: '10%' }} />
            )}
          </motion.div>
        );
      }
    }

    return squares;
  };

  return (
    <div
      className={`chess-board relative ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="grid grid-cols-8 w-full h-full">
        {renderBoard()}
      </div>

      {/* Overlay cuando la IA está pensando */}
      {isAIThinking && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-lg">
          <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-white font-medium">
                IA pensando...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Información del juego */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {playerColor ? (
            <div className="flex items-center justify-center space-x-2">
              <span>Juegas con:</span>
              <span className="font-bold">
                {playerColor === 'w' ? 'Blancas ⚪' : 'Negras ⚫'}
              </span>
            </div>
          ) : (
            <div>Modo: Jugador vs Jugador</div>
          )}
        </div>
        
        <div className={`text-base font-medium ${
          game.turn() === playerColor 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-gray-600 dark:text-gray-300'
        }`}>
          Turno: {game.turn() === 'w' ? 'Blancas ⚪' : 'Negras ⚫'}
          {playerColor && game.turn() === playerColor && (
            <span className="ml-2 text-sm">(Tu turno)</span>
          )}
        </div>
        
        {game.isCheck() && <div className="text-red-600 dark:text-red-400 font-bold mt-2">¡Jaque!</div>}
        {game.isCheckmate() && <div className="text-red-600 dark:text-red-400 font-bold mt-2 text-lg">¡Jaque Mate!</div>}
        {game.isDraw() && <div className="text-blue-600 dark:text-blue-400 font-bold mt-2">Tablas</div>}
      </div>

      {/* Modal de promoción */}
      <PromotionDialog
        isOpen={promotionState !== null}
        color={promotionState?.color || 'w'}
        onSelect={handlePromotionSelect}
        onCancel={handlePromotionCancel}
      />
    </div>
  );
};
