import { Routes } from '@angular/router';
import { JobsDashboardComponent } from './components/jobs/jobs-dashboard/jobs-dashboard.component';
import { CurriculumVitaeComponent } from './components/curriculum-vitae/curriculum-vitae.component';

export const routes: Routes = [
    { path: 'jobs', component: JobsDashboardComponent },
    { path: '**', component: CurriculumVitaeComponent }
];
