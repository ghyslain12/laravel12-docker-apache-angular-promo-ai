import { TestBed } from '@angular/core/testing';
import { ErrorHandlerService, ErrorResponse } from './error-handler.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerService,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(ErrorHandlerService);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle client-side errors (ErrorEvent)', (done) => {
    const errorEvent = new ErrorEvent('Network error', { message: 'No internet' });
    const mockError = new HttpErrorResponse({ error: errorEvent });

    service.handleError(mockError).subscribe({
      error: (err: ErrorResponse) => {
        expect(err.code).toBe('CLIENT_ERROR');
        expect(err.details).toBe('No internet');
        done();
      }
    });
  });

  it('should handle 400 Bad Request', (done) => {
    const mockError = new HttpErrorResponse({ status: 400, error: 'Invalid field' });
    service.handleError(mockError).subscribe({
      error: (err) => {
        expect(err.code).toBe('BAD_REQUEST');
        expect(err.message).toBe('Données invalides');
        done();
      }
    });
  });

  it('should handle 401 Unauthorized and navigate to login', (done) => {
    const mockError = new HttpErrorResponse({ status: 401 });
    service.handleError(mockError).subscribe({
      error: (err) => {
        expect(err.code).toBe('UNAUTHORIZED');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        done();
      }
    });
  });

  it('should handle 403 Forbidden', (done) => {
    const mockError = new HttpErrorResponse({ status: 403 });
    service.handleError(mockError).subscribe({
      error: (err) => {
        expect(err.code).toBe('FORBIDDEN');
        done();
      }
    });
  });

  it('should handle 404 Not Found', (done) => {
    const mockError = new HttpErrorResponse({ status: 404 });
    service.handleError(mockError).subscribe({
      error: (err) => {
        expect(err.code).toBe('NOT_FOUND');
        done();
      }
    });
  });

  it('should handle 422 Validation Error', (done) => {
    const validationErrors = { email: ['Format invalide'] };
    const mockError = new HttpErrorResponse({ status: 422, error: { errors: validationErrors } });

    service.handleError(mockError).subscribe({
      error: (err) => {
        expect(err.code).toBe('VALIDATION_ERROR');
        expect(err.details).toEqual(validationErrors);
        done();
      }
    });
  });

  it('should handle 500 Server Error', (done) => {
    const mockError = new HttpErrorResponse({ status: 500 });
    service.handleError(mockError).subscribe({
      error: (err) => {
        expect(err.code).toBe('SERVER_ERROR');
        done();
      }
    });
  });

  it('should handle unknown status codes', (done) => {
    const mockError = new HttpErrorResponse({ status: 418, statusText: "I'm a teapot" });
    service.handleError(mockError).subscribe({
      error: (err) => {
        expect(err.code).toBe('UNKNOWN_ERROR');
        expect(err.message).toContain('418');
        done();
      }
    });
  });
});
