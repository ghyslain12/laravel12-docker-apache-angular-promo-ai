import { Routes } from '@angular/router';
import { MaterialFormComponent } from './components/material-form/material-form.component';
import { MaterialComponent } from './components/material-list/material.component';
import { MaterialShowComponent } from './components/material-show/material-show.component';
import {
  materialPingResolver,
  materialResolver,
  materialsResolver
} from './resolvers/material.resolver';



export const materialsRoutes: Routes = [
    { path: '', component: MaterialComponent, resolve: {materials: materialsResolver} },
    { path: 'add', component: MaterialFormComponent, resolve: {ping: materialPingResolver} },
    { path: 'edit/:id', component: MaterialFormComponent, resolve: {material: materialResolver} },
    { path: 'show/:id', component: MaterialShowComponent, resolve: {material: materialResolver} }
];

