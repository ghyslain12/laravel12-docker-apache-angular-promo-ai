import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {StorageService} from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  private readonly baseUri = environment.baseUri;
  private readonly TOKEN_KEY = 'token';
  private readonly CONFIG_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private loggedIn = new BehaviorSubject<boolean>(false);
  private jwtEnabled = new BehaviorSubject<boolean>(true);
  private jwtConfigCache$?: Observable<{ jwt_enabled: boolean }>;

  constructor() {
    this.loggedIn.next(!!this.getToken());
  }

  getLoggedInValue(): boolean {
    return this.loggedIn.getValue();
  }

  getLoggedInStatus(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getJwtEnabledStatus(): Observable<boolean> {
    return this.jwtEnabled.asObservable();
  }

  getJwtConfig(): Observable<{ jwt_enabled: boolean }> {
    if (!this.jwtConfigCache$) {
      this.jwtConfigCache$ = this.http.get<{ jwt_enabled: boolean }>(
        `${this.baseUri}/api/config/jwt`
      ).pipe(
        shareReplay(1),
        catchError(() => of({ jwt_enabled: true }))
      );

      timer(this.CONFIG_CACHE_DURATION).subscribe(() => {
        this.jwtConfigCache$ = undefined;
      });
    }
    return this.jwtConfigCache$;
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post(`${this.baseUri}/api/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setToken(response.token);
          this.loggedIn.next(true);
        }
      })
    );
  }

  setToken(token: string): void {
    this.storage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return this.storage.getItem<string>(this.TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate < new Date();
    } catch {
      return true;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  logout() {
    this.storage.removeItem(this.TOKEN_KEY);
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }
}
