# Design Document

## Overview

Este documento describe el diseño de la solución para corregir el problema de selección de nivel de dificultad de la IA. El problema radica en que el nivel de dificultad seleccionado por el usuario no se está aplicando correctamente, resultando en que la IA siempre juega con el nivel intermedio.

### Root Cause Analysis

Después de analizar el código, se identificaron las siguientes áreas problemáticas:

1. **PromptBuilder.buildPrompt()**: El switch statement que selecciona el prompt correcto según el nivel de dificultad está funcionando, pero los logs de debugging muestran que siempre se está recibiendo 'medio' como nivel.

2. **Flujo de datos**: El nivel de dificultad se pasa correctamente desde:
   - Lobby → URL params → Game page → useChessAI hook → API endpoint → AIService → PromptBuilder
   
3. **Posible causa**: El problema puede estar en:
   - La configuración del juego no se está guardando correctamente
   - El nivel de dificultad se está sobrescribiendo en algún punto
   - Hay un valor por defecto que se está aplicando incorrectamente

## Architecture

### Component Interaction Flow

```
┌─────────────┐
│   Lobby     │ Selecciona nivel: 'dificil'
│   Page      │
└──────┬──────┘
       │ URL params: ?difficulty=dificil
       ▼
┌─────────────┐
│   Game      │ Lee params y crea GameSettings
│   Page      │ { difficulty: 'dificil' }
└──────┬──────┘
       │ createGame(settings)
       ▼
┌─────────────┐
│ useChessGame│ Almacena settings en game.settings
│   Hook      │
└──────┬──────┘
       │ game.settings.difficulty
       ▼
┌─────────────┐
│ useChessAI  │ requestAIMove(fen, difficulty, ...)
│   Hook      │
└──────┬──────┘
       │ POST /api/ai/move { difficulty: 'dificil' }
       ▼
┌─────────────┐
│  AI API     │ Valida y pasa a AIService
│  Endpoint   │
└──────┬──────┘
       │ aiService.requestMoveWithRetry(request)
       ▼
┌─────────────┐
│ AIService   │ PromptBuilder.buildPrompt(request)
│             │
└──────┬──────┘
       │ { difficulty: 'dificil', fen, ... }
       ▼
┌─────────────┐
│PromptBuilder│ switch(difficulty) → buildAdvancedPrompt()
│             │
└─────────────┘
```

### Key Issues to Address

1. **Logging Enhancement**: Agregar logs en cada punto de transferencia del nivel de dificultad
2. **Validation**: Validar el nivel de dificultad en cada etapa
3. **Default Value Handling**: Asegurar que el valor por defecto solo se use cuando realmente falta el nivel
4. **Visual Feedback**: Mostrar el nivel activo en la UI

## Components and Interfaces

### 1. Enhanced Logging System

**Location**: Todos los componentes del flujo

**Purpose**: Rastrear el nivel de dificultad a través de todo el sistema

**Implementation**:
```typescript
// Formato estándar de log
console.log('[DIFFICULTY_TRACKING] Component: value', { difficulty, context });
```

**Log Points**:
- Lobby: Al seleccionar nivel
- Game Page: Al leer params de URL
- Game Page: Al crear GameSettings
- useChessGame: Al almacenar settings
- useChessAI: Al solicitar movimiento
- API Endpoint: Al recibir request
- AIService: Al procesar request
- PromptBuilder: Al construir prompt

### 2. Difficulty Validation Utility

**Location**: `src/lib/validation/difficulty-validator.ts` (nuevo archivo)

**Purpose**: Validar y normalizar valores de dificultad

**Interface**:
```typescript
export class DifficultyValidator {
  /**
   * Valida que un valor es un nivel de dificultad válido
   */
  static isValid(value: unknown): value is DifficultyLevel;
  
  /**
   * Normaliza un valor a DifficultyLevel o retorna default
   */
  static normalize(value: unknown, defaultValue: DifficultyLevel = 'medio'): DifficultyLevel;
  
  /**
   * Obtiene el nombre legible del nivel
   */
  static getDisplayName(level: DifficultyLevel): string;
  
  /**
   * Obtiene el rango ELO del nivel
   */
  static getEloRange(level: DifficultyLevel): { min: number; max: number };
}
```

### 3. Enhanced Game Settings

**Location**: `src/app/game/[id]/page.tsx`

**Changes**:
- Agregar logs al leer params de URL
- Validar difficulty antes de crear settings
- Mostrar warning si difficulty es inválido

**Implementation**:
```typescript
useEffect(() => {
  const difficulty = searchParams.get('difficulty') as DifficultyLevel;
  
  console.log('[DIFFICULTY_TRACKING] Game Page - URL params:', { 
    difficulty, 
    allParams: Object.fromEntries(searchParams.entries()) 
  });
  
  if (mode === 'ai') {
    if (!DifficultyValidator.isValid(difficulty)) {
      console.warn('[DIFFICULTY_TRACKING] Invalid difficulty in URL:', difficulty);
    }
    settings.difficulty = DifficultyValidator.normalize(difficulty);
  }
  
  console.log('[DIFFICULTY_TRACKING] Game Page - Final settings:', settings);
}, [searchParams]);
```

### 4. Enhanced useChessAI Hook

**Location**: `src/hooks/useChessAI.ts`

**Changes**:
- Agregar log al solicitar movimiento
- Validar difficulty antes de enviar request
- Incluir difficulty en response para verificación

**Implementation**:
```typescript
const requestAIMove = async (
  fen: string,
  difficulty: DifficultyLevel,
  history: string[] = [],
  legalMoves: string[] = []
): Promise<AIMoveResponse> => {
  console.log('[DIFFICULTY_TRACKING] useChessAI - Requesting move:', { 
    difficulty,
    isValid: DifficultyValidator.isValid(difficulty)
  });
  
  const validDifficulty = DifficultyValidator.normalize(difficulty);
  
  if (validDifficulty !== difficulty) {
    console.warn('[DIFFICULTY_TRACKING] Difficulty normalized:', {
      original: difficulty,
      normalized: validDifficulty
    });
  }
  
  // ... rest of implementation
};
```

### 5. Enhanced AI API Endpoint

**Location**: `src/app/api/ai/move/route.ts`

**Changes**:
- Agregar log al recibir request
- Validar difficulty
- Incluir difficulty en response

**Implementation**:
```typescript
export async function POST(request: NextRequest) {
  const body: AIMoveRequest = await request.json();
  
  console.log('[DIFFICULTY_TRACKING] API Endpoint - Received request:', {
    difficulty: body.difficulty,
    isValid: DifficultyValidator.isValid(body.difficulty)
  });
  
  // Validate and normalize
  body.difficulty = DifficultyValidator.normalize(body.difficulty);
  
  const response = await aiService.requestMoveWithRetry(body);
  
  // Include difficulty in response for verification
  return NextResponse.json({
    ...response,
    requestedDifficulty: body.difficulty
  });
}
```

### 6. Enhanced AIService

**Location**: `src/lib/ai/ai-service.ts`

**Changes**:
- Agregar log al procesar request
- Incluir difficulty en response

**Implementation**:
```typescript
async requestMove(request: AIMoveRequest): Promise<AIMoveResponse> {
  console.log('[DIFFICULTY_TRACKING] AIService - Processing request:', {
    difficulty: request.difficulty,
    gamePhase: request.gamePhase
  });
  
  const prompt = PromptBuilder.buildPrompt(request);
  
  // ... rest of implementation
  
  return {
    move,
    confidence,
    reasoning,
    model,
    thinkTime,
    difficulty: request.difficulty // Include in response
  };
}
```

### 7. Enhanced PromptBuilder

**Location**: `src/lib/ai/prompt-builder.ts`

**Changes**:
- Mejorar logs existentes
- Agregar validación antes del switch
- Agregar log después del switch para confirmar

**Implementation**:
```typescript
static buildPrompt(request: PromptRequest): string {
  const { difficulty, fen, gamePhase, moveHistory, legalMoves } = request;
  
  console.log('[DIFFICULTY_TRACKING] PromptBuilder - Building prompt:', {
    difficulty,
    gamePhase,
    isValidDifficulty: DifficultyValidator.isValid(difficulty)
  });
  
  let promptType: string;
  let prompt: string;
  
  switch (difficulty) {
    case 'facil':
      promptType = 'FÁCIL (ELO 500)';
      prompt = this.buildEasyPrompt(fen, legalMoves);
      break;
    case 'medio':
      promptType = 'MEDIO (ELO 1000)';
      prompt = this.buildMediumPrompt(fen, legalMoves, gamePhase);
      break;
    case 'dificil':
      promptType = 'DIFÍCIL (ELO 2000)';
      prompt = this.buildAdvancedPrompt(fen, legalMoves, gamePhase, moveHistory);
      break;
    case 'claseMundial':
      promptType = 'CLASE MUNDIAL (ELO 3000)';
      prompt = this.buildWorldClassPrompt(fen, legalMoves, gamePhase, moveHistory);
      break;
    case 'experto':
      promptType = 'EXPERTO (ELO 3200)';
      prompt = this.buildSuperGMPrompt(fen, legalMoves, gamePhase, moveHistory);
      break;
    default:
      console.error('[DIFFICULTY_TRACKING] Unknown difficulty, using MEDIO:', difficulty);
      promptType = 'MEDIO (ELO 1000) - DEFAULT';
      prompt = this.buildMediumPrompt(fen, legalMoves, gamePhase);
  }
  
  console.log('[DIFFICULTY_TRACKING] PromptBuilder - Prompt built:', {
    difficulty,
    promptType,
    promptLength: prompt.length
  });
  
  return prompt;
}
```

### 8. Visual Feedback Component

**Location**: `src/app/game/[id]/page.tsx`

**Changes**: Mejorar el panel de información de IA

**Implementation**:
```typescript
{game.settings.mode === 'ai' && (
  <div className="card rounded-lg shadow-md p-4">
    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
      Información IA
    </h3>
    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
      <div className="flex items-center justify-between">
        <span>• Nivel:</span>
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {DifficultyValidator.getDisplayName(game.settings.difficulty || 'medio')}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span>• ELO:</span>
        <span className="font-mono">
          {DifficultyValidator.getEloRange(game.settings.difficulty || 'medio').min}-
          {DifficultyValidator.getEloRange(game.settings.difficulty || 'medio').max}
        </span>
      </div>
      <div>• Estado: {isThinking ? 'Pensando...' : 'Esperando'}</div>
      {aiError && (
        <div className="text-red-600 dark:text-red-400">Error: {aiError}</div>
      )}
    </div>
  </div>
)}
```

## Data Models

### Enhanced AIMoveResponse

```typescript
export interface AIMoveResponse {
  move: string;
  confidence: number;
  evaluation?: number;
  reasoning?: string;
  model: string;
  thinkTime: number;
  isFallback?: boolean;
  difficulty?: DifficultyLevel; // Added for verification
  requestedDifficulty?: DifficultyLevel; // Added for verification
}
```

### DifficultyLevel Type

```typescript
// Already exists, no changes needed
export type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'claseMundial' | 'experto';
```

## Error Handling

### Validation Errors

**Scenario**: Invalid difficulty value received

**Handling**:
1. Log warning with original value
2. Normalize to default ('medio')
3. Continue execution
4. Show warning in UI if in development mode

### Missing Difficulty

**Scenario**: Difficulty not provided in request

**Handling**:
1. Log warning
2. Use 'medio' as default
3. Continue execution

### Type Mismatches

**Scenario**: Difficulty is wrong type (number, object, etc.)

**Handling**:
1. Log error with type information
2. Normalize to default
3. Continue execution

## Testing Strategy

### Unit Tests

**File**: `src/lib/validation/__tests__/difficulty-validator.test.ts`

**Tests**:
- `isValid()` returns true for valid levels
- `isValid()` returns false for invalid values
- `normalize()` returns valid level unchanged
- `normalize()` returns default for invalid values
- `getDisplayName()` returns correct Spanish names
- `getEloRange()` returns correct ranges

### Integration Tests

**File**: `src/__tests__/ai-difficulty-flow.test.ts`

**Tests**:
- Difficulty flows correctly from lobby to game page
- Difficulty is preserved in URL params
- Difficulty is used in AI requests
- Correct prompt is built for each difficulty
- Response includes difficulty for verification

### Manual Testing Checklist

1. **Lobby Configuration**:
   - [ ] Select 'facil' → Verify logs show 'facil'
   - [ ] Select 'medio' → Verify logs show 'medio'
   - [ ] Select 'dificil' → Verify logs show 'dificil'
   - [ ] Select 'claseMundial' → Verify logs show 'claseMundial'
   - [ ] Select 'experto' → Verify logs show 'experto'

2. **Game Page**:
   - [ ] URL contains correct difficulty param
   - [ ] Game settings show correct difficulty
   - [ ] UI displays correct difficulty name and ELO

3. **AI Behavior**:
   - [ ] 'facil' makes simple moves with errors
   - [ ] 'medio' makes decent moves with basic tactics
   - [ ] 'dificil' makes strong moves with advanced tactics
   - [ ] 'claseMundial' makes very strong moves
   - [ ] 'experto' makes near-perfect moves

4. **Console Logs**:
   - [ ] All [DIFFICULTY_TRACKING] logs show correct value
   - [ ] No warnings about invalid difficulty
   - [ ] PromptBuilder confirms correct prompt type

## Implementation Plan

### Phase 1: Add Logging (High Priority)
- Add DifficultyValidator utility
- Add logs to all components in the flow
- Test and verify logs show correct values

### Phase 2: Fix Root Cause (High Priority)
- Identify where difficulty is being lost/changed
- Fix the issue
- Verify with logs

### Phase 3: Add Validation (Medium Priority)
- Add validation at each step
- Handle edge cases
- Add error handling

### Phase 4: Enhance UI (Low Priority)
- Improve visual feedback
- Add ELO display
- Add difficulty confirmation

### Phase 5: Testing (Medium Priority)
- Write unit tests
- Write integration tests
- Perform manual testing

## Success Criteria

1. **Functional**: Each difficulty level produces distinctly different AI behavior
2. **Traceable**: Logs clearly show difficulty value at each step
3. **Validated**: Invalid values are caught and handled gracefully
4. **Visible**: UI clearly shows active difficulty level
5. **Tested**: All tests pass and manual testing confirms correct behavior
