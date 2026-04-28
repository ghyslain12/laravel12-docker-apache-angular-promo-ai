import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { GenericService } from '../../../core/services/api/generic.service';
import { User } from '../models/user.model';
import { Ping } from '../../../core/models/ping.model';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let genericSpy: jasmine.SpyObj<GenericService<User>>;
  const endpoint = `${environment.baseUri}/api/utilisateur`;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('GenericService', ['getAll', 'getById', 'create', 'update', 'delete', 'ping']);
    TestBed.configureTestingModule({
      providers: [UserService, { provide: GenericService, useValue: spy }]
    });
    service = TestBed.inject(UserService);
    genericSpy = TestBed.inject(GenericService) as jasmine.SpyObj<GenericService<User>>;
  });

  it('should use the specific utilisateur endpoint for getAll', () => {
    genericSpy.getAll.and.returnValue(of([]));
    service.getAll();
    expect(genericSpy.getAll).toHaveBeenCalledWith(endpoint);
  });

  it('should call ping', () => {
    genericSpy.ping.and.returnValue(of({ status: 'ok' } as Ping));
    service.ping();
    expect(genericSpy.ping).toHaveBeenCalledWith(endpoint);
  });
});
