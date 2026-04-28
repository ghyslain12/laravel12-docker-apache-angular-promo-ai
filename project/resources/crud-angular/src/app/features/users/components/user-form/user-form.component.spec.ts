import {ComponentFixture, TestBed, fakeAsync, tick, flush} from '@angular/core/testing';
import { UserFormComponent } from './user-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { User } from '../../models/user.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserService } from '../../services/user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let dialog: MatDialog;

  const mockUser: User = { id: 1, name: 'user1', email: 'test@gmail.com' };

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['create', 'update']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getJwtConfig']);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule, MatFormFieldModule, MatInputModule,
        MatButtonModule, MatCardModule, MatDialogModule,
        BrowserAnimationsModule, HttpClientTestingModule, UserFormComponent
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: undefined } },
            data: of({ user: undefined })
          }
        }
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    dialog = TestBed.inject(MatDialog);

    router.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.userForm.valid).toBeFalsy();
  });

  it('should initialize in create mode', () => {
    expect(component.isEditMode).toBeFalse();
  });

  it('should load user data in edit mode', () => {
    component.isEditMode = true;
    component.userId = 1;
    component.userForm.patchValue(mockUser);
    expect(component.userForm.value.email).toBe('test@gmail.com');
  });

  it('should submit form and navigate to /user on success', fakeAsync(() => {
    userService.create.and.returnValue(of(mockUser));
    component.userForm.setValue({ name: 'user1', email: 'test@gmail.com', password: 'password123' });

    component.onSubmit();
    tick();

    expect(userService.create).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('Utilisateur créé', 'OK', jasmine.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(['/user']);
  }));

  it('6. should show snackbar on creation error', fakeAsync(() => {
    const errorResponse = { message: 'API Error' };
    userService.create.and.returnValue(throwError(() => errorResponse));

    component.userForm.setValue({
      name: 'user1',
      email: 'test@gmail.com',
      password: 'password123'
    });

    component.onSubmit();

    flush();

    expect(snackBar.open).toHaveBeenCalledWith(
      'API Error',
      'Fermer',
      jasmine.any(Object)
    );
  }));


  it('7. should open error dialog via showErrorDialog method', () => {
    spyOn(dialog, 'open');
    component.showErrorDialog('Test Error');
    expect(dialog.open).toHaveBeenCalled();
  });

  it('8. should navigate to /user on goBack() if authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/user']);
  });

  it('9. should navigate to /login on goBack() if NOT authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('10. should have invalid email error with wrong format', () => {
    const email = component.userForm.get('email');
    email?.setValue('notanemail');
    expect(email?.hasError('email')).toBeTrue();
  });
});
