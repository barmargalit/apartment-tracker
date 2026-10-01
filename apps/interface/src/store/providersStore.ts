import { create } from "zustand";
import { BillType, Provider } from "@apartment-tracker/types";
import { providersApi } from "@/api/providersApi";

interface ProvidersState {
  providers: Provider[];
  loading: boolean;
  fetchAll: (type?: BillType) => Promise<void>;
  createProvider: (name: string, types: BillType[]) => Promise<Provider>;
  updateProvider: (id: string, name: string, types: BillType[]) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
}

export const useProvidersStore = create<ProvidersState>((set) => ({
  providers: [],
  loading: false,

  fetchAll: async (type) => {
    set({ loading: true });
    try {
      const data = await providersApi.fetchAll(type);
      set({ providers: data });
    } finally {
      set({ loading: false });
    }
  },

  createProvider: async (name, types) => {
    const created = await providersApi.create({ name, types });
    set((s) => ({ providers: [...s.providers, created] }));
    return created;
  },

  updateProvider: async (id, name, types) => {
    const updated = await providersApi.update(id, { name, types });
    set((s) => ({
      providers: s.providers.map((p) => (p.id === id ? updated : p)),
    }));
  },

  deleteProvider: async (id) => {
    await providersApi.delete(id);
    set((s) => ({ providers: s.providers.filter((p) => p.id !== id) }));
  },
}));
