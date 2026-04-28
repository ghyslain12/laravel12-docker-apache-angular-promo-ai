import { Routes } from '@angular/router';
import { ClientFormComponent } from './components/client-form/client-form.component';
import { ClientComponent } from './components/client-list/client.component';
import { ClientShowComponent } from './components/client-show/client-show.component';
import {clientResolver, clientsResolver} from './resolvers/client.resolver';
import {usersResolver} from '../users/resolvers/user.resolver';


export const clientsRoutes: Routes = [
    { path: '', component: ClientComponent, resolve: {clients: clientsResolver, users: usersResolver} },
    { path: 'add', component: ClientFormComponent, resolve: {users: usersResolver} },
    { path: 'edit/:id', component: ClientFormComponent, resolve: {client: clientResolver, users: usersResolver} },
    { path: 'show/:id', component: ClientShowComponent, resolve: {client: clientResolver} }
];

