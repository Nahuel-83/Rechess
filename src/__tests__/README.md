# Test Directory

This directory contains all tests for the Rechess application.

## Structure

```
src/__tests__/
├── setup.ts                    # Test setup and configuration
├── test-utils.ts              # Shared test utilities and helpers
├── integration/               # Integration tests
│   └── (integration test files)
├── chess-engine.test.ts       # ChessEngine unit tests
├── game-state-manager.test.ts # GameStateManager unit tests
├── ai-service.test.ts         # AIService unit tests
├── prompt-builder.test.ts     # PromptBuilder unit tests
└── input-validator.test.ts    # InputValidator unit tests
```

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Types

### Unit Tests
Located in the root of `__tests__/`, these test individual modules in isolation:
- **chess-engine.test.ts**: Tests for ChessEngine wrapper around chess.js
- **game-state-manager.test.ts**: Tests for game state management logic
- **ai-service.test.ts**: Tests for AI service and error handling
- **prompt-builder.test.ts**: Tests for AI prompt generation
- **input-validator.test.ts**: Tests for user input validation

### Integration Tests
Located in `__tests__/integration/`, these test multiple modules working together:
- Full game flow tests (PvP and PvE)
- ChessEngine + GameStateManager integration
- AIService + API routes integration

## Test Utilities

The `test-utils.ts` file provides shared utilities:

### Chess Utilities
- `createChessInstance(fen?)`: Create a Chess instance with optional FEN
- `TEST_POSITIONS`: Common test positions (checkmate, stalemate, etc.)
- `isValidUCIMove(move)`: Validate UCI move format
- `sanToUci(chess, san)`: Convert SAN to UCI format
- `getLegalMovesUCI(chess)`: Get all legal moves in UCI format
- `countPieces(chess)`: Count pieces on the board
- `playMoves(chess, moves)`: Simulate a sequence of moves

### Mock Utilities
- `createMockAIResponse(move, options)`: Create mock AI responses
- `getRandomLegalMove(chess)`: Get a random legal move

### Async Utilities
- `wait(ms)`: Wait for specified milliseconds

## Writing Tests

### Example Unit Test

```typescript
import { describe, it, expect } from 'vitest';
import { ChessEngine } from '@/lib/chess/chess-engine';
import { TEST_POSITIONS } from '../test-utils';

describe('ChessEngine', () => {
  it('should detect checkmate', () => {
    const engine = new ChessEngine(TEST_POSITIONS.SCHOLARS_MATE);
    expect(engine.isCheckmate()).toBe(true);
  });
});
```

### Example Integration Test

```typescript
import { describe, it, expect } from 'vitest';
import { GameStateManager } from '@/lib/game/game-state-manager';
import { playMoves } from '../test-utils';

describe('Game Flow Integration', () => {
  it('should complete a full game', async () => {
    const manager = new GameStateManager();
    // Test implementation...
  });
});
```

## Coverage Goals

The project aims for the following coverage thresholds:
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

Coverage reports are generated in the `coverage/` directory after running `npm run test:coverage`.

## Best Practices

1. **Focus on Core Logic**: Test business logic, not implementation details
2. **Use Test Utilities**: Leverage shared utilities for common operations
3. **Descriptive Names**: Use clear, descriptive test names
4. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
5. **Minimal Mocking**: Test real functionality when possible
6. **Fast Tests**: Keep tests fast by avoiding unnecessary delays
7. **Independent Tests**: Each test should be independent and not rely on others
