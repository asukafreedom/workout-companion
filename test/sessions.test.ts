import { describe, expect, it } from 'vitest';
import { completedSets, lastSession, sessionHistory } from '../src/logic/sessions';
import type { SetLog } from '../src/data/types';

const L = (date: string, exerciseId: string, setIndex: number, weightKg: number, reps: number): SetLog =>
  ({ date, exerciseId, setIndex, weightKg, reps });

const logs: SetLog[] = [
  L('2026-08-24', 'db-press', 0, 25, 8), L('2026-08-24', 'db-press', 1, 25, 8), L('2026-08-24', 'db-press', 2, 25, 7),
  L('2026-08-31', 'db-press', 1, 25, 9), L('2026-08-31', 'db-press', 0, 25, 10),
  L('2026-08-31', 'db-curl', 0, 10, 12),
];

describe('lastSession', () => {
  it('returns most recent date sets sorted by setIndex', () => {
    const s = lastSession(logs, 'db-press');
    expect(s.map((x) => [x.setIndex, x.reps])).toEqual([[0, 10], [1, 9]]);
  });
  it('can exclude today (mid-session)', () => {
    const s = lastSession(logs, 'db-press', '2026-08-31');
    expect(s[0].date).toBe('2026-08-24');
    expect(s).toHaveLength(3);
  });
  it('returns [] when no history', () => {
    expect(lastSession(logs, 'squat')).toEqual([]);
  });
});

describe('sessionHistory', () => {
  it('one ascending point per date with top weight', () => {
    expect(sessionHistory(logs, 'db-press')).toEqual([
      { date: '2026-08-24', topWeightKg: 25 },
      { date: '2026-08-31', topWeightKg: 25 },
    ]);
  });
});

describe('completedSets', () => {
  it('counts sets logged on a date', () => {
    expect(completedSets(logs, 'db-press', '2026-08-31')).toBe(2);
    expect(completedSets(logs, 'db-press', '2026-09-01')).toBe(0);
  });
});
