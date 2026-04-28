import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../../environments/environment';
import {GenericService} from '../../../core/services/api/generic.service';
import {Client} from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private genericService = inject<GenericService<Client>>(GenericService);

  private readonly endpoint = `${environment.baseUri}/api/client`;

  getAll(): Observable<Client[]> {
    return this.genericService.getAll(this.endpoint);
  }

  getById(id: number): Observable<Client> {
    return this.genericService.getById(this.endpoint, id);
  }

  create(client: Partial<Client>): Observable<Client> {
    return this.genericService.create(this.endpoint, (client as Client));
  }

  update(id: number, client: Partial<Client>): Observable<Client> {

    return this.genericService.update(this.endpoint, id, client);
  }

  delete(id: number): Observable<void> {
    return this.genericService.delete(this.endpoint, id);
  }
}
