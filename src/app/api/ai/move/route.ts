// src/app/api/ai/move/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/ai-service';
import type { AIMoveRequest } from '@/lib/ai/ai-service';
import { DifficultyValidator } from '@/lib/validation/difficulty-validator';

export async function POST(request: NextRequest) {
  try {
    const body: AIMoveRequest = await request.json();

    console.log('[DIFFICULTY_TRACKING] AI API Endpoint - Request received:', {
      difficulty: body.difficulty,
      difficultyType: typeof body.difficulty,
      hasDifficulty: !!body.difficulty,
      gamePhase: body.gamePhase,
      legalMovesCount: body.legalMoves?.length,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!body.fen || !body.legalMoves) {
      console.warn('[DIFFICULTY_TRACKING] AI API Endpoint - Missing required fields:', {
        hasFen: !!body.fen,
        hasDifficulty: !!body.difficulty,
        hasLegalMoves: !!body.legalMoves,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { error: 'Missing required fields: fen, legalMoves' },
        { status: 400 }
      );
    }

    // Check if difficulty is missing
    if (!body.difficulty) {
      console.error('[DIFFICULTY_TRACKING] AI API Endpoint - Difficulty is missing:', {
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { error: 'Missing required field: difficulty' },
        { status: 400 }
      );
    }

    // Validate difficulty from request body
    const isValidDifficulty = DifficultyValidator.isValid(body.difficulty);
    
    if (!isValidDifficulty) {
      console.warn('[DIFFICULTY_TRACKING] AI API Endpoint - Invalid difficulty in request:', {
        receivedDifficulty: body.difficulty,
        difficultyType: typeof body.difficulty,
        timestamp: new Date().toISOString()
      });
    }
    
    // Normalize difficulty (will use 'medio' as default if invalid)
    const validatedDifficulty = DifficultyValidator.normalize(body.difficulty);
    
    if (validatedDifficulty !== body.difficulty) {
      console.warn('[DIFFICULTY_TRACKING] AI API Endpoint - Difficulty normalized:', {
        original: body.difficulty,
        normalized: validatedDifficulty,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update body with validated difficulty
    body.difficulty = validatedDifficulty;

    // Initialize AI service (Stockfish)
    const aiService = new AIService();

    console.log('[STOCKFISH] AI API Endpoint - Calling AIService with difficulty:', {
      difficulty: body.difficulty,
      timestamp: new Date().toISOString()
    });

    // Request move with retry logic
    const response = await aiService.requestMoveWithRetry(body);

    console.log('[DIFFICULTY_TRACKING] AI API Endpoint - Response received:', {
      move: response.move,
      model: response.model,
      isFallback: response.isFallback,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('AI move request failed:', error);

    return NextResponse.json(
      { 
        error: 'Failed to get AI move',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
