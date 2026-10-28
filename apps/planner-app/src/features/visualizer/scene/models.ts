import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// CC0 models from Poly Haven, pre-simplified (see public/models/CREDITS.txt).
export const CHAIR_URL = '/models/dining_chair_02.glb';
export const PLANT_URL = '/models/potted_plant_02.glb';

useGLTF.preload(CHAIR_URL);
useGLTF.preload(PLANT_URL);

// The chair is a single mesh, so its geometry and material can drive one
// InstancedMesh for every seat in the room.
export function useChairModel() {
  const { scene } = useGLTF(CHAIR_URL);
  return useMemo(() => {
    scene.updateMatrixWorld(true);
    let mesh: THREE.Mesh | null = null;
    scene.traverse((o) => {
      if (!mesh && (o as THREE.Mesh).isMesh) mesh = o as THREE.Mesh;
    });
    const m = mesh as unknown as THREE.Mesh;
    const geometry = m.geometry.clone().applyMatrix4(m.matrixWorld);
    return { geometry, material: m.material as THREE.Material };
  }, [scene]);
}

export function usePlantModel() {
  return useGLTF(PLANT_URL).scene;
}
