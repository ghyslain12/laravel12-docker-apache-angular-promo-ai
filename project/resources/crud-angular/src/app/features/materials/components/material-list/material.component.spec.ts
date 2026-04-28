import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialComponent } from './material.component';
import { Material } from '../../models/material.model';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MaterialService } from '../../services/material.service';

describe('MaterialComponent', () => {
  let component: MaterialComponent;
  let fixture: ComponentFixture<MaterialComponent>;
  let router: jasmine.SpyObj<Router>;
  let materialService: jasmine.SpyObj<MaterialService>;

  const mockMaterials: Material[] = [
    { id: 1, designation: 'modem2', price: 0, checked: false },
    { id: 2, designation: 'stb2', price: 0, checked: false }
  ];

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const materialSpy = jasmine.createSpyObj('MaterialService', ['delete']);

    await TestBed.configureTestingModule({
      imports: [
        MaterialComponent,
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: MaterialService, useValue: materialSpy },
        {
          provide: ActivatedRoute,
          useValue: { data: of({ materials: mockMaterials }) }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    materialService = TestBed.inject(MaterialService) as jasmine.SpyObj<MaterialService>;
    router.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dataSource with materials from resolver', () => {
    expect(component.dataSource.data.length).toBe(2);
    expect(component.dataSource.data).toEqual(mockMaterials);
  });

  it('should display materials in the material table', () => {
    const tableRows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(tableRows.length).toBe(2);

    const firstRowText = tableRows[0].textContent;
    expect(firstRowText).toContain('1');
    expect(firstRowText).toContain('modem2');
  });

  it('should navigate to add page when goToAddMaterial is called', () => {
    component.goToAddMaterial();
    expect(router.navigate).toHaveBeenCalledWith(['/material/add']);
  });

  it('should navigate to edit page when editMaterial is called', () => {
    component.editMaterial(mockMaterials[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/material/edit', 1]);
  });

  it('should filter data correctly', () => {
    const event = { target: { value: 'stb' } } as any;
    component.applyFilter(event);

    expect(component.dataSource.filteredData.length).toBe(1);
    expect(component.dataSource.filteredData[0].designation).toBe('stb2');
  });
});
