import type { MortgageTrack, MortgageTrackType, MortgageTrackData } from "@apartment-tracker/types";

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

export const mortgageTracksApi = {
  fetchByPlan: (planId: string): Promise<MortgageTrack[]> =>
    request<MortgageTrack[]>(`/mortgage-tracks?plan_id=${planId}`),

  create: (payload: {
    plan_id: string;
    type: MortgageTrackType;
    amount: number;
    years: number;
    months: number;
    data: MortgageTrackData;
  }): Promise<MortgageTrack> =>
    request<MortgageTrack>("/mortgage-tracks", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: {
    type?: MortgageTrackType;
    amount?: number;
    years?: number;
    months?: number;
    data?: MortgageTrackData;
  }): Promise<MortgageTrack> =>
    request<MortgageTrack>(`/mortgage-tracks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  delete: (id: string): Promise<void> =>
    request<void>(`/mortgage-tracks/${id}`, { method: "DELETE" }),
};
