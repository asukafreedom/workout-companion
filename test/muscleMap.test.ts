import { describe, expect, it } from 'vitest';
import { groupsForMeshName, MUSCLE_PATTERNS } from '../src/three/muscleMap';
import { MUSCLE_IDS } from '../src/data/types';
import names from './fixtures/anatomy-mesh-names.json';

describe('muscleMap', () => {
  it('defines a pattern for every muscle group', () => {
    for (const id of MUSCLE_IDS) expect(MUSCLE_PATTERNS[id]).toBeInstanceOf(RegExp);
  });

  it('every group matches at least one real mesh name', () => {
    for (const id of MUSCLE_IDS) {
      const hits = (names as string[]).filter((n) => groupsForMeshName(n).includes(id));
      expect(hits.length, `group ${id}`).toBeGreaterThan(0);
    }
  });

  it('maps signature meshes to the right groups', () => {
    // Live GLB names use underscores — the matcher must normalize them.
    expect(groupsForMeshName('abdominal_part_of_left_pectoralis_major')).toContain('pecs');
    expect(groupsForMeshName('clavicular_part_of_right_deltoid')).toContain('deltFront');
    expect(groupsForMeshName('clavicular part of left pectoralis major')).toContain('pecs');
    expect(groupsForMeshName('acromial part of right deltoid')).toContain('deltSide');
    expect(groupsForMeshName('clavicular part of left deltoid')).toContain('deltFront');
    expect(groupsForMeshName('left latissimus dorsi')).toContain('lats');
    expect(groupsForMeshName('right biceps femoris')).toContain('hamstrings');
    expect(groupsForMeshName('left biceps brachii')).toContain('biceps');
    expect(groupsForMeshName('right gastrocnemius')).toContain('calves');
    expect(groupsForMeshName('left rectus abdominis')).toContain('abs');
  });

  it('never assigns one mesh to conflicting arm groups', () => {
    for (const n of names as string[]) {
      const g = groupsForMeshName(n);
      expect(!(g.includes('biceps') && g.includes('hamstrings')), n).toBe(true);
      expect(!(g.includes('quads') && g.includes('forearms')), n).toBe(true);
    }
  });
});
