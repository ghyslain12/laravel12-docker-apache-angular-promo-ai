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
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialService } from '../../services/material.service';

@Component({
  selector: 'app-material-form',
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
  templateUrl: './material-form.component.html'
})
export class MaterialFormComponent implements OnInit {
  private fb             = inject(FormBuilder);
  private materialService = inject(MaterialService);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private snackBar       = inject(MatSnackBar);

  materialForm: FormGroup;
  isEditMode   = false;
  materialId?: number;

  constructor() {
    this.materialForm = this.fb.group({
      designation: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), this.noWhitespaceValidator]],
      price:       [0,  [Validators.required, Validators.min(0)]]
    });
  }

  private noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: any) => {
      if (data.material) {
        this.isEditMode   = true;
        this.materialId   = data.material.id;
        this.materialForm.patchValue(data.material);
      }
    });
  }

  onSubmit(): void {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      return;
    }

    const materialData = this.materialForm.value;
    const request$ = this.isEditMode && this.materialId
      ? this.materialService.update(this.materialId, materialData)
      : this.materialService.create(materialData);

    request$.subscribe({
      next: () => {
        this.snackBar.open(this.isEditMode ? 'Matériel modifié' : 'Matériel créé', 'OK', { duration: 3000 });
        this.router.navigate(['/material']);
      },
      error: (err) => {
        this.snackBar.open(err.message, 'Fermer', { duration: 5000 });
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.materialForm.get(field);
    if (!control) return '';
    if (control.hasError('required'))   return 'Ce champ est obligatoire';
    if (control.hasError('min'))        return 'Le prix doit être supérieur ou égal à 0';
    if (control.hasError('minlength'))  return `Minimum ${control.errors?.['minlength'].requiredLength} caractères`;
    if (control.hasError('maxlength'))  return `Maximum ${control.errors?.['maxlength'].requiredLength} caractères`;
    if (control.hasError('whitespace')) return 'Le champ ne peut pas être vide';
    return '';
  }

  goBack() {
    this.router.navigate(['/material']).then();
  }
}
