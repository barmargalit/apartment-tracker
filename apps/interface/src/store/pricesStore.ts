import { create } from "zustand";
import { BillType, Price, PriceHistory } from "@apartment-tracker/types";
import { pricesApi, UpsertPricePayload, UpdateHistoryPayload } from "@/api/pricesApi";

interface PricesState {
  current: Partial<Record<BillType, Price | null>>;
  history: Partial<Record<BillType, PriceHistory[]>>;
  loading: Partial<Record<BillType, boolean>>;
  fetchCurrentByType: (type: BillType) => Promise<void>;
  fetchHistoryByType: (type: BillType) => Promise<void>;
  upsertPrice: (payload: UpsertPricePayload) => Promise<void>;
  updateHistoryPrice: (id: string, type: BillType, payload: UpdateHistoryPayload) => Promise<void>;
}

export const usePricesStore = create<PricesState>((set) => ({
  current: {},
  history: {},
  loading: {},

  fetchCurrentByType: async (type) => {
    set((s) => ({ loading: { ...s.loading, [type]: true } }));
    try {
      const data = await pricesApi.fetchCurrent(type);
      set((s) => ({ current: { ...s.current, [type]: data } }));
    } finally {
      set((s) => ({ loading: { ...s.loading, [type]: false } }));
    }
  },

  fetchHistoryByType: async (type) => {
    const data = await pricesApi.fetchHistory(type);
    set((s) => ({ history: { ...s.history, [type]: data } }));
  },

  updateHistoryPrice: async (id, type, payload) => {
    await pricesApi.updateHistory(id, payload);
    const history = await pricesApi.fetchHistory(type);
    set((s) => ({ history: { ...s.history, [type]: history } }));
  },

  upsertPrice: async (payload) => {
    await pricesApi.upsert(payload);
    const [current, history] = await Promise.all([
      pricesApi.fetchCurrent(payload.type),
      pricesApi.fetchHistory(payload.type),
    ]);
    set((s) => ({
      current: { ...s.current, [payload.type]: current },
      history: { ...s.history, [payload.type]: history },
    }));
  },
}));
