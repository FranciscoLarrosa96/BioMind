import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AnalysisOverallStatus } from './analysis-status-summary.component';

@Component({
  selector: 'app-next-steps',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      aria-labelledby="next-steps-title"
    >
      <h3
        id="next-steps-title"
        class="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white"
      >
        <i class="fa-solid fa-arrow-right text-primary-600" aria-hidden="true"></i>
        Qué hacer ahora
      </h3>
      <div class="space-y-3">
        @for (step of steps; track step) {
        <div class="flex items-start gap-3">
          <span
            class="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full"
            [ngClass]="dotClass"
          ></span>
          <p class="text-zinc-700 dark:text-zinc-300">{{ step }}</p>
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
    if (this.status === 'Atención') return 'bg-rose-500';
    if (this.status === 'Revisar') return 'bg-amber-500';
    return 'bg-emerald-500';
  }
}
