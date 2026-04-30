import { Component, computed, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UtilService } from '../services/util';
import { ThemeService } from '../services/theme.service';
import { ThemeToggleComponent } from '../components/theme-toggle.component';
import {
  AnalysisOverallStatus,
  AnalysisStatusSummary,
  AnalysisStatusSummaryComponent,
} from '../components/analysis-status-summary.component';
import { MedicalShortDisclaimerComponent } from '../components/medical-short-disclaimer.component';
import { NextStepsComponent } from '../components/next-steps.component';
import { environment } from '../../environments/environment';

interface AnalysisResult {
  patient_name: string;
  test_date: string;
  laboratory: string;
  results: AnalysisItem[];
  summary: string;
  recommendations: string[];
}

interface AnalysisItem {
  test_name: string;
  value: string | null;
  unit?: string | null;
  reference_range?: string | null;
  status: 'normal' | 'high' | 'low' | 'critical';
  simplified_explanation: string;
  clinical_interpretation: string;
  warning?: string | null;
  // Mantener compatibilidad con campos antiguos
  explanation?: string;
}

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ThemeToggleComponent,
    RouterLink,
    MedicalShortDisclaimerComponent,
    AnalysisStatusSummaryComponent,
    NextStepsComponent,
  ],
  templateUrl: './analysis.html',
  styleUrl: './analysis.scss',
})
export class Analysis {
  utilService = inject(UtilService);
  themeService = inject(ThemeService);
  private route = inject(ActivatedRoute);

  file = signal<File | null>(null);
  error = signal<string | null>(null);
  isProcessing = signal<boolean>(false);
  analysisResult = signal<AnalysisResult | null>(null);
  isDragOver = signal<boolean>(false);
  showDetailedView = signal<boolean>(false);
  showOnlyAbnormal = signal<boolean>(false);
  expandedItems = signal<Set<string>>(new Set());
  compactView = signal<boolean>(true); // Vista compacta por defecto
  aiExplanations = signal<Record<string, string>>({});
  explainingItems = signal<Record<string, boolean>>({});

  constructor() {
    // Effect para limpiar errores cuando se selecciona un nuevo archivo
    effect(() => {
      const file = this.file();
      if (file) {
        this.error.set(null);
        this.analysisResult.set(null);
      }
    });

    // Effect para scroll automático cuando hay resultados
    effect(() => {
      const results = this.analysisResult();
      if (results) {
        // Pequeño delay para que el DOM se actualice
        setTimeout(() => {
          const resultsSection = document.getElementById('results-section');
          if (resultsSection) {
            resultsSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }, 100);
      }
    });

    // Effect para logging reactivo (útil para debugging)
    effect(() => {
      const stats = this.stats();
      if (stats && stats.total > 0) {
        console.log('📊 Estadísticas actualizadas:', stats);
      }
    });
  }

  private demoBootstrap = (() => {
    if (this.route.snapshot.queryParamMap.get('demo') === 'true') {
      setTimeout(() => this.loadDemoAnalysis(), 0);
    }
    return true;
  })();

  // Computed para estadísticas rápidas
  stats = computed(() => {
    const result = this.analysisResult();
    if (!result) return null;

    const total = result.results.length;
    const normal = result.results.filter((r) => r.status === 'normal').length;
    const high = result.results.filter((r) => r.status === 'high').length;
    const low = result.results.filter((r) => r.status === 'low').length;
    const critical = result.results.filter(
      (r) => r.status === 'critical'
    ).length;

    const withoutRange = result.results.filter(
      (r) => !r.reference_range || !r.reference_range.trim()
    ).length;
    const outOfRange = high + low;

    return { total, normal, high, low, critical, outOfRange, withoutRange };
  });

  analysisStatusSummary = computed<AnalysisStatusSummary | null>(() => {
    const stats = this.stats();
    if (!stats) return null;

    let overallStatus: AnalysisOverallStatus = 'Normal';

    if (stats.critical > 0) {
      overallStatus = 'Atención';
    } else if (stats.outOfRange > 0) {
      overallStatus = 'Revisar';
    }

    return {
      total: stats.total,
      normal: stats.normal,
      outOfRange: stats.outOfRange,
      withoutRange: stats.withoutRange,
      critical: stats.critical,
      overallStatus,
    };
  });

  // Computed para verificar si hay archivo seleccionado
  hasFile = computed(() => this.file() !== null);

  // Computed para verificar si hay resultados
  hasResults = computed(() => this.analysisResult() !== null);

  // Computed para verificar si puede analizar
  canAnalyze = computed(() => this.hasFile() && !this.isProcessing());

  // Computed para filtrar resultados por estado
  normalResults = computed(
    () =>
      this.analysisResult()?.results.filter((r) => r.status === 'normal') || []
  );

  abnormalResults = computed(
    () =>
      this.analysisResult()?.results.filter((r) => r.status !== 'normal') || []
  );

  criticalResults = computed(
    () =>
      this.analysisResult()?.results.filter((r) => r.status === 'critical') ||
      []
  );

  // Computed para mensajes de estado
  statusMessage = computed(() => {
    if (this.isProcessing()) return 'Analizando documento...';
    if (this.error()) return this.error();
    if (this.hasResults()) return '¡Análisis completado!';
    if (this.hasFile()) return 'Archivo listo para analizar';
    return 'Sube un PDF de análisis médico';
  });

  // Computed para el color del mensaje de estado
  statusColor = computed(() => {
    if (this.error()) return 'text-red-600 dark:text-red-400';
    if (this.hasResults()) return 'text-green-600 dark:text-green-400';
    if (this.hasFile()) return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-600 dark:text-gray-400';
  });

  // Computed para resultados visibles según el filtro
  visibleResults = computed(() => {
    const results = this.analysisResult()?.results || [];
    if (this.showOnlyAbnormal()) {
      return results.filter((r) => r.status !== 'normal');
    }
    return results;
  });

  // Computed para texto del botón de filtro
  filterButtonText = computed(() =>
    this.showOnlyAbnormal() ? 'Mostrar todos' : 'Solo anormales'
  );

  statusHeadline = computed(() => {
    const status = this.analysisStatusSummary()?.overallStatus;
    if (status === 'Atención') return '🔴 Se detectaron valores críticos';
    if (status === 'Revisar') return '🟡 Se detectaron valores para revisar';
    if (status === 'Normal') return '🟢 Tu análisis general es NORMAL';
    return '';
  });

  onPick(e: Event) {
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

  private loadDemoAnalysis() {
    this.isProcessing.set(true);
    this.error.set(null);
    this.file.set(this.createDemoPdfFile());

    setTimeout(() => {
      this.analysisResult.set({
        patient_name: 'Paciente Demo',
        test_date: '2026-04-29',
        laboratory: 'Laboratorio BioMind Demo',
        summary:
          'El análisis de ejemplo muestra la mayoría de los valores dentro del rango informado. Se detecta colesterol total elevado para revisar con un profesional y un estudio sin rango de referencia detectado.',
        recommendations: [
          'Revisar el valor elevado con un profesional de salud.',
          'Confirmar los rangos de referencia directamente en el informe del laboratorio.',
          'Usar esta interpretación como orientación y no como diagnóstico.',
        ],
        results: [
          {
            test_name: 'Glóbulos rojos',
            value: '4.80',
            unit: 'mill/mm3',
            reference_range: '4.20 - 5.40',
            status: 'normal',
            simplified_explanation:
              'Los glóbulos rojos ayudan a llevar oxígeno por todo tu cuerpo.',
            clinical_interpretation:
              'Este valor está dentro del rango informado por el laboratorio.',
          },
          {
            test_name: 'Glucosa',
            value: '92',
            unit: 'mg/dL',
            reference_range: '70 - 110',
            status: 'normal',
            simplified_explanation:
              'La glucosa muestra cuánta azúcar hay en la sangre al momento del análisis.',
            clinical_interpretation:
              'Este valor está dentro del rango informado por el laboratorio.',
          },
          {
            test_name: 'Colesterol total',
            value: '228',
            unit: 'mg/dL',
            reference_range: 'Menor a 200',
            status: 'high',
            simplified_explanation:
              'El colesterol total resume parte de las grasas que circulan en la sangre.',
            clinical_interpretation:
              'Un valor elevado puede requerir revisión del contexto cardiovascular, hábitos y otros marcadores como HDL, LDL y triglicéridos.',
            warning:
              'Valor elevado para conversar con un profesional de salud.',
          },
          {
            test_name: 'Vitamina D',
            value: '31',
            unit: 'ng/mL',
            reference_range: null,
            status: 'normal',
            simplified_explanation:
              'La vitamina D participa en la salud ósea y en varias funciones del organismo.',
            clinical_interpretation:
              'No se detectó rango de referencia en el informe de ejemplo. Conviene verificarlo con el laboratorio o el médico.',
          },
        ],
      });
      this.isProcessing.set(false);
    }, 700);
  }

  private createDemoPdfFile(): File {
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] >>
endobj
trailer
<< /Root 1 0 R >>
%%EOF`;
    return new File([pdfContent], 'analisis-demo-biomind.pdf', {
      type: 'application/pdf',
    });
  }

  limpiar() {
    this.file.set(null);
    this.analysisResult.set(null);
    this.error.set(null);
    this.showDetailedView.set(false);
    this.expandedItems.set(new Set());
    this.compactView.set(true);
    this.aiExplanations.set({});
    this.explainingItems.set({});
  }

  toggleItem(testName: string) {
    const current = this.expandedItems();
    const newSet = new Set(current);
    if (newSet.has(testName)) {
      newSet.delete(testName);
    } else {
      newSet.add(testName);
    }
    this.expandedItems.set(newSet);
  }

  isExpanded(testName: string): boolean {
    return this.expandedItems().has(testName);
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

  // Helper para extraer patrones de texto plano
  private extractPatternFromText(text: string, pattern: RegExp): string | null {
    const match = text.match(pattern);
    return match ? match[1].trim() : null;
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

      const prompt = `Analiza este PDF de análisis médico y extrae información ESTRUCTURADA.

⚠️ CRÍTICO: Responde SIEMPRE con JSON válido en español, incluso si el formato es desconocido.

IMPORTANTE: Si NO puedes extraer valores específicos, devuelve un JSON con results vacío pero con información del documento.

ESTRUCTURA JSON OBLIGATORIA (copia esto y completa):
{
  "patient_name": "nombre del paciente o null",
  "test_date": "fecha en formato DD/MM/YYYY o null",
  "laboratory": "nombre del laboratorio o null",
  "results": [
    {
      "test_name": "Nombre del análisis",
      "value": "valor encontrado o null",
      "unit": "unidad o null",
      "reference_range": "rango normal o null",
      "status": "normal",
      "simplified_explanation": "Explicación simple para pacientes, en lenguaje cotidiano y sin tecnicismos",
      "clinical_interpretation": "Un valor BAJO puede indicar X. Un valor ALTO puede indicar Y.",
      "warning": null
    }
  ],
  "summary": "Resumen del documento en español",
  "recommendations": ["Lista de recomendaciones en español"]
}

REGLAS ESTRICTAS:
1. SIEMPRE devuelve JSON válido, NUNCA texto plano
2. Si no encuentras valores: results = []
3. Si no sabes un campo: usa null
4. TODOS los textos en español
5. NO uses comillas dobles dentro de las strings
6. status solo puede ser: "normal", "high", "low", "critical"

TIPOS DE ANÁLISIS A BUSCAR:
- Hemograma: Glóbulos rojos, blancos, plaquetas, hemoglobina, hematocrito
- Química: Glucosa, colesterol, triglicéridos, creatinina, urea
- Tiroides: TSH, T3, T4
- Hígado: Transaminasas (ALT, AST), bilirrubina
- Coagulación: TP, KPTT, INR
- Orina: Proteínas, glucosa, sangre, leucocitos
- Y cualquier otro análisis médico

SI EL FORMATO ES DESCONOCIDO:
- results: []
- summary: "Documento de análisis médico detectado. Formato no estándar impide extracción automática."
- recommendations: ["Verifique el PDF manualmente", "Consulte con su médico"]

RESPONDE ÚNICAMENTE CON EL JSON, sin explicaciones adicionales.`;

      const body = {
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: f.type || 'application/pdf',
                  data: b64,
                },
              },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            required: ['patient_name', 'results', 'summary'],
            properties: {
              patient_name: {
                type: 'STRING',
                description: 'Nombre del paciente',
              },
              test_date: { type: 'STRING', description: 'Fecha del análisis' },
              laboratory: {
                type: 'STRING',
                description: 'Nombre del laboratorio',
              },
              results: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  required: [
                    'test_name',
                    'status',
                    'simplified_explanation',
                    'clinical_interpretation',
                  ],
                  properties: {
                    test_name: {
                      type: 'STRING',
                      description: 'Nombre completo del análisis',
                    },
                    value: {
                      type: 'STRING',
                      description: 'Valor obtenido, null si no disponible',
                    },
                    unit: {
                      type: 'STRING',
                      description: 'Unidad de medida, null si no disponible',
                    },
                    reference_range: {
                      type: 'STRING',
                      description: 'Rango de referencia, null si no disponible',
                    },
                    status: {
                      type: 'STRING',
                      enum: ['normal', 'high', 'low', 'critical'],
                      description: 'Estado del valor',
                    },
                    simplified_explanation: {
                      type: 'STRING',
                      description:
                        'Explicación simple para pacientes, en lenguaje cotidiano y sin tecnicismos',
                    },
                    clinical_interpretation: {
                      type: 'STRING',
                      description: 'Qué indican valores altos y bajos',
                    },
                    warning: {
                      type: 'STRING',
                      description:
                        'Advertencia específica para valores anormales, null si normal',
                    },
                  },
                },
              },
              summary: {
                type: 'STRING',
                description: 'Resumen general del análisis',
              },
              recommendations: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Recomendaciones generales',
              },
            },
          },
          maxOutputTokens: 10000,
        },
      };

      // Crear un timeout para la petición
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

      const resp = await fetch(`${environment.apiBase}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash-lite',
          payload: body,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errorText = await resp.text().catch(() => '');
        throw new Error(errorText || `Error HTTP ${resp.status}`);
      }

      const raw = await resp.json();
      console.log('🔍 Respuesta completa de la API:', raw);

      const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      console.log('📄 Texto extraído de la respuesta:', text);
      console.log('📏 Longitud del texto:', text.length);

      // Limpiar el texto JSON para evitar errores de parsing
      let cleanText = text.trim();

      // Remover posibles marcadores de código si existen
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      }
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      console.log('✨ Texto limpio para parsear:', cleanText);
      console.log('🔤 Primeros 200 caracteres:', cleanText.substring(0, 200));

      let result: AnalysisResult;

      try {
        console.log('🔄 Intentando parsear JSON...');
        result = JSON.parse(cleanText) as AnalysisResult;
        console.log('✅ JSON parseado exitosamente:', result);

        // Validar que el resultado tenga la estructura mínima esperada
        if (!result || typeof result !== 'object') {
          console.error('❌ Resultado no es un objeto válido');
          throw new Error('Respuesta inválida de la IA');
        }

        if (!result.results || !Array.isArray(result.results)) {
          console.error('❌ No hay array de resultados:', result.results);
          throw new Error('La respuesta no contiene resultados válidos');
        }

        console.log(
          '📊 Cantidad de resultados encontrados:',
          result.results.length
        );

        // Asegurar valores por defecto para evitar errores
        result.patient_name = result.patient_name || 'No especificado';
        result.test_date = result.test_date || '';
        result.laboratory = result.laboratory || '';
        result.summary = result.summary || 'Análisis procesado correctamente';
        result.recommendations = result.recommendations || [
          'Consulte con su médico para la interpretación completa',
        ];

        // Validar cada resultado
        result.results = result.results.map((item) => ({
          test_name: item.test_name || 'Sin nombre',
          value: item.value || null,
          unit: item.unit || null,
          reference_range: item.reference_range || null,
          status: ['normal', 'high', 'low', 'critical'].includes(item.status)
            ? item.status
            : 'normal',
          simplified_explanation:
            item.simplified_explanation ||
            item['explanation'] ||
            'Análisis médico de laboratorio',
          clinical_interpretation:
            item.clinical_interpretation ||
            'Los valores de este análisis pueden variar según múltiples factores. Consulte con su médico.',
          warning: item.warning || null,
          // Mantener compatibilidad
          explanation:
            item['explanation'] ||
            item.simplified_explanation ||
            'Análisis médico',
        }));

        this.analysisResult.set(result);
      } catch (parseError: any) {
        console.error('❌❌❌ ERROR AL PARSEAR JSON ❌❌❌');
        console.error('Error:', parseError);
        console.error('Mensaje:', parseError.message);
        console.error('Stack:', parseError.stack);
        console.error('📄 Texto que causó el error:', cleanText);
        console.error('📏 Longitud del texto:', cleanText?.length || 0);
        console.error(
          '🔤 Primeros 500 caracteres:',
          cleanText?.substring(0, 500) || 'vacío'
        );

        // Intentar extraer información básica del texto sin estructura JSON
        let partialData: any = {};

        try {
          // Buscar patrones comunes en la respuesta de texto plano
          const textLower = cleanText.toLowerCase();

          // Si la IA respondió en texto plano, intentar extraerlo
          if (
            textLower.includes('paciente') ||
            textLower.includes('laboratorio') ||
            textLower.includes('análisis')
          ) {
            partialData = {
              patient_name:
                this.extractPatternFromText(
                  cleanText,
                  /paciente[:\s]+([^\n]+)/i
                ) || 'No especificado',
              laboratory:
                this.extractPatternFromText(
                  cleanText,
                  /laboratorio[:\s]+([^\n]+)/i
                ) || 'No especificado',
              test_date:
                this.extractPatternFromText(
                  cleanText,
                  /fecha[:\s]+([^\n]+)/i
                ) || '',
              summary:
                'El análisis fue procesado pero el formato del laboratorio es diferente al estándar. La información extraída puede ser limitada.',
              results: [],
              recommendations: [
                'Este PDF tiene un formato no estándar',
                'Recomendamos contactar al laboratorio para obtener el análisis en formato digital estándar',
                'Consulte con su médico para la interpretación completa',
                'Si necesita procesamiento urgente, puede intentar subir el análisis nuevamente',
              ],
            };
          }
        } catch (extractError) {
          console.error('Error en extracción de texto:', extractError);
        }

        // Crear resultado de fallback mejorado
        const fallbackResult: AnalysisResult = {
          patient_name: partialData.patient_name || 'No especificado',
          test_date: partialData.test_date || '',
          laboratory:
            partialData.laboratory || 'Formato no reconocido completamente',
          results: partialData.results || [],
          summary:
            partialData.summary ||
            'El formato de este laboratorio tiene una estructura diferente al estándar. No pudimos extraer todos los valores automáticamente.',
          recommendations: partialData.recommendations || [
            '✓ El PDF es válido pero tiene un formato especial',
            '⚠️ Algunos valores pueden no haberse detectado automáticamente',
            '📋 Verifique manualmente los valores importantes en el PDF original',
            '👨‍⚕️ Consulte con su médico para la interpretación completa',
            '🔄 Si el laboratorio tiene versión digital actualizada, intente con esa',
          ],
        };

        this.analysisResult.set(fallbackResult);
        this.error.set(
          '⚠️ PDF procesado con limitaciones: El formato de este laboratorio requiere revisión manual. Verifique los valores importantes directamente en el PDF.'
        );
      }
    } catch (e: any) {
      console.error('Error completo en análisis:', e);

      let errorMessage = 'No se pudo analizar el PDF.';

      if (e.name === 'AbortError') {
        errorMessage =
          'El análisis tardó demasiado tiempo. El PDF podría ser muy grande o complejo.';
      } else if (
        e.message?.includes('Failed to fetch') ||
        e.message?.includes('NetworkError')
      ) {
        errorMessage =
          'Error de conexión. Verifique su conexión a internet y que el servidor esté funcionando.';
      } else if (e.message?.includes('JSON')) {
        errorMessage =
          'Error al procesar la respuesta del análisis. Intente nuevamente.';
      } else if (e.message?.includes('HTTP 400')) {
        errorMessage =
          'El PDF no pudo ser procesado. Verifique que sea un análisis médico válido y no esté dañado.';
      } else if (e.message?.includes('HTTP 429')) {
        errorMessage =
          'Demasiadas solicitudes. Espere unos minutos antes de intentar nuevamente.';
      } else if (e.message?.includes('HTTP 500')) {
        errorMessage =
          'Error temporal del servidor. Intente nuevamente en unos minutos.';
      } else if (e.message?.includes('HTTP 503')) {
        errorMessage =
          'El servicio está temporalmente no disponible. Intente más tarde.';
      }

      this.error.set(errorMessage);
    } finally {
      this.isProcessing.set(false);
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'normal':
        return '✓';
      case 'high':
        return '↑';
      case 'low':
        return '↓';
      case 'critical':
        return '⚠';
      default:
        return '?';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'high':
        return 'Alto';
      case 'low':
        return 'Bajo';
      case 'critical':
        return 'Crítico';
      default:
        return 'Sin datos';
    }
  }

  getPatientInterpretation(result: AnalysisItem): string {
    if (result.status === 'normal') {
      return 'Este resultado se encuentra dentro del rango esperado informado por el laboratorio. En principio, no sugiere una alteración en este parámetro aislado. Interpretalo siempre junto con tus síntomas, antecedentes y el resto del análisis.';
    }

    return (
      result.clinical_interpretation ||
      'Este resultado requiere interpretación clínica junto con tus antecedentes y el resto del análisis. Consulte con su médico.'
    );
  }

  getPatientMeaning(result: AnalysisItem): string {
    const base =
      result.simplified_explanation ||
      result.explanation ||
      'Este estudio forma parte del análisis de laboratorio y ayuda a evaluar un aspecto de tu salud.';

    if (result.status === 'normal') {
      return `${base} Cuando está dentro del rango informado por el laboratorio, en principio ese parámetro aislado no muestra una alteración.`;
    }

    if (result.status === 'critical') {
      return `${base} En este informe aparece marcado como crítico, por eso conviene consultar con un profesional de salud lo antes posible.`;
    }

    if (result.status === 'high') {
      return `${base} En este informe aparece por encima del rango de referencia, así que merece revisión médica dentro del contexto completo.`;
    }

    return `${base} En este informe aparece por debajo del rango de referencia, así que merece revisión médica dentro del contexto completo.`;
  }

  explanationKey(result: AnalysisItem): string {
    return result.test_name;
  }

  isExplaining(result: AnalysisItem): boolean {
    return Boolean(this.explainingItems()[this.explanationKey(result)]);
  }

  getAiExplanation(result: AnalysisItem): string | null {
    return this.aiExplanations()[this.explanationKey(result)] || null;
  }

  async explainBetter(result: AnalysisItem): Promise<void> {
    const key = this.explanationKey(result);
    if (this.isExplaining(result)) return;

    this.explainingItems.update((items) => ({ ...items, [key]: true }));

    const prompt = `Explicá este resultado de laboratorio para un paciente en español claro.

Reglas:
- No diagnostiques.
- No indiques medicación ni tratamiento.
- Tono educativo, prudente y simple.
- Máximo 4 oraciones.
- Cerrá recomendando consultar a un profesional si hay dudas o síntomas.

Estudio: ${result.test_name}
Valor: ${result.value || 'No disponible'} ${result.unit || ''}
Rango de referencia: ${result.reference_range || 'No detectado'}
Estado: ${this.getStatusText(result.status)}
Contexto actual: ${result.simplified_explanation || result.clinical_interpretation}`;

    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
      },
    };

    try {
      const resp = await fetch(`${environment.apiBase}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash-lite',
          payload: body,
        }),
      });

      if (!resp.ok) {
        throw new Error(`Error HTTP ${resp.status}`);
      }

      const raw = await resp.json();
      const text =
        raw?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No pudimos generar una explicación adicional en este momento.';

      this.aiExplanations.update((items) => ({
        ...items,
        [key]: text.trim(),
      }));
    } catch {
      this.aiExplanations.update((items) => ({
        ...items,
        [key]:
          'No pudimos generar una explicación adicional en este momento. Revisá el valor con tu médico si tenés dudas o síntomas.',
      }));
    } finally {
      this.explainingItems.update((items) => ({ ...items, [key]: false }));
    }
  }

  getHighValueConditions(testName: string): string {
    const name = testName.toLowerCase();

    if (name.includes('glucosa') || name.includes('glucose')) {
      return '• Diabetes mellitus • Resistencia a la insulina • Síndrome metabólico • Estrés • Medicamentos corticosteroides • Pancreatitis';
    }
    if (name.includes('colesterol total') || name.includes('cholesterol')) {
      return '• Hipercolesterolemia • Riesgo cardiovascular • Enfermedad hepática • Hipotiroidismo • Diabetes • Dieta rica en grasas saturadas';
    }
    if (name.includes('triglicéridos') || name.includes('triglycerides')) {
      return '• Hipertrigliceridemia • Síndrome metabólico • Resistencia a la insulina • Obesidad • Consumo excesivo de alcohol • Pancreatitis';
    }
    if (name.includes('urea') || name.includes('bun')) {
      return '• Insuficiencia renal • Deshidratación • Dieta rica en proteínas • Insuficiencia cardíaca • Sangrado gastrointestinal • Medicamentos nefrotóxicos';
    }
    if (name.includes('creatinina') || name.includes('creatinine')) {
      return '• Insuficiencia renal • Enfermedad renal crónica • Deshidratación severa • Obstrucción urinaria • Medicamentos nefrotóxicos';
    }
    if (name.includes('ácido úrico') || name.includes('uric acid')) {
      return '• Gota • Hiperuricemia • Síndrome metabólico • Insuficiencia renal • Dieta rica en purinas • Alcoholismo';
    }
    if (
      name.includes('transaminasas') ||
      name.includes('alt') ||
      name.includes('ast') ||
      name.includes('got') ||
      name.includes('gpt')
    ) {
      return '• Hepatitis • Daño hepático • Esteatosis hepática • Cirrosis • Medicamentos hepatotóxicos • Alcoholismo • Infecciones virales';
    }
    if (name.includes('bilirrubina') || name.includes('bilirubin')) {
      return '• Ictericia • Hepatitis • Obstrucción biliar • Anemia hemolítica • Síndrome de Gilbert • Cirrosis';
    }
    if (
      name.includes('hemoglobina') ||
      name.includes('hgb') ||
      name.includes('hb')
    ) {
      return '• Policitemia • Deshidratación • Enfermedad pulmonar crónica • Tabaquismo • Altitud elevada • Tumores productores de eritropoyetina';
    }
    if (
      name.includes('leucocitos') ||
      name.includes('glóbulos blancos') ||
      name.includes('wbc')
    ) {
      return '• Infección bacteriana • Leucemia • Estrés físico/emocional • Medicamentos • Inflamación • Necrosis tisular';
    }
    if (name.includes('neutrófilos') || name.includes('neutrophils')) {
      return '• Infección bacteriana aguda • Inflamación • Necrosis • Quemaduras • Medicamentos • Estrés • Tabaquismo';
    }

    return '• Consulte con su médico para una evaluación personalizada de las posibles causas de este valor elevado';
  }

  getLowValueConditions(testName: string): string {
    const name = testName.toLowerCase();

    if (name.includes('glucosa') || name.includes('glucose')) {
      return '• Hipoglucemia • Ayuno prolongado • Medicamentos hipoglucemiantes • Insulinoma • Enfermedad hepática • Insuficiencia suprarrenal';
    }
    if (
      name.includes('hemoglobina') ||
      name.includes('hgb') ||
      name.includes('hb')
    ) {
      return '• Anemia ferropénica • Anemia crónica • Pérdida de sangre • Deficiencia nutricional • Enfermedad renal crónica • Talasemia';
    }
    if (name.includes('hematocrito') || name.includes('hct')) {
      return '• Anemia • Pérdida de sangre • Sobrehidratación • Deficiencias nutricionales • Enfermedad crónica • Hemólisis';
    }
    if (name.includes('hierro') || name.includes('iron')) {
      return '• Anemia ferropénica • Deficiencia dietética • Pérdida de sangre crónica • Malabsorción • Embarazo • Donación frecuente de sangre';
    }
    if (
      name.includes('leucocitos') ||
      name.includes('glóbulos blancos') ||
      name.includes('wbc')
    ) {
      return '• Infección viral • Medicamentos • Quimioterapia • Enfermedades autoinmunes • Déficit inmunitario • Radiación';
    }
    if (name.includes('plaquetas') || name.includes('platelets')) {
      return '• Trombocitopenia • Medicamentos • Enfermedades autoinmunes • Infecciones virales • Cirrosis • Quimioterapia';
    }
    if (name.includes('albúmina') || name.includes('albumin')) {
      return '• Malnutrición • Enfermedad hepática • Enfermedad renal • Inflamación crónica • Malabsorción • Pérdida proteica';
    }
    if (name.includes('proteínas totales') || name.includes('total protein')) {
      return '• Malnutrición • Enfermedad hepática • Enfermedad renal • Malabsorción • Infecciones crónicas • Pérdida proteica';
    }
    if (name.includes('vitamina') || name.includes('vitamin')) {
      return '• Deficiencia nutricional • Malabsorción • Dieta inadecuada • Alcoholismo • Medicamentos • Enfermedades digestivas';
    }

    return '• Consulte con su médico para evaluar las posibles causas de este valor bajo y determinar si requiere suplementación';
  }

  getCriticalValueConditions(testName: string): string {
    const name = testName.toLowerCase();

    if (name.includes('glucosa') || name.includes('glucose')) {
      return '• Crisis diabética (hiperglucemia severa) • Cetoacidosis diabética • Estado hiperosmolar • Hipoglucemia severa • Shock • Coma';
    }
    if (name.includes('creatinina') || name.includes('creatinine')) {
      return '• Insuficiencia renal aguda • Falla renal • Obstrucción urinaria severa • Shock • Deshidratación crítica • Rabdomiólisis';
    }
    if (name.includes('potasio') || name.includes('potassium')) {
      return '• Arritmias cardíacas peligrosas • Hiperpotasemia/hipopotasemia severa • Paro cardíaco • Parálisis muscular • Insuficiencia renal';
    }
    if (
      name.includes('hemoglobina') ||
      name.includes('hgb') ||
      name.includes('hb')
    ) {
      return '• Anemia severa • Hemorragia aguda • Shock hipovolémico • Insuficiencia cardíaca • Necesidad de transfusión urgente';
    }
    if (
      name.includes('leucocitos') ||
      name.includes('glóbulos blancos') ||
      name.includes('wbc')
    ) {
      return '• Sepsis • Leucemia aguda • Neutropenia severa • Infección sistémica grave • Shock séptico • Inmunosupresión crítica';
    }
    if (name.includes('plaquetas') || name.includes('platelets')) {
      return '• Trombocitopenia severa • Riesgo de hemorragia espontánea • Púrpura trombocitopénica • CID • Necesidad de transfusión';
    }

    return '• ATENCIÓN MÉDICA URGENTE: Este valor crítico requiere evaluación inmediata para prevenir complicaciones graves';
  }
}
