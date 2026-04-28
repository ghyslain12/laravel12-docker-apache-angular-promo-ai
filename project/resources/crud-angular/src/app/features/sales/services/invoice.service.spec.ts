import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InvoiceService, InvoiceGenerateResponse } from './invoice.service';
import { environment } from '../../../../environments/environment';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let http: HttpTestingController;
  const base = `${environment.baseUri}/api/sale`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(InvoiceService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should call POST to generate invoice', () => {
    const mock: InvoiceGenerateResponse = {
      success: true, download_url: '/api/sale/1/invoice/fr/download',
      filename: '1-bill.pdf', country: 'France', vat_rate: 20, vat_label: 'TVA'
    };

    service.generate(1, 'fr').subscribe(res => {
      expect(res.success).toBeTrue();
      expect(res.country).toBe('France');
      expect(res.vat_rate).toBe(20);
    });

    const req = http.expectOne(`${base}/1/invoice/fr`);
    expect(req.request.method).toBe('POST');
    req.flush(mock);
  });

  it('should call GET to download PDF blob', () => {
    const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });

    service.download(1, 'fr').subscribe(res => {
      expect(res).toBeTruthy();
      expect(res.type).toBe('application/pdf');
    });

    const req = http.expectOne(`${base}/1/invoice/fr/download`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(blob, { headers: { 'Content-Type': 'application/pdf' } });
  });

  it('should build correct URL for each country', () => {
    const countries = ['fr', 'be', 'es', 'nl', 'al', 'uk', 'us'];
    countries.forEach(c => {
      service.generate(5, c).subscribe();
      const req = http.expectOne(`${base}/5/invoice/${c}`);
      expect(req.request.url).toContain(c);
      req.flush({ success: true, download_url: '', filename: '', country: c, vat_rate: 20, vat_label: 'TVA' });
    });
  });
});
