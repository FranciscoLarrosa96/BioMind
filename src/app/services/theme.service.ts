import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Estado reactivo del tema
  private readonly _isDarkMode = signal(false);
  
  // Getter público para el estado del tema
  readonly isDarkMode = this._isDarkMode.asReadonly();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Detecta si el sistema está en modo oscuro
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Si el usuario ya eligió un modo antes, respetalo
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      this._isDarkMode.set(savedTheme === 'dark');
    } else {
      this._isDarkMode.set(prefersDark);
    }

    this.updateDarkModeClass();
  }

  private updateDarkModeClass(): void {
    const html = document.documentElement;
    if (this._isDarkMode()) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  // Método público para hacer toggle del dark mode
  toggleDarkMode(): void {
    const newDarkMode = !this._isDarkMode();
    this._isDarkMode.set(newDarkMode);
    
    // Guardar preferencia en localStorage
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    // Actualizar clases
    this.updateDarkModeClass();
  }

  // Método para establecer el tema específicamente
  setDarkMode(isDark: boolean): void {
    this._isDarkMode.set(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.updateDarkModeClass();
  }
}
