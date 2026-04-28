import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromotionShowComponent } from './promotion-show.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Promotion } from '../../models/promotion.model';

describe('PromotionShowComponent', () => {
  let component: PromotionShowComponent;
  let fixture: ComponentFixture<PromotionShowComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockPromotion: Promotion = {
    id: 1, name: 'Promo été', code: null, type: 'percentage', value: 15,
    target_type: 'all', target_id: null, starts_at: null, ends_at: null,
    usage_limit: null, per_customer_limit: null, times_used: 3,
    priority: 1, active: true, status: 'active', discount_label: '-15%',
    created_at: '2025-01-01', updated_at: '2025-01-01'
  };

  beforeEach(async () => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PromotionShowComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({ promotion: mockPromotion }) } },
        { provide: Router, useValue: routerSpyObj }
      ]
    }).compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture   = TestBed.createComponent(PromotionShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load promotion from resolver', () => {
    expect(component.promotion).toEqual(mockPromotion);
  });

  it('should display promotion name', () => {
    const el = fixture.nativeElement.querySelector('p');
    expect(el.textContent).toContain('Promo été');
  });

  it('targetLabel should return "Tous les matériaux" for global promotion', () => {
    expect(component.targetLabel).toBe('Tous les matériaux');
  });

  it('targetLabel should return coupon code', () => {
    component.promotion = { ...mockPromotion, target_type: 'coupon', code: 'ETE25' };
    expect(component.targetLabel).toBe('ETE25');
  });

  it('statusColor should return primary for active', () => {
    expect(component.statusColor('active')).toBe('primary');
  });

  it('should navigate back to promotion list', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/promotion']);
  });
});
