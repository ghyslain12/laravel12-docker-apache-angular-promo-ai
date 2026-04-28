import { Component, OnInit, inject } from '@angular/core';
import { Client } from '../../models/client.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-client-show',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './client-show.component.html',
  styleUrl: './client-show.component.css'
})
export class ClientShowComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  client: Client | undefined;

  ngOnInit() {
    this.route.data.subscribe((response: any) => {
      this.client = response.client;
    });
  }

  goBack() {
    this.router.navigate(['/client']).then();
  }
}
