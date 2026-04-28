import { Component, OnInit, inject } from '@angular/core';
import { Sale } from '../../models/sale.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService, INVOICE_COUNTRIES } from '../../services/invoice.service';

@Component({
  selector: 'app-sale-show',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatSelectModule, MatFormFieldModule,
    MatProgressSpinnerModule, CurrencyPipe, FormsModule
  ],
  templateUrl: './sale-show.component.html',
  styleUrl: './sale-show.component.css'
})
export class SaleShowComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private invoiceService = inject(InvoiceService);

  sale: Sale | undefined;

  countries       = INVOICE_COUNTRIES;
  selectedCountry = 'fr';
  isGenerating    = false;
  isDownloading   = false;
  invoiceReady    = false;
  invoiceError    = '';
  invoiceInfo     = '';

  ngOnInit() {
    this.route.data.subscribe((response: any) => {
      this.sale = response.sale;
      console.log(this.sale);
      this.invoiceReady = false;
      this.invoiceError = '';
    });
  }

  get totalPrice(): number {
    if (!this.sale?.materials) return 0;
    return this.sale.materials.reduce((sum, m) => {
      const price = m.pivot?.final_price ?? m.price ?? 0;
      return sum + Number(price);
    }, 0);
  }

  goBack() {
    this.router.navigate(['/sale']).then();
  }

  onCountryChange(): void {
    this.invoiceReady = false;
    this.invoiceError = '';
    this.invoiceInfo  = '';
  }

  generateInvoice(): void {
    if (!this.sale || this.isGenerating) return;

    this.isGenerating = true;
    this.invoiceError = '';
    this.invoiceInfo  = '';
    this.invoiceReady = false;

    this.invoiceService.generate(this.sale.id, this.selectedCountry).subscribe({
      next: (res) => {
        this.isGenerating = false;
        this.invoiceReady = true;
        this.invoiceInfo  = `Facture générée — ${res.country}`;
      },
      error: (err) => {
        this.isGenerating = false;
        this.invoiceError = err?.error?.error ?? 'Erreur lors de la génération du PDF.';
      }
    });
  }

  downloadInvoice(): void {
    if (!this.sale || !this.invoiceReady || this.isDownloading) return;

    this.isDownloading = true;

    this.invoiceService.download(this.sale.id, this.selectedCountry).subscribe({
      next: (blob: Blob) => {
        this.isDownloading = false;
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = `${this.sale!.id}-bill.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.isDownloading = false;
        this.invoiceError  = 'Error while downloading.';
      }
    });
  }
}
