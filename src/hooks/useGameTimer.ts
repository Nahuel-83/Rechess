// src/hooks/useGameTimer.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { GameTimer } from '@/lib/game';
import { PieceColor } from '@/types';

export interface UseGameTimerReturn {
  whiteTime: number;
  blackTime: number;
  isRunning: boolean;
  currentPlayer: PieceColor;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  switchTurn: () => void;
  addTime: (color: PieceColor, seconds: number) => void;
  setTimeControl: (initialTime: number, increment?: number) => void;
  getFormattedTime: (color: PieceColor) => string;
  isTimeUp: (color: PieceColor) => boolean;
}

export function useGameTimer(
  initialTime: number = 600, // 10 minutos por defecto
  increment: number = 0,
  onTimeUp?: (color: PieceColor) => void
): UseGameTimerReturn {
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('w');

  const gameTimerRef = useRef<GameTimer | null>(null);

  // Inicializar temporizador
  useEffect(() => {
    gameTimerRef.current = new GameTimer(initialTime, onTimeUp);

    // Suscribirse a cambios de tiempo
    const updateTime = () => {
      if (gameTimerRef.current) {
        const state = gameTimerRef.current.getState();
        setWhiteTime(state.white);
        setBlackTime(state.black);
        setIsRunning(state.isRunning);
        setCurrentPlayer(state.currentPlayer);
      }
    };

    // Actualizar cada segundo mientras corre
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(updateTime, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (gameTimerRef.current) {
        gameTimerRef.current.destroy();
      }
    };
  }, [initialTime, onTimeUp, isRunning]);

  // Iniciar temporizador
  const startTimer = useCallback(() => {
    gameTimerRef.current?.start();
    setIsRunning(true);
  }, []);

  // Pausar temporizador
  const pauseTimer = useCallback(() => {
    gameTimerRef.current?.pause();
    setIsRunning(false);
  }, []);

  // Detener temporizador
  const stopTimer = useCallback(() => {
    gameTimerRef.current?.stop();
    setIsRunning(false);
    setWhiteTime(0);
    setBlackTime(0);
  }, []);

  // Cambiar turno
  const switchTurn = useCallback(() => {
    gameTimerRef.current?.switchTurn();
    setCurrentPlayer(prev => prev === 'w' ? 'b' : 'w');

    // Agregar incremento si está configurado
    if (increment > 0 && gameTimerRef.current) {
      const currentTime = gameTimerRef.current.getTime(currentPlayer);
      gameTimerRef.current.setTime(currentPlayer, currentTime + increment);
    }
  }, [currentPlayer, increment]);

  // Agregar tiempo
  const addTime = useCallback((color: PieceColor, seconds: number) => {
    gameTimerRef.current?.addTime(color, seconds);
    if (color === 'w') {
      setWhiteTime(prev => prev + seconds);
    } else {
      setBlackTime(prev => prev + seconds);
    }
  }, []);

  // Configurar control de tiempo
  const setTimeControl = useCallback((newInitialTime: number, newIncrement: number = 0) => {
    gameTimerRef.current?.setTimeControl(newInitialTime, newIncrement, currentPlayer);
    setWhiteTime(newInitialTime);
    setBlackTime(newInitialTime);
  }, [currentPlayer]);

  // Obtener tiempo formateado
  const getFormattedTime = useCallback((color: PieceColor): string => {
    if (!gameTimerRef.current) return '00:00';

    const time = gameTimerRef.current.getTime(color);
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Verificar si se agotó el tiempo
  const isTimeUp = useCallback((color: PieceColor): boolean => {
    return gameTimerRef.current?.isTimeUp(color) || false;
  }, []);

  return {
    whiteTime,
    blackTime,
    isRunning,
    currentPlayer,
    startTimer,
    pauseTimer,
    stopTimer,
    switchTurn,
    addTime,
    setTimeControl,
    getFormattedTime,
    isTimeUp
  };
}
