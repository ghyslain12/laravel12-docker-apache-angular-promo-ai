import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PromotionFormComponent } from './promotion-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PromotionService } from '../../services/promotion.service';
import { MaterialService } from '../../../materials/services/material.service';
import { Promotion } from '../../models/promotion.model';
import { Material } from '../../../materials/models/material.model';

describe('PromotionFormComponent', () => {
  let component: PromotionFormComponent;
  let fixture: ComponentFixture<PromotionFormComponent>;
  let promotionService: jasmine.SpyObj<PromotionService>;
  let materialService:  jasmine.SpyObj<MaterialService>;
  let router:           jasmine.SpyObj<Router>;
  let snackBar:         jasmine.SpyObj<MatSnackBar>;

  const mockMaterials: Material[] = [
    { id: 1, designation: 'Câble HDMI', price: 15.00, checked: false },
    { id: 2, designation: 'Modem',      price: 80.00, checked: false },
  ];

  const mockPromotion: Partial<Promotion> = {
    id: 1, name: 'Promo test', type: 'percentage', value: 10,
    target_type: 'all', active: true, priority: 0
  };

  beforeEach(async () => {
    const promoSpy    = jasmine.createSpyObj('PromotionService', ['create', 'update']);
    const materialSpy = jasmine.createSpyObj('MaterialService', ['getAll']);
    const routerSpy   = jasmine.createSpyObj('Router', ['navigate']);
    const snackSpy    = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule, MatFormFieldModule, MatInputModule,
        MatButtonModule, MatCardModule, MatSelectModule, MatCheckboxModule,
        MatSnackBarModule, BrowserAnimationsModule, PromotionFormComponent
      ],
      providers: [
        { provide: PromotionService, useValue: promoSpy },
        { provide: MaterialService,  useValue: materialSpy },
        { provide: Router,           useValue: routerSpy },
        { provide: MatSnackBar,      useValue: snackSpy },
        { provide: ActivatedRoute,   useValue: { data: of({ promotion: undefined }) } }
      ]
    }).compileComponents();

    promotionService = TestBed.inject(PromotionService) as jasmine.SpyObj<PromotionService>;
    materialService  = TestBed.inject(MaterialService)  as jasmine.SpyObj<MaterialService>;
    router           = TestBed.inject(Router)           as jasmine.SpyObj<Router>;
    snackBar         = TestBed.inject(MatSnackBar)      as jasmine.SpyObj<MatSnackBar>;

    materialService.getAll.and.returnValue(of(mockMaterials));
    router.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture   = TestBed.createComponent(PromotionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('form should be invalid when required fields are empty', () => {
    component.promotionForm.patchValue({ name: '', value: null });
    expect(component.promotionForm.get('name')?.valid).toBeFalse();
  });

  it('should load materials from service', () => {
    expect(component.materials.length).toBe(2);
    expect(materialService.getAll).toHaveBeenCalled();
  });

  it('isMaterial should be true when target_type is material', () => {
    component.promotionForm.get('target_type')?.setValue('material');
    fixture.detectChanges();
    expect(component.isMaterial).toBeTrue();
    expect(component.isCoupon).toBeFalse();
  });

  it('isCoupon should be true when target_type is coupon', () => {
    component.promotionForm.get('target_type')?.setValue('coupon');
    fixture.detectChanges();
    expect(component.isCoupon).toBeTrue();
  });

  it('target_id should be required when target_type is material', () => {
    component.promotionForm.get('target_type')?.setValue('material');
    component.promotionForm.get('target_id')?.setValue(null);
    expect(component.promotionForm.get('target_id')?.hasError('required')).toBeTrue();
  });

  it('code should be required when target_type is coupon', () => {
    component.promotionForm.get('target_type')?.setValue('coupon');
    component.promotionForm.get('code')?.setValue('');
    expect(component.promotionForm.get('code')?.hasError('required')).toBeTrue();
  });

  it('should create a global promotion', fakeAsync(() => {
    promotionService.create.and.returnValue(of(mockPromotion as Promotion));

    component.promotionForm.patchValue({
      name: 'Promo test', type: 'percentage', value: 10,
      target_type: 'all', active: true
    });
    component.onSubmit();
    tick();

    expect(promotionService.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'Promo test', target_type: 'all' })
    );
    expect(router.navigate).toHaveBeenCalledWith(['/promotion']);
    expect(snackBar.open).toHaveBeenCalledWith('Promotion créée', 'OK', jasmine.any(Object));
  }));

  it('should update a promotion in edit mode', fakeAsync(() => {
    component.isEditMode    = true;
    component.promotionId   = 1;
    promotionService.update.and.returnValue(of(mockPromotion as Promotion));

    component.promotionForm.patchValue({ name: 'Updated', type: 'percentage', value: 15, target_type: 'all' });
    component.onSubmit();
    tick();

    expect(promotionService.update).toHaveBeenCalledWith(1, jasmine.objectContaining({ name: 'Updated' }));
    expect(snackBar.open).toHaveBeenCalledWith('Promotion modifiée', 'OK', jasmine.any(Object));
  }));

  it('should show snackbar on API error', fakeAsync(() => {
    promotionService.create.and.returnValue(throwError(() => ({ message: 'Erreur serveur' })));

    component.promotionForm.patchValue({ name: 'Test', type: 'percentage', value: 5, target_type: 'all' });
    component.onSubmit();
    tick();

    expect(snackBar.open).toHaveBeenCalledWith('Erreur serveur', 'Fermer', jasmine.any(Object));
  }));

  it('should not submit if form is invalid', () => {
    component.promotionForm.patchValue({ name: '' });
    component.onSubmit();
    expect(promotionService.create).not.toHaveBeenCalled();
  });

  it('should navigate back on goBack()', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/promotion']);
  });
});
