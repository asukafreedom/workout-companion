import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY, emptyData, loadData, saveData } from '../src/storage/store';
import { todayStr } from '../src/logic/dates';

function fakeLocalStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    key: (i: number) => [...m.keys()][i] ?? null,
    get length() { return m.size; },
  } as Storage;
}

function recoveryEntries(): [string, string][] {
  const entries: [string, string][] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith(STORAGE_KEY + '_recovery_')) entries.push([k, localStorage.getItem(k)!]);
  }
  return entries;
}

beforeEach(() => {
  (globalThis as any).localStorage = fakeLocalStorage();
});

describe('store', () => {
  it('returns empty data when nothing stored', () => {
    const d = loadData();
    expect(d.version).toBe(1);
    expect(d.setLogs).toEqual([]);
    expect(d.bodyWeights).toEqual([]);
    expect(d.settings.restTimerSound).toBe(true);
  });

  it('round-trips save/load', () => {
    const d = emptyData();
    d.setLogs.push({ date: '2026-09-01', exerciseId: 'db-curl', setIndex: 0, weightKg: 10, reps: 12 });
    saveData(d);
    expect(loadData().setLogs).toHaveLength(1);
  });

  it('preserves corrupt data under a recovery key and starts fresh', () => {
    localStorage.setItem(STORAGE_KEY, '{not json!!');
    const d = loadData();
    expect(d.setLogs).toEqual([]);
    const entries = recoveryEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0][1]).toBe('{not json!!');
  });

  it('treats wrong-shaped data as corrupt', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, hello: true }));
    const d = loadData();
    expect(d.version).toBe(1);
    expect(recoveryEntries()).toHaveLength(1);
  });
});

describe('todayStr', () => {
  it('formats local date as YYYY-MM-DD', () => {
    expect(todayStr(new Date(2026, 8, 1))).toBe('2026-09-01');
    expect(todayStr(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
