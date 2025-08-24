import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Team, TeamCreateRequest } from '../../core/models/team.model';
import { map } from 'rxjs/operators'; // 👈 dodaj ovo

@Injectable({ providedIn: 'root' })
export class TeamsService {
  constructor(private api: ApiService) {}

  list(): Observable<Team[]> {
    return this.api.get<any>('/api/teams').pipe(
      map((res: any) => {
        // podrži više formata odgovora
        if (Array.isArray(res)) return res;                 // [ {...}, {...} ]
        if (Array.isArray(res?.content)) return res.content; // { content: [ ... ], ... }
        if (Array.isArray(res?.items)) return res.items;     // { items: [ ... ], ... }
        return [];                                          // fallback
      })
    );
  }

  create(payload: TeamCreateRequest): Observable<Team> {
    return this.api.post<Team>('/api/teams', payload);
  }
}
