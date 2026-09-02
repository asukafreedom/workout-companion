import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Exercise } from '../data/types';
import AnatomyModel, { type Focus } from './AnatomyModel';
import MotionHints from './MotionHint';

/** Muscle groups best viewed from behind the figure. */
const POSTERIOR = new Set(['deltRear', 'lats', 'traps', 'midBack', 'erectors', 'glutes', 'hamstrings', 'calves']);

/** Camera framing: full figure by default, zoomed to the primary muscles once known. */
function Framing({ focus, touched, fromBehind }: { focus: Focus | null; touched: boolean; fromBehind: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    if (touched || !controls.current) return;
    if (focus) {
      const [x, y, z] = focus.center;
      const dist = Math.min(3.2, Math.max(1.5, focus.radius * 3.6));
      // Approach from the side the working muscles are on (front vs back).
      const side = fromBehind ? -1 : 1;
      controls.current.target.set(x, y, z);
      camera.position.set(x, y + 0.12, z + side * dist);
    } else {
      controls.current.target.set(0, 0.95, 0);
      camera.position.set(0, 1.3, 2.6);
    }
    controls.current.update();
  }, [focus, touched, fromBehind, camera]);

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      minDistance={0.6}
      maxDistance={4.5}
      autoRotate={!touched}
      autoRotateSpeed={1.2}
    />
  );
}

export default function Viewer({ exercise }: { exercise: Exercise }) {
  const [touched, setTouched] = useState(false);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [ready, setReady] = useState(false);

  // New exercise: re-enable auto-framing and slow rotate.
  useEffect(() => { setTouched(false); }, [exercise.id]);

  const handleFocus = useCallback((f: Focus | null) => {
    setFocus(f);
    setReady(true);
  }, []);

  return (
    <div className="viewer" onPointerDown={() => setTouched(true)}>
      <Canvas camera={{ position: [0, 1.3, 2.6], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <directionalLight position={[-3, 2, -4]} intensity={0.4} />
        <Suspense fallback={null}>
          <AnatomyModel primary={exercise.primary} secondary={exercise.secondary} onFocus={handleFocus} />
          <MotionHints hints={exercise.hints} loadType={exercise.loadType} />
        </Suspense>
        <Framing focus={focus} touched={touched} fromBehind={exercise.primary.some((g) => POSTERIOR.has(g))} />
      </Canvas>
      {!ready && <div className="viewer-loading">Loading 3D anatomy…</div>}
      <div className="legend">
        <span><i className="dot primary" /> primary</span>
        <span><i className="dot secondary" /> secondary</span>
      </div>
    </div>
  );
}
