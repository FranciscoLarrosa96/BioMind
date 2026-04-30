import { Component } from '@angular/core';

@Component({
  selector: 'app-medical-short-disclaimer',
  standalone: true,
  template: `
    <div
      class="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900 shadow-sm dark:border-blue-800/70 dark:bg-blue-900/20 dark:text-blue-100"
      role="note"
      aria-label="Aviso medico"
    >
      <svg
        class="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <p class="text-sm font-medium leading-relaxed">
        Información orientativa generada con IA. No reemplaza la consulta
        médica profesional.
      </p>
    </div>
  `,
})
export class MedicalShortDisclaimerComponent {}
