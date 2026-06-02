import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';
import { create } from 'zustand';
import localforage from 'localforage';
import type { TextureId } from '@/config/textureLoader';

export type SeatingTable = {
  shape: 'circle' | 'rectangle';
  seatCount: number;
  id: string;
  name: string;
  tableNumber: number;
  x: number;
  y: number;
  rotation: number;
  textureId: TextureId
};

type TableStore = {
  tables: SeatingTable[];
  addTables: (
    shape: SeatingTable['shape'],
    seatCount: number,
    name?: string,
  ) => void;
  updateTableSeats: (tableId: string, seatCount: number) => void;
  updateTablePosition: (tableId: string, x: number, y: number) => void;
  updateTableRotation: (tableId: string, rotation: number) => void;
  updateTableShape: (tableId: string, shape: SeatingTable['shape']) => void;
  updateTableName: (tableId: string, name: SeatingTable['name']) => void;
  updateTableTexture: (tableId: string, textureId: TextureId) => void;
  removeTable: (tableId: string) => void;
};

const createTableId = (tableNumber: number) => `table-${tableNumber}`;
const createTableName = (tableNumber: number) => `Table ${tableNumber}`;

const WORLD_SIZE = 10000;
const WORLD_HALF = WORLD_SIZE / 2;

const normalizeTables = (tables: SeatingTable[]) =>
  tables.map((table, index) => {
    const tableNumber = table.tableNumber ?? index + 1;

    // If stored coordinates appear to be in top-left origin (0..WORLD_SIZE),
    // convert them to center-origin by subtracting WORLD_HALF. This allows a
    // smooth one-time migration when switching coordinate systems.
    let x = table.x ?? 0;
    let y = table.y ?? 0;

    const looksLikeTopLeft =
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
      id: createTableId(tableNumber),
      name: table.name ?? createTableName(tableNumber),
      tableNumber,

      x,
      y,
      rotation: table.rotation ?? 0,
    };
  });

export const useTableStore = create<TableStore>()(
  persist(
    (set, get) => ({
      tables: [],

      addTables: (shape, seatCount, name) => {
        const tables = get().tables;

        const maxNumber = tables.reduce(
          (max, t) => Math.max(max, t.tableNumber ?? 0),
          0,
        );
        const tableNumber = maxNumber + 1;

        const newTable: SeatingTable = {
          shape,
          seatCount,
          id: createTableId(tableNumber),
          name: name ?? createTableName(tableNumber),
          tableNumber,
          x: 0,
          y: 0,
          rotation: 0,
          textureId: 'white-oak'
        };

        set({
          tables: [...tables, newTable],
        });
      },

      updateTableSeats: (tableId, seatCount) => {
        const tables = get().tables;
        set({
          tables: tables.map((table) =>
            table.id === tableId ? { ...table, seatCount } : table,
          ),
        });
      },

      updateTablePosition: (tableId, x, y) => {
        const tables = get().tables;

        set({
          tables: tables.map((table) =>
            table.id === tableId ? { ...table, x, y } : table,
          ),
        });
      },
      updateTableRotation: (tableId, rotation) => {
        const tables = get().tables;

        set({
          tables: tables.map((table) =>
            table.id === tableId ? { ...table, rotation } : table,
          ),
        });
      },

      updateTableShape: (tableId, shape) => {
        const tables = get().tables;

        set({
          tables: tables.map((table) =>
            table.id === tableId ? { ...table, shape } : table,
          ),
        });
      },

      updateTableName: (tableId, name) => {
        const tables = get().tables;

        set({
          tables: tables.map((table) =>
            table.id === tableId ? { ...table, name } : table,
          ),
        });
      },

      updateTableTexture: (tableId, textureId) => {
        const tables = get().tables;

        set({
          tables: tables.map((table) =>
            table.id === tableId ? { ...table, textureId } : table,
          ),
        });
      },

      removeTable: (tableId) => {
        const tables = get().tables;

        set({
          tables: tables.filter((table) => table.id !== tableId),
        });
      },
    }),
    {
      name: 'table-store',
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as TableStore;

        return {
          ...state,
          tables: normalizeTables(state.tables ?? []),
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
