import type { MortgagePlan } from "@xpensive/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const mortgagePlansApi = {
  fetchAll: (): Promise<MortgagePlan[]> => request<MortgagePlan[]>("/mortgage-plans"),

  create: (payload: { total_loan: number; bank_id?: string | null }): Promise<MortgagePlan> =>
    request<MortgagePlan>("/mortgage-plans", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: { total_loan?: number; bank_id?: string | null }): Promise<MortgagePlan> =>
    request<MortgagePlan>(`/mortgage-plans/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  delete: (id: string): Promise<void> =>
    request<void>(`/mortgage-plans/${id}`, { method: "DELETE" }),
};
