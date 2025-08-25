import { Component } from '@angular/core';
import { SeasonService } from '../../../core/services/season.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  seasons: string[] = [];

  constructor(
    public season: SeasonService,
    public auth: AuthService,
    private router: Router
  ) {
    this.seasons = this.season.allSeasons();
  }

  onSeasonChange(value: string): void {
    this.season.set(value);   // <-- ranije je bilo setSeason
  }

  logout(): void {
    this.auth.logout();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
