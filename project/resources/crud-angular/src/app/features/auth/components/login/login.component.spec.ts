import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { of, throwError } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockCredentials = { email: 'test@test.com', password: 'password123' };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'logout']);
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        BrowserAnimationsModule,
        LoginComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    router.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an invalid form', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate email and password as required', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');

    expect(emailControl?.errors?.['required']).toBeTrue();
    expect(passwordControl?.errors?.['required']).toBeTrue();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['email']).toBeTrue();

    emailControl?.setValue('valid@test.com');
    expect(emailControl?.errors?.['email']).toBeFalsy();
  });

  it('should not submit if form is invalid', () => {
    authService.login.and.returnValue(of({ token: 'mockToken' }));
    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('should submit form and navigate to /home on success', () => {
    authService.login.and.returnValue(of({ token: 'mockToken' }));
    component.loginForm.setValue(mockCredentials);

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(mockCredentials);
    expect(component.loading).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should handle login error and reset loading state', () => {
    authService.login.and.returnValue(throwError(() => new Error('Login failed')));
    component.loginForm.setValue(mockCredentials);

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(mockCredentials);
    expect(component.loading).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should call logout and navigate to /user/add when goToAddUser is called', () => {
    component.goToAddUser();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/user/add']);
  });

  it('should disable submit button when form is invalid or loading', () => {
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBeTrue();

    component.loginForm.setValue(mockCredentials);
    fixture.detectChanges();
    expect(submitButton.disabled).toBeFalse();

    component.loading = true;
    fixture.detectChanges();
    expect(submitButton.disabled).toBeTrue();
  });

  it('should show spinner when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();

    component.loading = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
  });
});

