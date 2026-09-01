import { useEffect, useRef, useState } from 'react';

interface Props {
  endsAt: number;
  total: number;
  soundOn: boolean;
  onDone(): void;
  onExtend(sec: number): void;
}

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.15;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => ctx.close();
  } catch { /* audio blocked — fine */ }
}

export default function RestTimer({ endsAt, total, soundOn, onDone, onExtend }: Props) {
  const [remaining, setRemaining] = useState(endsAt - Date.now());
  const fired = useRef(false);

  useEffect(() => {
    fired.current = false;
    const id = setInterval(() => {
      const r = endsAt - Date.now();
      setRemaining(r);
      if (r <= 0 && !fired.current) {
        fired.current = true;
        clearInterval(id);
        navigator.vibrate?.(200);
        if (soundOn) beep();
        onDone();
      }
    }, 250);
    return () => clearInterval(id);
  }, [endsAt, soundOn, onDone]);

  const secs = Math.max(0, Math.ceil(remaining / 1000));
  const pct = Math.max(0, Math.min(1, remaining / (total * 1000)));

  return (
    <div className="rest-timer">
      <div className="rest-bar" style={{ transform: `scaleX(${pct})` }} />
      <span className="rest-time">Rest {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span>
      <button onClick={() => onExtend(30)}>+30s</button>
      <button onClick={onDone}>Skip</button>
    </div>
  );
}
