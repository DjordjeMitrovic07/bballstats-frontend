import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'smartPercent', standalone: true })
export class SmartPercentPipe implements PipeTransform {
  transform(value: number | null | undefined, digits: number = 1): string {
    if (value == null || !isFinite(value as number)) return '—';
    const v = Number(value);

    // Ako je ratio (0–1) -> prikaži v*100, inače prikaži kao već procenat
    const shown = v <= 1 ? v * 100 : v;

    // sigurnosno ograniči
    const clamped = Math.max(0, Math.min(shown, 100));

    return clamped.toFixed(digits) + '%';
  }
}
