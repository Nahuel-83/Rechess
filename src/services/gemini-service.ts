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
  async generateResponse(prompt: string, maxTokens: number = 1000, temperature: number = 0.3, model?: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/models/${model || this.model}:generateContent?key=${this.apiKey}`, {
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
    const systemPrompt = this.getOptimizedChessPrompt(difficulty);

    const userPrompt = `FEN: ${fen}

Responde únicamente con el movimiento en notación algebraica.`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Usar modelo más rápido para niveles bajos
    const model = this.getModelForDifficulty(difficulty);

    return this.generateResponse(fullPrompt, 30, 0.1, model);
  }

  /**
   * Obtiene el modelo más rápido según la dificultad
   */
  private getModelForDifficulty(difficulty: string): string {
    // Usar modelo más rápido para niveles básicos
    switch (difficulty) {
      case 'easy':
      case 'intermediate':
        return 'gemini-1.5-flash'; // Más rápido
      case 'hard':
      case 'expert':
      case 'world-class':
      default:
        return this.model; // Modelo por defecto (más potente)
    }
  }

  /**
   * Obtiene el prompt optimizado del sistema según la dificultad
   */
  private getOptimizedChessPrompt(difficulty: string): string {
    const basePrompt = `Eres un jugador de ajedrez nivel ${this.getELORange(difficulty)}.
Responde ÚNICAMENTE con notación algebraica del movimiento.`;

    switch (difficulty) {
      case 'easy':
        return `${basePrompt} Juega como principiante: movimientos seguros, desarrollo básico, evita riesgos.`;

      case 'intermediate':
        return `${basePrompt} Juega como jugador de club: sólido, táctica básica, posición equilibrada.`;

      case 'hard':
        return `${basePrompt} Juega como experto: análisis profundo, ventajas posicionales, técnica precisa.`;

      case 'expert':
        return `${basePrompt} Juega como maestro: precisión absoluta, planes complejos, técnica perfecta.`;

      case 'world-class':
        return `${basePrompt} Juega como super-GM: genialidad, profundidad inconcebible, precisión divina.`;

      default:
        return `${basePrompt} Juega movimientos sólidos y seguros.`;
    }
  }

  /**
   * Obtiene el rango de ELO según la dificultad
   */
  private getELORange(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return '800-1000';
      case 'intermediate': return '1200-1600';
      case 'hard': return '1800-2200';
      case 'expert': return '2400-2700';
      case 'world-class': return '2800-3000';
      default: return '1400';
    }
  }

  /**
   * Obtiene estadísticas de rendimiento de la IA
   */
  getPerformanceStats(): { model: string; avgResponseTime: string; difficulty: string } {
    return {
      model: this.model,
      avgResponseTime: '~1-3 segundos',
      difficulty: 'Adaptativa según nivel'
    };
  }
}
