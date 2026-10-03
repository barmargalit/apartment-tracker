import { create } from "zustand";
import { Contract, BillType } from "@xpensive/types";
import { contractsApi, CreateContractPayload, UpdateContractPayload } from "@/api/contractsApi";

interface ContractsState {
  contracts: Contract[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  createContract: (payload: CreateContractPayload) => Promise<Contract>;
  updateContract: (id: string, payload: UpdateContractPayload) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
}

export const useContractsStore = create<ContractsState>((set, get) => ({
  contracts: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const data = await contractsApi.fetchAll();
      set({ contracts: data });
    } finally {
      set({ loading: false });
    }
  },

  createContract: async (payload) => {
    const contract = await contractsApi.create(payload);
    set((s) => ({ contracts: [contract, ...s.contracts] }));
    return contract;
  },

  updateContract: async (id, payload) => {
    const updated = await contractsApi.update(id, payload);
    set((s) => ({
      contracts: s.contracts.map((c) => (c.id === id ? updated : c)),
    }));
  },

  deleteContract: async (id) => {
    await contractsApi.delete(id);
    set((s) => ({ contracts: s.contracts.filter((c) => c.id !== id) }));
  },
}));
