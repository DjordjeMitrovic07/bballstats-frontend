// src/app/core/services/season.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SeasonService {
  private readonly _seasons = this.makeLastCompletedSeasons(3);
  private readonly _season$ = new BehaviorSubject<string>(this._seasons[this._seasons.length - 1]);

  /** emit izabrane sezone */
  readonly season$ = this._season$.asObservable();

  /** lista za dropdown */
  allSeasons(): string[] { return this._seasons; }

  /** trenutno izabrana sezona */
  selected(): string { return this._season$.value; }

  /** promeni sezonu */
  set(value: string): void { this._season$.next(value); }

  /** n poslednjih kompletnih NBA sezona (sezona = startYear / (startYear+1)%100) */
  private makeLastCompletedSeasons(n: number): string[] {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1; // 1..12

    // Ako je avgust (8) ili kasnije -> tekuća sezona još NIJE kompletna,
    // poslednja kompletna je ona koja je počela prošlog avgusta.
    // Ako je pre avgusta -> poslednja kompletna je ona koja je počela pre 2 godine.
    const lastCompletedStart = m >= 8 ? y - 1 : y - 2;

    const arr: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const start = lastCompletedStart - i;
      const endShort = String((start + 1) % 100).padStart(2, '0');
      arr.push(`${start}/${endShort}`);
    }
    return arr;
  }
}
