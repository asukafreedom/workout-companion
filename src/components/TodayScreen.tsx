import { useState } from 'react';
import { WEEK, WORKOUTS, exerciseById, slotVariants } from '../data/plan';
import type { UserData, Workout } from '../data/types';
import { completedSets, lastSession } from '../logic/sessions';
import { todayStr } from '../logic/dates';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  data: UserData;
  onOpen(exerciseId: string): void;
  onChooseVariant(slot: string, exerciseId: string): void;
}

export function chosenExercise(data: UserData, slot: string) {
  const variants = slotVariants(slot);
  const chosenId = data.settings.variantChoice?.[slot];
  return variants.find((v) => v.id === chosenId) ?? variants[0];
}

export default function TodayScreen({ data, onOpen, onChooseVariant }: Props) {
  const [dayIdx, setDayIdx] = useState<number>(new Date().getDay());
  const day = WEEK[dayIdx];
  const today = todayStr();

  return (
    <div className="screen">
      <div className="day-switcher">
        {DAY_NAMES.map((n, i) => (
          <button key={n} className={i === dayIdx ? 'day active' : 'day'} onClick={() => setDayIdx(i)}>
            {n}
          </button>
        ))}
      </div>

      {day.kind !== 'workout' && (
        <div className="card rest-card">
          <h2>{day.kind === 'cardio' ? 'Cardio day' : 'Rest day'}</h2>
          <p>{day.text}</p>
        </div>
      )}

      {day.kind === 'workout' && (() => {
        const w = WORKOUTS.find((x) => x.id === day.workoutId) as Workout;
        return (
          <>
            <h1 className="workout-title">{w.name}</h1>
            {day.note && <p className="note">{day.note}</p>}
            <ul className="exercise-list">
              {w.slots.map((slot) => {
                const ex = chosenExercise(data, slot);
                const variants = slotVariants(slot);
                const last = lastSession(data.setLogs, ex.id, today);
                const done = completedSets(data.setLogs, ex.id, today);
                return (
                  <li key={slot} className="card exercise-row">
                    <button className="row-main" onClick={() => onOpen(ex.id)}>
                      <span className="row-name">
                        {ex.name}
                        {done >= ex.sets ? ' ✓' : done > 0 ? ` ${done}/${ex.sets}` : ''}
                      </span>
                      <span className="row-sub">
                        {ex.sets}×{ex.repMin}–{ex.repMax}
                        {ex.repNote ? ` ${ex.repNote}` : ''}
                        {last.length > 0 ? ` · last: ${last[0].weightKg} kg` : ''}
                      </span>
                    </button>
                    {variants.length > 1 && (
                      <button
                        className="variant-toggle"
                        onClick={() => {
                          const other = variants.find((v) => v.id !== ex.id)!;
                          onChooseVariant(slot, other.id);
                        }}
                      >
                        ⇄ {variants.find((v) => v.id !== ex.id)!.name}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            {w.note && <p className="note">{w.note}</p>}
          </>
        );
      })()}
    </div>
  );
}
