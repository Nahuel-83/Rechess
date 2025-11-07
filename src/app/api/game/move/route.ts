// src/app/api/game/move/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ChessEngine } from '@/lib/chess';
import { Square, PieceType } from '@/types';

interface MoveRequest {
  gameId: string;
  from: string;
  to: string;
  promotion?: string;
  fen?: string; // Estado actual del juego
}

export async function POST(request: NextRequest) {
  try {
    const { gameId, from, to, promotion, fen }: MoveRequest = await request.json();

    // Validar parámetros requeridos
    if (!gameId || !from || !to) {
      return NextResponse.json(
        { error: 'Parámetros faltantes: gameId, from, to' },
        { status: 400 }
      );
    }

    // Crear motor de ajedrez con posición actual o posición inicial
    const engine = fen ? new ChessEngine(fen) : new ChessEngine();

    // Validar movimiento
    const fromSquare: Square = {
      file: from[0],
      rank: parseInt(from[1])
    };

    const toSquare: Square = {
      file: to[0],
      rank: parseInt(to[1])
    };

    const isValid = engine.makeMove(fromSquare, toSquare, promotion as PieceType);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Movimiento inválido' },
        { status: 400 }
      );
    }

    // Obtener nuevo estado del juego
    const newFen = engine.getFen();
    const gameState = engine.getGameState();

    return NextResponse.json({
      success: true,
      fen: newFen,
      gameState,
      message: 'Movimiento realizado exitosamente'
    });

  } catch (error) {
    console.error('Error processing move:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
