import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../../environments/environment';
import {GenericService} from '../../../core/services/api/generic.service';
import {Material} from '../models/material.model';
import {Ping} from '../../../core/models/ping.model';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private genericService = inject<GenericService<Material>>(GenericService);

  private readonly endpoint = `${environment.baseUri}/api/material`;

  getAll(): Observable<Material[]> {
    return this.genericService.getAll(this.endpoint);
  }

  getById(id: number): Observable<Material> {
    return this.genericService.getById(this.endpoint, id);
  }

  create(material: Partial<Material>): Observable<Material> {
    return this.genericService.create(this.endpoint, (material as Material));
  }

  update(id: number, material: Partial<Material>): Observable<Material> {
    return this.genericService.update(this.endpoint, id, material);
  }

  delete(id: number): Observable<void> {
    return this.genericService.delete(this.endpoint, id);
  }

  ping(): Observable<Ping> {
    return this.genericService.ping(this.endpoint);
  }
}
