import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SeasonService {
  private readonly _seasons = ['2022/23', '2023/24', '2024/25'];
  private readonly _season$ = new BehaviorSubject<string>(this._seasons[this._seasons.length - 1]);

  /** Slušanje promene sezone u drugim komponentama */
  readonly season$ = this._season$.asObservable();

  /** Lista sezona za dropdown u headeru */
  allSeasons(): string[] { return this._seasons; }

  /** Trenutno izabrana sezona (za [ngModel]) */
  selected(): string { return this._season$.value; }

  /** Promeni sezonu (za (ngModelChange)) */
  set(value: string): void { this._season$.next(value); }
}
