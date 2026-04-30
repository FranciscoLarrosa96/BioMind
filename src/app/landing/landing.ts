import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeToggleComponent } from '../components/theme-toggle.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {
  constructor(private router: Router) {}

  features = [
    {
      icon: '🧠',
      title: 'Inteligencia Artificial Avanzada',
      description: 'Utiliza Google Gemini AI para analizar y extraer información de tus estudios médicos con precisión.'
    },
    {
      icon: '⚡',
      title: 'Resultados en Segundos',
      description: 'Sube tu PDF y obtén un análisis completo en menos de 10 segundos. Rápido, simple y efectivo.'
    },
    {
      icon: '📊',
      title: 'Interpretación Clara',
      description: 'Transforma datos técnicos en explicaciones sencillas. Comprende qué significa cada valor.'
    },
    {
      icon: '🔒',
      title: '100% Privado',
      description: 'Tus documentos se procesan para generar el análisis y no se almacenan permanentemente.'
    },
    {
      icon: '🎨',
      title: 'Interfaz Moderna',
      description: 'Diseño intuitivo y responsive con modo claro/oscuro. Desarrollado con Angular 20 y Tailwind CSS.'
    },
    {
      icon: '🌐',
      title: 'Multiplataforma',
      description: 'Funciona en cualquier dispositivo: computadora, tablet o móvil. Accede desde donde quieras.'
    }
  ];

  steps = [
    {
      number: '01',
      title: 'Sube tu PDF',
      description: 'Arrastra o selecciona tu análisis médico en formato PDF',
      icon: '📄'
    },
    {
      number: '02',
      title: 'IA Analiza',
      description: 'Google Gemini procesa el documento y extrae todos los valores',
      icon: '🤖'
    },
    {
      number: '03',
      title: 'Resultados Claros',
      description: 'Obtén interpretaciones simples de cada valor y recomendaciones',
      icon: '✨'
    }
  ];

  techStack = [
    { name: 'Angular 20', color: 'text-red-600' },
    { name: 'Google Gemini AI', color: 'text-blue-600' },
    { name: 'TypeScript', color: 'text-blue-500' },
    { name: 'Tailwind CSS', color: 'text-cyan-600' },
    { name: 'Signals API', color: 'text-purple-600' }
  ];

  audiences = [
    {
      icon: '👤',
      title: 'Pacientes',
      description: 'Entendé tus análisis sin lenguaje técnico'
    },
    {
      icon: '👨‍⚕️',
      title: 'Profesionales',
      description: 'Ahorra tiempo explicando estudios básicos'
    },
    {
      icon: '🏥',
      title: 'Clínicas',
      description: 'Mejorá la experiencia de tus pacientes'
    }
  ];

  goToAnalysis() {
    this.router.navigate(['/analysis']);
  }

  goToDemo() {
    this.router.navigate(['/analysis'], { queryParams: { demo: 'true' } });
  }

  scrollToFeatures() {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }
}
