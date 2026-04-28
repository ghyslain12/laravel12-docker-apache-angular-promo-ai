import { TestBed } from '@angular/core/testing';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpRequest, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';
import {AuthService} from '../services/auth/auth.service';

describe('authInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let injector: EnvironmentInjector;

  const mockAuthService = {
    logout: jasmine.createSpy('logout'),
    login: jasmine.createSpy('login'),
    callConfig: jasmine.createSpy('callConfig'),
  };

  const mockHandler = (response: Observable<any>) => {
    return (req: HttpRequest<any>) => response; // Simplification du mock
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    injector = TestBed.inject(EnvironmentInjector);
  });

  beforeEach(() => {
    authService.logout.calls.reset(); // Réinitialiser les appels à logout avant chaque test
    router.navigate.calls.reset();    // Réinitialiser les appels à navigate
  });

  it('should pass through request when no error occurs', () => {
    const mockResponse = new HttpResponse({ body: { data: 'test' }, status: 200 });
    const request = new HttpRequest('GET', '/api/test');
    const next = mockHandler(of(mockResponse));

    runInInjectionContext(injector, () => {
      authInterceptor(request, next).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
    });

    expect(authService.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should call authService.logout and redirect to /login on "Token invalide ou expiré" error', () => {
    const errorResponse = new HttpErrorResponse({
      error: { error: 'Token invalide ou expiré' },
      status: 401,
      statusText: 'Unauthorized'
    });
    const request = new HttpRequest('GET', '/api/test');
    const next = mockHandler(throwError(() => errorResponse));

    runInInjectionContext(injector, () => {
      authInterceptor(request, next).subscribe({
        next: () => fail('should have failed with an error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          expect(error.error).toEqual({ error: 'Token invalide ou expiré' });
        }
      });
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should not logout or redirect for other errors', () => {
    const errorResponse = new HttpErrorResponse({
      error: { error: 'Other error' },
      status: 400,
      statusText: 'Bad Request'
    });
    const request = new HttpRequest('GET', '/api/test');
    const next = mockHandler(throwError(() => errorResponse));

    runInInjectionContext(injector, () => {
      authInterceptor(request, next).subscribe({
        next: () => fail('should have failed with an error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
          expect(error.error).toEqual({ error: 'Other error' });
        }
      });
    });

    expect(authService.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle network error (status 0) without logout', () => {
    const errorResponse = new HttpErrorResponse({
      error: new ProgressEvent('error'),
      status: 0,
      statusText: 'Unknown Error'
    });
    const request = new HttpRequest('GET', '/api/test');
    const next = mockHandler(throwError(() => errorResponse));

    runInInjectionContext(injector, () => {
      authInterceptor(request, next).subscribe({
        next: () => fail('should have failed with an error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(0);
        }
      });
    });

    expect(authService.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});

