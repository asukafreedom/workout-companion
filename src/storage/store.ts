import type { UserData } from '../data/types';

export const STORAGE_KEY = 'workout-companion-v1';

export function emptyData(): UserData {
  return { version: 1, setLogs: [], bodyWeights: [], settings: { restTimerSound: true } };
}

function isValid(d: unknown): d is UserData {
  const x = d as UserData;
  return (
    !!x && x.version === 1 && Array.isArray(x.setLogs) &&
    Array.isArray(x.bodyWeights) && typeof x.settings === 'object' && x.settings !== null
  );
}

export function loadData(): UserData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return emptyData();
  try {
    const parsed = JSON.parse(raw);
    if (isValid(parsed)) return parsed;
  } catch {
    // fall through to recovery
  }
  localStorage.setItem(STORAGE_KEY + '_recovery_' + Date.now(), raw);
  return emptyData();
}

export function saveData(d: UserData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch (err) {
    console.error('Failed to save workout data', err);
  }
}
