import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';
import { create } from 'zustand';
import localforage from 'localforage';

type table = {
  shape: 'circle' | 'rectangle';
  seatCount: number;
};

type TableStore = {
  tables: table[];
  addTables: (shape: table['shape'], seatCount: number) => void;
};

export const useTableStore = create<TableStore>()(
  persist(
    (set) => ({
      tables: [],
      addTables: (shape, seatCount) => {
        set((state) => ({
          tables: [...state.tables, { shape, seatCount }],
        }));
      },
    }),
    {
      name: 'table-store',
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
