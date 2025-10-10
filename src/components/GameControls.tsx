import React from 'react';

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onFlipBoard: () => void;
  canUndo: boolean;
  gameMode: 'pvp' | 'ai';
  onGameModeChange: (mode: 'pvp' | 'ai') => void;
  aiDifficulty: string;
  onAIDifficultyChange: (difficulty: string) => void;
}

/**
 * Componente con controles del juego
 */
export const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onUndo,
  onFlipBoard,
  canUndo,
  gameMode,
  onGameModeChange,
  aiDifficulty,
  onAIDifficultyChange
}) => {
  return (
    <div className="game-controls">
      <div className="control-group">
        <button onClick={onNewGame} className="btn primary">
          Nueva partida
        </button>
        <button
          onClick={onUndo}
          className="btn secondary"
          disabled={!canUndo}
        >
          Deshacer
        </button>
        <button onClick={onFlipBoard} className="btn secondary">
          Voltear tablero
        </button>
      </div>

      <div className="control-group">
        <label>
          Modo de juego:
          <select
            value={gameMode}
            onChange={(e) => onGameModeChange(e.target.value as 'pvp' | 'ai')}
          >
            <option value="pvp">Jugador vs Jugador</option>
            <option value="ai">Jugador vs CPU</option>
          </select>
        </label>
      </div>

      {gameMode === 'ai' && (
        <div className="control-group">
          <label>
            Dificultad IA:
            <select
              value={aiDifficulty}
              onChange={(e) => onAIDifficultyChange(e.target.value)}
            >
              <option value="easy">Fácil (ELO 500)</option>
              <option value="intermediate">Intermedio (ELO 1000)</option>
              <option value="hard">Difícil (ELO 1500)</option>
              <option value="expert">Experto (ELO 2500)</option>
              <option value="world-class">Clase Mundial (ELO 3000)</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
};
