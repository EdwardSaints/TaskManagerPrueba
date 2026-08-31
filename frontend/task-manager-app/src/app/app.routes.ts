import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  {
    path: 'tasks',
    loadComponent: () => import('./features/tasks/task-list/task-list.component').then(m => m.TaskListComponent)
  },
  {
    path: 'reports/pending',
    loadComponent: () => import('./features/reports/pending-report/pending-report.component').then(m => m.PendingReportComponent)
  }
];
