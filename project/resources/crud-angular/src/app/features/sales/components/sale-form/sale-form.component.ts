import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CurrencyPipe } from '@angular/common';
import { SaleService } from '../../services/sale.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialService } from '../../../materials/services/material.service';
import { ClientService } from '../../../clients/services/client.service';
import { Client } from '../../../clients/models/client.model';
import { Material } from '../../../materials/models/material.model';

@Component({
  selector: 'app-sale-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatLabel,
    MatInput,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    FormsModule,
    TextFieldModule,
    CurrencyPipe
  ],
  templateUrl: './sale-form.component.html'
})
export class SaleFormComponent implements OnInit {
  private fb              = inject(FormBuilder);
  private saleService     = inject(SaleService);
  private clientService   = inject(ClientService);
  private materialService = inject(MaterialService);
  private router          = inject(Router);
  private route           = inject(ActivatedRoute);
  private snackBar        = inject(MatSnackBar);

  saleForm: FormGroup;
  isEditMode = false;
  saleId?: number;
  clients: Client[]   = [];
  materials: Material[] = [];

  constructor() {
    this.saleForm = this.fb.group({
      titre:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), this.noWhitespaceValidator]],
      description: ['', [Validators.required]],
      customer_id: ['', [Validators.required]]
    });
  }

  private noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  ngOnInit(): void {
    this.clientService.getAll().subscribe(data => this.clients = data);

    this.materialService.getAll().subscribe({
      next: (data: Material[]) => {
        this.materials = data;

        this.materials.forEach(m => {
          this.saleForm.addControl('material_' + m.id, this.fb.control(false));
        });

        this.route.data.subscribe((data: any) => {
          if (data.sale) {
            this.isEditMode = true;
            this.saleId     = data.sale.id;
            this.saleForm.patchValue(data.sale);

            if (data.sale.materials && Array.isArray(data.sale.materials)) {
              data.sale.materials.forEach((m: any) => {
                const ctrl = this.saleForm.get('material_' + m.id);
                if (ctrl) ctrl.setValue(true);
              });
            }
          }
        });
      }
    });
  }

  get selectedMaterials(): Material[] {
    return this.materials.filter(m => this.saleForm.get('material_' + m.id)?.value === true);
  }

  get totalPrice(): number {
    return this.selectedMaterials.reduce((sum, m) => sum + (Number(m.price) || 0), 0);
  }

  onSubmit(): void {
    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      return;
    }

    const formValues = this.saleForm.value;
    const selectedIds = this.materials
      .filter(m => formValues[`material_${m.id}`] === true)
      .map(m => m.id);

    const saleData = {
      titre:       formValues.titre,
      description: formValues.description,
      customer_id: formValues.customer_id,
      materials:   selectedIds
    } as any;

    const request$ = this.isEditMode && this.saleId
      ? this.saleService.update(this.saleId, saleData)
      : this.saleService.create(saleData);

    request$.subscribe({
      next: () => {
        this.snackBar.open(this.isEditMode ? 'Vente modifiée' : 'Vente créée', 'OK', { duration: 3000 });
        this.router.navigate(['/sale']);
      },
      error: (err) => {
        this.snackBar.open(err.message, 'Fermer', { duration: 5000 });
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.saleForm.get(field);
    if (!control) return '';
    if (control.hasError('required'))   return 'Ce champ est obligatoire';
    if (control.hasError('minlength'))  return `Minimum ${control.errors?.['minlength'].requiredLength} caractères`;
    if (control.hasError('maxlength'))  return `Maximum ${control.errors?.['maxlength'].requiredLength} caractères`;
    if (control.hasError('whitespace')) return 'Le champ ne peut pas être vide';
    return '';
  }

  goBack() {
    this.router.navigate(['/sale']).then();
  }
}
