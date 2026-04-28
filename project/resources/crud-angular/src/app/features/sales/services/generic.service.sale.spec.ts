import { TestBed } from '@angular/core/testing';
import { SaleService } from './sale.service';
import { GenericService } from '../../../core/services/api/generic.service';
import { Sale } from '../models/sale.model';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';

describe('SaleService', () => {
  let service: SaleService;
  let genericSpy: jasmine.SpyObj<GenericService<Sale>>;
  const endpoint = `${environment.baseUri}/api/sale`;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('GenericService', ['getAll', 'getById', 'create', 'update', 'delete']);
    TestBed.configureTestingModule({
      providers: [SaleService, { provide: GenericService, useValue: spy }]
    });
    service = TestBed.inject(SaleService);
    genericSpy = TestBed.inject(GenericService) as jasmine.SpyObj<GenericService<Sale>>;
  });

  it('should call create with correct endpoint', () => {
    const mockSale = { titre: 'Vente 1' };
    genericSpy.create.and.returnValue(of(mockSale as Sale));
    service.create(mockSale);
    expect(genericSpy.create).toHaveBeenCalledWith(endpoint, mockSale as Sale);
  });
});
