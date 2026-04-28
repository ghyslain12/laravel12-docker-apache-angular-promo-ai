import { Routes } from '@angular/router';
import { PromotionComponent } from './components/promotion-list/promotion.component';
import { PromotionFormComponent } from './components/promotion-form/promotion-form.component';
import { PromotionShowComponent } from './components/promotion-show/promotion-show.component';
import { promotionResolver, promotionsResolver } from './resolvers/promotion.resolver';

export const promotionsRoutes: Routes = [
  { path: '',         component: PromotionComponent,     resolve: { promotions: promotionsResolver } },
  { path: 'add',      component: PromotionFormComponent },
  { path: 'edit/:id', component: PromotionFormComponent, resolve: { promotion: promotionResolver } },
  { path: 'show/:id', component: PromotionShowComponent, resolve: { promotion: promotionResolver } },
];
