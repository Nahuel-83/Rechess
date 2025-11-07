# Guía de Contribución - Rechess

¡Gracias por tu interés en contribuir a Rechess! Esta guía te ayudará a comenzar y asegurará que tus contribuciones sean consistentes con el proyecto.

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Testing](#proceso-de-testing)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)
- [Preguntas Frecuentes](#preguntas-frecuentes)

## Código de Conducta

Este proyecto se adhiere a un código de conducta que esperamos que todos los contribuyentes sigan:

- Sé respetuoso y considerado con otros contribuyentes
- Acepta críticas constructivas con gracia
- Enfócate en lo que es mejor para la comunidad
- Muestra empatía hacia otros miembros de la comunidad

## Cómo Contribuir

Hay muchas formas de contribuir a Rechess:

1. **Reportar bugs**: Si encuentras un bug, abre un issue con detalles
2. **Sugerir mejoras**: Propón nuevas características o mejoras
3. **Escribir código**: Implementa nuevas características o corrige bugs
4. **Mejorar documentación**: Ayuda a mejorar o traducir la documentación
5. **Escribir tests**: Aumenta la cobertura de tests
6. **Revisar PRs**: Ayuda a revisar pull requests de otros contribuyentes

## Configuración del Entorno de Desarrollo

### Requisitos Previos

- Node.js 18.x o superior
- npm 9.x o superior
- Git

### Instalación

1. **Fork el repositorio**

   Haz clic en el botón "Fork" en la parte superior derecha de la página del repositorio.

2. **Clona tu fork**

   ```bash
   git clone https://github.com/tu-usuario/rechess.git
   cd rechess
   ```

3. **Agrega el repositorio original como upstream**

   ```bash
   git remote add upstream https://github.com/original-usuario/rechess.git
   ```

4. **Instala las dependencias**

   ```bash
   npm install
   ```

5. **Configura las variables de entorno**

   Copia el archivo de ejemplo y configura tus API keys:

   ```bash
   cp .env.example .env.local
   ```

   Edita `.env.local` y agrega tu API key:

   ```env
   GEMINI_API_KEY=tu_api_key_aqui
   ```

6. **Inicia el servidor de desarrollo**

   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`

### Configuración de Gemini AI

La aplicación usa exclusivamente Gemini AI para todos los niveles de dificultad:

1. Obtén una API key de Google AI Studio: [aistudio.google.com](https://aistudio.google.com)
2. Agrega la key a tu archivo `.env.local`
3. La aplicación usará Gemini para generar movimientos de IA en todos los niveles

## Estructura del Proyecto

```
rechess/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── game/              # Página de juego
│   │   └── lobby/             # Página de lobby
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
│   ├── types/                 # Definiciones de tipos TypeScript
│   ├── styles/                # Estilos globales
│   └── __tests__/             # Tests
├── docs/                      # Documentación
├── public/                    # Archivos estáticos
└── .env.local                 # Variables de entorno (no commitear)
```

### Convenciones de Nombres

- **Componentes React**: PascalCase (e.g., `Board.tsx`, `GameInfo.tsx`)
- **Hooks**: camelCase con prefijo `use` (e.g., `useChessGame.ts`)
- **Utilidades**: camelCase (e.g., `validateMove.ts`)
- **Tipos**: PascalCase (e.g., `GameState`, `ChessPiece`)
- **Constantes**: UPPER_SNAKE_CASE (e.g., `PIECE_VALUES`)

## Estándares de Código

### TypeScript

- Usa TypeScript estricto (no `any` sin justificación)
- Define tipos explícitos para props de componentes
- Usa interfaces para objetos, types para uniones/intersecciones
- Documenta funciones públicas con JSDoc

**Ejemplo de componente bien tipado:**

```typescript
interface BoardProps {
  position: Record<string, ChessPiece | null>;
  legalMoves: string[];
  selectedSquare: string | null;
  onSquareClick: (square: string) => void;
  flipped?: boolean;
}

/**
 * Componente de tablero de ajedrez con soporte para drag & drop.
 * 
 * @param props - Props del componente
 * @returns Elemento React del tablero
 */
export function Board({
  position,
  legalMoves,
  selectedSquare,
  onSquareClick,
  flipped = false,
}: BoardProps) {
  // Implementación...
}
```

### React

- Usa componentes funcionales con hooks
- Memoiza componentes costosos con `React.memo`
- Usa `useCallback` para funciones pasadas como props
- Usa `useMemo` para cálculos costosos
- Mantén componentes pequeños y enfocados (< 200 líneas)

**Ejemplo de optimización:**

```typescript
const Square = React.memo(({ 
  square, 
  piece, 
  isSelected, 
  onClick 
}: SquareProps) => {
  // Implementación...
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian props relevantes
  return (
    prevProps.piece === nextProps.piece &&
    prevProps.isSelected === nextProps.isSelected
  );
});
```

### Estilos

- Usa Tailwind CSS para estilos
- Mantén clases ordenadas (layout → spacing → colors → typography)
- Extrae clases repetidas a componentes reutilizables
- Usa CSS modules solo para animaciones complejas

**Ejemplo:**

```tsx
<div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg shadow-md">
  {/* Contenido */}
</div>
```

### Linting y Formateo

El proyecto usa ESLint y Prettier para mantener consistencia:

```bash
# Verificar linting
npm run lint

# Corregir problemas automáticamente
npm run lint:fix

# Formatear código
npm run format
```

**Configuración recomendada para VS Code:**

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Proceso de Testing

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests de un archivo específico
npm test chess-engine.test.ts
```

### Escribir Tests

Todos los tests deben estar en `src/__tests__/` y seguir estas convenciones:

**Unit Tests:**

```typescript
import { describe, it, expect } from 'vitest';
import { ChessEngine } from '@/lib/chess/ChessEngine';

describe('ChessEngine', () => {
  describe('makeMove', () => {
    it('should allow legal pawn moves', () => {
      const engine = new ChessEngine();
      const result = engine.makeMove('e2', 'e4');
      expect(result).toBe(true);
    });

    it('should reject illegal pawn moves', () => {
      const engine = new ChessEngine();
      const result = engine.makeMove('e2', 'e5');
      expect(result).toBe(false);
    });
  });
});
```

**Integration Tests:**

```typescript
import { describe, it, expect } from 'vitest';
import { GameStateManager } from '@/lib/game/GameStateManager';

describe('Game Flow Integration', () => {
  it('should complete a full PvP game', async () => {
    const manager = new GameStateManager();
    manager.createGame({ mode: 'pvp' });
    manager.startGame();

    await manager.makeMove('e2', 'e4');
    await manager.makeMove('e7', 'e5');

    const state = manager.getGameState();
    expect(state?.history.length).toBe(2);
  });
});
```

### Cobertura de Tests

Mantenemos una cobertura mínima de:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

Los PRs que reduzcan la cobertura serán rechazados a menos que haya una justificación válida.

## Proceso de Pull Request

### Antes de Crear un PR

1. **Sincroniza tu fork con upstream**

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Crea una rama para tu feature/fix**

   ```bash
   git checkout -b feature/nombre-descriptivo
   # o
   git checkout -b fix/descripcion-del-bug
   ```

3. **Haz commits atómicos con mensajes descriptivos**

   Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   git commit -m "feat: add pawn promotion modal"
   git commit -m "fix: correct castling validation"
   git commit -m "docs: update API documentation"
   git commit -m "test: add tests for AIService"
   git commit -m "refactor: simplify move validation logic"
   ```

   **Tipos de commit:**
   - `feat`: Nueva característica
   - `fix`: Corrección de bug
   - `docs`: Cambios en documentación
   - `style`: Cambios de formato (no afectan funcionalidad)
   - `refactor`: Refactorización de código
   - `test`: Agregar o modificar tests
   - `chore`: Tareas de mantenimiento

4. **Asegúrate de que todos los tests pasen**

   ```bash
   npm test
   npm run lint
   ```

5. **Actualiza la documentación si es necesario**

### Crear el Pull Request

1. **Push tu rama a tu fork**

   ```bash
   git push origin feature/nombre-descriptivo
   ```

2. **Abre un PR en GitHub**

   - Ve a tu fork en GitHub
   - Haz clic en "Compare & pull request"
   - Completa la plantilla de PR

3. **Plantilla de PR**

   ```markdown
   ## Descripción
   Breve descripción de los cambios realizados.

   ## Tipo de cambio
   - [ ] Bug fix (cambio que corrige un issue)
   - [ ] Nueva característica (cambio que agrega funcionalidad)
   - [ ] Breaking change (cambio que rompe compatibilidad)
   - [ ] Documentación

   ## ¿Cómo se ha probado?
   Describe las pruebas que realizaste.

   ## Checklist
   - [ ] Mi código sigue los estándares del proyecto
   - [ ] He realizado una auto-revisión de mi código
   - [ ] He comentado mi código en áreas complejas
   - [ ] He actualizado la documentación
   - [ ] Mis cambios no generan nuevas advertencias
   - [ ] He agregado tests que prueban mi fix/feature
   - [ ] Todos los tests nuevos y existentes pasan
   - [ ] He verificado que no hay conflictos con main
   ```

### Revisión del PR

- Un mantenedor revisará tu PR
- Puede solicitar cambios o aclaraciones
- Realiza los cambios solicitados y haz push a la misma rama
- Una vez aprobado, tu PR será merged

### Después del Merge

1. **Elimina tu rama local**

   ```bash
   git checkout main
   git branch -d feature/nombre-descriptivo
   ```

2. **Sincroniza tu fork**

   ```bash
   git pull upstream main
   git push origin main
   ```

## Reportar Bugs

### Antes de Reportar

1. Verifica que el bug no haya sido reportado ya
2. Asegúrate de estar usando la última versión
3. Intenta reproducir el bug en un entorno limpio

### Cómo Reportar

Abre un issue con la siguiente información:

```markdown
## Descripción del Bug
Descripción clara y concisa del bug.

## Pasos para Reproducir
1. Ve a '...'
2. Haz clic en '...'
3. Observa el error

## Comportamiento Esperado
Qué esperabas que sucediera.

## Comportamiento Actual
Qué sucedió en realidad.

## Screenshots
Si aplica, agrega screenshots.

## Entorno
- OS: [e.g., Windows 11, macOS 14]
- Navegador: [e.g., Chrome 120, Firefox 121]
- Versión de Node: [e.g., 18.17.0]

## Información Adicional
Cualquier otra información relevante.
```

## Sugerir Mejoras

### Antes de Sugerir

1. Verifica que la mejora no haya sido sugerida ya
2. Considera si la mejora beneficia a la mayoría de usuarios
3. Piensa en cómo se implementaría

### Cómo Sugerir

Abre un issue con la siguiente información:

```markdown
## Descripción de la Mejora
Descripción clara de la mejora propuesta.

## Problema que Resuelve
¿Qué problema o limitación actual resuelve?

## Solución Propuesta
Describe cómo funcionaría la mejora.

## Alternativas Consideradas
¿Qué otras soluciones consideraste?

## Información Adicional
Mockups, ejemplos de código, etc.
```

## Áreas que Necesitan Contribuciones

### Alta Prioridad

- [ ] Mejorar cobertura de tests (actualmente ~70%)
- [ ] Optimizar performance del tablero en dispositivos móviles
- [ ] Agregar soporte para temas personalizados
- [ ] Mejorar accesibilidad (ARIA labels, navegación por teclado)

### Media Prioridad

- [ ] Implementar guardado de partidas
- [ ] Agregar análisis post-partida
- [ ] Implementar puzzles tácticos
- [ ] Agregar soporte para Chess960

### Baja Prioridad

- [ ] Modo online con WebSockets
- [ ] Sistema de usuarios y autenticación
- [ ] Traducción a otros idiomas
- [ ] Aplicación móvil nativa

## Preguntas Frecuentes

### ¿Cómo puedo empezar a contribuir?

Busca issues etiquetados con `good first issue` o `help wanted`. Estos son buenos puntos de entrada para nuevos contribuyentes.

### ¿Necesito permiso para trabajar en un issue?

No, pero es buena práctica comentar en el issue que estás trabajando en él para evitar duplicación de esfuerzos.

### ¿Cuánto tiempo toma que revisen mi PR?

Intentamos revisar PRs dentro de 3-5 días hábiles. Si ha pasado más tiempo, siéntete libre de hacer ping en el PR.

### ¿Puedo trabajar en múltiples issues a la vez?

Sí, pero recomendamos enfocarte en uno a la vez para mantener PRs pequeños y fáciles de revisar.

### ¿Qué hago si mi PR tiene conflictos?

Sincroniza tu rama con main y resuelve los conflictos localmente:

```bash
git fetch upstream
git rebase upstream/main
# Resuelve conflictos
git push --force-with-lease origin tu-rama
```

### ¿Puedo contribuir sin saber TypeScript?

Sí, puedes contribuir con:
- Documentación
- Reportar bugs
- Diseño UI/UX
- Traducción
- Revisión de PRs

### ¿Cómo puedo obtener ayuda?

- Abre un issue con la etiqueta `question`
- Comenta en un issue existente
- Revisa la documentación en `/docs`

## Recursos Adicionales

### Documentación

- [Arquitectura del Sistema](./ARCHITECTURE.md)
- [Documentación de API](./API.md)
- [Guía de Testing](../src/__tests__/README.md)

### Tecnologías Utilizadas

- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [chess.js](https://github.com/jhlywa/chess.js)
- [Vitest](https://vitest.dev/)

### Herramientas Recomendadas

- **Editor**: VS Code con extensiones:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)
- **Git GUI**: GitKraken, SourceTree, o GitHub Desktop
- **API Testing**: Postman o Insomnia

## Agradecimientos

¡Gracias por contribuir a Rechess! Tu tiempo y esfuerzo ayudan a hacer este proyecto mejor para todos.

## Licencia

Al contribuir a Rechess, aceptas que tus contribuciones serán licenciadas bajo la misma licencia que el proyecto.

---

**¿Tienes preguntas?** No dudes en abrir un issue o contactar a los mantenedores.

¡Feliz coding! ♟️
