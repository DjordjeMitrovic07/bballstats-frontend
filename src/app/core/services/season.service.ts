import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SeasonService {
  private _season$ = new BehaviorSubject<string>('2024/25');
  season$ = this._season$.asObservable();

  get current(): string { return this._season$.value; }

  setSeason(value: string) {
    this._season$.next(value);
  }

  allSeasons(): string[] {
    return ['2024/25', '2023/24', '2022/23'];
  }
}
