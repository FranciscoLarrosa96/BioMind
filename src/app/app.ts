import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import AOS from 'aos';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('BioMind');

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: false, // solo se anima una vez
    });
  }
}
