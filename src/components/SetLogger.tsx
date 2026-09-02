import { useEffect, useMemo, useRef, useState } from 'react';
import type { Exercise, SetLog, UserData } from '../data/types';
import { lastSession } from '../logic/sessions';
import { suggestNext } from '../logic/progression';
import { todayStr } from '../logic/dates';
import Icon from './Icon';

interface Props {
  exercise: Exercise;
  data: UserData;
  update(fn: (d: UserData) => UserData): void;
  onSetLogged(restSec: number): void;
}

interface RowState { weightKg: number; reps: number }

interface WeightInputProps {
  value: number;
  label: string;
  onCommit(v: number): void;
  onDraftChange(v: string): void;
}

function WeightInput({ value, label, onCommit, onDraftChange }: WeightInputProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  return (
    <input
      inputMode="decimal"
      aria-label={label}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        onDraftChange(e.target.value);
      }}
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
  // Holds each row's in-progress (not-yet-blurred) weight text, kept in sync on every
  // keystroke via a ref rather than state so it is readable synchronously — a sibling
  // button's click fires in the same batch as the input's blur, before React has
  // re-rendered with the blur's committed value, so state reads there would be stale.
  const weightDraftRef = useRef<Record<number, string>>({});

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

  // Freshest weight for row i: prefers the in-progress typed draft (if any and
  // parseable) over the last-committed row state, so an un-blurred edit isn't lost.
  const resolveWeight = (i: number, fallback: number): number => {
    const raw = weightDraftRef.current[i];
    if (raw === undefined) return fallback;
    const parsed = parseFloat(raw);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const commitWeight = (i: number, weightKg: number) => {
    delete weightDraftRef.current[i];
    setRow(i, { weightKg });
  };

  const logSet = (i: number) => {
    const s = rowState(i);
    const weightKg = resolveWeight(i, s.weightKg);
    delete weightDraftRef.current[i];
    update((d) => ({
      ...d,
      setLogs: [...d.setLogs, { date: today, exerciseId: exercise.id, setIndex: i, weightKg, reps: s.reps }],
    }));
    onSetLogged(exercise.restSec);
  };

  // A mis-logged set must be correctable: tapping a done row removes the log
  // entry and reopens the row prefilled with the logged values.
  const reopenSet = (i: number, done: SetLog) => {
    update((d) => ({
      ...d,
      setLogs: d.setLogs.filter(
        (l) => !(l.date === today && l.exerciseId === exercise.id && l.setIndex === i),
      ),
    }));
    setRow(i, { weightKg: done.weightKg, reps: done.reps });
  };

  return (
    <div className="set-logger">
      {suggestion.nudge && (
        <div className="nudge">
          <Icon name="trend" />
          <span>{suggestion.nudge}</span>
        </div>
      )}
      <div className="load-label">
        {showWeight ? `${loadLabel ? `${loadLabel} · ` : ''}kg × reps` : 'reps only'}
      </div>
      {Array.from({ length: totalRows }, (_, i) => {
        const done = loggedToday.find((l) => l.setIndex === i);
        if (done) {
          const summary = `${showWeight ? `${done.weightKg} kg × ` : ''}${done.reps} reps`;
          return (
            <button
              key={i}
              className="set-row done"
              onClick={() => reopenSet(i, done)}
              aria-label={`Set ${i + 1} logged: ${summary}. Tap to edit.`}
            >
              <span className="done-check"><Icon name="check" /> Set {i + 1}</span>
              <span className="done-summary">{summary}</span>
              <span className="done-edit"><Icon name="edit" /></span>
            </button>
          );
        }
        const s = rowState(i);
        return (
          <div key={i} className="set-row">
            <span className="set-label">Set {i + 1}</span>
            {showWeight && (
              <span className="stepper">
                <button
                  aria-label={`Decrease weight, set ${i + 1}`}
                  onClick={() => commitWeight(i, Math.max(0, resolveWeight(i, s.weightKg) - 0.5))}
                ><Icon name="minus" /></button>
                <WeightInput
                  value={s.weightKg}
                  label={`Weight in kilograms, set ${i + 1}`}
                  onCommit={(v) => commitWeight(i, v)}
                  onDraftChange={(v) => { weightDraftRef.current[i] = v; }}
                />
                <button
                  aria-label={`Increase weight, set ${i + 1}`}
                  onClick={() => commitWeight(i, resolveWeight(i, s.weightKg) + 0.5)}
                ><Icon name="plus" /></button>
              </span>
            )}
            <span className="stepper">
              <button
                aria-label={`Decrease reps, set ${i + 1}`}
                onClick={() => setRow(i, { reps: Math.max(0, s.reps - 1) })}
              ><Icon name="minus" /></button>
              <input
                inputMode="numeric"
                aria-label={`Reps, set ${i + 1}`}
                value={s.reps}
                onChange={(e) => setRow(i, { reps: Number(e.target.value) || 0 })}
              />
              <button
                aria-label={`Increase reps, set ${i + 1}`}
                onClick={() => setRow(i, { reps: s.reps + 1 })}
              ><Icon name="plus" /></button>
            </span>
            <button className="tick" aria-label={`Log set ${i + 1}`} onClick={() => logSet(i)}>
              <Icon name="check" />
            </button>
          </div>
        );
      })}
      <button className="add-set" onClick={() => setExtraSets((n) => n + 1)}>
        <Icon name="plus" /> set
      </button>
    </div>
  );
}
