import type { MuscleId } from '../data/types';

/**
 * Maps BodyParts3D/Z-Anatomy mesh names (e.g. "clavicular part of left
 * pectoralis major") to the app's muscle groups. Meshes matching no
 * pattern render in the neutral clay tone.
 */
export const MUSCLE_PATTERNS: Record<MuscleId, RegExp> = {
  deltFront: /clavicular part of \w+ deltoid/i,
  deltSide: /acromial part of \w+ deltoid/i,
  deltRear: /(spinal|scapular) part of \w+ deltoid/i,
  pecs: /pectoralis (major|minor)/i,
  lats: /latissimus dorsi|teres major/i,
  traps: /trapezius/i,
  midBack: /rhomboid|infraspinatus|teres minor|subscapularis/i,
  erectors: /erector spinae|iliocostalis|longissimus|spinalis|multifidus|splenius/i,
  biceps: /biceps brachii|brachialis(?! )|coracobrachialis/i,
  triceps: /triceps brachii|anconeus/i,
  forearms:
    /carpi|brachioradialis|pronator|supinator|palmaris|flexor digitorum (profundus|superficialis)|pollicis longus(?!.*foot)|extensor digitorum(?! (longus|brevis))/i,
  abs: /rectus abdominis|pyramidalis/i,
  obliques: /(external|internal) oblique|transversus abdominis/i,
  glutes: /gluteus/i,
  quads: /rectus femoris|vastus|sartorius/i,
  hamstrings: /biceps femoris|semitendinosus|semimembranosus/i,
  calves: /gastrocnemius|soleus|plantaris(?! )/i,
  adductors: /adductor (longus|brevis|magnus|minimus)|gracilis|pectineus/i,
};

const ENTRIES = Object.entries(MUSCLE_PATTERNS) as [MuscleId, RegExp][];

export function groupsForMeshName(name: string): MuscleId[] {
  // GLB mesh names use underscores ("left_pectoralis_major"); patterns use spaces.
  const normalized = name.replace(/_/g, ' ');
  return ENTRIES.filter(([, re]) => re.test(normalized)).map(([id]) => id);
}
