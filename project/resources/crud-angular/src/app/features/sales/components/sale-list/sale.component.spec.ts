import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SaleComponent } from './sale.component';
import { Sale } from '../../models/sale.model';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SaleService } from '../../services/sale.service';
import { User } from '../../../users/models/user.model';
import { Client } from '../../../clients/models/client.model';
import { Material } from '../../../materials/models/material.model';

describe('SaleComponent', () => {
  let component: SaleComponent;
  let fixture: ComponentFixture<SaleComponent>;
  let router: jasmine.SpyObj<Router>;
  let saleService: jasmine.SpyObj<SaleService>;

  const mockUser: User = { id: 1, name: 'user1', email: 'test@gmail.com' };
  const mockClient: Client = { id: 1, surnom: 'client1', idUser: 1, userName: 'modem', user: mockUser };
  const mockMaterial: Material = { id: 1, designation: 'modem', price: 0, checked: false };

  const mockSales: Sale[] = [
    { id: 1, titre: 'sale1', description: 'desc1', idClient: 1, materials: [mockMaterial], customer: mockClient },
    { id: 2, titre: 'sale2', description: 'desc2', idClient: 1, materials: [mockMaterial], customer: mockClient }
  ];

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const saleSpy = jasmine.createSpyObj('SaleService', ['delete']);

    await TestBed.configureTestingModule({
      imports: [
        SaleComponent,
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: SaleService, useValue: saleSpy },
        { provide: ActivatedRoute, useValue: { data: of({ sales: mockSales }) } }
      ]
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    saleService = TestBed.inject(SaleService) as jasmine.SpyObj<SaleService>;
    router.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dataSource with sales from resolver', () => {
    expect(component.dataSource.data.length).toBe(2);
    expect(component.dataSource.data).toEqual(mockSales);
  });

  it('should display sales in the material table', () => {
    component.dataSource.data = mockSales;
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement;
    const tableRows = nativeElement.querySelectorAll('tr.mat-mdc-row');

    expect(tableRows.length).toBe(2);
    expect(tableRows[0].textContent).toContain('sale1');
    expect(tableRows[0].textContent).toContain('desc1');
  });

  it('should navigate to add sale page', () => {
    component.goToAddClient();
    expect(router.navigate).toHaveBeenCalledWith(['/sale/add']);
  });

  it('should navigate to edit sale page', () => {
    component.editSale(mockSales[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/sale/edit', 1]);
  });

  it('should filter sales table', () => {
    const event = { target: { value: 'sale2' } } as any;
    component.applyFilter(event);

    expect(component.dataSource.filteredData.length).toBe(1);
    expect(component.dataSource.filteredData[0].titre).toBe('sale2');
  });
});
