import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  
  // Función para mostrar notificaciones o mensajes
  showMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
    // Implementar notificaciones si es necesario
    console.log(`${type}: ${message}`);
  }

  // Función para formatear fechas
  formatDate(date: string): string {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('es-AR');
    } catch {
      return date;
    }
  }

  // Función para validar archivos PDF
  isValidPDF(file: File): boolean {
    return file.type === 'application/pdf' && file.size > 0;
  }
}
