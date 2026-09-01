import type { SetLog } from '../data/types';

export function lastSession(logs: SetLog[], exerciseId: string, excludeDate?: string): SetLog[] {
  const mine = logs.filter((l) => l.exerciseId === exerciseId && l.date !== excludeDate);
  if (mine.length === 0) return [];
  const latest = mine.reduce((a, b) => (b.date > a ? b.date : a), mine[0].date);
  return mine.filter((l) => l.date === latest).sort((a, b) => a.setIndex - b.setIndex);
}

export function sessionHistory(logs: SetLog[], exerciseId: string): { date: string; topWeightKg: number }[] {
  const byDate = new Map<string, number>();
  for (const l of logs) {
    if (l.exerciseId !== exerciseId) continue;
    byDate.set(l.date, Math.max(byDate.get(l.date) ?? -Infinity, l.weightKg));
  }
  return [...byDate.entries()]
    .map(([date, topWeightKg]) => ({ date, topWeightKg }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function completedSets(logs: SetLog[], exerciseId: string, date: string): number {
  return logs.filter((l) => l.exerciseId === exerciseId && l.date === date).length;
}
