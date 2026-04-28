import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {Material} from '../models/material.model';
import {MaterialService} from '../services/material.service';
import {ErrorDialogComponent} from '../../../shared/components/error-dialog.component';
import {Ping} from '../../../core/models/ping.model';

export const materialsResolver: ResolveFn<Material[]> = () => {
  const materialService = inject(MaterialService);
  const dialog = inject(MatDialog);

  return materialService.getAll().pipe(
    catchError(error => {
      dialog.open(ErrorDialogComponent, {
        width: '300px',
        data: { message: error.message }
      });
      return of([]);
    })
  );
};

export const materialResolver: ResolveFn<Material | null> = (route) => {
  const materialService = inject(MaterialService);
  const id = Number(route.paramMap.get('id'));

  if (!id) return of(null);

  return materialService.getById(id).pipe(
    catchError(() => of(null))
  );
};

export const materialPingResolver: ResolveFn<Ping | null> = (route) => {
  const materialService = inject(MaterialService);

  return materialService.ping().pipe(
    catchError(() => of(null))
  );
};
