import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import * as THREE from 'three';
import { useWorkspace } from '@/store/workspace';
import { toMetres, useView, type NavMode, type ViewPreset } from '../viewStore';
import { EYE, LOOK, setControls } from './camera';


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

const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyE', 'KeyQ', 'ShiftLeft', 'ShiftRight']);

const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));

// WASD / arrow keys alongside drag-to-look. Walk moves along the floor; fly
// moves where you're looking, with Space/E and Q to rise and sink.
function useKeyboardMove(ref: React.RefObject<CameraControls | null>, mode: NavMode) {
  const keys = useRef(new Set<string>());
  const invalidate = useThree((s) => s.invalidate);
  const regress = useThree((s) => s.performance.regress);

  useEffect(() => {
    if (mode === 'orbit') return;
    const down = (e: KeyboardEvent) => {
      if (typing(e.target) || e.metaKey || e.ctrlKey || !MOVE_KEYS.has(e.code)) return;
      e.preventDefault();
      keys.current.add(e.code);
      invalidate();
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const clear = () => keys.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    const held = keys.current;
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
      held.clear();
    };
  }, [mode, invalidate]);

  useFrame((_, delta) => {
    const c = ref.current;
    const k = keys.current;
    if (!c || mode === 'orbit' || k.size === 0) return;
    const fly = mode === 'fly';
    const fast = !fly && (k.has('ShiftLeft') || k.has('ShiftRight'));
    const step = (fly ? 6 : 2.4) * (fast ? 1.8 : 1) * Math.min(delta, 0.05);
    const fwd = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    const side = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    if (fwd) {
      if (fly) void c.dolly(fwd * step, false);
      else void c.forward(fwd * step, false);
    }
    if (side) void c.truck(side * step, 0, false);
    if (fly) {
      const rise = (k.has('Space') || k.has('KeyE') ? 1 : 0) - (k.has('KeyQ') || k.has('ShiftLeft') || k.has('ShiftRight') ? 1 : 0);
      if (rise) void c.elevate(rise * step, false);
    }
    // keep frames coming while a key is held, at motion resolution
    regress();
    invalidate();
  });
}

export function CameraRig({ w, d }: { w: number; d: number }) {
  const ref = useRef<CameraControls>(null);
  const mode = useView((s) => s.mode);
  const preset = useView((s) => s.preset);
  const tick = useView((s) => s.presetTick);
  const selected = useView((s) => s.selected);
  const first = useRef(true);
  useKeyboardMove(ref, mode);

  useEffect(() => {
    setControls(ref.current);
    return () => setControls(null);
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

  return <CameraControls ref={ref} makeDefault regress smoothTime={0.35} draggingSmoothTime={0.14} dollySpeed={0.6} />;
}
