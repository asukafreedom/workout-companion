import { useRef } from 'react';
import { WEEK, WORKOUTS } from '../data/plan';
import type { UserData } from '../data/types';
import { exportJson, mergeImport } from '../storage/exportImport';
import { todayStr } from '../logic/dates';
import Icon from './Icon';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Props { data: UserData; update(fn: (d: UserData) => UserData): void }

export default function PlanScreen({ data, update }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="screen">
      <h2 className="section-title">Your week</h2>
      <div className="card week-card">
        {WEEK.map((day, i) => (
          <div className="week-row" key={i}>
            <span className="week-day">{DAY_NAMES[i]}</span>
            <span>
              {day.kind === 'workout'
                ? WORKOUTS.find((w) => w.id === day.workoutId)!.name + (day.note ? ' *' : '')
                : day.kind === 'cardio' ? 'Easy cardio 30–40 min' : 'Rest / walking'}
            </span>
          </div>
        ))}
        <p className="note">* plus 15–20 min easy incline walking if time allows.</p>
      </div>

      <h2 className="section-title">How hard to train</h2>
      <div className="card">
        <p>Most sets: stop with 1–3 good reps left in the tank — not total failure.</p>
        <p className="note" style={{ marginTop: 8 }}>
          Progress by reps first, then weight: reach the top of the rep range on every set,
          then add 2.5 kg and build back up. The app tracks this for you.
        </p>
      </div>

      <h2 className="section-title">Nutrition targets</h2>
      <div className="card">
        <ul className="nutrition-list">
          <li><b>Protein:</b> 160–180 g/day</li>
          <li><b>Calories:</b> keep a 300–500 kcal/day deficit</li>
          <li>Base meals on protein + vegetables/fruit + a sensible carb portion</li>
          <li>Keep alcohol, sugary drinks, desserts and snacking controlled — don't cut carbs entirely</li>
          <li>Weigh in 3–5 mornings/week; judge only the weekly average</li>
          <li>Average flat for 2–3 weeks → eat slightly less or move slightly more</li>
        </ul>
        <p className="note" style={{ marginTop: 8 }}>
          Steps: 8,000–10,000/day plus two easy 25–40 min cardio sessions a week.
        </p>
      </div>

      <h2 className="section-title">Backup</h2>
      <div className="card">
        {daysSinceBackup !== null && daysSinceBackup > 30 && (
          <div className="nudge danger">
            <Icon name="alert" />
            <span>Last backup: {daysSinceBackup} days ago. Export now — your log lives only on this device.</span>
          </div>
        )}
        {daysSinceBackup === null && <p className="note">No backup yet — export once in a while.</p>}
        <div className="backup-buttons">
          <button onClick={doExport}>Export data</button>
          <button onClick={() => fileRef.current?.click()}>Import backup</button>
          <input
            ref={fileRef} type="file" accept="application/json" hidden
            onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])}
          />
        </div>
        <label className="sound-toggle">
          <input
            type="checkbox"
            checked={data.settings.restTimerSound}
            onChange={(e) => update((d) => ({ ...d, settings: { ...d.settings, restTimerSound: e.target.checked } }))}
          />
          Rest-timer sound
        </label>
      </div>

      <p className="note attribution">
        3D anatomy model derived from{' '}
        <a href="https://lifesciencedb.jp/bp3d/" target="_blank" rel="noopener noreferrer">BodyParts3D</a>
        {' '}© DBCLS (CC-BY-SA 2.1 JP) and{' '}
        <a href="https://www.z-anatomy.com/" target="_blank" rel="noopener noreferrer">Z-Anatomy</a>
        {' '}(CC-BY-SA 4.0), via BodyExplorer.
      </p>
    </div>
  );
}
