import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import {Ticket} from '../models/ticket.model';
import {TicketService} from '../services/ticket.service';
import {ErrorDialogComponent} from '../../../shared/components/error-dialog.component';
import {MatDialog} from '@angular/material/dialog';

export const ticketsResolver: ResolveFn<Ticket[]> = () => {
  const ticketService = inject(TicketService);
  const dialog = inject(MatDialog);

  return ticketService.getAll().pipe(
    catchError(error => {
      dialog.open(ErrorDialogComponent, {
        width: '300px',
        data: { message: error.message }
      });
      return of([]);
    })
  );
};

export const ticketResolver: ResolveFn<Ticket | null> = (route) => {
  const ticketService = inject(TicketService);
  const id = Number(route.paramMap.get('id'));

  if (!id) return of(null);

  return ticketService.getById(id).pipe(
    catchError(() => of(null))
  );
};
