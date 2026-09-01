import type { BodyWeight, SetLog, UserData } from '../data/types';

export function exportJson(d: UserData): string {
  return JSON.stringify(d, null, 2);
}

function isBackup(x: unknown): x is UserData {
  const d = x as UserData;
  return !!d && d.version === 1 && Array.isArray(d.setLogs) && Array.isArray(d.bodyWeights);
}

export function mergeImport(current: UserData, imported: unknown): UserData {
  if (!isBackup(imported)) throw new Error('Invalid backup file');

  const logKey = (l: SetLog) => `${l.date}|${l.exerciseId}|${l.setIndex}`;
  const logs = new Map<string, SetLog>();
  for (const l of imported.setLogs) logs.set(logKey(l), l);
  for (const l of current.setLogs) logs.set(logKey(l), l); // current wins

  const bw = new Map<string, BodyWeight>();
  for (const b of imported.bodyWeights) bw.set(b.date, b);
  for (const b of current.bodyWeights) bw.set(b.date, b);

  return {
    version: 1,
    setLogs: [...logs.values()].sort((a, b) => (a.date < b.date ? -1 : 1)),
    bodyWeights: [...bw.values()].sort((a, b) => (a.date < b.date ? -1 : 1)),
    settings: { ...current.settings },
  };
}
