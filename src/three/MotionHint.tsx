import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MotionHint } from '../data/types';

const ACCENT = '#4f8ef7';

function Arc({ points }: { points: [number, number, number][] }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    [points],
  );
  const ball = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const u = (clock.getElapsedTime() % 2) / 2;
    ball.current?.position.copy(curve.getPointAt(u));
  });
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 32, 0.012, 8, false]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.6} />
      </mesh>
      <mesh ref={ball}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

function Arrow({ points }: { points: [number, number, number][] }) {
  const from = new THREE.Vector3(...points[0]);
  const to = new THREE.Vector3(...points[1]);
  const dir = to.clone().sub(from);
  const len = dir.length();
  const mid = from.clone().add(dir.clone().multiplyScalar(0.5));
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const headMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const o = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin((clock.getElapsedTime() / 1.2) * Math.PI * 2));
    if (mat.current) mat.current.opacity = o;
    if (headMat.current) headMat.current.opacity = o;
  });
  return (
    <group quaternion={quat}>
      <mesh position={mid.clone().applyQuaternion(quat.clone().invert())}>
        <cylinderGeometry args={[0.01, 0.01, Math.max(0.01, len - 0.08), 8]} />
        <meshBasicMaterial ref={mat} color={ACCENT} transparent />
      </mesh>
      <mesh position={to.clone().applyQuaternion(quat.clone().invert())}>
        <coneGeometry args={[0.035, 0.08, 10]} />
        <meshBasicMaterial ref={headMat} color={ACCENT} transparent />
      </mesh>
    </group>
  );
}

export default function MotionHints({ hints }: { hints: MotionHint[] }) {
  return (
    <group>
      {hints.map((h, i) =>
        h.kind === 'arc' ? <Arc key={i} points={h.points} /> : <Arrow key={i} points={h.points} />,
      )}
    </group>
  );
}
