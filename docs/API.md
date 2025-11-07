# Documentación de API - Rechess

## Visión General

Rechess utiliza Next.js API Routes para manejar operaciones del servidor, principalmente para interactuar con servicios de IA (Gemini/Ollama) y gestionar el estado de las partidas. Todas las API keys están protegidas en el servidor y nunca se exponen al cliente.

## Base URL

```
Desarrollo: http://localhost:3000/api
Producción: https://tu-dominio.com/api
```

## Autenticación

Actualmente, las APIs no requieren autenticación. En futuras versiones con guardado de partidas y usuarios, se implementará autenticación basada en tokens.

## Endpoints

### 1. AI Endpoints

#### POST /api/ai/move

Obtiene un movimiento de la IA según el nivel de dificultad especificado.

**Request**

```http
POST /api/ai/move
Content-Type: application/json
```

```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "difficulty": "medio",
  "gamePhase": "opening",
  "moveHistory": ["e2e4", "e7e5"],
  "legalMoves": ["d2d4", "g1f3", "f1c4", "d1h5"],
  "thinkTime": 2000
}
```

**Parámetros**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `fen` | string | Sí | Posición actual en formato FEN |
| `difficulty` | string | Sí | Nivel de dificultad: `"facil"`, `"medio"`, `"dificil"`, `"claseMundial"`, `"experto"` |
| `gamePhase` | string | No | Fase del juego: `"opening"`, `"middlegame"`, `"endgame"`. Default: `"middlegame"` |
| `moveHistory` | string[] | No | Historial de movimientos en notación UCI. Default: `[]` |
| `legalMoves` | string[] | Sí | Lista de movimientos legales en notación UCI |
| `thinkTime` | number | No | Tiempo mínimo de "pensamiento" en ms. Default: según dificultad |

**Response (Success - 200)**

```json
{
  "move": "g1f3",
  "confidence": 0.85,
  "evaluation": 0.3,
  "model": "gemini-1.5-flash",
  "thinkTime": 1847,
  "isFallback": false
}
```

**Campos de Respuesta**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `move` | string | Movimiento en notación UCI (e.g., "e2e4", "e7e8q") |
| `confidence` | number | Confianza del modelo (0-1) |
| `evaluation` | number | Evaluación de la posición (opcional, positivo = ventaja blancas) |
| `model` | string | Modelo de IA utilizado |
| `thinkTime` | number | Tiempo real de cálculo en ms |
| `isFallback` | boolean | `true` si se usó movimiento aleatorio por fallo de IA |

**Response (Error - 400)**

```json
{
  "error": "Missing required fields",
  "details": "fen and legalMoves are required"
}
```

**Response (Error - 500)**

```json
{
  "error": "Failed to get AI move",
  "details": "API timeout after 3 retries"
}
```

**Códigos de Estado**

| Código | Descripción |
|--------|-------------|
| 200 | Movimiento obtenido exitosamente |
| 400 | Parámetros inválidos o faltantes |
| 429 | Rate limit excedido |
| 500 | Error interno del servidor o fallo de IA |

**Ejemplo de Uso**

```typescript
async function getAIMove(fen: string, difficulty: string, legalMoves: string[]) {
  const response = await fetch('/api/ai/move', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fen,
      difficulty,
      gamePhase: 'middlegame',
      moveHistory: [],
      legalMoves,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}
```

**Notas**

- El endpoint implementa reintentos automáticos (hasta 3 intentos) en caso de timeout o respuesta inválida
- Si todos los reintentos fallan, devuelve un movimiento aleatorio válido con `isFallback: true`
- El tiempo de respuesta varía según la dificultad y la complejidad de la posición
- Los prompts son diferentes para cada nivel de dificultad, resultando en comportamiento distintivo

---

#### POST /api/ai/analyze

Analiza una posición de ajedrez y proporciona evaluación detallada.

**Request**

```http
POST /api/ai/analyze
Content-Type: application/json
```

```json
{
  "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  "difficulty": "experto",
  "question": "¿Cuál es el mejor plan para las blancas?"
}
```

**Parámetros**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `fen` | string | Sí | Posición a analizar en formato FEN |
| `difficulty` | string | No | Nivel de análisis. Default: `"experto"` |
| `question` | string | No | Pregunta específica sobre la posición |

**Response (Success - 200)**

```json
{
  "analysis": "Las blancas tienen ventaja de desarrollo. El mejor plan es completar el desarrollo con d3 y 0-0, luego presionar en el centro con d4.",
  "evaluation": 0.5,
  "bestMoves": ["d2d3", "e1g1", "d3d4"],
  "threats": ["Posible Ng4 atacando f2"],
  "model": "gemini-1.5-pro"
}
```

**Códigos de Estado**

| Código | Descripción |
|--------|-------------|
| 200 | Análisis completado exitosamente |
| 400 | FEN inválido |
| 500 | Error en el análisis |

---

### 2. Game Endpoints

#### POST /api/game/create

Crea una nueva partida con la configuración especificada.

**Request**

```http
POST /api/game/create
Content-Type: application/json
```

```json
{
  "mode": "ai",
  "difficulty": "medio",
  "playerColor": "w",
  "timeControl": {
    "initial": 10,
    "increment": 5
  }
}
```

**Parámetros**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `mode` | string | Sí | Modo de juego: `"pvp"` o `"ai"` |
| `difficulty` | string | Condicional | Requerido si `mode === "ai"`. Nivel de dificultad |
| `playerColor` | string | Condicional | Requerido si `mode === "ai"`. Color del jugador: `"w"` o `"b"` |
| `timeControl` | object | No | Configuración de tiempo |
| `timeControl.initial` | number | No | Minutos iniciales por jugador |
| `timeControl.increment` | number | No | Segundos de incremento por movimiento |

**Response (Success - 200)**

```json
{
  "id": "game_abc123xyz",
  "status": "waiting",
  "settings": {
    "mode": "ai",
    "difficulty": "medio",
    "playerColor": "w",
    "timeControl": {
      "initial": 10,
      "increment": 5
    }
  },
  "state": {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "turn": "w",
    "isGameOver": false
  },
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Códigos de Estado**

| Código | Descripción |
|--------|-------------|
| 200 | Partida creada exitosamente |
| 400 | Configuración inválida |
| 500 | Error al crear partida |

---

#### POST /api/game/move

Realiza un movimiento en una partida existente.

**Request**

```http
POST /api/game/move
Content-Type: application/json
```

```json
{
  "gameId": "game_abc123xyz",
  "from": "e2",
  "to": "e4",
  "promotion": null
}
```

**Parámetros**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `gameId` | string | Sí | ID de la partida |
| `from` | string | Sí | Casilla de origen (e.g., "e2") |
| `to` | string | Sí | Casilla de destino (e.g., "e4") |
| `promotion` | string | No | Pieza de promoción: `"q"`, `"r"`, `"b"`, `"n"` |

**Response (Success - 200)**

```json
{
  "success": true,
  "move": {
    "from": "e2",
    "to": "e4",
    "san": "e4",
    "piece": { "type": "p", "color": "w" }
  },
  "state": {
    "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "turn": "b",
    "isCheck": false,
    "isGameOver": false
  }
}
```

**Response (Error - 400)**

```json
{
  "error": "Invalid move",
  "details": "Move e2e5 is not legal in current position"
}
```

**Códigos de Estado**

| Código | Descripción |
|--------|-------------|
| 200 | Movimiento realizado exitosamente |
| 400 | Movimiento inválido |
| 404 | Partida no encontrada |
| 500 | Error al procesar movimiento |

---

### 3. Gemini Coordinator Endpoint

#### POST /api/gemini/coordinator

Endpoint interno para coordinar llamadas a la API de Gemini.

**Nota**: Este endpoint es usado internamente por AIService y no debe ser llamado directamente desde el cliente.

---

### 4. Ollama Endpoint

#### POST /api/ollama

Endpoint para interactuar con modelos Ollama locales.

**Request**

```http
POST /api/ollama
Content-Type: application/json
```

```json
{
  "model": "llama2",
  "prompt": "Analiza esta posición de ajedrez...",
  "stream": false
}
```

**Response (Success - 200)**

```json
{
  "response": "El mejor movimiento es...",
  "model": "llama2",
  "done": true
}
```

---

## Rate Limiting

Para prevenir abuso, se implementa rate limiting en los endpoints de IA:

- **Límite**: 30 requests por minuto por IP
- **Ventana**: 60 segundos
- **Response cuando se excede**: 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 45
}
```

## Manejo de Errores

Todos los endpoints siguen un formato consistente de errores:

```json
{
  "error": "Descripción breve del error",
  "details": "Información adicional (opcional)",
  "code": "ERROR_CODE (opcional)"
}
```

### Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| `INVALID_FEN` | FEN proporcionado es inválido |
| `INVALID_MOVE` | Movimiento no es legal |
| `INVALID_DIFFICULTY` | Nivel de dificultad no reconocido |
| `AI_TIMEOUT` | La IA no respondió a tiempo |
| `AI_ERROR` | Error en el servicio de IA |
| `GAME_NOT_FOUND` | Partida no encontrada |
| `GAME_OVER` | La partida ya terminó |
| `WRONG_TURN` | No es el turno del jugador |

## Validación de Entrada

Todos los endpoints validan la entrada usando Zod schemas:

### FEN Validation
```typescript
const fenRegex = /^[rnbqkpRNBQKP1-8\/\s]+$/;
```

### Difficulty Validation
```typescript
const validDifficulties = ['facil', 'medio', 'dificil', 'claseMundial', 'experto'];
```

### Move Validation
```typescript
const moveRegex = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
```

## Seguridad

### API Keys

La API key de Gemini se almacena en variables de entorno y nunca se expone al cliente:

```env
GEMINI_API_KEY=tu_api_key_aqui
```

### CORS

En producción, CORS está configurado para permitir solo requests desde el dominio de la aplicación.

### Input Sanitization

Todas las entradas se sanitizan para prevenir inyección de código:

```typescript
function sanitizeAIResponse(response: string): string {
  const movePattern = /[a-h][1-8][a-h][1-8][qrbn]?/;
  const match = response.match(movePattern);
  return match ? match[0] : '';
}
```

## Ejemplos de Integración

### React Hook para AI Move

```typescript
import { useState } from 'react';

export function useAIMove() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestMove = async (
    fen: string,
    difficulty: string,
    legalMoves: string[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fen,
          difficulty,
          legalMoves,
          gamePhase: 'middlegame',
          moveHistory: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      return data.move;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { requestMove, loading, error };
}
```

### Fetch con Retry Logic

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      // Si es error del servidor, reintentar
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      // Si es error del cliente, no reintentar
      return response;
    } catch (error) {
      lastError = error as Error;
      
      // Esperar antes de reintentar (backoff exponencial)
      if (i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }

  throw lastError!;
}
```

## Testing

### Ejemplo de Test para API Endpoint

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('POST /api/ai/move', () => {
  it('should return a valid move', async () => {
    const response = await fetch('/api/ai/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        difficulty: 'medio',
        legalMoves: ['e2e4', 'd2d4', 'g1f3'],
      }),
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('move');
    expect(['e2e4', 'd2d4', 'g1f3']).toContain(data.move);
  });

  it('should return 400 for missing parameters', async () => {
    const response = await fetch('/api/ai/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        difficulty: 'medio',
      }),
    });

    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});
```

## Changelog

### v1.0.0 (Actual)
- Endpoint `/api/ai/move` con soporte para 5 niveles de dificultad
- Endpoint `/api/ai/analyze` para análisis de posiciones
- Endpoints `/api/game/create` y `/api/game/move` para gestión de partidas
- Rate limiting básico
- Validación con Zod

### Futuras Versiones
- Autenticación de usuarios
- Guardado persistente de partidas
- WebSocket para juego en tiempo real
- Análisis post-partida
- Exportación de partidas en PGN

## Soporte

Para reportar problemas o sugerir mejoras en la API, por favor abre un issue en el repositorio de GitHub.

## Referencias

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Zod Validation](https://zod.dev/)
