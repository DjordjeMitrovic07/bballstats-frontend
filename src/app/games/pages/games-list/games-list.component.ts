import { Component, OnDestroy, OnInit } from '@angular/core';
import { GamesService, GameRow } from '../../services/games.service';
import { SeasonService } from '../../../core/services/season.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-games-list',
  standalone: false,
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.css']
})
export class GamesListComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;

  data: GameRow[] = [];
  view: GameRow[] = [];
  filter = '';

  seasons: string[] = [];
  private sub?: Subscription;

  constructor(
    private games: GamesService,
    public  season: SeasonService,   // public da se koristi u templejtu
    public  auth: AuthService,
    private router: Router
  ) {
    this.seasons = this.season.allSeasons();
  }

  get admin(): boolean {
    const a: any = this.auth as any;
    if (typeof a.isAdmin === 'function') return a.isAdmin();
    if (typeof a.isAdmin === 'boolean') return a.isAdmin;
    return (a.role ?? a.user?.role) === 'ADMIN';
  }

  ngOnInit(): void {
    // Ako BE ignoriše ?season, i dalje ćemo preseći na klijentu u applyFilter()
    this.sub = this.season.season$.subscribe(() => this.fetch());
    this.fetch();
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  onSeasonChange(value: string): void {
    this.season.set(value);
    // nije obavezno jer fetch() ide preko subscribe-a, ali lepo je instant osveženje:
    this.applyFilter();
  }

  fetch(): void {
    this.loading = true; this.error = null;
    const currentSeason = this.season.selected();

    this.games.list({ season: currentSeason }).subscribe({
      next: rows => {
        // Popuni/normalizuj sezonu ako je prazna
        const withSeason = (rows ?? []).map(r => {
          const s = (r as any).season && (r as any).season.trim()
            ? (r as any).season
            : this.deriveSeason((r as any).dateTime);
          return { ...r, season: s } as GameRow;
        });

        // Novije gore
        this.data = withSeason.sort(
          (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
        );

        this.applyFilter();
        this.loading = false;
      },
      error: _ => { this.error = 'Greška pri učitavanju utakmica.'; this.loading = false; }
    });
  }

  applyFilter(): void {
    const q = this.filter.trim().toLowerCase();
    const selectedSeason = this.season.selected();
    const allowed = new Set(this.season.allSeasons()); // <-- samo ove prikazujemo

    this.view = this.data.filter(g => {
      const vs = `${g.homeTeamName ?? ''} vs ${g.awayTeamName ?? ''}`.toLowerCase();
      const seasonTxt = (g.season ?? '').toLowerCase();
      const matchQ = !q || vs.includes(q) || seasonTxt.includes(q);
      const matchSeason = !selectedSeason || g.season === selectedSeason;
      const allowedSeason = allowed.has(g.season ?? '');

      return matchQ && matchSeason && allowedSeason;  // <-- preseci i po dozvoljenim sezonama
    });
  }


  goNew(): void { this.router.navigate(['/games/new']); }
  open(g: GameRow): void { this.router.navigate(['/games', g.id]); }

  // NBA stil: sezona počinje u avgustu (08) i preliva se u sledeću godinu
  private deriveSeason(dt: string): string {
    const d = new Date(dt);
    const y = d.getFullYear();
    const m = d.getMonth() + 1; // 1..12
    const start = (m >= 8) ? y : (y - 1);
    const endShort = String((start + 1) % 100).padStart(2, '0');
    return `${start}/${endShort}`;
  }
}
