import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Team, TeamCreateRequest } from '../../core/models/team.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  constructor(private api: ApiService) {}

  list(): Observable<Team[]> {
    return this.api.get<any>('/api/teams').pipe(
      map((res: any) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.content)) return res.content;
        if (Array.isArray(res?.items)) return res.items;
        return [];
      })
    );
  }

  get(id: number): Observable<Team> {
    return this.api.get<Team>(`/api/teams/${id}`);
  }

  create(payload: TeamCreateRequest): Observable<Team> {
    return this.api.post<Team>('/api/teams', payload);
  }

  update(id: number, payload: TeamCreateRequest): Observable<Team> {
    return this.api.put<Team>(`/api/teams/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/api/teams/${id}`);
  }
}
