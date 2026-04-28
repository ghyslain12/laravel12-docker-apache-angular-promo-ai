import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SaleFormComponent } from './sale-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { TextFieldModule } from '@angular/cdk/text-field';
import { SaleService } from '../../services/sale.service';
import { ClientService } from '../../../clients/services/client.service';
import { MaterialService } from '../../../materials/services/material.service';
import { Sale } from '../../models/sale.model';
import { Material } from '../../../materials/models/material.model';

describe('SaleFormComponent', () => {
  let component: SaleFormComponent;
  let fixture: ComponentFixture<SaleFormComponent>;
  let saleService: jasmine.SpyObj<SaleService>;
  let clientService: jasmine.SpyObj<ClientService>;
  let materialService: jasmine.SpyObj<MaterialService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockMaterials: Material[] = [
    { id: 10, designation: 'Modem', price: 0, checked: false },
    { id: 20, designation: 'Routeur', price: 0, checked: false }
  ];

  const mockSale: Sale = {
    id: 1,
    titre: 'Vente 1',
    description: 'Desc',
    idClient: 1,
    materials: mockMaterials,
    customer: { id: 1, surnom: 'Gigi', idUser: 1, userName: 'gigi', user: {} as any }
  };

  beforeEach(async () => {
    const saleSpy = jasmine.createSpyObj('SaleService', ['create', 'update']);
    const clientSpy = jasmine.createSpyObj('ClientService', ['getAll']);
    const materialSpy = jasmine.createSpyObj('MaterialService', ['getAll']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule,
        MatButtonModule, MatCardModule, MatSelectModule, MatCheckboxModule,
        MatSnackBarModule, TextFieldModule, BrowserAnimationsModule, SaleFormComponent
      ],
      providers: [
        { provide: SaleService, useValue: saleSpy },
        { provide: ClientService, useValue: clientSpy },
        { provide: MaterialService, useValue: materialSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackSpy },
        {
          provide: ActivatedRoute,
          useValue: { data: of({ sale: undefined }), snapshot: { params: {} } }
        }
      ]
    }).compileComponents();

    saleService = TestBed.inject(SaleService) as jasmine.SpyObj<SaleService>;
    clientService = TestBed.inject(ClientService) as jasmine.SpyObj<ClientService>;
    materialService = TestBed.inject(MaterialService) as jasmine.SpyObj<MaterialService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    clientService.getAll.and.returnValue(of([]));
    materialService.getAll.and.returnValue(of(mockMaterials));
    router.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dynamic material controls based on service data', () => {
    expect(component.saleForm.get('material_10')).toBeTruthy();
    expect(component.saleForm.get('material_20')).toBeTruthy();
  });

  it('should submit form with transformed material IDs in create mode', fakeAsync(() => {
    saleService.create.and.returnValue(of(mockSale));

    component.saleForm.patchValue({ titre: 'Vente 1', description: 'Desc', customer_id: 1 });
    component.saleForm.get('material_10')?.setValue(true);

    component.onSubmit();
    tick();

    expect(saleService.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        titre: 'Vente 1',
        materials: [10]
      } as any)
    );
    expect(router.navigate).toHaveBeenCalledWith(['/sale']);
    expect(snackBar.open).toHaveBeenCalledWith('Vente créée', 'OK', jasmine.any(Object));
  }));

  it('should submit correct payload in edit mode', fakeAsync(() => {
    component.isEditMode = true;
    component.saleId = 1;
    saleService.update.and.returnValue(of(mockSale));

    component.saleForm.patchValue({ titre: 'Vente Updated', description: 'Desc', customer_id: 1 });
    component.onSubmit();
    tick();

    expect(saleService.update).toHaveBeenCalledWith(
      1,
      jasmine.objectContaining({ titre: 'Vente Updated' } as any)
    );
    expect(router.navigate).toHaveBeenCalledWith(['/sale']);
    expect(snackBar.open).toHaveBeenCalledWith('Vente modifiée', 'OK', jasmine.any(Object));
  }));

  it('should show snackbar message on server error', fakeAsync(() => {
    const errorMsg = { message: 'Server Error' };
    saleService.create.and.returnValue(throwError(() => errorMsg));

    component.saleForm.patchValue({ titre: 'Vente 1', description: 'Desc', customer_id: 1 });
    component.onSubmit();
    tick();

    expect(snackBar.open).toHaveBeenCalledWith('Server Error', 'Fermer', jasmine.any(Object));
  }));

  it('should validate titre for no-whitespace characters', () => {
    const titre = component.saleForm.get('titre');
    titre?.setValue('   ');
    expect(titre?.hasError('whitespace')).toBeTrue();
    expect(component.getErrorMessage('titre')).toBe('Le champ ne peut pas être vide');
  });

  it('should mark all form controls as touched if form is invalid', () => {
    component.saleForm.patchValue({ titre: '' });
    component.onSubmit();
    expect(component.saleForm.touched).toBeTrue();
    expect(saleService.create).not.toHaveBeenCalled();
  });

  it('should navigate to sale list when goBack is called', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/sale']);
  });
});
