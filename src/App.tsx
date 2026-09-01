import { useCallback, useState } from 'react';
import type { UserData } from './data/types';
import { loadData, saveData } from './storage/store';
import { exerciseById } from './data/plan';
import TodayScreen from './components/TodayScreen';
import SetLogger from './components/SetLogger';
import RestTimer from './components/RestTimer';
import Viewer from './three/Viewer';

export type Tab = 'today' | 'progress' | 'plan';

export default function App() {
  const [data, setData] = useState<UserData>(() => loadData());
  const [tab, setTab] = useState<Tab>('today');
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);
  const [timer, setTimer] = useState<{ endsAt: number; total: number } | null>(null);

  const update = useCallback((fn: (d: UserData) => UserData) => {
    setData((prev) => {
      const next = fn(prev);
      saveData(next);
      return next;
    });
  }, []);

  const chooseVariant = (slot: string, exerciseId: string) =>
    update((d) => ({
      ...d,
      settings: { ...d.settings, variantChoice: { ...d.settings.variantChoice, [slot]: exerciseId } },
    }));

  return (
    <div className="app">
      <main className="main">
        {tab === 'today' && (
          <TodayScreen data={data} onOpen={setOpenExerciseId} onChooseVariant={chooseVariant} />
        )}
        {tab === 'progress' && <div className="screen">Progress — Task 13</div>}
        {tab === 'plan' && <div className="screen">Plan — Task 14</div>}
      </main>
      {/* ExerciseDetail overlay mounts here in Task 12; RestTimer banner in Task 9 */}
      {/* TEMP Task 10 harness — removed in Task 12 */}
      {tab === 'today' && (
        <div style={{ padding: '0 16px' }}>
          <Viewer exercise={exerciseById('db-press')} />
        </div>
      )}
      {/* TEMP Task 9 harness — removed in Task 12 */}
      {openExerciseId === null && tab === 'today' && (
        <div style={{ padding: 16 }}>
          <SetLogger
            exercise={exerciseById('db-press')}
            data={data}
            update={update}
            onSetLogged={(restSec) => setTimer({ endsAt: Date.now() + restSec * 1000, total: restSec })}
          />
        </div>
      )}
      {timer && (
        <RestTimer
          endsAt={timer.endsAt}
          total={timer.total}
          soundOn={data.settings.restTimerSound}
          onDone={() => setTimer(null)}
          onExtend={(s) => setTimer((t) => (t ? { ...t, endsAt: t.endsAt + s * 1000 } : t))}
        />
      )}
      <nav className="tabbar">
        {(['today', 'progress', 'plan'] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? 'tab active' : 'tab'} onClick={() => setTab(t)}>
            {t === 'today' ? 'Today' : t === 'progress' ? 'Progress' : 'Plan'}
          </button>
        ))}
      </nav>
    </div>
  );
}
