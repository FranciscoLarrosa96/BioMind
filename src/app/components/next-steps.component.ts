import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AnalysisOverallStatus } from './analysis-status-summary.component';

@Component({
  selector: 'app-next-steps',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="rounded-2xl border border-gray-100 bg-white p-6 shadow-medical dark:border-gray-700 dark:bg-gray-800"
      aria-labelledby="next-steps-title"
    >
      <h3
        id="next-steps-title"
        class="mb-4 flex items-center text-xl font-bold text-gray-900 dark:text-white"
      >
        <svg
          class="mr-2 h-5 w-5 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
        Qué hacer ahora
      </h3>
      <div class="space-y-3">
        @for (step of steps; track step) {
        <div class="flex items-start gap-3">
          <span
            class="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full"
            [ngClass]="dotClass"
          ></span>
          <p class="text-gray-700 dark:text-gray-300">{{ step }}</p>
        </div>
        }
      </div>
    </section>
  `,
})
export class NextStepsComponent {
  @Input({ required: true }) status!: AnalysisOverallStatus;

  get steps(): string[] {
    if (this.status === 'Atención') {
      return [
        'Consultar con un profesional de salud lo antes posible.',
        'Si presentás síntomas importantes, acudí a una guardia.',
        'No demores la consulta médica.',
      ];
    }
    if (this.status === 'Revisar') {
      return [
        'Consultar los valores marcados con un profesional.',
        'Verificar los rangos de referencia del laboratorio.',
        'No tomar decisiones médicas solo con esta herramienta.',
      ];
    }
    return [
      'Conservar este análisis para futuros controles.',
      'Consultar con tu médico si tenés síntomas o dudas.',
      'Continuar con controles médicos habituales.',
    ];
  }

  get dotClass(): string {
    if (this.status === 'Atención') return 'bg-red-500';
    if (this.status === 'Revisar') return 'bg-orange-500';
    return 'bg-green-500';
  }
}
