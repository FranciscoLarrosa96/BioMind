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
      class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      aria-labelledby="analysis-status-title"
    >
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Estado general
          </p>
          <h3
            id="analysis-status-title"
            class="mt-1 text-2xl font-bold text-zinc-900 dark:text-white"
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
        <div class="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
          <p class="text-2xl font-bold text-zinc-900 dark:text-white">
            {{ summary.total }}
          </p>
          <p class="text-sm text-zinc-600 dark:text-zinc-300">Total</p>
        </div>
        <div class="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
          <p class="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {{ summary.normal }}
          </p>
          <p class="text-sm text-emerald-700 dark:text-emerald-300">Normales</p>
        </div>
        <div class="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
          <p class="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {{ summary.outOfRange }}
          </p>
          <p class="text-sm text-amber-700 dark:text-amber-300">Fuera de rango</p>
        </div>
        <div class="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800">
          <p class="text-2xl font-bold text-zinc-700 dark:text-zinc-200">
            {{ summary.withoutRange }}
          </p>
          <p class="text-sm text-zinc-600 dark:text-zinc-300">Sin rango</p>
        </div>
        <div class="rounded-xl bg-rose-50 p-4 dark:bg-rose-900/20">
          <p class="text-2xl font-bold text-rose-700 dark:text-rose-300">
            {{ summary.critical }}
          </p>
          <p class="text-sm text-rose-700 dark:text-rose-300">Críticos</p>
        </div>
      </div>

      @if (summary.withoutRange > 0) {
      <div
        class="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300"
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
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
    }
    if (status === 'Revisar') {
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    }
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
  }
}
