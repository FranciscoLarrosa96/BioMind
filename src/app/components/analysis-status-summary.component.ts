import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type AnalysisOverallStatus = 'Normal' | 'Revisar' | 'Atención';

export interface AnalysisStatusSummary {
  total: number;
  normal: number;
  outOfRange: number;
  withoutRange: number;
  critical: number;
  overallStatus: AnalysisOverallStatus;
}

@Component({
  selector: 'app-analysis-status-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="rounded-2xl border border-gray-100 bg-white p-6 shadow-medical dark:border-gray-700 dark:bg-gray-800"
      aria-labelledby="analysis-status-title"
    >
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Estado general
          </p>
          <h3
            id="analysis-status-title"
            class="mt-1 text-2xl font-bold text-gray-900 dark:text-white"
          >
            Estado general del análisis
          </h3>
        </div>
        <span
          class="inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm font-bold"
          [ngClass]="statusBadgeClass(summary.overallStatus)"
        >
          {{ summary.overallStatus }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div class="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ summary.total }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300">Total</p>
        </div>
        <div class="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
          <p class="text-2xl font-bold text-green-700 dark:text-green-300">
            {{ summary.normal }}
          </p>
          <p class="text-sm text-green-700 dark:text-green-300">Normales</p>
        </div>
        <div class="rounded-xl bg-orange-50 p-4 dark:bg-orange-900/20">
          <p class="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {{ summary.outOfRange }}
          </p>
          <p class="text-sm text-orange-700 dark:text-orange-300">Fuera de rango</p>
        </div>
        <div class="rounded-xl bg-gray-100 p-4 dark:bg-gray-700">
          <p class="text-2xl font-bold text-gray-700 dark:text-gray-200">
            {{ summary.withoutRange }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300">Sin rango</p>
        </div>
        <div class="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
          <p class="text-2xl font-bold text-red-700 dark:text-red-300">
            {{ summary.critical }}
          </p>
          <p class="text-sm text-red-700 dark:text-red-300">Críticos</p>
        </div>
      </div>

      @if (summary.withoutRange > 0) {
      <div
        class="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
      >
        Algunos estudios no tienen rango de referencia detectado. Verificá esos
        valores con el laboratorio o tu médico si tenés dudas.
      </div>
      }
    </section>
  `,
})
export class AnalysisStatusSummaryComponent {
  @Input({ required: true }) summary!: AnalysisStatusSummary;

  statusBadgeClass(status: AnalysisOverallStatus): string {
    if (status === 'Atención') {
      return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
    if (status === 'Revisar') {
      return 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    }
    return 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
}
