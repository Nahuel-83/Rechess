# Documentación de Rechess

Bienvenido a la documentación técnica de Rechess, una aplicación profesional de ajedrez desarrollada con React, TypeScript y Next.js.

## Índice de Documentación

### 📐 [Arquitectura del Sistema](./ARCHITECTURE.md)

Documentación completa de la arquitectura de Rechess, incluyendo:

- Visión general del sistema
- Capas de la arquitectura (UI, Hooks, Business Logic, API)
- Componentes principales y sus responsabilidades
- Flujo de datos entre capas
- Modelos de datos y tipos TypeScript
- Estrategia de testing
- Consideraciones de seguridad y performance
- Tecnologías utilizadas

**Ideal para**: Desarrolladores que quieren entender cómo está estructurado el proyecto y cómo interactúan los diferentes componentes.

### 🔌 [Documentación de API](./API.md)

Referencia completa de los endpoints de la API, incluyendo:

- Endpoints de IA (`/api/ai/move`, `/api/ai/analyze`)
- Endpoints de juego (`/api/game/create`, `/api/game/move`)
- Parámetros de request y response
- Códigos de error y manejo de errores
- Ejemplos de uso y integración
- Rate limiting y seguridad
- Validación de entrada

**Ideal para**: Desarrolladores que necesitan integrar con la API o entender cómo funcionan los endpoints.

### 🤝 [Guía de Contribución](./CONTRIBUTING.md)

Guía completa para contribuir al proyecto, incluyendo:

- Configuración del entorno de desarrollo
- Estándares de código (TypeScript, React, estilos)
- Proceso de testing
- Proceso de Pull Request
- Cómo reportar bugs y sugerir mejoras
- Áreas que necesitan contribuciones
- Preguntas frecuentes

**Ideal para**: Desarrolladores que quieren contribuir al proyecto.

## Inicio Rápido

### Para Desarrolladores Nuevos

1. Lee la [Guía de Contribución](./CONTRIBUTING.md) para configurar tu entorno
2. Revisa la [Arquitectura del Sistema](./ARCHITECTURE.md) para entender la estructura
3. Explora el código en `src/` siguiendo los diagramas de arquitectura
4. Busca issues etiquetados con `good first issue` para empezar a contribuir

### Para Integración con API

1. Lee la [Documentación de API](./API.md)
2. Configura tus API keys en `.env.local`
3. Revisa los ejemplos de integración en la documentación
4. Prueba los endpoints con Postman o similar

### Para Entender el Código

1. Comienza con [Arquitectura del Sistema](./ARCHITECTURE.md)
2. Revisa los diagramas de flujo de datos
3. Explora los componentes principales en `src/components/chess/`
4. Lee los tests en `src/__tests__/` para ver ejemplos de uso

## Estructura del Proyecto

```
rechess/
├── docs/                      # 📚 Documentación (estás aquí)
│   ├── README.md             # Este archivo
│   ├── ARCHITECTURE.md       # Arquitectura del sistema
│   ├── API.md                # Documentación de API
│   └── CONTRIBUTING.md       # Guía de contribución
├── src/
│   ├── app/                  # Next.js App Router
│   ├── components/           # Componentes React
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Lógica de negocio
│   ├── types/                # Tipos TypeScript
│   └── __tests__/            # Tests
├── public/                   # Archivos estáticos
└── README.md                 # README principal del proyecto
```

## Conceptos Clave

### Motor de Ajedrez

Rechess utiliza [chess.js](https://github.com/jhlywa/chess.js) como motor base, que implementa todas las reglas oficiales del ajedrez. Nuestro `ChessEngine` es un wrapper que expone esta funcionalidad de manera consistente.

### Sistema de IA

El sistema de IA utiliza modelos de lenguaje (Gemini/Ollama) con prompts diferenciados por nivel de dificultad:

- **Fácil** (ELO 500-900): Movimientos simples, errores ocasionales
- **Medio** (ELO 1000-1600): Tácticas básicas, análisis 1-2 movimientos
- **Avanzado** (ELO 1800-2400): Estrategia avanzada, análisis 2-5 movimientos
- **Experto/GM** (ELO 2600+): Análisis profundo, 6+ movimientos

### Gestión de Estado

El estado del juego se gestiona a través de:

1. **ChessEngine**: Estado del tablero y validaciones
2. **GameStateManager**: Coordinación entre motor y IA
3. **React Hooks**: Estado de UI y efectos secundarios

### Validación de Entrada

La validación ocurre en múltiples niveles:

1. **UI Layer**: Validación visual (resaltar movimientos legales)
2. **InputValidator**: Validación de reglas de juego
3. **ChessEngine**: Validación final con chess.js

## Tecnologías Principales

- **Frontend**: React 18, TypeScript, Next.js 14
- **Estilos**: Tailwind CSS
- **Motor**: chess.js
- **IA**: Google Gemini API, Ollama
- **Testing**: Vitest, React Testing Library
- **Validación**: Zod

## Recursos Adicionales

### Documentación Externa

- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [chess.js Documentation](https://github.com/jhlywa/chess.js)
- [Gemini API](https://ai.google.dev/docs)

### Tutoriales y Guías

- [Reglas Oficiales del Ajedrez (FIDE)](https://www.fide.com/FIDE/handbook/LawsOfChess.pdf)
- [Notación Algebraica](https://en.wikipedia.org/wiki/Algebraic_notation_(chess))
- [FEN Notation](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation)
- [PGN Format](https://en.wikipedia.org/wiki/Portable_Game_Notation)

## Roadmap

### Versión Actual (v1.0)

- ✅ Motor de ajedrez completo con todas las reglas oficiales
- ✅ Sistema de IA con 5 niveles de dificultad
- ✅ Modos PvP y PvE
- ✅ Interfaz intuitiva con feedback visual
- ✅ Tests automatizados
- ✅ Documentación técnica completa

### Próximas Versiones

#### v1.1 - Mejoras de UX
- [ ] Temas personalizables
- [ ] Sonidos de movimiento
- [ ] Animaciones mejoradas
- [ ] Soporte para dispositivos móviles

#### v1.2 - Análisis
- [ ] Análisis post-partida
- [ ] Evaluación de movimientos
- [ ] Sugerencias de mejora
- [ ] Gráfico de evaluación

#### v2.0 - Persistencia
- [ ] Guardado de partidas
- [ ] Sistema de usuarios
- [ ] Historial de partidas
- [ ] Estadísticas de jugador

#### v3.0 - Modo Online
- [ ] Juego en tiempo real con WebSockets
- [ ] Matchmaking
- [ ] Chat entre jugadores
- [ ] Torneos

#### v4.0 - Entrenamiento
- [ ] Puzzles tácticos
- [ ] Lecciones interactivas
- [ ] Progreso del usuario
- [ ] Certificaciones

## Contribuir a la Documentación

La documentación también necesita contribuciones. Puedes ayudar:

- Corrigiendo errores o typos
- Agregando ejemplos adicionales
- Mejorando explicaciones
- Traduciendo a otros idiomas
- Agregando diagramas o imágenes

Para contribuir a la documentación, sigue el mismo proceso que para código (ver [CONTRIBUTING.md](./CONTRIBUTING.md)).

## Preguntas Frecuentes

### ¿Dónde empiezo si soy nuevo en el proyecto?

Lee primero [ARCHITECTURE.md](./ARCHITECTURE.md) para entender la estructura general, luego explora el código en `src/` siguiendo los diagramas.

### ¿Cómo puedo probar la API localmente?

Configura tus API keys en `.env.local` y usa `npm run dev`. Luego puedes hacer requests a `http://localhost:3000/api/`.

### ¿Necesito conocer ajedrez para contribuir?

No necesariamente. Hay muchas áreas donde puedes contribuir sin conocimiento profundo de ajedrez (UI/UX, testing, documentación, etc.).

### ¿Qué nivel de TypeScript necesito?

Nivel intermedio es suficiente. El código está bien tipado y documentado, lo que facilita el aprendizaje.

### ¿Puedo usar este proyecto como referencia para aprender?

¡Absolutamente! El proyecto está diseñado con buenas prácticas y patrones modernos de React/TypeScript.

## Soporte

Si tienes preguntas que no están cubiertas en la documentación:

1. Revisa los [issues existentes](https://github.com/usuario/rechess/issues)
2. Abre un nuevo issue con la etiqueta `question`
3. Consulta la sección de FAQ en [CONTRIBUTING.md](./CONTRIBUTING.md)

## Licencia

Este proyecto está licenciado bajo [MIT License](../LICENSE).

---

**Última actualización**: Enero 2024

**Mantenedores**: Ver [CONTRIBUTING.md](./CONTRIBUTING.md)

¡Gracias por tu interés en Rechess! ♟️
