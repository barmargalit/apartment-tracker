import { BillType, Contract, ContractData } from "@apartment-tracker/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface CreateContractPayload {
  bill_type: BillType;
  provider_id: string;
  residence_id?: string | null;
  resident_id?: string | null;
  monthly_price: number;
  start_date: string;
  end_date?: string | null;
  comment?: string | null;
  data: ContractData;
}

export interface UpdateContractPayload {
  bill_type?: BillType;
  provider_id?: string;
  residence_id?: string | null;
  resident_id?: string | null;
  monthly_price?: number;
  start_date?: string;
  end_date?: string | null;
  comment?: string | null;
  data?: ContractData;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const contractsApi = {
  fetchAll: (): Promise<Contract[]> =>
    request<Contract[]>("/contracts"),

  fetchByType: (type: BillType): Promise<Contract[]> =>
    request<Contract[]>(`/contracts?type=${type}`),

  create: (payload: CreateContractPayload): Promise<Contract> =>
    request<Contract>("/contracts", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: UpdateContractPayload): Promise<Contract> =>
    request<Contract>(`/contracts/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  delete: (id: string): Promise<void> =>
    request<void>(`/contracts/${id}`, { method: "DELETE" }),
};
