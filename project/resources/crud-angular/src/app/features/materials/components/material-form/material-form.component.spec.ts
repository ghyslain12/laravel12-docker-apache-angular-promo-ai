import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MaterialFormComponent } from './material-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialService } from '../../services/material.service';
import { Material } from '../../models/material.model';

describe('MaterialFormComponent', () => {
  let component: MaterialFormComponent;
  let fixture: ComponentFixture<MaterialFormComponent>;
  let materialService: jasmine.SpyObj<MaterialService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockMaterial: Material = { id: 1, designation: 'modem', price: 49.99, checked: false };

  beforeEach(async () => {
    const materialSpy = jasmine.createSpyObj('MaterialService', ['create', 'update']);
    const routerSpy   = jasmine.createSpyObj('Router', ['navigate']);
    const snackSpy    = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule, MatFormFieldModule, MatInputModule,
        MatButtonModule, MatCardModule, MatSnackBarModule,
        BrowserAnimationsModule, MaterialFormComponent
      ],
      providers: [
        { provide: MaterialService, useValue: materialSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} }, data: of({ material: undefined }) } }
      ]
    }).compileComponents();

    materialService = TestBed.inject(MaterialService) as jasmine.SpyObj<MaterialService>;
    router          = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar        = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create', () => expect(component).toBeTruthy());

  it('2. form should be invalid when empty', () => {
    expect(component.materialForm.valid).toBeFalsy();
  });

  it('3. form should have designation and price controls', () => {
    expect(component.materialForm.get('designation')).toBeTruthy();
    expect(component.materialForm.get('price')).toBeTruthy();
  });

  it('4. should show error for whitespace only designation', () => {
    component.materialForm.get('designation')?.setValue('   ');
    expect(component.materialForm.get('designation')?.hasError('whitespace')).toBeTrue();
    expect(component.getErrorMessage('designation')).toBe('Le champ ne peut pas être vide');
  });

  it('5. should show error for negative price', () => {
    component.materialForm.patchValue({ designation: 'test', price: -1 });
    expect(component.materialForm.get('price')?.hasError('min')).toBeTrue();
    expect(component.getErrorMessage('price')).toBe('Le prix doit être supérieur ou égal à 0');
  });

  it('6. should submit form with designation and price in create mode', fakeAsync(() => {
    materialService.create.and.returnValue(of(mockMaterial));
    component.materialForm.setValue({ designation: 'modem', price: 49.99 });

    component.onSubmit();
    tick();

    expect(materialService.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ designation: 'modem', price: 49.99 })
    );
    expect(router.navigate).toHaveBeenCalledWith(['/material']);
    expect(snackBar.open).toHaveBeenCalledWith('Matériel créé', 'OK', jasmine.any(Object));
  }));

  it('7. should submit in edit mode', fakeAsync(() => {
    component.isEditMode  = true;
    component.materialId  = 1;
    materialService.update.and.returnValue(of(mockMaterial));

    component.materialForm.setValue({ designation: 'updated modem', price: 99.99 });
    component.onSubmit();
    tick();

    expect(materialService.update).toHaveBeenCalledWith(1, jasmine.objectContaining({ designation: 'updated modem' }));
    expect(router.navigate).toHaveBeenCalledWith(['/material']);
  }));

  it('8. should show snackbar on API error', fakeAsync(() => {
    materialService.create.and.returnValue(throwError(() => ({ message: 'Server Error' })));
    component.materialForm.setValue({ designation: 'modem', price: 10 });

    component.onSubmit();
    tick();

    expect(snackBar.open).toHaveBeenCalledWith('Server Error', 'Fermer', jasmine.any(Object));
  }));

  it('9. should not submit if form is invalid', () => {
    component.materialForm.setValue({ designation: '', price: 0 });
    component.onSubmit();
    expect(materialService.create).not.toHaveBeenCalled();
    expect(component.materialForm.touched).toBeTrue();
  });

  it('10. should navigate back on goBack()', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/material']);
  });
});
