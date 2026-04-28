import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketShowComponent } from './ticket-show.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import {Ticket} from '../../models/ticket.model';
import {User} from '../../../users/models/user.model';
import {Client} from '../../../clients/models/client.model';
import {Material} from '../../../materials/models/material.model';
import {Sale} from '../../../sales/models/sale.model';

describe('TicketShowComponent', () => {
  let component: TicketShowComponent;
  let fixture: ComponentFixture<TicketShowComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = { id: 1, name: 'user1', email: 'test@gmail.com' };
  const mockClient: Client = { id: 1, surnom: 'client1',  idUser: 1, userName: 'user1', user: mockUser };
  const mockMaterial: Material = { id: 1, designation: 'modem', price: 0, checked: false };
  const mockSale: Sale = { id: 1, titre: 'sale1', description: 'desc1', idClient: 1, materials: [mockMaterial], customer: mockClient };
  const mockTicket: Ticket = { id: 1, titre: 'ticket1', description: 'ticketdesc1', sale_id: 1, sale: mockSale };

  beforeEach(async () => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        TicketShowComponent,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ ticket: mockTicket })
          }
        },
        { provide: Router, useValue: routerSpyObj }
      ]
    }).compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize ticket from resolver', () => {
    expect(component.ticket).toEqual(mockTicket);
  });

  it('should display ticket designation in template', () => {
    const designationElement = fixture.nativeElement.querySelector('p');
    expect(designationElement.textContent).toContain('Titre  ticket1');
  });

  it('should navigate back to ticket list', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/ticket']);
  });
});
