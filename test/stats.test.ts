import { describe, expect, it } from 'vitest';
import {
  bestSet, isoWeekNumber, liftDatesInWeek, sessionEtaMin, topWeights,
  weekDates, weekStart, weekStreak, weeklyVolume, newBestsThisWeek,
} from '../src/logic/stats';
import type { SetLog } from '../src/data/types';

const L = (date: string, exerciseId: string, setIndex: number, weightKg: number, reps: number): SetLog =>
  ({ date, exerciseId, setIndex, weightKg, reps });

describe('week helpers', () => {
  it('weekStart returns the Monday of the week (Monday-based)', () => {
    expect(weekStart('2026-09-03')).toBe('2026-08-31'); // Thu -> Mon
    expect(weekStart('2026-08-31')).toBe('2026-08-31'); // Mon -> itself
    expect(weekStart('2026-09-06')).toBe('2026-08-31'); // Sun -> previous Mon
  });
  it('weekDates lists Mon..Sun', () => {
    const d = weekDates('2026-09-03');
    expect(d[0]).toBe('2026-08-31');
    expect(d[6]).toBe('2026-09-06');
    expect(d).toHaveLength(7);
  });
  it('isoWeekNumber matches ISO 8601', () => {
    expect(isoWeekNumber('2026-09-03')).toBe(36);
    expect(isoWeekNumber('2026-01-01')).toBe(1);
  });
});

describe('liftDatesInWeek / weekStreak', () => {
  const logs = [
    L('2026-08-31', 'a', 0, 20, 10), L('2026-08-31', 'a', 1, 20, 10), // Mon
    L('2026-09-01', 'b', 0, 30, 8),  // Tue
    L('2026-08-24', 'a', 0, 20, 10), L('2026-08-25', 'b', 0, 20, 10),
    L('2026-08-27', 'a', 0, 20, 10), L('2026-08-29', 'b', 0, 20, 10), // prev week: 4 days
  ];
  it('counts distinct lift dates in the week', () => {
    expect(liftDatesInWeek(logs, '2026-09-03')).toEqual(['2026-08-31', '2026-09-01']);
  });
  it('streak counts consecutive full weeks before the current one', () => {
    // prev week hit 4 planned days; week before that had nothing
    expect(weekStreak(logs, '2026-09-03', 4)).toBe(1);
  });
  it('current week joins the streak once it meets the target', () => {
    const full = [...logs, L('2026-09-02', 'a', 0, 20, 10), L('2026-09-03', 'b', 0, 20, 10)];
    expect(weekStreak(full, '2026-09-03', 4)).toBe(2);
  });
});

describe('volume and bests', () => {
  const logs = [
    L('2026-08-31', 'a', 0, 20, 10), L('2026-08-31', 'a', 1, 20, 8),
    L('2026-08-24', 'a', 0, 20, 10), // last week: top 20x10
    L('2026-09-01', 'a', 0, 22.5, 8), // this week beats it
    L('2026-09-01', 'assist', 0, 20, 8),
    L('2026-08-25', 'assist', 0, 15, 8), // prior assist BETTER (lower)
  ];
  it('weeklyVolume sums weight x reps within the week', () => {
    expect(weeklyVolume(logs, '2026-09-03')).toBe(20 * 10 + 20 * 8 + 22.5 * 8 + 20 * 8);
  });
  it('newBestsThisWeek counts strict improvements, honoring assisted direction', () => {
    expect(newBestsThisWeek(logs, '2026-09-03', new Set(['assist']))).toBe(1); // only 'a'
  });
  it('bestSet returns best top set with date (assisted: lowest assist wins)', () => {
    expect(bestSet(logs, 'a', false)).toEqual({ weightKg: 22.5, reps: 8, date: '2026-09-01' });
    expect(bestSet(logs, 'assist', true)).toEqual({ weightKg: 15, reps: 8, date: '2026-08-25' });
    expect(bestSet(logs, 'nope', false)).toBeNull();
  });
});

describe('topWeights / sessionEtaMin', () => {
  it('returns last n session top weights in chronological order', () => {
    const logs = [
      L('2026-08-20', 'a', 0, 20, 10), L('2026-08-22', 'a', 0, 22.5, 8),
      L('2026-08-24', 'a', 0, 22.5, 10), L('2026-08-26', 'a', 0, 25, 8),
    ];
    expect(topWeights(logs, 'a', 3)).toEqual([22.5, 22.5, 25]);
  });
  it('ETA = remaining sets x (45s + rest) rounded to minutes', () => {
    expect(sessionEtaMin([{ restSec: 90 }, { restSec: 90 }, { restSec: 120 }])).toBe(7); // 135+135+165=435s
  });
});
