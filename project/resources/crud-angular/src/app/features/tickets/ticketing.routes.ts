import { Routes } from '@angular/router';
import { TicketComponent } from './components/ticket-list/ticket.component';
import { TicketFormComponent } from './components/ticket-form/ticket-form.component';
import { TicketShowComponent } from './components/ticket-show/ticket-show.component';
import {ticketResolver, ticketsResolver} from './resolvers/ticket.resolver';
import {salesResolver} from '../sales/resolvers/sale.resolver';



export const ticketingRoutes: Routes = [
  { path: '', component: TicketComponent, resolve: {tickets: ticketsResolver} },
  { path: 'add', component: TicketFormComponent, resolve: {sales: salesResolver} },
  { path: 'edit/:id', component: TicketFormComponent, resolve: {ticket: ticketResolver, sales: salesResolver} },
  { path: 'show/:id', component: TicketShowComponent, resolve: {ticket: ticketResolver} }

];

