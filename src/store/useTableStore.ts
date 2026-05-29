import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';
import { create } from 'zustand';
import localforage from 'localforage';

export type SeatingTable = {
  shape: 'circle' | 'rectangle';
  seatCount: number;
  id: string;
  name: string;
  tableNumber: number;
  x: number;
  y: number;
  rotation: number;
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
};

const createTableId = (tableNumber: number) => `table-${tableNumber}`;
const createTableName = (tableNumber: number) => `Table ${tableNumber}`;

const normalizeTables = (tables: SeatingTable[]) =>
  tables.map((table, index) => {
    const tableNumber = table.tableNumber ?? index + 1;

    return {
      ...table,
      id: createTableId(tableNumber),
      name: table.name ?? createTableName(tableNumber),
      tableNumber,

      x: table.x ?? 0,
      y: table.y ?? 0,
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
