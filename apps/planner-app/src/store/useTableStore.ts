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
import { useHistoryStore } from '@/store/useHistorySnapshot';

const saveHistory = () => {
  const history = useHistoryStore.getState();
  // If no baseline exists yet, init first
  if (history.past.length === 0) {
    history.init();
  }
  history.save();
};

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
  // --- NEW FIELDS ---
  height?: number;           // Dynamic height for rectangle tables (px)
  hiddenSeats?: string[];    // Seat IDs toggled off by user e.g. ['uuid-seat-1']
  linkedTableId?: string;    // ID of the table this one is snapped/joined to
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
  updateTableHeight: (tableId: string, height: number) => void;
  toggleSeatVisibility: (tableId: string, seatId: string) => void;
  linkTables: (tableIdA: string, tableIdB: string) => void;
  unlinkTable: (tableId: string) => void;
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
      hiddenSeats: table.hiddenSeats ?? [],
      linkedTableId: table.linkedTableId ?? undefined,
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
          hiddenSeats: [],
        };
        set(
          updateEventTables(state.activeEventId, state.tablesByEventId, [
            ...state.tables,
            newTable,
          ]),
        );
        saveHistory();
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
        saveHistory();
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
        saveHistory();
      },

      updateTableName: async (tableId, name) => {
        const state = get();
        set(
          updateEventTables(
            state.activeEventId,
            state.tablesByEventId,
            state.tables.map((t) => (t.id === tableId ? { ...t, name } : t)),
          ),
        );
        try {
          await axios.patch(`${API_BASE_URL}/tables/${tableId}`, { name });
        } catch (err) {
          console.error('Failed to update table name', err);
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
        saveHistory();
      },

      // --- NEW ACTIONS ---

      updateTableHeight: (tableId, height) => {
        const state = get();
        set(
          updateEventTables(
            state.activeEventId,
            state.tablesByEventId,
            state.tables.map((t) =>
              t.id === tableId ? { ...t, height } : t,
            ),
          ),
        );
      },

      toggleSeatVisibility: (tableId, seatId) => {
        const state = get();
        set(
          updateEventTables(
            state.activeEventId,
            state.tablesByEventId,
            state.tables.map((t) => {
              if (t.id !== tableId) return t;
              const hidden = t.hiddenSeats ?? [];
              const isHidden = hidden.includes(seatId);
              return {
                ...t,
                hiddenSeats: isHidden
                  ? hidden.filter((s) => s !== seatId)
                  : [...hidden, seatId],
              };
            }),
          ),
        );
        console.log('saving history, past length before:', useHistoryStore.getState().past.length);
        saveHistory();
        console.log('saved history, past length after:', useHistoryStore.getState().past.length);
      },

      // Links two tables together — suppresses inner head seats automatically
      linkTables: (tableIdA, tableIdB) => {
        const state = get();
        const tableA = state.tables.find((t) => t.id === tableIdA);
        const tableB = state.tables.find((t) => t.id === tableIdB);
        if (!tableA || !tableB) return;

        // Seat index 1 = bottom foot (the join edge between the two tables)
        // We hide seat-2 (index 1, foot) on A and seat-1 (index 0, head) on B
        // so the inner touching ends are clear. Adjust to your convention if needed.
        const seatAInner = `${tableIdA}-seat-2`; // foot of table A
        const seatBInner = `${tableIdB}-seat-1`; // head of table B

        set(
          updateEventTables(
            state.activeEventId,
            state.tablesByEventId,
            state.tables.map((t) => {
              if (t.id === tableIdA) {
                const hidden = new Set(t.hiddenSeats ?? []);
                hidden.add(seatAInner);
                return { ...t, linkedTableId: tableIdB, hiddenSeats: [...hidden] };
              }
              if (t.id === tableIdB) {
                const hidden = new Set(t.hiddenSeats ?? []);
                hidden.add(seatBInner);
                return { ...t, linkedTableId: tableIdA, hiddenSeats: [...hidden] };
              }
              return t;
            }),
          ),
        );
        saveHistory();
      },

      // Removes a link and restores inner seats
      unlinkTable: (tableId) => {
        const state = get();
        const table = state.tables.find((t) => t.id === tableId);
        if (!table?.linkedTableId) return;

        const partnerId = table.linkedTableId;
        const seatAInner = `${tableId}-seat-2`;
        const seatBInner = `${partnerId}-seat-1`;

        set(
          updateEventTables(
            state.activeEventId,
            state.tablesByEventId,
            state.tables.map((t) => {
              if (t.id === tableId) {
                return {
                  ...t,
                  linkedTableId: undefined,
                  hiddenSeats: (t.hiddenSeats ?? []).filter((s) => s !== seatAInner),
                };
              }
              if (t.id === partnerId) {
                return {
                  ...t,
                  linkedTableId: undefined,
                  hiddenSeats: (t.hiddenSeats ?? []).filter((s) => s !== seatBInner),
                };
              }
              return t;
            }),
          ),
        );
        saveHistory();
      },

      removeTable: (tableId) => {
        const state = get();
        // If this table was linked, unlink partner first
        const table = state.tables.find((t) => t.id === tableId);
        let tables = state.tables;
        if (table?.linkedTableId) {
          const partnerId = table.linkedTableId;
          const seatBInner = `${partnerId}-seat-1`;
          tables = tables.map((t) => {
            if (t.id === partnerId) {
              return {
                ...t,
                linkedTableId: undefined,
                hiddenSeats: (t.hiddenSeats ?? []).filter((s) => s !== seatBInner),
              };
            }
            return t;
          });
        }
        set(
          updateEventTables(
            state.activeEventId,
            state.tablesByEventId,
            tables.filter((t) => t.id !== tableId),
          ),
        );
        saveHistory();
      },
    }),
    {
      name: 'table-store',
      version: 4, // bumped from 3 → new fields need fresh migration
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