import { useEffect, useRef, useState } from 'react';
import { EXERCISES, WEEK } from '../data/plan';
import type { UserData } from '../data/types';
import { sessionHistory } from '../logic/sessions';
import { rollingAverage } from '../logic/bodyweight';
import {
  isoWeekNumber, liftDatesInWeek, newBestsThisWeek, topWeights, weekDates, weeklyVolume,
} from '../logic/stats';
import { todayStr } from '../logic/dates';
import { BodyWeightChart, Sparkline } from './LineChart';
import Icon from './Icon';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PLANNED_LIFTS = WEEK.filter((d) => d.kind === 'workout').length;
const ASSISTED_IDS = new Set(EXERCISES.filter((e) => e.loadType === 'assisted').map((e) => e.id));

const shortDate = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

const LOAD_LABEL: Record<string, string> = {
  dumbbell: 'per dumbbell',
  machine: 'machine stack',
  total: 'total weight',
  assisted: 'assist · lower is stronger',
  bodyweight: 'bodyweight',
};

interface Props { data: UserData; update(fn: (d: UserData) => UserData): void }

export default function ProgressScreen({ data, update }: Props) {
  const today = todayStr();
  const week = weekDates(today);

  const sessions = liftDatesInWeek(data.setLogs, today).length;
  const volume = weeklyVolume(data.setLogs, today);
  const lastWeekVolume = weeklyVolume(data.setLogs, (() => {
    const d = new Date(week[0] + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  })());
  const volumeDelta = lastWeekVolume > 0 ? Math.round(((volume - lastWeekVolume) / lastWeekVolume) * 100) : null;
  const bests = newBestsThisWeek(data.setLogs, today, ASSISTED_IDS);

  // Body weight: last 28 days of entries drive the panel.
  const cutoff = (() => {
    const d = new Date(today + 'T00:00:00');
    d.setDate(d.getDate() - 27);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  })();
  const daily = data.bodyWeights.filter((b) => b.date >= cutoff);
  const averages = rollingAverage(data.bodyWeights).filter((a) => a.date >= cutoff);
  const currentAvg = averages[averages.length - 1]?.avg;
  const oldestAvg = averages[0]?.avg;
  const bwDelta = currentAvg !== undefined && oldestAvg !== undefined ? currentAvg - oldestAvg : null;

  const lastBw = data.bodyWeights[data.bodyWeights.length - 1]?.kg ?? 80;
  const [bw, setBw] = useState(lastBw);
  const [bwDraft, setBwDraft] = useState(String(lastBw));
  const bwDraftRef = useRef(String(lastBw));
  useEffect(() => { setBwDraft(String(bw)); bwDraftRef.current = String(bw); }, [bw]);

  const commitBw = (v: number) => { setBw(Math.round(v * 10) / 10); };
  const logBw = () => {
    const parsed = parseFloat(bwDraftRef.current);
    const kg = Number.isNaN(parsed) ? bw : Math.round(parsed * 10) / 10;
    setBw(kg);
    update((d) => ({
      ...d,
      bodyWeights: [...d.bodyWeights.filter((b) => b.date !== today), { date: today, kg }],
    }));
  };

  const trained = EXERCISES.filter((e) => sessionHistory(data.setLogs, e.id).length > 0);

  return (
    <div className="screen">
      <header className="screen-head">
        <span className="eyebrow">Week {isoWeekNumber(today)} · {shortDate(week[0])} – {shortDate(week[6])}</span>
        <h1 className="display md">Progress</h1>
      </header>

      <div className="tile-grid">
        <div className="tile">
          <span className="tile-label">Sessions</span>
          <span className="tile-value">{sessions}<em>/{PLANNED_LIFTS}</em></span>
        </div>
        <div className="tile">
          <span className="tile-label">Volume</span>
          <span className="tile-value">{(volume / 1000).toFixed(1)}<em> t</em></span>
          {volumeDelta !== null && (
            <span className={`tile-delta${volumeDelta >= 0 ? ' up' : ''}`}>
              {volumeDelta >= 0 ? '▲' : '▼'} {Math.abs(volumeDelta)}% vs last wk
            </span>
          )}
        </div>
        <div className="tile">
          <span className="tile-label">New bests</span>
          <span className={`tile-value${bests > 0 ? ' accent' : ''}`}>{bests}</span>
        </div>
      </div>

      <div className="stat-card bw-card">
        <div className="bw-head">
          <div className="bw-current">
            <span className="tile-label">Body weight · 7-day avg</span>
            <span className="bw-value">{currentAvg !== undefined ? currentAvg.toFixed(1) : '—'}<em>KG</em></span>
          </div>
          {bwDelta !== null && (
            <div className="bw-delta-wrap">
              <span className={`bw-delta${bwDelta < 0 ? ' good' : ''}`}>{bwDelta > 0 ? '+' : ''}{bwDelta.toFixed(1)} kg</span>
              <span className="tile-label">last 4 weeks</span>
            </div>
          )}
        </div>
        <BodyWeightChart averages={averages} daily={daily} goalKg={data.settings.goalKg} />
        <div className="bw-entry">
          <div className="field-box slim">
            <button aria-label="Decrease body weight" onClick={() => commitBw(bw - 0.1)}><Icon name="minus" /></button>
            <input
              className="field-value slim"
              inputMode="decimal"
              aria-label="Body weight in kilograms"
              value={bwDraft}
              onChange={(e) => { setBwDraft(e.target.value); bwDraftRef.current = e.target.value; }}
              onBlur={() => {
                const parsed = parseFloat(bwDraft);
                if (!Number.isNaN(parsed)) commitBw(parsed);
                else setBwDraft(String(bw));
              }}
            />
            <span className="field-unit">KG</span>
            <button aria-label="Increase body weight" onClick={() => commitBw(bw + 0.1)}><Icon name="plus" /></button>
          </div>
          <button className="solid-btn" onClick={logBw}>Log today</button>
        </div>
      </div>

      <div className="list-block">
        <div className="list-head">
          <span>Top set weight</span>
          <span>Last 6 sessions</span>
        </div>
        {trained.length === 0 && <p className="note">Charts appear after your first logged session.</p>}
        {trained.map((ex) => {
          const assisted = ex.loadType === 'assisted';
          const tops = topWeights(data.setLogs, ex.id, 6);
          const current = tops[tops.length - 1];
          const prev = tops.length > 1 ? tops[tops.length - 2] : null;
          const rawDelta = prev !== null ? current - prev : null;
          const improving = tops.length > 1 && (assisted ? tops[tops.length - 1] < tops[0] : tops[tops.length - 1] > tops[0]);
          const deltaGood = rawDelta !== null && rawDelta !== 0 && (assisted ? rawDelta < 0 : rawDelta > 0);
          return (
            <div className="ex-card" key={ex.id}>
              <div className="ex-card-text">
                <span className="ex-card-name">{ex.name}</span>
                <span className="ex-card-load">{LOAD_LABEL[ex.loadType]}</span>
              </div>
              <Sparkline values={assisted ? tops.map((t) => -t) : tops} improving={improving} />
              <div className="ex-card-right">
                <span className="ex-card-weight">{current}</span>
                <span className={`ex-card-delta${deltaGood ? ' good' : ''}`}>
                  {rawDelta === null ? 'first' : rawDelta === 0 ? 'held' : `${rawDelta > 0 ? '+' : ''}${Math.round(rawDelta * 10) / 10}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
