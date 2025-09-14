import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TeamsService } from '../../services/teams.service';
import { TeamCreateRequest } from '../../../core/models/team.model';

@Component({
  selector: 'app-team-create',
  templateUrl: './team-create.component.html',
  styleUrls: ['./team-create.component.css'],
  standalone: false
})
export class TeamCreateComponent {
  loading = false;
  error: string | null = null;
  currentYear = new Date().getFullYear();

  form!: FormGroup; // <-- deklariši polje

  constructor(
    private fb: FormBuilder,
    private teams: TeamsService,
    private router: Router
  ) {
    // <-- inicijalizuj u konstruktoru
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(60)]],
      city: ['', [Validators.required, Validators.maxLength(60)]],
      foundedYear: [
        null as number | null,
        [Validators.min(1850), Validators.max(this.currentYear)]
      ]
    });
  }

  submit() {
    this.error = null;
    if (this.form.invalid) return;
    this.loading = true;

    this.teams.create(this.form.value as TeamCreateRequest).subscribe({
      next: () => this.router.navigate(['/teams']),
      error: (err: any) => {                     // <-- tip za err da ne bude implicit 'any'
        this.error = err?.error?.message || 'Greška pri kreiranju tima.';
        this.loading = false;
      }
    });
  }
}
