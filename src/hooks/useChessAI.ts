// src/hooks/useChessAI.ts
'use client';

import { useState } from 'react';
import { DifficultyLevel } from '@/types';
import { DifficultyValidator } from '@/lib/validation/difficulty-validator';

export interface AIMoveResponse {
  move: string;
  evaluation: number;
  thinking: string;
  config?: {
    model: string;
    strategy: string;
    elo: number;
  };
}

export interface AIAnalysisResponse {
  analysis: string;
  fen: string;
  model: string;
  timestamp: string;
}

export function useChessAI() {
  const [isThinking, setIsThinking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Solicitar movimiento de IA
  const requestAIMove = async (
    fen: string,
    difficulty: DifficultyLevel,
    history: string[] = [],
    legalMoves: string[] = []
  ): Promise<AIMoveResponse> => {
    console.log('[DIFFICULTY_TRACKING] useChessAI - requestAIMove() called:', {
      difficulty,
      difficultyType: typeof difficulty,
      fen: fen.substring(0, 30) + '...',
      historyLength: history.length,
      legalMovesCount: legalMoves.length,
      timestamp: new Date().toISOString()
    });

    // Validate difficulty parameter
    const isValidDifficulty = DifficultyValidator.isValid(difficulty);
    
    if (!isValidDifficulty) {
      console.warn('[DIFFICULTY_TRACKING] useChessAI - Invalid difficulty parameter:', {
        receivedDifficulty: difficulty,
        difficultyType: typeof difficulty,
        timestamp: new Date().toISOString()
      });
    }
    
    // Normalize difficulty (will use 'medio' as default if invalid)
    const validatedDifficulty = DifficultyValidator.normalize(difficulty);
    
    if (validatedDifficulty !== difficulty) {
      console.warn('[DIFFICULTY_TRACKING] useChessAI - Difficulty normalized:', {
        original: difficulty,
        normalized: validatedDifficulty,
        timestamp: new Date().toISOString()
      });
    }

    setIsThinking(true);
    setError(null);

    try {
      // Si no se proporcionan movimientos legales, calcularlos desde el FEN
      let moves = legalMoves;
      if (moves.length === 0) {
        try {
          // Importar Chess para calcular movimientos legales
          const { Chess } = await import('chess.js');
          const chess = new Chess(fen);
          moves = chess.moves({ verbose: true }).map(m => m.lan);
        } catch (chessError) {
          console.error('Failed to calculate legal moves:', chessError);
          throw new Error('Failed to calculate legal moves from position');
        }
      }

      // Si no hay movimientos legales, el juego terminó
      if (moves.length === 0) {
        console.warn('No legal moves available - game is over');
        throw new Error('No legal moves available - game over');
      }

      console.log('[STOCKFISH] Requesting move with', moves.length, 'legal moves');

      console.log('[DIFFICULTY_TRACKING] useChessAI - Sending request to API:', {
        difficulty: validatedDifficulty,
        endpoint: '/api/ai/move',
        timestamp: new Date().toISOString()
      });

      const response = await fetch('/api/ai/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fen, 
          difficulty: validatedDifficulty, 
          history,
          legalMoves: moves,
          gamePhase: 'middlegame', // Por defecto
          moveHistory: history
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('AI API failed, using random move:', errorData);
        
        // Fallback: movimiento aleatorio
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        return {
          move: randomMove,
          evaluation: 0,
          thinking: 'Movimiento aleatorio (IA no disponible)',
          config: {
            model: 'random',
            strategy: 'random',
            elo: 800
          }
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('AI request failed, using fallback:', errorMessage);
      
      // Fallback final: movimiento aleatorio
      const { Chess } = await import('chess.js');
      const chess = new Chess(fen);
      const moves = chess.moves({ verbose: true }).map(m => m.lan);
      
      if (moves.length === 0) {
        throw new Error('No legal moves available - game over');
      }
      
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return {
        move: randomMove,
        evaluation: 0,
        thinking: 'Movimiento aleatorio (error en IA)',
        config: {
          model: 'random',
          strategy: 'random',
          elo: 800
        }
      };
    } finally {
      setIsThinking(false);
    }
  };

  // Solicitar análisis de posición
  const requestAIAnalysis = async (
    fen: string,
    difficulty?: DifficultyLevel,
    question?: string
  ): Promise<AIAnalysisResponse> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, difficulty, question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw new Error(`AI analysis failed: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Limpiar estado de error
  const clearError = () => {
    setError(null);
  };

  return {
    requestAIMove,
    requestAIAnalysis,
    isThinking,
    isAnalyzing,
    error,
    clearError
  };
}
