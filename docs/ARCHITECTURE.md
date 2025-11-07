# Arquitectura del Sistema - Rechess

## Visión General

Rechess es una aplicación de ajedrez profesional desarrollada con React, TypeScript y Next.js 14 (App Router). El sistema ofrece modos de juego PvP local y PvE contra IA utilizando modelos de lenguaje (Gemini/Ollama), con una arquitectura modular que separa claramente las responsabilidades entre el motor de ajedrez, la lógica de IA, la gestión de estado y la interfaz de usuario.

## Principios de Diseño

1. **Separación de Responsabilidades**: Motor de ajedrez, lógica de IA, gestión de estado y UI completamente desacoplados
2. **Aprovechamiento de chess.js**: Utilizar la librería existente que implementa todas las reglas oficiales del ajedrez
3. **IA Diferenciada**: Cada nivel de dificultad tiene prompts únicos y comportamiento distintivo
4. **Testabilidad**: Toda la lógica de negocio es testeable sin dependencias de UI
5. **Extensibilidad**: Facilitar la adición de nuevas características sin modificar código existente
6. **Robustez**: Manejo de errores en múltiples niveles con fallbacks apropiados

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Board.tsx  │  │ GameInfo.tsx │  │ MoveHistory  │      │
│  │   Lobby.tsx  │  │ GameEnd.tsx  │  │ Captured.tsx │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼──────────────┐
│         │      Hooks Layer (React)            │              │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌───────▼──────┐      │
│  │useChessGame  │  │ useChessAI   │  │useGameTimer  │      │
│  │              │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
└─────────┼──────────────────┼──────────────────────────────────┘
          │                  │
┌─────────┼──────────────────┼──────────────────────────────────┐
│         │    Business Logic Layer                             │
│  ┌──────▼──────────┐  ┌───▼──────────────┐                   │
│  │ GameStateManager│  │   AIService      │                   │
│  │                 │  │                  │                   │
│  └──────┬──────────┘  └───┬──────────────┘                   │
│         │                  │                                  │
│  ┌──────▼──────────┐  ┌───▼──────────────┐                   │
│  │  ChessEngine    │  │  PromptBuilder   │                   │
│  │  (chess.js)     │  │  DifficultyConfig│                   │
│  └─────────────────┘  └──────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
          │                  │
┌─────────┼──────────────────┼──────────────────────────────────┐
│         │      API Layer (Next.js Routes)                     │
│  ┌──────▼──────────┐  ┌───▼──────────────┐                   │
│  │ /api/ai/move    │  │ /api/ai/analyze  │                   │
│  │ /api/game/move  │  │ /api/game/create │                   │
│  └─────────────────┘  └──────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

## Capas de la Arquitectura

### 1. UI Layer (Capa de Presentación)

**Ubicación**: `src/components/`, `src/app/`

**Responsabilidad**: Renderizar la interfaz de usuario y manejar interacciones del usuario.

**Componentes Principales**:

- **Board.tsx**: Tablero de ajedrez con resaltado de movimientos legales, animaciones y drag & drop
- **GameInfo.tsx**: Información del estado del juego (turno, jaque, temporizadores)
- **MoveHistory.tsx**: Historial de movimientos en notación algebraica estándar
- **CapturedPieces.tsx**: Piezas capturadas y ventaja material
- **GameEndModal.tsx**: Modal de fin de partida con opciones
- **Lobby.tsx**: Configuración de partida (modo, dificultad, color)
- **AIThinkingIndicator.tsx**: Indicador visual cuando la IA está calculando

**Características**:
- Componentes React funcionales con TypeScript
- Uso de Tailwind CSS para estilos
- Accesibilidad (ARIA, navegación por teclado)
- Animaciones suaves con CSS/Framer Motion

### 2. Hooks Layer (Capa de Lógica de Estado)

**Ubicación**: `src/hooks/`

**Responsabilidad**: Gestionar el estado de React y conectar la UI con la lógica de negocio.

**Hooks Principales**:

- **useChessGame**: Gestiona el estado completo de la partida
  - Inicializar/reiniciar partida
  - Realizar movimientos
  - Deshacer movimientos
  - Detectar finales de partida
  
- **useChessAI**: Gestiona la interacción con la IA
  - Solicitar movimientos de IA
  - Manejar errores y reintentos
  - Mostrar indicador de carga
  
- **useGameTimer**: Gestiona temporizadores de partida
  - Tiempo por jugador
  - Incremento por movimiento
  - Detección de timeout

- **useDragAndDrop**: Gestiona drag & drop de piezas
  - Arrastrar piezas
  - Validar drops
  - Animaciones

**Características**:
- Custom hooks reutilizables
- Separación de lógica de estado de la UI
- Manejo de efectos secundarios (API calls, timers)

### 3. Business Logic Layer (Capa de Lógica de Negocio)

**Ubicación**: `src/lib/`

**Responsabilidad**: Implementar la lógica central del juego, validaciones y reglas.

#### 3.1 ChessEngine

**Ubicación**: `src/lib/chess/ChessEngine.ts`

**Responsabilidad**: Wrapper de chess.js que expone funcionalidad del motor de ajedrez.

**Métodos Principales**:
```typescript
class ChessEngine {
  // Estado del juego
  getGameState(): GameState
  getFen(): string
  getPgn(): string
  
  // Movimientos
  makeMove(from: Square, to: Square, promotion?: PieceType): boolean
  getLegalMoves(square?: Square): Move[]
  undoMove(): boolean
  
  // Validaciones
  isCheck(): boolean
  isCheckmate(): boolean
  isStalemate(): boolean
  isDraw(): boolean
  isThreefoldRepetition(): boolean
  isInsufficientMaterial(): boolean
  
  // Utilidades
  getPiece(square: Square): ChessPiece | null
  getCapturedPieces(): CapturedPieces
  getGamePhase(): 'opening' | 'middlegame' | 'endgame'
  loadFen(fen: string): boolean
  reset(): void
}
```

**Nota Importante**: chess.js ya implementa TODAS las reglas oficiales del ajedrez correctamente. ChessEngine solo expone esta funcionalidad de manera consistente.

#### 3.2 GameStateManager

**Ubicación**: `src/lib/game/GameStateManager.ts`

**Responsabilidad**: Gestionar el estado completo de la partida y coordinar entre ChessEngine y AIService.

**Métodos Principales**:
```typescript
class GameStateManager {
  // Gestión de partida
  createGame(settings: GameSettings): void
  startGame(): void
  pauseGame(): void
  resumeGame(): void
  resetGame(): void
  
  // Movimientos
  makeMove(from: string, to: string, promotion?: string): Promise<boolean>
  makeAIMove(): Promise<boolean>
  undoLastMove(): boolean
  undoLastTwoMoves(): boolean
  
  // Estado
  getGameState(): GameState | null
  getGamePhase(): 'opening' | 'middlegame' | 'endgame'
  checkGameEnd(): GameEndReason | null
  
  // Exportación
  exportPGN(includeComments?: boolean): string
  exportFEN(): string
}
```

#### 3.3 AIService

**Ubicación**: `src/lib/ai/AIService.ts`

**Responsabilidad**: Coordinar llamadas a la API de IA con manejo robusto de errores.

**Métodos Principales**:
```typescript
class AIService {
  // Solicitar movimiento
  async requestMove(request: AIMoveRequest): Promise<AIMoveResponse>
  async requestMoveWithRetry(request: AIMoveRequest, maxRetries: number): Promise<AIMoveResponse>
  
  // Validación y parseo
  validateAIMove(move: string, legalMoves: string[]): boolean
  parseAIResponse(response: string): string | null
}
```

**Estrategia de Manejo de Errores**:
1. Timeout → Reintentar hasta 3 veces
2. Movimiento inválido → Solicitar nuevo movimiento
3. Formato incorrecto → Parsear respuesta buscando patrones válidos
4. Fallo total → Fallback a movimiento aleatorio (con autorización del usuario)

#### 3.4 PromptBuilder

**Ubicación**: `src/lib/ai/PromptBuilder.ts`

**Responsabilidad**: Construir prompts específicos para cada nivel de dificultad.

**Niveles de Dificultad**:
- **Fácil (ELO 500-900)**: Movimientos simples, errores ocasionales, sin análisis profundo
- **Medio (ELO 1000-1600)**: Tácticas básicas, análisis 1-2 movimientos adelante
- **Avanzado (ELO 1800-2400)**: Estrategia avanzada, análisis 2-5 movimientos adelante
- **Experto/GM (ELO 2600+)**: Análisis preventivo profundo, 6+ movimientos adelante

**Métodos**:
```typescript
class PromptBuilder {
  static buildPrompt(request: AIMoveRequest): string
  private static buildEasyPrompt(fen: string, legalMoves: string[]): string
  private static buildMediumPrompt(fen: string, legalMoves: string[], gamePhase: string): string
  private static buildAdvancedPrompt(fen: string, legalMoves: string[], gamePhase: string, history: string[]): string
  private static buildExpertPrompt(fen: string, legalMoves: string[], gamePhase: string, history: string[]): string
}
```

#### 3.5 InputValidator

**Ubicación**: `src/lib/validation/InputValidator.ts`

**Responsabilidad**: Validar entrada de usuario en múltiples niveles.

**Validaciones**:
- Verificar que el jugador solo mueva sus propias piezas
- Verificar que el movimiento sea legal
- Validar selección de pieza de promoción
- Verificar que sea el turno del jugador

### 4. API Layer (Capa de API)

**Ubicación**: `src/app/api/`

**Responsabilidad**: Endpoints de Next.js para operaciones del servidor.

**Endpoints Principales**:

#### POST /api/ai/move
Obtener movimiento de la IA según nivel de dificultad.

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
  evaluation?: number
  model: string
  thinkTime: number
  isFallback?: boolean
}
```

#### POST /api/ai/analyze
Analizar una posición y proporcionar evaluación.

#### POST /api/game/create
Crear una nueva partida.

#### POST /api/game/move
Realizar un movimiento en una partida.

## Flujo de Datos

### Flujo de Movimiento del Jugador

```
1. Usuario hace clic en pieza (Board.tsx)
   ↓
2. handleSquareClick en Board
   ↓
3. InputValidator.validatePieceOwnership()
   ↓
4. Mostrar movimientos legales (ChessEngine.getLegalMoves())
   ↓
5. Usuario hace clic en casilla destino
   ↓
6. InputValidator.validateMove()
   ↓
7. useChessGame.makeMove()
   ↓
8. GameStateManager.makeMove()
   ↓
9. ChessEngine.makeMove()
   ↓
10. Actualizar estado de React
   ↓
11. Re-renderizar Board con animación
```

### Flujo de Movimiento de IA

```
1. Turno de IA detectado
   ↓
2. useChessAI.requestAIMove()
   ↓
3. Mostrar AIThinkingIndicator
   ↓
4. GameStateManager.makeAIMove()
   ↓
5. AIService.requestMoveWithRetry()
   ↓
6. PromptBuilder.buildPrompt() (según dificultad)
   ↓
7. POST /api/ai/move
   ↓
8. Llamada a Gemini/Ollama API
   ↓
9. AIService.parseAIResponse()
   ↓
10. AIService.validateAIMove()
   ↓
11. ChessEngine.makeMove()
   ↓
12. Actualizar estado de React
   ↓
13. Ocultar AIThinkingIndicator
   ↓
14. Re-renderizar Board con animación
```

## Modelos de Datos

### Tipos Principales

```typescript
// Tipos de chess.js
type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k'
type PieceColor = 'w' | 'b'

interface ChessPiece {
  type: PieceType
  color: PieceColor
}

interface Move {
  from: Square
  to: Square
  piece: ChessPiece
  captured?: ChessPiece
  promotion?: PieceType
  flags: string
  san: string    // Notación algebraica estándar
  lan: string    // Notación larga
  before: string // FEN antes del movimiento
  after: string  // FEN después del movimiento
}

// Estado del juego
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

// Configuración de partida
interface GameSettings {
  mode: 'pvp' | 'ai'
  difficulty?: DifficultyLevel
  playerColor?: PieceColor
  timeControl?: {
    initial: number    // minutos iniciales
    increment: number  // segundos de incremento
  }
}

// Niveles de dificultad
type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'claseMundial' | 'experto'
```

## Estrategia de Testing

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
```

**Ubicación**: `src/__tests__/`

**Herramientas**:
- Vitest para unit e integration tests
- React Testing Library para componentes
- Coverage con v8 provider

**Archivos de Test**:
- `chess-engine.test.ts`: Tests del motor de ajedrez
- `ai-service.test.ts`: Tests del servicio de IA
- `prompt-builder.test.ts`: Tests de construcción de prompts
- `game-state-manager.test.ts`: Tests de gestión de estado
- `input-validator.test.ts`: Tests de validación
- `integration/`: Tests de integración

## Consideraciones de Seguridad

### 1. Protección de API Keys
- API keys almacenadas en variables de entorno
- Nunca expuestas en el cliente
- Todas las llamadas a IA desde server-side (API routes)

### 2. Validación de Entrada
- Validación con Zod en API routes
- Sanitización de respuestas de IA
- Límites en tamaño de datos (historial, movimientos)

### 3. Rate Limiting
- Límite de requests por IP
- Prevención de abuso de API de IA

## Consideraciones de Performance

### 1. Optimización de Renderizado
- Memoización de componentes con React.memo
- useCallback para funciones
- useMemo para cálculos costosos

### 2. Lazy Loading
- Componentes pesados cargados bajo demanda
- Suspense para loading states

### 3. Caché de IA
- Caché de posiciones evaluadas
- Reducir llamadas redundantes a API

## Extensibilidad

### Puntos de Extensión

1. **Nuevos Niveles de Dificultad**: Agregar métodos en PromptBuilder
2. **Nuevos Modos de Juego**: Extender GameSettings y GameStateManager
3. **Análisis Post-Partida**: Agregar AIService.analyzeGame()
4. **Guardado de Partidas**: Agregar persistencia en GameStateManager
5. **Modo Online**: Agregar WebSocket layer

## Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Next.js 14 (App Router)
- **Estilos**: Tailwind CSS
- **Motor de Ajedrez**: chess.js
- **IA**: Google Gemini API, Ollama (local)
- **Testing**: Vitest, React Testing Library
- **Validación**: Zod
- **Animaciones**: CSS Transitions, Framer Motion (opcional)

## Estructura de Directorios

```
rechess/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── ai/           # Endpoints de IA
│   │   │   └── game/         # Endpoints de juego
│   │   ├── game/             # Página de juego
│   │   ├── lobby/            # Página de lobby
│   │   └── layout.tsx        # Layout principal
│   ├── components/            # Componentes React
│   │   ├── chess/            # Componentes de ajedrez
│   │   ├── layout/           # Componentes de layout
│   │   └── ui/               # Componentes UI genéricos
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Lógica de negocio
│   │   ├── ai/               # Servicio de IA
│   │   ├── chess/            # Motor de ajedrez
│   │   ├── game/             # Gestión de partidas
│   │   └── validation/       # Validaciones
│   ├── types/                 # Definiciones de tipos
│   ├── styles/                # Estilos globales
│   └── __tests__/             # Tests
├── docs/                      # Documentación
├── public/                    # Archivos estáticos
└── .env.local                 # Variables de entorno
```

## Referencias

- [chess.js Documentation](https://github.com/jhlywa/chess.js)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hooks](https://react.dev/reference/react)
- [Vitest](https://vitest.dev/)
- [Gemini API](https://ai.google.dev/docs)
