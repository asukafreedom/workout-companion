import { useState } from 'react';
import { WEEK, WORKOUTS, exerciseById, slotVariants } from '../data/plan';
import type { UserData, Workout } from '../data/types';
import { completedSets, lastSession } from '../logic/sessions';
import { isoWeekNumber, liftDatesInWeek, sessionEtaMin, weekDates, weekStreak } from '../logic/stats';
import { todayStr } from '../logic/dates';
import Icon from './Icon';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PLANNED_LIFTS = WEEK.filter((d) => d.kind === 'workout').length;

interface Props {
  data: UserData;
  onOpen(exerciseId: string): void;
  onChooseVariant(slot: string, exerciseId: string): void;
}

function chosenExercise(data: UserData, slot: string) {
  const variants = slotVariants(slot);
  const chosenId = data.settings.variantChoice?.[slot];
  return variants.find((v) => v.id === chosenId) ?? variants[0];
}

/** "Upper Body B" -> ["Upper", "Body B"] so the display title stacks. */
function splitTitle(name: string): [string, string | null] {
  const i = name.indexOf(' ');
  return i === -1 ? [name, null] : [name.slice(0, i), name.slice(i + 1)];
}

export default function TodayScreen({ data, onOpen, onChooseVariant }: Props) {
  const today = todayStr();
  const [viewedIdx, setViewedIdx] = useState<number>(new Date().getDay());
  const week = weekDates(today); // Mon..Sun
  const todayIdx = week.indexOf(today);
  const viewedDate = week[(viewedIdx + 6) % 7];
  const day = WEEK[viewedIdx];
  const isToday = viewedDate === today;

  const liftDays = new Set(liftDatesInWeek(data.setLogs, today));
  const sessionsBefore = [...liftDays].filter((d) => d !== today).length;
  const streak = weekStreak(data.setLogs, today, PLANNED_LIFTS);

  const d = new Date(viewedDate + 'T00:00:00');
  const eyebrowDate = `${WEEKDAYS[d.getDay()]} · ${d.getDate()} ${MONTHS[d.getMonth()]}`;

  const workout = day.kind === 'workout' ? (WORKOUTS.find((x) => x.id === day.workoutId) as Workout) : null;
  const exercises = workout ? workout.slots.map((slot) => chosenExercise(data, slot)) : [];
  const doneCount = exercises.filter((ex) => completedSets(data.setLogs, ex.id, viewedDate) >= ex.sets).length;
  const setsDone = exercises.reduce((s, ex) => s + Math.min(completedSets(data.setLogs, ex.id, viewedDate), ex.sets), 0);
  const setsTotal = exercises.reduce((s, ex) => s + ex.sets, 0);
  const remaining = exercises.flatMap((ex) => {
    const done = Math.min(completedSets(data.setLogs, ex.id, viewedDate), ex.sets);
    return Array.from({ length: ex.sets - done }, () => ({ restSec: ex.restSec }));
  });
  const eta = sessionEtaMin(remaining);
  const firstIncomplete = exercises.find((ex) => completedSets(data.setLogs, ex.id, viewedDate) < ex.sets);
  const currentId = firstIncomplete?.id;
  const [titleTop, titleRest] = splitTitle(
    workout ? workout.name : day.kind === 'cardio' ? 'Cardio Day' : 'Rest Day',
  );

  return (
    <div className="screen today">
      <header className="screen-head">
        <div className="head-row">
          <span className="eyebrow">{eyebrowDate}</span>
          <span className="week-pill">Week {isoWeekNumber(today)} · {sessionsBefore + (workout && doneCount >= exercises.length && exercises.length > 0 ? 1 : 0)}/{PLANNED_LIFTS}</span>
        </div>
        <h1 className="display">{titleTop}{titleRest && <><br />{titleRest}</>}</h1>
      </header>

      <div className="week-block">
        <div className="week-strip" role="tablist" aria-label="Days of this week">
          {week.map((date, i) => {
            const dayIdx = (i + 1) % 7; // Mon-first cell -> Date.getDay index
            const lifted = liftDays.has(date);
            const fill = date === today ? 'today' : lifted ? 'lifted' : 'none';
            return (
              <button
                key={date}
                className={`week-cell${viewedIdx === dayIdx ? ' viewed' : ''}`}
                aria-pressed={viewedIdx === dayIdx}
                aria-label={`${WEEKDAYS[dayIdx]}${lifted ? ', trained' : ''}`}
                onClick={() => setViewedIdx(dayIdx)}
              >
                <span className="week-letter">{DAY_LETTERS[i]}</span>
                <span className={`week-bar ${fill}`} />
              </button>
            );
          })}
        </div>
        <div className="week-line">
          <span>Session {Math.min(sessionsBefore + 1, PLANNED_LIFTS)} of {PLANNED_LIFTS} this week</span>
          {streak > 0 && <span className="streak">{streak}-week streak</span>}
        </div>
      </div>

      {day.kind !== 'workout' && (
        <div className="stat-card">
          <p className="note">{day.text}</p>
        </div>
      )}

      {workout && (
        <>
          <div className="stat-card session-card">
            <div className="session-top">
              <span className="session-count">
                <b>{doneCount}<em>/{exercises.length}</em></b>
                <span className="eyebrow tiny">exercises</span>
              </span>
              <span className="session-meta">
                {setsDone} of {setsTotal} sets{remaining.length > 0 ? ` · ~${eta} min left` : ''}
              </span>
            </div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${(doneCount / Math.max(1, exercises.length)) * 100}%` }} /></div>
          </div>

          <ul className="exercise-list">
            {exercises.map((ex, i) => {
              const variants = slotVariants(ex.slot);
              const other = variants.find((v) => v.id !== ex.id);
              const done = completedSets(data.setLogs, ex.id, viewedDate);
              const isDone = done >= ex.sets;
              const isCurrent = isToday && ex.id === currentId && setsDone > 0;
              const last = lastSession(data.setLogs, ex.id, viewedDate);
              const lastW = last[0]?.weightKg;
              const meta = isDone
                ? `${ex.sets} × ${last.length ? Math.max(...data.setLogs.filter((l) => l.exerciseId === ex.id && l.date === viewedDate).map((l) => l.reps)) : ex.repMax} · ${lastW ?? 0} kg`
                : `${ex.sets} × ${ex.repMin}–${ex.repMax}${ex.repNote ? ` ${ex.repNote}` : ''}${lastW !== undefined ? ` · last ${lastW} kg` : ''}`;
              return (
                <li key={ex.slot} className={`ex-row${isDone ? ' is-done' : ''}${isCurrent ? ' is-current' : ''}`}>
                  <button className="ex-main" onClick={() => onOpen(ex.id)}>
                    <span className="ex-index">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ex-text">
                      <span className="ex-name">{ex.name}</span>
                      <span className="ex-meta">{meta}</span>
                      {other && !isDone && (
                        <span
                          className="ex-swap"
                          role="button"
                          tabIndex={0}
                          aria-label={`Switch to ${other.name}`}
                          onClick={(e) => { e.stopPropagation(); onChooseVariant(ex.slot, other.id); }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onChooseVariant(ex.slot, other.id); }
                          }}
                        >
                          <Icon name="swap" /> {other.name}
                        </span>
                      )}
                    </span>
                    {isDone ? (
                      <span className="set-badge good"><Icon name="check" /></span>
                    ) : isCurrent ? (
                      <span className="ex-progress">{done}<em>/{ex.sets}</em></span>
                    ) : (
                      <span className="ex-last">{lastW !== undefined ? <>{lastW} <em>KG</em></> : <em>NEW</em>}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {workout.note && <p className="note">{workout.note}</p>}

          {isToday && firstIncomplete && (
            <div className="cta-stack">
              <button className="cta" onClick={() => onOpen(firstIncomplete.id)}>
                <span>{setsDone > 0 ? 'Continue' : 'Start'} · {firstIncomplete.name}</span>
                <span className="cta-arrow">→</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
