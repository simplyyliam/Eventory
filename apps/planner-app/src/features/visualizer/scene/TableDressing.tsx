import { useLayoutEffect, useMemo, useRef } from 'react';
import { Clone } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { seatPoses, toPlan } from '@/domain/geometry';
import type { Decor, PlanTable } from '@/domain/types';
import { toMetres } from '../viewStore';
import { THEMES, textTexture } from './decor';
import { useVaseModel } from './models';

export const TABLE_H = 0.75;
const deg = (d: number) => (d * Math.PI) / 180;
// how far the place setting sits in front of the chair, in plan units (~0.5 m)
const REACH = 98;

type Place = THREE.Matrix4;

// One matrix per visible seat at a real table, positioned on the tabletop in
// front of the chair and facing the guest.
function usePlaces(tables: PlanTable[]) {
  return useMemo(() => {
    const out: Place[] = [];
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const one = new THREE.Vector3(1, 1, 1);
    for (const t of tables) {
      if (t.shape === 'row') continue;
      for (const pose of seatPoses(t)) {
        if (t.hiddenSeats.includes(pose.id)) continue;
        const a = deg(pose.angle);
        const p = toPlan(t, pose.x - Math.sin(a) * REACH, pose.y + Math.cos(a) * REACH);
        out.push(new THREE.Matrix4().compose(new THREE.Vector3(toMetres(p.x), TABLE_H, toMetres(p.y)), q.setFromAxisAngle(up, -deg(pose.angle + t.rotation)), one));
      }
    }
    return out;
  }, [tables]);
}

function glassGeometry() {
  const pts = [
    [0, 0],
    [0.032, 0],
    [0.032, 0.004],
    [0.004, 0.008],
    [0.004, 0.09],
    [0.03, 0.12],
    [0.036, 0.165],
    [0.034, 0.175],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 14);
}

type Item = { key: string; geo: THREE.BufferGeometry; offset: THREE.Matrix4; material: THREE.Material };

function Instanced({ item, places }: { item: Item; places: Place[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    places.forEach((p, i) => mesh.setMatrixAt(i, m.multiplyMatrices(p, item.offset)));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [places, item]);
  if (places.length === 0) return null;
  return <instancedMesh key={`${item.key}${places.length}`} ref={ref} args={[item.geo, item.material, places.length]} castShadow receiveShadow />;
}

const at = (x: number, y: number, z: number, ry = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry), new THREE.Vector3(1, 1, 1));

// Charger, plate, folded napkin, cutlery and a wine glass at every seat. Each
// piece is one instanced mesh, so a full room is still only six draw calls.
export function PlaceSettings({ tables, decor }: { tables: PlanTable[]; decor: Decor }) {
  const places = usePlaces(tables);
  const theme = THEMES[decor.theme];

  const items = useMemo<Item[]>(() => {
    const silver = new THREE.MeshStandardMaterial({ color: '#d9d9d9', metalness: 0.9, roughness: 0.25 });
    return [
      { key: 'charger', geo: new THREE.CylinderGeometry(0.16, 0.16, 0.008, 32), offset: at(0, 0.005, 0), material: new THREE.MeshStandardMaterial({ color: theme.charger, metalness: 0.6, roughness: 0.35 }) },
      { key: 'plate', geo: new THREE.CylinderGeometry(0.125, 0.11, 0.014, 32), offset: at(0, 0.015, 0), material: new THREE.MeshStandardMaterial({ color: '#fbfaf7', roughness: 0.3 }) },
      { key: 'napkin', geo: new THREE.BoxGeometry(0.1, 0.022, 0.15), offset: at(0, 0.033, 0), material: new THREE.MeshStandardMaterial({ color: theme.napkin, roughness: 0.95 }) },
      { key: 'fork', geo: new THREE.BoxGeometry(0.014, 0.004, 0.18), offset: at(0.185, 0.004, 0), material: silver },
      { key: 'knife', geo: new THREE.BoxGeometry(0.014, 0.004, 0.2), offset: at(-0.185, 0.004, 0), material: silver },
      {
        key: 'glass',
        geo: glassGeometry(),
        offset: at(-0.13, 0, 0.17),
        material: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35, depthWrite: false }),
      },
    ];
  }, [theme.charger, theme.napkin]);

  return (
    <>
      {items.map((item) => (
        <Instanced key={item.key} item={item} places={places} />
      ))}
    </>
  );
}

const rand = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const flowerCache = new Map<string, THREE.BufferGeometry>();

// A posy of small blooms with leaves tucked underneath, coloured per vertex so
// the whole arrangement is one mesh.
function flowerBall(palette: string[]) {
  const key = palette.join();
  const hit = flowerCache.get(key);
  if (hit) return hit;
  const r = rand(11);
  const parts: THREE.BufferGeometry[] = [];
  const color = new THREE.Color();
  const add = (geo: THREE.BufferGeometry, c: string) => {
    color.set(c);
    const n = geo.attributes.position.count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) arr.set([color.r, color.g, color.b], i * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    parts.push(geo.toNonIndexed());
  };
  for (let i = 0; i < 26; i++) {
    const g = new THREE.IcosahedronGeometry(0.028 + r() * 0.014, 1);
    const th = r() * Math.PI * 2;
    const ph = r() * Math.PI * 0.45;
    g.translate(Math.sin(ph) * Math.cos(th) * 0.11, Math.cos(ph) * 0.07, Math.sin(ph) * Math.sin(th) * 0.11);
    add(g, palette[Math.floor(r() * palette.length)]);
  }
  for (let i = 0; i < 14; i++) {
    const g = new THREE.IcosahedronGeometry(0.03, 0);
    g.scale(1.6, 0.5, 1);
    const th = r() * Math.PI * 2;
    g.rotateY(th);
    g.translate(Math.cos(th) * 0.12, -0.02, Math.sin(th) * 0.12);
    add(g, r() > 0.5 ? '#6f8f5c' : '#55734a');
  }
  const merged = mergeGeometries(parts)!;
  merged.computeVertexNormals();
  flowerCache.set(key, merged);
  return merged;
}

function Candles({ evening, spread = 0.18 }: { evening: boolean; spread?: number }) {
  return (
    <>
      {[
        [-spread, 0.07],
        [spread, 0.1],
        [0, 0.05],
      ].map(([x, h], i) => (
        <group key={i} position={[x, 0, i === 2 ? spread * 0.9 : -0.04]}>
          <mesh position-y={h / 2} castShadow>
            <cylinderGeometry args={[0.025, 0.025, h, 16]} />
            <meshStandardMaterial color="#f6f1e6" roughness={0.6} emissive={evening ? '#ffb257' : '#000'} emissiveIntensity={evening ? 0.25 : 0} />
          </mesh>
          <mesh position-y={h + 0.012}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshBasicMaterial color={evening ? '#ffd28a' : '#3a3a3a'} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Balloons({ palette, seed }: { palette: string[]; seed: number }) {
  const r = rand(seed);
  const balloons = [0, 1, 2].map((i) => ({ x: (r() - 0.5) * 0.3, z: (r() - 0.5) * 0.3, h: 0.95 + i * 0.12 + r() * 0.1, c: palette[(seed + i) % palette.length] }));
  return (
    <>
      <mesh position-y={0.03} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.06, 12]} />
        <meshStandardMaterial color={palette[0]} metalness={0.5} roughness={0.3} />
      </mesh>
      {balloons.map((b, i) => (
        <group key={i}>
          <mesh position={[b.x / 2, b.h / 2, b.z / 2]} rotation={[Math.atan2(b.z, b.h), 0, -Math.atan2(b.x, b.h)]}>
            <cylinderGeometry args={[0.0015, 0.0015, b.h, 3]} />
            <meshBasicMaterial color="#d8d3ca" />
          </mesh>
          <mesh position={[b.x, b.h + 0.13, b.z]} scale={[1, 1.18, 1]} castShadow>
            <sphereGeometry args={[0.13, 24, 18]} />
            <meshStandardMaterial color={b.c} roughness={0.22} metalness={0.05} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function NumberCard({ n, position }: { n: number; position: [number, number, number] }) {
  const tex = useMemo(() => textTexture(String(n), { w: 192, h: 128, bg: '#fbfaf7', fg: '#2a2622', size: 82 }), [n]);
  return (
    <group position={position}>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 0.045, s * 0.018]} rotation={[s * 0.38, s > 0 ? 0 : Math.PI, 0]} castShadow>
          <planeGeometry args={[0.12, 0.09]} />
          <meshStandardMaterial map={tex} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function Centrepiece({ table, decor, evening }: { table: PlanTable; decor: Decor; evening: boolean }) {
  const theme = THEMES[decor.theme];
  const vase = useVaseModel();
  const flowers = useMemo(() => flowerBall(theme.palette), [theme.palette]);
  const long = table.shape === 'rectangle';
  // beside the centrepiece on round tables, further down the runner on long ones
  const card: [number, number, number] = long ? [0, 0, toMetres(table.height) * 0.3] : [Math.min(toMetres(table.width), toMetres(table.height)) * 0.28, 0, 0];

  return (
    <group position-y={TABLE_H}>
      {long && (
        <mesh rotation-x={-Math.PI / 2} position-y={0.002} receiveShadow>
          <planeGeometry args={[0.34, toMetres(table.height) - 0.12]} />
          <meshStandardMaterial color={decor.accent} roughness={0.9} />
        </mesh>
      )}
      {theme.centre === 'flowers' && (
        <>
          <Clone object={vase} scale={0.55} castShadow />
          <mesh geometry={flowers} position-y={0.25} castShadow>
            <meshStandardMaterial vertexColors roughness={0.85} />
          </mesh>
          <Candles evening={evening} spread={0.22} />
        </>
      )}
      {theme.centre === 'balloons' && <Balloons palette={theme.palette} seed={table.tableNumber} />}
      {theme.centre === 'greenery' && (
        <>
          <mesh geometry={flowerBall(theme.palette)} position-y={0.04} scale={[1.4, 0.6, 1.4]} castShadow>
            <meshStandardMaterial vertexColors roughness={0.9} />
          </mesh>
          <Candles evening={evening} spread={0.24} />
        </>
      )}
      {theme.centre === 'candles' && <Candles evening={evening} spread={0.1} />}
      <NumberCard n={table.tableNumber} position={card} />
    </group>
  );
}

export function Centrepieces({ tables, decor, evening }: { tables: PlanTable[]; decor: Decor; evening: boolean }) {
  return (
    <>
      {tables
        .filter((t) => t.shape !== 'row')
        .map((t) => (
          <group key={t.id} position={[toMetres(t.x), 0, toMetres(t.y)]} rotation-y={-deg(t.rotation)}>
            <Centrepiece table={t} decor={decor} evening={evening} />
          </group>
        ))}
    </>
  );
}
