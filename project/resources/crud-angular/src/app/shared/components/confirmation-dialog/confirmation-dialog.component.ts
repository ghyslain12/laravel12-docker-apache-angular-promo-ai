import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Confirmation</h2>
    <mat-dialog-content>{{data.message}}</mat-dialog-content>
    <mat-dialog-actions>
        <button mat-button (click)="dialogRef.close(true)">Oui</button>
        <button mat-button (click)="dialogRef.close(false)">Non</button>
    </mat-dialog-actions>
  `
})
export class ConfirmationDialogComponent {  dialogRef = inject<MatDialogRef<ConfirmationDialogComponent>>(MatDialogRef);
  data = inject<{
    message: string;
}>(MAT_DIALOG_DATA);

}
