import { useCallback, useEffect, useRef, useState } from 'react';
import type { UserData } from './data/types';
import { loadData, saveData } from './storage/store';
import TodayScreen from './components/TodayScreen';
import ExerciseDetail from './components/ExerciseDetail';
import RestTimer from './components/RestTimer';
import ProgressScreen from './components/ProgressScreen';
import PlanScreen from './components/PlanScreen';

export type Tab = 'today' | 'progress' | 'plan';

export default function App() {
  const [data, setData] = useState<UserData>(() => loadData());
  const [tab, setTab] = useState<Tab>('today');
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);
  const [timer, setTimer] = useState<{ endsAt: number; total: number } | null>(null);

  const isFirstRender = useRef(true);

  const update = useCallback((fn: (d: UserData) => UserData) => {
    setData((prev) => fn(prev));
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveData(data);
  }, [data]);

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
        {tab === 'progress' && <ProgressScreen data={data} update={update} />}
        {tab === 'plan' && <PlanScreen data={data} update={update} />}
      </main>
      {openExerciseId && (
        <ExerciseDetail
          exerciseId={openExerciseId}
          data={data}
          update={update}
          onClose={() => setOpenExerciseId(null)}
          onSetLogged={(restSec) => setTimer({ endsAt: Date.now() + restSec * 1000, total: restSec })}
        />
      )}
      {timer && (
        <RestTimer
          endsAt={timer.endsAt}
          total={timer.total}
          soundOn={data.settings.restTimerSound}
          onDone={() => setTimer(null)}
          onExtend={(s) => setTimer((t) => (t ? { ...t, endsAt: t.endsAt + s * 1000, total: t.total + s } : t))}
        />
      )}
      <nav className="tabbar">
        {(['today', 'progress', 'plan'] as Tab[]).map((t) => (
          <button
            key={t}
            className={tab === t ? 'tab active' : 'tab'}
            aria-current={tab === t ? 'page' : undefined}
            onClick={() => setTab(t)}
          >
            {t === 'today' ? 'Today' : t === 'progress' ? 'Progress' : 'Plan'}
          </button>
        ))}
      </nav>
    </div>
  );
}
