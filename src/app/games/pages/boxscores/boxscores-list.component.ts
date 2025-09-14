import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BoxscoresService, BoxScore } from '../../services/boxscores.service';
import { GamesService, GameRow } from '../../services/games.service';
import { AuthService } from '../../../core/services/auth.service';

type Totals = {
  min: number; pts: number; reb: number; ast: number; stl: number; blk: number; tov: number;
  fgm: number; fga: number; fg3m: number; ftm: number; fta: number;
  efg: number | null; ts: number | null;
};

@Component({
  selector: 'app-boxscores-list',
  templateUrl: './boxscores-list.component.html',
  styleUrls: ['./boxscores-list.component.css'],
  standalone: false
})
export class BoxscoresListComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;

  game?: GameRow;
  rows: BoxScore[] = [];
  view: BoxScore[] = [];
  filter = '';

  private sub?: Subscription;
  private gameId!: number;

  // 'all' | 'home' | 'away'
  teamFilter: 'all' | 'home' | 'away' = 'all';

  // Jednostavna mapa naziva -> skraćenica (dopuni po potrebi)
  private teamAbbrMap: Record<string, string> = {
    'los angeles lakers': 'LAL',
    'boston celtics': 'BOS',
    'golden state warriors': 'GSW',
    'miami heat': 'MIA',
    'chicago bulls': 'CHI',
    'denver nuggets': 'DEN',
    'new york knicks': 'NYK',
    'milwaukee bucks': 'MIL',
    'dallas mavericks': 'DAL',
    'phoenix suns': 'PHX',
    // kratka imena
    'lakers': 'LAL',
    'celtics': 'BOS',
    'warriors': 'GSW',
    'heat': 'MIA',
    'bulls': 'CHI',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: BoxscoresService,
    private games: GamesService,
    public auth: AuthService
  ) {}

  get admin(): boolean {
    const a: any = this.auth as any;
    if (typeof a.isAdmin === 'function') return a.isAdmin();
    if (typeof a.isAdmin === 'boolean') return a.isAdmin;
    return (a.role ?? a.user?.role) === 'ADMIN';
  }

  ngOnInit(): void {
    this.gameId = Number(this.route.snapshot.paramMap.get('id'));
    this.sub = this.route.paramMap.subscribe(() => this.fetch());
    this.fetch();
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  fetch(): void {
    this.loading = true; this.error = null;

    this.games.get(this.gameId).subscribe({ next: g => (this.game = g) });

    this.api.listByGame(this.gameId).subscribe({
      next: list => { this.rows = list; this.applyFilter(); this.loading = false; },
      error: _ => { this.error = 'Greška pri učitavanju box score-ova.'; this.loading = false; }
    });
  }

  // === filtriranje ===
  applyFilter(): void {
    const q = this.filter.trim().toLowerCase();
    const homeName = (this.game?.homeTeamName || '').toLowerCase();
    const awayName = (this.game?.awayTeamName || '').toLowerCase();

    this.view = this.rows.filter(r => {
      // tekstualni filter (player/team/abbr)
      const abbr = this.teamAbbr(r).toLowerCase();
      const textPass = !q ||
        (r.playerName ?? '').toLowerCase().includes(q) ||
        (r.teamName ?? '').toLowerCase().includes(q) ||
        abbr.includes(q);

      if (!textPass) return false;

      // timski filter
      if (this.teamFilter === 'all') return true;
      const rn = (r.teamName || '').toLowerCase();
      if (this.teamFilter === 'home') return rn === homeName;
      if (this.teamFilter === 'away') return rn === awayName;
      return true;
    });
  }

  // === skraćenica tima ===
  teamAbbr(r: BoxScore): string {
    const name = (r.teamName ?? '').trim();
    if (name) {
      const k = name.toLowerCase();
      if (this.teamAbbrMap[k]) return this.teamAbbrMap[k];
      return this.makeAbbrFromName(name);
    }
    return '—';
  }
  abbrOf(name: string | undefined | null): string {
    const n = (name || '').trim();
    if (!n) return '—';
    const k = n.toLowerCase();
    return this.teamAbbrMap[k] ?? this.makeAbbrFromName(n);
  }
  private makeAbbrFromName(name: string): string {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return name.slice(0, 3).toUpperCase();
    const initials = parts.map(p => p[0]).join('');
    return initials.slice(0, 4).toUpperCase();
  }

  // === totals (zbir po koloni) ===
  get homeTotals(): Totals | null {
    if (!this.game) return null;
    const n = (this.game.homeTeamName || '').toLowerCase();
    return this.computeTotals(this.rows.filter(r => (r.teamName || '').toLowerCase() === n));
  }
  get awayTotals(): Totals | null {
    if (!this.game) return null;
    const n = (this.game.awayTeamName || '').toLowerCase();
    return this.computeTotals(this.rows.filter(r => (r.teamName || '').toLowerCase() === n));
  }

  pct(v: number | null | undefined): string {
    if (v == null || Number.isNaN(v)) return '—';
    return (v * 100).toFixed(1) + '%';
  }

  private computeTotals(rows: BoxScore[]): Totals {
    const t: Totals = {
      min: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0,
      fgm: 0, fga: 0, fg3m: 0, ftm: 0, fta: 0,
      efg: null, ts: null
    };
    for (const r of rows) {
      t.min += r.min ?? 0;
      t.pts += r.pts ?? 0;
      t.reb += r.reb ?? 0;
      t.ast += r.ast ?? 0;
      t.stl += r.stl ?? 0;
      t.blk += r.blk ?? 0;
      t.tov += r.tov ?? 0;
      t.fgm += (r as any).fgm ?? 0;
      t.fga += (r as any).fga ?? 0;
      t.fg3m += (r as any).fg3m ?? 0;
      t.ftm += (r as any).ftm ?? 0;
      t.fta += (r as any).fta ?? 0;
    }
    // eFG = (FGM + 0.5*3PM) / FGA
    if (t.fga > 0) t.efg = (t.fgm + 0.5 * t.fg3m) / t.fga;
    // TS = PTS / (2 * (FGA + 0.44*FTA))
    const denom = 2 * (t.fga + 0.44 * t.fta);
    if (denom > 0) t.ts = t.pts / denom;

    return t;
    // Napomena: Ako backend ne vraća fgm/fga/fg3m/fta, eFG/TS će ostati '—', ali sume (PTS/REB/...) i dalje rade.
  }

  // === akcije ===
  newBox(): void { this.router.navigate(['/games', this.gameId, 'boxscores', 'new']); }
  edit(r: BoxScore): void { this.router.navigate(['/games', this.gameId, 'boxscores', r.id, 'edit']); }

  remove(r: BoxScore): void {
    if (!confirm(`Obriši box score za ${r.playerName}?`)) return;
    this.api.delete(r.id).subscribe({
      next: () => this.fetch(),
      error: _ => this.error = 'Brisanje nije uspelo.'
    });
  }

  // === CSV export trenutnog prikaza ===
  exportCsv(): void {
    const cols = ['Player','Team','MIN','PTS','REB','AST','STL','BLK','TOV','eFG%','TS%'];
    const lines = [cols.join(',')];

    for (const r of this.view) {
      const row = [
        (r.playerName ?? '').replace(/,/g, ' '),
        (this.teamAbbr(r)),
        r.min ?? 0,
        r.pts ?? 0,
        r.reb ?? 0,
        r.ast ?? 0,
        r.stl ?? 0,
        r.blk ?? 0,
        r.tov ?? 0,
        r.efg != null ? (r.efg * 100).toFixed(1) + '%' : '',
        r.ts  != null ? (r.ts  * 100).toFixed(1) + '%' : ''
      ];
      lines.push(row.join(','));
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boxscores_game_${this.gameId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
