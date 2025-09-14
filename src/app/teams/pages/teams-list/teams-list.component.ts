import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Team } from '../../../core/models/team.model';
import { TeamsService } from '../../services/teams.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-teams-list',
  standalone: false,
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.css']
})
export class TeamsListComponent implements OnInit {
  // UI
  query = '';
  loading = false;
  error: string | null = null;

  // data
  teams: Team[] = [];
  filtered: Team[] = [];

  // kebab
  openMenuId: number | null = null;

  constructor(
    private teamsSvc: TeamsService,
    private router: Router,
    public auth: AuthService
  ) {}

  /** identičan obrazac kao u games komponenti */
  get admin(): boolean {
    const a: any = this.auth as any;
    if (typeof a.isAdmin === 'function') return a.isAdmin();
    if (typeof a.isAdmin === 'boolean') return a.isAdmin;
    return (a.role ?? a.user?.role) === 'ADMIN';
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true; this.error = null;
    this.teamsSvc.list().subscribe({
      next: (list) => { this.teams = Array.isArray(list) ? list : []; this.applyFilter(); this.loading = false; },
      error: (err) => { console.error(err); this.error = 'Failed to load teams.'; this.loading = false; }
    });
  }

  applyFilter(): void {
    const q = (this.query || '').toLowerCase().trim();
    this.filtered = !q ? [...this.teams] :
      this.teams.filter(t => (t.name || '').toLowerCase().includes(q) || (t.city || '').toLowerCase().includes(q));
  }

  openTeam(t: Team): void {
    if (!t?.id) { return; }
    this.router.navigate(['/teams', t.id]);
  }


  // images
  teamImg(id?: number): string {
    return id ? `/assets/teams/${id}.png` : '/assets/teams/placeholder.png';
  }
  imgFallback(ev: Event, _kind: 'team'): void {
    (ev.target as HTMLImageElement).src = '/assets/teams/placeholder.png';
  }

  // kebab
  toggleMenu(id: number): void {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  // actions
  editTeam(t: Team): void {
    if (!t.id) return;
    this.router.navigate(['/teams', t.id, 'edit']);
  }
  deleteTeam(t: Team): void {
    if (!t.id) return;
    if (!confirm(`Delete team "${t.name}"?`)) return;

    this.teamsSvc.delete(t.id).subscribe({
      next: () => {
        this.teams = this.teams.filter(x => x.id !== t.id);
        this.applyFilter();
      },
      error: (err) => {
        console.error('Delete team failed', err);
        const msg =
          err?.status === 409
            ? 'Team cannot be deleted because it has related games/players. Delete those first.'
            : (err?.error?.message || 'Failed to delete team.');
        alert(msg);
      }
    });
  }

  newTeam(): void { this.router.navigate(['/teams/create']); }
}
