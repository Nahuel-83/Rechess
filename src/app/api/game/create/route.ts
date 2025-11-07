// src/app/api/game/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GameSettings } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const settings: GameSettings = await request.json();

    // Validar configuración
    if (!settings.mode || !settings.playerColor) {
      return NextResponse.json(
        { error: 'Configuración incompleta' },
        { status: 400 }
      );
    }

    // Crear ID único para la partida
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Aquí se guardaría en una base de datos en producción
    // Por ahora, solo devolvemos el ID y configuración

    return NextResponse.json({
      gameId,
      settings,
      message: 'Partida creada exitosamente'
    });

  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
