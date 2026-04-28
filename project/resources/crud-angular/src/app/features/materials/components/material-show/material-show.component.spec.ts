import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialShowComponent } from './material-show.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import {Material} from '../../models/material.model';

describe('MaterialShowComponent', () => {
  let component: MaterialShowComponent;
  let fixture: ComponentFixture<MaterialShowComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockMaterial: Material = { id: 1, designation: 'modem', price: 0, checked: false };

  beforeEach(async () => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        MaterialShowComponent,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ material: mockMaterial })
          }
        },
        { provide: Router, useValue: routerSpyObj }
      ]
    }).compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize material from resolver', () => {
    expect(component.material).toEqual(mockMaterial);
  });

  it('should display material designation in template', () => {
    const designationElement = fixture.nativeElement.querySelector('p');
    expect(designationElement.textContent).toContain('Designation:  modem');
  });

  it('should navigate back to material list', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/material']);
  });
});
