import { create } from "zustand";
import { Prospect } from "@apartment-tracker/types";
import { prospectsApi, CreateProspectPayload, UpdateProspectPayload } from "@/api/prospectsApi";

interface ProspectsState {
  prospects: Prospect[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  createProspect: (payload: CreateProspectPayload) => Promise<void>;
  updateProspect: (id: string, payload: UpdateProspectPayload) => Promise<void>;
  deleteProspect: (id: string) => Promise<void>;
}

export const useProspectsStore = create<ProspectsState>((set) => ({
  prospects: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const data = await prospectsApi.fetchAll();
      set({ prospects: data });
    } finally {
      set({ loading: false });
    }
  },

  createProspect: async (payload) => {
    const created = await prospectsApi.create(payload);
    set((s) => ({ prospects: [created, ...s.prospects] }));
  },

  updateProspect: async (id, payload) => {
    const updated = await prospectsApi.update(id, payload);
    set((s) => ({ prospects: s.prospects.map((p) => (p.id === id ? updated : p)) }));
  },

  deleteProspect: async (id) => {
    await prospectsApi.delete(id);
    set((s) => ({ prospects: s.prospects.filter((p) => p.id !== id) }));
  },
}));
