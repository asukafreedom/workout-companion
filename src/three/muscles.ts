import type { MuscleId } from '../data/types';

export interface MeshDef {
  id?: MuscleId;
  parent: 'root' | 'torso' | 'armL' | 'armR' | 'thighL' | 'thighR' | 'shinL' | 'shinR';
  pos: [number, number, number];
  rot?: [number, number, number];
  radius: number;
  length: number;
  /** duplicate across x for the right side (armL->armR, thighL->thighR, shinL->shinR, torso stays torso) */
  mirror?: boolean;
}

/** World-space pivot points the posed groups rotate around. */
export const PIVOTS = {
  torso: [0, 0.98, 0] as [number, number, number],
  armL: [0.2, 1.46, 0] as [number, number, number],
  armR: [-0.2, 1.46, 0] as [number, number, number],
  thighL: [0.11, 0.95, 0] as [number, number, number],
  thighR: [-0.11, 0.95, 0] as [number, number, number],
  shinL: [0.12, 0.5, 0] as [number, number, number],
  shinR: [-0.12, 0.5, 0] as [number, number, number],
};

/** Dark silhouette body under the muscles. */
export const BODY_PARTS: MeshDef[] = [
  { parent: 'torso', pos: [0, 1.68, 0], radius: 0.1, length: 0.06 },              // head
  { parent: 'torso', pos: [0, 1.52, 0], radius: 0.055, length: 0.06 },            // neck
  { parent: 'torso', pos: [0, 1.24, 0], radius: 0.155, length: 0.4 },             // torso
  { parent: 'torso', pos: [0, 0.98, 0], radius: 0.135, length: 0.1 },             // pelvis
  { parent: 'armL', pos: [0.215, 1.3, 0], radius: 0.048, length: 0.22, mirror: true },  // upper arm
  { parent: 'armL', pos: [0.22, 1.015, 0], radius: 0.04, length: 0.24, mirror: true },  // forearm bone
  { parent: 'armL', pos: [0.225, 0.85, 0], radius: 0.042, length: 0.04, mirror: true }, // hand
  { parent: 'thighL', pos: [0.12, 0.72, 0], radius: 0.075, length: 0.34, mirror: true }, // thigh
  { parent: 'shinL', pos: [0.12, 0.28, 0], radius: 0.055, length: 0.32, mirror: true },  // shin
  { parent: 'shinL', pos: [0.12, 0.04, 0.06], rot: [1.35, 0, 0], radius: 0.045, length: 0.1, mirror: true }, // foot
];

/** One entry per visible muscle bulge. Every MuscleId appears at least once. */
export const MUSCLES: MeshDef[] = [
  { id: 'deltFront', parent: 'armL', pos: [0.185, 1.435, 0.06], rot: [0.3, 0, -0.5], radius: 0.038, length: 0.03, mirror: true },
  { id: 'deltSide',  parent: 'armL', pos: [0.225, 1.42, 0], rot: [0, 0, -1.0], radius: 0.042, length: 0.05, mirror: true },
  { id: 'deltRear',  parent: 'armL', pos: [0.185, 1.415, -0.06], rot: [-0.3, 0, -0.5], radius: 0.038, length: 0.03, mirror: true },
  { id: 'pecs',      parent: 'torso', pos: [0.1, 1.34, 0.14], rot: [0, 0, 1.2], radius: 0.062, length: 0.08, mirror: true },
  { id: 'lats',      parent: 'torso', pos: [0.14, 1.18, -0.06], rot: [0, 0, 0.35], radius: 0.05, length: 0.2, mirror: true },
  { id: 'traps',     parent: 'torso', pos: [0.08, 1.5, -0.03], rot: [0, 0, 0.95], radius: 0.038, length: 0.09, mirror: true },
  { id: 'midBack',   parent: 'torso', pos: [0.065, 1.34, -0.13], rot: [0, 0, 0.25], radius: 0.042, length: 0.1, mirror: true },
  { id: 'erectors',  parent: 'torso', pos: [0.04, 1.1, -0.14], radius: 0.03, length: 0.28, mirror: true },
  { id: 'biceps',    parent: 'armL', pos: [0.2, 1.3, 0.04], radius: 0.038, length: 0.14, mirror: true },
  { id: 'triceps',   parent: 'armL', pos: [0.21, 1.29, -0.04], radius: 0.04, length: 0.15, mirror: true },
  { id: 'forearms',  parent: 'armL', pos: [0.22, 1.015, 0.018], radius: 0.036, length: 0.19, mirror: true },
  { id: 'abs',       parent: 'torso', pos: [0, 1.13, 0.15], radius: 0.068, length: 0.22 },
  { id: 'obliques',  parent: 'torso', pos: [0.1, 1.1, 0.09], rot: [0, 0, 0.3], radius: 0.038, length: 0.16, mirror: true },
  { id: 'glutes',    parent: 'thighL', pos: [0.09, 0.93, -0.1], rot: [0.4, 0, 0], radius: 0.07, length: 0.06, mirror: true },
  { id: 'quads',     parent: 'thighL', pos: [0.12, 0.7, 0.07], radius: 0.055, length: 0.28, mirror: true },
  { id: 'hamstrings',parent: 'thighL', pos: [0.11, 0.7, -0.07], radius: 0.05, length: 0.26, mirror: true },
  { id: 'calves',    parent: 'shinL', pos: [0.12, 0.32, -0.055], radius: 0.045, length: 0.16, mirror: true },
  { id: 'adductors', parent: 'thighL', pos: [0.055, 0.75, 0.01], radius: 0.04, length: 0.24, mirror: true },
];
