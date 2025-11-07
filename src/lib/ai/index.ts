// src/lib/ai/index.ts
export { getDifficultyConfig, adjustConfigForGamePhase, determineGamePhase } from './difficulty-config';
export { PromptBuilder } from './prompt-builder';
export { AIService, AIServiceError } from './ai-service';
export type { AIMoveRequest, AIMoveResponse } from './ai-service';
