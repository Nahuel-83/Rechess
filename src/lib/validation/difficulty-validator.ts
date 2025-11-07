// src/lib/validation/difficulty-validator.ts
import type { DifficultyLevel } from '@/types/ai';

/**
 * Utility class for validating and normalizing difficulty levels
 */
export class DifficultyValidator {
  private static readonly VALID_LEVELS: readonly DifficultyLevel[] = [
    'facil',
    'medio',
    'dificil',
    'claseMundial',
    'experto'
  ] as const;

  private static readonly DISPLAY_NAMES: Record<DifficultyLevel, string> = {
    facil: 'Fácil',
    medio: 'Medio',
    dificil: 'Difícil',
    claseMundial: 'Clase Mundial',
    experto: 'Experto'
  };

  private static readonly ELO_RANGES: Record<DifficultyLevel, { min: number; max: number }> = {
    facil: { min: 500, max: 900 },
    medio: { min: 1000, max: 1600 },
    dificil: { min: 1800, max: 2400 },
    claseMundial: { min: 2600, max: 3000 },
    experto: { min: 3200, max: 3500 }
  };

  /**
   * Validates that a value is a valid difficulty level
   * @param value - The value to validate
   * @returns True if the value is a valid DifficultyLevel
   */
  static isValid(value: unknown): value is DifficultyLevel {
    return typeof value === 'string' && this.VALID_LEVELS.includes(value as DifficultyLevel);
  }

  /**
   * Normalizes a value to a valid DifficultyLevel or returns the default
   * @param value - The value to normalize
   * @param defaultValue - The default value to use if normalization fails (default: 'medio')
   * @returns A valid DifficultyLevel
   */
  static normalize(value: unknown, defaultValue: DifficultyLevel = 'medio'): DifficultyLevel {
    if (this.isValid(value)) {
      return value;
    }
    return defaultValue;
  }

  /**
   * Gets the display name for a difficulty level
   * @param level - The difficulty level
   * @returns The localized display name
   */
  static getDisplayName(level: DifficultyLevel): string {
    return this.DISPLAY_NAMES[level];
  }

  /**
   * Gets the ELO range for a difficulty level
   * @param level - The difficulty level
   * @returns An object with min and max ELO values
   */
  static getEloRange(level: DifficultyLevel): { min: number; max: number } {
    return this.ELO_RANGES[level];
  }
}
