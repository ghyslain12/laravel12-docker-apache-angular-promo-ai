import { TestBed } from '@angular/core/testing';
import { clientsResolver, clientResolver } from './client.resolver';
import { ClientService } from '../services/client.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError, from, Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from '@angular/router';

describe('Client Resolvers', () => {
  let clientServiceSpy: jasmine.SpyObj<ClientService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockClients: Client[] = [
    { id: 1, surnom: 'Client 1', idUser: 10, userName: 'user1', user: { id: 10, name: 'user1', email: 'test@test.com' } }
  ];

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    clientServiceSpy = jasmine.createSpyObj('ClientService', ['getAll', 'getById']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [
        { provide: ClientService, useValue: clientServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
  });

  describe('clientsResolver', () => {
    it('should return a list of clients', (done) => {
      clientServiceSpy.getAll.and.returnValue(of(mockClients));

      TestBed.runInInjectionContext(() => {
        const result = clientsResolver(mockRoute, mockState);
        from(result as Observable<Client[]>).subscribe({
          next: (res) => {
            expect(res).toEqual(mockClients);
            done();
          }
        });
      });
    });

    it('should open error dialog and return empty array on error', (done) => {
      const errorMsg = 'Erreur API';
      clientServiceSpy.getAll.and.returnValue(throwError(() => ({ message: errorMsg })));

      TestBed.runInInjectionContext(() => {
        const result = clientsResolver(mockRoute, mockState);
        from(result as Observable<Client[]>).subscribe({
          next: (res) => {
            expect(res).toEqual([]);
            expect(dialogSpy.open).toHaveBeenCalled();
            done();
          }
        });
      });
    });
  });

  describe('clientResolver', () => {
    it('should return a client when id is provided in route', (done) => {
      const routeWithId = {
        paramMap: convertToParamMap({ id: '1' })
      } as unknown as ActivatedRouteSnapshot;

      clientServiceSpy.getById.and.returnValue(of(mockClients[0]));

      TestBed.runInInjectionContext(() => {
        const result = clientResolver(routeWithId, mockState);
        from(result as Observable<Client>).subscribe({
          next: (res) => {
            expect(res).toEqual(mockClients[0]);
            expect(clientServiceSpy.getById).toHaveBeenCalledWith(1);
            done();
          }
        });
      });
    });

    it('should return null if id is missing or invalid', (done) => {
      const routeWithoutId = {
        paramMap: convertToParamMap({ id: '' })
      } as unknown as ActivatedRouteSnapshot;

      TestBed.runInInjectionContext(() => {
        const result = clientResolver(routeWithoutId, mockState);
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

      clientServiceSpy.getById.and.returnValue(throwError(() => new Error('Not Found')));

      TestBed.runInInjectionContext(() => {
        const result = clientResolver(routeWithId, mockState);
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
