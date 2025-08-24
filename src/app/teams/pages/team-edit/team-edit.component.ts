import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { TeamsService } from '../../services/teams.service';
import { Team, TeamCreateRequest } from '../../../core/models/team.model';

@Component({
  selector: 'app-team-edit',
  templateUrl: './team-edit.component.html',
  styleUrls: ['./team-edit.component.css'],
  standalone: false
})
export class TeamEditComponent implements OnInit {
  loading = true;
  saving = false;
  error: string | null = null;
  team!: Team;
  id!: number;

  currentYear = new Date().getFullYear();
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private teams: TeamsService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(60)]],
      city: ['', [Validators.required, Validators.maxLength(60)]],
      foundedYear: [null as number | null, [Validators.min(1850), Validators.max(this.currentYear)]]
    });

    this.teams.get(this.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (t) => {
          this.team = t;
          this.form.patchValue({
            name: t.name ?? '',
            city: t.city ?? '',
            foundedYear: t.foundedYear ?? null
          });
        },
        error: (err) => {
          this.error = err?.error?.message || 'Greška pri učitavanju tima.';
        }
      });
  }

  submit() {
    this.error = null;
    if (this.form.invalid) return;
    this.saving = true;

    this.teams
      .update(this.id, this.form.value as TeamCreateRequest)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => this.router.navigate(['/teams']),
        error: (err: any) => {
          this.error = err?.error?.message || 'Greška pri čuvanju izmena.';
        }
      });
  }

  cancel() {
    this.router.navigate(['/teams']);
  }
}
