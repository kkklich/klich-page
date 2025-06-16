import { Component } from '@angular/core';
import { CurriculumVitaeComponent } from "./components/curriculum-vitae/curriculum-vitae.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [CurriculumVitaeComponent]
})
export class AppComponent {
  title = 'Krzysztof Klich';
}
