import type { SetLog } from '../data/types';

/** Derived motivation stats — everything computes from the append-only logs. */

const DAY = 24 * 60 * 60 * 1000;
const AVG_SET_SEC = 45;

const toDate = (s: string) => new Date(s + 'T00:00:00');
const fmt = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** Monday of the week containing `date` (local, Monday-based weeks). */
export function weekStart(date: string): string {
  const d = toDate(date);
  const dow = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - dow);
  return fmt(d);
}

/** Mon..Sun date strings of the week containing `date`. */
export function weekDates(date: string): string[] {
  const start = toDate(weekStart(date));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return fmt(d);
  });
}

export function isoWeekNumber(date: string): number {
  const d = new Date(Date.UTC(...(date.split('-').map(Number) as [number, number, number]).map((v, i) => (i === 1 ? v - 1 : v)) as [number, number, number]));
  const dow = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dow); // nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / DAY + 1) / 7);
}

/** Distinct dates with any logged set inside the week of `date`, ascending. */
export function liftDatesInWeek(logs: SetLog[], date: string): string[] {
  const days = new Set(weekDates(date));
  return [...new Set(logs.filter((l) => days.has(l.date)).map((l) => l.date))].sort();
}

/**
 * Consecutive weeks meeting `planned` lift days, counting back from the
 * current week (which joins the streak once it meets the target itself).
 */
export function weekStreak(logs: SetLog[], today: string, planned: number): number {
  let streak = 0;
  let cursor = today;
  if (liftDatesInWeek(logs, cursor).length >= planned) streak++;
  for (;;) {
    const prev = fmt(new Date(toDate(weekStart(cursor)).getTime() - DAY));
    if (liftDatesInWeek(logs, prev).length >= planned) {
      streak++;
      cursor = prev;
    } else {
      return streak;
    }
  }
}

/** Total kg lifted (weight x reps) in the week of `date`. */
export function weeklyVolume(logs: SetLog[], date: string): number {
  const days = new Set(weekDates(date));
  return logs.filter((l) => days.has(l.date)).reduce((s, l) => s + l.weightKg * l.reps, 0);
}

interface TopSet { weightKg: number; reps: number; date: string }

/** a beats b? Lexicographic on (weight, reps); assisted inverts the weight axis. */
function beats(a: TopSet, b: TopSet, assisted: boolean): boolean {
  if (a.weightKg !== b.weightKg) return assisted ? a.weightKg < b.weightKg : a.weightKg > b.weightKg;
  return a.reps > b.reps;
}

function topSet(sets: SetLog[], assisted: boolean): TopSet | null {
  let best: TopSet | null = null;
  for (const s of sets) {
    const c = { weightKg: s.weightKg, reps: s.reps, date: s.date };
    if (!best || beats(c, best, assisted)) best = c;
  }
  return best;
}

/** All-time best top set for an exercise, or null without history. */
export function bestSet(logs: SetLog[], exerciseId: string, assisted: boolean): TopSet | null {
  return topSet(logs.filter((l) => l.exerciseId === exerciseId), assisted);
}

/** Count of exercises whose top set this week strictly beats all prior sessions. */
export function newBestsThisWeek(logs: SetLog[], date: string, assistedIds: Set<string>): number {
  const days = new Set(weekDates(date));
  const ids = [...new Set(logs.filter((l) => days.has(l.date)).map((l) => l.exerciseId))];
  let count = 0;
  for (const id of ids) {
    const assisted = assistedIds.has(id);
    const thisWeek = topSet(logs.filter((l) => l.exerciseId === id && days.has(l.date)), assisted);
    const prior = topSet(logs.filter((l) => l.exerciseId === id && !days.has(l.date) && l.date < date), assisted);
    if (thisWeek && prior && beats(thisWeek, prior, assisted)) count++;
  }
  return count;
}

/** Last `n` sessions' top weights for an exercise, chronological. */
export function topWeights(logs: SetLog[], exerciseId: string, n: number): number[] {
  const byDate = new Map<string, number[]>();
  for (const l of logs) {
    if (l.exerciseId !== exerciseId) continue;
    const arr = byDate.get(l.date) ?? [];
    arr.push(l.weightKg);
    byDate.set(l.date, arr);
  }
  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-n)
    .map(([, ws]) => Math.max(...ws));
}

/** Rough time to finish: each remaining set costs ~45s of work plus its rest. */
export function sessionEtaMin(remainingSets: { restSec: number }[]): number {
  const sec = remainingSets.reduce((s, r) => s + AVG_SET_SEC + r.restSec, 0);
  return Math.round(sec / 60);
}
