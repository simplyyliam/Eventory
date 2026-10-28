import { useLayoutEffect, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { seatPoses, toPlan } from '@/domain/geometry';
import type { Guest, PlanTable, TableFinish } from '@/domain/types';
import { toMetres, useView } from '../viewStore';
import { clothTexture, woodTexture } from './textures';
import { useChairModel } from './models';

const TABLE_H = 0.75;
const deg = (d: number) => (d * Math.PI) / 180;

type Spot = { x: number; z: number; rot: number; guest: Guest | null };

// Every visible seat in world space, shared by chairs and seated people.
export function useSpots(tables: PlanTable[], guests: Guest[]) {
  return useMemo(() => {
    const bySeat = new Map(guests.filter((g) => g.seat).map((g) => [g.seat!, g]));
    const spots: Spot[] = [];
    for (const t of tables) {
      for (const pose of seatPoses(t)) {
        if (t.hiddenSeats.includes(pose.id)) continue;
        const p = toPlan(t, pose.x, pose.y);
        spots.push({ x: toMetres(p.x), z: toMetres(p.y), rot: -deg(pose.angle + t.rotation), guest: bySeat.get(pose.id) ?? null });
      }
    }
    return spots;
  }, [tables, guests]);
}

function personGeometry() {
  const body = new THREE.CapsuleGeometry(0.15, 0.32, 4, 12);
  body.translate(0, 0.8, -0.05);
  const head = new THREE.SphereGeometry(0.105, 16, 12);
  head.translate(0, 1.2, -0.02);
  const lap = new THREE.CapsuleGeometry(0.075, 0.24, 4, 8);
  lap.rotateX(Math.PI / 2);
  lap.translate(-0.08, 0.53, 0.1);
  const lap2 = lap.clone();
  lap2.translate(0.16, 0, 0);
  return mergeGeometries([body, head, lap, lap2])!;
}

const OUTFITS = ['#3f4a5a', '#7a8b99', '#b48a78', '#5b6b52', '#2f2f35', '#a99c8a', '#6d5a7a', '#c9b79c', '#40576b', '#8c6a5a'];

const seedOf = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 3);

export function Chairs({ spots }: { spots: Spot[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geometry, material } = useChairModel();
  const count = spots.length;

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const one = new THREE.Vector3(1, 1, 1);
    const up = new THREE.Vector3(0, 1, 0);
    spots.forEach((s, i) => {
      m.compose(new THREE.Vector3(s.x, 0, s.z), q.setFromAxisAngle(up, s.rot), one);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [spots]);

  if (count === 0) return null;
  return <instancedMesh key={count} ref={ref} args={[geometry, material, count]} castShadow receiveShadow />;
}

export function People({ spots }: { spots: Spot[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(personGeometry, []);
  const seated = spots.filter((s) => s.guest);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const color = new THREE.Color();
    seated.forEach((s, i) => {
      const seed = seedOf(s.guest!.id);
      const scale = 0.94 + (seed % 10) / 100;
      m.compose(new THREE.Vector3(s.x, 0, s.z), q.setFromAxisAngle(up, s.rot), new THREE.Vector3(scale, scale, scale));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, color.set(OUTFITS[seed % OUTFITS.length]));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [seated]);

  if (seated.length === 0) return null;
  return (
    <instancedMesh key={seated.length} ref={ref} args={[geo, undefined, seated.length]} castShadow>
      <meshStandardMaterial roughness={0.85} />
    </instancedMesh>
  );
}

const FINISH_3D: Record<TableFinish, { color: string; cloth: boolean; grain?: string }> = {
  linen: { color: '#f7f5f0', cloth: true },
  ivory: { color: '#efe4cc', cloth: true },
  sage: { color: '#cbd9c0', cloth: true },
  oak: { color: '#d2a774', cloth: false, grain: '#8a6236' },
  walnut: { color: '#6f4b33', cloth: false, grain: '#3c2718' },
};

function TableMesh({ table, highlighted, children }: { table: PlanTable; highlighted: boolean; children?: React.ReactNode }) {
  const finish = FINISH_3D[table.finish];
  const w = toMetres(table.width);
  const h = toMetres(table.height);
  const round = table.shape === 'circle';
  const map = finish.grain ? woodTexture(finish.color, finish.grain) : undefined;
  const top = (
    <meshStandardMaterial
      color={finish.grain ? '#ffffff' : finish.color}
      map={map}
      bumpMap={finish.cloth ? clothTexture() : undefined}
      bumpScale={finish.cloth ? 0.3 : 0}
      roughness={finish.cloth ? 0.92 : 0.38}
      emissive={highlighted ? '#3b6cf0' : '#000000'}
      emissiveIntensity={highlighted ? 0.08 : 0}
    />
  );

  return (
    <group>
      {round ? (
        <>
          <mesh position-y={TABLE_H - 0.02} castShadow receiveShadow>
            <cylinderGeometry args={[w / 2, w / 2, 0.04, 48]} />
            {top}
          </mesh>
          {finish.cloth ? (
            <mesh position-y={(TABLE_H - 0.03) / 2 + 0.01} castShadow receiveShadow>
              <cylinderGeometry args={[w / 2 + 0.01, w / 2 + 0.07, TABLE_H - 0.03, 48, 1, true]} />
              <meshStandardMaterial color={finish.color} roughness={0.95} side={THREE.DoubleSide} bumpMap={clothTexture()} bumpScale={0.3} />
            </mesh>
          ) : (
            <mesh position-y={TABLE_H / 2} castShadow>
              <cylinderGeometry args={[0.05, 0.08, TABLE_H, 16]} />
              <meshStandardMaterial color="#2c2a28" roughness={0.4} metalness={0.4} />
            </mesh>
          )}
        </>
      ) : (
        <>
          <mesh position-y={TABLE_H - 0.02} castShadow receiveShadow>
            <boxGeometry args={[w, 0.04, h]} />
            {top}
          </mesh>
          {finish.cloth ? (
            <mesh position-y={(TABLE_H - 0.03) / 2 + 0.01} castShadow receiveShadow>
              <boxGeometry args={[w + 0.03, TABLE_H - 0.03, h + 0.03]} />
              <meshStandardMaterial color={finish.color} roughness={0.95} bumpMap={clothTexture()} bumpScale={0.3} />
            </mesh>
          ) : (
            [-1, 1].flatMap((sx) =>
              [-1, 1].map((sz) => (
                <mesh key={`${sx}${sz}`} position={[sx * (w / 2 - 0.06), TABLE_H / 2, sz * (h / 2 - 0.06)]} castShadow>
                  <boxGeometry args={[0.05, TABLE_H, 0.05]} />
                  <meshStandardMaterial color={finish.color} map={map} roughness={0.5} />
                </mesh>
              )),
            )
          )}
        </>
      )}
      {children}
    </group>
  );
}

function SelectionHalo({ table }: { table: PlanTable }) {
  const r = Math.max(toMetres(table.width), toMetres(table.height)) / 2 + 0.75;
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.006}>
      <ringGeometry args={[r, r + 0.05, 64]} />
      <meshBasicMaterial color="#3b6cf0" transparent opacity={0.85} />
    </mesh>
  );
}

export function Tables({ tables, guests }: { tables: PlanTable[]; guests: Guest[] }) {
  const selected = useView((s) => s.selected);
  const hovered = useView((s) => s.hovered);
  const labels = useView((s) => s.labels);
  const { select, hover } = useView.getState();

  return (
    <>
      {tables.map((t) => {
        if (t.shape === 'row') return null;
        const seated = guests.filter((g) => g.tableId === t.id).length;
        const cap = seatPoses(t).filter((p) => !t.hiddenSeats.includes(p.id)).length;
        return (
          <group
            key={t.id}
            position={[toMetres(t.x), 0, toMetres(t.y)]}
            rotation-y={-deg(t.rotation)}
            onPointerOver={(e) => {
              e.stopPropagation();
              hover(t.id);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              hover(null);
              document.body.style.cursor = '';
            }}
            onClick={(e) => {
              // ignore the click that ends an orbit drag
              if (e.delta > 4) return;
              e.stopPropagation();
              select(selected === t.id ? null : t.id);
            }}
          >
            <TableMesh table={t} highlighted={hovered === t.id || selected === t.id} />
            {selected === t.id && <SelectionHalo table={t} />}
            {/* kept mounted and hidden with CSS: mounting drei Html mid-render races React 19 */}
            <Html position={[0, 1.55, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
              <div
                className="flex items-center gap-1.5 rounded-md bg-surface/90 px-2 py-1 text-[11.5px] font-medium whitespace-nowrap text-foreground shadow-[0_0_0_1px_var(--hairline),0_4px_12px_-4px_rgb(0_0_0/0.2)] backdrop-blur-md transition-opacity duration-200"
                style={{ opacity: labels && selected !== t.id ? 1 : 0 }}
              >
                  {t.name}
                  <span className="text-muted-foreground tabular">
                    {seated}/{cap}
                  </span>
                </div>
              </Html>
          </group>
        );
      })}
    </>
  );
}
