import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import {
  LeaderRow,
  TeamLeaderRow,
  MetricKey,
  LeadersQuery,
  TeamLeadersQuery,
  MetricsApiService
} from '../../services/metrics-api.service';

@Component({
  selector: 'app-leaderboard',
  standalone: false,
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit, OnChanges {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) metric!: MetricKey;
  @Input({ required: true }) season!: string;
  @Input() top = 5;
  @Input() minGames: number | null = 0;
  @Input() minMpg: number | null = 0;
  @Input() mode: 'player' | 'team' = 'player';

  rows: (LeaderRow | TeamLeaderRow)[] = [];
  loading = false;
  error: string | null = null;

  constructor(private api: MetricsApiService) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['metric'] ||
      changes['season'] ||
      changes['top'] ||
      changes['minGames'] ||
      changes['minMpg'] ||
      changes['mode']
    ) {
      this.load();
    }
  }

  private isPercentMetric(): boolean {
    return this.metric === 'efg' || this.metric === 'ts' || this.metric === 'tp3p';
  }

  load(): void {
    this.loading = true;
    this.error = null;

    const done = () => (this.loading = false);

    if (this.mode === 'team') {
      const q: TeamLeadersQuery = {
        season: this.season,
        metric: this.metric,
        n: this.top,
        minGames: this.minGames ?? undefined
      };
      this.api.getTeamLeaders(q).subscribe({
        next: data => { this.rows = data; done(); },
        error: err => { console.error('Team leaders failed', err); this.error = 'Failed to load leaders.'; done(); }
      });
    } else {
      const q: LeadersQuery = {
        season: this.season,
        metric: this.metric,
        n: this.top,
        minGames: this.minGames ?? undefined,
        minMpg: this.minMpg ?? undefined
      };
      this.api.getLeaders(q).subscribe({
        next: data => { this.rows = data; done(); },
        error: err => { console.error('Leaders failed', err); this.error = 'Failed to load leaders.'; done(); }
      });
    }
  }

  /** ID za sliku i router — zavisi od moda */
  rowId(row: LeaderRow | TeamLeaderRow): number {
    return this.mode === 'team'
      ? (row as TeamLeaderRow).teamId
      : (row as LeaderRow).playerId;
  }

  imgSrc(id: number): string {
    return this.mode === 'team'
      ? `/assets/teams/${id}.png`
      : `/assets/players/${id}.png`;
  }

  imgError(ev: Event): void {
    (ev.target as HTMLImageElement).src = this.mode === 'team'
      ? '/assets/teams/placeholder.png'
      : '/assets/players/placeholder.png';
  }

  displaySub(row: LeaderRow | TeamLeaderRow): string {
    // player: teamAbbr; team: abbr
    return this.mode === 'team'
      ? (row as TeamLeaderRow).abbr
      : (row as LeaderRow).teamAbbr;
  }

  /** Pametno formatiranje procenta (eFG/TS/3PT%) i običnih brojki. */
  formatValue(v: number): string {
    if (v == null || Number.isNaN(v) || !Number.isFinite(v)) return '—';

    if (!this.isPercentMetric()) {
      return v.toFixed(1);
    }

    // Percent metrics:
    // - Ako je 0–1.25 -> tretiraj kao frakciju (x100)
    // - Ako je 1.25–100 -> tretiraj kao već procenat
    // - Ako je >100 (npr. 900) -> cap na 100 da izbegnemo “900%”
    let val = v;
    if (val >= 0 && val <= 1.25) {
      val = val * 100;
    }
    if (val > 100) {
      val = 100;
    }
    if (val < 0) {
      return '—';
    }
    return val.toFixed(1) + '%';
  }

  trackByIdx(_i: number, _r: LeaderRow | TeamLeaderRow) { return _i; }
}
