import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Promotion } from '../../models/promotion.model';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-promotion-show',
  imports: [MatCardModule, MatButtonModule, MatChipsModule, SlicePipe],
  templateUrl: './promotion-show.component.html',
  styleUrl: './promotion-show.component.css'
})
export class PromotionShowComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  promotion: Promotion | undefined;

  ngOnInit() {
    this.route.data.subscribe((response: any) => {
      this.promotion = response.promotion;
    });
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      active: 'primary', disabled: 'warn', expired: 'accent', scheduled: ''
    };
    return map[status] ?? '';
  }

  get targetLabel(): string {
    if (!this.promotion) return '';
    if (this.promotion.target_type === 'material') return this.promotion.material?.designation ?? `#${this.promotion.target_id}`;
    if (this.promotion.target_type === 'coupon')   return this.promotion.code ?? '-';
    return 'Tous les matériaux';
  }

  goBack() {
    this.router.navigate(['/promotion']).then();
  }
}
