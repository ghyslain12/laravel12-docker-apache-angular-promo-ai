import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../../environments/environment';
import {GenericService} from '../../../core/services/api/generic.service';
import {User} from '../models/user.model';
import {Ping} from '../../../core/models/ping.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private genericService = inject<GenericService<User>>(GenericService);

  private readonly endpoint = `${environment.baseUri}/api/utilisateur`;

  getAll(): Observable<User[]> {
    return this.genericService.getAll(this.endpoint);
  }

  getById(id: number): Observable<User> {
    return this.genericService.getById(this.endpoint, id);
  }

  create(user: Partial<User>): Observable<User> {
    return this.genericService.create(this.endpoint, (user as User));
  }

  update(id: number, user: Partial<User>): Observable<User> {
    return this.genericService.update(this.endpoint, id, user);
  }

  delete(id: number): Observable<void> {
    return this.genericService.delete(this.endpoint, id);
  }

  ping(): Observable<Ping> {
    return this.genericService.ping(this.endpoint);
  }
}
