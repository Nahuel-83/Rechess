# Documento de Diseño - Mejoras Estructurales de Rechess

## Overview

Este documento describe el diseño técnico para transformar Rechess en una plataforma profesional de ajedrez. El diseño se centra en aprovechar chess.js como motor base (que ya implementa todas las reglas oficiales), mejorar significativamente el sistema de IA con prompts diferenciados por nivel, crear una arquitectura modular y testeable, y proporcionar una experiencia de usuario excepcional.

### Mapeo de Requisitos a Diseño

Este diseño aborda todos los requisitos especificados en el documento de requisitos:

- **Requisito 1 (Reglas Oficiales)**: ChessEngine wrapper expone toda la funcionalidad de chess.js
- **Requisito 2 (Detección de Finales)**: GameStateManager implementa checkGameEnd() con todos los tipos de finalización
- **Requisito 3 (IA Diferenciada)**: PromptBuilder con métodos separados para cada nivel de dificultad
- **Requisito 4 (Manejo de Errores)**: AIService con estrategia de reintentos y múltiples niveles de fallback
- **Requisito 5 (Testing)**: Suite completa de tests unitarios, integración y E2E
- **Requisito 6 (Arquitectura Modular)**: Separación clara entre ChessEngine, AIService, GameStateManager y UI
- **Requisito 7 (UI Intuitiva)**: Componentes Board, GameInfo con indicadores visuales claros
- **Requisito 8 (Feedback)**: Componentes MoveHistory, AIThinkingIndicator, CapturedPieces, exportación PGN
- **Requisito 9 (Validación)**: InputValidator con validación en múltiples capas
- **Requisito 10 (Configuración)**: GameSetup component con todas las opciones de configuración

### Principios de Diseño

1. **Separación de Responsabilidades** (Requisito 6): Motor de ajedrez, lógica de IA, gestión de estado y UI completamente desacoplados
2. **Aprovechamiento de chess.js** (Requisito 1): Utilizar la librería existente que ya implementa todas las reglas oficiales correctamente
3. **IA Diferenciada** (Requisito 3): Cada nivel de dificultad debe tener prompts únicos y comportamiento distintivo
4. **Testabilidad** (Requisito 5): Toda la lógica de negocio debe ser testeable sin dependencias de UI
5. **Extensibilidad** (Requisito 6): Facilitar la adición de nuevas características sin modificar código existente
6. **Robustez** (Requisito 4): Manejo de errores en múltiples niveles con fallbacks apropiados

## Architecture

### Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Board.tsx  │  │ GameInfo.tsx │  │ MoveHistory  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼──────────────┐
│         │      Hooks Layer (React)            │              │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌───────▼──────┐      │
│  │useChessGame  │  │ useChessAI   │  │useGameTimer  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
└─────────┼──────────────────┼──────────────────────────────────┘
          │                  │
┌─────────┼──────────────────┼──────────────────────────────────┐
│         │    Business Logic Layer                             │
│  ┌──────▼──────────┐  ┌───▼──────────────┐                   │
│  │ GameStateManager│  │   AIService      │                   │
│  └──────┬──────────┘  └───┬──────────────┘                   │
│         │                  │                                  │
│  ┌──────▼──────────┐  ┌───▼──────────────┐                   │
│  │  ChessEngine    │  │  PromptBuilder   │                   │
│  │  (chess.js)     │  │  DifficultyConfig│                   │
│  └─────────────────┘  └──────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```


### Flujo de Datos

```
Usuario → UI Component → Hook → Business Logic → chess.js
                                      ↓
                                 AIService → API Route → Gemini/Ollama
```

## Components and Interfaces

### 1. ChessEngine (Wrapper de chess.js)

**Responsabilidad**: Encapsular chess.js y proporcionar una interfaz consistente para el resto de la aplicación.

**Nota Importante**: chess.js ya implementa TODAS las reglas oficiales del ajedrez correctamente, incluyendo:
- Movimientos de todas las piezas según reglas oficiales
- Enroque (con todas las validaciones: rey y torre no movidos, sin piezas intermedias, rey no en jaque, rey no pasa por casilla atacada)
- Captura al paso (en passant)
- Promoción de peones (con selección de pieza)
- Detección de jaque, jaque mate, ahogado
- Tablas por repetición triple
- Tablas por regla de 50 movimientos
- Detección de material insuficiente
- Validación de que movimientos no dejen al propio rey en jaque

Por lo tanto, NO necesitamos reimplementar estas reglas. Solo necesitamos usar chess.js correctamente y exponer su funcionalidad completa a través de nuestro wrapper.

**Decisión de Diseño**: Aprovechar chess.js como motor base garantiza que todas las reglas oficiales estén implementadas correctamente desde el inicio, permitiéndonos enfocarnos en la experiencia de usuario y la IA diferenciada.

**Interfaz**:
```typescript
class ChessEngine {
  constructor(fen?: string)
  
  // Estado del juego
  getGameState(): GameState
  getFen(): string
  getPgn(): string
  
  // Movimientos
  makeMove(from: Square, to: Square, promotion?: PieceType): boolean
  getLegalMoves(square?: Square): Move[]
  undoMove(): boolean
  
  // Validaciones (delegadas a chess.js)
  isCheck(): boolean
  isCheckmate(): boolean
  isStalemate(): boolean
  isDraw(): boolean
  isThreefoldRepetition(): boolean
  isInsufficientMaterial(): boolean
  
  // Utilidades
  getPiece(square: Square): ChessPiece | null
  loadFen(fen: string): boolean
  reset(): void
}
```

**Mejoras Necesarias**:
- Exponer métodos de chess.js para detectar tablas por repetición (isThreefoldRepetition)
- Exponer método de chess.js para verificar material insuficiente (isInsufficientMaterial)
- Mejorar el mapeo de tipos entre chess.js y nuestros tipos personalizados
- Asegurar que todos los métodos de validación estén accesibles para cumplir con Requisito 1 y 2

**Rationale**: El wrapper debe exponer toda la funcionalidad de validación de chess.js para que el resto de la aplicación pueda verificar condiciones de finalización y reglas especiales sin acceder directamente a chess.js.


### 2. AIService (Servicio de IA Mejorado)

**Responsabilidad**: Coordinar las llamadas a la API de IA con prompts diferenciados por nivel y manejar errores robustamente.

**Interfaz**:
```typescript
class AIService {
  // Solicitar movimiento de IA
  async requestMove(request: AIMoveRequest): Promise<AIMoveResponse>
  
  // Validar movimiento recibido
  validateAIMove(move: string, legalMoves: string[]): boolean
  
  // Reintentar con fallback
  async requestMoveWithRetry(
    request: AIMoveRequest, 
    maxRetries: number
  ): Promise<AIMoveResponse>
  
  // Parsear respuesta de IA
  parseAIResponse(response: string): string | null
}

interface AIMoveRequest {
  fen: string
  difficulty: DifficultyLevel
  gamePhase: 'opening' | 'middlegame' | 'endgame'
  moveHistory: string[]
  legalMoves: string[]
  thinkTime?: number
}

interface AIMoveResponse {
  move: string              // Movimiento en notación estándar (e.g., "e2e4")
  confidence: number        // 0-1
  evaluation?: number       // Evaluación de la posición
  reasoning?: string        // Solo para debugging
  model: string            // Modelo usado
  thinkTime: number        // Tiempo real de cálculo
}
```

**Estrategia de Manejo de Errores** (cumple Requisito 4):
1. **Timeout**: Si la API no responde en `thinkTime * 1.5`, reintentar hasta 3 veces
2. **Movimiento Inválido**: Si la IA devuelve un movimiento ilegal, solicitar un nuevo movimiento de la lista de movimientos legales
3. **Formato Incorrecto**: Parsear la respuesta buscando patrones de movimiento válidos (notación UCI)
4. **Pérdida de Conexión**: Preservar el estado del juego y permitir reanudar cuando se restablezca la conexión
5. **Fallo Total**: Después de 3 intentos, notificar al usuario del error y ofrecer opciones (cambiar a modo PvP, reintentar, o guardar partida)
6. **Fallback**: Como último recurso, seleccionar un movimiento aleatorio de los legales solo si el usuario lo autoriza

**Rationale**: El manejo robusto de errores es crítico para la experiencia de usuario. La estrategia de reintentos con backoff exponencial y múltiples niveles de fallback asegura que el juego no se interrumpa por problemas técnicos temporales.


### 3. PromptBuilder Mejorado (Prompts Diferenciados)

**Responsabilidad**: Construir prompts específicos y únicos para cada nivel de dificultad que resulten en comportamiento distintivo de la IA.

**Estrategia de Diferenciación**:

#### Nivel Fácil (ELO 500-900) - Cumple Requisito 3.1
```typescript
buildEasyPrompt(fen: string, legalMoves: string[]): string {
  return `
Eres un jugador principiante de ajedrez (ELO 500-900).

Posición FEN: ${fen}
Movimientos legales: ${legalMoves.join(', ')}

COMPORTAMIENTO REQUERIDO:
- Prioriza capturas simples sin considerar consecuencias
- Ignora amenazas a tus propias piezas ocasionalmente
- No calcules más de 1 movimiento adelante
- Comete errores tácticos obvios (dejar piezas colgando)
- Mueve piezas sin plan claro
- Probabilidad de error: 30%

INSTRUCCIONES:
1. Elige un movimiento que parezca razonable pero no óptimo
2. Considera capturas pero no evalúes si son seguras
3. NO busques el mejor movimiento, busca uno "aceptable"

Responde SOLO con el movimiento en formato UCI (ejemplo: e2e4)
`;
}
```

**Rationale**: Los prompts de nivel fácil instruyen explícitamente a la IA para realizar movimientos simples con errores ocasionales, sin análisis profundo. Esto crea una experiencia apropiada para jugadores principiantes.

#### Nivel Medio (ELO 1000-1600) - Cumple Requisito 3.2
```typescript
buildMediumPrompt(fen: string, legalMoves: string[], gamePhase: string): string {
  return `
Eres un jugador de club (ELO 1000-1600).

Posición FEN: ${fen}
Fase del juego: ${gamePhase}
Movimientos legales: ${legalMoves.join(', ')}

COMPORTAMIENTO REQUERIDO:
- Busca tácticas simples (clavadas, tenedores, capturas dobles)
- Considera 1-2 movimientos adelante
- Protege tus piezas pero no siempre
- Entiende principios básicos (desarrollo, control del centro)
- Comete errores ocasionales en posiciones complejas
- Probabilidad de error: 15%

PRINCIPIOS A SEGUIR:
${gamePhase === 'opening' ? '- Desarrolla piezas rápidamente\n- Controla el centro\n- Enroca temprano' : ''}
${gamePhase === 'middlegame' ? '- Busca tácticas simples\n- Mejora posición de piezas\n- Considera cambios' : ''}
${gamePhase === 'endgame' ? '- Activa el rey\n- Crea peones pasados\n- Técnica básica' : ''}

Analiza la posición brevemente y elige un movimiento táctico o posicional sólido.

Responde SOLO con el movimiento en formato UCI (ejemplo: e2e4)
`;
}
```

**Rationale**: Los prompts de nivel medio instruyen a la IA para considerar tácticas básicas y analizar 1-2 jugadas adelante, creando un oponente apropiado para jugadores de club.


#### Nivel Avanzado (ELO 1800-2400) - Cumple Requisito 3.3
```typescript
buildAdvancedPrompt(fen: string, legalMoves: string[], gamePhase: string, history: string[]): string {
  return `
Eres un jugador experto (ELO 1800-2400).

Posición FEN: ${fen}
Fase del juego: ${gamePhase}
Últimos movimientos: ${history.slice(-6).join(', ')}
Movimientos legales: ${legalMoves.join(', ')}

COMPORTAMIENTO REQUERIDO:
- Calcula variantes de 2-5 movimientos de profundidad
- Evalúa estructura de peones y debilidades
- Busca combinaciones tácticas complejas
- Entiende conceptos estratégicos (puestos avanzados, columnas abiertas, etc.)
- Considera iniciativa y compensación posicional
- Probabilidad de error: 5%

ANÁLISIS REQUERIDO:
1. Evalúa amenazas inmediatas de ambos bandos
2. Identifica debilidades en la posición enemiga
3. Considera planes a medio plazo (3-5 movimientos)
4. Evalúa cambios de piezas y su impacto
5. Busca mejoras posicionales concretas

FASE ESPECÍFICA:
${gamePhase === 'opening' ? 
  '- Sigue principios de apertura sólidos\n- Busca ventaja en desarrollo o estructura\n- Evita debilidades permanentes' : ''}
${gamePhase === 'middlegame' ? 
  '- Crea amenazas concretas\n- Busca combinaciones tácticas\n- Mejora la peor pieza' : ''}
${gamePhase === 'endgame' ? 
  '- Técnica precisa de finales\n- Calcula variantes forzadas\n- Busca zugzwang' : ''}

Analiza profundamente y elige el mejor movimiento considerando táctica y estrategia.

Responde SOLO con el movimiento en formato UCI (ejemplo: e2e4)
`;
}
```

**Rationale**: Los prompts de nivel avanzado instruyen a la IA para aplicar estrategia avanzada y analizar 2-5 jugadas adelante, proporcionando un desafío significativo para jugadores experimentados.

#### Nivel Experto/GM (ELO 2600+) - Cumple Requisito 3.4
```typescript
buildExpertPrompt(fen: string, legalMoves: string[], gamePhase: string, history: string[]): string {
  return `
Eres un Gran Maestro (ELO 2600+).

Posición FEN: ${fen}
Fase del juego: ${gamePhase}
Historial completo: ${history.join(', ')}
Movimientos legales: ${legalMoves.join(', ')}

COMPORTAMIENTO REQUERIDO:
- Calcula variantes de 6+ movimientos de profundidad
- Evalúa factores posicionales sutiles
- Entiende profilaxis y prevención de planes enemigos
- Busca recursos tácticos ocultos
- Considera aspectos psicológicos y prácticos
- Probabilidad de error: <1%

ANÁLISIS PROFUNDO:
1. Evalúa la posición desde múltiples perspectivas
2. Identifica el plan óptimo a largo plazo
3. Calcula todas las variantes forzadas completamente
4. Considera recursos defensivos del oponente
5. Evalúa compensación dinámica vs estática
6. Busca movimientos "solo" (únicos que mantienen ventaja)

CONSIDERACIONES AVANZADAS:
- Profilaxis: ¿Qué quiere hacer el oponente?
- Iniciativa: ¿Quién controla el ritmo del juego?
- Dinámica: ¿La posición favorece juego táctico o posicional?
- Finales: ¿Cómo se evalúa el final resultante?

FASE ESPECÍFICA:
${gamePhase === 'opening' ? 
  '- Conocimiento profundo de teoría\n- Busca ventaja sutil pero duradera\n- Considera transiciones al medio juego' : ''}
${gamePhase === 'middlegame' ? 
  '- Planes complejos multi-fase\n- Combinaciones profundas\n- Maniobras estratégicas sutiles' : ''}
${gamePhase === 'endgame' ? 
  '- Técnica perfecta\n- Conocimiento teórico de finales\n- Cálculo preciso hasta el mate' : ''}

Realiza el análisis más profundo posible y elige el movimiento objetivamente mejor.

Responde SOLO con el movimiento en formato UCI (ejemplo: e2e4)
`;
}
```

**Rationale**: Los prompts de nivel experto instruyen a la IA para realizar análisis preventivo profundo y analizar 6+ jugadas adelante, creando el máximo desafío posible para jugadores avanzados.

**Implementación** (cumple Requisito 3.5):
```typescript
class PromptBuilder {
  static buildPrompt(request: AIMoveRequest): string {
    const { fen, difficulty, gamePhase, moveHistory, legalMoves } = request;
    
    switch (difficulty) {
      case 'facil':
        return this.buildEasyPrompt(fen, legalMoves);
      case 'medio':
        return this.buildMediumPrompt(fen, legalMoves, gamePhase);
      case 'dificil':
        return this.buildAdvancedPrompt(fen, legalMoves, gamePhase, moveHistory);
      case 'claseMundial':
      case 'experto':
        return this.buildExpertPrompt(fen, legalMoves, gamePhase, moveHistory);
      default:
        return this.buildMediumPrompt(fen, legalMoves, gamePhase);
    }
  }
  
  // Métodos privados para cada nivel...
}
```

**Decisión de Diseño**: Cada nivel de dificultad tiene un método de construcción de prompt completamente separado, asegurando que los prompts sean únicos y apropiados para cada nivel. La IA recibe la posición en formato FEN y la lista de movimientos legales, y debe responder únicamente con el movimiento en notación UCI (e.g., "e2e4") sin explicaciones adicionales, facilitando el parseo y validación.


### 4. GameStateManager (Mejorado)

**Responsabilidad**: Gestionar el estado completo de la partida, coordinar entre ChessEngine y AIService.

**Mejoras Necesarias** (cumple Requisitos 2, 6, 8, 9):
```typescript
class GameStateManager {
  private game: Game | null
  private engine: ChessEngine
  private aiService: AIService
  
  // Métodos existentes mejorados
  async makeMove(from: string, to: string, promotion?: string): Promise<boolean>
  async makeAIMove(): Promise<boolean>
  
  // Nuevos métodos
  canUndo(): boolean
  undoLastMove(): boolean
  undoLastTwoMoves(): boolean  // Para deshacer jugador + IA (Requisito 9.5)
  
  getGamePhase(): 'opening' | 'middlegame' | 'endgame'
  getLegalMovesForSquare(square: string): string[]
  isPlayerTurn(): boolean
  
  // Detección de finales (Requisito 2)
  checkGameEnd(): GameEndReason | null
  
  // Exportación mejorada (Requisito 8.4)
  exportPGN(includeComments?: boolean): string
  exportFEN(): string
}

type GameEndReason = 
  | { type: 'checkmate', winner: PieceColor }
  | { type: 'stalemate' }
  | { type: 'threefold_repetition' }
  | { type: 'fifty_move_rule' }
  | { type: 'insufficient_material' }
  | { type: 'timeout', winner: PieceColor }
  | { type: 'resignation', winner: PieceColor }
```

**Decisión de Diseño**: GameStateManager actúa como fachada que coordina ChessEngine y AIService, proporcionando una API simple para la capa de UI. Esto cumple con el principio de separación de responsabilidades (Requisito 6) y facilita el testing.

**Lógica de Fase del Juego**:
```typescript
getGamePhase(): 'opening' | 'middlegame' | 'endgame' {
  const moveCount = this.engine.getHistory().length;
  const pieces = this.countPieces();
  
  // Apertura: primeros 10-15 movimientos
  if (moveCount < 10) return 'opening';
  
  // Final: pocas piezas en el tablero
  if (pieces.total <= 12 || (pieces.queens === 0 && pieces.total <= 16)) {
    return 'endgame';
  }
  
  // Medio juego: todo lo demás
  return 'middlegame';
}
```


## Data Models

### Tipos Principales

```typescript
// Tipos de chess.js (ya existentes)
type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k'
type PieceColor = 'w' | 'b'

interface ChessPiece {
  type: PieceType
  color: PieceColor
}

interface Square {
  file: string  // 'a'-'h'
  rank: number  // 1-8
}

interface Move {
  from: Square
  to: Square
  piece: ChessPiece
  captured?: ChessPiece
  promotion?: PieceType
  flags: string  // Flags de chess.js (e.g., 'e' para en passant, 'k' para kingside castle)
  san: string    // Notación algebraica estándar (e.g., "Nf3")
  lan: string    // Notación larga (e.g., "g1f3")
  before: string // FEN antes del movimiento
  after: string  // FEN después del movimiento
}

// Tipos de juego
interface GameState {
  fen: string
  pgn: string
  turn: PieceColor
  isGameOver: boolean
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  isThreefoldRepetition: boolean
  isInsufficientMaterial: boolean
  winner?: PieceColor
  legalMoves: string[]
  history: Move[]
  position: Record<string, ChessPiece | null>
  capturedPieces: {
    white: ChessPiece[]
    black: ChessPiece[]
  }
}

interface Game {
  id: string
  status: GameStatus
  settings: GameSettings
  state: GameState
  players: {
    white: 'player' | 'ai'
    black: 'player' | 'ai'
  }
  timers?: {
    white: number  // segundos restantes
    black: number
    lastMoveTime?: number
  }
  result?: GameEndReason
  createdAt: string
  updatedAt: string
}

type GameStatus = 'waiting' | 'playing' | 'paused' | 'finished'

interface GameSettings {
  mode: 'pvp' | 'ai'
  difficulty?: DifficultyLevel
  playerColor?: PieceColor
  timeControl?: {
    initial: number    // minutos iniciales
    increment: number  // segundos de incremento por movimiento
  }
}

// Tipos de IA
type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'claseMundial' | 'experto'

interface DifficultyConfig {
  elo: number
  ollamaModel: string
  geminiModel?: string
  thinkTime: number        // ms mínimo de "pensamiento"
  errorRate: number        // 0-1, probabilidad de error intencional
  strategy: string
  maxDepth: number         // profundidad máxima de análisis
  phases?: {
    opening: string
    middlegame: string
    endgame: string
  }
}
```


## Error Handling

### Estrategia de Manejo de Errores por Capa

#### 1. ChessEngine (Capa de Motor)
```typescript
class ChessEngineError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ChessEngineError';
  }
}

// Errores específicos
- INVALID_FEN: FEN inválido al cargar posición
- INVALID_MOVE: Movimiento ilegal
- GAME_OVER: Intento de mover cuando el juego terminó
```

**Manejo**: Lanzar excepciones específicas que serán capturadas por GameStateManager.

#### 2. AIService (Capa de IA)
```typescript
class AIServiceError extends Error {
  constructor(
    message: string, 
    public code: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

// Errores específicos
- API_TIMEOUT: La API no respondió a tiempo (retryable)
- INVALID_RESPONSE: Respuesta con formato incorrecto (retryable)
- INVALID_MOVE: IA devolvió movimiento ilegal (retryable)
- API_ERROR: Error de la API (retryable según código)
- MAX_RETRIES_EXCEEDED: Se agotaron los reintentos (no retryable)
```

**Estrategia de Reintentos**:
```typescript
async requestMoveWithRetry(
  request: AIMoveRequest,
  maxRetries: number = 3
): Promise<AIMoveResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await this.requestMove(request);
      
      // Validar que el movimiento es legal
      if (!request.legalMoves.includes(response.move)) {
        throw new AIServiceError(
          `AI returned illegal move: ${response.move}`,
          'INVALID_MOVE',
          true
        );
      }
      
      return response;
      
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof AIServiceError && !error.retryable) {
        break;
      }
      
      // Esperar antes de reintentar (backoff exponencial)
      if (attempt < maxRetries) {
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }
  }
  
  // Si todos los reintentos fallan, seleccionar movimiento aleatorio
  const randomMove = this.selectRandomLegalMove(request.legalMoves);
  
  return {
    move: randomMove,
    confidence: 0,
    reasoning: `Fallback after ${maxRetries} failed attempts`,
    model: 'fallback',
    thinkTime: 0,
    isFallback: true
  };
}
```

#### 3. GameStateManager (Capa de Lógica de Negocio)
```typescript
class GameStateError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'GameStateError';
  }
}

// Errores específicos
- NO_ACTIVE_GAME: No hay partida activa
- WRONG_TURN: No es el turno del jugador
- GAME_PAUSED: La partida está pausada
- AI_MOVE_FAILED: Fallo al obtener movimiento de IA
```

**Manejo**: Capturar errores de capas inferiores y proporcionar mensajes amigables al usuario.


#### 4. UI Layer (Capa de Presentación)
```typescript
// En hooks y componentes
try {
  await makeMove(from, to);
} catch (error) {
  if (error instanceof GameStateError) {
    // Mostrar mensaje específico al usuario
    showNotification({
      type: 'error',
      message: getUserFriendlyMessage(error.code)
    });
  } else {
    // Error inesperado
    showNotification({
      type: 'error',
      message: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
    });
    console.error('Unexpected error:', error);
  }
}
```

### Mensajes de Usuario Amigables

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  // ChessEngine
  INVALID_MOVE: 'Ese movimiento no es válido. Intenta otro.',
  GAME_OVER: 'La partida ha terminado.',
  
  // AIService
  API_TIMEOUT: 'La IA está tardando más de lo esperado. Reintentando...',
  MAX_RETRIES_EXCEEDED: 'No se pudo conectar con la IA. ¿Quieres continuar en modo PvP?',
  
  // GameStateManager
  NO_ACTIVE_GAME: 'No hay una partida activa. Inicia una nueva partida.',
  WRONG_TURN: 'No es tu turno.',
  GAME_PAUSED: 'La partida está pausada. Reanúdala para continuar.',
};
```


## Testing Strategy

### Pirámide de Testing

```
        /\
       /  \      E2E Tests (5%)
      /____\     - Flujo completo de partida
     /      \    
    /        \   Integration Tests (15%)
   /__________\  - ChessEngine + GameStateManager
  /            \ - AIService + API Routes
 /              \
/________________\ Unit Tests (80%)
                   - Movimientos individuales
                   - Validaciones
                   - Prompts de IA
                   - Utilidades
```

### 1. Unit Tests (Prioridad Alta)

#### ChessEngine Tests (cumple Requisito 5.1, 5.3)
```typescript
describe('ChessEngine', () => {
  describe('Movimientos de Piezas', () => {
    it('debe permitir movimientos legales de peón', () => {
      const engine = new ChessEngine();
      expect(engine.makeMove({file: 'e', rank: 2}, {file: 'e', rank: 4})).toBe(true);
    });
    
    it('debe rechazar movimientos ilegales de peón', () => {
      const engine = new ChessEngine();
      expect(engine.makeMove({file: 'e', rank: 2}, {file: 'e', rank: 5})).toBe(false);
    });
    
    it('debe permitir captura al paso', () => {
      const engine = new ChessEngine('rnbqkbnr/ppp2ppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3');
      expect(engine.makeMove({file: 'e', rank: 5}, {file: 'd', rank: 6})).toBe(true);
    });
    
    it('debe permitir enroque corto cuando es legal', () => {
      const engine = new ChessEngine('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1');
      expect(engine.makeMove({file: 'e', rank: 1}, {file: 'g', rank: 1})).toBe(true);
    });
    
    it('debe rechazar enroque si el rey está en jaque', () => {
      const engine = new ChessEngine('r1bqkb1r/pppp1ppp/2n2n2/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 0 1');
      expect(engine.makeMove({file: 'e', rank: 1}, {file: 'g', rank: 1})).toBe(false);
    });
    
    it('debe rechazar movimientos que dejan al propio rey en jaque', () => {
      const engine = new ChessEngine('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 1');
      // Mover pieza clavada debería ser ilegal
      expect(engine.makeMove({file: 'f', rank: 2}, {file: 'f', rank: 3})).toBe(false);
    });
  });
  
  describe('Detección de Finales', () => {
    it('debe detectar jaque mate', () => {
      const engine = new ChessEngine('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1');
      expect(engine.isCheckmate()).toBe(true);
    });
    
    it('debe detectar ahogado', () => {
      const engine = new ChessEngine('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
      expect(engine.isStalemate()).toBe(true);
    });
    
    it('debe detectar material insuficiente', () => {
      const engine = new ChessEngine('8/8/8/8/8/4k3/8/4K3 w - - 0 1');
      expect(engine.isInsufficientMaterial()).toBe(true);
    });
    
    it('debe detectar tablas por repetición triple', () => {
      const engine = new ChessEngine();
      // Repetir la misma posición 3 veces
      engine.makeMove({file: 'g', rank: 1}, {file: 'f', rank: 3});
      engine.makeMove({file: 'g', rank: 8}, {file: 'f', rank: 6});
      engine.makeMove({file: 'f', rank: 3}, {file: 'g', rank: 1});
      engine.makeMove({file: 'f', rank: 6}, {file: 'g', rank: 8});
      engine.makeMove({file: 'g', rank: 1}, {file: 'f', rank: 3});
      engine.makeMove({file: 'g', rank: 8}, {file: 'f', rank: 6});
      engine.makeMove({file: 'f', rank: 3}, {file: 'g', rank: 1});
      engine.makeMove({file: 'f', rank: 6}, {file: 'g', rank: 8});
      expect(engine.isThreefoldRepetition()).toBe(true);
    });
  });
  
  describe('Promoción de Peones', () => {
    it('debe requerir selección de pieza al promocionar', () => {
      const engine = new ChessEngine('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
      // Promoción sin especificar pieza debería fallar o usar dama por defecto
      const result = engine.makeMove({file: 'e', rank: 7}, {file: 'e', rank: 8});
      expect(result).toBeDefined();
    });
    
    it('debe permitir promoción a cualquier pieza válida', () => {
      const engine = new ChessEngine('8/4P3/8/8/8/8/8/4k2K w - - 0 1');
      expect(engine.makeMove({file: 'e', rank: 7}, {file: 'e', rank: 8}, 'q')).toBe(true);
    });
  });
});
```

**Rationale**: Los tests cubren todas las reglas oficiales del ajedrez (Requisito 5.1) y movimientos especiales (Requisito 5.3), asegurando que chess.js se use correctamente y que todas las validaciones funcionen como se espera.

#### AIService Tests (cumple Requisito 4)
```typescript
describe('AIService', () => {
  describe('Validación de Movimientos', () => {
    it('debe validar movimiento legal', () => {
      const service = new AIService();
      const legalMoves = ['e2e4', 'd2d4', 'g1f3'];
      expect(service.validateAIMove('e2e4', legalMoves)).toBe(true);
    });
    
    it('debe rechazar movimiento ilegal', () => {
      const service = new AIService();
      const legalMoves = ['e2e4', 'd2d4', 'g1f3'];
      expect(service.validateAIMove('e2e5', legalMoves)).toBe(false);
    });
  });
  
  describe('Parseo de Respuestas', () => {
    it('debe extraer movimiento de respuesta limpia', () => {
      const service = new AIService();
      expect(service.parseAIResponse('e2e4')).toBe('e2e4');
    });
    
    it('debe extraer movimiento de respuesta con texto adicional', () => {
      const service = new AIService();
      const response = 'El mejor movimiento es e2e4 porque controla el centro';
      expect(service.parseAIResponse(response)).toBe('e2e4');
    });
  });
  
  describe('Manejo de Errores y Reintentos', () => {
    it('debe reintentar hasta 3 veces en caso de timeout', async () => {
      const service = new AIService();
      const mockRequest: AIMoveRequest = {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        difficulty: 'medio',
        gamePhase: 'opening',
        moveHistory: [],
        legalMoves: ['e2e4', 'd2d4']
      };
      
      // Mock que falla 2 veces y luego tiene éxito
      let attempts = 0;
      jest.spyOn(service, 'requestMove').mockImplementation(async () => {
        attempts++;
        if (attempts < 3) throw new Error('Timeout');
        return { move: 'e2e4', confidence: 0.8, model: 'gemini', thinkTime: 1000 };
      });
      
      const result = await service.requestMoveWithRetry(mockRequest, 3);
      expect(result.move).toBe('e2e4');
      expect(attempts).toBe(3);
    });
    
    it('debe usar movimiento aleatorio después de agotar reintentos', async () => {
      const service = new AIService();
      const mockRequest: AIMoveRequest = {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        difficulty: 'medio',
        gamePhase: 'opening',
        moveHistory: [],
        legalMoves: ['e2e4', 'd2d4']
      };
      
      // Mock que siempre falla
      jest.spyOn(service, 'requestMove').mockRejectedValue(new Error('API Error'));
      
      const result = await service.requestMoveWithRetry(mockRequest, 3);
      expect(result.isFallback).toBe(true);
      expect(mockRequest.legalMoves).toContain(result.move);
    });
  });
});
```

**Rationale**: Los tests verifican el manejo robusto de errores requerido en el Requisito 4, incluyendo reintentos, validación de movimientos y fallback a movimientos aleatorios.


#### PromptBuilder Tests (cumple Requisito 5.5)
```typescript
describe('PromptBuilder', () => {
  it('debe generar prompts diferentes para cada nivel', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const legalMoves = ['e2e4', 'd2d4'];
    
    const easyPrompt = PromptBuilder.buildPrompt({
      fen, difficulty: 'facil', gamePhase: 'opening', 
      moveHistory: [], legalMoves
    });
    
    const mediumPrompt = PromptBuilder.buildPrompt({
      fen, difficulty: 'medio', gamePhase: 'opening',
      moveHistory: [], legalMoves
    });
    
    const advancedPrompt = PromptBuilder.buildPrompt({
      fen, difficulty: 'dificil', gamePhase: 'opening',
      moveHistory: [], legalMoves
    });
    
    const expertPrompt = PromptBuilder.buildPrompt({
      fen, difficulty: 'experto', gamePhase: 'opening',
      moveHistory: [], legalMoves
    });
    
    // Verificar que todos los prompts son diferentes
    expect(easyPrompt).not.toBe(mediumPrompt);
    expect(mediumPrompt).not.toBe(advancedPrompt);
    expect(advancedPrompt).not.toBe(expertPrompt);
    
    // Verificar contenido específico por nivel
    expect(easyPrompt).toContain('principiante');
    expect(easyPrompt).toContain('ELO 500-900');
    expect(mediumPrompt).toContain('club');
    expect(mediumPrompt).toContain('ELO 1000-1600');
    expect(advancedPrompt).toContain('experto');
    expect(advancedPrompt).toContain('ELO 1800-2400');
    expect(expertPrompt).toContain('Gran Maestro');
    expect(expertPrompt).toContain('ELO 2600+');
  });
  
  it('debe incluir fase del juego en prompts de nivel medio+', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const legalMoves = ['e2e4'];
    
    const prompt = PromptBuilder.buildPrompt({
      fen, difficulty: 'medio', gamePhase: 'opening',
      moveHistory: [], legalMoves
    });
    
    expect(prompt).toContain('opening');
  });
  
  it('debe incluir movimientos legales en todos los prompts', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const legalMoves = ['e2e4', 'd2d4', 'g1f3'];
    
    const prompt = PromptBuilder.buildPrompt({
      fen, difficulty: 'facil', gamePhase: 'opening',
      moveHistory: [], legalMoves
    });
    
    legalMoves.forEach(move => {
      expect(prompt).toContain(move);
    });
  });
});
```

**Rationale**: Los tests verifican que cada nivel de dificultad utiliza prompts diferentes y apropiados (Requisito 5.5), asegurando que la IA se comporte de manera distintiva según el nivel seleccionado.

### 2. Integration Tests (Prioridad Media) - cumple Requisito 5.4

```typescript
describe('Game Flow Integration', () => {
  it('debe completar una partida completa PvP', async () => {
    const manager = new GameStateManager();
    const settings: GameSettings = { mode: 'pvp' };
    
    manager.createGame(settings);
    manager.startGame();
    
    // Realizar algunos movimientos
    expect(await manager.makeMove('e2', 'e4')).toBe(true);
    expect(await manager.makeMove('e7', 'e5')).toBe(true);
    
    const state = manager.getGameState();
    expect(state?.history.length).toBe(2);
  });
  
  it('debe manejar turno de IA correctamente', async () => {
    const manager = new GameStateManager();
    const settings: GameSettings = {
      mode: 'ai',
      difficulty: 'facil',
      playerColor: 'w'
    };
    
    manager.createGame(settings);
    manager.startGame();
    
    // Jugador mueve
    await manager.makeMove('e2', 'e4');
    
    // IA debe responder
    const aiMoved = await manager.makeAIMove();
    expect(aiMoved).toBe(true);
    
    const state = manager.getGameState();
    expect(state?.history.length).toBe(2);
  });
  
  it('debe detectar correctamente el final de la partida', async () => {
    const manager = new GameStateManager();
    const settings: GameSettings = { mode: 'pvp' };
    
    manager.createGame(settings);
    manager.startGame();
    
    // Mate del pastor
    await manager.makeMove('e2', 'e4');
    await manager.makeMove('e7', 'e5');
    await manager.makeMove('d1', 'h5');
    await manager.makeMove('b8', 'c6');
    await manager.makeMove('f1', 'c4');
    await manager.makeMove('g8', 'f6');
    await manager.makeMove('h5', 'f7'); // Jaque mate
    
    const state = manager.getGameState();
    expect(state?.isCheckmate).toBe(true);
    expect(state?.isGameOver).toBe(true);
    
    const endReason = manager.checkGameEnd();
    expect(endReason?.type).toBe('checkmate');
  });
  
  it('debe preservar estado del juego en caso de error de IA', async () => {
    const manager = new GameStateManager();
    const settings: GameSettings = {
      mode: 'ai',
      difficulty: 'medio',
      playerColor: 'w'
    };
    
    manager.createGame(settings);
    manager.startGame();
    
    const initialState = manager.getGameState();
    
    // Simular error de IA
    jest.spyOn(manager['aiService'], 'requestMoveWithRetry').mockRejectedValue(new Error('API Error'));
    
    try {
      await manager.makeAIMove();
    } catch (error) {
      // El estado debe permanecer igual
      const currentState = manager.getGameState();
      expect(currentState?.fen).toBe(initialState?.fen);
    }
  });
});
```

**Rationale**: Los tests de integración verifican el flujo completo de una partida desde inicio hasta finalización (Requisito 5.4), incluyendo la interacción entre ChessEngine, GameStateManager y AIService.

### 3. E2E Tests (Prioridad Baja - Opcional)

```typescript
describe('Complete Game E2E', () => {
  it('debe permitir jugar una partida completa desde UI', async () => {
    // Usar Playwright o Cypress
    // 1. Navegar a lobby
    // 2. Configurar partida
    // 3. Realizar movimientos
    // 4. Verificar que la partida termina correctamente
  });
});
```

### Configuración de Testing

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/app/**', // Excluir Next.js app directory
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```


## UI/UX Design

### Componentes Mejorados

#### 1. Board Component (Tablero Mejorado) - cumple Requisitos 7.1, 7.3, 7.5

**Características**:
- Resaltar pieza seleccionada (Requisito 7.1)
- Mostrar movimientos legales como círculos/puntos (Requisito 7.1)
- Resaltar último movimiento
- Resaltar rey en jaque (Requisito 7.3)
- Animaciones suaves de movimiento (Requisito 7.5)
- Drag & drop mejorado

**Implementación**:
```typescript
interface BoardProps {
  position: Record<string, ChessPiece | null>
  legalMoves: string[]
  selectedSquare: string | null
  lastMove: { from: string, to: string } | null
  kingInCheck: string | null  // Casilla del rey en jaque
  onSquareClick: (square: string) => void
  onPieceMove: (from: string, to: string) => void
  flipped: boolean
  isPlayerTurn: boolean  // Para deshabilitar interacción cuando no es turno del jugador
}

// Estados visuales
- selectedSquare: fondo amarillo/dorado (Requisito 7.1)
- legalMoves: círculos semi-transparentes (Requisito 7.1)
- lastMove: fondo verde claro en from/to
- kingInCheck: fondo rojo pulsante (Requisito 7.3)
- !isPlayerTurn: cursor not-allowed, opacidad reducida (Requisito 9.4)
```

**Decisión de Diseño**: Los indicadores visuales claros ayudan al jugador a entender el estado del juego sin necesidad de leer texto, mejorando la experiencia de usuario y cumpliendo con los requisitos de accesibilidad.

#### 2. GameInfo Component (Información de Partida) - cumple Requisitos 7.2, 7.4, 8.5

**Características**:
- Indicador de turno claro (Requisito 7.2)
- Estado del juego (jaque, jaque mate, tablas) (Requisito 7.4)
- Temporizadores (si aplica) (Requisito 8.5)
- Botones de control (pausar, reiniciar, deshacer)

```typescript
interface GameInfoProps {
  currentTurn: PieceColor
  isCheck: boolean
  isCheckmate: boolean
  isDraw: boolean
  drawReason?: 'stalemate' | 'threefold_repetition' | 'fifty_move_rule' | 'insufficient_material'
  gameStatus: GameStatus
  timers?: { white: number, black: number }
  elapsedTime: number  // Tiempo transcurrido de la partida (Requisito 8.5)
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onUndo: () => void
}
```

**Decisión de Diseño**: Centralizar toda la información del estado del juego en un solo componente facilita que el jugador entienda rápidamente la situación actual sin buscar información dispersa en la interfaz.

#### 3. MoveHistory Component (Historial Mejorado) - cumple Requisito 8.1

**Características**:
- Notación algebraica estándar (Requisito 8.1)
- Navegación por movimientos
- Scroll automático al último movimiento
- Resaltar movimiento actual

```typescript
interface MoveHistoryProps {
  moves: Move[]
  currentMoveIndex: number
  onMoveClick: (index: number) => void
}

// Formato de visualización (notación algebraica estándar)
1. e4    e5
2. Nf3   Nc6
3. Bb5   a6
```

**Decisión de Diseño**: Usar notación algebraica estándar (SAN) en lugar de notación UCI hace que el historial sea más legible para jugadores humanos, cumpliendo con las convenciones estándar del ajedrez.

#### 4. CapturedPieces Component (Piezas Capturadas) - cumple Requisito 8.3

**Características**:
- Mostrar piezas capturadas por cada jugador (Requisito 8.3)
- Agrupar por tipo (Requisito 8.3)
- Mostrar ventaja material

```typescript
interface CapturedPiecesProps {
  capturedByWhite: ChessPiece[]
  capturedByBlack: ChessPiece[]
}

// Valores de piezas para calcular ventaja
const PIECE_VALUES = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0
};
```


#### 5. AIThinkingIndicator Component (Indicador de IA Pensando) - cumple Requisito 8.2

**Características**:
- Animación de "pensamiento" (Requisito 8.2)
- Mostrar nivel de dificultad (Requisito 8.2)
- Tiempo transcurrido
- Cancelar si tarda demasiado

```typescript
interface AIThinkingIndicatorProps {
  difficulty: DifficultyLevel
  thinkingTime: number  // ms transcurridos
  onCancel?: () => void
}
```

**Decisión de Diseño**: Mostrar un indicador visual mientras la IA calcula proporciona feedback al usuario de que el sistema está funcionando, evitando la percepción de que la aplicación se ha congelado.

#### 6. GameEndModal Component (Modal de Fin de Partida) - cumple Requisitos 7.4, 8.4

**Características**:
- Mostrar resultado claro (Requisito 7.4)
- Resumen de la partida (tipo de finalización) (Requisito 7.4)
- Opciones: nueva partida, revisar, exportar PGN (Requisito 8.4)

```typescript
interface GameEndModalProps {
  result: GameEndReason
  pgn: string
  onNewGame: () => void
  onReview: () => void
  onExportPGN: () => void
}
```

**Decisión de Diseño**: Proporcionar opciones claras al finalizar la partida permite al usuario decidir qué hacer a continuación sin tener que buscar botones o menús, mejorando el flujo de la experiencia.

#### 7. GameSetup Component (Configuración de Partida) - cumple Requisito 10

**Características**:
- Selección de modo de juego (PvP / PvE) (Requisito 10.1)
- Selección de nivel de dificultad (si PvE) (Requisito 10.2)
- Selección de color del jugador (si PvE) (Requisito 10.3)
- Configuración opcional de tiempo (Requisito 10.4)

```typescript
interface GameSetupProps {
  onStartGame: (settings: GameSettings) => void
}

interface GameSettings {
  mode: 'pvp' | 'ai'
  difficulty?: DifficultyLevel  // Requerido si mode === 'ai'
  playerColor?: PieceColor       // Requerido si mode === 'ai'
  timeControl?: {
    initial: number    // minutos iniciales
    increment: number  // segundos de incremento por movimiento
  }
}
```

**Decisión de Diseño**: Proporcionar una interfaz de configuración flexible antes de iniciar la partida permite a los jugadores personalizar su experiencia según sus preferencias, cumpliendo con el Requisito 10. La validación de campos requeridos según el modo seleccionado asegura que la configuración sea consistente.

### Flujo de Interacción del Usuario

```
1. Lobby (Configuración) - Requisito 10
   ↓
   Usuario selecciona:
   - Modo (PvP / PvE) (Requisito 10.1)
   - Dificultad (si PvE) (Requisito 10.2)
   - Color (si PvE) (Requisito 10.3)
   - Tiempo (opcional) (Requisito 10.4)
   ↓
2. Game (Partida)
   ↓
   Jugador hace clic en pieza (Requisito 7.1)
   → Se resalta la pieza
   → Se muestran movimientos legales
   ↓
   Jugador hace clic en casilla destino
   → Validación de movimiento (Requisito 9.1, 9.2)
   → Animación de movimiento (Requisito 7.5)
   → Actualización de estado
   → Si es PvE, turno de IA
   ↓
   IA "piensa" (indicador visual) (Requisito 8.2)
   → Respuesta de IA con manejo de errores (Requisito 4)
   → Animación de movimiento de IA
   → Turno del jugador
   ↓
3. Game End (Fin de Partida)
   ↓
   Modal con resultado (Requisito 7.4)
   → Opciones: Nueva partida, Revisar, Exportar PGN (Requisito 8.4)
```

### Input Validation (cumple Requisito 9)

**Estrategia de Validación**:

```typescript
class InputValidator {
  // Requisito 9.1: Validar que el jugador solo mueva sus propias piezas
  static validatePieceOwnership(piece: ChessPiece, currentTurn: PieceColor): boolean {
    return piece.color === currentTurn;
  }
  
  // Requisito 9.2: Validar que el movimiento sea legal
  static validateMove(from: string, to: string, legalMoves: string[]): boolean {
    const moveNotation = `${from}${to}`;
    return legalMoves.includes(moveNotation);
  }
  
  // Requisito 9.3: Validar que se seleccione pieza de promoción
  static validatePromotion(move: Move, promotion?: PieceType): boolean {
    if (move.flags.includes('p')) { // Promoción
      return promotion !== undefined && ['q', 'r', 'b', 'n'].includes(promotion);
    }
    return true;
  }
  
  // Requisito 9.4: Validar que sea el turno del jugador
  static validatePlayerTurn(gameMode: 'pvp' | 'ai', currentTurn: PieceColor, playerColor?: PieceColor): boolean {
    if (gameMode === 'pvp') return true;
    return currentTurn === playerColor;
  }
}
```

**Implementación en UI**:
```typescript
// En Board component
const handleSquareClick = (square: string) => {
  // Requisito 9.4: Verificar que sea turno del jugador
  if (!InputValidator.validatePlayerTurn(gameMode, currentTurn, playerColor)) {
    return; // Ignorar clic
  }
  
  const piece = getPiece(square);
  
  if (selectedSquare === null) {
    // Seleccionar pieza
    if (piece) {
      // Requisito 9.1: Verificar que sea pieza del jugador
      if (!InputValidator.validatePieceOwnership(piece, currentTurn)) {
        return; // Ignorar clic
      }
      setSelectedSquare(square);
    }
  } else {
    // Intentar mover
    // Requisito 9.2: Verificar que el movimiento sea legal
    if (!InputValidator.validateMove(selectedSquare, square, legalMoves)) {
      setSelectedSquare(null); // Deseleccionar
      return;
    }
    
    // Requisito 9.3: Si es promoción, mostrar selector
    if (isPromotionMove(selectedSquare, square)) {
      showPromotionSelector(selectedSquare, square);
      return;
    }
    
    makeMove(selectedSquare, square);
    setSelectedSquare(null);
  }
};
```

**Decisión de Diseño**: La validación de entrada en múltiples capas (UI y lógica de negocio) asegura que los movimientos inválidos sean rechazados antes de llegar al motor de ajedrez, mejorando la experiencia de usuario y la integridad del juego.

### Accesibilidad

**Requisitos**:
- Contraste mínimo WCAG AA (4.5:1 para texto normal)
- Navegación por teclado completa
- Anuncios de screen reader para movimientos
- Indicadores visuales claros (no solo color)

**Implementación**:
```typescript
// Atributos ARIA
<div 
  role="button"
  aria-label={`${piece.color} ${piece.type} on ${square}`}
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSquareClick(square);
    }
  }}
>
```


## API Routes Design

### 1. POST /api/ai/move

**Responsabilidad**: Obtener movimiento de la IA según nivel de dificultad.

**Request**:
```typescript
{
  fen: string
  difficulty: DifficultyLevel
  gamePhase: 'opening' | 'middlegame' | 'endgame'
  moveHistory: string[]
  legalMoves: string[]
  thinkTime?: number
}
```

**Response**:
```typescript
{
  move: string              // e.g., "e2e4"
  confidence: number        // 0-1
  evaluation?: number       // Evaluación de la posición
  model: string            // Modelo usado
  thinkTime: number        // Tiempo real de cálculo
  isFallback?: boolean     // Si se usó movimiento aleatorio
}
```

**Implementación**:
```typescript
// src/app/api/ai/move/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fen, difficulty, gamePhase, moveHistory, legalMoves } = body;
    
    // Validar entrada
    if (!fen || !difficulty || !legalMoves) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Construir prompt específico
    const prompt = PromptBuilder.buildPrompt({
      fen,
      difficulty,
      gamePhase: gamePhase || 'middlegame',
      moveHistory: moveHistory || [],
      legalMoves
    });
    
    // Obtener configuración de dificultad
    const config = getDifficultyConfig(difficulty);
    
    // Llamar a Gemini/Ollama
    const aiService = new AIService();
    const response = await aiService.requestMoveWithRetry({
      fen,
      difficulty,
      gamePhase,
      moveHistory,
      legalMoves,
      thinkTime: config.thinkTime
    });
    
    return Response.json(response);
    
  } catch (error) {
    console.error('AI move error:', error);
    return Response.json(
      { error: 'Failed to get AI move' },
      { status: 500 }
    );
  }
}
```

### 2. POST /api/ai/analyze

**Responsabilidad**: Analizar una posición y proporcionar evaluación.

**Request**:
```typescript
{
  fen: string
  difficulty?: DifficultyLevel
  question?: string  // Pregunta específica sobre la posición
}
```

**Response**:
```typescript
{
  analysis: string
  evaluation: number
  bestMoves: string[]
  threats: string[]
  model: string
}
```

### 3. GET /api/game/[id]

**Responsabilidad**: Obtener estado de una partida guardada.

**Response**:
```typescript
{
  game: Game
}
```

### 4. POST /api/game/save

**Responsabilidad**: Guardar estado de partida (para futuro).

**Request**:
```typescript
{
  game: Game
}
```

**Response**:
```typescript
{
  id: string
  savedAt: string
}
```


## Performance Considerations

### 1. Optimización de Renderizado

**Problema**: El tablero se re-renderiza en cada movimiento.

**Solución**:
```typescript
// Memoizar componentes que no cambian frecuentemente
const Square = React.memo(({ square, piece, isSelected, isLegalMove, onClick }) => {
  // ...
}, (prevProps, nextProps) => {
  return (
    prevProps.piece === nextProps.piece &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isLegalMove === nextProps.isLegalMove
  );
});

// Usar useCallback para funciones
const handleSquareClick = useCallback((square: string) => {
  // ...
}, [dependencies]);
```

### 2. Optimización de IA

**Problema**: Llamadas a API pueden ser lentas.

**Solución**:
```typescript
// Caché de posiciones evaluadas
const positionCache = new Map<string, AIMoveResponse>();

async function getCachedAIMove(fen: string, difficulty: DifficultyLevel) {
  const cacheKey = `${fen}-${difficulty}`;
  
  if (positionCache.has(cacheKey)) {
    return positionCache.get(cacheKey);
  }
  
  const response = await requestAIMove(fen, difficulty);
  positionCache.set(cacheKey, response);
  
  return response;
}

// Limitar tamaño del caché
if (positionCache.size > 1000) {
  const firstKey = positionCache.keys().next().value;
  positionCache.delete(firstKey);
}
```

### 3. Lazy Loading

**Problema**: Cargar todos los componentes al inicio es innecesario.

**Solución**:
```typescript
// Lazy load de componentes pesados
const GameEndModal = lazy(() => import('@/components/chess/GameEndModal'));
const AnalysisPanel = lazy(() => import('@/components/chess/AnalysisPanel'));

// Usar Suspense
<Suspense fallback={<LoadingSpinner />}>
  {showAnalysis && <AnalysisPanel />}
</Suspense>
```

### 4. Debouncing de Eventos

**Problema**: Eventos de mouse pueden dispararse muchas veces.

**Solución**:
```typescript
const debouncedMouseMove = useMemo(
  () => debounce((e: MouseEvent) => {
    // Lógica de drag
  }, 16), // ~60fps
  []
);
```


## Migration Strategy

### Fase 1: Mejoras al Motor (Sin Breaking Changes)

**Objetivo**: Mejorar ChessEngine sin afectar código existente.

**Tareas**:
1. Agregar métodos faltantes a ChessEngine (isThreefoldRepetition, isInsufficientMaterial)
2. Mejorar tipos y documentación
3. Agregar tests unitarios para ChessEngine

**Impacto**: Ninguno en código existente, solo adiciones.

### Fase 2: Sistema de IA Mejorado

**Objetivo**: Implementar prompts diferenciados y manejo de errores robusto.

**Tareas**:
1. Crear nuevo PromptBuilder con prompts específicos por nivel
2. Crear AIService con lógica de reintentos
3. Actualizar API route /api/ai/move
4. Actualizar useChessAI hook

**Impacto**: Cambios en la API de IA, pero compatible con código existente.

### Fase 3: GameStateManager Mejorado

**Objetivo**: Centralizar lógica de juego y mejorar gestión de estado.

**Tareas**:
1. Agregar métodos para detectar fase del juego
2. Mejorar integración con AIService
3. Agregar soporte para deshacer movimientos
4. Agregar detección de finales mejorada

**Impacto**: Cambios internos, API pública compatible.

### Fase 4: UI/UX Mejorada

**Objetivo**: Mejorar experiencia visual y de interacción.

**Tareas**:
1. Mejorar Board component con resaltados
2. Agregar animaciones suaves
3. Mejorar GameInfo y MoveHistory
4. Agregar GameEndModal
5. Mejorar accesibilidad

**Impacto**: Cambios visuales, sin cambios en lógica.

### Fase 5: Testing

**Objetivo**: Agregar cobertura de tests completa.

**Tareas**:
1. Configurar Vitest
2. Escribir tests unitarios
3. Escribir tests de integración
4. Configurar CI/CD para ejecutar tests

**Impacto**: Ninguno en funcionalidad, solo infraestructura.


## Security Considerations

### 1. API Keys

**Problema**: Las API keys de Gemini/Ollama deben estar protegidas.

**Solución**:
- Todas las llamadas a IA deben hacerse desde API routes (server-side)
- Nunca exponer API keys en el cliente
- Usar variables de entorno (.env.local)
- Validar origen de requests en producción

```typescript
// src/app/api/ai/move/route.ts
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY not configured');
}
```

### 2. Rate Limiting

**Problema**: Usuarios podrían abusar de la API de IA.

**Solución**:
```typescript
// Implementar rate limiting simple
const requestCounts = new Map<string, { count: number, resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = requestCounts.get(ip);
  
  if (!limit || now > limit.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minuto
    return true;
  }
  
  if (limit.count >= 30) { // 30 requests por minuto
    return false;
  }
  
  limit.count++;
  return true;
}
```

### 3. Input Validation

**Problema**: Usuarios podrían enviar datos maliciosos.

**Solución**:
```typescript
import { z } from 'zod';

const AIMoveRequestSchema = z.object({
  fen: z.string().regex(/^[rnbqkpRNBQKP1-8\/\s]+$/), // Validar formato FEN
  difficulty: z.enum(['facil', 'medio', 'dificil', 'claseMundial', 'experto']),
  gamePhase: z.enum(['opening', 'middlegame', 'endgame']).optional(),
  moveHistory: z.array(z.string()).max(500), // Limitar tamaño
  legalMoves: z.array(z.string()).max(218) // Máximo teórico de movimientos legales
});

// En API route
const validatedData = AIMoveRequestSchema.parse(body);
```

### 4. Sanitización de Respuestas de IA

**Problema**: La IA podría devolver contenido inesperado.

**Solución**:
```typescript
function sanitizeAIResponse(response: string): string {
  // Extraer solo el movimiento, ignorar texto adicional
  const movePattern = /[a-h][1-8][a-h][1-8][qrbn]?/;
  const match = response.match(movePattern);
  
  return match ? match[0] : '';
}
```

## Monitoring and Logging

### 1. Logging de Errores

```typescript
// src/lib/logger.ts
export class Logger {
  static error(context: string, error: Error, metadata?: any) {
    console.error(`[${context}]`, error.message, metadata);
    
    // En producción, enviar a servicio de logging
    if (process.env.NODE_ENV === 'production') {
      // Sentry, LogRocket, etc.
    }
  }
  
  static info(context: string, message: string, metadata?: any) {
    console.log(`[${context}]`, message, metadata);
  }
}
```

### 2. Métricas de IA

```typescript
interface AIMetrics {
  difficulty: DifficultyLevel
  thinkTime: number
  success: boolean
  retries: number
  isFallback: boolean
}

function trackAIMetrics(metrics: AIMetrics) {
  // Enviar a servicio de analytics
  console.log('AI Metrics:', metrics);
}
```

## Documentation

### 1. Código

- Todos los métodos públicos deben tener JSDoc
- Interfaces y tipos deben estar documentados
- Casos edge deben estar comentados

```typescript
/**
 * Realiza un movimiento en el tablero.
 * 
 * @param from - Casilla de origen (e.g., {file: 'e', rank: 2})
 * @param to - Casilla de destino (e.g., {file: 'e', rank: 4})
 * @param promotion - Pieza de promoción opcional ('q', 'r', 'b', 'n')
 * @returns true si el movimiento fue exitoso, false si fue ilegal
 * 
 * @throws {ChessEngineError} Si el juego ya terminó
 * 
 * @example
 * ```typescript
 * const engine = new ChessEngine();
 * engine.makeMove({file: 'e', rank: 2}, {file: 'e', rank: 4}); // true
 * ```
 */
makeMove(from: Square, to: Square, promotion?: PieceType): boolean
```

### 2. Arquitectura

- Diagrama de componentes actualizado
- Flujo de datos documentado
- Decisiones de diseño explicadas

### 3. API

- Documentación de endpoints
- Ejemplos de requests/responses
- Códigos de error

## Future Enhancements

### Fase 6 (Futuro)

1. **Guardado de Partidas**
   - Base de datos (PostgreSQL/MongoDB)
   - Sistema de usuarios
   - Historial de partidas

2. **Análisis Post-Partida**
   - Evaluación de cada movimiento
   - Identificación de errores
   - Sugerencias de mejora

3. **Modo Online**
   - WebSockets para juego en tiempo real
   - Matchmaking
   - Chat entre jugadores

4. **Entrenamiento**
   - Puzzles tácticos
   - Lecciones interactivas
   - Progreso del usuario

5. **Variantes de Ajedrez**
   - Chess960 (Fischer Random)
   - Ajedrez rápido/blitz
   - Variantes personalizadas
