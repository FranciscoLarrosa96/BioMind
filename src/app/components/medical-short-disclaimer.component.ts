import { Component } from '@angular/core';

@Component({
  selector: 'app-medical-short-disclaimer',
  standalone: true,
  template: `
    <div
      class="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100"
      role="note"
      aria-label="Aviso medico"
    >
      <i
        class="fa-solid fa-triangle-exclamation mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-500"
        aria-hidden="true"
      ></i>
      <p class="text-sm font-medium leading-relaxed">
        Información orientativa generada con IA. No reemplaza la consulta
        médica profesional.
      </p>
    </div>
  `,
})
export class MedicalShortDisclaimerComponent {}
