import { create } from "zustand";
import { Residence } from "@apartment-tracker/types";
import { residencesApi } from "@/api/residencesApi";

interface ResidencesState {
  residences: Residence[];
  loading: boolean;
  fetchAll: () => Promise<void>;
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
}));
