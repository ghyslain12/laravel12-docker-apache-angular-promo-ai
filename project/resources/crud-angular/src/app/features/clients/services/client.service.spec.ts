import { TestBed } from '@angular/core/testing';
import { ClientService } from './client.service';
import { GenericService } from '../../../core/services/api/generic.service';
import { Client } from '../models/client.model';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';

describe('ClientService', () => {
  let service: ClientService;
  let genericServiceSpy: jasmine.SpyObj<GenericService<Client>>;

  const mockClient: Client = {
    id: 1,
    surnom: 'Client Test',
    idUser: 10,
    userName: 'user1',
    user: { id: 10, name: 'user1', email: 'test@test.com' }
  };

  const endpoint = `${environment.baseUri}/api/client`;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('GenericService', ['getAll', 'getById', 'create', 'update', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        ClientService,
        { provide: GenericService, useValue: spy }
      ]
    });

    service = TestBed.inject(ClientService);
    genericServiceSpy = TestBed.inject(GenericService) as jasmine.SpyObj<GenericService<Client>>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getAll and return a list of clients', (done) => {
    const mockClients: Client[] = [mockClient];
    genericServiceSpy.getAll.and.returnValue(of(mockClients));

    service.getAll().subscribe(clients => {
      expect(clients).toEqual(mockClients);
      expect(genericServiceSpy.getAll).toHaveBeenCalledWith(endpoint);
      done();
    });
  });

  it('should call getById and return a single client', (done) => {
    genericServiceSpy.getById.and.returnValue(of(mockClient));

    service.getById(1).subscribe(client => {
      expect(client).toEqual(mockClient);
      expect(genericServiceSpy.getById).toHaveBeenCalledWith(endpoint, 1);
      done();
    });
  });

  it('should call create and return the new client', (done) => {
    const newClient: Partial<Client> = { surnom: 'Nouveau' };
    genericServiceSpy.create.and.returnValue(of(mockClient));

    service.create(newClient).subscribe(client => {
      expect(client).toEqual(mockClient);
      expect(genericServiceSpy.create).toHaveBeenCalledWith(endpoint, newClient as Client);
      done();
    });
  });

  it('should call update and return the updated client', (done) => {
    const updatedData: Partial<Client> = { surnom: 'Modifié' };
    genericServiceSpy.update.and.returnValue(of(mockClient));

    service.update(1, updatedData).subscribe(client => {
      expect(client).toEqual(mockClient);
      expect(genericServiceSpy.update).toHaveBeenCalledWith(endpoint, 1, updatedData);
      done();
    });
  });

  it('should call delete and return void', (done) => {
    genericServiceSpy.delete.and.returnValue(of(undefined));

    service.delete(1).subscribe(() => {
      expect(genericServiceSpy.delete).toHaveBeenCalledWith(endpoint, 1);
      done();
    });
  });
});
