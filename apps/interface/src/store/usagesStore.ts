import { create } from "zustand";
import { Usage, BillType } from "@apartment-tracker/types";
import { usagesApi, CreateUsagePayload, UsageFilterParams } from "@/api/usagesApi";

type UsagesByType = Record<BillType, Usage[]>;
type LoadingByType = Record<BillType, boolean>;

interface UsagesState {
  usages: UsagesByType;
  loading: LoadingByType;
  fetchByType: (params: UsageFilterParams) => Promise<void>;
  createMany: (payload: CreateUsagePayload[]) => Promise<void>;
}

const emptyUsages = (): UsagesByType =>
  Object.values(BillType).reduce((acc, t) => ({ ...acc, [t]: [] }), {} as UsagesByType);

const emptyLoading = (): LoadingByType =>
  Object.values(BillType).reduce((acc, t) => ({ ...acc, [t]: false }), {} as LoadingByType);

export const useUsagesStore = create<UsagesState>((set) => ({
  usages: emptyUsages(),
  loading: emptyLoading(),

  fetchByType: async (params) => {
    set((s) => ({ loading: { ...s.loading, [params.type]: true } }));
    try {
      const data = await usagesApi.fetchByType(params);
      set((s) => ({ usages: { ...s.usages, [params.type]: data } }));
    } finally {
      set((s) => ({ loading: { ...s.loading, [params.type]: false } }));
    }
  },

  createMany: async (payload) => {
    if (payload.length === 0) return;
    const created = await usagesApi.createMany(payload);
    for (const usage of created) {
      set((s) => ({
        usages: {
          ...s.usages,
          [usage.type]: [...s.usages[usage.type as BillType], usage],
        },
      }));
    }
  },
}));
