import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { MuscleId } from '../data/types';
import { groupsForMeshName } from './muscleMap';

/** App space: feet at y=0, head ≈ y=1.8, figure faces +z. */
const FIGURE_HEIGHT = 1.8;

const MATERIALS = {
  clay: new THREE.MeshStandardMaterial({ color: '#5a5148', roughness: 0.6 }),
  primary: new THREE.MeshStandardMaterial({
    color: '#e5484d', emissive: '#e5484d', emissiveIntensity: 0.45, roughness: 0.6,
  }),
  secondary: new THREE.MeshStandardMaterial({
    color: '#f5a524', emissive: '#f5a524', emissiveIntensity: 0.3, roughness: 0.6,
  }),
  bone: new THREE.MeshStandardMaterial({ color: '#272b33', roughness: 0.85 }),
};

export interface Focus { center: [number, number, number]; radius: number }

interface Loaded { root: THREE.Group; muscleMeshes: THREE.Mesh[] }

let cache: Promise<Loaded> | null = null;

function loadAnatomy(): Promise<Loaded> {
  if (cache) return cache;
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const base = import.meta.env.BASE_URL + 'models/';
  cache = Promise.all([
    loader.loadAsync(base + 'anatomy.glb'),
    loader.loadAsync(base + 'skeleton.glb'),
  ]).then(([anatomy, skeleton]) => {
    const muscleMeshes: THREE.Mesh[] = [];
    anatomy.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const mesh = o as THREE.Mesh;
        const name = `${mesh.name} ${mesh.parent?.name ?? ''}`;
        mesh.userData.groups = groupsForMeshName(name);
        mesh.material = MATERIALS.clay;
        muscleMeshes.push(mesh);
      }
    });
    skeleton.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = MATERIALS.bone;
    });

    // Source data is Z-up in millimetre-ish units; normalize into app space.
    const inner = new THREE.Group();
    inner.add(skeleton.scene, anatomy.scene);
    inner.rotation.x = -Math.PI / 2;
    const root = new THREE.Group();
    root.add(inner);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const scale = FIGURE_HEIGHT / size.y;
    root.scale.setScalar(scale);
    const scaled = new THREE.Box3().setFromObject(root);
    root.position.set(
      -(scaled.min.x + scaled.max.x) / 2,
      -scaled.min.y,
      -(scaled.min.z + scaled.max.z) / 2,
    );
    root.updateMatrixWorld(true);
    return { root, muscleMeshes };
  });
  return cache;
}

interface Props {
  primary: MuscleId[];
  secondary: MuscleId[];
  onFocus(focus: Focus | null): void;
}

export default function AnatomyModel({ primary, secondary, onFocus }: Props) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let alive = true;
    loadAnatomy().then((l) => alive && setLoaded(l));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const focusBox = new THREE.Box3();
    let any = false;
    for (const mesh of loaded.muscleMeshes) {
      const groups = mesh.userData.groups as MuscleId[];
      const isPrimary = groups.some((g) => primary.includes(g));
      const isSecondary = !isPrimary && groups.some((g) => secondary.includes(g));
      mesh.material = isPrimary ? MATERIALS.primary : isSecondary ? MATERIALS.secondary : MATERIALS.clay;
      if (isPrimary) {
        focusBox.expandByObject(mesh);
        any = true;
      }
    }
    if (any) {
      const center = focusBox.getCenter(new THREE.Vector3());
      const size = focusBox.getSize(new THREE.Vector3());
      onFocus({
        center: [center.x, center.y, center.z],
        radius: Math.max(size.x, size.y, size.z) / 2,
      });
    } else {
      onFocus(null);
    }
  }, [loaded, primary, secondary, onFocus]);

  if (!loaded) return null;
  return <primitive object={loaded.root} />;
}
