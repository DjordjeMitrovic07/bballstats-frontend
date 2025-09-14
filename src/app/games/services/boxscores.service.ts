import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BoxScore {
  id: number;
  gameId: number;
  playerId: number;
  playerName?: string;
  teamId?: number;
  teamName?: string;

  min: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;

  fgm?: number;
  fga?: number;
  fg3m?: number;
  fg3a?: number;
  ftm?: number;
  fta?: number;

  efg?: number;
  ts?: number;
}

@Injectable({ providedIn: 'root' })
export class BoxscoresService {
  private base = environment.baseUrl;

  constructor(private http: HttpClient) {}

  /** Lista samo za jednu utakmicu (Spring: /api/games/{id}/boxscore) */
  listByGame(
    gameId: number,
    opts?: { page?: number; size?: number; sort?: string }
  ): Observable<BoxScore[]> {
    const params = new HttpParams()
      .set('page', String(opts?.page ?? 0))
      .set('size', String(opts?.size ?? 200))
      .set('sort', opts?.sort ?? 'pts,desc');

    const url = `${this.base}/api/games/${gameId}/boxscore`;
    return this.http.get<any>(url, { params }).pipe(
      map(this.unwrapList),
      map(rows => rows.map(r => this.normalize(r)))
    );
  }

  /** Pošto BE nema GET /boxscore/{id}, uzmi iz liste za game */
  getInGame(gameId: number, id: number): Observable<BoxScore> {
    return this.listByGame(gameId).pipe(
      map(rows => {
        const found = rows.find(r => r.id === id);
        if (!found) throw new Error('Box score nije nađen.');
        return found;
      })
    );
  }

  /** CREATE (Spring: POST /api/games/{id}/boxscore) */
  create(gameId: number, body: Partial<BoxScore>): Observable<BoxScore> {
    const dto = this.toServerCreate(body);
    const url = `${this.base}/api/games/${gameId}/boxscore`;
    return this.http.post<any>(url, dto).pipe(map(r => this.normalize(r)));
  }

  /** UPDATE (Spring: PUT /api/boxscore/{id}) */
  update(id: number, body: Partial<BoxScore>): Observable<BoxScore> {
    const dto = this.toServerUpdate(body);
    const url = `${this.base}/api/boxscore/${id}`;
    return this.http.put<any>(url, dto).pipe(map(r => this.normalize(r)));
  }

  /** DELETE (Spring: DELETE /api/boxscore/{id}) */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/boxscore/${id}`);
  }

  // ---------- helpers ----------

  private unwrapList = (res: any): any[] =>
    Array.isArray(res) ? res : (res?.content ?? res?.items ?? []);

  private normalize = (r: any): BoxScore => {
    const player = r?.player ?? r?.playerInfo ?? {};
    const team = r?.team ?? r?.teamInfo ?? {};
    const first = player?.firstName ?? '';
    const last = player?.lastName ?? '';
    const fullName = `${first} ${last}`.trim();
    const playerName =
      r?.playerName ?? (fullName ? fullName : (player?.name ?? ''));

    return {
      id: r?.id,
      gameId: r?.gameId ?? r?.game?.id,
      playerId: r?.playerId ?? player?.id,
      playerName,
      teamId: r?.teamId ?? team?.id,
      teamName: r?.teamName ?? team?.name,

      min: num(r?.min ?? r?.minutes, 0),
      pts: num(r?.pts ?? r?.points, 0),
      reb: num(r?.reb ?? r?.rebounds, 0),
      ast: num(r?.ast ?? r?.assists, 0),
      stl: num(r?.stl ?? r?.steals, 0),
      blk: num(r?.blk ?? r?.blocks, 0),
      tov: num(r?.tov ?? r?.turnovers, 0),

      fgm: numU(r?.fgm),
      fga: numU(r?.fga),
      // backend naziv: tp3m/tp3a
      fg3m: numU(r?.fg3m ?? r?.tp3m),
      fg3a: numU(r?.fg3a ?? r?.tp3a),
      ftm: numU(r?.ftm),
      fta: numU(r?.fta),

      efg: numU(r?.efg),
      ts: numU(r?.ts),
    };
  };

  /** Mapiranje FE -> BE polja za CREATE */
  private toServerCreate(b: Partial<BoxScore>) {
    return {
      playerId: num(b.playerId),
      min: num(b.min),
      pts: num(b.pts),
      reb: num(b.reb),
      ast: num(b.ast),
      stl: num(b.stl),
      blk: num(b.blk),
      tov: num(b.tov),
      fgm: num(b.fgm),
      fga: num(b.fga),
      tp3m: num(b.fg3m), // <— BE očekuje tp3m/tp3a
      tp3a: num(b.fg3a),
      ftm: num(b.ftm),
      fta: num(b.fta),
    };
  }

  /** Mapiranje FE -> BE polja za UPDATE */
  private toServerUpdate(b: Partial<BoxScore>) {
    return {
      min: num(b.min),
      pts: num(b.pts),
      reb: num(b.reb),
      ast: num(b.ast),
      stl: num(b.stl),
      blk: num(b.blk),
      tov: num(b.tov),
      fgm: num(b.fgm),
      fga: num(b.fga),
      tp3m: num(b.fg3m),
      tp3a: num(b.fg3a),
      ftm: num(b.ftm),
      fta: num(b.fta),
    };
  }
}

function num(v: any, def = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}
function numU(v: any): number | undefined {
  return v == null ? undefined : num(v);
}
