import { useEffect, useMemo, useState } from 'react';
import type { Exercise, UserData } from '../data/types';
import { lastSession } from '../logic/sessions';
import { suggestNext } from '../logic/progression';
import { todayStr } from '../logic/dates';

interface Props {
  exercise: Exercise;
  data: UserData;
  update(fn: (d: UserData) => UserData): void;
  onSetLogged(restSec: number): void;
}

interface RowState { weightKg: number; reps: number }

function WeightInput({ value, onCommit }: { value: number; onCommit(v: number): void }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  return (
    <input
      inputMode="decimal"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const parsed = parseFloat(draft);
        if (!Number.isNaN(parsed)) onCommit(parsed);
        else setDraft(String(value));
      }}
    />
  );
}

export default function SetLogger({ exercise, data, update, onSetLogged }: Props) {
  const today = todayStr();
  const last = useMemo(() => lastSession(data.setLogs, exercise.id, today), [data.setLogs, exercise.id, today]);
  const suggestion = useMemo(() => suggestNext(exercise, last), [exercise, last]);
  const loggedToday = data.setLogs
    .filter((l) => l.exerciseId === exercise.id && l.date === today)
    .sort((a, b) => a.setIndex - b.setIndex);

  const [extraSets, setExtraSets] = useState(0);
  const [rows, setRows] = useState<RowState[]>(() => suggestion.prefill.map((p) => ({ ...p })));

  const totalRows = Math.max(exercise.sets + extraSets, loggedToday.length);
  const showWeight = exercise.loadType !== 'bodyweight';
  const loadLabel =
    exercise.loadType === 'dumbbell' ? 'per dumbbell' :
    exercise.loadType === 'machine' ? 'machine stack' :
    exercise.loadType === 'total' ? 'total weight' :
    exercise.loadType === 'assisted' ? 'assist weight (lower = stronger)' : '';

  const rowState = (i: number): RowState =>
    rows[i] ?? rows[rows.length - 1] ?? { weightKg: 0, reps: exercise.repMin };

  const setRow = (i: number, patch: Partial<RowState>) =>
    setRows((r) => {
      const next = [...r];
      while (next.length <= i) next.push({ ...rowState(next.length - 1) });
      next[i] = { ...next[i], ...patch };
      return next;
    });

  const logSet = (i: number) => {
    const s = rowState(i);
    update((d) => ({
      ...d,
      setLogs: [...d.setLogs, { date: today, exerciseId: exercise.id, setIndex: i, weightKg: s.weightKg, reps: s.reps }],
    }));
    onSetLogged(exercise.restSec);
  };

  return (
    <div className="set-logger">
      {suggestion.nudge && <div className="nudge">{suggestion.nudge}</div>}
      {loadLabel && <div className="load-label">{loadLabel}</div>}
      {Array.from({ length: totalRows }, (_, i) => {
        const done = loggedToday.find((l) => l.setIndex === i);
        if (done) {
          return (
            <div key={i} className="set-row done">
              <span>Set {i + 1}</span>
              <span>{showWeight ? `${done.weightKg} kg × ` : ''}{done.reps} reps ✓</span>
            </div>
          );
        }
        const s = rowState(i);
        return (
          <div key={i} className="set-row">
            <span className="set-label">Set {i + 1}</span>
            {showWeight && (
              <span className="stepper">
                <button onClick={() => setRow(i, { weightKg: Math.max(0, s.weightKg - 0.5) })}>−</button>
                <WeightInput value={s.weightKg} onCommit={(v) => setRow(i, { weightKg: v })} />
                <button onClick={() => setRow(i, { weightKg: s.weightKg + 0.5 })}>+</button>
                <span className="unit">kg</span>
              </span>
            )}
            <span className="stepper">
              <button onClick={() => setRow(i, { reps: Math.max(0, s.reps - 1) })}>−</button>
              <input inputMode="numeric" value={s.reps} onChange={(e) => setRow(i, { reps: Number(e.target.value) || 0 })} />
              <button onClick={() => setRow(i, { reps: s.reps + 1 })}>+</button>
            </span>
            <button className="tick" onClick={() => logSet(i)}>✓</button>
          </div>
        );
      })}
      <button className="add-set" onClick={() => setExtraSets((n) => n + 1)}>+ set</button>
    </div>
  );
}
