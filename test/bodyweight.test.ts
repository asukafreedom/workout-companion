import { describe, expect, it } from 'vitest';
import { plateauFlag, rollingAverage } from '../src/logic/bodyweight';
import type { BodyWeight } from '../src/data/types';

const B = (date: string, kg: number): BodyWeight => ({ date, kg });

/** n daily entries ending 2026-09-01, weight from fn(i), i=0 oldest */
function series(n: number, fn: (i: number) => number): BodyWeight[] {
  const out: BodyWeight[] = [];
  const end = new Date(2026, 8, 1);
  for (let i = 0; i < n; i++) {
    const d = new Date(end);
    d.setDate(end.getDate() - (n - 1 - i));
    const p = (x: number) => String(x).padStart(2, '0');
    out.push(B(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, fn(i)));
  }
  return out;
}

describe('rollingAverage', () => {
  it('averages the trailing 7-day window', () => {
    const r = rollingAverage([B('2026-09-01', 80), B('2026-09-02', 82)]);
    expect(r).toEqual([
      { date: '2026-09-01', avg: 80 },
      { date: '2026-09-02', avg: 81 },
    ]);
  });
  it('drops entries older than the window', () => {
    const r = rollingAverage([B('2026-08-01', 100), B('2026-09-01', 80)]);
    expect(r[1].avg).toBe(80);
  });
  it('dedupes same-date entries keeping the last', () => {
    const r = rollingAverage([B('2026-09-01', 80), B('2026-09-01', 81)]);
    expect(r).toEqual([{ date: '2026-09-01', avg: 81 }]);
  });
});

describe('plateauFlag', () => {
  it('false with too little data', () => {
    expect(plateauFlag(series(5, () => 80))).toBe(false);
  });
  it('true when flat over 3+ weeks', () => {
    expect(plateauFlag(series(24, () => 80))).toBe(true);
  });
  it('false when trending down', () => {
    expect(plateauFlag(series(24, (i) => 84 - i * 0.15))).toBe(false);
  });
});
