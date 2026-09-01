import { useState } from 'react';
import { EXERCISES } from '../data/plan';
import type { UserData } from '../data/types';
import { sessionHistory } from '../logic/sessions';
import { plateauFlag, rollingAverage } from '../logic/bodyweight';
import { todayStr } from '../logic/dates';
import LineChart from './LineChart';

interface Props { data: UserData; update(fn: (d: UserData) => UserData): void }

export default function ProgressScreen({ data, update }: Props) {
  const lastBw = data.bodyWeights[data.bodyWeights.length - 1]?.kg ?? 80;
  const [bw, setBw] = useState(lastBw);
  const avg = rollingAverage(data.bodyWeights);
  const flat = plateauFlag(data.bodyWeights);

  const logBw = () =>
    update((d) => ({
      ...d,
      bodyWeights: [...d.bodyWeights.filter((b) => b.date !== todayStr()), { date: todayStr(), kg: bw }],
    }));

  const trained = EXERCISES.filter((e) => sessionHistory(data.setLogs, e.id).length > 0);

  return (
    <div className="screen">
      <div className="card">
        <h2>Body weight</h2>
        <div className="bw-entry">
          <span className="stepper">
            <button onClick={() => setBw((v) => Math.round((v - 0.1) * 10) / 10)}>−</button>
            <input inputMode="decimal" value={bw} onChange={(e) => setBw(Number(e.target.value) || 0)} />
            <button onClick={() => setBw((v) => Math.round((v + 0.1) * 10) / 10)}>+</button>
            <span className="unit">kg</span>
          </span>
          <button className="tick" onClick={logBw}>Log today</button>
        </div>
        <LineChart
          series={avg.map((a) => ({ x: a.date, y: a.avg }))}
          dots={data.bodyWeights.map((b) => ({ x: b.date, y: b.kg }))}
        />
        <p className="note">Faint dots: daily weigh-ins · line: 7-day average (watch this one).</p>
        {flat && (
          <div className="nudge warn">
            Average flat for 3 weeks — consider reducing food slightly or adding activity.
          </div>
        )}
      </div>

      <h2 className="section-title">Exercises</h2>
      {trained.length === 0 && <p className="note">Charts appear after your first logged session.</p>}
      {trained.map((ex) => {
        const hist = sessionHistory(data.setLogs, ex.id);
        return (
          <div className="card" key={ex.id}>
            <h3>{ex.name}{ex.loadType === 'assisted' ? ' (assist — lower is stronger)' : ''}</h3>
            <LineChart
              series={hist.map((h) => ({ x: h.date, y: h.topWeightKg }))}
              invert={ex.loadType === 'assisted'}
            />
          </div>
        );
      })}
    </div>
  );
}
