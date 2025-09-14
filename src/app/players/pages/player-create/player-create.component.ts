import { Component } from '@angular/core';
import { FormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { PlayersService } from '../../services/players.service';
import { Router } from '@angular/router';
import { Team } from '../../../core/models/team.model';
import { TeamsService } from '../../../teams/services/teams.service';
import { PlayerCreateRequest } from '../../../core/models/player.model';

@Component({
  selector: 'app-player-create',
  templateUrl: './player-create.component.html',
  styleUrls: ['./player-create.component.css'],
  standalone: false
})
export class PlayerCreateComponent {
  loading = false;
  error: string | null = null;

  positions = ['PG','SG','SF','PF','C'];
  teams: Team[] = [];

  // deklaracija bez korišćenja fb ovde:
  form!: UntypedFormGroup;

  constructor(
    private fb: FormBuilder,
    private players: PlayersService,
    private teamsService: TeamsService,
    private router: Router
  ) {
    // inicijalizacija u constructor-u:
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      position: [''],
      jerseyNumber: [null],
      heightCm: [null],
      weightKg: [null],
      teamId: [null]
    });

    this.teamsService.list().subscribe({
      next: ts => (this.teams = ts || []),
      error: () => (this.teams = [])
    });
  }

  submit(): void {
    this.error = null;
    if (this.form.invalid) return;

    const payload = this.form.value as PlayerCreateRequest;
    this.loading = true;
    this.players.create(payload).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/players']); },
      error: err => { this.loading = false; this.error = err?.error?.message || 'Kreiranje nije uspelo.'; }
    });
  }

  cancel(): void { this.router.navigate(['/players']); }
}
