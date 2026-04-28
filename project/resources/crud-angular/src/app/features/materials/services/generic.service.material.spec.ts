import { TestBed } from '@angular/core/testing';
import { MaterialService } from './material.service';
import { GenericService } from '../../../core/services/api/generic.service';
import { Material } from '../models/material.model';
import { Ping } from '../../../core/models/ping.model';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';

describe('MaterialService', () => {
  let service: MaterialService;
  let genericSpy: jasmine.SpyObj<GenericService<Material>>;
  const endpoint = `${environment.baseUri}/api/material`;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('GenericService', ['getAll', 'getById', 'create', 'update', 'delete', 'ping']);
    TestBed.configureTestingModule({
      providers: [MaterialService, { provide: GenericService, useValue: spy }]
    });
    service = TestBed.inject(MaterialService);
    genericSpy = TestBed.inject(GenericService) as jasmine.SpyObj<GenericService<Material>>;
  });

  it('should call ping and return Ping status', (done) => {
    const mockPing: Ping = { status: 'ok', message: 'pong', timestamp: ''};
    genericSpy.ping.and.returnValue(of(mockPing));
    service.ping().subscribe(res => {
      expect(res).toEqual(mockPing);
      expect(genericSpy.ping).toHaveBeenCalledWith(endpoint);
      done();
    });
  });

  it('should call getAll', () => {
    genericSpy.getAll.and.returnValue(of([]));
    service.getAll();
    expect(genericSpy.getAll).toHaveBeenCalledWith(endpoint);
  });
});
