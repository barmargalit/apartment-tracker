import { create } from "zustand";
import { Residence } from "@xpensive/types";
import { residencesApi, CreateResidencePayload, UpdateResidencePayload } from "@/api/residencesApi";

interface ResidencesState {
  residences: Residence[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  createResidence: (payload: CreateResidencePayload) => Promise<void>;
  updateResidence: (id: string, payload: UpdateResidencePayload) => Promise<void>;
  deleteResidence: (id: string) => Promise<void>;
}

export const useResidencesStore = create<ResidencesState>((set) => ({
  residences: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const data = await residencesApi.fetchAll();
      set({ residences: data });
    } finally {
      set({ loading: false });
    }
  },

  createResidence: async (payload) => {
    const created = await residencesApi.create(payload);
    set((s) => ({ residences: [...s.residences, created] }));
  },

  updateResidence: async (id, payload) => {
    const updated = await residencesApi.update(id, payload);
    set((s) => ({
      residences: s.residences.map((r) => (r.id === id ? updated : r)),
    }));
  },

  deleteResidence: async (id) => {
    await residencesApi.delete(id);
    set((s) => ({ residences: s.residences.filter((r) => r.id !== id) }));
  },
}));
