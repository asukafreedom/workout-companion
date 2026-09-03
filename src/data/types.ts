export type LoadType = 'dumbbell' | 'machine' | 'total' | 'bodyweight' | 'assisted';


export const MUSCLE_IDS = [
  'deltFront', 'deltSide', 'deltRear', 'pecs', 'lats', 'traps', 'midBack',
  'erectors', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'glutes',
  'quads', 'hamstrings', 'calves', 'adductors',
] as const;
export type MuscleId = (typeof MUSCLE_IDS)[number];

export interface MotionHint {
  kind: 'arc' | 'arrow';
  /** arc: >=3 control points of a smooth curve; arrow: exactly [from, to] */
  points: [number, number, number][];
}

export interface Exercise {
  id: string;
  name: string;
  /** Exercises sharing a slot are or-variants; each keeps its own history. */
  slot: string;
  sets: number;
  repMin: number;
  repMax: number;
  loadType: LoadType;
  restSec: number;
  primary: MuscleId[];
  secondary: MuscleId[];
  hints: MotionHint[];
  cues: string[];
  feel: string;
  /** e.g. "each leg" */
  repNote?: string;
}

export interface Workout {
  id: string;
  name: string;
  /** ordered slot ids */
  slots: string[];
  note?: string;
}

export type DayPlan =
  | { kind: 'workout'; workoutId: string; note?: string }
  | { kind: 'cardio'; text: string }
  | { kind: 'rest'; text: string };

export interface SetLog {
  date: string; // YYYY-MM-DD local
  exerciseId: string;
  setIndex: number; // 0-based
  weightKg: number; // for 'assisted': the assist weight; for 'bodyweight': 0
  reps: number;
}

export interface BodyWeight { date: string; kg: number }

export interface UserData {
  version: 1;
  setLogs: SetLog[];
  bodyWeights: BodyWeight[];
  settings: {
    restTimerSound: boolean;
    viewerCollapsed?: boolean;
    goalKg?: number;
    lastBackup?: string;
    /** slot id -> chosen exercise id */
    variantChoice?: Record<string, string>;
  };
}
