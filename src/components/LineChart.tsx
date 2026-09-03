/** Hand-rolled SVG charts for the redesign: the body-weight trend panel and
 *  the per-exercise sparkline. No chart library — everything is data-driven. */

interface AvgPoint { date: string; avg: number }
interface RawPoint { date: string; kg: number }

interface BodyWeightChartProps {
  averages: AvgPoint[];
  daily: RawPoint[];
  goalKg?: number;
}

const W = 330, H = 140, PAD_X = 8, TOP = 12, BOTTOM = 12;

export function BodyWeightChart({ averages, daily, goalKg }: BodyWeightChartProps) {
  if (averages.length === 0) return <p className="note">Log a weigh-in to start the trend.</p>;

  const xs = averages.map((a) => a.date);
  const ys = [...averages.map((a) => a.avg), ...daily.map((d) => d.kg)];
  if (goalKg !== undefined) ys.push(goalKg);
  const min = Math.min(...ys), max = Math.max(...ys);
  const pad = (max - min) * 0.08 || 1;
  const lo = min - pad, hi = max + pad;

  const px = (date: string) => {
    const i = xs.indexOf(date);
    if (xs.length === 1) return W / 2;
    return PAD_X + (i / (xs.length - 1)) * (W - 2 * PAD_X);
  };
  const pxRaw = (date: string) => {
    // daily dots can include dates outside the average series (same span though)
    const i = xs.indexOf(date);
    return i >= 0 ? px(date) : null;
  };
  const py = (v: number) => TOP + (1 - (v - lo) / (hi - lo)) * (H - TOP - BOTTOM);

  const linePts = averages.map((a) => `${px(a.date)},${py(a.avg)}`).join(' ');
  const lastPt = averages[averages.length - 1];
  const areaPts = `${linePts} ${px(lastPt.date)},${H} ${px(averages[0].date)},${H}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bw-chart" role="img"
      aria-label={`Body weight 7-day average, currently ${lastPt.avg} kilograms`}>
      {[0.15, 0.5, 0.85].map((t) => (
        <line key={t} className="grid" x1="0" y1={TOP + t * (H - TOP - BOTTOM)} x2={W} y2={TOP + t * (H - TOP - BOTTOM)} />
      ))}
      <text className="axis" x={W} y={py(max) + 4} textAnchor="end">{max.toFixed(1)}</text>
      <text className="axis" x={W} y={py(min) + 4} textAnchor="end">{min.toFixed(1)}</text>
      {goalKg !== undefined && (
        <>
          <line className="goal" x1="0" y1={py(goalKg)} x2={W} y2={py(goalKg)} />
          <text className="goal-label" x="0" y={py(goalKg) - 4}>GOAL {goalKg}</text>
        </>
      )}
      <polygon className="area" points={areaPts} />
      {daily.map((p, i) => {
        const x = pxRaw(p.date);
        return x === null ? null : <circle key={i} className="dot" cx={x} cy={py(p.kg)} r="2.5" />;
      })}
      {averages.length > 1 && <polyline className="avg-line" fill="none" points={linePts} />}
      <circle className="last-point" cx={px(lastPt.date)} cy={py(lastPt.avg)} r="5" />
    </svg>
  );
}

interface SparklineProps {
  values: number[];
  /** improving trend renders in accent; held/mixed in dim */
  improving: boolean;
}

export function Sparkline({ values, improving }: SparklineProps) {
  const SW = 90, SH = 32, P = 3;
  if (values.length === 0) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const sx = (i: number) => (values.length === 1 ? SW / 2 : P + (i / (values.length - 1)) * (SW - 2 * P));
  const sy = (v: number) => P + (1 - (v - min) / span) * (SH - 2 * P);
  const pts = values.map((v, i) => `${sx(i)},${sy(v)}`).join(' ');
  const cls = improving ? 'spark up' : 'spark held';
  return (
    <svg viewBox={`0 0 ${SW} ${SH}`} width={SW} height={SH} className={cls} aria-hidden="true">
      {values.length > 1 && <polyline fill="none" points={pts} />}
      <circle cx={sx(values.length - 1)} cy={sy(values[values.length - 1])} r="3" />
    </svg>
  );
}
