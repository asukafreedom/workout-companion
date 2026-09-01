import { useCallback, useState } from 'react';
import type { UserData } from './data/types';
import { loadData, saveData } from './storage/store';
import TodayScreen from './components/TodayScreen';

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
