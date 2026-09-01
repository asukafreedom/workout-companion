import { useMemo } from 'react';
import type { MuscleId, PoseId } from '../data/types';
import { BODY_PARTS, MUSCLES, PIVOTS, type MeshDef } from './muscles';
import { POSES } from './poses';

const COLORS = {
  body: '#232833',
  muscle: '#5a5148',
  primary: '#e5484d',
  secondary: '#f5a524',
};

const MIRROR_PARENT: Record<string, MeshDef['parent']> = {
  armL: 'armR', thighL: 'thighR', shinL: 'shinR', torso: 'torso', root: 'root',
};

function expand(defs: MeshDef[]): MeshDef[] {
  const out: MeshDef[] = [];
  for (const d of defs) {
    out.push(d);
    if (d.mirror) {
      out.push({
        ...d,
        parent: MIRROR_PARENT[d.parent],
        pos: [-d.pos[0], d.pos[1], d.pos[2]],
        rot: d.rot ? [d.rot[0], -d.rot[1], -d.rot[2]] : undefined,
      });
    }
  }
  return out;
}

function Capsule({ def, color, emissive }: { def: MeshDef; color: string; emissive: number }) {
  const pivot = def.parent === 'root' ? [0, 0, 0] : PIVOTS[def.parent];
  return (
    <mesh
      position={[def.pos[0] - pivot[0], def.pos[1] - pivot[1], def.pos[2] - pivot[2]]}
      rotation={def.rot ?? [0, 0, 0]}
    >
      <capsuleGeometry args={[def.radius, def.length, 6, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive} roughness={0.6} />
    </mesh>
  );
}

interface Props { primary: MuscleId[]; secondary: MuscleId[]; pose: PoseId }

export default function Figure({ primary, secondary, pose }: Props) {
  const all = useMemo(() => expand([...BODY_PARTS, ...MUSCLES]), []);
  const p = POSES[pose];

  const colorFor = (d: MeshDef) => {
    if (!d.id) return { color: COLORS.body, emissive: 0 };
    if (primary.includes(d.id)) return { color: COLORS.primary, emissive: 0.55 };
    if (secondary.includes(d.id)) return { color: COLORS.secondary, emissive: 0.35 };
    return { color: COLORS.muscle, emissive: 0 };
  };

  const groups: Exclude<MeshDef['parent'], 'root'>[] = ['torso', 'armL', 'armR', 'thighL', 'thighR', 'shinL', 'shinR'];

  return (
    <group position={p.rootPos ?? [0, 0, 0]} rotation={p.rootRot ?? [0, 0, 0]}>
      {groups.map((g) => (
        <group key={g} position={PIVOTS[g]} rotation={p[g] ?? [0, 0, 0]}>
          {all.filter((d) => d.parent === g).map((d, i) => (
            <Capsule key={`${g}-${i}`} def={d} {...colorFor(d)} />
          ))}
        </group>
      ))}
    </group>
  );
}
