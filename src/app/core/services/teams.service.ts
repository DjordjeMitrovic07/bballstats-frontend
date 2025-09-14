import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Team } from '../../core/models/team.model';
import { TeamCreateRequest } from '../../core/models/team.model';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  constructor(private api: ApiService) {}

  list(): Observable<Team[]> {
    return this.api.get<Team[]>('/api/teams');
  }

  create(payload: TeamCreateRequest): Observable<Team> {
    return this.api.post<Team>('/api/teams', payload);
  }
}
