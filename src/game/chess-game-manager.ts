import type { GameState, Position, Piece, PieceType } from '../types/chess';
import { cloneGameState, setPieceAt, getPieceAt } from './game-logic';
import { INITIAL_GAME_STATE } from '../types/chess';
import { analyzeGameState } from './move-validator';

/**
 * Gestor del estado del juego de ajedrez
 * Maneja toda la lógica relacionada con el estado del juego
 */
export class ChessGameManager {
  private gameState: GameState;
  private maxMoveHistory: number = 50; // Limitar historial a últimos 50 movimientos

  constructor(initialState?: GameState) {
    this.gameState = initialState || cloneGameState(INITIAL_GAME_STATE);
  }

  /**
   * Configura el límite máximo del historial de movimientos
   */
  setMaxMoveHistory(maxMoves: number): void {
    this.maxMoveHistory = Math.max(10, maxMoves); // Mínimo 10 movimientos
    this.cleanMoveHistory(); // Limpiar inmediatamente si es necesario
  }

  /**
   * Obtiene el límite máximo del historial de movimientos
   */
  getMaxMoveHistory(): number {
    return this.maxMoveHistory;
  }

  /**
   * Obtiene el estado actual del juego
   */
  getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Obtiene estadísticas de rendimiento del historial
   */
  getHistoryStats(): { currentLength: number; maxLength: number; memoryUsage: string } {
    const currentLength = this.gameState.moveHistory.length;
    const maxLength = this.maxMoveHistory;
    const memoryUsage = `~${Math.round(currentLength * 50 / 1024)}KB`; // Estimación aproximada

    return {
      currentLength,
      maxLength,
      memoryUsage
    };
  }

  /**
   * Limpia el historial de movimientos manteniendo solo los últimos N movimientos
   */
  private cleanMoveHistory(): void {
    if (this.gameState.moveHistory.length > this.maxMoveHistory) {
      this.gameState.moveHistory = this.gameState.moveHistory.slice(-this.maxMoveHistory);
    }
  }

  /**
   * Actualiza el estado del juego
   */
  setGameState(newState: GameState): void {
    this.gameState = newState;
  }

  /**
   * Verifica si un peón debe ser promovido
   */
  isPawnPromotion(piece: Piece, to: Position): boolean {
    if (piece.type !== 'pawn') return false;
    // Blancas: promoción en fila 0, Negras: promoción en fila 7
    return piece.color === 'white' ? to.row === 0 : to.row === 7;
  }

  /**
   * Completa la promoción de un peón
   */
  completePawnPromotion(position: Position, piece: Piece, promotionPieceType: PieceType): GameState {
    const newGameState = cloneGameState(this.gameState);

    // Crear la nueva pieza promovida
    const promotedPiece: Piece = {
      type: promotionPieceType,
      color: piece.color,
      id: `${promotionPieceType}_${position.row}_${position.col}_${Date.now()}`
    };

    // Reemplazar el peón con la pieza promovida
    setPieceAt(newGameState.board, position, promotedPiece);

    // Actualizar el último movimiento en el historial
    if (newGameState.moveHistory.length > 0) {
      const lastMove = newGameState.moveHistory[newGameState.moveHistory.length - 1];
      lastMove.promotionPiece = promotionPieceType;
    }

    // Limpiar historial para mantener rendimiento
    this.cleanMoveHistory();

    // Cambiar turno
    newGameState.currentPlayer = newGameState.currentPlayer === 'white' ? 'black' : 'white';

    this.gameState = newGameState;
    return newGameState;
  }

  /**
   * Verifica si un movimiento es un enroque
   */
  isCastlingMove(piece: Piece, from: Position, to: Position): boolean {
    // Solo el rey puede hacer enroque
    if (piece.type !== 'king') return false;

    // Verificar que se mueve dos casillas horizontalmente (enroque)
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    return rowDiff === 0 && colDiff === 2;
  }

  /**
   * Realiza el movimiento de enroque (mueve rey y torre)
   */
  performCastling(gameState: GameState, from: Position, to: Position): GameState {
    const newGameState = cloneGameState(gameState);
    const isKingSide = to.col > from.col; // Enroque corto si va a la derecha
    const row = from.row;

    // Mover el rey
    const king = getPieceAt(newGameState.board, from);
    if (king && king.type === 'king') {
      setPieceAt(newGameState.board, to, king);
      setPieceAt(newGameState.board, from, null);
    }

    // Mover la torre correspondiente
    const rookFromCol = isKingSide ? 7 : 0;
    const rookToCol = isKingSide ? 5 : 3; // Torre se mueve dos casillas hacia el centro

    const rook = getPieceAt(newGameState.board, { row, col: rookFromCol });
    if (rook && rook.type === 'rook') {
      setPieceAt(newGameState.board, { row, col: rookToCol }, rook);
      setPieceAt(newGameState.board, { row, col: rookFromCol }, null);
    }

    return newGameState;
  }

  /**
   * Actualiza los derechos de enroque después de un movimiento
   */
  updateCastlingRights(gameState: GameState, from: Position, piece: Piece): GameState {
    const newGameState = cloneGameState(gameState);

    // Si se mueve el rey, pierde derechos de enroque
    if (piece.type === 'king') {
      if (piece.color === 'white') {
        newGameState.castlingRights.whiteKingSide = false;
        newGameState.castlingRights.whiteQueenSide = false;
      } else {
        newGameState.castlingRights.blackKingSide = false;
        newGameState.castlingRights.blackQueenSide = false;
      }
    }

    // Si se mueve una torre, pierde derechos de enroque en ese lado
    if (piece.type === 'rook') {
      if (piece.color === 'white') {
        if (from.col === 0) newGameState.castlingRights.whiteQueenSide = false; // Torre de reina
        if (from.col === 7) newGameState.castlingRights.whiteKingSide = false;  // Torre de rey
      } else {
        if (from.col === 0) newGameState.castlingRights.blackQueenSide = false; // Torre de reina
        if (from.col === 7) newGameState.castlingRights.blackKingSide = false;  // Torre de rey
      }
    }

    return newGameState;
  }

  /**
   * Hace un movimiento en el tablero
   */
  makeMove(from: Position, to: Position): { success: boolean; newState?: GameState; pendingPromotion?: { position: Position; piece: Piece } } {
    const piece = getPieceAt(this.gameState.board, from);
    if (!piece || piece.color !== this.gameState.currentPlayer) {
      return { success: false };
    }

    const newGameState = cloneGameState(this.gameState);

    // Verificar si es un movimiento de enroque
    const isCastling = this.isCastlingMove(piece, from, to);

    if (isCastling) {
      // Realizar enroque: mover rey y torre
      const castledState = this.performCastling(newGameState, from, to);
      this.updateGameStateAfterMove(castledState, from, to, piece, undefined, isCastling);
      return { success: true, newState: this.gameState };
    } else {
      // Movimiento normal: solo mover la pieza
      const capturedPiece = getPieceAt(newGameState.board, to);

      // Verificar que no se capture una pieza propia
      if (capturedPiece && capturedPiece.color === piece.color) {
        console.error('❌ Error: No se puede capturar pieza propia');
        return { success: false };
      }

      // Verificar si es promoción de peón
      if (piece.type === 'pawn' && this.isPawnPromotion(piece, to)) {
        // Colocar el peón temporalmente y devolver estado pendiente de promoción
        setPieceAt(newGameState.board, to, piece);
        setPieceAt(newGameState.board, from, null);

        // Actualizar historial como promoción pendiente
        newGameState.moveHistory.push({
          from,
          to,
          piece,
          capturedPiece: capturedPiece || undefined,
          isPromotion: true,
          promotionPiece: 'queen' // Valor por defecto, se actualizará cuando se complete la promoción
        });

        this.gameState = newGameState;
        return {
          success: true,
          newState: newGameState,
          pendingPromotion: { position: to, piece }
        };
      }

      setPieceAt(newGameState.board, to, piece);
      setPieceAt(newGameState.board, from, null);
    }

    this.updateGameStateAfterMove(newGameState, from, to, piece, getPieceAt(this.gameState.board, to) || undefined, isCastling);
    return { success: true, newState: this.gameState };
  }

  /**
   * Actualiza el estado del juego después de un movimiento
   */
  private updateGameStateAfterMove(
    gameState: GameState,
    from: Position,
    to: Position,
    piece: Piece,
    capturedPiece?: Piece,
    isCastling: boolean = false
  ): void {
    // Actualizar historial de movimientos
    gameState.moveHistory.push({
      from,
      to,
      piece,
      capturedPiece,
      isCastling: isCastling
    });

    // Limpiar historial para mantener rendimiento
    this.cleanMoveHistory();

    // Actualizar derechos de enroque después del movimiento
    const updatedRights = this.updateCastlingRights(gameState, from, piece);

    // Cambiar turno
    updatedRights.currentPlayer = updatedRights.currentPlayer === 'white' ? 'black' : 'white';

    // Analizar el estado del juego para detectar jaque, jaque mate, etc.
    const analysis = analyzeGameState(updatedRights);

    // Actualizar el estado del juego con el análisis
    updatedRights.isInCheck = analysis.isInCheck;
    updatedRights.isCheckmate = analysis.isCheckmate;
    updatedRights.isStalemate = analysis.isStalemate;

    this.gameState = updatedRights;
  }

  /**
   * Reinicia el juego al estado inicial
   */
  resetGame(): GameState {
    this.gameState = cloneGameState(INITIAL_GAME_STATE);
    return this.gameState;
  }

  /**
   * Deshace el último movimiento
   */
  undoLastMove(): GameState {
    if (this.gameState.moveHistory.length === 0) {
      return this.gameState;
    }

    const lastMove = this.gameState.moveHistory[this.gameState.moveHistory.length - 1];
    const newGameState = cloneGameState(this.gameState);

    // Revertir el movimiento
    setPieceAt(newGameState.board, lastMove.from, lastMove.piece);
    setPieceAt(newGameState.board, lastMove.to, lastMove.capturedPiece || null);

    // Remover el movimiento del historial
    newGameState.moveHistory.pop();

    // Cambiar turno
    newGameState.currentPlayer = newGameState.currentPlayer === 'white' ? 'black' : 'white';

    this.gameState = newGameState;
    return newGameState;
  }

  /**
   * Verifica si el juego está en un estado válido
   */
  validateGameState(gameState: GameState): boolean {
    try {
      // Verificar que el tablero tenga el tamaño correcto
      if (!gameState.board || gameState.board.length !== 8) {
        console.error('❌ Error: Tablero inválido - no tiene 8 filas');
        return false;
      }

      for (let row = 0; row < 8; row++) {
        if (!gameState.board[row] || gameState.board[row].length !== 8) {
          console.error(`❌ Error: Tablero inválido - fila ${row} no tiene 8 columnas`);
          return false;
        }
      }

      // Verificar que haya exactamente un rey de cada color
      let whiteKingCount = 0;
      let blackKingCount = 0;

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = gameState.board[row][col];
          if (piece) {
            if (piece.type === 'king') {
              if (piece.color === 'white') whiteKingCount++;
              else blackKingCount++;
            }
          }
        }
      }

      if (whiteKingCount !== 1 || blackKingCount !== 1) {
        console.error(`❌ Error: Número inválido de reyes - Blancas: ${whiteKingCount}, Negras: ${blackKingCount}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error al validar estado del juego:', error);
      return false;
    }
  }
}

// Instancia singleton para usar en toda la aplicación
export const chessGameManager = new ChessGameManager();
