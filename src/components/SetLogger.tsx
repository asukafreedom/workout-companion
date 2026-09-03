import { useEffect, useMemo, useRef, useState } from 'react';
import type { Exercise, SetLog, UserData } from '../data/types';
import { lastSession } from '../logic/sessions';
import { suggestNext } from '../logic/progression';
import { bestSet } from '../logic/stats';
import { todayStr } from '../logic/dates';
import Icon from './Icon';

interface Props {
  exercise: Exercise;
  data: UserData;
  update(fn: (d: UserData) => UserData): void;
  onSetLogged(restSec: number, nextLabel: string | null): void;
}

interface RowState { weightKg: number; reps: number }

function BigValueInput({ value, label, onCommit, onDraftChange }: {
  value: number;
  label: string;
  onCommit(v: number): void;
  onDraftChange(v: string): void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return (
    <input
      className="field-value"
      inputMode="decimal"
      aria-label={label}
      value={draft}
      onChange={(e) => { setDraft(e.target.value); onDraftChange(e.target.value); }}
      onBlur={() => {
        const parsed = parseFloat(draft);
        if (!Number.isNaN(parsed)) onCommit(parsed);
        else setDraft(String(value));
      }}
    />
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

export default function SetLogger({ exercise, data, update, onSetLogged }: Props) {
  const today = todayStr();
  const last = useMemo(() => lastSession(data.setLogs, exercise.id, today), [data.setLogs, exercise.id, today]);
  const suggestion = useMemo(() => suggestNext(exercise, last), [exercise, last]);
  const best = useMemo(
    () => bestSet(data.setLogs, exercise.id, exercise.loadType === 'assisted'),
    [data.setLogs, exercise.id, exercise.loadType],
  );
  const loggedToday = data.setLogs
    .filter((l) => l.exerciseId === exercise.id && l.date === today)
    .sort((a, b) => a.setIndex - b.setIndex);

  const [extraSets, setExtraSets] = useState(0);
  const [rows, setRows] = useState<RowState[]>(() => suggestion.prefill.map((p) => ({ ...p })));
  // In-progress typed weight per row, readable synchronously (blur and a sibling
  // button's click land in the same React batch).
  const weightDraftRef = useRef<Record<number, string>>({});

  const totalRows = Math.max(exercise.sets + extraSets, loggedToday.length);
  const showWeight = exercise.loadType !== 'bodyweight';
  const firstOpen = (() => {
    for (let i = 0; i < totalRows; i++) if (!loggedToday.some((l) => l.setIndex === i)) return i;
    return -1;
  })();

  const rowState = (i: number): RowState =>
    rows[i] ?? rows[rows.length - 1] ?? { weightKg: 0, reps: exercise.repMin };

  const setRow = (i: number, patch: Partial<RowState>) =>
    setRows((r) => {
      const next = [...r];
      while (next.length <= i) next.push({ ...rowState(next.length - 1) });
      next[i] = { ...next[i], ...patch };
      return next;
    });

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
    const hasNext = i + 1 < totalRows;
    const n = rowState(i + 1);
    onSetLogged(
      exercise.restSec,
      hasNext ? `Next: Set ${i + 2} · ${showWeight ? `${n.weightKg} kg × ` : ''}${n.reps} reps` : null,
    );
  };

  const reopenSet = (i: number, done: SetLog) => {
    update((d) => ({
      ...d,
      setLogs: d.setLogs.filter(
        (l) => !(l.date === today && l.exerciseId === exercise.id && l.setIndex === i),
      ),
    }));
    setRow(i, { weightKg: done.weightKg, reps: done.reps });
  };

  // "Progression unlocked" card copy, derived from the suggestion + last session.
  const nudgeCard = (() => {
    if (!suggestion.nudge) return null;
    const lastW = last[0]?.weightKg ?? 0;
    if (exercise.loadType === 'bodyweight') {
      return {
        value: `${exercise.repMin}+`, unit: 'REPS',
        text: `You hit ${exercise.sets} × ${exercise.repMax} last session. Add a rep or slow the tempo today.`,
      };
    }
    if (exercise.loadType === 'assisted') {
      return {
        value: String(suggestion.prefill[0].weightKg), unit: 'KG',
        text: `You hit ${exercise.sets} × ${exercise.repMax} @ ${lastW} kg assist. Drop the assist 2.5 kg today.`,
      };
    }
    return {
      value: String(suggestion.prefill[0].weightKg), unit: 'KG',
      text: `You owned ${exercise.sets} × ${exercise.repMax} @ ${lastW} kg last session. Step up 2.5 kg today.`,
    };
  })();

  return (
    <div className="set-logger">
      {nudgeCard && (
        <div className="nudge-card">
          <span className="nudge-value">{nudgeCard.value}<em>{nudgeCard.unit}</em></span>
          <span className="nudge-copy">
            <span className="nudge-eyebrow">Progression unlocked</span>
            <span className="nudge-text">{nudgeCard.text}</span>
          </span>
        </div>
      )}

      <div className="list-head">
        <span>Sets</span>
        {best && <span>Best {showWeight ? `${best.weightKg} × ${best.reps}` : `${best.reps} reps`} · {shortDate(best.date)}</span>}
      </div>

      {Array.from({ length: totalRows }, (_, i) => {
        const done = loggedToday.find((l) => l.setIndex === i);
        if (done) {
          const summary = `${showWeight ? `${done.weightKg} kg × ` : ''}${done.reps} reps`;
          return (
            <button
              key={i}
              className="set-card done"
              onClick={() => reopenSet(i, done)}
              aria-label={`Set ${i + 1} logged: ${summary}. Tap to edit.`}
            >
              <span className="set-badge good"><Icon name="check" /></span>
              <span className="set-tag">Set {i + 1}</span>
              <span className="set-values">
                {showWeight && <>{done.weightKg} <em>KG</em><i>×</i></>}
                {done.reps} <em>REPS</em>
              </span>
              <span className="set-edit"><Icon name="edit" /></span>
            </button>
          );
        }

        const s = rowState(i);

        if (i === firstOpen) {
          return (
            <div key={i} className="set-card active">
              <div className="active-head">
                <span className="active-now">Set {i + 1} · Now</span>
                <span className="active-target">Target {exercise.repMin}–{exercise.repMax}</span>
              </div>
              <div className="active-fields">
                {showWeight && (
                  <div className="field">
                    <span className="field-label">KG</span>
                    <div className="field-box">
                      <button aria-label={`Decrease weight, set ${i + 1}`}
                        onClick={() => commitWeight(i, Math.max(0, resolveWeight(i, s.weightKg) - 0.5))}
                      ><Icon name="minus" /></button>
                      <BigValueInput
                        value={s.weightKg}
                        label={`Weight in kilograms, set ${i + 1}`}
                        onCommit={(v) => commitWeight(i, v)}
                        onDraftChange={(v) => { weightDraftRef.current[i] = v; }}
                      />
                      <button aria-label={`Increase weight, set ${i + 1}`}
                        onClick={() => commitWeight(i, resolveWeight(i, s.weightKg) + 0.5)}
                      ><Icon name="plus" /></button>
                    </div>
                  </div>
                )}
                <div className="field">
                  <span className="field-label">Reps</span>
                  <div className="field-box">
                    <button aria-label={`Decrease reps, set ${i + 1}`}
                      onClick={() => setRow(i, { reps: Math.max(0, s.reps - 1) })}
                    ><Icon name="minus" /></button>
                    <input
                      className="field-value"
                      inputMode="numeric"
                      aria-label={`Reps, set ${i + 1}`}
                      value={s.reps}
                      onChange={(e) => setRow(i, { reps: Number(e.target.value) || 0 })}
                    />
                    <button aria-label={`Increase reps, set ${i + 1}`}
                      onClick={() => setRow(i, { reps: s.reps + 1 })}
                    ><Icon name="plus" /></button>
                  </div>
                </div>
              </div>
              <button className="log-btn" onClick={() => logSet(i)}>
                <Icon name="check" /> Log set {i + 1}
              </button>
            </div>
          );
        }

        return (
          <div key={i} className="set-card future" aria-label={`Set ${i + 1}, planned`}>
            <span className="set-badge open" />
            <span className="set-tag">Set {i + 1}</span>
            <span className="set-values">
              {showWeight && <>{s.weightKg} <em>KG</em><i>×</i></>}
              {s.reps} <em>REPS</em>
            </span>
          </div>
        );
      })}
      <button className="add-set" onClick={() => setExtraSets((n) => n + 1)}>+ Add set</button>
    </div>
  );
}
