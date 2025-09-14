import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { PlayersService } from '../../services/players.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Team } from '../../../core/models/team.model';
import { TeamsService } from '../../../teams/services/teams.service';
import { Player, PlayerUpdateRequest } from '../../../core/models/player.model';

@Component({
  selector: 'app-player-edit',
  templateUrl: './player-edit.component.html',
  styleUrls: ['./player-edit.component.css'],
  standalone: false
})
export class PlayerEditComponent implements OnInit {
  loading = false;
  error: string | null = null;

  positions = ['PG','SG','SF','PF','C'];
  teams: Team[] = [];
  playerId!: number;

  // deklaracija, bez fb ovde
  form!: UntypedFormGroup;

  constructor(
    private fb: FormBuilder,
    private players: PlayersService,
    private teamsService: TeamsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // inicijalizacija u constructor-u
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      position: [''],
      jerseyNumber: [null],
      heightCm: [null],
      weightKg: [null],
      teamId: [null]
    });
  }

  ngOnInit(): void {
    this.playerId = Number(this.route.snapshot.paramMap.get('id'));

    this.teamsService.list().subscribe({
      next: ts => (this.teams = ts || []),
      error: () => (this.teams = [])
    });

    this.loading = true;
    this.players.get(this.playerId).subscribe({
      next: (p: Player) => {
        this.form.patchValue({
          firstName: p.firstName ?? '',
          lastName: p.lastName ?? '',
          position: p.position ?? '',
          jerseyNumber: p.jerseyNumber ?? null,
          heightCm: p.heightCm ?? null,
          weightKg: p.weightKg ?? null,
          teamId: p.teamId ?? null
        });
        this.loading = false;
      },
      error: err => { this.error = err?.error?.message || 'Učitavanje nije uspelo.'; this.loading = false; }
    });
  }

  submit(): void {
    this.error = null;
    if (this.form.invalid) return;

    const payload = this.form.value as PlayerUpdateRequest;
    this.loading = true;
    this.players.update(this.playerId, payload).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/players']); },
      error: err => { this.loading = false; this.error = err?.error?.message || 'Izmena nije uspela.'; }
    });
  }

  cancel(): void { this.router.navigate(['/players']); }
}
