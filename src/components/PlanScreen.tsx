import { useRef } from 'react';
import { WEEK, WORKOUTS } from '../data/plan';
import type { UserData } from '../data/types';
import { exportJson, mergeImport } from '../storage/exportImport';
import { todayStr } from '../logic/dates';

const DAY_TAGS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
/** Render order Monday-first to match the training week. */
const ORDER = [1, 2, 3, 4, 5, 6, 0];

interface Props { data: UserData; update(fn: (d: UserData) => UserData): void }

export default function PlanScreen({ data, update }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const todayIdx = new Date().getDay();

  const lifts = WEEK.filter((d) => d.kind === 'workout').length;
  const cardio = WEEK.filter((d) => d.kind === 'cardio').length;
  const rest = WEEK.filter((d) => d.kind === 'rest').length;

  const doExport = async () => {
    const name = `workout-backup-${todayStr()}.json`;
    const json = exportJson(data);
    const file = new File([json], name, { type: 'application/json' });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        update((d) => ({ ...d, settings: { ...d.settings, lastBackup: todayStr() } }));
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return;
        // user cancelled or share failed silently otherwise — no stamp, no alert
      }
      return;
    }

    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    update((d) => ({ ...d, settings: { ...d.settings, lastBackup: todayStr() } }));
  };

  const doImport = async (file: File) => {
    try {
      const merged = mergeImport(data, JSON.parse(await file.text()));
      update(() => merged);
      alert('Backup imported.');
    } catch {
      alert('That file is not a valid backup.');
    }
  };

  const daysSinceBackup = data.settings.lastBackup
    ? Math.floor((Date.parse(todayStr()) - Date.parse(data.settings.lastBackup)) / 86400000)
    : null;
  const backupOverdue = daysSinceBackup !== null && daysSinceBackup > 30;

  return (
    <div className="screen">
      <header className="screen-head">
        <span className="eyebrow">{lifts} lifts · {cardio} cardio · {rest} rest</span>
        <h1 className="display md">Your week</h1>
      </header>

      <div className="week-list">
        {ORDER.map((i) => {
          const day = WEEK[i];
          const isToday = i === todayIdx;
          const workout = day.kind === 'workout' ? WORKOUTS.find((w) => w.id === day.workoutId)! : null;
          const tag = isToday ? 'Today' : workout ? `${workout.slots.length} lifts` : day.kind === 'cardio' ? 'Cardio' : 'Rest';
          return (
            <div key={i} className={`week-row${isToday ? ' today' : ''}`}>
              <span className="week-day">{DAY_TAGS[i]}</span>
              <span className={`week-name${workout ? '' : ' quiet'}`}>
                {workout ? workout.name : day.kind === 'cardio' ? 'Easy cardio 30–40 min' : 'Rest / walking'}
                {day.kind === 'workout' && day.note && <span className="week-suffix"> + incline walk</span>}
              </span>
              <span className="week-tag">{tag}</span>
            </div>
          );
        })}
      </div>

      <div className="stat-card">
        <span className="tile-label">How hard</span>
        <span className="big-line">1–3 reps in reserve</span>
        <p className="note">
          Stop before failure. Progress reps first, then weight: hit the top of the range on every
          set, add 2.5 kg, build back up. The app nudges you when it's time.
        </p>
      </div>

      <div className="list-block">
        <span className="tile-label pad">Nutrition targets</span>
        <div className="tile-grid">
          <div className="tile"><span className="tile-label">Protein</span><span className="tile-value sm">160–180<em> g</em></span></div>
          <div className="tile"><span className="tile-label">Deficit</span><span className="tile-value sm">300–500<em> kcal</em></span></div>
          <div className="tile"><span className="tile-label">Steps</span><span className="tile-value sm">8–10<em> k</em></span></div>
        </div>
        <ul className="note-list">
          <li>Protein + veg/fruit + a sensible carb portion each meal</li>
          <li>Control alcohol, sugary drinks, desserts and snacking — don't cut carbs entirely</li>
          <li>Weigh in 3–5 mornings a week; judge only the weekly average</li>
          <li>Flat for 2–3 weeks → eat slightly less or move slightly more</li>
        </ul>
      </div>

      <div className="stat-card">
        <div className="backup-head">
          <span className="tile-label">Backup</span>
          <span className={`backup-when${backupOverdue ? ' overdue' : ''}`}>
            {daysSinceBackup === null
              ? 'Never exported — your log lives only on this device'
              : `Last export ${daysSinceBackup} day${daysSinceBackup === 1 ? '' : 's'} ago`}
          </span>
        </div>
        <div className="backup-buttons">
          <button className="solid-btn grow" onClick={doExport}>Export data</button>
          <button className="pill-btn grow" onClick={() => fileRef.current?.click()}>Import</button>
          <input
            ref={fileRef} type="file" accept="application/json" hidden
            onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])}
          />
        </div>
        <label className="switch-row">
          <span>Rest-timer sound</span>
          <input
            type="checkbox"
            className="switch"
            checked={data.settings.restTimerSound}
            onChange={(e) => update((d) => ({ ...d, settings: { ...d.settings, restTimerSound: e.target.checked } }))}
          />
        </label>
      </div>

      <p className="attribution">
        3D anatomy model derived from{' '}
        <a href="https://lifesciencedb.jp/bp3d/" target="_blank" rel="noopener noreferrer">BodyParts3D</a>
        {' '}© DBCLS (CC-BY-SA 2.1 JP) and{' '}
        <a href="https://www.z-anatomy.com/" target="_blank" rel="noopener noreferrer">Z-Anatomy</a>
        {' '}(CC-BY-SA 4.0), via BodyExplorer.
      </p>
    </div>
  );
}
