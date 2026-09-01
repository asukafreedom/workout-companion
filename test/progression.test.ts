import { describe, expect, it } from 'vitest';
import { suggestNext } from '../src/logic/progression';
import { exerciseById } from '../src/data/plan';
import type { SetLog } from '../src/data/types';

const S = (setIndex: number, weightKg: number, reps: number): SetLog =>
  ({ date: '2026-08-24', exerciseId: 'x', setIndex, weightKg, reps });

describe('suggestNext', () => {
  it('no history: zeros at bottom of range, no nudge', () => {
    const ex = exerciseById('db-press'); // 3 x 6-10, dumbbell
    const r = suggestNext(ex, []);
    expect(r.prefill).toEqual([
      { weightKg: 0, reps: 6 }, { weightKg: 0, reps: 6 }, { weightKg: 0, reps: 6 },
    ]);
    expect(r.nudge).toBeNull();
  });

  it('mid-progress: mirrors last session, no nudge', () => {
    const ex = exerciseById('db-press');
    const r = suggestNext(ex, [S(0, 25, 10), S(1, 25, 9), S(2, 25, 8)]);
    expect(r.prefill).toEqual([
      { weightKg: 25, reps: 10 }, { weightKg: 25, reps: 9 }, { weightKg: 25, reps: 8 },
    ]);
    expect(r.nudge).toBeNull();
  });

  it('pads short last session to ex.sets', () => {
    const ex = exerciseById('db-press');
    const r = suggestNext(ex, [S(0, 25, 8), S(1, 25, 8)]);
    expect(r.prefill).toHaveLength(3);
    expect(r.prefill[2]).toEqual({ weightKg: 25, reps: 8 });
    expect(r.nudge).toBeNull(); // fewer sets than prescribed never triggers progression
  });

  it('all sets at top of range: bumps weight, resets reps, nudges', () => {
    const ex = exerciseById('db-press'); // repMax 10
    const r = suggestNext(ex, [S(0, 25, 10), S(1, 25, 10), S(2, 25, 10)]);
    expect(r.prefill).toEqual([
      { weightKg: 27.5, reps: 6 }, { weightKg: 27.5, reps: 6 }, { weightKg: 27.5, reps: 6 },
    ]);
    expect(r.nudge).toContain('27.5');
  });

  it('assisted: progression reduces assist weight, floored at 0', () => {
    const ex = exerciseById('assisted-pullup'); // 3 x 8-12
    const r = suggestNext(ex, [S(0, 2, 12), S(1, 2, 12), S(2, 2, 12)]);
    expect(r.prefill[0].weightKg).toBe(0);
    expect(r.nudge).toContain('assist');
  });

  it('bodyweight: weight stays 0, nudge suggests reps', () => {
    const ex = exerciseById('hanging-knee-raise'); // 3 x 8-15
    const r = suggestNext(ex, [S(0, 0, 15), S(1, 0, 15), S(2, 0, 15)]);
    expect(r.prefill[0]).toEqual({ weightKg: 0, reps: 8 });
    expect(r.nudge).not.toBeNull();
  });
});
