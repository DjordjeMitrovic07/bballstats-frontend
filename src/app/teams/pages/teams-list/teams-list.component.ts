import { Component, OnDestroy, OnInit } from '@angular/core';
import { TeamsService } from '../../services/teams.service';
import { Team } from '../../../core/models/team.model';
import { SeasonService } from '../../../core/services/season.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-teams-list',
  standalone:false,
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.css']
})
export class TeamsListComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;
  filter = '';
  data: Team[] = [];
  view: Team[] = [];
  private sub?: Subscription;

  constructor(private teams: TeamsService, private season: SeasonService, public auth: AuthService) {}

  ngOnInit(): void {
    this.sub = this.season.season$.subscribe(() => this.fetch());
    this.fetch();
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  fetch() {
    this.loading = true;
    this.error = null;

    this.teams.list()
      .pipe(finalize(() => { this.loading = false; }))   // 👈 uvek ugasi "Učitavanje..."
      .subscribe({
        next: (rows) => {
          console.log('GET /api/teams OK:', rows);       // 👈 privremeni log
          this.data = rows ?? [];
          this.applyFilter();
        },
        error: (err) => {
          console.error('GET /api/teams ERROR:', err);   // 👈 privremeni log
          this.error = err?.error?.message || 'Greška pri učitavanju timova.';
        }
      });
  }


  applyFilter() {
    const q = this.filter.trim().toLowerCase();
    this.view = !q
      ? this.data.slice()
      : this.data.filter(t =>
        (t.name ?? '').toLowerCase().includes(q) ||
        (t.city ?? '').toLowerCase().includes(q)
      );
  }
}
