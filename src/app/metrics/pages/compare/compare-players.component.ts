import { Component, OnInit } from '@angular/core';
import { MetricsApiService } from '../../services/metrics-api.service';
import { PlayersService } from '../../../players/services/players.service';

type PlayerOption = {
  id: number;
  firstName: string;
  lastName: string;
  teamId?: number;
  teamName?: string;
};

type PlayerCompareRow = {
  playerId: number;
  playerName: string;
  /** fallback ako backend pošalje `name` umesto `playerName` */
  name?: string;
  teamId?: number;
  teamName?: string;
  teamAbbr?: string;

  ts: number;         // 0..1
  efg: number;        // 0..1
  usg: number;        // 0..1 ili 0..100 (mi ga prikazujemo kao %)
  ptsPerGame: number;
  minPerGame: number;
};

@Component({
  selector: 'app-compare-players',
  templateUrl: './compare-players.component.html',
  styleUrls: ['./compare-players.component.css'],
  standalone: false
})
export class ComparePlayersComponent implements OnInit {
  // Ako želiš dinamički: zameni ovde pozivom ka servisu kasnije.
  seasons: string[] = ['2024/25', '2023/24', '2022/23'];
  season = this.seasons[0];

  players: PlayerOption[] = [];
  loadingPlayers = false;
  error: string | null = null;

  p1Id: number | null = null;
  p2Id: number | null = null;

  rows: PlayerCompareRow[] = []; // [0] left, [1] right
  loading = false;

  constructor(
    private api: MetricsApiService,
    private playersSvc: PlayersService,
  ) {}

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.loadingPlayers = true;
    this.error = null;

    this.playersSvc.list().subscribe({
      next: (page: any) => {
        const content: any[] = Array.isArray(page?.content)
          ? page.content
          : (Array.isArray(page) ? page : []);

        content.sort((a, b) =>
          (a?.lastName || '').localeCompare(b?.lastName || '', undefined, { sensitivity: 'base' })
        );

        this.players = content.map(p => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          teamId: p.team?.id,
          teamName: p.team?.name
        }));

        this.loadingPlayers = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load players.';
        this.loadingPlayers = false;
      }
    });
  }

  /** Poziva se kad promeniš sezonu u selectu. */
  onSeasonChange(): void {
    // očisti stare rezultate da ne izgleda kao da su isti brojevi
    this.rows = [];
    if (this.canCompare()) this.compare();
  }

  /** Poziva se kad promeniš igrača u selectu. */
  onPlayersChange(): void {
    this.rows = [];
  }

  canCompare(): boolean {
    return !!(this.p1Id && this.p2Id && this.p1Id !== this.p2Id && this.season);
  }

  compare(): void {
    if (!this.canCompare()) return;
    this.loading = true; this.error = null;

    const ids = `${this.p1Id},${this.p2Id}`;
    this.api.comparePlayers(ids, this.season).subscribe({
      next: (rows) => {
        this.rows = rows as unknown as PlayerCompareRow[];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Comparison failed.';
        this.loading = false;
      }
    });
  }

  // Getteri za template
  get L(): PlayerCompareRow | null { return this.rows?.[0] ?? null; }
  get R(): PlayerCompareRow | null { return this.rows?.[1] ?? null; }

  // Slike / fallback
  playerPic(id?: number) {
    return id ? `/assets/players/${id}.png` : '/assets/players/placeholder.png';
  }
  teamPic(id?: number) {
    return id ? `/assets/teams/${id}.png` : '/assets/teams/placeholder.png';
  }
  imgErr(ev: Event, kind: 'player' | 'team') {
    (ev.target as HTMLImageElement).src =
      kind === 'team' ? '/assets/teams/placeholder.png' : '/assets/players/placeholder.png';
  }

  clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
}
