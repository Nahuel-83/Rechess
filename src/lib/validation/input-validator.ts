// src/lib/validation/input-validator.ts
import { ChessPiece, PieceColor, GameMode } from '@/types';

/**
 * InputValidator - Validación de entrada de usuario
 * Cumple con Requisito 9: Validación de Entrada de Usuario
 */
export class InputValidator {
  /**
   * Requisito 9.1: Validar que el jugador solo mueva sus propias piezas
   * Verifica que la pieza seleccionada pertenece al jugador actual
   */
  static validatePieceOwnership(piece: ChessPiece, currentTurn: PieceColor): boolean {
    return piece.color === currentTurn;
  }

  /**
   * Requisito 9.2: Validar que el movimiento sea legal
   * Verifica que el movimiento está en la lista de movimientos legales
   */
  static validateMove(from: string, to: string, legalMoves: string[]): boolean {
    // Buscar el movimiento en formato UCI (e2e4) o LAN
    const moveNotation = `${from}${to}`;
    
    // Verificar si el movimiento está en la lista de movimientos legales
    return legalMoves.some(move => {
      // Los movimientos legales pueden estar en formato LAN (e2-e4) o UCI (e2e4)
      const normalizedMove = move.replace('-', '').substring(0, 4);
      return normalizedMove === moveNotation;
    });
  }

  /**
   * Requisito 9.3: Validar que se seleccione pieza de promoción
   * Verifica que cuando un peón alcanza la última fila, se requiere promoción
   */
  static isPromotionMove(from: string, to: string, piece: ChessPiece | null): boolean {
    if (!piece || piece.type !== 'p') {
      return false;
    }

    const toRank = parseInt(to[1]);
    
    // Peón blanco alcanza la fila 8
    if (piece.color === 'w' && toRank === 8) {
      return true;
    }
    
    // Peón negro alcanza la fila 1
    if (piece.color === 'b' && toRank === 1) {
      return true;
    }

    return false;
  }

  /**
   * Requisito 9.4: Validar que sea el turno del jugador
   * En modo PvE, verifica que es el turno del jugador humano, no de la IA
   */
  static validatePlayerTurn(
    gameMode: GameMode,
    currentTurn: PieceColor,
    playerColor?: PieceColor
  ): boolean {
    // En modo PvP, siempre es válido (ambos son jugadores humanos)
    if (gameMode === 'pvp') {
      return true;
    }

    // En modo IA, verificar que es el turno del jugador humano
    if (gameMode === 'ai' && playerColor) {
      return currentTurn === playerColor;
    }

    // Si no hay playerColor definido en modo IA, no permitir movimiento
    return false;
  }

  /**
   * Validar que el juego está en estado jugable
   * No se pueden hacer movimientos si el juego terminó o está pausado
   */
  static validateGameState(gameStatus: string, isGameOver: boolean): boolean {
    if (isGameOver) {
      return false;
    }

    if (gameStatus !== 'playing') {
      return false;
    }

    return true;
  }
}
