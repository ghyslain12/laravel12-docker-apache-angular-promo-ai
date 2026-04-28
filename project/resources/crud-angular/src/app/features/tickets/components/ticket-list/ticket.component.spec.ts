import { TicketComponent } from './ticket.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ticket } from '../../models/ticket.model';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TicketService } from '../../services/ticket.service';

import { User } from '../../../users/models/user.model';
import { Client } from '../../../clients/models/client.model';
import { Material } from '../../../materials/models/material.model';
import { Sale } from '../../../sales/models/sale.model';

describe('TicketComponent', () => {
  let component: TicketComponent;
  let fixture: ComponentFixture<TicketComponent>;

  const mockUser: User = { id: 1, name: 'user1', email: 'test@gmail.com' };
  const mockClient: Client = { id: 1, surnom: 'client1', idUser: 1, userName: 'user1', user: mockUser };
  const mockMaterial: Material = { id: 1, designation: 'modem', price: 0, checked: false };
  const mockSale: Sale = { id: 1, titre: 'sale1', description: 'desc1', idClient: 1, materials: [mockMaterial], customer: mockClient };

  const mockTickets: Ticket[] = [
    { id: 1, titre: 'ticket1', description: 'ticketdesc1', sale_id: 1, sale: mockSale },
    { id: 2, titre: 'ticket2', description: 'ticketdesc2', sale_id: 1, sale: mockSale }
  ];

  const ticketServiceMock = {
    delete: jasmine.createSpy('delete').and.returnValue(of({}))
  };

  const dialogMock = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => of(true)
    })
  };

  const snackBarMock = {
    open: jasmine.createSpy('open')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TicketComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TicketService, useValue: ticketServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        {
          provide: ActivatedRoute,
          useValue: { data: of({ tickets: mockTickets }) }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dataSource with tickets from resolver', () => {
    expect(component.dataSource.data.length).toBe(2);
    expect(component.dataSource.data).toEqual(mockTickets);
  });

  it('should display ticket in table', async () => {
    component.dataSource.data = mockTickets;
    fixture.detectChanges();
    await fixture.whenStable();

    const tableRows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(tableRows.length).toBe(2);

    const firstRowText = tableRows[0].textContent;
    expect(firstRowText).toContain('ticket1');
    expect(firstRowText).toContain('ticketdesc1');
  });

  it('should filter tickets when applyFilter is called', () => {
    const event = { target: { value: 'ticket2' } } as unknown as Event;
    component.applyFilter(event);

    expect(component.dataSource.filter).toBe('ticket2');
    expect(component.dataSource.filteredData.length).toBe(1);
    expect(component.dataSource.filteredData[0].id).toBe(2);
  });
});
