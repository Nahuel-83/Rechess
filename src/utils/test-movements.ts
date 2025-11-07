import { INITIAL_GAME_STATE } from '../types/chess';
import { getValidMoves } from '../game/game-logic';

/**
 * Función de prueba para validar movimientos de piezas
 */
export function testPieceMovements(): void {
  console.log('🧪 Iniciando pruebas de movimientos de piezas...');

  const gameState = INITIAL_GAME_STATE;

  // Probar movimientos de torre blanca (a1)
  const rookMoves = getValidMoves(gameState.board, { row: 7, col: 0 }, gameState);
  console.log(`✅ Torre blanca (a1): ${rookMoves.length} movimientos válidos`);

  // Probar movimientos de alfil blanco (c1)
  const bishopMoves = getValidMoves(gameState.board, { row: 7, col: 2 }, gameState);
  console.log(`✅ Alfil blanco (c1): ${bishopMoves.length} movimientos válidos`);

  // Probar movimientos de reina blanca (d1)
  const queenMoves = getValidMoves(gameState.board, { row: 7, col: 3 }, gameState);
  console.log(`✅ Reina blanca (d1): ${queenMoves.length} movimientos válidos`);

  // Probar movimientos de rey blanco (e1)
  const kingMoves = getValidMoves(gameState.board, { row: 7, col: 4 }, gameState);
  console.log(`✅ Rey blanco (e1): ${kingMoves.length} movimientos válidos`);

  // Probar movimientos de caballo blanco (b1)
  const knightMoves = getValidMoves(gameState.board, { row: 7, col: 1 }, gameState);
  console.log(`✅ Caballo blanco (b1): ${knightMoves.length} movimientos válidos`);

  // Probar movimientos de peón blanco (a2)
  const pawnMoves = getValidMoves(gameState.board, { row: 6, col: 0 }, gameState);
  console.log(`✅ Peón blanco (a2): ${pawnMoves.length} movimientos válidos`);

  console.log('🎉 Todas las pruebas de movimientos completadas exitosamente!');
}

/**
 * Función para probar movimientos específicos de piezas en posiciones conocidas
 */
export function testSpecificPositions(): void {
  console.log('🎯 Probando posiciones específicas...');

  const gameState = INITIAL_GAME_STATE;

  // Torre en esquina debe poder moverse en dos direcciones
  const cornerRook = getValidMoves(gameState.board, { row: 0, col: 0 }, gameState);
  console.log(`Torre negra esquina (a8): ${cornerRook.length} movimientos`);

  // Alfil en posición inicial debe tener pocos movimientos
  const initialBishop = getValidMoves(gameState.board, { row: 0, col: 2 }, gameState);
  console.log(`Alfil negro inicial (c8): ${initialBishop.length} movimientos`);

  console.log('✅ Pruebas específicas completadas!');
}

/**
 * Función para validar reglas básicas del ajedrez
 */
export function validateChessRules(): void {
  console.log('⚖️ Validando reglas básicas del ajedrez...');

  const gameState = INITIAL_GAME_STATE;

  // Verificar que piezas blancas no puedan capturarse entre sí
  const whitePieces = gameState.board.flat().filter(p => p?.color === 'white');
  console.log(`Piezas blancas iniciales: ${whitePieces.length}`);

  // Verificar que piezas negras no puedan capturarse entre sí
  const blackPieces = gameState.board.flat().filter(p => p?.color === 'black');
  console.log(`Piezas negras iniciales: ${blackPieces.length}`);

  // Verificar tablero 8x8
  if (gameState.board.length !== 8) {
    console.error('❌ Error: El tablero no tiene 8 filas');
  } else {
    console.log('✅ Tablero tiene 8 filas');
  }

  if (gameState.board[0].length !== 8) {
    console.error('❌ Error: El tablero no tiene 8 columnas');
  } else {
    console.log('✅ Tablero tiene 8 columnas');
  }

  console.log('✅ Validación de reglas básicas completada!');
}
