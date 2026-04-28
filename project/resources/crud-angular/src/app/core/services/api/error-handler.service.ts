import {inject, Injectable} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

export interface ErrorResponse {
  message: string;
  code: string;
  details?: any;
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private readonly router = inject(Router);

  handleError(error: HttpErrorResponse): Observable<never> {
    let errorResponse: ErrorResponse;

    if (error.error instanceof ErrorEvent) {
      // Erreur client
      errorResponse = {
        code: 'CLIENT_ERROR',
        message: 'Une erreur réseau s\'est produite. Vérifiez votre connexion.',
        details: error.error.message
      };
    } else {
      // Erreur serveur
      switch (error.status) {
        case 400:
          errorResponse = {
            code: 'BAD_REQUEST',
            message: 'Données invalides',
            details: error.error
          };
          break;
        case 401:
          errorResponse = {
            code: 'UNAUTHORIZED',
            message: 'Session expirée. Veuillez vous reconnecter.',
          };
          // Rediriger vers login
          this.router.navigate(['/login']);
          break;
        case 403:
          errorResponse = {
            code: 'FORBIDDEN',
            message: 'Accès refusé',
          };
          break;
        case 404:
          errorResponse = {
            code: 'NOT_FOUND',
            message: 'Ressource non trouvée',
          };
          break;
        case 422:
          errorResponse = {
            code: 'VALIDATION_ERROR',
            message: 'Erreur de validation',
            details: error.error.errors
          };
          break;
        case 500:
          errorResponse = {
            code: 'SERVER_ERROR',
            message: 'Erreur serveur. Veuillez réessayer plus tard.',
          };
          break;
        default:
          errorResponse = {
            code: 'UNKNOWN_ERROR',
            message: `Erreur ${error.status}: ${error.statusText}`,
          };
      }
    }

    console.error('HTTP Error:', errorResponse);
    return throwError(() => errorResponse);
  }
}
