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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PromotionService } from '../../services/promotion.service';
import { MaterialService } from '../../../materials/services/material.service';
import { Material } from '../../../materials/models/material.model';

@Component({
  selector: 'app-promotion-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatLabel,
    MatInput,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatCheckboxModule,
  ],
  templateUrl: './promotion-form.component.html'
})
export class PromotionFormComponent implements OnInit {
  private fb               = inject(FormBuilder);
  private promotionService = inject(PromotionService);
  private materialService  = inject(MaterialService);
  private router           = inject(Router);
  private route            = inject(ActivatedRoute);
  private snackBar         = inject(MatSnackBar);

  promotionForm: FormGroup;
  isEditMode   = false;
  promotionId?: number;
  materials: Material[] = [];

  readonly targetTypes  = ['material', 'all', 'coupon'] as const;
  readonly remiseTypes  = ['percentage', 'fixed_amount'] as const;

  constructor() {
    this.promotionForm = this.fb.group({
      name:               ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      type:               ['percentage', Validators.required],
      value:              [null, [Validators.required, Validators.min(0.01)]],
      target_type:        ['all', Validators.required],
      target_id:          [null],
      code:               [null],
      starts_at:          [null],
      ends_at:            [null],
      usage_limit:        [null, Validators.min(1)],
      per_customer_limit: [null, Validators.min(1)],
      priority:           [0, [Validators.min(0), Validators.max(100)]],
      active:             [true],
    });

    this.promotionForm.get('target_type')?.valueChanges.subscribe(val => {
      this.updateConditionalValidators(val);
    });
  }

  private updateConditionalValidators(targetType: string): void {
    const targetIdCtrl = this.promotionForm.get('target_id')!;
    const codeCtrl     = this.promotionForm.get('code')!;

    if (targetType === 'material') {
      targetIdCtrl.setValidators([Validators.required]);
      codeCtrl.clearValidators();
    } else if (targetType === 'coupon') {
      codeCtrl.setValidators([Validators.required, Validators.maxLength(30)]);
      targetIdCtrl.clearValidators();
    } else {
      targetIdCtrl.clearValidators();
      codeCtrl.clearValidators();
    }

    targetIdCtrl.updateValueAndValidity();
    codeCtrl.updateValueAndValidity();
  }

  get isMaterial(): boolean { return this.promotionForm.get('target_type')?.value === 'material'; }
  get isCoupon():   boolean { return this.promotionForm.get('target_type')?.value === 'coupon';   }

  ngOnInit(): void {
    this.materialService.getAll().subscribe(data => this.materials = data);

    this.route.data.subscribe((data: any) => {
      if (data.promotion) {
        this.isEditMode   = true;
        this.promotionId  = data.promotion.id;
        this.promotionForm.patchValue(data.promotion);
        this.updateConditionalValidators(data.promotion.target_type);
      }
    });
  }

  onSubmit(): void {
    if (this.promotionForm.invalid) {
      this.promotionForm.markAllAsTouched();
      return;
    }

    const data = this.promotionForm.value;
    const request$ = this.isEditMode && this.promotionId
      ? this.promotionService.update(this.promotionId, data)
      : this.promotionService.create(data);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Promotion modifiée' : 'Promotion créée',
          'OK',
          { duration: 3000 }
        );
        this.router.navigate(['/promotion']);
      },
      error: (err) => this.snackBar.open(err.message, 'Fermer', { duration: 5000 })
    });
  }

  getErrorMessage(field: string): string {
    const control = this.promotionForm.get(field);
    if (!control) return '';
    if (control.hasError('required'))   return 'Ce champ est obligatoire';
    if (control.hasError('min'))        return 'Valeur minimale non respectée';
    if (control.hasError('max'))        return 'Valeur maximale dépassée';
    if (control.hasError('minlength'))  return `Minimum ${control.errors?.['minlength'].requiredLength} caractères`;
    if (control.hasError('maxlength'))  return `Maximum ${control.errors?.['maxlength'].requiredLength} caractères`;
    return '';
  }

  goBack() {
    this.router.navigate(['/promotion']).then();
  }
}
