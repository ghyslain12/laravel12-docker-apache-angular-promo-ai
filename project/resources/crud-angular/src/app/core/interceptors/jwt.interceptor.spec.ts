import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpHandlerFn } from '@angular/common/http';
import { AuthService } from '../services/auth/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { jwtInterceptor, jwtInterceptorFn } from './jwt.interceptor';
import {of} from 'rxjs';

describe('jwtInterceptor (Classe)', () => {
  let interceptor: jwtInterceptor;
  let authService: jasmine.SpyObj<AuthService>;
  let mockHandler: jasmine.SpyObj<HttpHandler>;

  const mockToken = 'mock-jwt-token';
  const mockRequest = new HttpRequest('GET', '/api/test');
  const mockConfigRequest = new HttpRequest('GET', '/api/config/jwt');

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getToken']);
    mockHandler = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);

    TestBed.configureTestingModule({
      providers: [
        jwtInterceptor,
        { provide: AuthService, useValue: authService },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    interceptor = TestBed.inject(jwtInterceptor);
    authService.getToken.and.returnValue(null);
    mockHandler.handle.and.returnValue(of(new HttpResponse({ status: 200 })));
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should skip adding token for excluded URLs (/api/config/jwt)', () => {
    authService.getToken.and.returnValue(mockToken);

    interceptor.intercept(mockConfigRequest, mockHandler).subscribe(() => {
      const handledRequest = mockHandler.handle.calls.mostRecent().args[0];
      expect(handledRequest.headers.get('Authorization')).toBeNull();
    });
  });

  it('should add Authorization header with token if token exists', () => {
    authService.getToken.and.returnValue(mockToken);

    interceptor.intercept(mockRequest, mockHandler).subscribe(() => {
      const handledRequest = mockHandler.handle.calls.mostRecent().args[0];
      expect(handledRequest.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    });
  });
});

describe('jwtInterceptorFn (Fonction)', () => {
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
  });

  it('should call intercept logic via functional interceptor', (done) => {
    const mockToken = 'mock-jwt-token';
    const mockRequest = new HttpRequest('GET', '/api/test');
    authService.getToken.and.returnValue(mockToken);

    const next: HttpHandlerFn = (req: HttpRequest<any>) => {
      expect(req.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      return of({} as HttpEvent<any>);
    };

    TestBed.runInInjectionContext(() => {
      jwtInterceptorFn(mockRequest, next).subscribe(() => done());
    });
  });
});
