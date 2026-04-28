import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import {MatDialog} from '@angular/material/dialog';
import {ErrorDialogComponent} from '../../../../shared/components/error-dialog.component';
import {AuthService} from '../../../../core/services/auth/auth.service';
import {UserService} from '../../services/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatLabel,
    MatInput,
    MatFormFieldModule,
    MatCardModule
],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit{
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  userForm: FormGroup;
  isEditMode = false;
  userId?: number;

  constructor() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), this.noWhitespaceValidator]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(3), Validators.maxLength(100), this.noWhitespaceValidator]],
      password: ['', null],
    });
  }

  // Validateur personnalisé
  private noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  ngOnInit() {
    this.route.data.subscribe((data: any) => {
      if (data.user) {
        this.isEditMode = true;
        this.userId = data.user.id;
        this.userForm.patchValue(data.user);
      }
    });
  }


  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const userData = this.userForm.value;
    const request$ = this.isEditMode && this.userId
      ? this.userService.update(this.userId, userData)
      : this.userService.create(userData);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Utilisateur modifié' : 'Utilisateur créé',
          'OK',
          { duration: 3000 }
        );
        this.router.navigate(['/user']);
      },
      error: (err) => {
        this.snackBar.open(err.message, 'Fermer', { duration: 5000 });
      }
    });
  }

  public showErrorDialog(message: string): void {
    this.dialog.open(ErrorDialogComponent, {
      width: '300px',
      data: { message }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.userForm.get(field);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (control.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} caractères`;
    }
    if (control.hasError('maxlength')) {
      return `Maximum ${control.errors?.['maxlength'].requiredLength} caractères`;
    }
    if (control.hasError('whitespace')) {
      return 'Le champ ne peut pas être vide';
    }
    return '';
  }

  goBack() {
    if(this.authService.isAuthenticated()) {
      this.router.navigate(['/user']).then();
    } else {
      this.router.navigate(['/login']).then();
    }
  }
}
