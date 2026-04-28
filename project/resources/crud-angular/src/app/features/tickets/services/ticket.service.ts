import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../../environments/environment';
import {GenericService} from '../../../core/services/api/generic.service';
import {Ticket} from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private genericService = inject<GenericService<Ticket>>(GenericService);

  private readonly endpoint = `${environment.baseUri}/api/ticket`;

  getAll(): Observable<Ticket[]> {
    return this.genericService.getAll(this.endpoint);
  }

  getById(id: number): Observable<Ticket> {
    return this.genericService.getById(this.endpoint, id);
  }

  create(ticket: Partial<Ticket>): Observable<Ticket> {
    return this.genericService.create(this.endpoint, (ticket as Ticket));
  }

  update(id: number, ticket: Partial<Ticket>): Observable<Ticket> {
    return this.genericService.update(this.endpoint, id, ticket);
  }

  delete(id: number): Observable<void> {
    return this.genericService.delete(this.endpoint, id);
  }
}
