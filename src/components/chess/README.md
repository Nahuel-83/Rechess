# Chess Components

## AIThinkingIndicator

Componente que muestra un indicador visual mientras la IA está calculando su movimiento.

### Props

- `difficulty: DifficultyLevel` - Nivel de dificultad de la IA
- `thinkingTime: number` - Tiempo transcurrido en milisegundos
- `onCancel?: () => void` - Callback opcional para cancelar el cálculo (se muestra después de 10 segundos)

### Ejemplo de uso

```tsx
import { AIThinkingIndicator } from '@/components/chess';

function GameComponent() {
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(0);

  useEffect(() => {
    if (isAIThinking) {
      const interval = setInterval(() => {
        setThinkingTime(prev => prev + 100);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isAIThinking]);

  return (
    <>
      {isAIThinking && (
        <AIThinkingIndicator
          difficulty="medio"
          thinkingTime={thinkingTime}
          onCancel={() => {
            setIsAIThinking(false);
            // Lógica para cancelar la solicitud de IA
          }}
        />
      )}
    </>
  );
}
```

## GameEndModal

Modal que muestra el resultado de la partida con opciones para nueva partida, revisar o exportar PGN.

### Props

- `isOpen: boolean` - Controla si el modal está visible
- `result: GameEndReason` - Tipo de finalización de la partida
- `pgn: string` - Notación PGN de la partida
- `moveCount: number` - Número total de movimientos
- `elapsedTime?: number` - Tiempo total de la partida en segundos (opcional)
- `onNewGame: () => void` - Callback para iniciar nueva partida
- `onReview: () => void` - Callback para revisar la partida
- `onExportPGN: () => void` - Callback después de exportar PGN
- `onClose?: () => void` - Callback opcional para cerrar el modal

### GameEndReason Type

```typescript
type GameEndReason =
  | { type: 'checkmate'; winner: 'w' | 'b' }
  | { type: 'stalemate' }
  | { type: 'threefold_repetition' }
  | { type: 'fifty_move_rule' }
  | { type: 'insufficient_material' }
  | { type: 'timeout'; winner: 'w' | 'b' }
  | { type: 'resignation'; winner: 'w' | 'b' };
```

### Ejemplo de uso

```tsx
import { GameEndModal, GameEndReason } from '@/components/chess';

function GameComponent() {
  const [showEndModal, setShowEndModal] = useState(false);
  const [gameResult, setGameResult] = useState<GameEndReason | null>(null);

  const handleGameEnd = (result: GameEndReason) => {
    setGameResult(result);
    setShowEndModal(true);
  };

  return (
    <>
      {gameResult && (
        <GameEndModal
          isOpen={showEndModal}
          result={gameResult}
          pgn={game.pgn}
          moveCount={game.moveCount}
          elapsedTime={game.elapsedTime}
          onNewGame={() => {
            setShowEndModal(false);
            // Lógica para iniciar nueva partida
          }}
          onReview={() => {
            setShowEndModal(false);
            // Lógica para revisar la partida
          }}
          onExportPGN={() => {
            // El componente maneja la exportación automáticamente
            console.log('PGN exportado');
          }}
          onClose={() => setShowEndModal(false)}
        />
      )}
    </>
  );
}
```

## Características

### AIThinkingIndicator

- ✅ Animación de pensamiento con icono pulsante
- ✅ Muestra el nivel de dificultad activo
- ✅ Contador de tiempo en tiempo real
- ✅ Botón de cancelar que aparece después de 10 segundos
- ✅ Diseño responsive con soporte para modo oscuro
- ✅ Indicadores visuales animados (puntos rebotando)

### GameEndModal

- ✅ Muestra resultado claro con icono apropiado
- ✅ Descripción detallada del tipo de finalización
- ✅ Resumen de la partida (movimientos, tiempo, resultado)
- ✅ Botón para nueva partida
- ✅ Botón para revisar la partida
- ✅ Exportación automática de PGN al hacer clic
- ✅ Diseño responsive con soporte para modo oscuro
- ✅ Animación de entrada suave

## Requisitos Cumplidos

Estos componentes cumplen con los siguientes requisitos del documento de especificación:

- **Requisito 7.4**: Modal de fin de partida con resultado claro
- **Requisito 8.2**: Indicador visual cuando la IA está calculando
- **Requisito 8.4**: Opción de exportar partida en formato PGN
