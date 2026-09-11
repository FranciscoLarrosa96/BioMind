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
      icon: 'fa-solid fa-brain',
      title: 'Inteligencia artificial avanzada',
      description: 'Google Gemini AI lee tus estudios y extrae cada valor con precisión clínica.',
      featured: true
    },
    {
      icon: 'fa-solid fa-bolt',
      title: 'Resultados en segundos',
      description: 'Subís el PDF y en menos de 10 segundos tenés el análisis completo.'
    },
    {
      icon: 'fa-solid fa-magnifying-glass-chart',
      title: 'Interpretación clara',
      description: 'Cada valor técnico se traduce a una explicación que se entiende de una.'
    },
    {
      icon: 'fa-solid fa-shield-halved',
      title: '100% privado',
      description: 'Tus documentos se procesan al vuelo y no quedan almacenados.'
    },
    {
      icon: 'fa-solid fa-display',
      title: 'Interfaz moderna',
      description: 'Modo claro y oscuro, pensada para leerse bien en cualquier pantalla.'
    },
    {
      icon: 'fa-solid fa-globe',
      title: 'Multiplataforma',
      description: 'Funciona igual de bien en la computadora, la tablet o el celular.',
      inverted: true
    }
  ];

  steps = [
    {
      number: '01',
      title: 'Subí tu PDF',
      description: 'Arrastrá o seleccioná tu análisis médico en formato PDF.',
      icon: 'fa-solid fa-file-arrow-up'
    },
    {
      number: '02',
      title: 'La IA lo analiza',
      description: 'Gemini procesa el documento y extrae todos los valores.',
      icon: 'fa-solid fa-robot'
    },
    {
      number: '03',
      title: 'Resultados claros',
      description: 'Recibís una interpretación simple de cada valor, con recomendaciones.',
      icon: 'fa-solid fa-sparkles'
    }
  ];

  audiences = [
    {
      icon: 'fa-solid fa-user',
      title: 'Pacientes',
      description: 'Entendé tus análisis sin lenguaje técnico de por medio.'
    },
    {
      icon: 'fa-solid fa-user-doctor',
      title: 'Profesionales',
      description: 'Ahorrá tiempo explicando los estudios más habituales.'
    },
    {
      icon: 'fa-solid fa-hospital',
      title: 'Clínicas',
      description: 'Mejorá la experiencia de tus pacientes desde la primera consulta.'
    }
  ];

  goToAnalysis() {
    this.router.navigate(['/analysis']);
  }

  goToDemo() {
    this.router.navigate(['/analysis'], { queryParams: { demo: 'true' } });
  }
}
