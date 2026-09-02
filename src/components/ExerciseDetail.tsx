import { Suspense, lazy, useState } from 'react';
import { exerciseById } from '../data/plan';
import type { UserData } from '../data/types';
import SetLogger from './SetLogger';

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

  return (
    <div className="detail-overlay">
      <header className="detail-header">
        <button onClick={onClose}>‹ Back</button>
        <div>
          <h2>{ex.name}</h2>
          <span className="row-sub">
            {ex.sets}×{ex.repMin}–{ex.repMax}{ex.repNote ? ` ${ex.repNote}` : ''} · rest {ex.restSec}s
          </span>
        </div>
      </header>

      <div className="detail-body">
        <Suspense fallback={<div className="viewer viewer-loading">Loading 3D anatomy…</div>}>
          <Viewer exercise={ex} />
        </Suspense>
        <div className="detail-actions">
          <button className="cues-toggle" onClick={() => setShowCues((s) => !s)}>
            {showCues ? 'Hide form cues ▾' : 'Form cues ▸'}
          </button>
          <a
            className="video-link"
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${ex.name} proper form`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            ▶ Form video
          </a>
        </div>
        {showCues && (
          <div className="card cues-card">
            <ul>{ex.cues.map((c) => <li key={c}>{c}</li>)}</ul>
            <p className="note">You should feel it in: {ex.feel}</p>
          </div>
        )}
        <SetLogger key={ex.id} exercise={ex} data={data} update={update} onSetLogged={onSetLogged} />
      </div>
    </div>
  );
}
