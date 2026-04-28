import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../../environments/environment';
import {GenericService} from '../../../core/services/api/generic.service';
import {Sale} from '../models/sale.model';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private genericService = inject<GenericService<Sale>>(GenericService);

  private readonly endpoint = `${environment.baseUri}/api/sale`;

  getAll(): Observable<Sale[]> {
    return this.genericService.getAll(this.endpoint);
  }

  getById(id: number): Observable<Sale> {
    return this.genericService.getById(this.endpoint, id);
  }

  create(sale: Partial<Sale>): Observable<Sale> {
    return this.genericService.create(this.endpoint, (sale as Sale));
  }

  update(id: number, sale: Partial<Sale>): Observable<Sale> {
    return this.genericService.update(this.endpoint, id, sale);
  }

  delete(id: number): Observable<void> {
    return this.genericService.delete(this.endpoint, id);
  }
}
