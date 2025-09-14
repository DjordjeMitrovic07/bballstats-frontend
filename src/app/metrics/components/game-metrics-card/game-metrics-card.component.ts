// src/app/metrics/components/game-metrics-card/game-metrics-card.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { MetricsApiService, GameTeamMetrics } from '../../services/metrics-api.service';

@Component({
  selector: 'app-game-metrics-card',
  templateUrl: './game-metrics-card.component.html',
  styleUrls: ['./game-metrics-card.component.css'],
  standalone: false
})
export class GameMetricsCardComponent implements OnChanges {
  @Input() gameId!: number;

  loading = false;
  error: string | null = null;

  rows: GameTeamMetrics[] = []; // [0] home, [1] away (ili kojim već redosledom dolazi)

  constructor(private api: MetricsApiService) {}

  ngOnChanges(): void {
    if (!this.gameId) return;
    this.fetch();
  }

  private fetch(): void {
    this.loading = true;
    this.error = null;

    this.api.getGameMetrics(this.gameId).subscribe({
      next: (data: GameTeamMetrics[]) => {
        this.rows = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Failed to load game metrics.';
        this.loading = false;
      }
    });
  }

  get left(): GameTeamMetrics | undefined { return this.rows?.[0]; }
  get right(): GameTeamMetrics | undefined { return this.rows?.[1]; }

  pct(v?: number): string {
    if (v == null || Number.isNaN(v)) return '—';
    return (v * 100).toFixed(1) + '%';
  }
}
