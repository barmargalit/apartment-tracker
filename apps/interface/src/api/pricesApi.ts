import { Price, PriceHistory, BillType } from "@apartment-tracker/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface UpsertPricePayload {
  type: BillType;
  price: number;
  provider_id?: string | null;
  valid_from?: string;
  comment?: string | null;
}

export interface UpdateHistoryPayload {
  price?: number;
  provider_id?: string | null;
  valid_from?: string;
  comment?: string | null;
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

export const pricesApi = {
  fetchCurrent: (type: BillType): Promise<Price | null> =>
    request<Price | null>(`/prices?type=${type}`),

  fetchHistory: (type: BillType): Promise<PriceHistory[]> =>
    request<PriceHistory[]>(`/prices/history?type=${type}`),

  upsert: (payload: UpsertPricePayload): Promise<Price> =>
    request<Price>("/prices", { method: "POST", body: JSON.stringify(payload) }),

  updateHistory: (id: string, payload: UpdateHistoryPayload): Promise<PriceHistory> =>
    request<PriceHistory>(`/prices/history/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
};
