import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayersService } from '../../services/players.service';
import { Player } from '../../../core/models/player.model';

@Component({
  selector: 'app-player-view',
  templateUrl: './player-view.component.html',
  styleUrls: ['./player-view.component.css'],
  standalone: false
})
export class PlayerViewComponent implements OnInit {
  loading = true;
  error: string | null = null;
  player?: Player;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private players: PlayersService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.players.get(id).subscribe({
      next: p => { this.player = p; this.loading = false; },
      error: err => { this.error = err?.error?.message || 'Greška pri učitavanju igrača.'; this.loading = false; }
    });
  }

  back() { this.router.navigate(['/players']); }
}
