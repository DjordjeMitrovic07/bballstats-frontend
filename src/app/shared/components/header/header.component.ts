import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  logout(): void { this.auth.logout(); }
  goHome(): void { this.router.navigate(['/']); }
}
