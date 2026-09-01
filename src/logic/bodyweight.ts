import type { BodyWeight } from '../data/types';

const DAY = 24 * 60 * 60 * 1000;
const t = (date: string) => new Date(date + 'T00:00:00').getTime();

function dedupe(entries: BodyWeight[]): BodyWeight[] {
  const m = new Map<string, number>();
  for (const e of entries) m.set(e.date, e.kg); // later entries win
  return [...m.entries()].map(([date, kg]) => ({ date, kg })).sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function rollingAverage(entries: BodyWeight[], windowDays = 7): { date: string; avg: number }[] {
  const sorted = dedupe(entries);
  return sorted.map((e) => {
    const from = t(e.date) - (windowDays - 1) * DAY;
    const win = sorted.filter((x) => t(x.date) >= from && t(x.date) <= t(e.date));
    const avg = win.reduce((s, x) => s + x.kg, 0) / win.length;
    return { date: e.date, avg: Math.round(avg * 100) / 100 };
  });
}

export function plateauFlag(entries: BodyWeight[]): boolean {
  const sorted = dedupe(entries);
  if (sorted.length < 10) return false;
  const latest = t(sorted[sorted.length - 1].date);
  const span = latest - t(sorted[0].date);
  if (span < 21 * DAY) return false;
  const mean = (from: number, to: number) => {
    const win = sorted.filter((x) => t(x.date) >= from && t(x.date) <= to);
    return win.length ? win.reduce((s, x) => s + x.kg, 0) / win.length : NaN;
  };
  const recent = mean(latest - 6 * DAY, latest);
  const old = mean(latest - 20 * DAY, latest - 14 * DAY);
  if (Number.isNaN(recent) || Number.isNaN(old)) return false;
  return Math.abs(recent - old) < 0.25;
}
