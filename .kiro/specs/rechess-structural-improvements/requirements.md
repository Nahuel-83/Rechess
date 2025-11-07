# Documento de Requisitos - Mejoras Estructurales de Rechess

## Introducción

Rechess es una aplicación de ajedrez desarrollada en React + TypeScript con Next.js que ofrece modos PvP local y PvE contra IA usando la API de Gemini. El proyecto actualmente utiliza chess.js como motor base, pero requiere mejoras en la diferenciación de niveles de IA, validaciones adicionales, testing, y experiencia de usuario. El objetivo es transformar Rechess en una plataforma profesional de ajedrez con reglas oficiales completas, IA verdaderamente escalonada por nivel, interfaz intuitiva y capacidad de expansión futura.

## Glosario

- **ChessEngine**: Clase wrapper que encapsula la librería chess.js y proporciona la interfaz para interactuar con el motor de ajedrez
- **MoveValidator**: Clase responsable de validar movimientos y verificar condiciones especiales del juego
- **PromptBuilder**: Clase que construye prompts específicos para la IA según nivel de dificultad y fase del juego
- **AIService**: Servicio que coordina las llamadas a la API de Gemini/Ollama para obtener movimientos de la IA
- **GameState**: Estado completo de una partida incluyendo posición FEN, historial, turno y condiciones de finalización
- **FEN**: Forsyth-Edwards Notation, formato estándar para representar posiciones de ajedrez
- **PGN**: Portable Game Notation, formato estándar para registrar partidas completas
- **ELO**: Sistema de puntuación para medir la habilidad de jugadores de ajedrez

## Requisitos

### Requisito 1: Motor de Ajedrez con Reglas Oficiales Completas

**User Story:** Como jugador de ajedrez, quiero que el juego aplique todas las reglas oficiales correctamente, para que mi experiencia sea auténtica y profesional.

#### Acceptance Criteria

1. WHEN un jugador intenta mover cualquier pieza, THE ChessEngine SHALL validar que el movimiento cumple con las reglas oficiales de esa pieza específica
2. WHEN un peón alcanza la última fila del tablero, THE ChessEngine SHALL requerir la selección de una pieza de promoción (dama, torre, alfil o caballo)
3. WHEN se cumplen las condiciones para captura al paso, THE ChessEngine SHALL permitir la ejecución de este movimiento especial
4. WHEN se intenta realizar un enroque, THE ChessEngine SHALL verificar que el rey y la torre no se han movido previamente, que no hay piezas entre ellos, que el rey no está en jaque, y que el rey no pasa por una casilla atacada
5. WHEN un movimiento deja al propio rey en jaque, THE ChessEngine SHALL rechazar el movimiento como ilegal

### Requisito 2: Detección Precisa de Condiciones de Finalización

**User Story:** Como jugador, quiero que el sistema detecte correctamente todas las condiciones de finalización del juego, para que las partidas terminen apropiadamente según las reglas oficiales.

#### Acceptance Criteria

1. WHEN el rey de un jugador está en jaque y no existen movimientos legales, THE ChessEngine SHALL declarar jaque mate y finalizar la partida
2. WHEN un jugador no tiene movimientos legales pero su rey no está en jaque, THE ChessEngine SHALL declarar ahogado (tablas)
3. WHEN se repite la misma posición tres veces, THE ChessEngine SHALL ofrecer tablas por repetición
4. WHEN se realizan 50 movimientos consecutivos sin capturas ni movimientos de peón, THE ChessEngine SHALL ofrecer tablas por la regla de los 50 movimientos
5. WHEN quedan piezas insuficientes para dar jaque mate, THE ChessEngine SHALL declarar tablas por material insuficiente

### Requisito 3: Sistema de IA con Niveles de Dificultad Diferenciados

**User Story:** Como jugador, quiero enfrentarme a una IA que se comporte de manera realista según el nivel de dificultad seleccionado, para poder mejorar progresivamente mis habilidades.

#### Acceptance Criteria

1. WHEN el nivel de dificultad es "Fácil" (ELO 500-900), THE AIService SHALL utilizar prompts que instruyan a la IA para realizar movimientos simples con errores ocasionales y sin análisis profundo
2. WHEN el nivel de dificultad es "Medio" (ELO 1000-1600), THE AIService SHALL utilizar prompts que instruyan a la IA para considerar tácticas básicas y analizar 1-2 jugadas adelante
3. WHEN el nivel de dificultad es "Avanzado" (ELO 1800-2400), THE AIService SHALL utilizar prompts que instruyan a la IA para aplicar estrategia avanzada y analizar 2-5 jugadas adelante
4. WHEN el nivel de dificultad es "Experto/GM" (ELO 2600+), THE AIService SHALL utilizar prompts que instruyan a la IA para realizar análisis preventivo profundo y analizar 6+ jugadas adelante
5. WHEN la IA genera un movimiento, THE AIService SHALL enviar la posición en formato FEN y recibir únicamente el movimiento en notación estándar sin explicaciones adicionales

### Requisito 4: Manejo Robusto de Errores en Comunicación con IA

**User Story:** Como jugador, quiero que el sistema maneje correctamente los errores de comunicación con la IA, para que mi experiencia de juego no se interrumpa por fallos técnicos.

#### Acceptance Criteria

1. WHEN la API de Gemini/Ollama no responde en el tiempo esperado, THE AIService SHALL reintentar la solicitud hasta un máximo de 3 intentos
2. WHEN la IA devuelve un movimiento inválido, THE AIService SHALL solicitar un nuevo movimiento de la lista de movimientos legales
3. WHEN todos los reintentos fallan, THE AIService SHALL notificar al usuario del error y ofrecer opciones para continuar (cambiar a modo PvP, reintentar, o guardar partida)
4. WHEN se pierde la conexión durante el turno de la IA, THE AIService SHALL preservar el estado del juego y permitir reanudar cuando se restablezca la conexión
5. WHEN la respuesta de la IA contiene formato incorrecto, THE AIService SHALL parsear el contenido para extraer el movimiento válido o solicitar nueva respuesta

### Requisito 5: Suite de Tests Automatizados

**User Story:** Como desarrollador, quiero tener tests automatizados completos, para garantizar que las reglas del juego y la lógica de IA funcionan correctamente en todo momento.

#### Acceptance Criteria

1. THE test suite SHALL incluir tests unitarios para cada tipo de pieza verificando todos sus movimientos legales e ilegales
2. THE test suite SHALL incluir tests para todas las condiciones de finalización (jaque mate, ahogado, tablas por repetición, tablas por 50 movimientos)
3. THE test suite SHALL incluir tests para movimientos especiales (enroque, captura al paso, promoción de peón)
4. THE test suite SHALL incluir tests de integración para el flujo completo de una partida desde inicio hasta finalización
5. THE test suite SHALL incluir tests para verificar que cada nivel de dificultad de IA utiliza prompts diferentes y apropiados

### Requisito 6: Arquitectura Modular y Mantenible

**User Story:** Como desarrollador, quiero que el código esté organizado en módulos independientes y bien documentados, para facilitar el mantenimiento y futuras expansiones.

#### Acceptance Criteria

1. THE ChessEngine SHALL estar completamente separado de la lógica de UI en un módulo independiente
2. THE AIService SHALL estar separado del ChessEngine y comunicarse únicamente a través de interfaces bien definidas
3. WHEN se necesite extender funcionalidad, THE codebase SHALL permitir agregar nuevos módulos sin modificar código existente
4. THE codebase SHALL incluir documentación técnica explicando la arquitectura, flujo de datos y responsabilidades de cada módulo
5. THE codebase SHALL seguir principios SOLID y patrones de diseño establecidos para facilitar testing y mantenimiento

### Requisito 7: Interfaz de Usuario Intuitiva y Accesible

**User Story:** Como jugador, quiero una interfaz clara y fácil de usar, para poder concentrarme en el juego sin confusiones sobre el estado de la partida.

#### Acceptance Criteria

1. WHEN un jugador selecciona una pieza, THE UI SHALL resaltar visualmente la pieza seleccionada y mostrar todos los movimientos legales disponibles
2. WHEN es el turno de un jugador, THE UI SHALL mostrar claramente de quién es el turno mediante indicadores visuales
3. WHEN el rey está en jaque, THE UI SHALL resaltar visualmente el rey en peligro
4. WHEN una partida finaliza, THE UI SHALL mostrar un resumen claro del resultado (ganador, tipo de finalización) y opciones para nueva partida
5. WHEN se realiza un movimiento, THE UI SHALL ejecutar una animación suave de la pieza moviéndose de una casilla a otra

### Requisito 8: Sistema de Feedback Durante la Partida

**User Story:** Como jugador, quiero recibir información relevante durante la partida, para entender mejor el estado del juego y tomar decisiones informadas.

#### Acceptance Criteria

1. THE UI SHALL mostrar el historial completo de movimientos en notación algebraica estándar
2. WHEN la IA está calculando su movimiento, THE UI SHALL mostrar un indicador de carga con el nivel de dificultad activo
3. THE UI SHALL mostrar las piezas capturadas por cada jugador organizadas por tipo
4. WHEN una partida finaliza, THE UI SHALL ofrecer la opción de exportar la partida en formato PGN
5. THE UI SHALL mostrar el tiempo transcurrido de la partida y opcionalmente temporizadores por jugador

### Requisito 9: Validación de Entrada de Usuario

**User Story:** Como jugador, quiero que el sistema me impida realizar acciones inválidas, para evitar errores y mantener la integridad del juego.

#### Acceptance Criteria

1. WHEN un jugador intenta mover una pieza del oponente, THE UI SHALL ignorar la acción y mantener el estado actual
2. WHEN un jugador intenta mover a una casilla ilegal, THE UI SHALL rechazar el movimiento y mantener la pieza en su posición original
3. WHEN se requiere promoción de peón, THE UI SHALL bloquear otros movimientos hasta que se seleccione la pieza de promoción
4. WHEN no es el turno del jugador humano en modo PvE, THE UI SHALL deshabilitar la interacción con el tablero
5. WHEN un jugador intenta deshacer un movimiento en modo PvE, THE UI SHALL deshacer tanto el movimiento del jugador como el de la IA

### Requisito 10: Configuración Flexible de Partidas

**User Story:** Como jugador, quiero poder configurar diferentes aspectos de la partida antes de comenzar, para adaptar la experiencia a mis preferencias.

#### Acceptance Criteria

1. WHEN un jugador inicia una nueva partida, THE UI SHALL permitir seleccionar entre modo PvP y PvE
2. WHEN se selecciona modo PvE, THE UI SHALL permitir elegir el nivel de dificultad de la IA entre los 5 niveles disponibles
3. WHEN se selecciona modo PvE, THE UI SHALL permitir elegir el color de las piezas del jugador (blancas o negras)
4. THE UI SHALL permitir opcionalmente configurar límites de tiempo por jugador o por partida
5. WHEN se inicia una partida con configuración personalizada, THE GameState SHALL reflejar correctamente todos los parámetros seleccionados
