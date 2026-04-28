import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GenericService } from './generic.service';
import { ErrorHandlerService } from './error-handler.service';
import { throwError } from 'rxjs';

describe('GenericService', () => {
  let service: GenericService<any>;
  let httpMock: HttpTestingController;
  let errorHandlerSpy: jasmine.SpyObj<ErrorHandlerService>;
  const mockBaseUrl = 'http://api.test.com';

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ErrorHandlerService', ['handleError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GenericService,
        { provide: ErrorHandlerService, useValue: spy }
      ]
    });

    service = TestBed.inject(GenericService);
    httpMock = TestBed.inject(HttpTestingController);
    errorHandlerSpy = TestBed.inject(ErrorHandlerService) as jasmine.SpyObj<ErrorHandlerService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('CRUD Operations Success', () => {
    it('should perform GET (getAll)', () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      service.getAll(mockBaseUrl).subscribe(data => expect(data).toEqual(mockData));

      const req = httpMock.expectOne(mockBaseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should perform GET by id', () => {
      const mockData = { id: 1 };
      service.getById(mockBaseUrl, 1).subscribe(data => expect(data).toEqual(mockData));

      const req = httpMock.expectOne(`${mockBaseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should perform POST (create)', () => {
      const newItem = { name: 'test' };
      service.create(mockBaseUrl, newItem).subscribe(data => expect(data).toEqual(newItem));

      const req = httpMock.expectOne(mockBaseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newItem);
      req.flush(newItem);
    });

    it('should perform PUT (update)', () => {
      const updateData = { name: 'updated' };
      service.update(mockBaseUrl, 1, updateData).subscribe(data => expect(data).toEqual(updateData));

      const req = httpMock.expectOne(`${mockBaseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updateData);
    });

    it('should perform DELETE', () => {
      service.delete(mockBaseUrl, 1).subscribe();

      const req = httpMock.expectOne(`${mockBaseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Error Handling Integration', () => {
    it('should call ErrorHandlerService on request failure', () => {
      errorHandlerSpy.handleError.and.returnValue(throwError(() => new Error('Mock Error')));

      service.getAll(mockBaseUrl).subscribe({
        error: () => {
          expect(errorHandlerSpy.handleError).toHaveBeenCalled();
        }
      });

      const req = httpMock.expectOne(mockBaseUrl);
      req.error(new ProgressEvent('Network error')); // Simule une erreur réseau
    });

    it('should call ErrorHandlerService on server error (500)', () => {
      errorHandlerSpy.handleError.and.returnValue(throwError(() => ({ code: 'SERVER_ERROR' })));

      service.getById(mockBaseUrl, 1).subscribe({
        error: (err) => {
          expect(err.code).toBe('SERVER_ERROR');
          expect(errorHandlerSpy.handleError).toHaveBeenCalled();
        }
      });

      const req = httpMock.expectOne(`${mockBaseUrl}/1`);
      req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
    });
  });

  it('should perform ping request', () => {
    const mockPing = { status: 'ok', message: 'pong', timestamp: 'now' };
    service.ping(mockBaseUrl).subscribe(data => expect(data).toEqual(mockPing));

    const req = httpMock.expectOne(mockBaseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockPing);
  });
});
