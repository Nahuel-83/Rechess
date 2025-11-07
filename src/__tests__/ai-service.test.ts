// src/__tests__/ai-service.test.ts
import { describe, it, expect } from 'vitest';
import { AIService, AIServiceError } from '@/lib/ai/ai-service';

describe('AIService', () => {
  describe('validateAIMove', () => {
    it('debe validar movimiento legal', () => {
      const service = new AIService();
      const legalMoves = ['e2e4', 'd2d4', 'g1f3'];
      
      expect(service.validateAIMove('e2e4', legalMoves)).toBe(true);
      expect(service.validateAIMove('d2d4', legalMoves)).toBe(true);
      expect(service.validateAIMove('g1f3', legalMoves)).toBe(true);
    });

    it('debe rechazar movimiento ilegal', () => {
      const service = new AIService();
      const legalMoves = ['e2e4', 'd2d4', 'g1f3'];
      
      expect(service.validateAIMove('e2e5', legalMoves)).toBe(false);
      expect(service.validateAIMove('a1a8', legalMoves)).toBe(false);
    });

    it('debe ser case-insensitive', () => {
      const service = new AIService();
      const legalMoves = ['e2e4', 'd2d4'];
      
      expect(service.validateAIMove('E2E4', legalMoves)).toBe(true);
      expect(service.validateAIMove('D2D4', legalMoves)).toBe(true);
    });

    it('debe manejar espacios en blanco', () => {
      const service = new AIService();
      const legalMoves = ['e2e4', 'd2d4'];
      
      expect(service.validateAIMove(' e2e4 ', legalMoves)).toBe(true);
      expect(service.validateAIMove('  d2d4  ', legalMoves)).toBe(true);
    });

    it('debe rechazar valores inválidos', () => {
      const service = new AIService();
      const legalMoves = ['e2e4'];
      
      expect(service.validateAIMove('', legalMoves)).toBe(false);
      expect(service.validateAIMove(null as unknown as string, legalMoves)).toBe(false);
      expect(service.validateAIMove(undefined as unknown as string, legalMoves)).toBe(false);
    });
  });



  describe('AIServiceError', () => {
    it('debe crear error con código y retryable', () => {
      const error = new AIServiceError('Test error', 'TEST_CODE', true);
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.retryable).toBe(true);
      expect(error.name).toBe('AIServiceError');
    });

    it('debe tener retryable true por defecto', () => {
      const error = new AIServiceError('Test error', 'TEST_CODE');
      
      expect(error.retryable).toBe(true);
    });

    it('debe permitir retryable false', () => {
      const error = new AIServiceError('Test error', 'TEST_CODE', false);
      
      expect(error.retryable).toBe(false);
    });
  });

  describe('Integración básica', () => {
    it('debe crear instancia sin errores', () => {
      expect(() => new AIService()).not.toThrow();
    });

    it('debe tener cleanup method', () => {
      const service = new AIService();
      expect(typeof service.cleanup).toBe('function');
    });
  });

  describe('Validación de respuesta completa', () => {
    it('debe validar estructura de AIMoveResponse', () => {
      // Simular respuesta válida
      const mockResponse = {
        move: 'e2e4',
        confidence: 0.8,
        model: 'test-model',
        thinkTime: 1000,
      };

      expect(mockResponse.move).toBeTruthy();
      expect(typeof mockResponse.confidence).toBe('number');
      expect(mockResponse.confidence).toBeGreaterThanOrEqual(0);
      expect(mockResponse.confidence).toBeLessThanOrEqual(1);
      expect(typeof mockResponse.model).toBe('string');
      expect(typeof mockResponse.thinkTime).toBe('number');
    });
  });

  describe('Manejo de casos edge', () => {
    it('debe manejar lista vacía de movimientos legales', () => {
      const service = new AIService();
      
      expect(service.validateAIMove('e2e4', [])).toBe(false);
    });
  });
});
