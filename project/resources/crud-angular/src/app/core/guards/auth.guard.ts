import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {map, of} from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getJwtConfig().pipe(
    map(config => {
      if (!config.jwt_enabled) return true;

      if (authService.isAuthenticated() || state.url === '/user/add') {
        return true;
      }

      router.navigate(['/login']);
      return false;
    }),
    catchError(() => {
      if (authService.isAuthenticated()) return of(true);
      router.navigate(['/login']);
      return of(false);
    })
  );
};
