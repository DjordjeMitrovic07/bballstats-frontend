// src/app/games/pages/boxscores/boxscore-form.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, finalize, map } from 'rxjs';
import { BoxscoresService, BoxScore } from '../../services/boxscores.service';
import { GamesService, GameRow } from '../../services/games.service';
import { ApiService } from '../../../core/services/api.service';

type PlayerLite = { id: number; name: string; teamId?: number; teamName?: string };

// cross-field validator: made ≤ att
function madeNotOverAtt(madeKey: string, attKey: string) {
  return (group: AbstractControl): ValidationErrors | null => {
    const g = group as FormGroup;
    const made = Number(g.get(madeKey)?.value ?? 0);
    const att  = Number(g.get(attKey )?.value ?? 0);
    if (made > att) {
      const err: ValidationErrors = { madeOverAtt: true };
      g.get(madeKey)?.setErrors({ ...(g.get(madeKey)?.errors || {}), madeOverAtt: true });
      return err;
    } else {
      // očisti grešku ako je bila
      const ctrl = g.get(madeKey);
      if (ctrl?.errors && ctrl.errors['madeOverAtt']) {
        const { madeOverAtt, ...rest } = ctrl.errors;
        ctrl.setErrors(Object.keys(rest).length ? rest : null);
      }
    }
    return null;
  };
}

@Component({
  selector: 'app-boxscore-form',
  templateUrl: './boxscore-form.component.html',
  styleUrls: ['./boxscore-form.component.css'],
  standalone: false
})
export class BoxscoreFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  saving = false;
  error: string | null = null;

  gameId!: number;
  boxId?: number;
  game?: GameRow;

  players: PlayerLite[] = [];
  private sub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: BoxscoresService,
    private games: GamesService,
    private http: ApiService,
  ) {}

  ngOnInit(): void {
    this.gameId = Number(this.route.snapshot.paramMap.get('id'));
    const maybeBox = this.route.snapshot.paramMap.get('boxId');
    this.boxId = maybeBox ? Number(maybeBox) : undefined;

    this.form = this.fb.group({
      playerId: [null, Validators.required],
      min: [0, [Validators.required]],
      pts: [0, [Validators.required]],
      reb: [0, [Validators.required]],
      ast: [0, [Validators.required]],
      stl: [0, [Validators.required]],
      blk: [0, [Validators.required]],
      tov: [0, [Validators.required]],
      fgm: [0],
      fga: [0],
      fg3m: [0],
      fg3a: [0],
      ftm: [0],
      fta: [0],
    }, {
      validators: [
        madeNotOverAtt('fgm', 'fga'),
        madeNotOverAtt('fg3m', 'fg3a'),
        madeNotOverAtt('ftm', 'fta')
      ]
    });

    this.loadGame();
    this.loadPlayers();

    if (this.boxId) {
      this.loading = true;
      this.api.getInGame(this.gameId, this.boxId).pipe(
        finalize(() => (this.loading = false))
      ).subscribe({
        next: b => this.patchForm(b),
        error: _ => this.error = 'Greška pri učitavanju box score-a.'
      });
    }
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  private patchForm(b: BoxScore) {
    this.form.patchValue({
      playerId: b.playerId,
      min: b.min, pts: b.pts, reb: b.reb, ast: b.ast,
      stl: b.stl, blk: b.blk, tov: b.tov,
      fgm: b.fgm ?? 0, fga: b.fga ?? 0,
      fg3m: b.fg3m ?? 0, fg3a: b.fg3a ?? 0,
      ftm: b.ftm ?? 0, fta: b.fta ?? 0,
    });
  }

  private loadGame(): void {
    this.games.get(this.gameId).subscribe({ next: g => this.game = g });
  }

  private loadPlayers(): void {
    this.http.get<any>(`/api/players/by-game/${this.gameId}`).pipe(
      map(res => Array.isArray(res) ? res : (res?.content ?? res?.items ?? [])),
      map(arr => arr.map((p: any) => ({
        id: p.id,
        name: p.name ?? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
        teamId: p.teamId ?? p.team?.id,
        teamName: p.teamName ?? p.team?.name,
      }) as PlayerLite))
    ).subscribe({
      next: list => this.players = list,
      error: _ => {
        // fallback: svi igrači
        this.http.get<any>('/api/players').pipe(
          map(res => Array.isArray(res) ? res : (res?.content ?? res?.items ?? [])),
          map(arr => arr.map((p: any) => ({
            id: p.id,
            name: p.name ?? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
            teamId: p.teamId ?? p.team?.id,
            teamName: p.teamName ?? p.team?.name,
          }) as PlayerLite))
        ).subscribe({ next: list => this.players = list });
      }
    });
  }

  // ——— Derivirani prikaz za eFG / TS iz vrednosti u formi ———
  get calcEfg(): string {
    const v = this.form.value as any;
    const fgm = Number(v.fgm ?? 0), fga = Number(v.fga ?? 0), fg3m = Number(v.fg3m ?? 0);
    if (!fga) return '—';
    const efg = (fgm + 0.5 * fg3m) / fga;
    return (efg * 100).toFixed(1) + '%';
  }
  get calcTs(): string {
    const v = this.form.value as any;
    const pts = Number(v.pts ?? 0), fga = Number(v.fga ?? 0), fta = Number(v.fta ?? 0);
    const denom = 2 * (fga + 0.44 * fta);
    if (!denom) return '—';
    const ts = pts / denom;
    return (ts * 100).toFixed(1) + '%';
  }

  submit(): void {
    this.error = null;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.value as any;
    const payload: Partial<BoxScore> = {
      playerId: Number(v.playerId),
      min: Number(v.min), pts: Number(v.pts), reb: Number(v.reb), ast: Number(v.ast),
      stl: Number(v.stl), blk: Number(v.blk), tov: Number(v.tov),
      fgm: Number(v.fgm), fga: Number(v.fga),
      fg3m: Number(v.fg3m), fg3a: Number(v.fg3a),
      ftm: Number(v.ftm), fta: Number(v.fta),
    };

    this.saving = true;
    const done = () => (this.saving = false);

    if (this.boxId) {
      this.api.update(this.boxId, payload).pipe(finalize(done)).subscribe({
        next: _ => this.router.navigate(['/games', this.gameId, 'boxscores']),
        error: err => this.error = err?.error?.message || err?.message || 'Greška pri čuvanju box score-a.'
      });
    } else {
      this.api.create(this.gameId, payload).pipe(finalize(done)).subscribe({
        next: _ => this.router.navigate(['/games', this.gameId, 'boxscores']),
        error: err => this.error = err?.error?.message || err?.message || 'Greška pri čuvanju box score-a.'
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/games', this.gameId, 'boxscores']);
  }
}
