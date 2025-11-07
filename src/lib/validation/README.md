# Input Validation Module

This module implements comprehensive input validation for user interactions with the chess board, fulfilling Requirement 9 from the design specification.

## Overview

The `InputValidator` class provides static methods to validate all user inputs and ensure game integrity by preventing invalid moves and actions.

## Features

### 1. Piece Ownership Validation (Requirement 9.1)
Validates that players can only move their own pieces.

```typescript
InputValidator.validatePieceOwnership(piece, currentTurn)
```

### 2. Move Legality Validation (Requirement 9.2)
Verifies that moves are in the list of legal moves provided by the chess engine.

```typescript
InputValidator.validateMove(from, to, legalMoves)
```

### 3. Promotion Detection (Requirement 9.3)
Detects when a pawn reaches the last rank and requires promotion.

```typescript
InputValidator.isPromotionMove(from, to, piece)
```

### 4. Player Turn Validation (Requirement 9.4)
In AI mode, ensures it's the human player's turn before allowing interaction.

```typescript
InputValidator.validatePlayerTurn(gameMode, currentTurn, playerColor)
```

### 5. Game State Validation
Prevents moves when the game is not in a playable state (finished, paused, etc.).

```typescript
InputValidator.validateGameState(gameStatus, isGameOver)
```

## Integration with Board Component

The Board component uses these validators to:

1. **Prevent selecting opponent's pieces**: Shows red flash feedback
2. **Disable interaction during AI turn**: Cursor changes to not-allowed, reduced opacity
3. **Show promotion modal**: When pawn reaches last rank
4. **Provide visual feedback**: Invalid actions trigger temporary red highlighting

## Visual Feedback

- **Invalid action**: Red flash on the square (500ms)
- **AI turn**: Reduced opacity (70%), cursor not-allowed
- **Selected piece**: Yellow/gold highlight
- **Legal moves**: Semi-transparent circles on empty squares, rings on capture squares
- **Last move**: Light green highlight
- **King in check**: Red pulsating animation

## Testing

Comprehensive unit tests cover all validation scenarios:
- Piece ownership validation
- Move legality checking
- Promotion detection for both colors
- Turn validation in PvP and AI modes
- Game state validation

Run tests with:
```bash
npx vitest run src/__tests__/input-validator.test.ts
```

## Usage Example

```typescript
import { InputValidator } from '@/lib/validation';

// Check if player can select a piece
if (!InputValidator.validatePieceOwnership(piece, gameState.turn)) {
  showInvalidFeedback();
  return;
}

// Check if it's player's turn in AI mode
if (!InputValidator.validatePlayerTurn(gameMode, currentTurn, playerColor)) {
  return; // Silently ignore during AI turn
}

// Check if move is legal
if (!InputValidator.validateMove(from, to, legalMoves)) {
  showInvalidFeedback();
  return;
}

// Check if promotion is needed
if (InputValidator.isPromotionMove(from, to, piece)) {
  showPromotionModal();
  return;
}
```

## Related Components

- **Board.tsx**: Main integration point for all validations
- **PromotionModal.tsx**: Shown when promotion is detected
- **useChessGame.ts**: Provides game state for validation

## Requirements Fulfilled

- ✅ Requirement 9.1: Validate piece ownership
- ✅ Requirement 9.2: Validate move legality
- ✅ Requirement 9.3: Implement promotion modal
- ✅ Requirement 9.4: Disable interaction during AI turn
- ✅ Requirement 9.5: Undo functionality (handled by GameStateManager)
