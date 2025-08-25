import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayersService } from '../../services/players.service';
import { Player } from '../../../core/models/player.model';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SeasonService } from '../../../core/services/season.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css'],
  standalone: false
})
export class PlayersListComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;

  filter = '';
  data: Player[] = [];
  view: Player[] = [];

  get admin(): boolean {
    const a: any = this.auth as any;
    if (typeof a.isAdmin === 'function') return a.isAdmin();
    if (typeof a.isAdmin === 'boolean') return a.isAdmin;
    return (a.role ?? a.user?.role) === 'ADMIN';
  }

  private sub?: Subscription;

  constructor(
    private players: PlayersService,
    private season: SeasonService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.season.season$.subscribe(() => this.fetch());
    this.fetch();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /** Učitaj sa servera i osveži prikaz */
  fetch(): void {
    this.loading = true;
    this.error = null;

    this.players.list()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: rows => {
          this.data = rows ?? [];
          this.applyFilter();
        },
        error: err => {
          this.error = err?.error?.message || 'Greška pri učitavanju igrača.';
        }
      });
  }

  /** Lokalni filter preko unetog teksta */
  applyFilter(): void {
    const q = this.filter.trim().toLowerCase();
    this.view = !q ? this.data.slice() : this.data.filter(p => {
      const full = `${p.firstName ?? ''} ${p.lastName ?? ''}`.toLowerCase();
      return full.includes(q)
        || (p.teamName ?? '').toLowerCase().includes(q)
        || (p.position ?? '').toLowerCase().includes(q);
    });
  }

  /** Poziva se iz inputa – samo primeni lokalni filter */
  search(): void {
    this.applyFilter();
  }

  fullName(p: Player): string {
    return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
  }

  goNew(): void { this.router.navigate(['/players/new']); }
  goEdit(p: Player): void { this.router.navigate(['/players', p.id, 'edit']); }
  open(p: Player): void { this.router.navigate(['/players', p.id]); }

  /** Brisanje pa ponovno učitavanje liste */
  remove(p: Player, e: Event): void {
    e.stopPropagation();
    if (!confirm(`Delete ${p.firstName} ${p.lastName}?`)) return;

    this.players.delete(p.id!).subscribe({
      next: () => this.fetch(),
      error: err => {
        const msg = err?.error?.message || 'Delete failed.';
        alert(msg);
      }
    });
  }
}
