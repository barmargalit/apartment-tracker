import { Residence, UtilitySettings } from "@xpensive/types";

export interface CreateResidencePayload {
  city: string;
  street: string;
  current?: number;
  start_date: string;
  end_date?: string | null;
  electric_settings?: UtilitySettings;
  water_settings?: UtilitySettings;
}

export interface UpdateResidencePayload {
  city?: string;
  street?: string;
  current?: number;
  start_date?: string;
  end_date?: string | null;
  electric_settings?: UtilitySettings;
  water_settings?: UtilitySettings;
}

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

export const residencesApi = {
  fetchAll: (): Promise<Residence[]> =>
    request<Residence[]>("/residences"),

  fetchOne: (id: string): Promise<Residence> =>
    request<Residence>(`/residences/${id}`),

  create: (payload: CreateResidencePayload): Promise<Residence> =>
    request<Residence>("/residences", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: UpdateResidencePayload): Promise<Residence> =>
    request<Residence>(`/residences/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  delete: (id: string): Promise<void> =>
    request<void>(`/residences/${id}`, { method: "DELETE" }),
};
