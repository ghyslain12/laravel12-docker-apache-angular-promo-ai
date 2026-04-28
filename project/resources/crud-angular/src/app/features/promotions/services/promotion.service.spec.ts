import { TestBed } from '@angular/core/testing';
import { PromotionService } from './promotion.service';
import { GenericService } from '../../../core/services/api/generic.service';
import { Promotion } from '../models/promotion.model';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';

describe('PromotionService', () => {
  let service: PromotionService;
  let genericSpy: jasmine.SpyObj<GenericService<Promotion>>;
  const endpoint = `${environment.baseUri}/api/promotion`;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('GenericService', ['getAll', 'getById', 'create', 'update', 'delete']);
    TestBed.configureTestingModule({
      providers: [PromotionService, { provide: GenericService, useValue: spy }]
    });
    service    = TestBed.inject(PromotionService);
    genericSpy = TestBed.inject(GenericService) as jasmine.SpyObj<GenericService<Promotion>>;
  });

  it('should call getAll with correct endpoint', () => {
    genericSpy.getAll.and.returnValue(of([]));
    service.getAll();
    expect(genericSpy.getAll).toHaveBeenCalledWith(endpoint);
  });

  it('should call create with correct endpoint', () => {
    const promo = { name: 'Test', type: 'percentage', value: 10 } as any;
    genericSpy.create.and.returnValue(of(promo));
    service.create(promo);
    expect(genericSpy.create).toHaveBeenCalledWith(endpoint, promo);
  });

  it('should call update with correct id', () => {
    genericSpy.update.and.returnValue(of({} as Promotion));
    service.update(1, { name: 'Updated' });
    expect(genericSpy.update).toHaveBeenCalledWith(endpoint, 1, { name: 'Updated' });
  });

  it('should call delete with correct id', () => {
    genericSpy.delete.and.returnValue(of(undefined));
    service.delete(1);
    expect(genericSpy.delete).toHaveBeenCalledWith(endpoint, 1);
  });
});
