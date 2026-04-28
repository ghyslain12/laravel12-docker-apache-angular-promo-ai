import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let storageService: jasmine.SpyObj<StorageService>;
  const baseUri = environment.baseUri;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const storageSpy = jasmine.createSpyObj<StorageService>('StorageService', ['getItem', 'setItem', 'removeItem']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;

    router.navigate.and.returnValue(Promise.resolve(true));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
  });

  it('should initialize loggedIn as true when token exists', () => {
    // On simule qu'un token existe AVANT l'instanciation
    storageService.getItem.withArgs('token').and.returnValue('fake-token');
    service = TestBed.inject(AuthService);

    expect(service.getLoggedInValue()).toBe(true);
  });

  it('should login, set token and update status', fakeAsync(() => {
    service = TestBed.inject(AuthService);
    const credentials = { email: 'test@example.com', password: 'password' };
    const mockResponse = { token: 'jwt-token-123' };

    service.login(credentials).subscribe();

    const req = httpMock.expectOne(`${baseUri}/api/login`);
    req.flush(mockResponse);
    tick();

    expect(storageService.setItem).toHaveBeenCalledWith('token', 'jwt-token-123');
    expect(service.getLoggedInValue()).toBe(true);
  }));

  it('should return token from storageService', () => {
    service = TestBed.inject(AuthService);
    storageService.getItem.withArgs('token').and.returnValue('test-token');

    expect(service.getToken()).toBe('test-token');

    storageService.getItem.withArgs('token').and.returnValue(null);
    expect(service.getToken()).toBeNull();
  });

  it('should logout and clear storage', fakeAsync(() => {
    service = TestBed.inject(AuthService);
    // On simule un état connecté
    (service as any).loggedIn.next(true);

    service.logout();
    tick();

    expect(storageService.removeItem).toHaveBeenCalledWith('token');
    expect(service.getLoggedInValue()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should check authentication (ignoring expiration for this simple test)', () => {
    service = TestBed.inject(AuthService);

    // Cas non authentifié
    storageService.getItem.withArgs('token').and.returnValue(null);
    expect(service.isAuthenticated()).toBe(false);

    // Cas authentifié (on mock isAuthenticated car il décode le JWT)
    spyOn(service, 'isTokenExpired').and.returnValue(false);
    storageService.getItem.withArgs('token').and.returnValue('test.payload.signature');
    expect(service.isAuthenticated()).toBe(true);
  });
});
