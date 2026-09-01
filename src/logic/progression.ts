import type { Exercise, SetLog } from '../data/types';

export interface Prefill { weightKg: number; reps: number }

const INCREMENT = 2.5;

export function suggestNext(ex: Exercise, last: SetLog[]): { prefill: Prefill[]; nudge: string | null } {
  if (last.length === 0) {
    return {
      prefill: Array.from({ length: ex.sets }, () => ({ weightKg: 0, reps: ex.repMin })),
      nudge: null,
    };
  }

  const hitTopEverywhere = last.length >= ex.sets && last.every((s) => s.reps >= ex.repMax);

  if (!hitTopEverywhere) {
    const prefill = Array.from({ length: ex.sets }, (_, i) => {
      const src = last[Math.min(i, last.length - 1)];
      return { weightKg: src.weightKg, reps: src.reps };
    });
    return { prefill, nudge: null };
  }

  const w = last[0].weightKg;
  if (ex.loadType === 'bodyweight') {
    return {
      prefill: Array.from({ length: ex.sets }, () => ({ weightKg: 0, reps: ex.repMin })),
      nudge: `You hit ${ex.sets}×${ex.repMax} — add a rep or slow the tempo today.`,
    };
  }
  if (ex.loadType === 'assisted') {
    const next = Math.max(0, w - INCREMENT);
    return {
      prefill: Array.from({ length: ex.sets }, () => ({ weightKg: next, reps: ex.repMin })),
      nudge: `You hit ${ex.sets}×${ex.repMax} — reduce the assist to ${next} kg (lower = stronger).`,
    };
  }
  const next = w + INCREMENT;
  const per = ex.loadType === 'dumbbell' ? ' per dumbbell' : '';
  return {
    prefill: last.slice(0, ex.sets).map((s) => ({ weightKg: s.weightKg + INCREMENT, reps: ex.repMin })),
    nudge: `You owned ${ex.sets}×${ex.repMax} @ ${w} kg — try ${next} kg${per} today.`,
  };
}
