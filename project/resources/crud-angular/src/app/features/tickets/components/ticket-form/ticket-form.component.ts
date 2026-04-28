import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Sale } from '../../../sales/models/sale.model';

import { MatSelectModule } from '@angular/material/select';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { MatCardModule } from '@angular/material/card';
import {TicketService} from '../../services/ticket.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SaleService} from '../../../sales/services/sale.service';

@Component({
  selector: 'app-ticket-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatLabel,
    MatInput,
    MatFormFieldModule,
    MatSelectModule,
    CdkTextareaAutosize,
    TextFieldModule,
    MatCardModule
],
  templateUrl: './ticket-form.component.html'
})
export class TicketFormComponent implements OnInit{
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private saleService = inject(SaleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  ticketForm: FormGroup;
  isEditMode = false;
  ticketId?: number;
  sales: Sale[] = [];

  constructor() {
    this.ticketForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), this.noWhitespaceValidator]],
      description: ['', [Validators.required]],
      sale_id: ['', [Validators.required]]
    });
  }

  // Validateur personnalisé
  private noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  ngOnInit(): void {
    this.saleService.getAll().subscribe({
      next: (salesData: Sale[]) => {
        this.sales = salesData;

        this.route.data.subscribe((data: any) => {
          if (data['ticket']) {
            this.isEditMode = true;
            this.ticketId = data['ticket'].id;
            const ticket = data['ticket'];

            this.ticketForm.patchValue({
              titre: ticket.titre,
              description: ticket.description,
              sale_id: ticket.sale_id ?? null
            });
          }
        });
      },
      error: (err: any) => {
        this.snackBar.open('Erreur lors du chargement des ventes', 'Fermer');
      }
    });
  }


  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    const ticketData = this.ticketForm.value;

    console.log('Payload envoyé à Laravel :', ticketData);

    const request$ = this.isEditMode && this.ticketId
      ? this.ticketService.update(this.ticketId, ticketData)
      : this.ticketService.create(ticketData);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Ticket modifié' : 'Ticket créé',
          'OK',
          { duration: 3000 }
        );
        this.router.navigate(['/ticket']);
      },
      error: (err) => {
        this.snackBar.open(err.message, 'Fermer', { duration: 5000 });
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.ticketForm.get(field);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (control.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} caractères`;
    }
    if (control.hasError('maxlength')) {
      return `Maximum ${control.errors?.['maxlength'].requiredLength} caractères`;
    }
    if (control.hasError('whitespace')) {
      return 'Le champ ne peut pas être vide';
    }
    return '';
  }

  goBack() {
    this.router.navigate(['/ticket']).then();
  }
}
