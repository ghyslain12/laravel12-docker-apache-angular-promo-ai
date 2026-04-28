import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromotionComponent } from './promotion.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PromotionService } from '../../services/promotion.service';
import { Promotion } from '../../models/promotion.model';

describe('PromotionComponent', () => {
  let component: PromotionComponent;
  let fixture: ComponentFixture<PromotionComponent>;
  let router: jasmine.SpyObj<Router>;
  let promotionService: jasmine.SpyObj<PromotionService>;

  const mockPromotions: Promotion[] = [
    {
      id: 1, name: 'Promo été', code: null, type: 'percentage', value: 10,
      target_type: 'all', target_id: null, starts_at: null, ends_at: null,
      usage_limit: null, per_customer_limit: null, times_used: 0,
      priority: 1, active: true, status: 'active', discount_label: '-10%',
      created_at: '', updated_at: ''
    },
    {
      id: 2, name: 'Coupon hiver', code: 'HIVER20', type: 'percentage', value: 20,
      target_type: 'coupon', target_id: null, starts_at: null, ends_at: null,
      usage_limit: 50, per_customer_limit: null, times_used: 5,
      priority: 0, active: true, status: 'active', discount_label: '-20%',
      created_at: '', updated_at: ''
    }
  ];

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const promoSpy  = jasmine.createSpyObj('PromotionService', ['delete']);

    await TestBed.configureTestingModule({
      imports: [
        PromotionComponent,
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: PromotionService, useValue: promoSpy },
        { provide: ActivatedRoute, useValue: { data: of({ promotions: mockPromotions }) } }
      ]
    }).compileComponents();

    router           = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    promotionService = TestBed.inject(PromotionService) as jasmine.SpyObj<PromotionService>;
    router.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load promotions from resolver', () => {
    expect(component.dataSource.data.length).toBe(2);
    expect(component.dataSource.data).toEqual(mockPromotions);
  });

  it('should display promotions in table', () => {
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Promo été');
  });

  it('should navigate to edit page', () => {
    component.editPromotion(mockPromotions[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/promotion/edit', 1]);
  });

  it('should navigate to add page', () => {
    component.goToAdd();
    expect(router.navigate).toHaveBeenCalledWith(['/promotion/add']);
  });

  it('statusColor should return correct color', () => {
    expect(component.statusColor('active')).toBe('primary');
    expect(component.statusColor('disabled')).toBe('warn');
    expect(component.statusColor('expired')).toBe('accent');
  });

  it('targetLabel should return "Tous" for global promotions', () => {
    expect(component.targetLabel(mockPromotions[0])).toBe('Tous');
  });

  it('targetLabel should return coupon code for coupon promotions', () => {
    expect(component.targetLabel(mockPromotions[1])).toBe('HIVER20');
  });

  it('applyFilter should filter the dataSource', () => {
    const event = { target: { value: 'Coupon' } } as unknown as Event;
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('coupon');
  });
});
