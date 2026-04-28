import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface InvoiceGenerateResponse {
  success: boolean;
  download_url: string;
  filename: string;
  country: string;
  vat_rate: number;
  vat_label: string;
}

/*export const INVOICE_COUNTRIES = [
  { code: 'fr', name: 'France',       flag: '🇫🇷' },
  { code: 'be', name: 'Belgique',     flag: '🇧🇪' },
  { code: 'es', name: 'Espagne',      flag: '🇪🇸' },
  { code: 'nl', name: 'Pays-Bas',     flag: '🇳🇱' },
  { code: 'al', name: 'Allemagne',    flag: '🇩🇪' },
  { code: 'uk', name: 'Royaume-Uni',  flag: '🇬🇧' },
  { code: 'us', name: 'États-Unis',   flag: '🇺🇸' },
];*/

export const INVOICE_COUNTRIES = [
  { code: 'fr', name: 'France' },
  { code: 'be', name: 'Belgique' },
  { code: 'es', name: 'Espagne' },
  { code: 'nl', name: 'Pays-Bas' },
  { code: 'de', name: 'Allemagne' },
  { code: 'gb', name: 'Royaume-Uni' },
  { code: 'us', name: 'États-Unis' },
];

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private http = inject(HttpClient);
  private base = `${environment.baseUri}/api/sale`;

  generate(saleId: number, country: string): Observable<InvoiceGenerateResponse> {
    return this.http.post<InvoiceGenerateResponse>(
      `${this.base}/${saleId}/invoice/${country}`,
      {}
    );
  }

  download(saleId: number, country: string): Observable<Blob> {
    return this.http.get(
      `${this.base}/${saleId}/invoice/${country}/download`,
      { responseType: 'blob' }
    );
  }
}
