import { TestBed } from '@angular/core/testing';
import { TicketService } from './ticket.service';
import { GenericService } from '../../../core/services/api/generic.service';
import { Ticket } from '../models/ticket.model';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';

describe('TicketService', () => {
  let service: TicketService;
  let genericSpy: jasmine.SpyObj<GenericService<Ticket>>;
  const endpoint = `${environment.baseUri}/api/ticket`;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('GenericService', ['getAll', 'getById', 'create', 'update', 'delete']);
    TestBed.configureTestingModule({
      providers: [TicketService, { provide: GenericService, useValue: spy }]
    });
    service = TestBed.inject(TicketService);
    genericSpy = TestBed.inject(GenericService) as jasmine.SpyObj<GenericService<Ticket>>;
  });

  it('should call delete with correct id', () => {
    genericSpy.delete.and.returnValue(of(undefined));
    service.delete(42);
    expect(genericSpy.delete).toHaveBeenCalledWith(endpoint, 42);
  });
});
