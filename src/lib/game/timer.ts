// src/lib/game/timer.ts
import { TimerState, PieceColor } from '@/types';

export class GameTimer {
  private timers: TimerState = {
    white: 0,
    black: 0,
    isRunning: false,
    currentPlayer: 'w'
  };

  private intervalId: NodeJS.Timeout | null = null;
  private onTimeUp?: (color: PieceColor) => void;

  constructor(
    initialTime: number = 600, // 10 minutos por defecto
    onTimeUp?: (color: PieceColor) => void
  ) {
    this.timers.white = initialTime;
    this.timers.black = initialTime;
    this.onTimeUp = onTimeUp;
  }

  // Iniciar temporizador
  start(): void {
    if (this.intervalId) return;

    this.timers.isRunning = true;
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  // Pausar temporizador
  pause(): void {
    this.timers.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Detener temporizador
  stop(): void {
    this.pause();
    this.timers.white = 0;
    this.timers.black = 0;
  }

  // Cambiar turno
  switchTurn(): void {
    this.timers.currentPlayer = this.timers.currentPlayer === 'w' ? 'b' : 'w';
  }

  // Obtener tiempo restante para un jugador
  getTime(color: PieceColor): number {
    return color === 'w' ? this.timers.white : this.timers.black;
  }

  // Obtener estado del temporizador
  getState(): TimerState {
    return { ...this.timers };
  }

  // Establecer tiempo para un jugador
  setTime(color: PieceColor, time: number): void {
    if (color === 'w') {
      this.timers.white = time;
    } else {
      this.timers.black = time;
    }
  }

  // Agregar tiempo (incremento)
  addTime(color: PieceColor, seconds: number): void {
    if (color === 'w') {
      this.timers.white += seconds;
    } else {
      this.timers.black += seconds;
    }
  }

  // Configurar control de tiempo completo
  setTimeControl(
    initialTime: number,
    increment: number = 0,
    currentPlayer: PieceColor = 'w'
  ): void {
    this.timers.white = initialTime;
    this.timers.black = initialTime;
    this.timers.currentPlayer = currentPlayer;
  }

  // Verificar si hay tiempo agotado
  isTimeUp(color: PieceColor): boolean {
    return this.getTime(color) <= 0;
  }

  // Formatear tiempo como mm:ss
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Obtener tiempo formateado para un jugador
  getFormattedTime(color: PieceColor): string {
    return this.formatTime(this.getTime(color));
  }

  // Procesar tick del temporizador
  private tick(): void {
    const currentPlayer = this.timers.currentPlayer;

    if (currentPlayer === 'w') {
      this.timers.white = Math.max(0, this.timers.white - 1);
    } else {
      this.timers.black = Math.max(0, this.timers.black - 1);
    }

    // Verificar tiempo agotado
    if (this.isTimeUp(currentPlayer)) {
      this.pause();
      if (this.onTimeUp) {
        this.onTimeUp(currentPlayer);
      }
    }
  }

  // Destruir temporizador
  destroy(): void {
    this.stop();
  }
}
