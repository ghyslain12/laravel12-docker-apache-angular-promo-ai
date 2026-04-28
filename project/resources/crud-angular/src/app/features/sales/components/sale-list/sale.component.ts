import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { Sale } from '../../models/sale.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { SaleService } from '../../services/sale.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
  ],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css'
})
export class SaleComponent implements OnInit, AfterViewInit {
  private saleService = inject(SaleService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['id', 'titre', 'description', 'customer_id', 'materials', 'actions'];
  dataSource = new MatTableDataSource<Sale>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.activatedRoute.data.subscribe((response: any) => {
      this.dataSource.data = response.sales || [];
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewSale(sale: Sale) {
    this.router.navigate(['/sale/show', sale.id]).then();
  }

  editSale(sale: Sale) {
    this.router.navigate(['/sale/edit', sale.id]).then();
  }

  deleteSale(sale: Sale): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: `Voulez-vous vraiment supprimer "${sale.titre}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.saleService.delete(sale.id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(
              m => m.id !== sale.id
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

  goToAddClient() {
    this.router.navigate(['/sale/add']).then();
  }
}
