import { Component, OnInit, inject } from '@angular/core';
import { Ticket } from '../../models/ticket.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-ticket-show',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './ticket-show.component.html',
  styleUrl: './ticket-show.component.css'
})
export class TicketShowComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ticket: Ticket | undefined;

  ngOnInit() {
    this.route.data.subscribe((response: any) => {
      this.ticket = response.ticket;
    });
  }

  goBack() {
    this.router.navigate(['/ticket']).then();
  }
}
