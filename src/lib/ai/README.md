# AI System - Stockfish WebAssembly

## Overview

The AI system uses Stockfish 17.1 WebAssembly, the world's strongest chess engine, providing 5 difficulty levels from beginner (ELO 500) to expert (ELO 3500+).

## Quick Start

### Using the API Route (Recommended for Frontend)

```typescript
const response = await fetch('/api/ai/move', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    difficulty: 'medio',
    gamePhase: 'opening',
    moveHistory: [],
    legalMoves: ['e2e4', 'd2d4', 'g1f3', 'b1c3'],
  })
});

const data = await response.json();
console.log(data.move); // e.g., "e2e4"
console.log(data.confidence); // 0-1
console.log(data.evaluation); // Position evaluation in pawns
```

### Using AIService Directly

```typescript
import { AIService } from '@/lib/ai';

const aiService = new AIService();

const response = await aiService.requestMoveWithRetry({
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  difficulty: 'dificil',
  gamePhase: 'middlegame',
  moveHistory: ['e2e4', 'e7e5'],
  legalMoves: ['g1f3', 'f1c4', 'd2d4'],
}, 3); // max 3 retries

console.log(response.move);
console.log(response.thinkTime); // milliseconds
```

## Difficulty Levels

### Fácil (Easy) - ELO ~600
- **Skill Level**: 20 ⚡ (máximo)
- **UCI_Elo**: 600 (limitado)
- **Depth**: 1
- **Think time**: 0.5 seconds
- **Strategy**: Muy débil - comete muchos errores
- **Best for**: Cualquier jugador puede ganar
- **Note**: Skill máximo pero limitado a ELO 600

### Medio (Medium) - ELO ~1000
- **Skill Level**: 20 ⚡ (máximo)
- **UCI_Elo**: 1000 (limitado)
- **Depth**: 3
- **Think time**: 1.5 seconds
- **Strategy**: Nivel adquisible - táctica básica
- **Best for**: Principiantes (ELO 800-1200)
- **Note**: Skill máximo pero limitado a ELO 1000

### Difícil (Hard) - ELO ~1800
- **Skill Level**: 20 ⚡ (máximo)
- **UCI_Elo**: 1800 (limitado)
- **Depth**: 15
- **Think time**: 5 seconds
- **Strategy**: Jugador intermedio fuerte
- **Best for**: Jugadores con experiencia (ELO 1400-2000)
- **Note**: Skill máximo pero limitado a ELO 1800

### Clase Mundial (World Class) - ELO ~2600
- **Skill Level**: 20 ⚡ (máximo)
- **UCI_Elo**: 2600 (limitado)
- **Depth**: 25
- **Think time**: 10 seconds
- **Strategy**: Maestro Internacional - análisis profundo
- **Best for**: Jugadores avanzados (ELO 2000+)
- **Note**: Skill máximo pero limitado a ELO 2600

### Experto (Expert) - ELO ~3500+ (MÁXIMA FUERZA ABSOLUTA)
- **Skill Level**: 20 ⚡ (máximo)
- **UCI_LimitStrength**: FALSE ⚡ (SIN límites de ELO)
- **Depth**: 40 (análisis extremadamente profundo)
- **Threads**: 4
- **Hash**: 1024 MB
- **Contempt**: 50 (máxima agresividad)
- **Think time**: 20 seconds
- **Strategy**: MÁXIMA FUERZA - Nivel sobrehumano absoluto
- **Best for**: Desafío imposible - más fuerte que Magnus Carlsen
- **Note**: Stockfish a máxima potencia SIN NINGUNA restricción

## How It Works

### Stockfish Configuration

Each difficulty level configures Stockfish with specific parameters:

```typescript
// Example: Difícil (Hard) difficulty - ELO 2000
// IMPORTANTE: NO usar Skill Level con UCI_LimitStrength
stockfish.postMessage('setoption name Threads value 2');
stockfish.postMessage('setoption name Hash value 128');
stockfish.postMessage('setoption name UCI_LimitStrength value true');
stockfish.postMessage('setoption name UCI_Elo value 2000');
stockfish.postMessage('setoption name MultiPV value 1');
stockfish.postMessage('setoption name Contempt value 24');
stockfish.postMessage('position fen <fen>');
stockfish.postMessage('go depth 12');
```

### UCI Protocol

The system communicates with Stockfish using the Universal Chess Interface (UCI) protocol:

1. Initialize: `uci` → `uciok`
2. Configure: `setoption name X value Y`
3. Set position: `position fen <fen_string>`
4. Calculate: `go depth <depth>`
5. Receive: `bestmove <move>`

## Architecture

```
React Component
    ↓
useChessAI Hook
    ↓
API Route (/api/ai/move)
    ↓
AIService
    ↓
Stockfish Worker (WebAssembly)
    ↓
Best Move
```

## Error Handling

The system automatically handles errors with retries:

```typescript
try {
  const response = await aiService.requestMoveWithRetry(request, 3);
  
  if (response.isFallback) {
    // Stockfish failed, random legal move was used
    console.warn('Fallback used:', response.reasoning);
  }
  
} catch (error) {
  if (error instanceof AIServiceError) {
    console.error('AI Error:', error.code, error.message);
  }
}
```

## Response Format

### Success Response
```typescript
{
  move: string;           // UCI format: "e2e4"
  confidence: number;     // 0-1 based on difficulty
  evaluation: number;     // Position evaluation in pawns
  reasoning: string;      // Stockfish configuration info
  model: string;          // "stockfish-skill-X"
  thinkTime: number;      // Milliseconds
  isFallback?: boolean;   // True if fallback used
}
```

### Error Response
```typescript
{
  error: string;
  message: string;
  code?: string;
  retryable?: boolean;
}
```

## Best Practices

### 1. Always Provide Legal Moves
```typescript
// Good
legalMoves: chess.moves({ verbose: true }).map(m => m.lan)

// Bad
legalMoves: []  // Will use fallback
```

### 2. Clean Up Resources
```typescript
// When component unmounts
useEffect(() => {
  return () => {
    aiService.cleanup();
  };
}, []);
```

### 3. Handle Timeouts
```typescript
// Set appropriate think time
const response = await aiService.requestMove({
  ...request,
  thinkTime: 5000 // 5 seconds
});
```

## Advantages of Stockfish WebAssembly

✅ **No Backend Required**: Runs entirely in the browser
✅ **Privacy**: No data sent to external servers
✅ **Performance**: Near-native speed with WebAssembly
✅ **Offline**: Works without internet connection
✅ **Free**: No API costs or usage limits
✅ **Strongest**: ELO 3500+ at maximum strength
✅ **Adjustable**: Easy to configure difficulty levels

## Troubleshooting

### "Stockfish not initialized"
- Check that stockfish.js is in the public folder
- Verify the Worker is loading correctly
- Check browser console for errors

### "Timeout errors"
- Increase thinkTime parameter
- Lower the depth for faster responses
- Check if browser supports WebAssembly

### "Invalid move returned"
- Ensure FEN is valid
- Verify legalMoves array is correct
- Check Stockfish initialization

## Performance Tips

1. **Reuse AIService instance**: Don't create new instances for each move
2. **Adjust depth**: Lower depth = faster responses
3. **Use Web Workers**: Stockfish runs in a separate thread
4. **Clean up**: Call `cleanup()` when done
5. **Monitor think time**: Adjust based on user experience

## Testing

Run tests:
```bash
npm test
```

## Files

- `ai-service.ts`: Main AI service with Stockfish integration
- `difficulty-config.ts`: Difficulty level configurations
- `README.md`: This file

## No API Keys Required

Unlike cloud-based AI services, Stockfish WebAssembly requires no API keys, accounts, or external services. Everything runs locally in the user's browser.

---

**Powered by Stockfish 17.1 WebAssembly** ♟️
