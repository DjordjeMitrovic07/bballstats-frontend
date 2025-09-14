// src/app/games/pages/game-detail/game-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GamesService, GameRow } from '../../services/games.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-game-detail',
  standalone: false,
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.css']
})
export class GameDetailComponent implements OnInit {
  loading = true;
  error: string | null = null;
  game?: GameRow;

  // Prikaz sezone (ako BE ne šalje, deriviramo iz datuma)
  seasonText: string = '—';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private games: GamesService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.games.get(id).subscribe({
      next: g => {
        this.game = g;
        this.seasonText = (g as any)?.season || this.computeSeason(g?.dateTime);
        this.loading = false;
      },
      error: _ => { this.error = 'Greška pri učitavanju utakmice.'; this.loading = false; }
    });
  }

  private computeSeason(dt?: string | Date | null): string {
    if (!dt) return '—';
    const d = new Date(dt);
    const y = d.getFullYear();
    const m = d.getMonth() + 1; // 1..12
    // NBA stil: sezona počinje na jesen (oktobar)
    const start = (m >= 10) ? y : (y - 1);
    const end2 = ((start + 1) % 100).toString().padStart(2, '0');
    return `${start}/${end2}`;
  }

  // Sigurno dohvatamo ID-eve timova bez obzira da li je model {homeTeam:{id}} ili samo {homeTeamId}
  get homeTeamId(): number | null {
    const g: any = this.game;
    return g?.homeTeam?.id ?? g?.homeTeamId ?? null;
  }
  get awayTeamId(): number | null {
    const g: any = this.game;
    return g?.awayTeam?.id ?? g?.awayTeamId ?? null;
  }

  // Admin helper (za labelu na dugmetu)
  get admin(): boolean {
    const a: any = this.auth as any;
    if (typeof a.isAdmin === 'function') return a.isAdmin();
    if (typeof a.isAdmin === 'boolean') return a.isAdmin;
    return (a.role ?? a.user?.role) === 'ADMIN';
  }

  toBoxScores() {
    if (!this.game) return;
    this.router.navigate(['/games', this.game.id, 'boxscores']);
  }
}
