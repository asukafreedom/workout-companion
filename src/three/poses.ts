import type { PoseId } from '../data/types';

type V3 = [number, number, number];
export interface Pose {
  rootPos?: V3; rootRot?: V3;
  torso?: V3; armL?: V3; armR?: V3;
  thighL?: V3; thighR?: V3; shinL?: V3; shinR?: V3;
}

/** Rotations in radians, applied at each group's pivot. Starting values — tune visually. */
export const POSES: Record<PoseId, Pose> = {
  standing: {},
  seated: { thighL: [-1.5, 0, 0], thighR: [-1.5, 0, 0], shinL: [1.5, 0, 0], shinR: [1.5, 0, 0], rootPos: [0, -0.35, 0] },
  incline: { rootRot: [-0.55, 0, 0], rootPos: [0, -0.15, 0.1], thighL: [-0.9, 0, 0], thighR: [-0.9, 0, 0], shinL: [0.9, 0, 0], shinR: [0.9, 0, 0] },
  hinged: { rootPos: [0, -0.05, 0], torso: [0.6, 0, 0], armL: [-0.5, 0, 0], armR: [-0.5, 0, 0], thighL: [-0.18, 0, 0], thighR: [-0.18, 0, 0] },
  lying: { rootRot: [-Math.PI / 2, 0, -Math.PI / 2], rootPos: [-0.9, 1.0, 0] },
  split: { thighL: [-0.6, 0, 0], shinL: [0.6, 0, 0], thighR: [0.35, 0, 0] },
  hanging: { armL: [3.1, 0, 0], armR: [3.1, 0, 0], rootPos: [0, -0.2, 0] },
};
