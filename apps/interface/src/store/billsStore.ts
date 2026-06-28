import { create } from "zustand";
import { Bill, BillType } from "@apartment-tracker/types";
import { billsApi, CreateBillPayload, UpdateBillPayload } from "@/api/billsApi";

type BillsByType = Record<BillType, Bill[]>;
type LoadingByType = Record<BillType, boolean>;

interface BillsState {
  bills: BillsByType;
  loading: LoadingByType;
  fetchByType: (type: BillType) => Promise<void>;
  createBill: (payload: CreateBillPayload) => Promise<void>;
  updateBill: (id: string, type: BillType, payload: UpdateBillPayload) => Promise<void>;
  deleteBill: (id: string, type: BillType) => Promise<void>;
}

const emptyBills = (): BillsByType =>
  Object.values(BillType).reduce((acc, t) => ({ ...acc, [t]: [] }), {} as BillsByType);

const emptyLoading = (): LoadingByType =>
  Object.values(BillType).reduce((acc, t) => ({ ...acc, [t]: false }), {} as LoadingByType);

export const useBillsStore = create<BillsState>((set, get) => ({
  bills: emptyBills(),
  loading: emptyLoading(),

  fetchByType: async (type) => {
    set((s) => ({ loading: { ...s.loading, [type]: true } }));
    try {
      const data = await billsApi.fetchByType(type);
      set((s) => ({ bills: { ...s.bills, [type]: data } }));
    } finally {
      set((s) => ({ loading: { ...s.loading, [type]: false } }));
    }
  },

  createBill: async (payload) => {
    const bill = await billsApi.create(payload);
    set((s) => ({
      bills: { ...s.bills, [bill.type]: [...s.bills[bill.type], bill] },
    }));
  },

  updateBill: async (id, type, payload) => {
    const updated = await billsApi.update(id, payload);
    set((s) => ({
      bills: {
        ...s.bills,
        [type]: s.bills[type].map((b) => (b.id === id ? updated : b)),
      },
    }));
  },

  deleteBill: async (id, type) => {
    await billsApi.delete(id);
    set((s) => ({
      bills: {
        ...s.bills,
        [type]: s.bills[type].filter((b) => b.id !== id),
      },
    }));
  },
}));
