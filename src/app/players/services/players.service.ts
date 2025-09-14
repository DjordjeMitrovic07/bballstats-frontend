import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { map } from 'rxjs/operators';
import { Player, PlayerCreateRequest, PlayerUpdateRequest } from '../../core/models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayersService {
  constructor(private api: ApiService) {}

  list(): Observable<Player[]> {
    return this.api.get<any>('/api/players').pipe(
      map((res: any) => {
        if (Array.isArray(res)) return res as Player[];
        if (Array.isArray(res?.content)) return res.content as Player[];
        if (Array.isArray(res?.items)) return res.items as Player[];
        return [];
      })
    );
  }

  getAll(): Observable<Player[]> {
    return this.list();
  }

  get(id: number): Observable<Player> {
    return this.api.get<Player>(`/api/players/${id}`);
  }

  create(body: PlayerCreateRequest): Observable<Player> {
    return this.api.post<Player>('/api/players', body);
  }

  update(id: number, body: PlayerUpdateRequest): Observable<Player> {
    return this.api.put<Player>(`/api/players/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/api/players/${id}`);
  }
}
