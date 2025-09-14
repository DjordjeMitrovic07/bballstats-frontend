import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LeaderDto, PlayerMetricsDto, TeamMetricsDto, GameMetricsDto } from './metrics.models';
import { Observable } from 'rxjs';

const API = `${environment.baseUrl}/api/metrics`;

@Injectable({ providedIn: 'root' })
export class MetricsService {
  constructor(private http: HttpClient) {}

  leaders(season: string, metric: string, n = 10, minGames?: number, minMpg?: number): Observable<LeaderDto[]> {
    let params = new HttpParams().set('season', season).set('metric', metric).set('n', n);
    if (minGames != null) params = params.set('minGames', minGames);
    if (minMpg != null) params = params.set('minMpg', minMpg);
    return this.http.get<LeaderDto[]>(`${API}/leaders`, { params });
  }

  playerMetrics(id: number, season?: string): Observable<PlayerMetricsDto> {
    let params = new HttpParams();
    if (season) params = params.set('season', season);
    return this.http.get<PlayerMetricsDto>(`${API}/player/${id}`, { params });
  }

  teamMetrics(id: number, season?: string): Observable<TeamMetricsDto> {
    let params = new HttpParams();
    if (season) params = params.set('season', season);
    return this.http.get<TeamMetricsDto>(`${API}/team/${id}`, { params });
  }

  gameMetrics(id: number): Observable<GameMetricsDto> {
    return this.http.get<GameMetricsDto>(`${API}/game/${id}`);
  }
}
