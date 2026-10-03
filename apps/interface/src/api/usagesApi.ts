import { Usage, UsageBounds, BillType } from "@xpensive/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface CreateUsagePayload {
  datetime: string;
  type: BillType;
  usage: number;
}

export interface UsageFilterParams {
  type: BillType;
  from?: string;
  to?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export const usagesApi = {
  fetchByType: ({ type, from, to }: UsageFilterParams): Promise<Usage[]> => {
    const params = new URLSearchParams({ type });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return request<Usage[]>(`/usages?${params.toString()}`);
  },

  fetchBounds: (type: BillType): Promise<UsageBounds> =>
    request<UsageBounds>(`/usages/bounds?type=${type}`),

  createMany: (payload: CreateUsagePayload[]): Promise<Usage[]> =>
    request<Usage[]>("/usages", { method: "POST", body: JSON.stringify(payload) }),
};
