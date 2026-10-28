import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Clone } from '@react-three/drei';
import * as THREE from 'three';
import type { Decor, Room } from '@/domain/types';
import { toMetres } from '../viewStore';
import { THEMES, glowTexture, pleatGeometry } from './decor';
import { WALL_H, wallHeights } from './wallState';
import { useChandelierModel } from './models';

type WallSpec = { pos: [number, number, number]; rot: number; length: number };

function Window({ x, curtain, evening }: { x: number; curtain: string; evening: boolean }) {
  const drape = useMemo(() => pleatGeometry(0.55, 2.55, 4, 0.035), []);
  return (
    <group position-x={x}>
      <mesh position={[0, 1.55, 0.01]}>
        <planeGeometry args={[1.3, 1.9]} />
        <meshStandardMaterial color={evening ? '#1c2434' : '#dfe8f0'} emissive={evening ? '#0d1220' : '#cfe0ee'} emissiveIntensity={evening ? 0.4 : 0.55} roughness={0.1} />
      </mesh>
      {/* frame and glazing bars */}
      {[
        [0, 2.52, 1.4, 0.06],
        [0, 0.58, 1.4, 0.06],
        [-0.68, 1.55, 0.06, 2],
        [0.68, 1.55, 0.06, 2],
        [0, 1.55, 0.035, 1.9],
        [0, 1.55, 1.3, 0.035],
      ].map(([fx, fy, fw, fh], i) => (
        <mesh key={i} position={[fx, fy, 0.025]}>
          <boxGeometry args={[fw, fh, 0.04]} />
          <meshStandardMaterial color="#f4f1ec" roughness={0.6} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={drape} position={[s * 0.88, 1.38, 0.09]} castShadow>
          <meshStandardMaterial color={curtain} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 2.7, 0.1]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.012, 0.012, 2.4, 8]} />
        <meshStandardMaterial color="#b8a27a" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Sconce({ x, evening, accent }: { x: number; evening: boolean; accent: string }) {
  return (
    <group position-x={x}>
      <mesh position={[0, 2.15, 0.05]}>
        <boxGeometry args={[0.12, 0.22, 0.08]} />
        <meshStandardMaterial color="#f6efe2" emissive="#ffd9a0" emissiveIntensity={evening ? 1.4 : 0.2} toneMapped={!evening} />
      </mesh>
      {evening && (
        <>
          {/* soft wash of light on the wall above and an uplight at the floor */}
          <mesh position={[0, 2.5, 0.012]}>
            <planeGeometry args={[1.1, 1]} />
            <meshBasicMaterial map={glowTexture()} color="#ffcf8a" transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh position={[0, 1.1, 0.012]}>
            <planeGeometry args={[1.6, 2.2]} />
            <meshBasicMaterial map={glowTexture()} color={accent} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </>
      )}
    </group>
  );
}

function WallDecor({ spec, index, curtain, evening, accent }: { spec: WallSpec; index: number; curtain: string; evening: boolean; accent: string }) {
  const ref = useRef<THREE.Group>(null);
  // windows every ~4.5 m, sconces between them
  const n = Math.max(1, Math.floor(spec.length / 4.5));
  const step = spec.length / n;
  const windows = Array.from({ length: n }, (_, i) => -spec.length / 2 + step * (i + 0.5));
  const sconces = Array.from({ length: n + 1 }, (_, i) => -spec.length / 2 + step * i).slice(1, -1);

  useFrame(() => {
    const g = ref.current;
    if (g) g.visible = wallHeights[index] > WALL_H * 0.85;
  });

  return (
    <group ref={ref} position={spec.pos} rotation-y={spec.rot}>
      <mesh position={[0, 0.06, 0.012]}>
        <boxGeometry args={[spec.length, 0.12, 0.025]} />
        <meshStandardMaterial color="#e8e2d8" roughness={0.7} />
      </mesh>
      {windows.map((x) => (
        <Window key={x} x={x} curtain={curtain} evening={evening} />
      ))}
      {sconces.map((x) => (
        <Sconce key={x} x={x} evening={evening} accent={accent} />
      ))}
    </group>
  );
}

// Strands of warm bulbs strung across the room, sagging between the walls.
function FairyLights({ w, d, evening }: { w: number; d: number; evening: boolean }) {
  const bulbs = useRef<THREE.InstancedMesh>(null);
  const strands = Math.max(2, Math.floor(d / 2.2));
  const perStrand = Math.max(10, Math.floor(w / 0.3));
  const count = strands * perStrand;
  const sag = (t: number) => 2.85 - Math.sin(t * Math.PI) * 0.45;

  const wire = useMemo(() => {
    const pts: number[] = [];
    for (let s = 0; s < strands; s++) {
      const z = -d / 2 + (d / strands) * (s + 0.5);
      for (let i = 0; i < 40; i++) {
        const t0 = i / 40;
        const t1 = (i + 1) / 40;
        pts.push(-w / 2 + w * t0, sag(t0), z, -w / 2 + w * t1, sag(t1), z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [w, d, strands]);

  useLayoutEffect(() => {
    const mesh = bulbs.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    let k = 0;
    for (let s = 0; s < strands; s++) {
      const z = -d / 2 + (d / strands) * (s + 0.5);
      for (let i = 0; i < perStrand; i++) {
        const t = (i + 0.5) / perStrand;
        m.setPosition(-w / 2 + w * t, sag(t) - 0.03, z);
        mesh.setMatrixAt(k++, m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [w, d, strands, perStrand]);

  return (
    <>
      <lineSegments geometry={wire}>
        <lineBasicMaterial color="#3a3530" transparent opacity={0.5} />
      </lineSegments>
      <instancedMesh key={count} ref={bulbs} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color={evening ? '#ffd38a' : '#f6e6c4'} toneMapped={!evening} />
      </instancedMesh>
    </>
  );
}

function Chandeliers({ w }: { w: number }) {
  const scene = useChandelierModel();
  const n = Math.max(1, Math.min(3, Math.floor(w / 7)));
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <group key={i} position={[-w / 2 + (w / n) * (i + 0.5), WALL_H, 0]}>
          <mesh position-y={-0.15}>
            <cylinderGeometry args={[0.006, 0.006, 0.3, 6]} />
            <meshStandardMaterial color="#8a7a5a" metalness={0.8} />
          </mesh>
          <Clone object={scene} position-y={-0.3} scale={1.3} />
        </group>
      ))}
    </>
  );
}

export function RoomDecor({ room, decor, evening }: { room: Room; decor: Decor; evening: boolean }) {
  const w = toMetres(room.width);
  const d = toMetres(room.depth);
  const theme = THEMES[decor.theme];
  const walls: WallSpec[] = [
    { pos: [0, 0, -d / 2], rot: 0, length: w },
    { pos: [0, 0, d / 2], rot: Math.PI, length: w },
    { pos: [-w / 2, 0, 0], rot: Math.PI / 2, length: d },
    { pos: [w / 2, 0, 0], rot: -Math.PI / 2, length: d },
  ];
  return (
    <>
      {walls.map((spec, i) => (
        <WallDecor key={i} spec={spec} index={i} curtain={theme.curtain} evening={evening} accent={decor.accent} />
      ))}
      {theme.fairyLights && <FairyLights w={w} d={d} evening={evening} />}
      {theme.chandeliers && <Chandeliers w={w} />}
    </>
  );
}
