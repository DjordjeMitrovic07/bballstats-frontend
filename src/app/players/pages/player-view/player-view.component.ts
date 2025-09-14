import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

import { PlayersService } from '../../services/players.service';
import { Player } from '../../../core/models/player.model';

import { GamesService, GameRow } from '../../../games/services/games.service';
import { BoxscoresService, BoxScore } from '../../../games/services/boxscores.service';

@Component({
  selector: 'app-player-view',
  templateUrl: './player-view.component.html',
  styleUrls: ['./player-view.component.css'],
  standalone: false
})
export class PlayerViewComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;

  player!: Player;
  playerId!: number;

  seasons: string[] = ['2022/23', '2023/24', '2024/25'];
  season = '2024/25';

  rows: Array<BoxScore & { date?: Date }> = [];

  ppg = 0;
  rpg = 0;
  apg = 0;
  efgPct = 0; // 0..1
  tsPct  = 0; // 0..1

  spark: number[] = [];
  sparkMax = 1;

  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private playersSvc: PlayersService,
    private games: GamesService,
    private box: BoxscoresService
  ) {}

  ngOnInit(): void {
    this.playerId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchPlayerAndSeason();
  }
  ngOnDestroy(): void { this.sub?.unsubscribe?.(); }

  onSeasonChange(s: string): void {
    this.season = s;
    this.fetchSeasonStats();
  }

  // fallback za <img> error
  imgFallback(ev: Event): void {
    (ev.target as HTMLImageElement).src = '/assets/players/placeholder.png';
  }

  private fetchPlayerAndSeason(): void {
    this.loading = true; this.error = null;

    this.playersSvc.get(this.playerId).subscribe({
      next: p => { this.player = p; this.fetchSeasonStats(); },
      error: err => { this.error = err?.error?.message || 'Greška pri učitavanju igrača.'; this.loading = false; }
    });
  }

  private fetchSeasonStats(): void {
    this.loading = true; this.error = null;

    this.games.list({ season: this.season }).subscribe({
      next: (games: GameRow[]) => {
        const gs = Array.isArray(games) ? games : [];
        if (!gs.length) {
          this.rows = [];
          this.computeKpis();
          this.loading = false;
          return;
        }

        const requests = gs.map(g => this.box.listByGame(g.id));
        forkJoin(requests).subscribe({
          next: listOfLists => {
            const merged: Array<BoxScore & { date?: Date }> = [];
            listOfLists.forEach((list, i) => {
              const game = gs[i];
              (list || []).forEach(row => {
                if (row.playerId === this.playerId) {
                  merged.push({ ...row, date: new Date(game.dateTime) });
                }
              });
            });

            this.rows = merged.sort((a, b) =>
              (a.date?.getTime() || 0) - (b.date?.getTime() || 0)
            );

            this.computeKpis();
            this.loading = false;
          },
          error: _ => { this.error = 'Greška pri učitavanju box score-ova.'; this.loading = false; }
        });
      },
      error: _ => { this.error = 'Greška pri učitavanju utakmica za sezonu.'; this.loading = false; }
    });
  }

  private computeKpis(): void {
    const n = this.rows.length || 1;

    const sum = (fn: (r: BoxScore) => number | null | undefined) =>
      this.rows.reduce((acc, r) => acc + (Number(fn(r)) || 0), 0);

    const pts = sum(r => r.pts);
    const reb = sum(r => r.reb);
    const ast = sum(r => r.ast);

    const efgSum = sum(r => (r as any).efg);
    const tsSum  = sum(r => (r as any).ts);

    this.ppg = +(pts / n).toFixed(1);
    this.rpg = +(reb / n).toFixed(1);
    this.apg = +(ast / n).toFixed(1);
    this.efgPct = +(efgSum / n || 0);
    this.tsPct  = +(tsSum  / n || 0);

    this.spark = this.rows.map(r => Number(r.pts) || 0);
    this.sparkMax = Math.max(1, ...this.spark);
  }

  teamAbbr(): string {
    const name = this.player?.team?.name || (this.player as any)?.teamName || '';
    if (!name) return '—';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
    // ✅ tipiziran parametar u map da ne bude implicitni any
    return parts
      .map((p: string) => (p[0] ?? ''))
      .join('')
      .slice(0, 4)
      .toUpperCase();
  }
}
