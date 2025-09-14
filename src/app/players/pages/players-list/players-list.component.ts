import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Player } from '../../../core/models/player.model';
import { Team } from '../../../core/models/team.model';
import { PlayersService } from '../../services/players.service';
import { TeamsService } from '../../../teams/services/teams.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-players-list',
  standalone: false,
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css'],
})
export class PlayersListComponent implements OnInit {
  // UI state
  query = '';
  loading = false;
  error: string | null = null;

  // data
  players: Player[] = [];
  filtered: Player[] = [];

  // timovi za lookup po id-u
  private teamIndex: Map<number, Team> = new Map<number, Team>();

  // admin / menu
  isAdmin = false; // biće postavljeno iz AuthService u ngOnInit
  get admin(): boolean {
    return this.isAdmin;
  }
  openMenuId: number | null = null;

  // ručni sinonimi -> skraćenice
  private teamAbbrMap: Record<string, string> = {
    'los angeles lakers': 'LAL',
    'boston celtics': 'BOS',
    'golden state warriors': 'GSW',
    'partizan': 'PAR',
    'celtics': 'BOS',
    'lakers': 'LAL',
    'warriors': 'GSW',
  };

  constructor(
    private playersSvc: PlayersService,
    private teamsSvc: TeamsService,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    // odredi admin flag (da user ne vidi +New / kebab)
    this.isAdmin = this.computeAdmin();
    this.load();
  }

  private computeAdmin(): boolean {
    const a: any = this.auth as any;
    if (typeof a.isAdmin === 'function') return !!a.isAdmin();
    if (typeof a.isAdmin === 'boolean') return a.isAdmin === true;
    const role = a.role ?? a.user?.role;
    return role === 'ADMIN';
  }

  load(): void {
    this.loading = true;
    this.error = null;

    forkJoin([this.playersSvc.list(), this.teamsSvc.list()]).subscribe({
      next: ([plist, tlist]) => {
        this.players = Array.isArray(plist) ? plist : [];

        const teams = Array.isArray(tlist) ? tlist : [];

        // TIP-SAFE: prvo izvučemo brojčani id, pa guramo tuple [number, Team]
        const kv: [number, Team][] = [];
        for (const t of teams) {
          const id = t?.id;
          if (typeof id === 'number') {
            kv.push([id, t]); // id je sada čist number
          }
        }
        this.teamIndex = new Map<number, Team>(kv);

        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Players load failed', err);
        this.error = 'Failed to load players.';
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    const q = (this.query || '').toLowerCase().trim();
    if (!q) {
      this.filtered = [...this.players];
      return;
    }
    this.filtered = this.players.filter((p) => {
      const fullName = ((p.firstName || '') + ' ' + (p.lastName || '')).toLowerCase();
      const teamName = (this.playerTeamName(p) || '').toLowerCase();
      const pos = (p.position || '').toLowerCase();
      return fullName.includes(q) || teamName.includes(q) || pos.includes(q);
    });
  }

  // ====== TEAM ABBR / NAME HELPERS ======
  private abbrFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
    const initials = parts.map((p) => p[0]).join('');
    return initials.slice(0, 4).toUpperCase();
  }

  private playerTeamName(p: Player): string {
    // probaj redom: relation -> polje teamName -> lookup po teamId
    const viaRel = (p as any)?.team?.name as string | undefined;
    if (viaRel) return viaRel;

    const viaField = (p as any)?.teamName as string | undefined;
    if (viaField) return viaField;

    if (typeof p.teamId === 'number' && this.teamIndex.has(p.teamId)) {
      return this.teamIndex.get(p.teamId)!.name || '';
    }
    return '';
  }

  playerTeamAbbr(p: Player): string {
    const name = this.playerTeamName(p);
    if (!name) return '';
    const key = name.toLowerCase();
    if (this.teamAbbrMap[key]) return this.teamAbbrMap[key];
    return this.abbrFromName(name);
  }

  // ====== images ======
  playerImg(id?: number): string {
    return id ? `/assets/players/${id}.png` : '/assets/players/placeholder.png';
  }
  imgFallback(ev: Event, _kind: 'player'): void {
    (ev.target as HTMLImageElement).src = '/assets/players/placeholder.png';
  }

  // ====== kebab menu ======
  toggleMenu(id: number): void {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  // ====== actions ======
  editPlayer(p: Player): void {
    if (!p.id) return;
    void this.router.navigate(['/players', p.id, 'edit']); // utišava lint poruku
  }

  deletePlayer(p: Player): void {
    if (!p.id) return;
    if (!confirm(`Delete player "${p.firstName} ${p.lastName}"?`)) return;

    this.playersSvc.delete(p.id).subscribe({
      next: () => {
        this.players = this.players.filter((x) => x.id !== p.id);
        this.applyFilter();
      },
      error: (err) => {
        console.error('Delete player failed', err);
        alert('Failed to delete player.');
      },
    });
  }

  newPlayer(): void {
    void this.router.navigate(['/players/create']); // utišava lint poruku
  }
}
