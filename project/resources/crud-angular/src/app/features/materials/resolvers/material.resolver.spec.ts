import { TestBed } from '@angular/core/testing';
import { materialsResolver, materialResolver, materialPingResolver } from './material.resolver';
import { MaterialService } from '../services/material.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError, from, Observable } from 'rxjs';
import { Material } from '../models/material.model';
import { Ping } from '../../../core/models/ping.model';
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from '@angular/router';

describe('Material Resolvers', () => {
  let materialServiceSpy: jasmine.SpyObj<MaterialService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockMaterials: Material[] = [
    { id: 1, designation: 'Modem Fibre', price: 0, checked: false }
  ];

  const mockPing: Ping = {
    status: 'ok',
    message: 'pong',
    timestamp: new Date().toISOString()
  };

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    materialServiceSpy = jasmine.createSpyObj('MaterialService', ['getAll', 'getById', 'ping']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [
        { provide: MaterialService, useValue: materialServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
  });

  describe('materialsResolver', () => {
    it('should return a list of materials', (done) => {
      materialServiceSpy.getAll.and.returnValue(of(mockMaterials));

      TestBed.runInInjectionContext(() => {
        const result = materialsResolver(mockRoute, mockState);
        from(result as Observable<Material[]>).subscribe({
          next: (res) => {
            expect(res).toEqual(mockMaterials);
            done();
          }
        });
      });
    });

    it('should handle error and open dialog', (done) => {
      materialServiceSpy.getAll.and.returnValue(throwError(() => ({ message: 'Fail' })));

      TestBed.runInInjectionContext(() => {
        const result = materialsResolver(mockRoute, mockState);
        from(result as Observable<Material[]>).subscribe({
          next: (res) => {
            expect(res).toEqual([]);
            expect(dialogSpy.open).toHaveBeenCalled();
            done();
          }
        });
      });
    });
  });

  describe('materialResolver', () => {
    it('should return material by id', (done) => {
      const route = { paramMap: convertToParamMap({ id: '1' }) } as unknown as ActivatedRouteSnapshot;
      materialServiceSpy.getById.and.returnValue(of(mockMaterials[0]));

      TestBed.runInInjectionContext(() => {
        const result = materialResolver(route, mockState);
        from(result as Observable<Material>).subscribe({
          next: (res) => {
            expect(res).toEqual(mockMaterials[0]);
            done();
          }
        });
      });
    });

    it('should return null if id is missing', (done) => {
      const route = { paramMap: convertToParamMap({ id: '' }) } as unknown as ActivatedRouteSnapshot;

      TestBed.runInInjectionContext(() => {
        const result = materialResolver(route, mockState);
        from(result as Observable<null>).subscribe({
          next: (res) => {
            expect(res).toBeNull();
            done();
          }
        });
      });
    });
  });

  describe('materialPingResolver', () => {
    it('should return ping status', (done) => {
      materialServiceSpy.ping.and.returnValue(of(mockPing));

      TestBed.runInInjectionContext(() => {
        const result = materialPingResolver(mockRoute, mockState);
        from(result as Observable<Ping>).subscribe({
          next: (res) => {
            expect(res).toEqual(mockPing);
            expect(res.timestamp).toBeDefined();
            done();
          }
        });
      });
    });

    it('should return null on ping error', (done) => {
      materialServiceSpy.ping.and.returnValue(throwError(() => new Error('Error')));

      TestBed.runInInjectionContext(() => {
        const result = materialPingResolver(mockRoute, mockState);
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
