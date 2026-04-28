import { TestBed } from '@angular/core/testing';
import { ticketsResolver, ticketResolver } from './ticket.resolver';
import { TicketService } from '../services/ticket.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError, from, Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from '@angular/router';

describe('Ticket Resolvers', () => {
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockTickets: Ticket[] = [
    { id: 1, titre: 'Ticket 1', description: 'Desc 1', sale_id: 10, sale: { id: 10, titre: 'Sale 10', description: '', idClient: 1, materials: [], customer: {} as any } }
  ];

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    ticketServiceSpy = jasmine.createSpyObj('TicketService', ['getAll', 'getById']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [
        { provide: TicketService, useValue: ticketServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
  });

  describe('ticketsResolver', () => {
    it('should return a list of tickets', (done) => {
      ticketServiceSpy.getAll.and.returnValue(of(mockTickets));

      TestBed.runInInjectionContext(() => {
        const result = ticketsResolver(mockRoute, mockState);
        from(result as Observable<Ticket[]>).subscribe({
          next: (res) => {
            expect(res).toEqual(mockTickets);
            done();
          }
        });
      });
    });

    it('should open error dialog and return empty array on error', (done) => {
      const errorMsg = 'Erreur serveur';
      ticketServiceSpy.getAll.and.returnValue(throwError(() => ({ message: errorMsg })));

      TestBed.runInInjectionContext(() => {
        const result = ticketsResolver(mockRoute, mockState);
        from(result as Observable<Ticket[]>).subscribe({
          next: (res) => {
            expect(res).toEqual([]);
            expect(dialogSpy.open).toHaveBeenCalled();
            done();
          }
        });
      });
    });
  });

  describe('ticketResolver', () => {
    it('should return a ticket when id is provided', (done) => {
      const routeWithId = {
        paramMap: convertToParamMap({ id: '1' })
      } as unknown as ActivatedRouteSnapshot;

      ticketServiceSpy.getById.and.returnValue(of(mockTickets[0]));

      TestBed.runInInjectionContext(() => {
        const result = ticketResolver(routeWithId, mockState);
        from(result as Observable<Ticket>).subscribe({
          next: (res) => {
            expect(res).toEqual(mockTickets[0]);
            expect(ticketServiceSpy.getById).toHaveBeenCalledWith(1);
            done();
          }
        });
      });
    });

    it('should return null if id is missing', (done) => {
      const routeWithoutId = {
        paramMap: convertToParamMap({ id: '' })
      } as unknown as ActivatedRouteSnapshot;

      TestBed.runInInjectionContext(() => {
        const result = ticketResolver(routeWithoutId, mockState);
        from(result as Observable<null>).subscribe({
          next: (res) => {
            expect(res).toBeNull();
            done();
          }
        });
      });
    });

    it('should return null on service error', (done) => {
      const routeWithId = {
        paramMap: convertToParamMap({ id: '1' })
      } as unknown as ActivatedRouteSnapshot;

      ticketServiceSpy.getById.and.returnValue(throwError(() => new Error('404')));

      TestBed.runInInjectionContext(() => {
        const result = ticketResolver(routeWithId, mockState);
        from(result as Observable<null>).subscribe({
          next: (res) => {
            expect(res).toBeNull();
            done();
          }
        });
      });
    });
  });
});
