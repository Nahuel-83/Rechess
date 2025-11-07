// src/__tests__/input-validator.test.ts
import { describe, it, expect } from 'vitest';
import { InputValidator } from '@/lib/validation';
import { ChessPiece, PieceColor, GameMode } from '@/types';

describe('InputValidator', () => {
  describe('validatePieceOwnership', () => {
    it('debe validar que la pieza pertenece al jugador actual', () => {
      const whitePawn: ChessPiece = { type: 'p', color: 'w' };
      const blackPawn: ChessPiece = { type: 'p', color: 'b' };

      expect(InputValidator.validatePieceOwnership(whitePawn, 'w')).toBe(true);
      expect(InputValidator.validatePieceOwnership(whitePawn, 'b')).toBe(false);
      expect(InputValidator.validatePieceOwnership(blackPawn, 'b')).toBe(true);
      expect(InputValidator.validatePieceOwnership(blackPawn, 'w')).toBe(false);
    });
  });

  describe('validateMove', () => {
    it('debe validar que el movimiento está en la lista de movimientos legales', () => {
      const legalMoves = ['e2e4', 'd2d4', 'g1f3'];

      expect(InputValidator.validateMove('e2', 'e4', legalMoves)).toBe(true);
      expect(InputValidator.validateMove('d2', 'd4', legalMoves)).toBe(true);
      expect(InputValidator.validateMove('e2', 'e5', legalMoves)).toBe(false);
      expect(InputValidator.validateMove('a2', 'a4', legalMoves)).toBe(false);
    });

    it('debe manejar movimientos en formato LAN con guiones', () => {
      const legalMoves = ['e2-e4', 'd2-d4'];

      expect(InputValidator.validateMove('e2', 'e4', legalMoves)).toBe(true);
      expect(InputValidator.validateMove('d2', 'd4', legalMoves)).toBe(true);
    });
  });

  describe('isPromotionMove', () => {
    it('debe detectar cuando un peón blanco alcanza la fila 8', () => {
      const whitePawn: ChessPiece = { type: 'p', color: 'w' };

      expect(InputValidator.isPromotionMove('e7', 'e8', whitePawn)).toBe(true);
      expect(InputValidator.isPromotionMove('e6', 'e7', whitePawn)).toBe(false);
    });

    it('debe detectar cuando un peón negro alcanza la fila 1', () => {
      const blackPawn: ChessPiece = { type: 'p', color: 'b' };

      expect(InputValidator.isPromotionMove('e2', 'e1', blackPawn)).toBe(true);
      expect(InputValidator.isPromotionMove('e3', 'e2', blackPawn)).toBe(false);
    });

    it('no debe detectar promoción para otras piezas', () => {
      const whiteKnight: ChessPiece = { type: 'n', color: 'w' };

      expect(InputValidator.isPromotionMove('e7', 'e8', whiteKnight)).toBe(false);
    });

    it('debe manejar null piece', () => {
      expect(InputValidator.isPromotionMove('e7', 'e8', null)).toBe(false);
    });
  });

  describe('validatePlayerTurn', () => {
    it('debe permitir cualquier turno en modo PvP', () => {
      expect(InputValidator.validatePlayerTurn('pvp', 'w')).toBe(true);
      expect(InputValidator.validatePlayerTurn('pvp', 'b')).toBe(true);
    });

    it('debe validar turno del jugador en modo IA', () => {
      expect(InputValidator.validatePlayerTurn('ai', 'w', 'w')).toBe(true);
      expect(InputValidator.validatePlayerTurn('ai', 'b', 'w')).toBe(false);
      expect(InputValidator.validatePlayerTurn('ai', 'b', 'b')).toBe(true);
      expect(InputValidator.validatePlayerTurn('ai', 'w', 'b')).toBe(false);
    });

    it('no debe permitir movimiento si no hay playerColor en modo IA', () => {
      expect(InputValidator.validatePlayerTurn('ai', 'w')).toBe(false);
      expect(InputValidator.validatePlayerTurn('ai', 'b')).toBe(false);
    });
  });

  describe('validateGameState', () => {
    it('debe rechazar movimientos si el juego terminó', () => {
      expect(InputValidator.validateGameState('playing', true)).toBe(false);
      expect(InputValidator.validateGameState('finished', true)).toBe(false);
    });

    it('debe rechazar movimientos si el juego no está en estado playing', () => {
      expect(InputValidator.validateGameState('waiting', false)).toBe(false);
      expect(InputValidator.validateGameState('paused', false)).toBe(false);
      expect(InputValidator.validateGameState('finished', false)).toBe(false);
    });

    it('debe permitir movimientos si el juego está en estado playing y no terminó', () => {
      expect(InputValidator.validateGameState('playing', false)).toBe(true);
    });
  });
});
