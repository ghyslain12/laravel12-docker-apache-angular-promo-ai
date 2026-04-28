import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import {User} from '../models/user.model';
import {UserService} from '../services/user.service';
import {ErrorDialogComponent} from '../../../shared/components/error-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Ping} from '../../../core/models/ping.model';

export const usersResolver: ResolveFn<User[]> = () => {
  const userService = inject(UserService);
  const dialog = inject(MatDialog);

  return userService.getAll().pipe(
    catchError(error => {
      dialog.open(ErrorDialogComponent, {
        width: '300px',
        data: { message: error.message }
      });
      return of([]);
    })
  );
};

export const userResolver: ResolveFn<User | null> = (route) => {
  const userService = inject(UserService);
  const id = Number(route.paramMap.get('id'));

  if (!id) return of(null);

  return userService.getById(id).pipe(
    catchError(() => of(null))
  );
};

export const userPingResolver: ResolveFn<Ping | null> = (route) => {
  const userService = inject(UserService);

  return userService.ping().pipe(
    catchError(() => of(null))
  );
};
