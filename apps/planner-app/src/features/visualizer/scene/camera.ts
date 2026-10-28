import * as THREE from 'three';
import type { CameraControls } from '@react-three/drei';

export const EYE = 1.62;
// In walk and fly the orbit point sits just ahead of the camera, so dragging
// turns the view in place, like looking around a room.
export const LOOK = 0.05;

// Shared so the floor can ask the camera to walk somewhere.
let controls: CameraControls | null = null;

export const setControls = (c: CameraControls | null) => {
  controls = c;
};

export function walkTo(x: number, z: number) {
  if (!controls) return;
  const cam = controls.camera.position;
  const dir = new THREE.Vector3(x - cam.x, 0, z - cam.z);
  // stop a little short so you don't end up inside a chair
  const len = Math.max(0, dir.length() - 0.6);
  if (len < 0.05) return;
  dir.setLength(len);
  const fwd = controls.getTarget(new THREE.Vector3()).sub(cam).setY(0).normalize().multiplyScalar(LOOK);
  void controls.setLookAt(cam.x + dir.x, EYE, cam.z + dir.z, cam.x + dir.x + fwd.x, EYE, cam.z + dir.z + fwd.z, true);
}
