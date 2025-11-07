// src/components/chess/Board.tsx
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieceType, PieceColor, Square, ChessPiece } from '@/types';
import { useChessGame } from '@/hooks';
import { ChessEngine } from '@/lib/chess';
import { InputValidator } from '@/lib/validation';
import { PromotionModal } from './PromotionModal';

// Screen reader announcements
const announceToScreenReader = (message: string) => {
  const announcement = document.getElementById('chess-announcer');
  if (announcement) {
    announcement.textContent = message;
  }
};

interface BoardProps {
  className?: string;
  size?: number;
  flipped?: boolean;
  lastMove?: { from: string; to: string } | null;
}

export const Board: React.FC<BoardProps> = ({
  className = '',
  size = 400,
  flipped = false,
  lastMove = null
}) => {
  const { gameState, makeMove } = useChessGame();

  // State for selected square and legal moves
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMovesForSelected, setLegalMovesForSelected] = useState<string[]>([]);
  
  // State for invalid action feedback
  const [invalidSquare, setInvalidSquare] = useState<string | null>(null);
  
  // State for promotion modal
  const [promotionState, setPromotionState] = useState<{
    isOpen: boolean;
    from: string;
    to: string;
    color: PieceColor;
  } | null>(null);
  
  // Track previous position for animations
  const prevPositionRef = useRef<Record<string, ChessPiece | null>>({});
  
  // Keyboard navigation state
  const [focusedSquare, setFocusedSquare] = useState<Square | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const files = flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

  const squareSize = size / 8;

  // Usar la posición del gameState, o posición inicial si no hay gameState
  const position = React.useMemo(() => {
    if (gameState?.position && Object.keys(gameState.position).length > 0) {
      return gameState.position;
    }
    
    // Si no hay posición, crear una posición inicial por defecto
    const initialPosition: Record<string, ChessPiece | null> = {};
    
    // Piezas negras
    initialPosition['a8'] = { type: 'r', color: 'b' };
    initialPosition['b8'] = { type: 'n', color: 'b' };
    initialPosition['c8'] = { type: 'b', color: 'b' };
    initialPosition['d8'] = { type: 'q', color: 'b' };
    initialPosition['e8'] = { type: 'k', color: 'b' };
    initialPosition['f8'] = { type: 'b', color: 'b' };
    initialPosition['g8'] = { type: 'n', color: 'b' };
    initialPosition['h8'] = { type: 'r', color: 'b' };
    
    // Peones negros
    for (let file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      initialPosition[`${file}7`] = { type: 'p', color: 'b' };
    }
    
    // Casillas vacías
    for (let rank = 3; rank <= 6; rank++) {
      for (let file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
        initialPosition[`${file}${rank}`] = null;
      }
    }
    
    // Peones blancos
    for (let file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      initialPosition[`${file}2`] = { type: 'p', color: 'w' };
    }
    
    // Piezas blancas
    initialPosition['a1'] = { type: 'r', color: 'w' };
    initialPosition['b1'] = { type: 'n', color: 'w' };
    initialPosition['c1'] = { type: 'b', color: 'w' };
    initialPosition['d1'] = { type: 'q', color: 'w' };
    initialPosition['e1'] = { type: 'k', color: 'w' };
    initialPosition['f1'] = { type: 'b', color: 'w' };
    initialPosition['g1'] = { type: 'n', color: 'w' };
    initialPosition['h1'] = { type: 'r', color: 'w' };
    
    return initialPosition;
  }, [gameState?.position]);
  


  // Update previous position when position changes
  useEffect(() => {
    prevPositionRef.current = position;
  }, [position]);

  // Announce moves to screen reader
  useEffect(() => {
    if (gameState?.history && gameState.history.length > 0) {
      const lastMove = gameState.history[gameState.history.length - 1];
      const piece = getPieceName(lastMove.piece.type);
      const color = lastMove.piece.color === 'w' ? 'White' : 'Black';
      const from = `${lastMove.from.file}${lastMove.from.rank}`;
      const to = `${lastMove.to.file}${lastMove.to.rank}`;
      const captured = lastMove.captured ? ` captures ${getPieceName(lastMove.captured.type)}` : '';
      
      announceToScreenReader(`${color} ${piece} moves from ${from} to ${to}${captured}`);
      
      // Announce check or checkmate
      if (gameState.isCheckmate) {
        announceToScreenReader(`Checkmate! ${color === 'White' ? 'Black' : 'White'} wins!`);
      } else if (gameState.isCheck) {
        announceToScreenReader(`Check!`);
      }
    }
  }, [gameState?.history]);

  // Derive last move from game state if not provided as prop
  const derivedLastMove = lastMove || (gameState?.history && gameState.history.length > 0 
    ? {
        from: `${gameState.history[gameState.history.length - 1].from.file}${gameState.history[gameState.history.length - 1].from.rank}`,
        to: `${gameState.history[gameState.history.length - 1].to.file}${gameState.history[gameState.history.length - 1].to.rank}`
      }
    : null);

  // Find the king in check
  const kingInCheckSquare = React.useMemo(() => {
    if (!gameState?.isCheck) return null;
    
    // Find the king of the current turn (the one in check)
    const kingColor = gameState.turn;
    for (const [square, piece] of Object.entries(position)) {
      if (piece && piece.type === 'k' && piece.color === kingColor) {
        return square;
      }
    }
    return null;
  }, [gameState?.isCheck, gameState?.turn, position]);

  // Handle square click for selection with validation
  const handleSquareClick = useCallback((square: Square, piece: ChessPiece | null) => {

    // Clear any previous invalid square feedback
    setInvalidSquare(null);
    
    // Set focused square for keyboard navigation
    setFocusedSquare(square);

    // Requisito 9.4: Validar que sea el turno del jugador (no de IA)
    if (gameState && !InputValidator.validatePlayerTurn(
      gameState.settings?.mode || 'pvp',
      gameState.turn,
      gameState.settings?.playerColor
    )) {
      // No es el turno del jugador - mostrar feedback visual
      const squareStr = `${square.file}${square.rank}`;
      setInvalidSquare(squareStr);
      setTimeout(() => setInvalidSquare(null), 500);
      return;
    }

    // Requisito 9: Validar que el juego está en estado jugable
    if (gameState && !InputValidator.validateGameState(gameState.status || 'playing', gameState.isGameOver)) {
      return;
    }

    // If no piece on clicked square and no square selected, do nothing
    if (!piece && !selectedSquare) return;

    // If a square is already selected
    if (selectedSquare) {
      const fromStr = `${selectedSquare.file}${selectedSquare.rank}`;
      const toStr = `${square.file}${square.rank}`;

      // If clicking the same square, deselect
      if (selectedSquare.file === square.file && selectedSquare.rank === square.rank) {
        setSelectedSquare(null);
        setLegalMovesForSelected([]);
        return;
      }

      // Requisito 9.2: Validar que el movimiento sea legal
      if (legalMovesForSelected.includes(toStr)) {
        // Requisito 9.3: Check if this is a promotion move
        const selectedPiece = position[fromStr];
        if (selectedPiece && InputValidator.isPromotionMove(fromStr, toStr, selectedPiece)) {
          // Mostrar modal de promoción
          setPromotionState({
            isOpen: true,
            from: fromStr,
            to: toStr,
            color: selectedPiece.color
          });
          // No deseleccionar todavía - esperar a que el usuario elija la pieza
          return;
        }

        const success = makeMove(fromStr, toStr);
        if (success) {
          setSelectedSquare(null);
          setLegalMovesForSelected([]);
          // Announce move to screen reader
          const pieceOnSquare = position[fromStr];
          if (pieceOnSquare) {
            const pieceName = getPieceName(pieceOnSquare.type);
            const color = pieceOnSquare.color === 'w' ? 'White' : 'Black';
            announceToScreenReader(`${color} ${pieceName} moved from ${fromStr} to ${toStr}`);
          }
        }
        return;
      }

      // If clicking another piece of the same color, select that piece instead
      if (piece && gameState) {
        const selectedPiece = position[fromStr];
        
        // Requisito 9.1: Validar que la pieza pertenece al jugador actual
        if (selectedPiece && piece.color === selectedPiece.color && 
            InputValidator.validatePieceOwnership(piece, gameState.turn)) {
          // Select the new piece
          const engine = new ChessEngine(gameState.fen);
          const moves = engine.getLegalMoves(square);
          const moveDestinations = moves.map(m => `${m.to.file}${m.to.rank}`);
          setSelectedSquare(square);
          setLegalMovesForSelected(moveDestinations);
          return;
        }
      }

      // Otherwise, deselect and show invalid feedback
      setSelectedSquare(null);
      setLegalMovesForSelected([]);
      const squareStr = `${square.file}${square.rank}`;
      setInvalidSquare(squareStr);
      setTimeout(() => setInvalidSquare(null), 500);
      return;
    }

    // No square selected yet - select this square if it has a piece of the current player
    if (piece && gameState) {
      // Requisito 9.1: Validar que la pieza pertenece al jugador actual
      if (!InputValidator.validatePieceOwnership(piece, gameState.turn)) {
        // Mostrar feedback visual si se intenta seleccionar pieza del oponente
        const squareStr = `${square.file}${square.rank}`;
        setInvalidSquare(squareStr);
        setTimeout(() => setInvalidSquare(null), 500);
        return;
      }

      const engine = new ChessEngine(gameState.fen);
      const moves = engine.getLegalMoves(square);
      const moveDestinations = moves.map(m => `${m.to.file}${m.to.rank}`);
      setSelectedSquare(square);
      setLegalMovesForSelected(moveDestinations);
    }
  }, [selectedSquare, legalMovesForSelected, makeMove, gameState, position]);

  // Handle promotion piece selection
  const handlePromotionSelect = useCallback((piece: PieceType) => {
    if (!promotionState) return;

    const success = makeMove(promotionState.from, promotionState.to, piece);
    
    if (success) {
      setSelectedSquare(null);
      setLegalMovesForSelected([]);
    }
    
    setPromotionState(null);
  }, [promotionState, makeMove]);

  // Handle promotion cancel
  const handlePromotionCancel = useCallback(() => {
    // Deseleccionar la pieza si se cancela la promoción
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setPromotionState(null);
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!focusedSquare) return;

    const fileIndex = files.indexOf(focusedSquare.file);
    const rankIndex = ranks.indexOf(focusedSquare.rank);

    let newFileIndex = fileIndex;
    let newRankIndex = rankIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newFileIndex = Math.max(0, fileIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newFileIndex = Math.min(7, fileIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newRankIndex = Math.max(0, rankIndex - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newRankIndex = Math.min(7, rankIndex + 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        const square = `${focusedSquare.file}${focusedSquare.rank}`;
        const piece = position[square] || null;
        handleSquareClick(focusedSquare, piece);
        return;
      case 'Escape':
        e.preventDefault();
        setSelectedSquare(null);
        setLegalMovesForSelected([]);
        setFocusedSquare(null);
        announceToScreenReader('Selection cleared');
        return;
      default:
        return;
    }

    const newSquare: Square = {
      file: files[newFileIndex],
      rank: ranks[newRankIndex]
    };
    setFocusedSquare(newSquare);
    
    const squareStr = `${newSquare.file}${newSquare.rank}`;
    const pieceOnSquare = position[squareStr];
    const pieceDescription = pieceOnSquare 
      ? `${pieceOnSquare.color === 'w' ? 'White' : 'Black'} ${getPieceName(pieceOnSquare.type)}`
      : 'empty';
    announceToScreenReader(`${squareStr}, ${pieceDescription}`);
  }, [focusedSquare, files, ranks, position, handleSquareClick]);

  // Crear casillas del tablero
  const squares = [];
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const squareFile = files[file];
      const squareRank = ranks[rank];
      const square = `${squareFile}${squareRank}`;
      const isLight = (file + rank) % 2 === 0;

      // Obtener pieza en esta casilla
      const piece = position[square] || null;



      // Check if this square is selected
      const isSelected = selectedSquare?.file === squareFile && selectedSquare?.rank === squareRank;

      // Check if this square is a legal move destination
      const isLegalMoveDestination = legalMovesForSelected.includes(square);

      // Check if this square is part of the last move
      const isLastMoveFrom = derivedLastMove?.from === square;
      const isLastMoveTo = derivedLastMove?.to === square;
      const isPartOfLastMove = isLastMoveFrom || isLastMoveTo;

      // Check if this square has the king in check
      const isKingInCheck = kingInCheckSquare === square;

      // Check if this square is invalid (user tried invalid action)
      const isInvalid = invalidSquare === square;

      // Determine if interaction should be disabled (not player's turn in AI mode)
      const isInteractionDisabled = gameState && 
        !InputValidator.validatePlayerTurn(
          gameState.settings?.mode || 'pvp',
          gameState.turn,
          gameState.settings?.playerColor
        );

      // Check if this square is focused for keyboard navigation
      const isFocused = focusedSquare?.file === squareFile && focusedSquare?.rank === squareRank;

      // Generate ARIA label for the square
      const ariaLabel = (() => {
        const squareLabel = `${squareFile}${squareRank}`;
        if (piece) {
          const color = piece.color === 'w' ? 'White' : 'Black';
          const pieceName = getPieceName(piece.type);
          return `${squareLabel}, ${color} ${pieceName}`;
        }
        return `${squareLabel}, empty square`;
      })();

      squares.push(
        <motion.div
          key={square}
          role="button"
          tabIndex={isFocused ? 0 : -1}
          aria-label={ariaLabel}
          aria-pressed={isSelected}
          aria-disabled={isInteractionDisabled || undefined}
          className={`
            relative flex items-center justify-center select-none
            ${isLight ? 'chess-square-light' : 'chess-square-dark'}
            ${isInteractionDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:brightness-110'}
            ${isKingInCheck ? 'animate-pulse' : ''}
            ${isFocused ? 'ring-2 ring-blue-500 ring-inset' : ''}
          `}
          style={{
            width: squareSize,
            height: squareSize,
          }}
          animate={{
            backgroundColor: isInvalid ? 'rgba(239, 68, 68, 0.4)' : // Red flash for invalid action
                            isKingInCheck ? 'rgba(239, 68, 68, 0.6)' : // Red pulsating for king in check
                            isSelected ? 'rgba(251, 191, 36, 0.5)' : // Yellow/gold for selected
                            isPartOfLastMove ? 'rgba(134, 239, 172, 0.5)' : // Light green for last move
                            undefined
          }}
          transition={{
            duration: isInvalid ? 0.1 : 0.2,
            ease: "easeInOut"
          }}
          onClick={() => handleSquareClick({ file: squareFile, rank: squareRank }, piece)}
        >
          {/* Coordenadas */}
          {!piece && (file === 0 || rank === 7) && (
            <div className={`
              absolute text-xs font-semibold pointer-events-none z-10
              ${isLight ? 'text-amber-800' : 'text-amber-100'}
              ${file === 0 ? 'left-1' : 'right-1'}
              ${rank === 7 ? 'top-1' : 'bottom-1'}
            `}>
              {file === 0 ? squareRank : squareFile}
            </div>
          )}

          {/* Pieza con animación */}
          <AnimatePresence mode="popLayout">
            {piece && (
              <motion.div 
                key={`${piece.color}${piece.type}-${square}`}
                className={`chess-piece ${piece.color === 'w' ? 'chess-piece-white' : 'chess-piece-black'} text-4xl select-none z-20`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut"
                }}
              >
                {getPieceSymbol(piece.type, piece.color)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Indicador de movimiento válido - círculo semi-transparente */}
          {isLegalMoveDestination && !piece && (
            <div 
              className="absolute rounded-full bg-gray-600 opacity-30 pointer-events-none z-10"
              style={{
                width: squareSize * 0.3,
                height: squareSize * 0.3
              }}
            />
          )}

          {/* Indicador de movimiento válido para captura - anillo semi-transparente */}
          {isLegalMoveDestination && piece && (
            <div 
              className="absolute rounded-full border-4 border-gray-600 opacity-40 pointer-events-none z-10"
              style={{
                width: squareSize * 0.85,
                height: squareSize * 0.85
              }}
            />
          )}

          {/* Indicador de último movimiento */}
          {/* Implemented above with lastMove highlighting */}
        </motion.div>
      );
    }
  }

  return (
    <>
      <div
        ref={boardRef}
        className={`chess-board relative ${className}`}
        style={{ width: size, height: size }}
        data-board
        role="grid"
        aria-label="Chess board"
        onKeyDown={handleKeyDown}
        onFocus={() => {
          // Set initial focus to center of board if no square is focused
          if (!focusedSquare) {
            setFocusedSquare({ file: 'e', rank: 4 });
          }
        }}
      >
        <div className="grid grid-cols-8 w-full h-full" role="presentation">
          {squares}
        </div>
      </div>

      {/* Promotion Modal - Requisito 9.3 */}
      <PromotionModal
        isOpen={promotionState?.isOpen || false}
        color={promotionState?.color || 'w'}
        onSelect={handlePromotionSelect}
        onCancel={handlePromotionCancel}
      />

      {/* Screen reader announcer - hidden visually but accessible to screen readers */}
      <div
        id="chess-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </>
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

// Helper function to get piece name for screen readers
function getPieceName(type: string): string {
  const names: Record<string, string> = {
    k: 'King',
    q: 'Queen',
    r: 'Rook',
    b: 'Bishop',
    n: 'Knight',
    p: 'Pawn'
  };
  return names[type] || 'piece';
}
