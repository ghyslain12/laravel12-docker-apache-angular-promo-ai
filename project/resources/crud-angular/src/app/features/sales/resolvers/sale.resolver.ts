import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import {Sale} from '../models/sale.model';
import {SaleService} from '../services/sale.service';
import {ErrorDialogComponent} from '../../../shared/components/error-dialog.component';
import {MatDialog} from '@angular/material/dialog';

export const salesResolver: ResolveFn<Sale[]> = () => {
  const saleService = inject(SaleService);
  const dialog = inject(MatDialog);

  return saleService.getAll().pipe(
    catchError(error => {
      dialog.open(ErrorDialogComponent, {
        width: '300px',
        data: { message: error.message }
      });
      return of([]);
    })
  );
};

export const saleResolver: ResolveFn<Sale | null> = (route) => {
  const saleService = inject(SaleService);
  const id = Number(route.paramMap.get('id'));

  if (!id) return of(null);

  return saleService.getById(id).pipe(
    catchError(() => of(null))
  );
};
