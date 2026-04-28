import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {ErrorHandlerService} from './error-handler.service';
import {Ping} from '../../models/ping.model';

@Injectable({
  providedIn: 'root'
})
export class GenericService<T> {
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);


  get(baseUrl: string): Observable<T[]> {
    return this.http.get<T[]>(baseUrl).pipe(
      catchError(err => this.errorHandler.handleError(err))
    );
  }

  getAll(baseUrl: string): Observable<T[]> {
    return this.get(baseUrl);
  }

  getById(baseUrl: string, id: number): Observable<T> {
    return this.http.get<T>(`${baseUrl}/${id}`).pipe(
      catchError(err => this.errorHandler.handleError(err))
    );
  }

  create(baseUrl: string, item: T): Observable<T> {
    return this.http.post<T>(baseUrl, item).pipe(
      catchError(err => this.errorHandler.handleError(err))
    );
  }

  update(baseUrl: string, id: number, item: Partial<T>): Observable<T> {
    return this.http.put<T>(`${baseUrl}/${id}`, item).pipe(
      catchError(err => this.errorHandler.handleError(err))
    );
  }

  delete(baseUrl: string, id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/${id}`).pipe(
      catchError(err => this.errorHandler.handleError(err))
    );
  }

  ping(baseUrl: string): Observable<Ping> {
    return this.http.get<Ping>(baseUrl).pipe(
      catchError(err => this.errorHandler.handleError(err))
    );
  }
}
