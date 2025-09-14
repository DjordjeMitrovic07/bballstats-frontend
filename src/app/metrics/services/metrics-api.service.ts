// src/app/metrics/services/metrics-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, catchError, filter, take, defaultIfEmpty } from 'rxjs/operators';
import { Observable, EMPTY, of, concat } from 'rxjs';
import { environment } from '../../../environments/environment';

// ---- Tipovi ----
export type MetricKey = 'pts' | 'apg' | 'rpg' | 'efg' | 'ts' | 'tp3p';

export interface LeaderRow {
  playerId: number;
  name: string;
  teamAbbr: string;
  value: number; // procenat 0–1 za eFG/TS/3PT, inače vrednost
}

export interface TeamLeaderRow {
  teamId: number;
  name: string;
  abbr: string;
  value: number; // 0–1 za procente
}

export interface LeadersQuery {
  season: string;
  metric: MetricKey;
  n?: number;
  minGames?: number | null;
  minMpg?: number | null;
}

export interface TeamLeadersQuery {
  season: string;
  metric: MetricKey;
  n?: number;
  minGames?: number | null;
}

export interface PlayerOption {
  id: number;
  firstName: string;
  lastName: string;
  teamId?: number | null;
  teamName?: string | null;
}

export interface PlayerCompareRow {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  ts: number;   // 0–1
  efg: number;  // 0–1
  usg: number;  // 0–100 ili 0–1 (UI samo prikazuje)
  ptsPerGame: number;
  minPerGame: number;
}

// --- Team metrics DTO (za karticu na strani tima) ---
export interface TeamMetricsDto {
  pace: number;
  ortg: number;   // per 100
  drtg: number;   // per 100
  efg: number;    // 0–1
  ts: number;     // 0–1
}

// --- Game team metrics (za karticu na strani utakmice) ---
export interface GameTeamMetrics {
  teamId?: number | null;
  teamName: string;
  pace: number;
  ortg: number;   // per 100
  drtg: number;   // per 100
  efg: number;    // 0–1
  ts: number;     // 0–1
}

@Injectable({ providedIn: 'root' })
export class MetricsApiService {
  private readonly metricsBase = `${environment.baseUrl}/api/metrics`;
  private readonly apiBase     = `${environment.baseUrl}/api`;

  constructor(private http: HttpClient) {}

  // ===== Leaders (players) =====
  getLeaders(opts: LeadersQuery): Observable<LeaderRow[]> {
    let params = new HttpParams()
      .set('season', opts.season)
      .set('metric', opts.metric)
      .set('n', String(opts.n ?? 5));
    if (opts.minGames != null) params = params.set('minGames', String(opts.minGames));
    if (opts.minMpg   != null) params = params.set('minMpg',   String(opts.minMpg));
    return this.http.get<LeaderRow[]>(`${this.metricsBase}/leaders`, { params });
  }

  // ===== Leaders (teams) =====
  getTeamLeaders(opts: TeamLeadersQuery): Observable<TeamLeaderRow[]> {
    let params = new HttpParams()
      .set('season', opts.season)
      .set('metric', opts.metric)
      .set('n', String(opts.n ?? 5));
    if (opts.minGames != null) params = params.set('minGames', String(opts.minGames));
    return this.http.get<TeamLeaderRow[]>(`${this.metricsBase}/team-leaders`, { params });
  }

  // ===== Dropdown lista igrača =====
  getPlayersForSelect(): Observable<PlayerOption[]> {
    const params = new HttpParams().set('size', '999').set('sort', 'lastName,asc');
    return this.http.get<any>(`${this.apiBase}/players`, { params }).pipe(
      map(page => {
        const arr = Array.isArray(page) ? page
          : Array.isArray(page?.content) ? page.content
            : Array.isArray(page?.items) ? page.items
              : [];
        return arr.map((p: any) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          teamId: p.team?.id ?? null,
          teamName: p.team?.name ?? null
        }) as PlayerOption);
      })
    );
  }

  // ===== Poređenje igrača =====
  comparePlayers(ids: string, season?: string) {
    let params = new HttpParams().set('ids', ids);
    if (season) params = params.set('season', season);
    return this.http.get<any[]>(`${this.metricsBase}/compare/players`, { params });
  }

  // ===== Team metrics (za TeamView) =====
  teamMetrics(teamId: number, season?: string): Observable<TeamMetricsDto> {
    let params = new HttpParams();
    if (season) params = params.set('season', season);
    return this.http.get<TeamMetricsDto>(`${this.metricsBase}/team/${teamId}`, { params });
  }

  // ===== Game metrics (za GameDetail) =====
  // Sekvencijalno probamo više mogućih ruta i normalizujemo rezultat.
  getGameMetrics(gameId: number): Observable<GameTeamMetrics[]> {
    const normalize = (data: any): GameTeamMetrics[] => {
      if (Array.isArray(data)) return data as GameTeamMetrics[];
      if (Array.isArray(data?.teams)) return data.teams as GameTeamMetrics[];

      const toRow = (o: any): GameTeamMetrics => ({
        teamId: o?.teamId ?? null,
        teamName: o?.teamName ?? o?.name ?? o?.abbr ?? '—',
        pace: Number(o?.pace ?? 0),
        ortg: Number(o?.ortg ?? o?.offRtg ?? o?.offRating ?? 0),
        drtg: Number(o?.drtg ?? o?.defRtg ?? o?.defRating ?? 0),
        efg:  Number(o?.efg  ?? o?.eFG ?? 0),
        ts:   Number(o?.ts   ?? o?.trueShooting ?? 0),
      });

      if (data?.home && data?.away) return [toRow(data.home), toRow(data.away)];
      if (data?.team) return [toRow(data.team)];
      return [];
    };

    const tryPath = (url: string) =>
      this.http.get<any>(url).pipe(
        map(normalize),
        catchError(() => of([] as GameTeamMetrics[])) // svaku grešku mapiramo na []
      );

    const attempts$ = concat(
      tryPath(`${this.metricsBase}/game/${gameId}/teams`),
      tryPath(`${this.metricsBase}/games/${gameId}/teams`),
      tryPath(`${this.metricsBase}/game/${gameId}`),
      tryPath(`${this.metricsBase}/games/${gameId}`),
      tryPath(`${this.metricsBase}/game-teams/${gameId}`),
      tryPath(`${this.metricsBase}/games/${gameId}/metrics`)
    );

    return attempts$.pipe(
      filter(arr => Array.isArray(arr) && arr.length > 0),
      take(1),                    // prva ne-prazna varijanta
      defaultIfEmpty([] as GameTeamMetrics[]) // ako su sve prazne, emituj []
    );
  }
}
