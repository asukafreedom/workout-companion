import type { DayPlan, Exercise, Workout } from './types';

export const EXERCISES: Exercise[] = [
  // ---------- Upper Body A (Monday) ----------
  {
    id: 'bench-press', name: 'Bench Press', slot: 'benchA',
    sets: 3, repMin: 6, repMax: 10, loadType: 'total', restSec: 120,
    primary: ['pecs'], secondary: ['deltFront', 'triceps'], pose: 'lying',
    hints: [{ kind: 'arc', points: [[0, 1.35, 0.15], [0, 1.45, 0.35], [0, 1.5, 0.45]] }],
    cues: ['Shoulder blades pinched and down', 'Bar touches mid-chest', 'Feet planted, slight arch', 'Press up and slightly back', "Don't bounce off the chest"],
    feel: 'Chest, front delts, triceps',
  },
  {
    id: 'db-press', name: 'Dumbbell Press', slot: 'benchA',
    sets: 3, repMin: 6, repMax: 10, loadType: 'dumbbell', restSec: 120,
    primary: ['pecs'], secondary: ['deltFront', 'triceps'], pose: 'lying',
    hints: [{ kind: 'arc', points: [[0.25, 1.35, 0.15], [0.15, 1.45, 0.35], [0.05, 1.5, 0.45]] }],
    cues: ['Dumbbells start at chest level', 'Press up and slightly together', 'Elbows about 45° from torso', 'Control the descent'],
    feel: 'Chest, front delts, triceps',
  },
  {
    id: 'lat-pulldown-a', name: 'Lat Pulldown', slot: 'latPulldownA',
    sets: 3, repMin: 8, repMax: 12, loadType: 'machine', restSec: 90,
    primary: ['lats'], secondary: ['biceps', 'midBack'], pose: 'seated',
    hints: [{ kind: 'arrow', points: [[0.3, 1.8, 0.1], [0.3, 1.3, 0.05]] }],
    cues: ['Slight lean back, chest up', 'Pull the bar to your upper chest', 'Drive elbows down and back', 'Squeeze, then control the way up'],
    feel: 'Lats (sides of your back), biceps',
  },
  {
    id: 'seated-cable-row', name: 'Seated Cable Row', slot: 'rowA',
    sets: 3, repMin: 8, repMax: 12, loadType: 'machine', restSec: 90,
    primary: ['midBack', 'lats'], secondary: ['biceps', 'deltRear'], pose: 'seated',
    hints: [{ kind: 'arrow', points: [[0.15, 1.3, 0.5], [0.15, 1.25, 0.0]] }],
    cues: ['Sit tall, chest proud', 'Pull the handle to your stomach', 'Squeeze shoulder blades together', "Don't yank with your lower back"],
    feel: 'Mid-back, lats, biceps',
  },
  {
    id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', slot: 'ohpA',
    sets: 3, repMin: 8, repMax: 12, loadType: 'dumbbell', restSec: 120,
    primary: ['deltFront', 'deltSide'], secondary: ['triceps'], pose: 'seated',
    hints: [{ kind: 'arc', points: [[0.35, 1.5, 0.05], [0.3, 1.75, 0.02], [0.15, 1.95, 0]] }],
    cues: ['Start at ear height', 'Press up and slightly in', "Don't shrug your shoulders up", 'Ribs down, no lower-back arch'],
    feel: 'Shoulders, triceps',
  },
  {
    id: 'lateral-raise-a', name: 'Lateral Raises', slot: 'latRaiseA',
    sets: 3, repMin: 12, repMax: 15, loadType: 'dumbbell', restSec: 90,
    primary: ['deltSide'], secondary: ['traps'], pose: 'standing',
    hints: [{ kind: 'arc', points: [[0.32, 1.0, 0.02], [0.5, 1.25, 0.02], [0.6, 1.5, 0.02]] }],
    cues: ['Raise to shoulder height, no higher', 'Lead with your elbows', 'Slight forward lean is fine', 'Lower slowly — no swinging'],
    feel: 'Side delts (shoulder caps)',
  },
  {
    id: 'triceps-pushdown', name: 'Triceps Pushdown', slot: 'triA',
    sets: 3, repMin: 10, repMax: 15, loadType: 'machine', restSec: 90,
    primary: ['triceps'], secondary: [], pose: 'standing',
    hints: [{ kind: 'arrow', points: [[0.3, 1.35, 0.15], [0.3, 1.0, 0.15]] }],
    cues: ['Elbows pinned to your sides', 'Push down to full lockout', 'Squeeze at the bottom', 'Only forearms move'],
    feel: 'Back of the upper arms',
  },
  {
    id: 'db-curl', name: 'Dumbbell Curl', slot: 'curlA',
    sets: 3, repMin: 10, repMax: 15, loadType: 'dumbbell', restSec: 90,
    primary: ['biceps'], secondary: ['forearms'], pose: 'standing',
    hints: [{ kind: 'arc', points: [[0.34, 1.0, 0.1], [0.38, 1.2, 0.25], [0.34, 1.4, 0.3]] }],
    cues: ['Elbows stay by your sides', 'Curl up without swinging', 'Squeeze at the top', 'Lower under control'],
    feel: 'Biceps, forearms',
  },
  // ---------- Lower Body A (Tuesday) ----------
  {
    id: 'squat', name: 'Squat', slot: 'squatA',
    sets: 3, repMin: 6, repMax: 10, loadType: 'total', restSec: 120,
    primary: ['quads', 'glutes'], secondary: ['erectors', 'adductors'], pose: 'standing',
    hints: [{ kind: 'arrow', points: [[0, 1.6, -0.15], [0, 1.1, -0.15]] }],
    cues: ['Brace your core before each rep', 'Sit down between your hips', 'Knees track over toes', 'Drive the floor away', 'Depth: thighs at least parallel'],
    feel: 'Quads, glutes',
  },
  {
    id: 'leg-press-a', name: 'Leg Press', slot: 'squatA',
    sets: 3, repMin: 6, repMax: 10, loadType: 'machine', restSec: 120,
    primary: ['quads', 'glutes'], secondary: ['adductors'], pose: 'seated',
    hints: [{ kind: 'arrow', points: [[0.12, 0.8, 0.5], [0.12, 0.9, 0.15]] }],
    cues: ['Feet mid-platform, shoulder width', 'Lower until knees ~90°', "Don't let your lower back roll up", 'Press through mid-foot, no hard lockout'],
    feel: 'Quads, glutes',
  },
  {
    id: 'rdl', name: 'Romanian Deadlift', slot: 'rdlA',
    sets: 3, repMin: 8, repMax: 10, loadType: 'total', restSec: 120,
    primary: ['hamstrings', 'glutes'], secondary: ['erectors'], pose: 'hinged',
    hints: [{ kind: 'arc', points: [[0, 1.35, 0.12], [0, 0.9, 0.15], [0, 0.6, 0.15]] }],
    cues: ['Soft knees, hinge at the hips', 'Push your hips back', 'Bar slides down your thighs', 'Flat back the whole way', 'Stop when hamstrings pull hard'],
    feel: 'Hamstrings, glutes',
  },
  {
    id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', slot: 'splitA',
    sets: 3, repMin: 8, repMax: 10, loadType: 'dumbbell', restSec: 90, repNote: 'each leg',
    primary: ['quads', 'glutes'], secondary: ['adductors', 'hamstrings'], pose: 'split',
    hints: [{ kind: 'arrow', points: [[0.12, 1.2, 0.15], [0.12, 0.75, 0.15]] }],
    cues: ['Rear foot on the bench', 'Drop straight down', 'Front knee tracks over toes', 'Push through the front heel'],
    feel: 'Front-leg quad and glute',
  },
  {
    id: 'leg-curl-a', name: 'Leg Curl', slot: 'legCurlA',
    sets: 3, repMin: 10, repMax: 15, loadType: 'machine', restSec: 90,
    primary: ['hamstrings'], secondary: ['calves'], pose: 'lying',
    hints: [{ kind: 'arc', points: [[0.12, 0.2, -0.35], [0.12, 0.35, -0.55], [0.12, 0.6, -0.6] ] }],
    cues: ['Hips stay down on the pad', 'Curl your heels to your glutes', 'Squeeze at the top', 'Lower slowly'],
    feel: 'Hamstrings',
  },
  {
    id: 'calf-raise-a', name: 'Calf Raise', slot: 'calfA',
    sets: 3, repMin: 12, repMax: 15, loadType: 'machine', restSec: 90,
    primary: ['calves'], secondary: [], pose: 'standing',
    hints: [{ kind: 'arrow', points: [[0.13, 0.05, -0.05], [0.13, 0.3, -0.05]] }],
    cues: ['Full stretch at the bottom', 'Rise as high as you can', 'Pause one second at the top', "Don't bounce"],
    feel: 'Calves',
  },
  {
    id: 'cable-crunch', name: 'Cable Crunch', slot: 'absA',
    sets: 3, repMin: 10, repMax: 15, loadType: 'machine', restSec: 90,
    primary: ['abs'], secondary: ['obliques'], pose: 'seated',
    hints: [{ kind: 'arc', points: [[0, 1.6, 0.1], [0, 1.4, 0.25], [0, 1.2, 0.3]] }],
    cues: ['Hips stay still', 'Crunch your ribs toward your pelvis', 'Round your upper back on purpose', 'Exhale hard at the bottom'],
    feel: 'Abs',
  },
  // ---------- Upper Body B (Thursday) ----------
  {
    id: 'incline-db-press', name: 'Incline Dumbbell Press', slot: 'inclineB',
    sets: 3, repMin: 8, repMax: 12, loadType: 'dumbbell', restSec: 120,
    primary: ['pecs', 'deltFront'], secondary: ['triceps'], pose: 'incline',
    hints: [{ kind: 'arc', points: [[0.25, 1.4, 0.2], [0.15, 1.6, 0.35], [0.05, 1.75, 0.4]] }],
    cues: ['Bench at ~30°', 'Press up and slightly together', 'Elbows ~45° from torso', 'Stretch at the bottom, no clang at the top'],
    feel: 'Upper chest, front delts',
  },
  {
    id: 'assisted-pullup', name: 'Assisted Pull-Up', slot: 'pullB',
    sets: 3, repMin: 8, repMax: 12, loadType: 'assisted', restSec: 90,
    primary: ['lats'], secondary: ['biceps', 'midBack'], pose: 'hanging',
    hints: [{ kind: 'arrow', points: [[0, 1.2, 0], [0, 1.6, 0]] }],
    cues: ['Full hang at the bottom', 'Pull your chest to the bar', 'Drive elbows down', 'Lower all the way, under control'],
    feel: 'Lats, biceps',
  },
  {
    id: 'lat-pulldown-b', name: 'Lat Pulldown', slot: 'pullB',
    sets: 3, repMin: 8, repMax: 12, loadType: 'machine', restSec: 90,
    primary: ['lats'], secondary: ['biceps', 'midBack'], pose: 'seated',
    hints: [{ kind: 'arrow', points: [[0.3, 1.8, 0.1], [0.3, 1.3, 0.05]] }],
    cues: ['Slight lean back, chest up', 'Pull the bar to your upper chest', 'Drive elbows down and back', 'Squeeze, then control the way up'],
    feel: 'Lats, biceps',
  },
  {
    id: 'chest-supported-row', name: 'Chest-Supported Row', slot: 'rowB',
    sets: 3, repMin: 8, repMax: 12, loadType: 'machine', restSec: 90,
    primary: ['midBack'], secondary: ['lats', 'biceps', 'deltRear'], pose: 'incline',
    hints: [{ kind: 'arrow', points: [[0.2, 1.1, 0.35], [0.2, 1.25, 0.0]] }],
    cues: ['Chest glued to the pad', 'Row elbows up and back', 'Squeeze shoulder blades', 'No jerking — the pad keeps you honest'],
    feel: 'Mid-back, rear delts',
  },
  {
    id: 'chest-fly', name: 'Cable / Machine Chest Fly', slot: 'flyB',
    sets: 3, repMin: 10, repMax: 15, loadType: 'machine', restSec: 90,
    primary: ['pecs'], secondary: ['deltFront'], pose: 'seated',
    hints: [{ kind: 'arc', points: [[0.5, 1.4, 0.1], [0.3, 1.42, 0.35], [0.05, 1.44, 0.45]] }],
    cues: ['Slight elbow bend, keep it fixed', 'Hug a barrel — arms sweep together', 'Feel the stretch, don\'t overreach', 'Squeeze your chest at the middle'],
    feel: 'Chest',
  },
  {
    id: 'lateral-raise-b', name: 'Lateral Raise', slot: 'latRaiseB',
    sets: 3, repMin: 12, repMax: 20, loadType: 'dumbbell', restSec: 90,
    primary: ['deltSide'], secondary: ['traps'], pose: 'standing',
    hints: [{ kind: 'arc', points: [[0.32, 1.0, 0.02], [0.5, 1.25, 0.02], [0.6, 1.5, 0.02]] }],
    cues: ['Raise to shoulder height, no higher', 'Lead with your elbows', 'Slight forward lean is fine', 'Lower slowly — no swinging'],
    feel: 'Side delts (shoulder caps)',
  },
  {
    id: 'rear-delt-fly', name: 'Rear Delt Fly', slot: 'rearDeltB',
    sets: 3, repMin: 12, repMax: 20, loadType: 'dumbbell', restSec: 90,
    primary: ['deltRear'], secondary: ['midBack', 'traps'], pose: 'hinged',
    hints: [{ kind: 'arc', points: [[0.2, 0.9, 0.25], [0.45, 1.05, 0.05], [0.55, 1.15, -0.1]] }],
    cues: ['Hinge over, flat back', 'Sweep arms wide, not back', 'Pinkies lead slightly up', 'Light weight, strict reps'],
    feel: 'Rear delts, upper back',
  },
  {
    id: 'biceps-curl-b', name: 'Biceps Curl', slot: 'curlB',
    sets: 3, repMin: 10, repMax: 15, loadType: 'dumbbell', restSec: 90,
    primary: ['biceps'], secondary: ['forearms'], pose: 'standing',
    hints: [{ kind: 'arc', points: [[0.34, 1.0, 0.1], [0.38, 1.2, 0.25], [0.34, 1.4, 0.3]] }],
    cues: ['Elbows stay by your sides', 'Curl up without swinging', 'Squeeze at the top', 'Lower under control'],
    feel: 'Biceps, forearms',
  },
  {
    id: 'overhead-triceps-ext', name: 'Overhead Triceps Extension', slot: 'triB',
    sets: 3, repMin: 10, repMax: 15, loadType: 'dumbbell', restSec: 90,
    primary: ['triceps'], secondary: [], pose: 'seated',
    hints: [{ kind: 'arc', points: [[0.1, 1.6, -0.15], [0.12, 1.85, -0.05], [0.1, 2.0, 0.05]] }],
    cues: ['Elbows point at the ceiling', 'Lower behind your head', 'Big stretch at the bottom', 'Extend without flaring elbows'],
    feel: 'Back of the upper arms (long head)',
  },
  // ---------- Lower Body B (Saturday) ----------
  {
    id: 'trap-bar-deadlift', name: 'Trap-Bar Deadlift', slot: 'hingeB',
    sets: 3, repMin: 5, repMax: 8, loadType: 'total', restSec: 120,
    primary: ['glutes', 'hamstrings', 'quads'], secondary: ['erectors', 'traps', 'forearms'], pose: 'hinged',
    hints: [{ kind: 'arrow', points: [[0.25, 0.5, 0.05], [0.25, 1.0, 0.05]] }],
    cues: ['Chest up, flat back', 'Push the floor away', 'Stand tall, squeeze glutes', 'Reset each rep — no bouncing'],
    feel: 'Whole lower body + grip',
  },
  {
    id: 'hack-squat', name: 'Hack Squat', slot: 'hingeB',
    sets: 3, repMin: 5, repMax: 8, loadType: 'machine', restSec: 120,
    primary: ['quads'], secondary: ['glutes', 'adductors'], pose: 'standing',
    hints: [{ kind: 'arrow', points: [[0, 1.5, -0.1], [0, 1.0, -0.1]] }],
    cues: ['Back flat on the pad', 'Lower until knees ~90° or deeper', 'Knees track over toes', 'Drive through mid-foot'],
    feel: 'Quads',
  },
  {
    id: 'leg-press-b', name: 'Leg Press', slot: 'legPressB',
    sets: 3, repMin: 10, repMax: 12, loadType: 'machine', restSec: 120,
    primary: ['quads', 'glutes'], secondary: ['adductors'], pose: 'seated',
    hints: [{ kind: 'arrow', points: [[0.12, 0.8, 0.5], [0.12, 0.9, 0.15]] }],
    cues: ['Feet mid-platform, shoulder width', 'Lower until knees ~90°', "Don't let your lower back roll up", 'Press through mid-foot, no hard lockout'],
    feel: 'Quads, glutes',
  },
  {
    id: 'walking-lunges', name: 'Walking Lunges', slot: 'lungeB',
    sets: 3, repMin: 10, repMax: 10, loadType: 'dumbbell', restSec: 90, repNote: 'each leg',
    primary: ['quads', 'glutes'], secondary: ['hamstrings', 'adductors'], pose: 'split',
    hints: [{ kind: 'arrow', points: [[0, 0.9, 0.1], [0, 0.9, 0.45]] }],
    cues: ['Long step forward', 'Back knee kisses the floor', 'Push off the front heel', 'Stay tall — no leaning'],
    feel: 'Quads, glutes',
  },
  {
    id: 'leg-curl-b', name: 'Leg Curl', slot: 'legCurlB',
    sets: 3, repMin: 10, repMax: 15, loadType: 'machine', restSec: 90,
    primary: ['hamstrings'], secondary: ['calves'], pose: 'lying',
    hints: [{ kind: 'arc', points: [[0.12, 0.2, -0.35], [0.12, 0.35, -0.55], [0.12, 0.6, -0.6]] }],
    cues: ['Hips stay down on the pad', 'Curl your heels to your glutes', 'Squeeze at the top', 'Lower slowly'],
    feel: 'Hamstrings',
  },
  {
    id: 'calf-raise-b', name: 'Calf Raise', slot: 'calfB',
    sets: 3, repMin: 12, repMax: 15, loadType: 'machine', restSec: 90,
    primary: ['calves'], secondary: [], pose: 'standing',
    hints: [{ kind: 'arrow', points: [[0.13, 0.05, -0.05], [0.13, 0.3, -0.05]] }],
    cues: ['Full stretch at the bottom', 'Rise as high as you can', 'Pause one second at the top', "Don't bounce"],
    feel: 'Calves',
  },
  {
    id: 'hanging-knee-raise', name: 'Hanging Knee Raise', slot: 'absB',
    sets: 3, repMin: 8, repMax: 15, loadType: 'bodyweight', restSec: 90,
    primary: ['abs'], secondary: ['obliques', 'forearms'], pose: 'hanging',
    hints: [{ kind: 'arc', points: [[0, 0.5, 0.05], [0, 0.8, 0.25], [0, 1.05, 0.3]] }],
    cues: ['Dead hang, shoulders packed', 'Curl knees toward your chest', 'Tilt your pelvis up at the top', 'No swinging between reps'],
    feel: 'Abs, grip',
  },
];

export const WORKOUTS: Workout[] = [
  {
    id: 'upperA', name: 'Upper Body A',
    slots: ['benchA', 'latPulldownA', 'rowA', 'ohpA', 'latRaiseA', 'triA', 'curlA'],
    note: 'Shoulders and upper back give the biggest visual payoff — a stronger V-shape.',
  },
  {
    id: 'lowerA', name: 'Lower Body A',
    slots: ['squatA', 'rdlA', 'splitA', 'legCurlA', 'calfA', 'absA'],
    note: 'Getting leaner + building the abs is what eventually makes them visible.',
  },
  {
    id: 'upperB', name: 'Upper Body B',
    slots: ['inclineB', 'pullB', 'rowB', 'flyB', 'latRaiseB', 'rearDeltB', 'curlB', 'triB'],
    note: 'Side and rear delts get extra volume on purpose — pressing already covers front delts.',
  },
  {
    id: 'lowerB', name: 'Lower Body B',
    slots: ['hingeB', 'legPressB', 'lungeB', 'legCurlB', 'calfB', 'absB'],
    note: 'Finish with 15–20 min easy incline treadmill walking if you have time.',
  },
];

/** Indexed by JS Date.getDay(): 0 = Sunday. */
export const WEEK: DayPlan[] = [
  { kind: 'rest', text: 'Rest / easy activity. Keep the steps coming — aim for 8,000–10,000 today.' },
  { kind: 'workout', workoutId: 'upperA' },
  { kind: 'workout', workoutId: 'lowerA' },
  { kind: 'cardio', text: '30–40 min easy cardio or walking. Incline treadmill, bike, elliptical, swimming — anything where you can still hold a conversation.' },
  { kind: 'workout', workoutId: 'upperB' },
  { kind: 'rest', text: 'Rest / walking. Easy day — steps still count toward 8,000–10,000.' },
  { kind: 'workout', workoutId: 'lowerB', note: 'Add 15–20 min easy incline walking after, if you have time.' },
];

export function exerciseById(id: string): Exercise {
  const ex = EXERCISES.find((e) => e.id === id);
  if (!ex) throw new Error(`Unknown exercise: ${id}`);
  return ex;
}

export function slotVariants(slot: string): Exercise[] {
  return EXERCISES.filter((e) => e.slot === slot);
}
