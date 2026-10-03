import { create } from "zustand";
import type { Bank } from "@xpensive/types";
import { banksApi } from "@/api/banksApi";

interface BanksState {
  banks: Bank[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  createBank: (name: string) => Promise<Bank>;
  updateBank: (id: string, name: string) => Promise<void>;
  deleteBank: (id: string) => Promise<void>;
}

export const useBanksStore = create<BanksState>((set) => ({
  banks: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const data = await banksApi.fetchAll();
      set({ banks: data });
    } finally {
      set({ loading: false });
    }
  },

  createBank: async (name) => {
    const created = await banksApi.create(name);
    set((s) => ({ banks: [...s.banks, created] }));
    return created;
  },

  updateBank: async (id, name) => {
    const updated = await banksApi.update(id, name);
    set((s) => ({ banks: s.banks.map((b) => (b.id === id ? updated : b)) }));
  },

  deleteBank: async (id) => {
    await banksApi.delete(id);
    set((s) => ({ banks: s.banks.filter((b) => b.id !== id) }));
  },
}));
