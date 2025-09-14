// src/app/metrics/components/team-metrics-card/team-metrics-card.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { MetricsApiService, TeamMetricsDto } from '../../services/metrics-api.service';

@Component({
  selector: 'app-team-metrics-card',
  templateUrl: './team-metrics-card.component.html',
  styleUrls: ['./team-metrics-card.component.css'],
  standalone: false
})
export class TeamMetricsCardComponent implements OnChanges {
  @Input() teamId!: number;
  @Input() season?: string;
  @Input() teamName?: string; // <— NOVO

  loading = false;
  error: string | null = null;

  pace?: number;
  ortg?: number;
  drtg?: number;
  efg?: number;
  ts?: number;

  constructor(private api: MetricsApiService) {}

  ngOnChanges(): void {
    if (!this.teamId) return;
    this.loading = true; this.error = null;

    this.api.teamMetrics(this.teamId, this.season).subscribe({
      next: (m: TeamMetricsDto) => {
        this.pace = m.pace;
        this.ortg = m.ortg;
        this.drtg = m.drtg;
        this.efg = m.efg;
        this.ts   = m.ts;
        this.loading = false;
      },
      error: _ => { this.error = 'Failed to load team metrics.'; this.loading = false; }
    });
  }

  pct(v?: number): string { return v == null ? '—' : (v * 100).toFixed(1) + '%'; }
}
