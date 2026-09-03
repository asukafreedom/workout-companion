import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { WORKOUTS, exerciseById } from '../data/plan';
import type { UserData } from '../data/types';
import { MUSCLE_LABELS } from '../three/muscleMap';
import SetLogger from './SetLogger';
import Icon from './Icon';

// The 3D stack (three.js + anatomy model) loads on demand, keeping the
// initial bundle small; the service worker caches the chunk for offline use.
const Viewer = lazy(() => import('../three/Viewer'));

interface Props {
  exerciseId: string;
  data: UserData;
  update(fn: (d: UserData) => UserData): void;
  onClose(): void;
  onSetLogged(restSec: number, nextLabel: string | null): void;
}

export default function ExerciseDetail({ exerciseId, data, update, onClose, onSetLogged }: Props) {
  const ex = exerciseById(exerciseId);
  const [showCues, setShowCues] = useState(false);
  const backRef = useRef<HTMLButtonElement>(null);

  const workout = WORKOUTS.find((w) => w.slots.includes(ex.slot));
  const position = workout ? `Exercise ${workout.slots.indexOf(ex.slot) + 1} of ${workout.slots.length}` : '';

  const collapsed = data.settings.viewerCollapsed ?? false;
  const setCollapsed = (v: boolean) =>
    update((d) => ({ ...d, settings: { ...d.settings, viewerCollapsed: v } }));

  useEffect(() => {
    backRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const loadLabel =
    ex.loadType === 'dumbbell' ? ' · Per dumbbell' :
    ex.loadType === 'machine' ? ' · Machine stack' :
    ex.loadType === 'total' ? ' · Total weight' :
    ex.loadType === 'assisted' ? ' · Assist weight' : '';

  const primaryNames = ex.primary.map((m) => MUSCLE_LABELS[m]).join(' · ');
  const secondaryNames = ex.secondary.map((m) => MUSCLE_LABELS[m]).join(', ');

  const muscleOverlay = (
    <div className="viewer-muscles">
      <span className="viewer-primary">{primaryNames}</span>
      {secondaryNames && <span className="viewer-secondary">with {secondaryNames}</span>}
    </div>
  );

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true" aria-label={ex.name}>
      <div className="detail-body">
        <div className="detail-nav">
          <button ref={backRef} className="round-btn" aria-label="Back" onClick={onClose}>
            <Icon name="back" />
          </button>
          <span className="eyebrow">{position}</span>
          <span className="round-spacer" />
        </div>

        <div className="detail-title">
          <h1>{ex.name}</h1>
          <span className="eyebrow meta">
            {ex.sets} × {ex.repMin}–{ex.repMax}{ex.repNote ? ` ${ex.repNote}` : ''} · Rest {ex.restSec} s{loadLabel}
          </span>
        </div>

        {collapsed ? (
          <div className="viewer-collapsed">
            {muscleOverlay}
            <button className="round-btn small" aria-expanded="false" aria-label="Show 3D anatomy"
              onClick={() => setCollapsed(false)}>
              <Icon name="chevronDown" />
            </button>
          </div>
        ) : (
          <div className="viewer-wrap">
            <Suspense fallback={<div className="viewer viewer-loading">Loading 3D anatomy…</div>}>
              <Viewer exercise={ex} />
            </Suspense>
            {muscleOverlay}
            <button className="round-btn small viewer-collapse" aria-expanded="true" aria-label="Hide 3D anatomy"
              onClick={() => setCollapsed(true)}>
              <Icon name="chevronUp" />
            </button>
          </div>
        )}

        <SetLogger key={ex.id} exercise={ex} data={data} update={update} onSetLogged={onSetLogged} />

        <div className="detail-actions">
          <button className="pill-btn" aria-expanded={showCues} onClick={() => setShowCues((s) => !s)}>
            Form cues
          </button>
          <a
            className="pill-btn"
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${ex.name} proper form`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="play" /> Form video
          </a>
        </div>
        {showCues && (
          <div className="cues-card">
            <ul>{ex.cues.map((c) => <li key={c}>{c}</li>)}</ul>
            <p className="note">You should feel it in: {ex.feel}</p>
          </div>
        )}
      </div>
    </div>
  );
}
