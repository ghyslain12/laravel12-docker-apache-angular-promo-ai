import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { authGuard } from './auth.guard';
import {Observable, of, throwError} from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let httpMock: HttpTestingController;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated', 'getJwtConfig']);
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    httpMock = TestBed.inject(HttpTestingController);
    router.navigate.and.returnValue(Promise.resolve(true));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access if JWT is disabled', fakeAsync(() => {
    authService.getJwtConfig.and.returnValue(of({ jwt_enabled: false }));

    const route: any = {};
    const state: any = { url: '/some-route' };
    let result: boolean | undefined;

    (executeGuard(route, state) as Observable<boolean>).subscribe((value: boolean) => {
      result = value;
    });

    tick();
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should allow access if user is authenticated', fakeAsync(() => {
    authService.getJwtConfig.and.returnValue(of({ jwt_enabled: true }));
    authService.isAuthenticated.and.returnValue(true);

    const route: any = {};
    const state: any = { url: '/protected' };
    let result: boolean | undefined;

    (executeGuard(route, state) as Observable<boolean>).subscribe((value: boolean) => {
      result = value;
    });

    tick();
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should allow access to /user/add without authentication', fakeAsync(() => {
    authService.getJwtConfig.and.returnValue(of({ jwt_enabled: true }));
    authService.isAuthenticated.and.returnValue(false);

    const route: any = {};
    const state: any = { url: '/user/add' };
    let result: boolean | undefined;

    (executeGuard(route, state) as Observable<boolean>).subscribe((value: boolean) => {
      result = value;
    });

    tick();
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should redirect to /login if user is not authenticated and JWT is enabled', fakeAsync(() => {
    authService.getJwtConfig.and.returnValue(of({ jwt_enabled: true }));
    authService.isAuthenticated.and.returnValue(false);

    const route: any = {};
    const state: any = { url: '/protected' };
    let result: boolean | undefined;

    (executeGuard(route, state) as Observable<boolean>).subscribe((value: boolean) => {
      result = value;
    });

    tick();
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should allow access on config error if user is authenticated', fakeAsync(() => {
    authService.getJwtConfig.and.returnValue(throwError(() => new Error('Config error')));
    authService.isAuthenticated.and.returnValue(true);

    const route: any = {};
    const state: any = { url: '/protected' };
    let result: boolean | undefined;

    (executeGuard(route, state) as Observable<boolean>).subscribe((value: boolean) => {
      result = value;
    });

    tick();
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should redirect to /login on config error without authentication (even for /user/add)', fakeAsync(() => {
    // On simule l'erreur de config
    authService.getJwtConfig.and.returnValue(throwError(() => new Error('Config error')));
    authService.isAuthenticated.and.returnValue(false);

    const route: any = {};
    const state: any = { url: '/user/add' };
    let result: boolean | undefined;

    (executeGuard(route, state) as Observable<boolean>).subscribe((value: boolean) => {
      result = value;
    });

    tick();

    // On adapte le test au comportement du Guard actuel :
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));


  it('should redirect to /login on config error if user is not authenticated', fakeAsync(() => {
    authService.getJwtConfig.and.returnValue(throwError(() => new Error('Config error')));
    authService.isAuthenticated.and.returnValue(false);

    const route: any = {};
    const state: any = { url: '/protected' };
    let result: boolean | undefined;

    (executeGuard(route, state) as Observable<boolean>).subscribe((value: boolean) => {
      result = value;
    });

    tick();
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));
});

