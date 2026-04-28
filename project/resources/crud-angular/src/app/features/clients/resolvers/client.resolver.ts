import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import {Client} from '../models/client.model';
import {ClientService} from '../services/client.service';
import {ErrorDialogComponent} from '../../../shared/components/error-dialog.component';
import {MatDialog} from '@angular/material/dialog';

export const clientsResolver: ResolveFn<Client[]> = () => {
  const clientService = inject(ClientService);
  const dialog = inject(MatDialog);

  return clientService.getAll().pipe(
    catchError(error => {
      dialog.open(ErrorDialogComponent, {
        width: '300px',
        data: { message: error.message }
      });
      return of([]);
    })
  );
};

export const clientResolver: ResolveFn<Client | null> = (route) => {
  const clientService = inject(ClientService);
  const id = Number(route.paramMap.get('id'));

  if (!id) return of(null);

  return clientService.getById(id).pipe(
    catchError(() => of(null))
  );
};
