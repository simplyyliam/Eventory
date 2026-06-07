import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';
import { create } from 'zustand';
import localforage from 'localforage';
import type { TextureId } from '@/config/textureLoader';
import axios from 'axios';
import { API_BASE_URL } from '@app/shared/utils/api';

export type SeatingTable = {
  shape: 'circle' | 'rectangle';
  seatCount: number;
  id: string;
  name: string;
  tableNumber: number;
  x: number;
  y: number;
  rotation: number;
  textureId: TextureId;
};

type TableStore = {
  activeEventId: string | null;
  tables: SeatingTable[];
  tablesByEventId: Record<string, SeatingTable[]>;
  setActiveEvent: (eventId: string) => void;
  setTables: (eventId: string, tables: SeatingTable[]) => void;
  addTables: (
    shape: SeatingTable['shape'],
    seatCount: number,
    name?: string,
  ) => void;
  updateTableSeats: (tableId: string, seatCount: number) => void;
  updateTablePosition: (tableId: string, x: number, y: number) => void;
  updateTableRotation: (tableId: string, rotation: number) => void;
  updateTableShape: (tableId: string, shape: SeatingTable['shape']) => void;
updateTableName: (tableId: string, name: string) => Promise<void>;
  updateTableTexture: (tableId: string, textureId: TextureId) => void;
  removeTable: (tableId: string) => void;
};

const createTableName = (tableNumber: number) => `Table ${tableNumber}`;

const WORLD_SIZE = 10000;
const WORLD_HALF = WORLD_SIZE / 2;

const normalizeTables = (tables: SeatingTable[]) =>
  tables.map((table, index) => {
    const tableNumber = table.tableNumber ?? index + 1;

    let x = table.x ?? 0;
    let y = table.y ?? 0;

    // Only convert coordinates for legacy slug-based tables
    const isLegacyTable = table.id.startsWith('table-');
    const looksLikeTopLeft =
      isLegacyTable &&
      typeof x === 'number' &&
      typeof y === 'number' &&
      x >= 0 &&
      x <= WORLD_SIZE &&
      y >= 0 &&
      y <= WORLD_SIZE;

    if (looksLikeTopLeft) {
      x = x - WORLD_HALF;
      y = y - WORLD_HALF;
    }

    return {
      ...table,
      id: table.id,
      name: table.name ?? createTableName(tableNumber),
      tableNumber,
      x,
      y,
      rotation: table.rotation ?? 0,
    };
  });

const updateEventTables = (
  activeEventId: string | null,
  tablesByEventId: Record<string, SeatingTable[]>,
  tables: SeatingTable[],
) => {
  if (!activeEventId) return { tables };

  return {
    tables,
    tablesByEventId: {
      ...tablesByEventId,
      [activeEventId]: tables,
    },
  };
};

export const useTableStore = create<TableStore>()(
  persist(
    (set, get) => ({
      activeEventId: null,
      tables: [],
      tablesByEventId: {},

      setActiveEvent: (eventId) => {
        const state = get();
        set({
          activeEventId: eventId,
          tables: state.tablesByEventId[eventId] ?? [],
        });
      },

      setTables: (eventId, tables) => {
        set({
          activeEventId: eventId,
          tables,
          tablesByEventId: {
            ...get().tablesByEventId,
            [eventId]: tables,
          },
        });
      },

      addTables: (shape, seatCount, name) => {
        const state = get();
        const maxNumber = state.tables.reduce(
          (max, t) => Math.max(max, t.tableNumber ?? 0),
          0,
        );
        const tableNumber = maxNumber + 1;
        const newTable: SeatingTable = {
          shape,
          seatCount,
          id: crypto.randomUUID(),
          name: name ?? createTableName(tableNumber),
          tableNumber,
          x: 0,
          y: 0,
          rotation: 0,
          textureId: 'white-oak',
        };
        set(
          updateEventTables(state.activeEventId, state.tablesByEventId, [
            ...state.tables,
            newTable,
          ]),
        );
      },

      updateTableSeats: (tableId, seatCount) => {
        const state = get();
        set(
          updateEventTables(
            state.activeEventId,
            state.tablesByEventId,
            state.tables.map((t) =>
              t.id === tableId ? { ...t, seatCount } : t,
            ),
          ),
        );
      },

      updateTablePosition: (tableId, x, y) => {
        const state = get();
        set(
          updateEventTables(
            state.activeEventId,
            state.tablesByEventId,
            state.tables.map((t) => (t.id === tableId ? { ...t, x, y } : t)),
          ),
        );
      },

      updateTableRotation: (tableId, rotation) => {
        const state = get();
        set(
          updateEventTables(
            state.activeEventId,
            state.tablesByEventId,
            state.tables.map((t) =>
              t.id === tableId ? { ...t, rotation } : t,
            ),
          ),
        );
      },

      updateTableShape: (tableId, shape) => {
        const state = get();
        set(
          updateEventTables(
            state.activeEventId,
            state.tablesByEventId,
            state.tables.map((t) => (t.id === tableId ? { ...t, shape } : t)),
          ),
        );
      },

updateTableName: async (tableId, name) => {
  const state = get();
  // Optimistic update
  set(
    updateEventTables(
      state.activeEventId,
      state.tablesByEventId,
      state.tables.map((t) => (t.id === tableId ? { ...t, name } : t)),
    ),
  );
  // Sync to server
  try {
    await axios.patch(`${API_BASE_URL}/tables/${tableId}`, { name })
  } catch (err) {
    console.error('Failed to update table name', err)
  }
},

      updateTableTexture: (tableId, textureId) => {
        const state = get();
        set(
          updateEventTables(
            state.activeEventId,
            state.tablesByEventId,
            state.tables.map((t) =>
              t.id === tableId ? { ...t, textureId } : t,
            ),
          ),
        );
      },

      removeTable: (tableId) => {
        const state = get();
        set(
          updateEventTables(
            state.activeEventId,
            state.tablesByEventId,
            state.tables.filter((t) => t.id !== tableId),
          ),
        );
      },
    }),
    {
      name: 'table-store',
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as TableStore;
        return {
          ...state,
          activeEventId: state.activeEventId ?? null,
          tables: normalizeTables(state.tables ?? []),
          tablesByEventId: state.tablesByEventId ?? {},
        };
      },
      storage: createJSONStorage(
        (): StateStorage => ({
          getItem: (name) => localforage.getItem<string>(name),
          setItem: async (name, value) => {
            await localforage.setItem(name, value);
          },
          removeItem: (name) => localforage.removeItem(name),
        }),
      ),
    },
  ),
);
