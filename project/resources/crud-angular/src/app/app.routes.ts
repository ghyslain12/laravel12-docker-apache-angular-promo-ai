import { Routes } from '@angular/router';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)},
  { path: 'home', loadChildren: () => import('./features/home/home.routes').then(m => m.homeRoutes), canActivate: [authGuard] },
  { path: 'sale', loadChildren: () => import('./features/sales/provisioning.routes').then(m => m.provisioningRoutes), canActivate: [authGuard] },
  { path: 'ticket', loadChildren: () => import('./features/tickets/ticketing.routes').then(m => m.ticketingRoutes), canActivate: [authGuard] },
  { path: 'user', loadChildren: () => import('./features/users/users.routes').then(m => m.usersRoutes), canActivate: [authGuard] },
  { path: 'client', loadChildren: () => import('./features/clients/clients.routes').then(m => m.clientsRoutes), canActivate: [authGuard] },
  { path: 'material', loadChildren: () => import('./features/materials/materials.routes').then(m => m.materialsRoutes), canActivate: [authGuard] },
  { path: 'promotion', loadChildren: () => import('./features/promotions/promotions.routes').then(m => m.promotionsRoutes), canActivate: [authGuard] }, // ← nouveau
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];

