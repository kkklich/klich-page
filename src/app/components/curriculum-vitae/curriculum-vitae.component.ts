import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-curriculum-vitae',
  imports: [CommonModule],
  templateUrl: './curriculum-vitae.component.html',
  styleUrl: './curriculum-vitae.component.scss'
})
export class CurriculumVitaeComponent {


  sections = ['hero', 'about', 'experience', 'skills', 'education', 'hobbies'];

  particles = Array.from({ length: 20 }, (_, i) => ({
    size: Math.random() * 6 + 2,
    color: i % 3 === 0 ? '#66cc99' : i % 3 === 1 ? '#4a9eff' : '#a855f7',
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 5
  }));
}
