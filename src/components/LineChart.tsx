interface Pt { x: string; y: number }
interface Props { series: Pt[]; dots?: Pt[]; invert?: boolean; height?: number }

export default function LineChart({ series, dots = [], invert = false, height = 120 }: Props) {
  const all = [...series, ...dots];
  if (all.length === 0) return <div className="note">No data yet.</div>;
  const xs = [...new Set(all.map((p) => p.x))].sort();
  const ys = all.map((p) => p.y);
  const min = Math.min(...ys), max = Math.max(...ys);
  const pad = (max - min) * 0.1 || 1;
  const lo = min - pad, hi = max + pad;
  const W = 320, H = height, L = 34;
  const px = (x: string) => L + (xs.length === 1 ? (W - L) / 2 : (xs.indexOf(x) / (xs.length - 1)) * (W - L - 8));
  const py = (y: number) => {
    const t = (y - lo) / (hi - lo);
    return invert ? t * (H - 16) + 8 : H - 8 - t * (H - 16);
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img">
      <text x="2" y={py(max) + 4} className="chart-label">{max}</text>
      <text x="2" y={py(min) + 4} className="chart-label">{min}</text>
      {dots.map((p, i) => <circle key={i} cx={px(p.x)} cy={py(p.y)} r="2.5" className="chart-dot" />)}
      {series.length > 1 && (
        <polyline fill="none" strokeWidth="2" className="chart-line"
          points={series.map((p) => `${px(p.x)},${py(p.y)}`).join(' ')} />
      )}
      {series.map((p, i) => <circle key={`s${i}`} cx={px(p.x)} cy={py(p.y)} r="3" className="chart-point" />)}
    </svg>
  );
}
