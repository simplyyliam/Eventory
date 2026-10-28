import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { useWorkspace } from '@/store/workspace';
import { toMetres, useView } from '../viewStore';
import { Room, WALL_H } from './Room';
import { Chairs, Elements, People, Tables, useSpots } from './Furniture';
import { CameraRig } from './CameraRig';
import { TableCard } from './TableCard';

function Lights({ w, d, evening, dark }: { w: number; d: number; evening: boolean; dark: boolean }) {
  const span = Math.max(w, d);
  const shadowCam = span * 0.75;
  return (
    <>
      <hemisphereLight args={[evening ? '#ffd9b0' : '#ffffff', evening ? '#3a2c20' : '#d8cfc3', evening ? 0.18 : dark ? 0.45 : 0.75]} />
      <directionalLight
        position={[w * 0.45, 14, d * 0.35]}
        intensity={evening ? 0.35 : 2.1}
        color={evening ? '#9fb4ff' : '#fff6ea'}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-shadowCam}
        shadow-camera-right={shadowCam}
        shadow-camera-top={shadowCam}
        shadow-camera-bottom={-shadowCam}
        shadow-camera-far={60}
        shadow-radius={6}
      />
      {/* two warm fills only: every extra light makes every surface more expensive */}
      {evening &&
        [-1, 1].map((ix) => (
          <pointLight key={ix} position={[(ix * w) / 4, WALL_H - 0.3, 0]} intensity={9} distance={span} decay={1.4} color="#ffc98a" />
        ))}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={evening ? 0.4 : 1.6} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} color={evening ? '#ffcf9a' : '#ffffff'} />
        <Lightformer intensity={evening ? 0.2 : 0.8} position={[-8, 3, 4]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer intensity={evening ? 0.2 : 0.6} position={[8, 3, -4]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} />
      </Environment>
    </>
  );
}

export function Scene({ dark }: { dark: boolean }) {
  const tables = useWorkspace((s) => s.tables);
  const guests = useWorkspace((s) => s.guests);
  const venue = useWorkspace((s) => s.venue);
  const evening = useView((s) => s.lighting === 'evening');
  const people = useView((s) => s.people);
  const spots = useSpots(tables, guests);
  const w = toMetres(venue.room.width);
  const d = toMetres(venue.room.depth);
  const bg = evening ? '#14110e' : dark ? '#0f0f0f' : '#ebe8e3';
  const span = Math.max(w, d);

  // Shadows are only re-rendered when something in the room changes, not every
  // frame. Walking around a static room costs no shadow passes at all.
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    invalidate();
  }, [gl, invalidate, tables, guests, venue, evening, people, dark]);

  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, span * 1.6, span * 4]} />
      <Lights w={w} d={d} evening={evening} dark={dark} />
      <Room room={venue.room} dark={dark} />
      <Elements elements={venue.elements} dark={dark} />
      <Tables tables={tables} guests={guests} />
      <Chairs spots={spots} dark={dark} />
      {people && <People spots={spots} />}
      <TableCard />
      <CameraRig w={w} d={d} />
    </>
  );
}
