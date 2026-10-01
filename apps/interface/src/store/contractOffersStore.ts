import { create } from "zustand";
import { ContractOffer } from "@apartment-tracker/types";
import { contractOffersApi, CreateContractOfferPayload, UpdateContractOfferPayload } from "@/api/contractOffersApi";

interface ContractOffersState {
  offersByContract: Record<string, ContractOffer[]>;
  loading: boolean;
  fetchByContract: (contractId: string) => Promise<void>;
  createOffer: (payload: CreateContractOfferPayload) => Promise<ContractOffer>;
  updateOffer: (id: string, contractId: string, payload: UpdateContractOfferPayload) => Promise<ContractOffer>;
  deleteOffer: (id: string, contractId: string) => Promise<void>;
}

export const useContractOffersStore = create<ContractOffersState>((set, get) => ({
  offersByContract: {},
  loading: false,

  fetchByContract: async (contractId) => {
    set({ loading: true });
    try {
      const offers = await contractOffersApi.fetchByContract(contractId);
      set((s) => ({ offersByContract: { ...s.offersByContract, [contractId]: offers } }));
    } finally {
      set({ loading: false });
    }
  },

  createOffer: async (payload) => {
    const offer = await contractOffersApi.create(payload);
    set((s) => ({
      offersByContract: {
        ...s.offersByContract,
        [payload.contract_id]: [offer, ...(s.offersByContract[payload.contract_id] ?? [])],
      },
    }));
    return offer;
  },

  updateOffer: async (id, contractId, payload) => {
    const updated = await contractOffersApi.update(id, payload);
    set((s) => ({
      offersByContract: {
        ...s.offersByContract,
        [contractId]: (s.offersByContract[contractId] ?? []).map((o) => (o.id === id ? updated : o)),
      },
    }));
    return updated;
  },

  deleteOffer: async (id, contractId) => {
    await contractOffersApi.delete(id);
    set((s) => ({
      offersByContract: {
        ...s.offersByContract,
        [contractId]: (s.offersByContract[contractId] ?? []).filter((o) => o.id !== id),
      },
    }));
  },
}));
