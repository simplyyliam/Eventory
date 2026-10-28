import { useEffect, useRef } from 'react';
import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import * as THREE from 'three';
import { useWorkspace } from '@/store/workspace';
import { toMetres, useView, type NavMode, type ViewPreset } from '../viewStore';

export const EYE = 1.62;
// In walk and fly the orbit point sits just ahead of the camera, so dragging
// turns the view in place, like looking around a room.
const LOOK = 0.05;

function presetView(preset: ViewPreset, w: number, d: number) {
  const span = Math.max(w, d);
  switch (preset) {
    case 'top':
      return { pos: [0, span * 1.25, 0.01], target: [0, 0, 0] };
    case 'front':
      return { pos: [0, 2.2, d / 2 + span * 0.35], target: [0, 0.8, 0] };
    default:
      return { pos: [w * 0.62, span * 0.72, d * 0.82], target: [0, 0, 0] };
  }
}

// Shared so the floor can ask the camera to walk somewhere.
let controls: CameraControls | null = null;

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

function configure(c: CameraControls, mode: NavMode, w: number, d: number) {
  const ACTION = CameraControlsImpl.ACTION;
  if (mode === 'orbit') {
    c.minDistance = 2.5;
    c.maxDistance = Math.max(w, d) * 2.4;
    c.minPolarAngle = 0;
    c.maxPolarAngle = Math.PI / 2.08;
    c.infinityDolly = false;
    c.dollyToCursor = true;
    c.azimuthRotateSpeed = 1;
    c.polarRotateSpeed = 1;
    c.mouseButtons.left = ACTION.ROTATE;
    c.mouseButtons.right = ACTION.TRUCK;
    c.mouseButtons.wheel = ACTION.DOLLY;
    c.boundaryEnclosesCamera = false;
    c.setBoundary();
    return;
  }
  c.minDistance = LOOK;
  c.maxDistance = LOOK;
  c.infinityDolly = true;
  c.dollyToCursor = false;
  // dragging should feel like turning your head, so it's inverted and gentler
  c.azimuthRotateSpeed = -0.35;
  c.polarRotateSpeed = -0.35;
  c.mouseButtons.left = ACTION.ROTATE;
  c.mouseButtons.wheel = ACTION.DOLLY;
  c.boundaryEnclosesCamera = true;
  if (mode === 'walk') {
    c.minPolarAngle = Math.PI * 0.3;
    c.maxPolarAngle = Math.PI * 0.68;
    c.mouseButtons.right = ACTION.NONE;
    c.setBoundary(new THREE.Box3(new THREE.Vector3(-w / 2 + 0.4, EYE, -d / 2 + 0.4), new THREE.Vector3(w / 2 - 0.4, EYE, d / 2 - 0.4)));
  } else {
    c.minPolarAngle = 0.05;
    c.maxPolarAngle = Math.PI - 0.05;
    c.mouseButtons.right = ACTION.TRUCK;
    c.setBoundary(new THREE.Box3(new THREE.Vector3(-w * 1.5, 0.4, -d * 1.5), new THREE.Vector3(w * 1.5, Math.max(w, d) * 1.5, d * 1.5)));
  }
}

export function CameraRig({ w, d }: { w: number; d: number }) {
  const ref = useRef<CameraControls>(null);
  const mode = useView((s) => s.mode);
  const preset = useView((s) => s.preset);
  const tick = useView((s) => s.presetTick);
  const selected = useView((s) => s.selected);
  const first = useRef(true);

  useEffect(() => {
    controls = ref.current;
    return () => {
      controls = null;
    };
  }, []);

  // Mode changes glide the camera to a sensible starting point.
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    configure(c, mode, w, d);
    const animate = !first.current;
    first.current = false;
    if (mode === 'orbit') {
      const v = presetView(preset, w, d);
      void c.setLookAt(v.pos[0], v.pos[1], v.pos[2], v.target[0], v.target[1], v.target[2], animate);
    } else if (mode === 'walk') {
      const z = d / 2 - 1.2;
      void c.setLookAt(0, EYE, z, 0, EYE, z - LOOK, animate);
    } else {
      const span = Math.max(w, d);
      const pos = new THREE.Vector3(0, span * 0.32, d / 2 + span * 0.25);
      const ahead = new THREE.Vector3(0, 0.5, 0).sub(pos).setLength(LOOK).add(pos);
      void c.setLookAt(pos.x, pos.y, pos.z, ahead.x, ahead.y, ahead.z, animate);
    }
  }, [mode, preset, tick, w, d]);

  // Glide towards the selected table, keeping the current viewing angle.
  useEffect(() => {
    const c = ref.current;
    if (!c || !selected || mode !== 'orbit') return;
    const t = useWorkspace.getState().tables.find((x) => x.id === selected);
    if (!t) return;
    const target = new THREE.Vector3(toMetres(t.x), 0.6, toMetres(t.y));
    const offset = c.camera.position.clone().sub(c.getTarget(new THREE.Vector3())).setLength(7.5);
    offset.y = Math.max(offset.y, 3.2);
    const pos = target.clone().add(offset);
    // shift the focus so the card, which sits to the right of the table, stays in view
    const right = new THREE.Vector3().crossVectors(offset, new THREE.Vector3(0, 1, 0)).setLength(-1.1);
    void c.setLookAt(pos.x + right.x, pos.y, pos.z + right.z, target.x + right.x, target.y, target.z + right.z, true);
  }, [selected, mode]);

  return <CameraControls ref={ref} makeDefault smoothTime={0.35} draggingSmoothTime={0.14} dollySpeed={0.6} />;
}
