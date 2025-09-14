// src/app/games/pages/game-create/game-create.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, finalize, map } from 'rxjs';

import { GamesService } from '../../services/games.service';
import { SeasonService } from '../../../core/services/season.service';
import { ApiService } from '../../../core/services/api.service';

// Ako već imaš ova dva tipa u core/models/game.model – ostavi ovaj import.
// Ako nemaš, možeš i bez tipova (TeamLite kao {id:number; name:string}).
import { GameCreateRequest, TeamLite } from '../../../core/models/game.model';

@Component({
  selector: 'app-game-create',
  templateUrl: './game-create.component.html',
  styleUrls: ['./game-create.component.css'],
  standalone: false,
})
export class GameCreateComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  // >>> polja koja HTML očekuje
  seasons: string[] = [];
  saving = false;

  teams: TeamLite[] = [];
  error: string | null = null;

  private sub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private games: GamesService,
    private season: SeasonService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    // formu inicijalizujemo tek ovde -> nema više TS2729
    this.form = this.fb.group({
      dateTime: ['', Validators.required],         // <input type="datetime-local">
      season: ['', Validators.required],
      homeTeamId: [null, Validators.required],
      awayTeamId: [null, Validators.required],
    });

    // sezone za dropdown u header-stilu
    this.seasons = this.season.allSeasons() ?? [];

    // sinhronizacija sa izborom sezone iz headera
    this.sub = this.season.season$?.subscribe(s => {
      if (s) this.form.patchValue({ season: s });
    });

    this.loadTeams();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private loadTeams(): void {
    this.api.get<any>('/api/teams').pipe(
      map((res: any) => {
        const arr = Array.isArray(res)
          ? res
          : Array.isArray(res?.content)
            ? res.content
            : Array.isArray(res?.items)
              ? res.items
              : [];
        return (arr || []).map((t: any) => ({ id: t.id, name: t.name } as TeamLite));
      })
    ).subscribe({
      next: list => (this.teams = list),
      error: _ => (this.error = 'Neuspešno učitavanje timova.'),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { dateTime, season, homeTeamId, awayTeamId } = this.form.value;

    if (homeTeamId === awayTeamId) {
      this.error = 'Home i Away tim ne mogu biti isti.';
      return;
    }

    const body: GameCreateRequest = {
      dateTime: new Date(dateTime).toISOString(),
      season,
      homeTeamId: Number(homeTeamId),
      awayTeamId: Number(awayTeamId),
    };

    this.saving = true;
    this.error = null;

    this.games.create(body).pipe(
      finalize(() => (this.saving = false))
    ).subscribe({
      next: created => this.router.navigate(['/games', created.id]),
      error: err => {
        this.error = err?.error?.message || 'Greška pri zakazivanju utakmice.';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/games']);
  }
}
