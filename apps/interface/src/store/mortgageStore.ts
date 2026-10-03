import { create } from "zustand";
import type { MortgagePlan, MortgageTrack, MortgageTrackType, MortgageTrackData } from "@xpensive/types";
import { mortgagePlansApi } from "@/api/mortgagePlansApi";
import { mortgageTracksApi } from "@/api/mortgageTracksApi";

interface MortgageState {
  plans: MortgagePlan[];
  tracksByPlan: Record<string, MortgageTrack[]>;
  plansLoading: boolean;
  tracksLoading: Record<string, boolean>;

  fetchPlans: () => Promise<void>;
  fetchTracks: (planId: string) => Promise<void>;

  createPlan: (totalLoan: number, bankId?: string | null) => Promise<MortgagePlan>;
  deletePlan: (id: string) => Promise<void>;

  createTrack: (planId: string, type: MortgageTrackType, amount: number, years: number, data: MortgageTrackData) => Promise<MortgageTrack>;
  updateTrack: (id: string, planId: string, type: MortgageTrackType, amount: number, years: number, data: MortgageTrackData) => Promise<void>;
  deleteTrack: (id: string, planId: string) => Promise<void>;
}

export const useMortgageStore = create<MortgageState>((set) => ({
  plans: [],
  tracksByPlan: {},
  plansLoading: false,
  tracksLoading: {},

  fetchPlans: async () => {
    set({ plansLoading: true });
    try {
      const data = await mortgagePlansApi.fetchAll();
      set({ plans: data });
    } finally {
      set({ plansLoading: false });
    }
  },

  fetchTracks: async (planId) => {
    set((s) => ({ tracksLoading: { ...s.tracksLoading, [planId]: true } }));
    try {
      const data = await mortgageTracksApi.fetchByPlan(planId);
      set((s) => ({ tracksByPlan: { ...s.tracksByPlan, [planId]: data } }));
    } finally {
      set((s) => ({ tracksLoading: { ...s.tracksLoading, [planId]: false } }));
    }
  },

  createPlan: async (totalLoan, bankId) => {
    const created = await mortgagePlansApi.create({ total_loan: totalLoan, bank_id: bankId ?? null });
    set((s) => ({ plans: [...s.plans, created], tracksByPlan: { ...s.tracksByPlan, [created.id]: [] } }));
    return created;
  },

  deletePlan: async (id) => {
    await mortgagePlansApi.delete(id);
    set((s) => {
      const { [id]: _, ...rest } = s.tracksByPlan;
      return { plans: s.plans.filter((p) => p.id !== id), tracksByPlan: rest };
    });
  },

  createTrack: async (planId, type, amount, years, data) => {
    const created = await mortgageTracksApi.create({ plan_id: planId, type, amount, years, months: years * 12, data });
    set((s) => ({ tracksByPlan: { ...s.tracksByPlan, [planId]: [...(s.tracksByPlan[planId] ?? []), created] } }));
    return created;
  },

  updateTrack: async (id, planId, type, amount, years, data) => {
    const updated = await mortgageTracksApi.update(id, { type, amount, years, months: years * 12, data });
    set((s) => ({
      tracksByPlan: {
        ...s.tracksByPlan,
        [planId]: (s.tracksByPlan[planId] ?? []).map((t) => (t.id === id ? updated : t)),
      },
    }));
  },

  deleteTrack: async (id, planId) => {
    await mortgageTracksApi.delete(id);
    set((s) => ({
      tracksByPlan: {
        ...s.tracksByPlan,
        [planId]: (s.tracksByPlan[planId] ?? []).filter((t) => t.id !== id),
      },
    }));
  },
}));
