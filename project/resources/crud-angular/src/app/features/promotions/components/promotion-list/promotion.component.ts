import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { Promotion } from '../../models/promotion.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { PromotionService } from '../../services/promotion.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-promotion',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './promotion.component.html',
  styleUrl: './promotion.component.css'
})
export class PromotionComponent implements OnInit, AfterViewInit {
  private promotionService = inject(PromotionService);
  private dialog           = inject(MatDialog);
  private router           = inject(Router);
  private activatedRoute   = inject(ActivatedRoute);
  private snackBar         = inject(MatSnackBar);

  displayedColumns: string[] = ['id', 'name', 'type', 'value', 'target_type', 'status', 'actions'];
  dataSource = new MatTableDataSource<Promotion>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe((response: any) => {
      this.dataSource.data = response.promotions || [];
    });
  }

  viewPromotion(promotion: Promotion): void {
    this.router.navigate(['/promotion/show', promotion.id]).then();
  }

  editPromotion(promotion: Promotion): void {
    this.router.navigate(['/promotion/edit', promotion.id]);
  }

  deletePromotion(promotion: Promotion): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Voulez-vous vraiment supprimer "${promotion.name}" ?` }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.promotionService.delete(promotion.id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(p => p.id !== promotion.id);
            this.snackBar.open('Promotion supprimée', 'OK', { duration: 3000 });
          },
          error: (err) => this.snackBar.open(err.message, 'Fermer', { duration: 5000 })
        });
      }
    });
  }

  goToAdd() {
    this.router.navigate(['/promotion/add']).then();
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      active: 'primary', disabled: 'warn', expired: 'accent', scheduled: ''
    };
    return map[status] ?? '';
  }

  targetLabel(p: Promotion): string {
    if (p.target_type === 'material') return p.material?.designation ?? `#${p.target_id}`;
    if (p.target_type === 'coupon')   return p.code ?? '-';
    return 'Tous';
  }
}
