import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TicketFormComponent } from './ticket-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TicketService } from '../../services/ticket.service';
import { SaleService } from '../../../sales/services/sale.service';
import { Ticket } from '../../models/ticket.model';

describe('TicketFormComponent', () => {
  let component: TicketFormComponent;
  let fixture: ComponentFixture<TicketFormComponent>;
  let ticketService: jasmine.SpyObj<TicketService>;
  let saleService: jasmine.SpyObj<SaleService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockTicket: Ticket = {
    id: 1,
    titre: 'ticket1',
    description: 'ticketdesc1',
    sale_id: 1,
    sale: { id: 1, titre: 'sale1', description: 'desc1', idClient: 1, materials: [], customer: {} as any }
  };

  beforeEach(async () => {
    const ticketSpy = jasmine.createSpyObj('TicketService', ['create', 'update']);
    const saleSpy = jasmine.createSpyObj('SaleService', ['getAll']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCardModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        TicketFormComponent
      ],
      providers: [
        { provide: TicketService, useValue: ticketSpy },
        { provide: SaleService, useValue: saleSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: undefined } },
            data: of({ ticket: undefined })
          }
        }
      ]
    }).compileComponents();

    ticketService = TestBed.inject(TicketService) as jasmine.SpyObj<TicketService>;
    saleService = TestBed.inject(SaleService) as jasmine.SpyObj<SaleService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    saleService.getAll.and.returnValue(of([]));
    router.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.ticketForm.valid).toBeFalsy();
  });

  it('should submit form and navigate in create mode', fakeAsync(() => {
    ticketService.create.and.returnValue(of(mockTicket));
    component.ticketForm.setValue({ titre: 'ticket1', description: 'ticketdesc1', sale_id: 1 });

    component.onSubmit();
    tick();

    expect(ticketService.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ titre: 'ticket1', description: 'ticketdesc1', sale_id: 1 })
    );
    expect(router.navigate).toHaveBeenCalledWith(['/ticket']);
    expect(snackBar.open).toHaveBeenCalledWith('Ticket créé', 'OK', jasmine.any(Object));
  }));

  it('should submit form and navigate in edit mode', fakeAsync(() => {
    component.isEditMode = true;
    component.ticketId = 1;
    ticketService.update.and.returnValue(of(mockTicket));

    component.ticketForm.setValue({ titre: 'updated ticket', description: 'updated desc', sale_id: 1 });
    component.onSubmit();
    tick();

    expect(ticketService.update).toHaveBeenCalledWith(
      1,
      jasmine.objectContaining({ titre: 'updated ticket' })
    );
    expect(router.navigate).toHaveBeenCalledWith(['/ticket']);
    expect(snackBar.open).toHaveBeenCalledWith('Ticket modifié', 'OK', jasmine.any(Object));
  }));

  it('should show snackbar on API error', fakeAsync(() => {
    ticketService.create.and.returnValue(throwError(() => ({ message: 'Error API' })));
    component.ticketForm.setValue({ titre: 'ticket1', description: 'desc', sale_id: 1 });

    component.onSubmit();
    tick();

    expect(snackBar.open).toHaveBeenCalledWith('Error API', 'Fermer', jasmine.any(Object));
  }));

  it('should validate no-whitespace in titre', () => {
    const titre = component.ticketForm.get('titre');
    titre?.setValue('   ');
    expect(titre?.hasError('whitespace')).toBeTrue();
  });

  it('should mark form as touched if invalid on submit', () => {
    component.ticketForm.setValue({ titre: '', description: '', sale_id: '' });
    component.onSubmit();
    expect(component.ticketForm.touched).toBeTrue();
    expect(ticketService.create).not.toHaveBeenCalled();
  });

  it('should navigate back to ticket list on goBack', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/ticket']);
  });
});
