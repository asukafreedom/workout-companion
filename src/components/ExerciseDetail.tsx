import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { exerciseById } from '../data/plan';
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
  onSetLogged(restSec: number): void;
}

export default function ExerciseDetail({ exerciseId, data, update, onClose, onSetLogged }: Props) {
  const ex = exerciseById(exerciseId);
  const [showCues, setShowCues] = useState(false);
  const backRef = useRef<HTMLButtonElement>(null);

  // The anatomy viewer is collapsible so the logger owns the screen on repeat
  // visits; the choice persists.
  const collapsed = data.settings.viewerCollapsed ?? false;
  const setCollapsed = (v: boolean) =>
    update((d) => ({ ...d, settings: { ...d.settings, viewerCollapsed: v } }));

  useEffect(() => {
    backRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const primaryNames = ex.primary.map((m) => MUSCLE_LABELS[m]).join(' · ');
  const secondaryNames = ex.secondary.map((m) => MUSCLE_LABELS[m]).join(', ');

  return (
    <div className="detail-overlay" role="dialog" aria-modal="true" aria-label={ex.name}>
      <header className="detail-header">
        <button ref={backRef} onClick={onClose}>‹ Back</button>
        <div>
          <h2>{ex.name}</h2>
          <span className="row-sub">
            {ex.sets}×{ex.repMin}–{ex.repMax}{ex.repNote ? ` ${ex.repNote}` : ''} · rest {ex.restSec}s
          </span>
        </div>
      </header>

      <div className="detail-body">
        <div className="muscle-bar">
          <div className="muscle-summary">
            <span className="muscle-primary">{primaryNames}</span>
            {secondaryNames && <span className="muscle-secondary">with {secondaryNames}</span>}
          </div>
          <button
            className="viewer-toggle"
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Show 3D anatomy' : 'Hide 3D anatomy'}
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon name={collapsed ? 'chevronDown' : 'chevronUp'} />
          </button>
        </div>
        {!collapsed && (
          <Suspense fallback={<div className="viewer viewer-loading">Loading 3D anatomy…</div>}>
            <Viewer exercise={ex} />
          </Suspense>
        )}
        <SetLogger key={ex.id} exercise={ex} data={data} update={update} onSetLogged={onSetLogged} />
        <div className="detail-actions">
          <button
            className="cues-toggle"
            aria-expanded={showCues}
            onClick={() => setShowCues((s) => !s)}
          >
            <Icon name={showCues ? 'chevronUp' : 'chevronDown'} /> Form cues
          </button>
          <a
            className="video-link"
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${ex.name} proper form`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="play" /> Form video
          </a>
        </div>
        {showCues && (
          <div className="card cues-card">
            <ul>{ex.cues.map((c) => <li key={c}>{c}</li>)}</ul>
            <p className="note">You should feel it in: {ex.feel}</p>
          </div>
        )}
      </div>
    </div>
  );
}
