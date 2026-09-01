import { describe, expect, it } from 'vitest';
import { EXERCISES, WEEK, WORKOUTS, slotVariants } from '../src/data/plan';
import { MUSCLE_IDS } from '../src/data/types';

describe('plan data integrity', () => {
  it('has unique exercise ids', () => {
    const ids = EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every workout slot has at least one exercise', () => {
    for (const w of WORKOUTS)
      for (const slot of w.slots)
        expect(slotVariants(slot).length, `slot ${slot}`).toBeGreaterThan(0);
  });

  it('every exercise belongs to a slot used by exactly one workout', () => {
    for (const ex of EXERCISES) {
      const owners = WORKOUTS.filter((w) => w.slots.includes(ex.slot));
      expect(owners.length, `exercise ${ex.id}`).toBe(1);
    }
  });

  it('week has 7 days and references real workouts', () => {
    expect(WEEK.length).toBe(7);
    for (const day of WEEK)
      if (day.kind === 'workout')
        expect(WORKOUTS.some((w) => w.id === day.workoutId)).toBe(true);
  });

  it('pins the week\'s day-to-workout mapping', () => {
    expect(WEEK[0].kind).toBe('rest');
    expect(WEEK[1].kind).toBe('workout');
    expect((WEEK[1] as { workoutId: string }).workoutId).toBe('upperA');
    expect(WEEK[2].kind).toBe('workout');
    expect((WEEK[2] as { workoutId: string }).workoutId).toBe('lowerA');
    expect(WEEK[3].kind).toBe('cardio');
    expect(WEEK[4].kind).toBe('workout');
    expect((WEEK[4] as { workoutId: string }).workoutId).toBe('upperB');
    expect(WEEK[5].kind).toBe('rest');
    expect(WEEK[6].kind).toBe('workout');
    expect((WEEK[6] as { workoutId: string }).workoutId).toBe('lowerB');
  });

  it('muscle ids are valid and rep ranges sane', () => {
    for (const ex of EXERCISES) {
      for (const m of [...ex.primary, ...ex.secondary])
        expect(MUSCLE_IDS).toContain(m);
      expect(ex.primary.length).toBeGreaterThan(0);
      expect(ex.repMin).toBeLessThanOrEqual(ex.repMax);
      expect(ex.sets).toBeGreaterThan(0);
      expect(ex.cues.length).toBeGreaterThanOrEqual(3);
      for (const h of ex.hints)
        expect(h.points.length).toBeGreaterThanOrEqual(h.kind === 'arrow' ? 2 : 3);
    }
  });
});
