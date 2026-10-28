import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// CC0 models from Poly Haven, pre-simplified (see public/models/CREDITS.txt).
export const CHAIR_URL = '/models/dining_chair_02.glb';
export const PLANT_URL = '/models/potted_plant_02.glb';
const VASE_URL = '/models/ceramic_vase_01.glb';
const CHANDELIER_URL = '/models/chandelier_01.glb';
const STOOL_URL = '/models/bar_chair_round_01.glb';
const SOFA_URL = '/models/sofa_01.glb';
const OTTOMAN_URL = '/models/ottoman_01.glb';

for (const url of [CHAIR_URL, PLANT_URL, VASE_URL, CHANDELIER_URL, STOOL_URL, SOFA_URL, OTTOMAN_URL]) useGLTF.preload(url);

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

export const usePlantModel = () => useGLTF(PLANT_URL).scene;
export const useVaseModel = () => useGLTF(VASE_URL).scene;
// hangs from its origin, about 0.8 m drop
export const useChandelierModel = () => useGLTF(CHANDELIER_URL).scene;
export const useStoolModel = () => useGLTF(STOOL_URL).scene;
// 1.6 m wide, faces +z
export const useSofaModel = () => useGLTF(SOFA_URL).scene;
export const useOttomanModel = () => useGLTF(OTTOMAN_URL).scene;
