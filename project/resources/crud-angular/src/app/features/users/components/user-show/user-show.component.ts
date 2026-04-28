import { Component, OnInit, inject } from '@angular/core';
import { User } from '../../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-show',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './user-show.component.html',
  styleUrl: './user-show.component.css'
})
export class UserShowComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  user: User | undefined;

  ngOnInit() {
    this.route.data.subscribe((response: any) => {
      this.user = response.user;
    });
  }

  goBack() {
    this.router.navigate(['/user']).then();
  }
}
