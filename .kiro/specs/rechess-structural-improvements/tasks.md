# Plan de Implementación - Mejoras Estructurales de Rechess

- [ ] 1. Mejorar ChessEngine con métodos faltantes





  - Agregar métodos para detectar todas las condiciones de tablas que chess.js ya soporta
  - Mejorar el mapeo de tipos entre chess.js y los tipos personalizados
  - Agregar método para obtener piezas capturadas del historial
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 1.1 Agregar métodos de detección de tablas


  - Implementar `isThreefoldRepetition()` usando chess.js
  - Implementar `isInsufficientMaterial()` usando chess.js
  - Actualizar `getGameState()` para incluir estos nuevos estados
  - _Requirements: 2.3, 2.4, 2.5_

- [x] 1.2 Mejorar método para obtener piezas capturadas


  - Crear método `getCapturedPieces()` que analice el historial de movimientos
  - Retornar objeto con piezas capturadas por blancas y negras separadas
  - _Requirements: 8.3_

- [x] 1.3 Agregar método para determinar fase del juego


  - Implementar `getGamePhase()` basado en número de movimientos y piezas en tablero
  - Retornar 'opening', 'middlegame' o 'endgame'
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 1.4 Escribir tests unitarios para ChessEngine


  - Tests para movimientos de todas las piezas (peón, torre, alfil, caballo, dama, rey)
  - Tests para movimientos especiales (enroque, captura al paso, promoción)
  - Tests para detección de jaque, jaque mate, ahogado
  - Tests para detección de tablas (repetición, 50 movimientos, material insuficiente)
  - _Requirements: 5.1, 5.2, 5.3_


- [x] 2. Implementar sistema de IA con prompts diferenciados




  - Crear PromptBuilder mejorado con prompts únicos para cada nivel
  - Crear AIService con manejo robusto de errores y reintentos
  - Actualizar API route /api/ai/move con nueva lógica
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2.1 Crear PromptBuilder con prompts diferenciados


  - Implementar `buildEasyPrompt()` para nivel fácil (ELO 500-900)
  - Implementar `buildMediumPrompt()` para nivel medio (ELO 1000-1600)
  - Implementar `buildAdvancedPrompt()` para nivel avanzado (ELO 1800-2400)
  - Implementar `buildExpertPrompt()` para nivel experto/GM (ELO 2600+)
  - Cada prompt debe incluir instrucciones específicas de comportamiento y profundidad de análisis
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2.2 Crear AIService con manejo de errores


  - Implementar `requestMove()` para llamar a API de Gemini/Ollama
  - Implementar `validateAIMove()` para verificar que el movimiento es legal
  - Implementar `parseAIResponse()` para extraer movimiento de respuestas con formato variable
  - Implementar `requestMoveWithRetry()` con lógica de reintentos (máximo 3)
  - Implementar fallback a movimiento aleatorio si todos los reintentos fallan
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2.3 Actualizar API route /api/ai/move


  - Modificar para usar nuevo PromptBuilder
  - Integrar AIService con manejo de errores
  - Agregar validación de entrada con Zod
  - Agregar logging de errores y métricas
  - _Requirements: 3.5, 4.1, 4.2, 4.3_

- [x] 2.4 Escribir tests para sistema de IA


  - Tests unitarios para PromptBuilder verificando que cada nivel genera prompts diferentes
  - Tests para AIService validación y parseo de respuestas
  - Tests de integración para API route /api/ai/move
  - _Requirements: 5.5_


- [x] 2.5 Eliminar soporte de Ollama y dejar solo Gemini AI






  - Remover todas las referencias a Ollama en AIService
  - Actualizar `requestMove()` para usar exclusivamente Gemini
  - Asegurar que PromptBuilder sigue recibiendo el nivel (easy, medium, advanced, expert)
  - Confirmar que `parseAIResponse()` funciona con la estructura de respuesta actual de Gemini
  - Actualizar documentación interna de IA
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 6.4_

- [x] 3. Mejorar GameStateManager con nuevas capacidades





  - Integrar con AIService mejorado
  - Agregar soporte para deshacer movimientos
  - Mejorar detección de finales de partida
  - _Requirements: 9.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3.1 Integrar AIService en GameStateManager


  - Modificar `makeAIMove()` para usar nuevo AIService
  - Pasar información de fase del juego a AIService
  - Manejar errores de IA y mostrar notificaciones apropiadas
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.3_

- [x] 3.2 Implementar funcionalidad de deshacer movimientos


  - Crear método `undoLastMove()` para deshacer un movimiento
  - Crear método `undoLastTwoMoves()` para deshacer jugador + IA en modo PvE
  - Validar que se puede deshacer (no en partida terminada)
  - _Requirements: 9.5_

- [x] 3.3 Mejorar detección de finales de partida


  - Crear método `checkGameEnd()` que retorne tipo específico de final
  - Detectar jaque mate, ahogado, tablas por repetición, 50 movimientos, material insuficiente
  - Actualizar estado del juego con información detallada del final
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3.4 Escribir tests de integración para GameStateManager



  - Tests para flujo completo de partida PvP
  - Tests para flujo completo de partida PvE con IA
  - Tests para deshacer movimientos
  - Tests para detección de finales
  - _Requirements: 5.4_

- [x] 4. Mejorar componente Board con feedback visual





  - Implementar resaltado de pieza seleccionada
  - Mostrar movimientos legales disponibles
  - Resaltar último movimiento realizado
  - Resaltar rey en jaque
  - Agregar animaciones suaves de movimiento
  - _Requirements: 7.1, 7.2, 7.3, 7.5, 9.1, 9.2_


- [x] 4.1 Implementar sistema de selección y resaltado

  - Agregar estado `selectedSquare` al componente Board
  - Aplicar estilo visual distintivo a casilla seleccionada (fondo amarillo/dorado)
  - Calcular y mostrar movimientos legales cuando se selecciona una pieza
  - Mostrar movimientos legales como círculos semi-transparentes en casillas válidas
  - _Requirements: 7.1, 9.1, 9.2_


- [x] 4.2 Implementar resaltado de último movimiento

  - Agregar prop `lastMove` con casillas from/to
  - Aplicar estilo visual a casillas del último movimiento (fondo verde claro)
  - _Requirements: 7.1_


- [x] 4.3 Implementar resaltado de rey en jaque

  - Detectar si el rey está en jaque desde gameState
  - Encontrar casilla del rey en jaque
  - Aplicar estilo visual distintivo (fondo rojo pulsante con animación)
  - _Requirements: 7.3_


- [x] 4.4 Agregar animaciones de movimiento

  - Implementar animación CSS/Framer Motion para transición de piezas
  - Animar pieza desde casilla origen a destino
  - Duración de animación: 200-300ms
  - _Requirements: 7.5_

- [x] 5. Mejorar componentes de información de partida





  - Mejorar GameInfo con indicadores claros de turno y estado
  - Mejorar MoveHistory con formato estándar y navegación
  - Implementar CapturedPieces con ventaja material
  - _Requirements: 7.2, 7.4, 8.1, 8.2, 8.3_

- [x] 5.1 Mejorar componente GameInfo


  - Mostrar indicador visual claro de quién tiene el turno
  - Mostrar estado del juego (normal, jaque, jaque mate, tablas)
  - Agregar botones de control (pausar, reanudar, reiniciar, deshacer)
  - Mostrar temporizadores si están configurados
  - _Requirements: 7.2, 8.1_



- [x] 5.2 Mejorar componente MoveHistory





  - Formatear movimientos en notación algebraica estándar (SAN)
  - Mostrar en formato de dos columnas (blancas y negras)
  - Implementar scroll automático al último movimiento
  - Agregar navegación por movimientos (click para ver posición)


  - _Requirements: 8.1_

- [x] 5.3 Implementar componente CapturedPieces





  - Mostrar piezas capturadas por cada jugador
  - Agrupar piezas por tipo
  - Calcular y mostrar ventaja material (diferencia en puntos)
  - Usar valores estándar: peón=1, caballo/alfil=3, torre=5, dama=9
  - _Requirements: 8.3_

- [x] 6. Implementar componentes de feedback de IA





  - Crear AIThinkingIndicator para mostrar cuando IA está calculando
  - Crear GameEndModal para mostrar resultado de partida
  - _Requirements: 7.4, 8.2, 8.4_

- [x] 6.1 Crear componente AIThinkingIndicator


  - Mostrar animación de "pensamiento" (spinner o similar)
  - Mostrar nivel de dificultad activo
  - Mostrar tiempo transcurrido de cálculo
  - Opcionalmente permitir cancelar si tarda demasiado
  - _Requirements: 8.2_

- [x] 6.2 Crear componente GameEndModal


  - Mostrar resultado claro (ganador, tipo de final)
  - Mostrar resumen de la partida (número de movimientos, tiempo)
  - Ofrecer opciones: Nueva partida, Revisar partida, Exportar PGN
  - _Requirements: 7.4, 8.4_

- [x] 7. Mejorar validación de entrada de usuario





  - Validar que solo se pueden mover piezas propias
  - Validar que solo se puede mover en el turno correcto
  - Implementar modal de promoción de peón
  - Deshabilitar interacción durante turno de IA
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_


- [x] 7.1 Implementar validaciones de turno y pieza

  - Verificar que la pieza seleccionada pertenece al jugador actual
  - Verificar que es el turno del jugador (no de IA)
  - Mostrar feedback visual si se intenta acción inválida
  - _Requirements: 9.1, 9.2, 9.4_


- [x] 7.2 Implementar modal de promoción de peón

  - Detectar cuando un peón alcanza la última fila
  - Mostrar modal con opciones de promoción (dama, torre, alfil, caballo)
  - Bloquear otros movimientos hasta que se seleccione promoción
  - _Requirements: 9.3_

- [x] 8. Mejorar configuración de partidas en Lobby





  - Permitir selección de modo (PvP / PvE)
  - Permitir selección de dificultad de IA
  - Permitir selección de color del jugador
  - Permitir configuración opcional de tiempo
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 8.1 Mejorar componente Lobby


  - Crear selector de modo de juego (PvP / PvE)
  - Mostrar selector de dificultad solo si se selecciona PvE
  - Crear selector de color (blancas / negras / aleatorio)
  - Agregar configuración opcional de tiempo (sin tiempo, tiempo fijo, incremento)
  - Validar configuración antes de iniciar partida
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 9. Configurar infraestructura de testing




  - Instalar y configurar Vitest
  - Configurar coverage reporting
  - Crear estructura de carpetas para tests
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 9.1 Instalar y configurar Vitest


  - Instalar vitest y dependencias relacionadas
  - Crear archivo vitest.config.ts con configuración apropiada
  - Configurar alias de paths (@/ para src/)
  - Configurar coverage con v8 provider
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9.2 Crear estructura de carpetas para tests


  - Crear carpeta `src/__tests__` para tests unitarios
  - Crear carpeta `src/__tests__/integration` para tests de integración
  - Crear archivos de utilidades de testing compartidas
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. Agregar mejoras de accesibilidad




  - Agregar atributos ARIA apropiados
  - Implementar navegación por teclado
  - Asegurar contraste de colores adecuado
  - Agregar anuncios de screen reader
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 10.1 Implementar accesibilidad en Board


  - Agregar atributos role y aria-label a casillas
  - Implementar navegación por teclado (Tab, Enter, flechas)
  - Agregar anuncios de screen reader para movimientos
  - Asegurar contraste mínimo WCAG AA en todos los estados visuales
  - _Requirements: 7.1, 7.2, 7.3_


- [x] 11. Agregar documentación técnica




  - Documentar arquitectura del sistema
  - Documentar API routes
  - Crear guía de contribución
  - _Requirements: 6.4, 6.5_

