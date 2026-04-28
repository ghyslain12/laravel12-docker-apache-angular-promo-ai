import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { User } from '../../../users/models/user.model';

import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import {ClientService} from '../../services/client.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserService} from '../../../users/services/user.service';

@Component({
  selector: 'app-client-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatLabel,
    MatInput,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule
],
  templateUrl: './client-form.component.html'
})
export class ClientFormComponent implements OnInit{
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  clientForm: FormGroup;
  isEditMode = false;
  clientId?: number;
  users: User[] = [];

  constructor() {
    this.clientForm = this.fb.group({
      surnom: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), this.noWhitespaceValidator]],
      user_id: ['', Validators.required]
    });
  }

  // Validateur personnalisé
  private noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  ngOnInit() {
    this.userService.getAll().subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (err: any) => {
        this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer');
      }
    });

    this.route.data.subscribe((data: any) => {
      if (data.client) {
        this.isEditMode = true;
        this.clientId = data.client.id;
        this.clientForm.patchValue(data.client);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const clientData = this.clientForm.value;
    console.log('Payload envoyé à Laravel :', clientData);

    const request$ = this.isEditMode && this.clientId
      ? this.clientService.update(this.clientId, clientData)
      : this.clientService.create(clientData);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Client modifié' : 'Client créé',
          'OK',
          { duration: 3000 }
        );
        this.router.navigate(['/client']);
      },
      error: (err) => {
        this.snackBar.open(err.message, 'Fermer', { duration: 5000 });
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.clientForm.get(field);
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
    this.router.navigate(['/client']).then();
  }
}
