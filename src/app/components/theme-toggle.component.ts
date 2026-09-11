import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="themeService.toggleDarkMode()"
      class="group inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm transition-[box-shadow,transform] duration-200 ease-[var(--ease-out)] hover:shadow-md active:scale-95"
      [title]="themeService.isDarkMode() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    >
      <span class="relative block h-5 w-5">
        <!-- Sun Icon (Light Mode) -->
        <svg
          class="absolute inset-0 h-5 w-5 text-yellow-500 transition-[opacity,transform] duration-300 ease-[var(--ease-out)]"
          [class]="themeService.isDarkMode() ? 'opacity-0 -rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>

        <!-- Moon Icon (Dark Mode) -->
        <svg
          class="absolute inset-0 h-5 w-5 text-blue-400 transition-[opacity,transform] duration-300 ease-[var(--ease-out)]"
          [class]="themeService.isDarkMode() ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-75'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
      </span>

      <!-- Toggle Text -->
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 ease-[var(--ease-out)] group-hover:text-primary-600 dark:group-hover:text-primary-400">
        {{themeService.isDarkMode() ? 'Claro' : 'Oscuro'}}
      </span>
    </button>
  `
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}
