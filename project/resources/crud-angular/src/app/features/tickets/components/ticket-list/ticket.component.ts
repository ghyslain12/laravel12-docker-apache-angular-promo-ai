import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { Ticket } from '../../models/ticket.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import {TicketService} from '../../services/ticket.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-ticket',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
  ],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.css'
})
export class TicketComponent implements OnInit, AfterViewInit {
  private ticketService = inject(TicketService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['id', 'titre', 'description', 'sales', 'actions'];
  dataSource = new MatTableDataSource<Ticket>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;

  ngOnInit() {
    this.activatedRoute.data.subscribe((response: any) => {
      this.dataSource.data = response.tickets || [];
    });
  }

  // gestion pagination & tri du tableau
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // gestion filtre du tableau
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewTicket(ticket: Ticket) {
    this.router.navigate(['/ticket/show', ticket.id]).then();
  }

  editTicket(ticket: Ticket) {
    this.router.navigate(['/ticket/edit', ticket.id]).then();
  }

  deleteTicket(ticket: Ticket): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: `Voulez-vous vraiment supprimer "${ticket.titre}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.ticketService.delete(ticket.id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(
              m => m.id !== ticket.id
            );
            this.snackBar.open('Matériel supprimé avec succès', 'OK', {
              duration: 3000
            });
          },
          error: (err) => {
            this.snackBar.open(err.message, 'Fermer', { duration: 5000 });
          }
        });
      }
    });
  }

  goToAddSale() {
    this.router.navigate(['/ticket/add']).then();
  }
}
