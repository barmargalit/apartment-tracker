import { create } from "zustand";
import { Resident } from "@xpensive/types";
import { residentsApi, CreateResidentPayload, UpdateResidentPayload } from "@/api/residentsApi";

interface ResidentsState {
  residents: Resident[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  createResident: (payload: CreateResidentPayload) => Promise<void>;
  updateResident: (id: string, payload: UpdateResidentPayload) => Promise<void>;
  deleteResident: (id: string) => Promise<void>;
}

export const useResidentsStore = create<ResidentsState>((set) => ({
  residents: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const data = await residentsApi.fetchAll();
      set({ residents: data });
    } finally {
      set({ loading: false });
    }
  },

  createResident: async (payload) => {
    const created = await residentsApi.create(payload);
    set((s) => ({ residents: [...s.residents, created].sort((a, b) => a.name.localeCompare(b.name)) }));
  },

  updateResident: async (id, payload) => {
    const updated = await residentsApi.update(id, payload);
    set((s) => ({
      residents: s.residents.map((r) => (r.id === id ? updated : r)),
    }));
  },

  deleteResident: async (id) => {
    await residentsApi.delete(id);
    set((s) => ({ residents: s.residents.filter((r) => r.id !== id) }));
  },
}));
