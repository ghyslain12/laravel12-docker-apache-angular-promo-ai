import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { Material } from '../../models/material.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {MaterialService} from '../../services/material.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-material',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  templateUrl: './material.component.html',
  styleUrl: './material.component.css'
})
export class MaterialComponent implements OnInit, AfterViewInit {
  private materialService = inject(MaterialService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['id', 'designation', 'actions'];
  dataSource = new MatTableDataSource<Material>();

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
      this.dataSource.data = response.materials || [];
    });
  }

  viewMaterial(material: Material) {
    this.router.navigate(['/material/show', material.id]).then();
  }

  editMaterial(material: Material): void {
    this.router.navigate(['/material/edit', material.id]);
  }

  deleteMaterial(material: Material): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: `Voulez-vous vraiment supprimer "${material.designation}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.materialService.delete(material.id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(
              m => m.id !== material.id
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

  goToAddMaterial() {
    this.router.navigate(['/material/add']).then();
  }
}
