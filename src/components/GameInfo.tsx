import React from 'react';
import type { GameState } from '../types/chess';
import { analyzeGameState } from '../game/move-validator';
import { calculateMaterialDifference } from '../game/chess-utils';

interface GameInfoProps {
  gameState: GameState;
  whiteTime?: number;
  blackTime?: number;
  gameMode?: 'pvp' | 'ai';
  aiDifficulty?: string;
}

/**
 * Componente que muestra información del juego
 */
export const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  whiteTime,
  blackTime,
  gameMode,
  aiDifficulty
}) => {
  const formatTime = (seconds?: number) => {
    if (seconds === undefined) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Analizar el estado actual del juego
  const analysis = analyzeGameState(gameState);

  // Calcular diferencia de material
  const materialDiff = calculateMaterialDifference(gameState);

  return (
    <div className="game-info">
      <div className="player-info white">
        <div className="player-name">Blancas</div>
        <div className="timer">{formatTime(whiteTime)}</div>
        <div className="material-count">Material: {materialDiff.white}</div>
        {gameState.currentPlayer === 'white' && !analysis.isCheckmate && !analysis.isStalemate && (
          <div className="current-turn">Tu turno</div>
        )}
      </div>

      <div className="game-status">
        {analysis.isCheckmate && (
          <div className="status checkmate">
            ¡Jaque mate! {gameState.currentPlayer === 'white' ? 'Negras' : 'Blancas'} ganan
          </div>
        )}
        {analysis.isStalemate && (
          <div className="status stalemate">¡Tablas por ahogado!</div>
        )}
        {analysis.isInCheck && !analysis.isCheckmate && (
          <div className="status check">¡Jaque!</div>
        )}
        {!analysis.isInCheck && !analysis.isCheckmate && !analysis.isStalemate && (
          <div className="status normal">
            Turno de {gameState.currentPlayer === 'white' ? 'blancas' : 'negras'}
          </div>
        )}
      </div>

      <div className="player-info black">
        <div className="player-name">Negras</div>
        <div className="timer">{formatTime(blackTime)}</div>
        <div className="material-count">Material: {materialDiff.black}</div>
        {gameState.currentPlayer === 'black' && !analysis.isCheckmate && !analysis.isStalemate && (
          <div className="current-turn">Tu turno</div>
        )}
      </div>

      {/* Indicador de ventaja de material */}
      <div className="material-advantage">
        {materialDiff.white > materialDiff.black && (
          <div className="advantage white-advantage">
            Blancas +{materialDiff.white - materialDiff.black}
          </div>
        )}
        {materialDiff.black > materialDiff.white && (
          <div className="advantage black-advantage">
            Negras +{materialDiff.black - materialDiff.white}
          </div>
        )}
        {materialDiff.white === materialDiff.black && (
          <div className="advantage equal">
            Material igual
          </div>
        )}
      </div>

      {/* Información adicional del juego */}
      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">Movimientos:</span>
          <span className="stat-value">{gameState.moveHistory.length}</span>
        </div>
        {gameMode === 'ai' && (
          <div className="stat-item">
            <span className="stat-label">Dificultad:</span>
            <span className="stat-value">
              {aiDifficulty === 'easy' && 'Fácil (ELO 500)'}
              {aiDifficulty === 'intermediate' && 'Intermedio (ELO 1000)'}
              {aiDifficulty === 'hard' && 'Difícil (ELO 1500)'}
              {aiDifficulty === 'expert' && 'Experto (ELO 2500)'}
              {aiDifficulty === 'world-class' && 'Clase Mundial (ELO 3000)'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
