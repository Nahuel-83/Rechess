/**
 * Configuración de la aplicación
 */
export interface AppConfig {
  gemini: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  chess: {
    defaultDifficulty: string;
    maxMoveTimeMs: number;
    debugMode: boolean;
  };
}

/**
 * Carga la configuración desde las variables de entorno de Vite
 */
export function loadConfig(): AppConfig {
  return {
    gemini: {
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash',
      maxTokens: parseInt(import.meta.env.VITE_GEMINI_MAX_TOKENS || '4096'),
      temperature: parseFloat(import.meta.env.VITE_GEMINI_TEMPERATURE || '0.3'),
    },
    chess: {
      defaultDifficulty: import.meta.env.VITE_DEFAULT_DIFFICULTY || 'easy',
      maxMoveTimeMs: parseInt(import.meta.env.VITE_MAX_MOVE_TIME_MS || '30000'),
      debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    },
  };
}

/**
 * Valida que la configuración sea correcta
 */
export function validateConfig(config: AppConfig): string[] {
  const errors: string[] = [];

  if (!config.gemini.apiKey) {
    errors.push('VITE_GEMINI_API_KEY es requerida');
  }

  if (config.gemini.temperature < 0 || config.gemini.temperature > 1) {
    errors.push('VITE_GEMINI_TEMPERATURE debe estar entre 0 y 1');
  }

  if (config.gemini.maxTokens < 1) {
    errors.push('VITE_GEMINI_MAX_TOKENS debe ser mayor que 0');
  }

  const validDifficulties = ['easy', 'medium', 'hard', 'worldclass'];
  if (!validDifficulties.includes(config.chess.defaultDifficulty)) {
    errors.push(`VITE_DEFAULT_DIFFICULTY debe ser uno de: ${validDifficulties.join(', ')}`);
  }

  if (config.chess.maxMoveTimeMs < 1000) {
    errors.push('VITE_MAX_MOVE_TIME_MS debe ser al menos 1000ms');
  }

  return errors;
}
