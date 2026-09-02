import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { LoadType, MotionHint } from '../data/types';

const ACCENT = '#4f8ef7';

type EquipmentKind = 'dumbbell' | 'barbell' | 'handle' | null;

function equipmentFor(loadType: LoadType): EquipmentKind {
  switch (loadType) {
    case 'dumbbell': return 'dumbbell';
    case 'total': return 'barbell';
    case 'machine': return 'handle';
    default: return null; // bodyweight / assisted: the pulse alone reads better
  }
}

/** Schematic equipment that rides the movement path, showing range and direction. */
function EquipmentGhost({ kind }: { kind: Exclude<EquipmentKind, null> }) {
  const barLength = kind === 'barbell' ? 1.0 : kind === 'dumbbell' ? 0.3 : 0.45;
  const discRadius = kind === 'barbell' ? 0.08 : kind === 'dumbbell' ? 0.05 : 0;
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, barLength, 10]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.6} transparent opacity={0.9} />
      </mesh>
      {discRadius > 0 &&
        [-1, 1].map((side) => (
          <mesh key={side} position={[side * (barLength / 2 - 0.02), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[discRadius, discRadius, 0.035, 14]} />
            <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.4} transparent opacity={0.75} />
          </mesh>
        ))}
    </group>
  );
}

function Arc({ points, equipment }: { points: [number, number, number][]; equipment: EquipmentKind }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    [points],
  );
  const rider = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    if (!rider.current) return;
    const el = clock.getElapsedTime();
    // Ping-pong with sinusoidal easing: one full rep every 3 seconds.
    const u = (Math.sin((el / 3) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    curve.getPointAt(u, tmp);
    rider.current.position.copy(tmp);
  });
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 32, 0.012, 8, false]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.6} />
      </mesh>
      <group ref={rider}>
        {equipment ? (
          <EquipmentGhost kind={equipment} />
        ) : (
          <mesh>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.5} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function Arrow({ points }: { points: [number, number, number][] }) {
  const { quat, midLocal, toLocal, len } = useMemo(() => {
    const from = new THREE.Vector3(...points[0]);
    const to = new THREE.Vector3(...points[1]);
    const dir = to.clone().sub(from);
    const len = dir.length();
    const mid = from.clone().add(dir.clone().multiplyScalar(0.5));
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    const inv = quat.clone().invert();
    return { quat, midLocal: mid.applyQuaternion(inv), toLocal: to.applyQuaternion(inv), len };
  }, [points]);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const headMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const o = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin((clock.getElapsedTime() / 1.2) * Math.PI * 2));
    if (mat.current) mat.current.opacity = o;
    if (headMat.current) headMat.current.opacity = o;
  });
  return (
    <group quaternion={quat}>
      <mesh position={midLocal}>
        <cylinderGeometry args={[0.01, 0.01, Math.max(0.01, len - 0.08), 8]} />
        <meshBasicMaterial ref={mat} color={ACCENT} transparent />
      </mesh>
      <mesh position={toLocal}>
        <coneGeometry args={[0.035, 0.08, 10]} />
        <meshBasicMaterial ref={headMat} color={ACCENT} transparent />
      </mesh>
    </group>
  );
}

export default function MotionHints({ hints, loadType }: { hints: MotionHint[]; loadType: LoadType }) {
  const equipment = equipmentFor(loadType);
  return (
    <group>
      {hints.map((h, i) =>
        h.kind === 'arc' ? (
          <Arc key={i} points={h.points} equipment={equipment} />
        ) : (
          <Arrow key={i} points={h.points} />
        ),
      )}
    </group>
  );
}
