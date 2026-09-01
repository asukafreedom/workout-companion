import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Exercise } from '../data/types';
import Figure from './Figure';

export default function Viewer({ exercise }: { exercise: Exercise }) {
  const [touched, setTouched] = useState(false);
  return (
    <div className="viewer" onPointerDown={() => setTouched(true)}>
      <Canvas camera={{ position: [0, 1.5, 3.3], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <directionalLight position={[-3, 2, -4]} intensity={0.4} />
        <Suspense fallback={null}>
          <Figure primary={exercise.primary} secondary={exercise.secondary} pose={exercise.pose} />
          {/* MotionHint meshes mount here in Task 11 */}
        </Suspense>
        <OrbitControls
          target={[0, 1.0, 0]}
          enablePan={false}
          minDistance={1.2}
          maxDistance={4.5}
          autoRotate={!touched}
          autoRotateSpeed={1.2}
        />
      </Canvas>
      <div className="legend">
        <span><i className="dot primary" /> primary</span>
        <span><i className="dot secondary" /> secondary</span>
      </div>
    </div>
  );
}
