import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilService } from '../services/util';
import { ThemeService } from '../services/theme.service';
import { ThemeToggleComponent } from '../components/theme-toggle.component';
import { environment } from '../../environments/environment';

interface AnalysisResult {
  patient_name: string;
  test_date: string;
  laboratory: string;
  doctor: string;
  results: AnalysisItem[];
  summary: string;
  recommendations: string[];
  confidence: number;
}

interface AnalysisItem {
  test_name: string;
  value: string;
  unit: string;
  reference_range: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  explanation: string;
  simplified_explanation: string;
}

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeToggleComponent],
  templateUrl: './analysis.html',
  styleUrl: './analysis.scss'
})
export class Analysis {
  utilService = inject(UtilService);
  themeService = inject(ThemeService);

  file = signal<File | null>(null);
  error = signal<string | null>(null);
  isProcessing = signal<boolean>(false);
  analysisResult = signal<AnalysisResult | null>(null);
  isDragOver = signal<boolean>(false);
  showDetailedView = signal<boolean>(false);

  // Computed para estadísticas rápidas
  stats = computed(() => {
    const result = this.analysisResult();
    if (!result) return null;

    const total = result.results.length;
    const normal = result.results.filter(r => r.status === 'normal').length;
    const high = result.results.filter(r => r.status === 'high').length;
    const low = result.results.filter(r => r.status === 'low').length;
    const critical = result.results.filter(r => r.status === 'critical').length;

    return { total, normal, high, low, critical };
  });

  onPick(e: Event) {
    this.error.set(null);
    this.analysisResult.set(null);
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0] || null;
    this.handleFile(f);
  }

  // Métodos para drag & drop
  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragOver.set(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const f = files[0];
      this.handleFile(f);
    }
  }

  private handleFile(f: File | null) {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      this.error.set('El archivo debe ser un PDF de análisis médico.');
      return;
    }
    this.file.set(f);
  }

  limpiar() {
    this.file.set(null);
    this.analysisResult.set(null);
    this.error.set(null);
    this.showDetailedView.set(false);
  }

  // helper: leer el PDF como base64
  async fileToBase64(file: File): Promise<string> {
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    return dataUrl.split(',')[1] || '';
  }

  async analyzeWithAI(): Promise<void> {
    const f = this.file();
    if (!f) {
      this.error.set('Seleccioná un PDF de análisis primero');
      return;
    }

    this.isProcessing.set(true);
    this.error.set(null);

    try {
      const b64 = await this.fileToBase64(f);

      const prompt = `Analiza este PDF de análisis médico de laboratorio y extrae la información completa. 

⚠️ IMPORTANTE: Responde SIEMPRE en ESPAÑOL. Todas las explicaciones, recomendaciones y textos deben estar en español.

INSTRUCCIONES:
1. Identifica TODOS los valores de análisis (hemograma, química sanguínea, coagulograma, etc.)
2. Para cada valor, determina si está NORMAL, ALTO, BAJO o CRÍTICO comparando con los rangos de referencia
3. Proporciona explicaciones SIMPLES en ESPAÑOL que cualquier persona pueda entender
4. NO des consejos médicos específicos, solo explica qué significa cada valor
5. Incluye recomendaciones generales en ESPAÑOL sobre cuándo consultar al médico

IMPORTANTE: 
- RESPONDE ÚNICAMENTE EN ESPAÑOL
- Usa lenguaje simple y comprensible para el público general hispanohablante
- Evita terminología médica compleja, usa términos simples en español
- Siempre recomienda consultar con un profesional médico
- Marca como "critical" valores que requieren atención médica urgente
- Todas las explicaciones deben estar en español argentino/latinoamericano

Extrae TODA la información del análisis y devuelve un JSON estructurado con todo el contenido en ESPAÑOL.`;

      const body = {
        contents: [{
          parts: [
            { inline_data: { mime_type: f.type || 'application/pdf', data: b64 } },
            { text: prompt }
          ]
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            required: ['patient_name', 'results', 'summary', 'confidence'],
            properties: {
              patient_name: { type: 'STRING', description: 'Nombre del paciente' },
              test_date: { type: 'STRING', description: 'Fecha del análisis (YYYY-MM-DD)' },
              laboratory: { type: 'STRING', description: 'Nombre del laboratorio' },
              doctor: { type: 'STRING', description: 'Médico solicitante' },
              results: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  required: ['test_name', 'value', 'status', 'explanation', 'simplified_explanation'],
                  properties: {
                    test_name: { type: 'STRING', description: 'Nombre del análisis' },
                    value: { type: 'STRING', description: 'Valor obtenido' },
                    unit: { type: 'STRING', description: 'Unidad de medida' },
                    reference_range: { type: 'STRING', description: 'Rango de referencia normal' },
                    status: { type: 'STRING', enum: ['normal', 'high', 'low', 'critical'], description: 'Estado del valor' },
                    explanation: { type: 'STRING', description: 'Explicación técnica del análisis' },
                    simplified_explanation: { type: 'STRING', description: 'Explicación simple para el paciente' }
                  }
                }
              },
              summary: { type: 'STRING', description: 'Resumen general del análisis en lenguaje simple' },
              recommendations: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Recomendaciones generales (no consejos médicos específicos)'
              },
              confidence: { type: 'NUMBER', minimum: 0, maximum: 1, description: 'Confianza en el análisis' }
            }
          },
          maxOutputTokens: 4000
        }
      };

      const resp = await fetch(`${environment.apiBase}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash-lite',
          payload: body
        }),
      });

      if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        throw new Error(t || `HTTP ${resp.status}`);
      }

      const raw = await resp.json();
      const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const result = JSON.parse(text) as AnalysisResult;

      this.analysisResult.set(result);

    } catch (e: any) {
      this.error.set(e?.message || 'No se pudo analizar el PDF. Verificá que sea un análisis médico válido.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'normal': return '✓';
      case 'high': return '↑';
      case 'low': return '↓';
      case 'critical': return '⚠';
      default: return '?';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'normal': return 'Normal';
      case 'high': return 'Alto';
      case 'low': return 'Bajo';
      case 'critical': return 'Crítico';
      default: return 'Sin datos';
    }
  }
}
