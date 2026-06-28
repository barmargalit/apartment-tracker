import { create } from "zustand";
import { Provider } from "@apartment-tracker/types";
import { providersApi } from "@/api/providersApi";

interface ProvidersState {
  providers: Provider[];
  loading: boolean;
  fetchAll: () => Promise<void>;
}

export const useProvidersStore = create<ProvidersState>((set) => ({
  providers: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const data = await providersApi.fetchAll();
      set({ providers: data });
    } finally {
      set({ loading: false });
    }
  },
}));
