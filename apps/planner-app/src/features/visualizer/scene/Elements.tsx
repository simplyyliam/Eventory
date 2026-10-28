import { useLayoutEffect, useMemo, useRef } from 'react';
import { Clone } from '@react-three/drei';
import * as THREE from 'three';
import type { Decor, VenueElement } from '@/domain/types';
import { toMetres, useView } from '../viewStore';
import { clothTexture, woodTexture } from './textures';
import { THEMES, danceFloorTexture, pleatGeometry, textTexture } from './decor';
import { useOttomanModel, usePlantModel, useSofaModel, useStoolModel } from './models';

const deg = (d: number) => (d * Math.PI) / 180;

const rand = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const seedOf = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 5);

type Ctx = { el: VenueElement; w: number; d: number; dark: boolean; evening: boolean; decor: Decor; eventName: string };

const Linen = ({ color = '#f7f5f0' }: { color?: string }) => <meshStandardMaterial color={color} roughness={0.95} bumpMap={clothTexture()} bumpScale={0.3} />;

function Speaker({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position-y={0.7}>
        <cylinderGeometry args={[0.02, 0.02, 1.4, 8]} />
        <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position-y={1.55} castShadow>
        <boxGeometry args={[0.36, 0.55, 0.32]} />
        <meshStandardMaterial color="#1c1c1e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.6, 0.161]}>
        <circleGeometry args={[0.12, 24]} />
        <meshStandardMaterial color="#0e0e0f" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Stage({ w, d, decor, eventName, evening }: Ctx) {
  const theme = THEMES[decor.theme];
  const text = theme.banner(eventName);
  const banner = useMemo(() => (text ? textTexture(text, { w: 1024, h: 192, bg: decor.accent, fg: '#fffaf3' }) : null), [text, decor.accent]);
  const drape = useMemo(() => pleatGeometry(w, 2.6, Math.round(w * 3)), [w]);
  return (
    <>
      <mesh position-y={0.3} castShadow receiveShadow>
        <boxGeometry args={[w, 0.6, d]} />
        <meshStandardMaterial color="#2c2825" roughness={0.7} />
      </mesh>
      <mesh position-y={0.605} receiveShadow>
        <boxGeometry args={[w - 0.04, 0.01, d - 0.04]} />
        <meshStandardMaterial map={woodTexture('#5a4636', '#2e2219')} roughness={0.35} />
      </mesh>
      {/* steps */}
      {[0, 1].map((i) => (
        <mesh key={i} position={[w * 0.32, 0.1 + i * 0.2, d / 2 + 0.35 - i * 0.2]} castShadow receiveShadow>
          <boxGeometry args={[1, 0.2, 0.3]} />
          <meshStandardMaterial color="#2c2825" roughness={0.7} />
        </mesh>
      ))}
      {/* backdrop */}
      <mesh geometry={drape} position={[0, 0.6 + 1.3, -d / 2 + 0.08]} castShadow receiveShadow>
        <meshStandardMaterial color={theme.curtain} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {banner && (
        <mesh position={[0, 2.75, -d / 2 + 0.16]}>
          <planeGeometry args={[Math.min(w - 0.4, 5), Math.min(w - 0.4, 5) / 5.33]} />
          <meshStandardMaterial map={banner} roughness={0.8} emissive="#ffffff" emissiveIntensity={evening ? 0.15 : 0} emissiveMap={banner} />
        </mesh>
      )}
      {/* mic */}
      <group position={[0, 0.6, d * 0.15]}>
        <mesh position-y={0.75}>
          <cylinderGeometry args={[0.01, 0.01, 1.5, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position-y={1.52}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color="#333" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position-y={0.01}>
          <cylinderGeometry args={[0.13, 0.13, 0.02, 20]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
      <Speaker position={[-w / 2 - 0.4, 0, d / 2 - 0.2]} />
      <Speaker position={[w / 2 + 0.4, 0, d / 2 - 0.2]} />
      {evening && <spotLight position={[0, 3.4, d / 2 + 1.5]} angle={0.7} penumbra={0.8} intensity={16} distance={9} color="#ffd9a8" />}
    </>
  );
}

function DanceFloor({ w, d }: Ctx) {
  const tex = useMemo(() => {
    const t = danceFloorTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(w, d);
    return t;
  }, [w, d]);
  return (
    <mesh position-y={0.012} receiveShadow>
      <boxGeometry args={[w, 0.024, d]} />
      <meshStandardMaterial map={tex} roughness={0.12} metalness={0.15} />
    </mesh>
  );
}

const BOTTLE_COLORS = ['#3d5a3a', '#6b3d1f', '#c9b48a', '#2c4a5a', '#7a2f2f', '#e5e2d8'];

function Bottles({ w, z }: { w: number; z: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = Math.max(4, Math.floor(w / 0.09)) * 2;
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const r = rand(count);
    for (let i = 0; i < count; i++) {
      const shelf = i % 2;
      const x = -w / 2 + 0.12 + (Math.floor(i / 2) / (count / 2)) * (w - 0.24);
      const s = 0.85 + r() * 0.35;
      m.compose(new THREE.Vector3(x, 1.12 + shelf * 0.42, z), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(BOTTLE_COLORS[Math.floor(r() * BOTTLE_COLORS.length)]));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, w, z]);
  const geo = useMemo(() => {
    const g = new THREE.LatheGeometry(
      [
        [0, 0],
        [0.035, 0],
        [0.035, 0.2],
        [0.012, 0.27],
        [0.012, 0.32],
        [0, 0.32],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      10,
    );
    return g;
  }, []);
  return (
    <instancedMesh key={count} ref={ref} args={[geo, undefined, count]} castShadow>
      <meshStandardMaterial roughness={0.15} metalness={0.1} transparent opacity={0.85} />
    </instancedMesh>
  );
}

function Bar({ w, d }: Ctx) {
  const stool = useStoolModel();
  const stools = Math.max(2, Math.floor(w / 0.75));
  return (
    <>
      <mesh position-y={0.52} castShadow receiveShadow>
        <boxGeometry args={[w, 1.04, d]} />
        <meshStandardMaterial map={woodTexture('#6f4b33', '#3c2718')} roughness={0.45} />
      </mesh>
      <mesh position-y={1.07} castShadow>
        <boxGeometry args={[w + 0.1, 0.05, d + 0.14]} />
        <meshStandardMaterial color="#f1eee8" roughness={0.18} metalness={0.05} />
      </mesh>
      {/* back bar with shelves */}
      <group position-z={-d / 2 - 0.9}>
        <mesh position-y={0.45} castShadow receiveShadow>
          <boxGeometry args={[w, 0.9, 0.45]} />
          <meshStandardMaterial map={woodTexture('#6f4b33', '#3c2718')} roughness={0.5} />
        </mesh>
        {[1.05, 1.47].map((y) => (
          <mesh key={y} position={[0, y, -0.1]} castShadow>
            <boxGeometry args={[w, 0.03, 0.25]} />
            <meshStandardMaterial color="#3c2718" roughness={0.5} />
          </mesh>
        ))}
        <Bottles w={w} z={-0.1} />
      </group>
      {Array.from({ length: stools }).map((_, i) => (
        <Clone key={i} object={stool} position={[-w / 2 + (w / stools) * (i + 0.5), 0, d / 2 + 0.4]} rotation-y={Math.PI} castShadow />
      ))}
    </>
  );
}

function Buffet({ w, d }: Ctx) {
  const dishes = Math.max(1, Math.floor(w / 0.75));
  return (
    <>
      <mesh position-y={0.43} castShadow receiveShadow>
        <boxGeometry args={[w, 0.86, d]} />
        <Linen />
      </mesh>
      {Array.from({ length: dishes }).map((_, i) => (
        <group key={i} position={[-w / 2 + (w / dishes) * (i + 0.5), 0.86, 0]}>
          <mesh position-y={0.06} castShadow>
            <boxGeometry args={[0.5, 0.12, 0.32]} />
            <meshStandardMaterial color="#cfcfcf" metalness={0.9} roughness={0.25} />
          </mesh>
          {/* domed lid */}
          <mesh position-y={0.12} scale={[1.55, 0.55, 1]} castShadow>
            <sphereGeometry args={[0.16, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#dcdcdc" metalness={0.95} roughness={0.18} />
          </mesh>
          <mesh position-y={0.215}>
            <sphereGeometry args={[0.018, 10, 8]} />
            <meshStandardMaterial color="#bfbfbf" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}
      <mesh position={[w / 2 - 0.18, 0.92, d / 4]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.12, 24]} />
        <meshStandardMaterial color="#fbfaf7" roughness={0.3} />
      </mesh>
    </>
  );
}

function DJ({ w, d, evening, decor }: Ctx) {
  return (
    <>
      <mesh position-y={0.5} castShadow receiveShadow>
        <boxGeometry args={[w, 1, d]} />
        <meshStandardMaterial color="#1f1f22" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.45, d / 2 + 0.001]}>
        <planeGeometry args={[w * 0.9, 0.06]} />
        <meshBasicMaterial color={evening ? decor.accent : '#2a2a2e'} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * w * 0.25, 1.015, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.03, 32]} />
          <meshStandardMaterial color="#111" roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 1.1, -d * 0.15]} rotation-x={-0.4}>
        <boxGeometry args={[0.34, 0.22, 0.01]} />
        <meshStandardMaterial color="#222" emissive={evening ? '#6f8fdc' : '#000'} emissiveIntensity={0.5} />
      </mesh>
      <Speaker position={[-w / 2 - 0.35, 0, 0]} />
      <Speaker position={[w / 2 + 0.35, 0, 0]} />
    </>
  );
}

function Entrance({ w, dark }: Ctx) {
  const clay = dark ? '#bdb7ae' : '#f1eee9';
  return (
    <>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * w) / 2, 1.15, 0]} castShadow>
          <boxGeometry args={[0.14, 2.3, 0.3]} />
          <meshStandardMaterial color={clay} roughness={0.9} />
        </mesh>
      ))}
      <mesh position-y={2.35} castShadow>
        <boxGeometry args={[w + 0.14, 0.14, 0.3]} />
        <meshStandardMaterial color={clay} roughness={0.9} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - 0.05), 1.1, w / 4 - 0.02]} rotation-y={s * -1.1} castShadow>
          <boxGeometry args={[w / 2 - 0.04, 2.2, 0.05]} />
          <meshStandardMaterial map={woodTexture('#8a6447', '#4f3423')} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.006, 0.6]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[w * 0.8, 0.9]} />
        <meshStandardMaterial color="#7a6f60" roughness={1} />
      </mesh>
    </>
  );
}

function PillarLights({ r, seed }: { r: number; seed: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 90;
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const a = t * Math.PI * 2 * 6 + seed;
      m.setPosition(Math.cos(a) * (r + 0.015), 0.25 + t * 2.6, Math.sin(a) * (r + 0.015));
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [r, seed]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.014, 6, 6]} />
      <meshBasicMaterial color="#ffd89a" toneMapped={false} />
    </instancedMesh>
  );
}

function Pillar({ w, dark, decor, el }: Ctx) {
  const theme = THEMES[decor.theme];
  return (
    <>
      <mesh position-y={1.5} castShadow receiveShadow>
        <cylinderGeometry args={[w / 2, w / 2, 3, 32]} />
        <meshStandardMaterial color={dark ? '#bdb7ae' : '#f1eee9'} roughness={0.9} />
      </mesh>
      {theme.fairyLights && <PillarLights r={w / 2} seed={seedOf(el.id) % 7} />}
    </>
  );
}

function Plant({ w }: Ctx) {
  const scene = usePlantModel();
  // the model is about 0.7 m across
  return <Clone object={scene} scale={w / 0.7} castShadow receiveShadow />;
}

function Cake({ w, decor, evening }: Ctx) {
  const theme = THEMES[decor.theme];
  const r = Math.max(0.35, (w / 2) * 0.75);
  const tiers = [0.2, 0.15, 0.11];
  let y = 0.76;
  return (
    <>
      <mesh position-y={0.38} castShadow receiveShadow>
        <cylinderGeometry args={[r + 0.02, r + 0.08, 0.76, 40, 1, true]} />
        <meshStandardMaterial color="#f7f5f0" roughness={0.95} side={THREE.DoubleSide} bumpMap={clothTexture()} bumpScale={0.3} />
      </mesh>
      <mesh position-y={0.75}>
        <cylinderGeometry args={[r, r, 0.02, 40]} />
        <Linen />
      </mesh>
      <mesh position-y={0.77}>
        <cylinderGeometry args={[0.24, 0.26, 0.03, 32]} />
        <meshStandardMaterial color="#d9d9d9" metalness={0.8} roughness={0.25} />
      </mesh>
      {tiers.map((tr, i) => {
        const h = 0.13;
        const cy = (y += i === 0 ? 0.03 : h) + h / 2;
        return (
          <group key={i}>
            <mesh position-y={cy} castShadow>
              <cylinderGeometry args={[tr, tr, h, 40]} />
              <meshStandardMaterial color="#fbf6ee" roughness={0.6} />
            </mesh>
            <mesh position-y={cy - h / 2 + 0.015}>
              <cylinderGeometry args={[tr + 0.003, tr + 0.003, 0.025, 40]} />
              <meshStandardMaterial color={decor.accent} roughness={0.5} />
            </mesh>
          </group>
        );
      })}
      {decor.theme === 'birthday' ? (
        [-0.04, 0, 0.04].map((x) => (
          <mesh key={x} position={[x, y + 0.13 + 0.045, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.07, 6]} />
            <meshStandardMaterial color={theme.palette[1]} emissive={evening ? '#ffb257' : '#000'} emissiveIntensity={0.4} />
          </mesh>
        ))
      ) : (
        <mesh position-y={y + 0.13 + 0.05} castShadow>
          <icosahedronGeometry args={[0.05, 1]} />
          <meshStandardMaterial color={theme.palette[2] ?? decor.accent} roughness={0.8} flatShading />
        </mesh>
      )}
    </>
  );
}

function Gifts({ w, d, decor, el }: Ctx) {
  const theme = THEMES[decor.theme];
  const r = rand(seedOf(el.id));
  const boxes = Array.from({ length: Math.max(4, Math.floor(w / 0.3)) }).map((_, i) => {
    const s = 0.14 + r() * 0.14;
    return { x: -w / 2 + 0.2 + r() * (w - 0.4), z: (r() - 0.5) * (d - 0.3), s, h: s * (0.7 + r() * 0.6), c: [...theme.palette, decor.accent][i % (theme.palette.length + 1)], rot: r() * 0.6 };
  });
  return (
    <>
      <mesh position-y={0.38} castShadow receiveShadow>
        <boxGeometry args={[w, 0.76, d]} />
        <Linen />
      </mesh>
      {boxes.map((b, i) => (
        <group key={i} position={[b.x, 0.76 + b.h / 2, b.z]} rotation-y={b.rot}>
          <mesh castShadow>
            <boxGeometry args={[b.s, b.h, b.s]} />
            <meshStandardMaterial color={b.c} roughness={0.5} />
          </mesh>
          <mesh>
            <boxGeometry args={[b.s + 0.004, b.h + 0.004, 0.02]} />
            <meshStandardMaterial color="#f3e2b3" metalness={0.4} roughness={0.4} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.02, b.h + 0.004, b.s + 0.004]} />
            <meshStandardMaterial color="#f3e2b3" metalness={0.4} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Sign({ w, decor, eventName }: Ctx) {
  const theme = THEMES[decor.theme];
  const text = theme.sign(eventName);
  const tex = useMemo(() => textTexture(text, { w: 600, h: 800, bg: '#fbf8f2', fg: '#2a2622', size: 86, border: decor.accent }), [text, decor.accent]);
  const bw = Math.min(0.8, w);
  return (
    <>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * bw * 0.35, 0.8, 0.05]} rotation-z={s * 0.08} castShadow>
          <boxGeometry args={[0.025, 1.6, 0.025]} />
          <meshStandardMaterial map={woodTexture('#8a6447', '#4f3423')} />
        </mesh>
      ))}
      <mesh position={[0, 0.75, -0.25]} rotation-x={-0.3} castShadow>
        <boxGeometry args={[0.025, 1.55, 0.025]} />
        <meshStandardMaterial map={woodTexture('#8a6447', '#4f3423')} />
      </mesh>
      <mesh position={[0, 1.15, 0.08]} rotation-x={-0.08} castShadow>
        <boxGeometry args={[bw, bw * 1.33, 0.02]} />
        <meshStandardMaterial color="#e8e2d6" />
      </mesh>
      <mesh position={[0, 1.15, 0.092]} rotation-x={-0.08}>
        <planeGeometry args={[bw - 0.04, bw * 1.33 - 0.04]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
    </>
  );
}

function BalloonArch({ w, palette, seed }: { w: number; palette: string[]; seed: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 70;
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const r = rand(seed);
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const a = Math.PI * t;
      const s = 0.12 + r() * 0.1;
      m.compose(
        new THREE.Vector3(-Math.cos(a) * (w / 2) + (r() - 0.5) * 0.12, Math.sin(a) * 2.3 + (r() - 0.5) * 0.12, (r() - 0.5) * 0.25),
        new THREE.Quaternion(),
        new THREE.Vector3(s, s * 1.1, s),
      );
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(palette[Math.floor(r() * palette.length)]));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [w, palette, seed]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
      <sphereGeometry args={[1, 16, 12]} />
      <meshStandardMaterial roughness={0.25} />
    </instancedMesh>
  );
}

function PhotoBooth({ w, d, decor, el, evening }: Ctx) {
  const theme = THEMES[decor.theme];
  const drape = useMemo(() => pleatGeometry(w * 0.85, 2.3, Math.round(w * 4), 0.05), [w]);
  return (
    <>
      <mesh geometry={drape} position={[0, 1.15, -d / 2 + 0.2]} castShadow receiveShadow>
        <meshStandardMaterial color={decor.accent} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <group position-z={-d / 2 + 0.3}>
        <BalloonArch w={w * 0.9} palette={[...theme.palette, decor.accent]} seed={seedOf(el.id)} />
      </group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, 0]}>
        <circleGeometry args={[Math.min(w, d) * 0.35, 40]} />
        <meshStandardMaterial color="#d9cfc0" roughness={1} />
      </mesh>
      {/* ring light on a stand, facing the backdrop */}
      <group position={[0, 0, d / 2 - 0.2]}>
        <mesh position-y={0.75}>
          <cylinderGeometry args={[0.012, 0.012, 1.5, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position-y={1.55}>
          <torusGeometry args={[0.22, 0.025, 12, 40]} />
          <meshBasicMaterial color={evening ? '#ffffff' : '#f0f0f0'} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
}

function Lounge({ w, d, decor }: Ctx) {
  const sofa = useSofaModel();
  const ottoman = useOttomanModel();
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={0.004} receiveShadow>
        <planeGeometry args={[w * 0.9, d * 0.85]} />
        <meshStandardMaterial color={new THREE.Color(decor.accent).lerp(new THREE.Color('#e9e3d8'), 0.75)} roughness={1} />
      </mesh>
      <Clone object={sofa} position={[0, 0, -d / 2 + 0.55]} scale={Math.min(1.4, (w * 0.7) / 1.6)} castShadow />
      <Clone object={ottoman} position={[-w * 0.3, 0, d * 0.25]} rotation-y={0.5} scale={0.8} castShadow />
      <Clone object={ottoman} position={[w * 0.3, 0, d * 0.25]} rotation-y={-0.5} scale={0.8} castShadow />
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.04, 32]} />
        <meshStandardMaterial map={woodTexture('#8a6447', '#4f3423')} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.18, 12]} />
        <meshStandardMaterial color="#2c2a28" metalness={0.4} />
      </mesh>
    </>
  );
}

const RENDER: Record<VenueElement['kind'], (c: Ctx) => React.ReactNode> = {
  stage: (c) => <Stage {...c} />,
  'dance-floor': (c) => <DanceFloor {...c} />,
  bar: (c) => <Bar {...c} />,
  buffet: (c) => <Buffet {...c} />,
  dj: (c) => <DJ {...c} />,
  entrance: (c) => <Entrance {...c} />,
  pillar: (c) => <Pillar {...c} />,
  plant: (c) => <Plant {...c} />,
  cake: (c) => <Cake {...c} />,
  gifts: (c) => <Gifts {...c} />,
  sign: (c) => <Sign {...c} />,
  'photo-booth': (c) => <PhotoBooth {...c} />,
  lounge: (c) => <Lounge {...c} />,
};

export function Elements({ elements, dark, decor, eventName }: { elements: VenueElement[]; dark: boolean; decor: Decor; eventName: string }) {
  const evening = useView((s) => s.lighting === 'evening');
  return (
    <>
      {elements.map((el) => (
        <group key={el.id} position={[toMetres(el.x), 0, toMetres(el.y)]} rotation-y={-deg(el.rotation)}>
          {RENDER[el.kind]({ el, w: toMetres(el.width), d: toMetres(el.height), dark, evening, decor, eventName })}
        </group>
      ))}
    </>
  );
}
