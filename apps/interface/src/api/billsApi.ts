import { Bill, BillData, BillType } from "@apartment-tracker/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface CreateBillPayload {
  type: BillType;
  start_date: string;
  end_date: string;
  price: number;
  data: BillData;
}

export interface UpdateBillPayload {
  type?: BillType;
  start_date?: string;
  end_date?: string;
  price?: number;
  data?: BillData;
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

export const billsApi = {
  fetchLast: (): Promise<Bill[]> =>
    request<Bill[]>('/bills/last'),

  fetchByType: (type: BillType): Promise<Bill[]> =>
    request<Bill[]>(`/bills?type=${type}`),

  create: (payload: CreateBillPayload): Promise<Bill> =>
    request<Bill>("/bills", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: UpdateBillPayload): Promise<Bill> =>
    request<Bill>(`/bills/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  delete: (id: string): Promise<void> =>
    request<void>(`/bills/${id}`, { method: "DELETE" }),
};
