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
  results: AnalysisItem[];
  summary: string;
  recommendations: string[];
}

interface AnalysisItem {
  test_name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  [key: string]: any; // Para permitir propiedades dinámicas como explanation y warning
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

      const prompt = `Analiza este PDF de análisis médico de laboratorio argentino y extrae toda la información.

IMPORTANTE: Este laboratorio puede ser UNILAB, PEREZ CAMBET u otro. Los valores pueden ser:
- Numéricos: "129 mg/dL", "7,3 kUI/L"
- Cualitativos: "NEGATIVO", "POSITIVO", "menor que 1,9 U"
- En proceso: "Resultado en proceso", "En proceso..."

INSTRUCCIONES:
1. Extrae TODOS los análisis, incluso los cualitativos (NEGATIVO, POSITIVO, etc.)
2. Para valores numéricos, compara con rangos de referencia
3. Para valores cualitativos: NEGATIVO = normal, POSITIVO = puede ser anormal
4. Para valores "en proceso": marcar como normal temporalmente
5. SIEMPRE incluye advertencias para valores anormales

TIPOS DE ANÁLISIS A EXTRAER:
- INMUNOSEROLOGÍA: Anti-transglutaminasa, Inmunoglobulina A, etc.
- PERFIL TIROIDEO: TSH, T4, anticuerpos
- SEROLOGÍA: Helicobacter pylori, Hepatitis, etc.
- EXAMEN DE ORINA: Color, aspecto, densidad, proteínas, etc.
- ESTUDIOS EN MATERIA FECAL: Sangre oculta

ADVERTENCIAS ESPECÍFICAS:
- Anticuerpos positivos: "⚠️ Resultado positivo puede indicar enfermedad autoinmune. Consulte con su médico"
- Inmunoglobulina alta: "⚠️ Puede indicar inflamación o infección. Requiere evaluación médica"
- TSH alterada: "⚠️ Alteración tiroidea. Consulte con endocrinólogo"
- Proteínas en orina: "⚠️ Posible problema renal. Consulte con su médico"
- Sangre oculta positiva: "⚠️ Requiere evaluación gastroenterológica urgente"

FORMATO JSON (sin caracteres especiales que rompan el JSON):
{
  "patient_name": "nombre",
  "test_date": "fecha", 
  "laboratory": "laboratorio",
  "results": [
    {
      "test_name": "nombre completo del análisis",
      "value": "valor exacto encontrado",
      "unit": "unidad si hay",
      "reference_range": "rango normal si hay",
      "status": "normal/high/low/critical",
      "explanation": "explicación simple sin comillas internas",
      "warning": "advertencia específica o null"
    }
  ],
  "summary": "resumen del estado general",
  "recommendations": ["recomendaciones generales"]
}`;

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
            required: ['patient_name', 'results', 'summary'],
            properties: {
              patient_name: { type: 'STRING', description: 'Nombre del paciente' },
              test_date: { type: 'STRING', description: 'Fecha del análisis' },
              laboratory: { type: 'STRING', description: 'Nombre del laboratorio' },
              results: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  required: ['test_name', 'value', 'status', 'explanation'],
                  properties: {
                    test_name: { type: 'STRING', description: 'Nombre del análisis' },
                    value: { type: 'STRING', description: 'Valor obtenido' },
                    unit: { type: 'STRING', description: 'Unidad de medida' },
                    reference_range: { type: 'STRING', description: 'Rango de referencia normal' },
                    status: { type: 'STRING', enum: ['normal', 'high', 'low', 'critical'], description: 'Estado del valor' },
                    explanation: { type: 'STRING', description: 'Explicación simple de qué es este análisis' },
                    warning: { type: 'STRING', description: 'Advertencia específica para valores altos/críticos, null si es normal' }
                  }
                }
              },
              summary: { type: 'STRING', description: 'Resumen general del análisis' },
              recommendations: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Recomendaciones generales'
              }
            }
          },
          maxOutputTokens: 4000
        }
      };

      // Crear un timeout para la petición
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

      const resp = await fetch(`${environment.apiBase}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash-lite',
          payload: body
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errorText = await resp.text().catch(() => '');
        throw new Error(errorText || `Error HTTP ${resp.status}`);
      }

      const raw = await resp.json();
      const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      // Limpiar el texto JSON para evitar errores de parsing
      let cleanText = text.trim();
      
      // Remover posibles marcadores de código si existen
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      }
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      let result: AnalysisResult;
      
      try {
        result = JSON.parse(cleanText) as AnalysisResult;
        
        // Validar que el resultado tenga la estructura mínima esperada
        if (!result || typeof result !== 'object') {
          throw new Error('Respuesta inválida de la IA');
        }
        
        if (!result.results || !Array.isArray(result.results)) {
          throw new Error('La respuesta no contiene resultados válidos');
        }
        
        // Asegurar valores por defecto para evitar errores
        result.patient_name = result.patient_name || 'No especificado';
        result.test_date = result.test_date || '';
        result.laboratory = result.laboratory || '';
        result.summary = result.summary || 'Análisis procesado correctamente';
        result.recommendations = result.recommendations || ['Consulte con su médico para la interpretación completa'];
        
        // Validar cada resultado
        result.results = result.results.map(item => ({
          test_name: item.test_name || 'Sin nombre',
          value: item.value || 'N/A',
          unit: item.unit || '',
          reference_range: item.reference_range || '',
          status: ['normal', 'high', 'low', 'critical'].includes(item.status) ? item.status : 'normal',
          explanation: item['explanation'] || 'Análisis médico',
          warning: item['warning'] || null
        }));
        
        this.analysisResult.set(result);
        
      } catch (parseError: any) {
        console.error('Error al parsear JSON:', parseError);
        console.error('Texto recibido:', cleanText);
        
        // Si el JSON parsing falla, crear un resultado de fallback
        const fallbackResult: AnalysisResult = {
          patient_name: 'Error en el procesamiento',
          test_date: '',
          laboratory: 'Formato no reconocido',
          results: [],
          summary: 'Hubo un problema al procesar el análisis. El formato del PDF de este laboratorio podría no ser completamente compatible con el sistema.',
          recommendations: [
            'Verifique que el PDF sea un análisis médico válido y de buena calidad',
            'Intente con una versión más reciente del análisis',
            'Contacte al laboratorio para obtener el análisis en formato digital',
            'Consulte con su médico para la interpretación manual del análisis'
          ]
        };
        
        this.analysisResult.set(fallbackResult);
        this.error.set('El análisis se procesó parcialmente. El formato de este laboratorio podría requerir ajustes adicionales.');
      }

    } catch (e: any) {
      console.error('Error completo en análisis:', e);
      
      let errorMessage = 'No se pudo analizar el PDF.';
      
      if (e.name === 'AbortError') {
        errorMessage = 'El análisis tardó demasiado tiempo. El PDF podría ser muy grande o complejo.';
      } else if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
        errorMessage = 'Error de conexión. Verifique su conexión a internet y que el servidor esté funcionando.';
      } else if (e.message?.includes('JSON')) {
        errorMessage = 'Error al procesar la respuesta del análisis. Intente nuevamente.';
      } else if (e.message?.includes('HTTP 400')) {
        errorMessage = 'El PDF no pudo ser procesado. Verifique que sea un análisis médico válido y no esté dañado.';
      } else if (e.message?.includes('HTTP 429')) {
        errorMessage = 'Demasiadas solicitudes. Espere unos minutos antes de intentar nuevamente.';
      } else if (e.message?.includes('HTTP 500')) {
        errorMessage = 'Error temporal del servidor. Intente nuevamente en unos minutos.';
      } else if (e.message?.includes('HTTP 503')) {
        errorMessage = 'El servicio está temporalmente no disponible. Intente más tarde.';
      }
      
      this.error.set(errorMessage);
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
    if (name.includes('transaminasas') || name.includes('alt') || name.includes('ast') || name.includes('got') || name.includes('gpt')) {
      return '• Hepatitis • Daño hepático • Esteatosis hepática • Cirrosis • Medicamentos hepatotóxicos • Alcoholismo • Infecciones virales';
    }
    if (name.includes('bilirrubina') || name.includes('bilirubin')) {
      return '• Ictericia • Hepatitis • Obstrucción biliar • Anemia hemolítica • Síndrome de Gilbert • Cirrosis';
    }
    if (name.includes('hemoglobina') || name.includes('hgb') || name.includes('hb')) {
      return '• Policitemia • Deshidratación • Enfermedad pulmonar crónica • Tabaquismo • Altitud elevada • Tumores productores de eritropoyetina';
    }
    if (name.includes('leucocitos') || name.includes('glóbulos blancos') || name.includes('wbc')) {
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
    if (name.includes('hemoglobina') || name.includes('hgb') || name.includes('hb')) {
      return '• Anemia ferropénica • Anemia crónica • Pérdida de sangre • Deficiencia nutricional • Enfermedad renal crónica • Talasemia';
    }
    if (name.includes('hematocrito') || name.includes('hct')) {
      return '• Anemia • Pérdida de sangre • Sobrehidratación • Deficiencias nutricionales • Enfermedad crónica • Hemólisis';
    }
    if (name.includes('hierro') || name.includes('iron')) {
      return '• Anemia ferropénica • Deficiencia dietética • Pérdida de sangre crónica • Malabsorción • Embarazo • Donación frecuente de sangre';
    }
    if (name.includes('leucocitos') || name.includes('glóbulos blancos') || name.includes('wbc')) {
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
    if (name.includes('hemoglobina') || name.includes('hgb') || name.includes('hb')) {
      return '• Anemia severa • Hemorragia aguda • Shock hipovolémico • Insuficiencia cardíaca • Necesidad de transfusión urgente';
    }
    if (name.includes('leucocitos') || name.includes('glóbulos blancos') || name.includes('wbc')) {
      return '• Sepsis • Leucemia aguda • Neutropenia severa • Infección sistémica grave • Shock séptico • Inmunosupresión crítica';
    }
    if (name.includes('plaquetas') || name.includes('platelets')) {
      return '• Trombocitopenia severa • Riesgo de hemorragia espontánea • Púrpura trombocitopénica • CID • Necesidad de transfusión';
    }

    return '• ATENCIÓN MÉDICA URGENTE: Este valor crítico requiere evaluación inmediata para prevenir complicaciones graves';
  }
}
