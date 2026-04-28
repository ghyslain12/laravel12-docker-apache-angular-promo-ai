import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { Client } from '../../models/client.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import {ClientService} from '../../services/client.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-client',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent implements OnInit, AfterViewInit {
  private clientService = inject(ClientService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['id', 'surnom', 'users', 'actions'];
  dataSource = new MatTableDataSource<Client>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;

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

  ngOnInit() {
    this.activatedRoute.data.subscribe((response: any) => {
      this.dataSource.data = response.clients || [];
    });
  }

  viewClient(client: Client) {
    this.router.navigate(['/client/show', client.id]).then();
  }

  editClient(client: Client) {
    this.router.navigate(['/client/edit', client.id]).then();
  }

  deleteClient(client: Client): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: `Voulez-vous vraiment supprimer "${client.surnom}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.clientService.delete(client.id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(
              m => m.id !== client.id
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

  goToAddUser() {
    this.router.navigate(['/client/add']).then();
  }
}
