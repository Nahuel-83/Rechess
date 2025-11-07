# Requirements Document

## Introduction

Este documento define los requisitos para solucionar el problema de selección de nivel de dificultad de la IA en el juego de ajedrez. Actualmente, cuando el usuario selecciona un nivel de dificultad específico (fácil, difícil, clase mundial, o experto), la IA no está aplicando correctamente ese nivel y parece estar usando siempre el nivel intermedio.

## Glossary

- **Sistema de IA**: El componente que genera movimientos de ajedrez basados en el nivel de dificultad seleccionado
- **Nivel de Dificultad**: La configuración que determina la fuerza de juego de la IA (facil, medio, dificil, claseMundial, experto)
- **PromptBuilder**: El servicio que construye prompts específicos para cada nivel de dificultad
- **AIService**: El servicio que coordina las llamadas a la IA de Gemini
- **Usuario**: El jugador humano que configura y juega contra la IA

## Requirements

### Requirement 1

**User Story:** Como usuario, quiero que cuando seleccione un nivel de dificultad específico en el lobby, la IA juegue con ese nivel de fuerza, para tener una experiencia de juego apropiada a mi habilidad.

#### Acceptance Criteria

1. WHEN el Usuario selecciona el nivel "facil" en el lobby, THE Sistema de IA SHALL generar movimientos con el prompt y comportamiento correspondiente al nivel fácil (ELO 500-900)

2. WHEN el Usuario selecciona el nivel "medio" en el lobby, THE Sistema de IA SHALL generar movimientos con el prompt y comportamiento correspondiente al nivel medio (ELO 1000-1600)

3. WHEN el Usuario selecciona el nivel "dificil" en el lobby, THE Sistema de IA SHALL generar movimientos con el prompt y comportamiento correspondiente al nivel difícil (ELO 1800-2400)

4. WHEN el Usuario selecciona el nivel "claseMundial" en el lobby, THE Sistema de IA SHALL generar movimientos con el prompt y comportamiento correspondiente al nivel clase mundial (ELO 2600+)

5. WHEN el Usuario selecciona el nivel "experto" en el lobby, THE Sistema de IA SHALL generar movimientos con el prompt y comportamiento correspondiente al nivel experto (ELO 3200+)

### Requirement 2

**User Story:** Como desarrollador, quiero que el sistema registre logs claros del nivel de dificultad seleccionado en cada etapa del flujo, para poder diagnosticar problemas de configuración.

#### Acceptance Criteria

1. WHEN el Usuario configura una partida en el lobby, THE Sistema de IA SHALL registrar en consola el nivel de dificultad seleccionado

2. WHEN el AIService recibe una solicitud de movimiento, THE Sistema de IA SHALL registrar en consola el nivel de dificultad recibido en la solicitud

3. WHEN el PromptBuilder construye un prompt, THE Sistema de IA SHALL registrar en consola el nivel de dificultad y el tipo de prompt que está construyendo

4. WHEN el Sistema de IA genera un movimiento, THE Sistema de IA SHALL incluir en la respuesta el nivel de dificultad utilizado

### Requirement 3

**User Story:** Como usuario, quiero ver confirmación visual del nivel de dificultad activo durante la partida, para verificar que la configuración es correcta.

#### Acceptance Criteria

1. WHILE una partida contra IA está en progreso, THE Sistema de IA SHALL mostrar el nivel de dificultad configurado en el panel de información de IA

2. WHEN la IA está pensando un movimiento, THE Sistema de IA SHALL mostrar el nivel de dificultad activo en el mensaje de carga

3. IF el nivel de dificultad mostrado no coincide con el seleccionado, THEN THE Sistema de IA SHALL registrar una advertencia en consola

### Requirement 4

**User Story:** Como desarrollador, quiero que el sistema valide que el nivel de dificultad se mantiene consistente a través de todo el flujo, para prevenir cambios accidentales.

#### Acceptance Criteria

1. WHEN el Usuario inicia una partida desde el lobby, THE Sistema de IA SHALL preservar el nivel de dificultad en los parámetros de URL

2. WHEN la página del juego carga la configuración desde URL, THE Sistema de IA SHALL validar que el nivel de dificultad es uno de los valores permitidos

3. WHEN el hook useChessAI solicita un movimiento, THE Sistema de IA SHALL usar el nivel de dificultad almacenado en la configuración del juego

4. WHEN el API endpoint recibe una solicitud, THE Sistema de IA SHALL validar que el nivel de dificultad es válido antes de procesarla

5. IF el nivel de dificultad es inválido o falta en cualquier etapa, THEN THE Sistema de IA SHALL usar "medio" como valor por defecto y registrar una advertencia
