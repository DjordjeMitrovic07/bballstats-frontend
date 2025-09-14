// src/app/games/services/games.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GameRow {
  id: number;
  dateTime: string;      // ISO datum/vreme
  season: string;
  homeTeamId?: number;
  homeTeamName?: string;
  awayTeamId?: number;
  awayTeamName?: string;
  homeScore?: number | null;
  awayScore?: number | null;
}

@Injectable({ providedIn: 'root' })
export class GamesService {
  private base = `${environment.baseUrl}/api/games`;

  constructor(private http: HttpClient) {}

  list(params?: { season?: string; page?: number; size?: number; q?: string }): Observable<GameRow[]> {
    let p = new HttpParams();
    if (params?.season) p = p.set('season', params.season);
    if (params?.page != null) p = p.set('page', String(params.page));
    if (params?.size != null) p = p.set('size', String(params.size));
    if (params?.q) p = p.set('q', params.q);

    return this.http.get<any>(this.base, { params: p }).pipe(
      map(res => {
        const items = Array.isArray(res) ? res : (res?.content ?? res?.items ?? []);
        return (items as any[]).map(this.normalizeGame);
      })
    );
  }

  get(id: number): Observable<GameRow> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(this.normalizeGame));
  }

  create(body: {
    dateTime: string;
    season: string;
    homeTeamId: number;
    awayTeamId: number;
  }): Observable<GameRow> {
    return this.http.post<any>(this.base, body).pipe(map(this.normalizeGame));
  }

  // helper — poravna potencijalno ugnježdene timove/polja
  private normalizeGame = (g: any): GameRow => {
    const home = g?.homeTeam ?? {};
    const away = g?.awayTeam ?? {};
    return {
      id: g.id,
      dateTime: g.dateTime ?? g.startTime ?? g.tipoff ?? '',
      season: g.season ?? '',
      homeTeamId: g.homeTeamId ?? home.id,
      homeTeamName: g.homeTeamName ?? home.name ?? home.teamName,
      awayTeamId: g.awayTeamId ?? away.id,
      awayTeamName: g.awayTeamName ?? away.name ?? away.teamName,
      homeScore: g.homeScore ?? null,
      awayScore: g.awayScore ?? null,
    };
  };
}
