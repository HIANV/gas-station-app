import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'detalhes/:id',
    loadComponent: () => import('./pages/detalhes/detalhes.page').then((m) => m.DetalhesPage),
  },
];
