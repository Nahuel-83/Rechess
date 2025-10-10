import React from 'react';
import type { PieceType, Color } from '../types/chess';

/**
 * Componente de diálogo para promoción de peón
 */
export const PawnPromotionDialog: React.FC<{
  onSelectPiece: (pieceType: PieceType) => void;
  color: Color;
}> = ({ onSelectPiece }) => {
  const pieceOptions: { type: PieceType; symbol: string; name: string }[] = [
    { type: 'queen', symbol: '♛', name: 'Reina' },
    { type: 'rook', symbol: '♜', name: 'Torre' },
    { type: 'bishop', symbol: '♝', name: 'Alfil' },
    { type: 'knight', symbol: '♞', name: 'Caballo' }
  ];

  return (
    <div className="promotion-overlay">
      <div className="promotion-dialog">
        <h3>¡Promoción de Peón!</h3>
        <p>Elige una pieza para promover tu peón:</p>
        <div className="promotion-options">
          {pieceOptions.map(option => (
            <button
              key={option.type}
              className={`promotion-option ${option.type}`}
              onClick={() => onSelectPiece(option.type)}
              title={`Promover a ${option.name}`}
            >
              <span className="promotion-symbol">{option.symbol}</span>
              <span className="promotion-name">{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
