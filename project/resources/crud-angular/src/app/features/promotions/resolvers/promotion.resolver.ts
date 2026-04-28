import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Promotion } from '../models/promotion.model';
import { PromotionService } from '../services/promotion.service';
import { ErrorDialogComponent } from '../../../shared/components/error-dialog.component';

export const promotionsResolver: ResolveFn<Promotion[]> = () => {
  const promotionService = inject(PromotionService);
  const dialog = inject(MatDialog);

  return promotionService.getAll().pipe(
    catchError(error => {
      dialog.open(ErrorDialogComponent, { width: '300px', data: { message: error.message } });
      return of([]);
    })
  );
};

export const promotionResolver: ResolveFn<Promotion | null> = (route) => {
  const promotionService = inject(PromotionService);
  const id = Number(route.paramMap.get('id'));
  if (!id) return of(null);
  return promotionService.getById(id).pipe(catchError(() => of(null)));
};
