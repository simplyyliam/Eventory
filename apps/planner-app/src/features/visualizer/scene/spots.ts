import { useMemo } from 'react';
import { seatPoses, toPlan } from '@/domain/geometry';
import type { Guest, PlanTable } from '@/domain/types';
import { toMetres } from '../viewStore';

const deg = (d: number) => (d * Math.PI) / 180;

export type Spot = { x: number; z: number; rot: number; guest: Guest | null };

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
