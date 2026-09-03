import { useEffect, useRef, useState } from 'react';
import { beep } from '../logic/sound';

interface Props {
  endsAt: number;
  total: number;
  soundOn: boolean;
  next: string | null;
  onDone(): void;
  onExtend(sec: number): void;
}

export default function RestTimer({ endsAt, total, soundOn, next, onDone, onExtend }: Props) {
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
      <div className="rest-line" style={{ transform: `scaleX(${pct})` }} />
      <div className="rest-count">
        <span className="eyebrow tiny">Rest</span>
        <span className="rest-time">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span>
      </div>
      {next && <span className="rest-next">{next}</span>}
      <button className="rest-pill outline" onClick={() => onExtend(30)}>+30 s</button>
      <button className="rest-pill fill" onClick={onDone}>Skip</button>
    </div>
  );
}
