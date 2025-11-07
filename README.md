<<<<<<< HEAD
# Ajedrez Online con IA Multi-Nivel

Una aplicación avanzada de ajedrez online construida con Next.js, React, TypeScript y Tailwind CSS, que integra inteligencia artificial de múltiples niveles usando Stockfish 17.1 WebAssembly.

## 🚀 Características Principales

### IA Multi-Nivel
- **5 niveles de dificultad**: Desde principiante (ELO 500) hasta experto (ELO 3500+)
- **Motor Stockfish 17.1**: El motor de ajedrez más potente del mundo
- **WebAssembly**: Ejecución nativa en el navegador sin backend
- **Configuración por nivel**: Skill Level y profundidad ajustables
- **Niveles superiores**: Difícil, Clase Mundial y Experto usan máxima fuerza de Stockfish con profundidad extrema

### Funcionalidades del Juego
- **Tablero interactivo** con drag & drop
- **Historial de movimientos** con notación algebraica
- **Temporizadores** con soporte para incrementos
- **Análisis de posición** y sugerencias
- **Modos de juego**: Jugador vs IA y Jugador vs Jugador
- **Exportación** de partidas en formato PGN/FEN

### Tecnología
- **Next.js 15** con App Router y React 19
- **TypeScript** para type safety completo
- **Tailwind CSS** para estilos modernos
- **Chess.js** para lógica del juego
- **React Chessboard** para UI del tablero
- **Zustand + Immer** para gestión de estado
- **Framer Motion** para animaciones fluidas

## 🏗️ Arquitectura

```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd chess-online
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Listo para usar**
No se requiere configuración adicional. Stockfish se ejecuta completamente en el navegador.

### 🎮 Cómo Jugar

### Inicio Rápido
1. **Página Principal**: Navega a la aplicación en tu navegador
2. **Configuración**: Elige tu modo de juego (vs IA o vs Jugador)
3. **Dificultad**: Selecciona el nivel de la IA (si aplica)
4. **Color**: Elige si jugar con blancas o negras
5. **Tiempo**: Configura el control de tiempo opcional
6. **¡Juega!**: Haz clic en "Iniciar Partida" y comienza a jugar

### Controles del Juego
- **Movimientos**: Arrastra piezas o haz clic para seleccionar y colocar
- **Modo Oscuro**: Usa el botón en el header para cambiar entre temas
- **Pausa/Reanudar**: Usa los controles en el panel izquierdo
- **Reiniciar**: Reinicia la partida en cualquier momento

## 🏗️ Arquitectura Técnica

### Arquitectura con Stockfish WebAssembly
```
Cliente (Browser) ──→ Stockfish Worker (WASM) ──→ Respuesta
     │                        │
     ├── React Components    ├── WebAssembly
     ├── Custom Hooks        ├── Web Worker
     └── useChessAI()        └── UCI Protocol
```

### Beneficios
- ✅ **Sin backend**: Todo se ejecuta en el navegador
- ✅ **Privacidad**: No se envían datos a servidores externos
- ✅ **Rendimiento**: Motor nativo compilado a WebAssembly
- ✅ **Offline**: Funciona sin conexión a internet
- ✅ **Gratuito**: Sin costos de API ni límites de uso

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes para IA
│   ├── game/[id]/         # Página del juego
│   ├── lobby/             # Configuración de partida
│   └── globals.css        # Estilos globales con modo oscuro
├── components/            # Componentes React
│   ├── chess/            # Componentes del tablero
│   ├── layout/           # Header, Footer con modo oscuro
│   └── ui/               # Componentes UI reutilizables
├── hooks/                # Hooks personalizados
├── lib/                  # Utilidades y lógica de negocio
│   ├── ai/               # Configuración de IA
│   ├── chess/            # Motor de ajedrez
│   └── game/             # Gestión del estado del juego
└── types/                # Definiciones TypeScript
```

## 🎯 Funcionalidades Implementadas

### ✅ Completado
- **Interfaz completa** con modo oscuro total
- **Tablero interactivo** con piezas Unicode mejoradas
- **Sistema de juego** con lógica completa de ajedrez
- **IA integrada** con múltiples niveles de dificultad
- **Temporizadores** con controles de tiempo
- **Historial de movimientos** con navegación
- **Modo oscuro** completo en todos los componentes
- **Responsive design** para móviles y escritorio

### 🔄 En Desarrollo
- **Piezas capturadas** (lógica parcialmente implementada)
- **Análisis post-partida** con explicaciones de IA
- **Modo multijugador** online
- **Sistema de cuentas** y estadísticas

## 🚀 Ejecución

### Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Producción
```bash
npm run build
npm start
```

## 🌙 Modo Oscuro

La aplicación incluye un sistema completo de modo oscuro:

- **Toggle automático** basado en preferencias del sistema
- **Botón manual** en el header para cambiar entre modos
- **Transiciones suaves** entre temas
- **Colores optimizados** para ambos modos
- **Persistencia** de la preferencia del usuario

## 🤝 Contribuir
- `chess.js`: Motor de ajedrez, validación, FEN/PGN
- `react-chessboard`: Tablero React elegante y responsivo

### IA y Motor de Ajedrez
- `stockfish`: Motor de ajedrez Stockfish 17.1 WebAssembly
- `zod`: Validación de schemas

### Estado y Datos
- `zustand`: Estado global ligero
- `immer`: Inmutabilidad para estado del juego

### UI y Experiencia
- `framer-motion`: Animaciones fluidas
- `lucide-react`: Iconos elegantes
- `class-variance-authority`: Variantes de componentes
- `tailwind-merge`: Merge de clases Tailwind

### Utilidades
- `date-fns`: Gestión de tiempo
- `nanoid`: IDs únicos para partidas

## 🔒 Seguridad y Producción

### Rendimiento
- Stockfish se ejecuta en Web Worker para no bloquear la UI
- WebAssembly proporciona rendimiento casi nativo
- Lazy loading para componentes pesados
- Optimización de imágenes y assets

### Escalabilidad
- Sin dependencias de APIs externas
- Considerar WebSockets para multiplayer en tiempo real
- Stockfish se ejecuta localmente en cada cliente

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- **Chess.js** por la excelente lógica de ajedrez
- **React Chessboard** por el componente de tablero
- **Stockfish** por el motor de ajedrez más potente del mundo
- Comunidad de **Next.js** por el framework increíble

---

¡Disfruta jugando al ajedrez con IA de clase mundial! ♟️🤖
=======
# ♛ Ajedrez Avanzado con IA Gemini - Chess Game

Un juego de ajedrez completamente profesional desarrollado con React, TypeScript y la poderosa API de Gemini AI de Google. Incluye detección automática de victoria, derrota, tablas y promoción de peones según las reglas oficiales del ajedrez.

## 🚀 Características Principales

### 🎮 Modos de Juego
- **Jugador vs Jugador (PvP)**: Dos jugadores humanos pueden jugar en el mismo dispositivo
- **Jugador vs IA Gemini**: Partidas contra la inteligencia artificial con diferentes niveles de ELO

### 🏆 Sistema de Fin de Juego Completo
- **Detección Automática de Jaque Mate**: Identifica victoria con análisis preciso
- **Detección de Tablas por Ahogado**: Reconoce posiciones empatadas correctamente
- **Indicadores Visuales Profesionales**: Estados coloridos y animados
- **Prevención de Movimientos Ilegales**: No permite dejar al rey en jaque

### ♟️ Promoción de Peones
- **Detección Automática**: Identifica cuando un peón llega a la última fila
- **Interfaz de Selección Elegante**: Elige entre Reina, Torre, Alfil o Caballo
- **Animaciones Suaves**: Transiciones profesionales durante la promoción

### 🤖 Niveles de Dificultad con Sistema ELO
- **Fácil (ELO 500)**: Principiante conservador y seguro
- **Intermedio (ELO 1000)**: Jugador de club básico equilibrado
- **Difícil (ELO 1500)**: Jugador de club fuerte con estrategia
- **Experto (ELO 2500)**: Maestro FIDE con análisis profundo
- **Clase Mundial (ELO 3000)**: Super gran maestro con maestría absoluta

### ⚡ Características Avanzadas
- **Indicador de Ventaja de Material**: Muestra diferencia de puntos entre jugadores
- **Contador de Movimientos**: Seguimiento completo del progreso de la partida
- **Animaciones de Piezas**: Efectos visuales profesionales en movimientos
- **Interfaz Totalmente Responsive**: Funciona perfectamente en móviles y escritorio

## 🏗️ Arquitectura del Proyecto

```
src/
├── App.tsx                           # ✅ Componente principal (solo UI)
├── game/
│   ├── chess-game-manager.ts         # ✅ Gestión centralizada del estado
│   ├── chess-utils.ts               # ✅ Utilidades y funciones auxiliares
│   ├── move-validator.ts            # ✅ Validación y análisis de posiciones
│   └── game-logic.ts                # ✅ Lógica básica del tablero
├── components/
│   ├── ChessBoard.tsx               # ✅ Tablero visual mejorado
│   ├── GameInfo.tsx                 # ✅ Información enriquecida con estadísticas
│   ├── GameControls.tsx             # ✅ Controles con niveles ELO
│   └── PawnPromotionDialog.tsx      # ✅ Diálogo elegante de promoción
├── ai/
│   └── chess-ai.ts                  # ✅ IA con niveles ELO especializados
├── services/
│   └── gemini-service.ts            # ✅ Servicio optimizado de Gemini
├── config/
│   └── app-config.ts                # ✅ Configuración de entorno
└── types/
    └── chess.ts                     # ✅ Tipos TypeScript avanzados
```

## 🛠️ Tecnologías Utilizadas

- **React 19** con hooks modernos y arquitectura limpia
- **TypeScript** para type safety completo
- **Vite** para desarrollo ultra-rápido
- **Gemini AI API** para análisis experto de posiciones
- **CSS3** con animaciones avanzadas y efectos visuales
- **Arquitectura Modular** con separación clara de responsabilidades

## 🚀 Cómo Ejecutar

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- **API Key de Gemini AI** (obtén una gratuita en [Google AI Studio](https://aistudio.google.com/))

### Instalación y Configuración

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu API key de Gemini
```

### Archivo de Configuración (.env)

```env
# Gemini API Configuration
GEMINI_API_KEY=tu_api_key_de_gemini_aqui
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=4096
GEMINI_TEMPERATURE=0.3

# Chess Game Configuration
DEFAULT_DIFFICULTY=easy
MAX_MOVE_TIME_MS=30000
DEBUG_MODE=false
```

### Uso

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

1. Abre tu navegador en `http://localhost:5173`
2. Selecciona el modo de juego (PvP o IA)
3. Elige la dificultad con niveles ELO específicos
4. ¡Disfruta de un ajedrez completamente profesional!

## 🎯 Características de la IA con Sistema ELO

La IA utiliza la API de Gemini con **prompts especializados** según el nivel de ELO:

### Niveles de IA Especializados
- **Fácil (ELO 500)**: Movimientos seguros y básicos como principiante
- **Intermedio (ELO 1000)**: Estrategia equilibrada como jugador de club
- **Difícil (ELO 1500)**: Análisis avanzado como jugador de club fuerte
- **Experto (ELO 2500)**: Análisis profundo como maestro FIDE
- **Clase Mundial (ELO 3000)**: Maestría absoluta como super gran maestro

## 📋 Reglas Implementadas Completamente

### ✅ Movimientos y Reglas Oficiales
- **Movimientos básicos** de todas las piezas según reglas FIDE
- **Enroque completo** (corto y largo) con validaciones de seguridad
- **Captura al paso** con detección precisa de oportunidades
- **Promoción de peones** con interfaz de selección elegante
- **Detección de jaque** con prevención automática de movimientos peligrosos

### ✅ Estados de Juego Profesionales
- **Jaque Mate**: Detección automática con análisis exhaustivo
- **Tablas por Ahogado**: Identificación precisa de posiciones empatadas
- **Indicadores Visuales**: Estados coloridos y animados profesionales
- **Prevención Inteligente**: Bloqueo automático de movimientos ilegales

## 🔧 Características Técnicas Avanzadas

### Sistema de Estados Robusto
- **Análisis Continuo**: Evalúa el estado del juego después de cada movimiento
- **Detección Automática**: Identifica victoria, derrota y tablas en tiempo real
- **Prevención de Errores**: Evita estados inconsistentes del juego
- **Recuperación Automática**: Se recupera de cualquier problema técnico

### Interfaz Visual Profesional
- **Estados Animados**: Diferentes colores y efectos para cada estado del juego
- **Indicadores Inteligentes**: Material, movimientos, dificultad y ventaja
- **Responsive Design**: Funciona perfectamente en móviles, tablets y escritorio
- **Animaciones Suaves**: Efectos visuales profesionales en todas las interacciones

### Arquitectura Limpia y Mantenible
- **Separación de Responsabilidades**: Lógica de negocio separada de interfaz
- **Módulos Especializados**: Cada archivo tiene un propósito específico
- **Código Reutilizable**: Componentes y servicios diseñados para extensión
- **TypeScript Completo**: Type safety en toda la aplicación

## 📊 Información del Juego

### Indicadores en Tiempo Real
- **Ventaja de Material**: Muestra diferencia de puntos entre jugadores
- **Número de Movimientos**: Seguimiento completo del progreso
- **Nivel de Dificultad**: Información clara del ELO de la IA
- **Estado del Turno**: Indicador visual claro de quién juega

### Estados Visuales Distintivos
- **🔶 Jaque**: Fondo naranja pulsante con efectos de brillo
- **💀 Jaque Mate**: Fondo rojo intenso con animación de resplandor
- **💜 Tablas**: Fondo púrpura con efecto shimmer elegante
- **🟤 Normal**: Fondo marrón elegante con pulso sutil

## 🔮 Características Implementadas

### ✅ Funcionalidades Completas
- **Detección automática de victoria, derrota y tablas**
- **Promoción de peones con interfaz visual elegante**
- **Sistema de niveles de IA basados en ELO reales**
- **Arquitectura modular y mantenible**
- **Interfaz responsive con efectos visuales profesionales**
- **Prevención automática de movimientos ilegales**
- **Análisis continuo del estado del juego**
- **Indicadores de material y estadísticas en tiempo real**

### ✅ Características Técnicas
- **Validación estricta de movimientos según reglas FIDE**
- **Análisis de posiciones con IA de Google Gemini**
- **Gestión robusta de estados del juego**
- **Recuperación automática de errores**
- **Código modular y fácilmente extensible**
- **TypeScript completo para type safety**

## 🤝 Cómo Contribuir

¡Gracias por tu interés en contribuir al proyecto! Este es un proyecto open source y todas las contribuciones son bienvenidas. Sigue estos pasos para contribuir:

### 📋 Pasos para Contribuir

1. **Haz un Fork** del repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Haz tus cambios** y asegúrate de que pasen los tests
4. **Haz commit** de tus cambios (`git commit -m 'Add some AmazingFeature'`)
5. **Haz push** de la rama (`git push origin feature/AmazingFeature`)
6. **Abre un Pull Request**

### 📝 Directrices para Contribuir

- **Mantén la calidad del código**: Sigue las mejores prácticas de TypeScript y React
- **Añade tests**: Para nuevas funcionalidades, incluye tests apropiados
- **Documenta los cambios**: Actualiza el README si es necesario
- **Sigue las convenciones**: Usa nombres descriptivos para variables y funciones
- **Respeta la arquitectura**: Mantén la separación clara entre lógica de negocio y UI

### 🐛 Reportar Bugs

Si encuentras un bug, por favor crea un [issue](https://github.com/Nahuel-83/Rechess/issues) con:

1. **Descripción clara** del problema
2. **Pasos para reproducirlo**
3. **Comportamiento esperado** vs **actual**
4. **Capturas de pantalla** si es relevante
5. **Versión del navegador** y sistema operativo

### 💡 Sugerir Mejoras

Para sugerir nuevas funcionalidades o mejoras:

1. Crea un [issue](https://github.com/Nahuel-83/Rechess/issues) con el label `enhancement`
2. Describe la funcionalidad propuesta
3. Explica por qué sería útil
4. Si es posible, incluye ejemplos de uso

### 🔧 Configuración para Desarrollo

```bash
# Clona tu fork
git clone https://github.com/TU-USUARIO/Rechess.git
cd Rechess

# Instala dependencias
npm install

# Crea archivo .env con tus configuraciones
cp .env.example .env

# Ejecuta en modo desarrollo
npm run dev

# Ejecuta tests
npm run test

# Construye para producción
npm run build
```

### 📋 Tipos de Contribuciones Aceptadas

- ✅ Corrección de bugs
- ✅ Nuevas funcionalidades
- ✅ Mejoras de rendimiento
- ✅ Mejoras de accesibilidad
- ✅ Actualizaciones de documentación
- ✅ Tests adicionales
- ✅ Refactoring de código

### 🚫 No Aceptamos

- Cambios que rompan funcionalidades existentes sin justificación
- Código que no siga las convenciones del proyecto
- Cambios que afecten la seguridad o privacidad

### 📞 Contacto

Si tienes dudas sobre cómo contribuir, puedes:

- Crear un [issue](https://github.com/Nahuel-83/Rechess/issues) con preguntas
- Contactar al maintainer directamente

---

¡Tu contribución hace que este proyecto sea mejor para toda la comunidad! 🚀

---

¡Desafía a la IA potenciada por Gemini en cualquiera de los niveles de dificultad con ELO real! El ajedrez nunca ha sido tan completo y profesional. ♟️🤖🏆
>>>>>>> ce7de1929af02f496e3847fecdcf5dd517cefe79
