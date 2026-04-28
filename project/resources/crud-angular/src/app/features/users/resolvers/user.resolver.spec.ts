import { TestBed } from '@angular/core/testing';
import { usersResolver, userResolver, userPingResolver } from './user.resolver';
import { UserService } from '../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError, from, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Ping } from '../../../core/models/ping.model';
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from '@angular/router';

describe('User Resolvers', () => {
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockUsers: User[] = [{ id: 1, name: 'Test', email: 'test@test.com' }];

  const mockPing: Ping = {
    status: 'ok',
    message: 'pong',
    timestamp: new Date().toISOString()
  };

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getAll', 'getById', 'ping']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
  });

  describe('usersResolver', () => {
    it('should return a list of users', (done) => {
      userServiceSpy.getAll.and.returnValue(of(mockUsers));

      TestBed.runInInjectionContext(() => {
        const result = usersResolver(mockRoute, mockState);
        from(result as Observable<User[]>).subscribe((res) => {
          expect(res).toEqual(mockUsers);
          done();
        });
      });
    });

    it('should handle error and return empty array', (done) => {
      userServiceSpy.getAll.and.returnValue(throwError(() => ({ message: 'Error' })));

      TestBed.runInInjectionContext(() => {
        const result = usersResolver(mockRoute, mockState);
        from(result as Observable<User[]>).subscribe((res) => {
          expect(res).toEqual([]);
          expect(dialogSpy.open).toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('userResolver', () => {
    it('should return user if id exists', (done) => {
      const route = { paramMap: convertToParamMap({ id: '1' }) } as unknown as ActivatedRouteSnapshot;
      userServiceSpy.getById.and.returnValue(of(mockUsers[0]));

      TestBed.runInInjectionContext(() => {
        const result = userResolver(route, mockState);
        from(result as Observable<User>).subscribe((res) => {
          expect(res).toEqual(mockUsers[0]);
          done();
        });
      });
    });
  });

  describe('userPingResolver', () => {
    it('should return ping data', (done) => {
      userServiceSpy.ping.and.returnValue(of(mockPing));

      TestBed.runInInjectionContext(() => {
        const result = userPingResolver(mockRoute, mockState);
        from(result as Observable<Ping>).subscribe((res) => {
          expect(res).toEqual(mockPing);
          done();
        });
      });
    });
  });
});
