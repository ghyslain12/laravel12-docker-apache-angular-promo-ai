import { TestBed } from '@angular/core/testing';
import { salesResolver, saleResolver } from './sale.resolver';
import { SaleService } from '../services/sale.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError, from, Observable } from 'rxjs';
import { Sale } from '../models/sale.model';
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from '@angular/router';

describe('Sale Resolvers', () => {
  let saleServiceSpy: jasmine.SpyObj<SaleService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockSales: Sale[] = [
    { id: 1, titre: 'Sale 1', description: 'Desc 1', idClient: 10, materials: [], customer: {} as any }
  ];

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    saleServiceSpy = jasmine.createSpyObj('SaleService', ['getAll', 'getById']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [
        { provide: SaleService, useValue: saleServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
  });

  describe('salesResolver', () => {
    it('should return a list of sales', (done) => {
      saleServiceSpy.getAll.and.returnValue(of(mockSales));

      TestBed.runInInjectionContext(() => {
        const result = salesResolver(mockRoute, mockState);
        from(result as Observable<Sale[]>).subscribe({
          next: (res) => {
            expect(res).toEqual(mockSales);
            done();
          }
        });
      });
    });

    it('should open error dialog and return empty array on error', (done) => {
      const errorMsg = 'Erreur API';
      saleServiceSpy.getAll.and.returnValue(throwError(() => ({ message: errorMsg })));

      TestBed.runInInjectionContext(() => {
        const result = salesResolver(mockRoute, mockState);
        from(result as Observable<Sale[]>).subscribe({
          next: (res) => {
            expect(res).toEqual([]);
            expect(dialogSpy.open).toHaveBeenCalled();
            done();
          }
        });
      });
    });
  });

  describe('saleResolver', () => {
    it('should return a sale when id is provided in route', (done) => {
      const routeWithId = {
        paramMap: convertToParamMap({ id: '1' })
      } as unknown as ActivatedRouteSnapshot;

      saleServiceSpy.getById.and.returnValue(of(mockSales[0]));

      TestBed.runInInjectionContext(() => {
        const result = saleResolver(routeWithId, mockState);
        from(result as Observable<Sale>).subscribe({
          next: (res) => {
            expect(res).toEqual(mockSales[0]);
            expect(saleServiceSpy.getById).toHaveBeenCalledWith(1);
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
        const result = saleResolver(routeWithoutId, mockState);
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

      saleServiceSpy.getById.and.returnValue(throwError(() => new Error('Not Found')));

      TestBed.runInInjectionContext(() => {
        const result = saleResolver(routeWithId, mockState);
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
