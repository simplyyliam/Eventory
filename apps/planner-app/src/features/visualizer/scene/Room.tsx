import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Room as RoomSize } from '@/domain/types';
import { toMetres, useView } from '../viewStore';
import { floorTexture } from './textures';
import { walkTo } from './camera';
import { WALL_H, wallHeights } from './wallState';

const WALL_T = 0.16;
const CUT_H = 0.35;


type Wall = { pos: [number, number]; size: [number, number]; normal: THREE.Vector3 };

// Walls between the camera and the room drop down to a low ledge, like a
// cut-away model, so the view is never blocked while orbiting.
export function Room({ room, dark }: { room: RoomSize; dark: boolean }) {
  const w = toMetres(room.width);
  const d = toMetres(room.depth);
  const mode = useView((s) => s.mode);
  const evening = useView((s) => s.lighting === 'evening');
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const tex = useMemo(() => {
    const t = floorTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(w / 2.2, d / 2.2);
    return t;
  }, [w, d]);

  const walls: Wall[] = [
    { pos: [0, -d / 2 - WALL_T / 2], size: [w + WALL_T * 2, WALL_T], normal: new THREE.Vector3(0, 0, -1) },
    { pos: [0, d / 2 + WALL_T / 2], size: [w + WALL_T * 2, WALL_T], normal: new THREE.Vector3(0, 0, 1) },
    { pos: [-w / 2 - WALL_T / 2, 0], size: [WALL_T, d], normal: new THREE.Vector3(-1, 0, 0) },
    { pos: [w / 2 + WALL_T / 2, 0], size: [WALL_T, d], normal: new THREE.Vector3(1, 0, 0) },
  ];

  const toCam = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, invalidate }, delta) => {
    let moving = false;
    walls.forEach((wall, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      toCam.set(camera.position.x - wall.pos[0], 0, camera.position.z - wall.pos[1]).normalize();
      const facing = mode === 'orbit' && toCam.dot(wall.normal) > 0.15;
      const target = facing ? CUT_H : WALL_H;
      const h = THREE.MathUtils.damp(mesh.scale.y, target, 10, delta);
      if (Math.abs(h - target) > 0.002) moving = true;
      mesh.scale.y = h;
      wallHeights[i] = h;
      mesh.position.y = h / 2;
    });
    // walls don't cast shadows, so moving them never forces a shadow pass
    if (moving) invalidate();
  });

  const clay = dark ? '#bdb7ae' : '#f1eee9';

  return (
    <group>
      {/* surrounding ground */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02} receiveShadow>
        <circleGeometry args={[Math.max(w, d) * 3, 64]} />
        <meshStandardMaterial color={dark ? '#141414' : '#e9e6e1'} roughness={1} />
      </mesh>
      {/* floor slab */}
      <mesh position-y={-0.06} receiveShadow castShadow>
        <boxGeometry args={[w + WALL_T * 2, 0.12, d + WALL_T * 2]} />
        <meshStandardMaterial color={clay} roughness={0.95} />
      </mesh>
      <mesh
        rotation-x={-Math.PI / 2}
        position-y={0.001}
        receiveShadow
        onClick={(e) => {
          if (mode !== 'walk' || e.delta > 4) return;
          e.stopPropagation();
          walkTo(e.point.x, e.point.z);
        }}
        onPointerOver={() => {
          if (mode === 'walk') document.body.style.cursor = 'crosshair';
        }}
        onPointerOut={() => {
          document.body.style.cursor = '';
        }}
      >
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={tex} roughness={0.6} metalness={0} color={dark ? '#8f857a' : '#ffffff'} />
      </mesh>
      {/* a ceiling only when standing inside; from above it would hide the room */}
      {mode === 'walk' && (
        <mesh rotation-x={Math.PI / 2} position-y={WALL_H}>
          <planeGeometry args={[w + WALL_T * 2, d + WALL_T * 2]} />
          <meshBasicMaterial color={evening ? '#2a231d' : dark ? '#4a4743' : '#e4e0da'} />
        </mesh>
      )}
      {walls.map((wall, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          position={[wall.pos[0], WALL_H / 2, wall.pos[1]]}
          scale={[1, WALL_H, 1]}
          receiveShadow
        >
          <boxGeometry args={[wall.size[0], 1, wall.size[1]]} />
          <meshStandardMaterial color={clay} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

