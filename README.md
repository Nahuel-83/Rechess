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
