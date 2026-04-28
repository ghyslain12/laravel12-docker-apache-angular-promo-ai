import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SaleShowComponent } from './sale-show.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Sale } from '../../models/sale.model';
import { Material } from '../../../materials/models/material.model';
import { Client } from '../../../clients/models/client.model';
import { User } from '../../../users/models/user.model';
import { InvoiceService, InvoiceGenerateResponse } from '../../services/invoice.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SaleShowComponent', () => {
  let component: SaleShowComponent;
  let fixture: ComponentFixture<SaleShowComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let invoiceSpy: jasmine.SpyObj<InvoiceService>;

  const mockUser: User = { id: 1, name: 'user1', email: 'test@gmail.com' };
  const mockClient: Client = { id: 1, surnom: 'client1', idUser: 1, userName: 'user1', user: mockUser };
  const mockMaterial: Material = { id: 1, designation: 'modem', price: 100, checked: false };
  const mockSale: Sale = {
    id: 1, titre: 'sale1', description: 'desc1', idClient: 1,
    materials: [mockMaterial], customer: mockClient
  };

  const mockInvoiceResponse: InvoiceGenerateResponse = {
    success: true,
    download_url: '/api/sale/1/invoice/fr/download',
    filename: '1-bill.pdf',
    country: 'France',
    vat_rate: 20,
    vat_label: 'TVA'
  };

  beforeEach(async () => {
    const routerSpyObj  = jasmine.createSpyObj('Router', ['navigate']);
    const invoiceSpyObj = jasmine.createSpyObj('InvoiceService', ['generate', 'download']);

    await TestBed.configureTestingModule({
      imports: [SaleShowComponent, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({ sale: mockSale }) } },
        { provide: Router,         useValue: routerSpyObj },
        { provide: InvoiceService, useValue: invoiceSpyObj },
      ]
    }).compileComponents();

    routerSpy  = TestBed.inject(Router)  as jasmine.SpyObj<Router>;
    invoiceSpy = TestBed.inject(InvoiceService) as jasmine.SpyObj<InvoiceService>;

    routerSpy.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture   = TestBed.createComponent(SaleShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize sale from resolver', () => {
    expect(component.sale).toEqual(mockSale);
  });

  it('should navigate back to sale list', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/sale']);
  });

  it('should compute total price from materials', () => {
    expect(component.totalPrice).toBe(100);
  });

  it('should initialize with fr as default country', () => {
    expect(component.selectedCountry).toBe('fr');
  });

  it('should have 7 countries available', () => {
    expect(component.countries.length).toBe(7);
  });

  it('should reset invoice state on country change', () => {
    component.invoiceReady = true;
    component.invoiceError = 'some error';
    component.invoiceInfo  = 'some info';

    component.onCountryChange();

    expect(component.invoiceReady).toBeFalse();
    expect(component.invoiceError).toBe('');
    expect(component.invoiceInfo).toBe('');
  });

  it('should not generate if isGenerating is already true', () => {
    component.isGenerating = true;
    component.generateInvoice();
    expect(invoiceSpy.generate).not.toHaveBeenCalled();
  });

  it('should call generate and set invoiceReady on success', () => {
    invoiceSpy.generate.and.returnValue(of(mockInvoiceResponse));

    component.generateInvoice();

    expect(invoiceSpy.generate).toHaveBeenCalledWith(1, 'fr');
    expect(component.invoiceReady).toBeTrue();
    expect(component.isGenerating).toBeFalse();
    expect(component.invoiceInfo).toContain('France');
  });

  it('should set invoiceError on generate failure', () => {
    invoiceSpy.generate.and.returnValue(throwError(() => ({
      error: { error: 'PDF generation failed' }
    })));

    component.generateInvoice();

    expect(component.invoiceReady).toBeFalse();
    expect(component.invoiceError).toBe('PDF generation failed');
    expect(component.isGenerating).toBeFalse();
  });

  it('should not download if invoiceReady is false', () => {
    component.invoiceReady = false;
    component.downloadInvoice();
    expect(invoiceSpy.download).not.toHaveBeenCalled();
  });

  it('should call download and trigger file save on success', () => {
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    invoiceSpy.download.and.returnValue(of(blob));
    component.invoiceReady = true;

    spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
    spyOn(URL, 'revokeObjectURL');

    component.downloadInvoice();

    expect(invoiceSpy.download).toHaveBeenCalledWith(1, 'fr');
    expect(component.isDownloading).toBeFalse();
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });

  it('should set error message on download failure', () => {
    invoiceSpy.download.and.returnValue(throwError(() => new Error('Network error')));
    component.invoiceReady = true;

    component.downloadInvoice();

    expect(component.invoiceError).toBe('Error while downloading.');
    expect(component.isDownloading).toBeFalse();
  });
});
