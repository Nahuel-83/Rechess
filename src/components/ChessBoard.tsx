import React from 'react';
import type { Position, Piece, GameState } from '../types/chess';
import './ChessBoard.css';

interface ChessBoardProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
  selectedSquare: Position | null;
  validMoves: Position[];
  flipped?: boolean;
}

/**
 * Componente principal del tablero de ajedrez
 */
export const ChessBoard: React.FC<ChessBoardProps> = ({
  gameState,
  onSquareClick,
  selectedSquare,
  validMoves,
  flipped = false
}) => {
  const renderSquare = (row: number, col: number) => {
    const position: Position = { row, col };
    const piece = gameState.board[row][col];
    const isSelected = selectedSquare?.row === row && selectedSquare?.col === col;
    const isValidMove = validMoves.some(move => move.row === row && move.col === col);
    const isLight = (row + col) % 2 === 1;

    return (
      <div
        key={`${row}-${col}`}
        className={`
          chess-square
          ${isLight ? 'light' : 'dark'}
          ${isSelected ? 'selected' : ''}
          ${isValidMove ? 'valid-move' : ''}
        `}
        onClick={() => onSquareClick(position)}
      >
        {renderPiece(piece)}
        {isValidMove && <div className="move-indicator" />}
      </div>
    );
  };

  const renderPiece = (piece: Piece | null) => {
    if (!piece) return null;

    const pieceSymbol = getPieceSymbol(piece);
    const pieceClass = `piece ${piece.color} ${piece.type}`;

    return (
      <div className={pieceClass} title={`${piece.color} ${piece.type}`}>
        {pieceSymbol}
      </div>
    );
  };

  const getPieceSymbol = (piece: Piece): string => {
    const symbols: Record<string, string> = {
      'king': '♔',
      'queen': '♕',
      'rook': '♖',
      'bishop': '♗',
      'knight': '♘',
      'pawn': '♙'
    };

    return symbols[piece.type] || '?';
  };

  const boardRows = flipped
    ? Array.from({ length: 8 }, (_, row) => 7 - row)
    : Array.from({ length: 8 }, (_, row) => row);

  const boardCols = flipped
    ? Array.from({ length: 8 }, (_, col) => 7 - col)
    : Array.from({ length: 8 }, (_, col) => col);

  return (
    <div className="chess-board">
      {boardRows.map(row =>
        boardCols.map(col => renderSquare(row, col))
      )}
    </div>
  );
};
