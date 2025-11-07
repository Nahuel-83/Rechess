// src/lib/ai/difficulty-config.ts
import { DifficultyConfig, DifficultyLevel } from '@/types';

export const DIFFICULTY_LEVELS: Record<DifficultyLevel, DifficultyConfig> = {
  facil: {
    elo: 600,
    skillLevel: 20,
    depth: 1,
    thinkTime: 500,
    errorRate: 0.4,
    strategy: "Muy Débil - Principiante Absoluto"
  },
  medio: {
    elo: 1000,
    skillLevel: 20,
    depth: 3,
    thinkTime: 1500,
    errorRate: 0.2,
    strategy: "Nivel Adquisible"
  },
  dificil: {
    elo: 1800,
    skillLevel: 20,
    depth: 15,
    thinkTime: 5000,
    errorRate: 0.05,
    strategy: "Jugador Intermedio Fuerte"
  },
  claseMundial: {
    elo: 2600,
    skillLevel: 20,
    depth: 25,
    thinkTime: 10000,
    errorRate: 0.01,
    strategy: "Maestro Internacional"
  },
  experto: {
    elo: 3500,
    skillLevel: 20,
    depth: 40,
    thinkTime: 20000,
    errorRate: 0.0001,
    strategy: "Máxima Fuerza - Nivel Sobrehumano",
    phases: {
      opening: "Análisis Exhaustivo de Apertura",
      middlegame: "Perfección Táctica Absoluta",
      endgame: "Técnica de Final Perfecta"
    }
  }
};

// Función para obtener configuración por nivel
export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_LEVELS[level];
}

// Función para determinar fase del juego basada en número de movimientos
export function determineGamePhase(moveCount: number): 'opening' | 'middlegame' | 'endgame' {
  if (moveCount < 10) return 'opening';
  if (moveCount < 40) return 'middlegame';
  return 'endgame';
}

// Función para ajustar configuración según fase del juego
export function adjustConfigForGamePhase(
  config: DifficultyConfig,
  gamePhase: 'opening' | 'middlegame' | 'endgame'
): DifficultyConfig {
  if (config.phases && config.strategy === 'adaptive_specialist') {
    const phaseStyle = config.phases[gamePhase];
    return {
      ...config,
      strategy: phaseStyle
    };
  }

  return config;
}
