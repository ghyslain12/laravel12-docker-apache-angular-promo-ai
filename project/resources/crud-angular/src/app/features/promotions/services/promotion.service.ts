import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../../../core/services/api/generic.service';
import { Promotion } from '../models/promotion.model';

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private genericService = inject<GenericService<Promotion>>(GenericService);

  private readonly endpoint = `${environment.baseUri}/api/promotion`;

  getAll(): Observable<Promotion[]> {
    return this.genericService.getAll(this.endpoint);
  }

  getById(id: number): Observable<Promotion> {
    return this.genericService.getById(this.endpoint, id);
  }

  create(promotion: Partial<Promotion>): Observable<Promotion> {
    return this.genericService.create(this.endpoint, promotion as Promotion);
  }

  update(id: number, promotion: Partial<Promotion>): Observable<Promotion> {
    return this.genericService.update(this.endpoint, id, promotion);
  }

  delete(id: number): Observable<void> {
    return this.genericService.delete(this.endpoint, id);
  }
}
