import { Routes } from '@angular/router';
import { UserComponent } from './components/user-list/user.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserShowComponent } from './components/user-show/user-show.component';
import {userPingResolver, userResolver, usersResolver} from './resolvers/user.resolver';


export const usersRoutes: Routes = [
    { path: '', component: UserComponent, resolve: {users: usersResolver} },
    { path: 'add', component: UserFormComponent, resolve: {ping: userPingResolver} },
    { path: 'edit/:id', component: UserFormComponent, resolve: {user: userResolver} },
    { path: 'show/:id', component: UserShowComponent, resolve: {user: userResolver} }
];

