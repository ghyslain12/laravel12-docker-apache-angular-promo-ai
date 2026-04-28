import { Routes } from '@angular/router';
import { SaleComponent } from './components/sale-list/sale.component';
import { SaleFormComponent } from './components/sale-form/sale-form.component';
import { SaleShowComponent } from './components/sale-show/sale-show.component';
import {saleResolver, salesResolver} from './resolvers/sale.resolver';
import {materialsResolver} from '../materials/resolvers/material.resolver';
import { clientsResolver} from '../clients/resolvers/client.resolver';



export const provisioningRoutes: Routes = [
    { path: '', component: SaleComponent, resolve: {sales: salesResolver} },
    { path: 'add', component: SaleFormComponent, resolve: {materials: materialsResolver, clients: clientsResolver} },
    { path: 'edit/:id', component: SaleFormComponent, resolve: {sale: saleResolver, materials: materialsResolver, clients: clientsResolver} },
    { path: 'show/:id', component: SaleShowComponent, resolve: {sale: saleResolver} }
];

