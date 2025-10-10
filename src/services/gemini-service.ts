/**
 * Servicio para interactuar con la API de Gemini AI
 */
export class GeminiService {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Genera una respuesta usando Gemini AI
   */
  async generateResponse(prompt: string, maxTokens: number = 1000, temperature: number = 0.3): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: maxTokens,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Error de API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No se recibió respuesta válida de Gemini');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error al llamar a Gemini API:', error);
      throw new Error(`Error en Gemini API: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Analiza una posición de ajedrez y sugiere el mejor movimiento
   */
  async analyzeChessPosition(fen: string, difficulty: string): Promise<string> {
    const systemPrompt = this.getChessAnalysisPrompt(difficulty);

    const userPrompt = `Analiza esta posición de ajedrez en formato FEN:

${fen}

Por favor, responde únicamente con la notación algebraica del mejor movimiento (ej: "e2e4", "Nf3", "O-O", etc.). No incluyas explicaciones adicionales ni comentarios.`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    return this.generateResponse(fullPrompt, 50, 0.1);
  }

  /**
   * Obtiene el prompt del sistema según la dificultad
   */
  private getChessAnalysisPrompt(difficulty: string): string {
    const basePrompt = `Eres un experto en ajedrez analizando posiciones. Debes responder únicamente con la notación del mejor movimiento.

Instrucciones específicas según dificultad:`;

    switch (difficulty) {
      case 'easy':
        return `${basePrompt}
- Nivel fácil (ELO 500): Elige movimientos seguros y básicos como un principiante.
- Prioriza la seguridad del rey y el desarrollo simple de piezas.
- Evita movimientos complejos o riesgosos.
- Juega de forma conservadora y predecible.`;

      case 'intermediate':
        return `${basePrompt}
- Nivel intermedio (ELO 1000): Busca movimientos sólidos y posicionales como un jugador de club.
- Considera el centro, el desarrollo y la seguridad básica.
- Evita errores tácticos obvios pero permite algunos riesgos calculados.
- Juega de forma equilibrada entre ataque y defensa.`;

      case 'hard':
        return `${basePrompt}
- Nivel difícil (ELO 1500): Juega como un jugador de club fuerte con buen entendimiento posicional.
- Busca ventajas posicionales y oportunidades tácticas menores.
- Calcula 2-3 jugadas por adelantado.
- Prioriza el control del centro y la actividad de piezas.`;

      case 'expert':
        return `${basePrompt}
- Nivel experto (ELO 2500): Juega como un maestro FIDE con análisis profundo.
- Busca los movimientos más precisos y planes estratégicos complejos.
- Considera planes a largo plazo y sutilezas posicionales avanzadas.
- Calcula líneas tácticas complejas con precisión.
- Evalúa posiciones con criterio experto.`;

      case 'world-class':
        return `${basePrompt}
- Nivel clase mundial (ELO 3000): Juega como un super gran maestro con análisis magistral.
- Busca los movimientos más profundos y precisos posibles.
- Considera todos los aspectos posicionales, tácticos y estratégicos.
- Calcula líneas extremadamente complejas con precisión absoluta.
- Evalúa posiciones con el más alto nivel de comprensión ajedrecística.
- Busca ventajas mínimas y las explota con maestría suprema.`;

      default:
        return `${basePrompt}
- Nivel estándar: Busca movimientos sólidos y seguros.`;
    }
  }
}
