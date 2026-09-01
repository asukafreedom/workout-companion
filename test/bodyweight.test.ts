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
  it('window boundary: day 21 back affects plateau flag', () => {
    // 24 entries: entry at i=2 is 21 days back with weight 84, all others 80
    // Days 0-6 back (recent): all 80, mean=80
    // Days 14-20 back (old, incorrect): entries i=3..9, all 80, mean=80 => diff=0, flag=true
    // Days 15-21 back (old, correct): entries i=2..8, include i=2 at 84, mean=80.57 => diff=0.57, flag=false
    expect(plateauFlag(series(24, (i) => i === 2 ? 84 : 80))).toBe(false);
  });
});
