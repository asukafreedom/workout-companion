import { describe, expect, it } from 'vitest';
import { exportJson, mergeImport } from '../src/storage/exportImport';
import { emptyData } from '../src/storage/store';

function withLog(weightKg: number) {
  const d = emptyData();
  d.setLogs.push({ date: '2026-09-01', exerciseId: 'db-curl', setIndex: 0, weightKg, reps: 12 });
  d.bodyWeights.push({ date: '2026-09-01', kg: 80 });
  return d;
}

describe('export/import', () => {
  it('round-trips through JSON', () => {
    const merged = mergeImport(emptyData(), JSON.parse(exportJson(withLog(10))));
    expect(merged.setLogs).toHaveLength(1);
    expect(merged.bodyWeights).toHaveLength(1);
  });

  it('current wins on conflicts; union otherwise', () => {
    const current = withLog(12.5);
    const imported = withLog(10);
    imported.setLogs.push({ date: '2026-08-24', exerciseId: 'db-curl', setIndex: 0, weightKg: 10, reps: 10 });
    const merged = mergeImport(current, imported);
    expect(merged.setLogs).toHaveLength(2);
    const conflicting = merged.setLogs.find((l) => l.date === '2026-09-01')!;
    expect(conflicting.weightKg).toBe(12.5);
  });

  it('does not mutate inputs', () => {
    const current = withLog(12.5);
    const imported = withLog(10);
    mergeImport(current, imported);
    expect(current.setLogs).toHaveLength(1);
  });

  it('rejects malformed input', () => {
    expect(() => mergeImport(emptyData(), { nope: 1 })).toThrow('Invalid backup file');
    expect(() => mergeImport(emptyData(), null)).toThrow('Invalid backup file');
  });
});
