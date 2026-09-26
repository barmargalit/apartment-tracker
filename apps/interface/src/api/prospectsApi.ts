import { Prospect, SafeSpace } from "@apartment-tracker/types";

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

export interface CreateProspectPayload {
  street: string;
  city: string;
  square_meters: number;
  balcony_square_meters?: number | null;
  rooms: number;
  parking: boolean;
  safe_space: SafeSpace;
  contractor?: string | null;
  comment?: string | null;
  price?: number | null;
  realtor?: boolean;
  realtor_fee?: number | null;
  floor_plan_url?: string | null;
  video_url?: string | null;
  floor?: number | null;
  property_tax?: number | null;
  building_fees?: number | null;
}

export interface UpdateProspectPayload {
  street?: string;
  city?: string;
  square_meters?: number;
  balcony_square_meters?: number | null;
  rooms?: number;
  parking?: boolean;
  safe_space?: SafeSpace;
  contractor?: string | null;
  comment?: string | null;
  price?: number | null;
  realtor?: boolean;
  realtor_fee?: number | null;
  floor_plan_url?: string | null;
  video_url?: string | null;
  floor?: number | null;
  property_tax?: number | null;
  building_fees?: number | null;
}

export const prospectsApi = {
  fetchAll: (): Promise<Prospect[]> =>
    request<Prospect[]>("/prospects"),

  create: (payload: CreateProspectPayload): Promise<Prospect> =>
    request<Prospect>("/prospects", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: UpdateProspectPayload): Promise<Prospect> =>
    request<Prospect>(`/prospects/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  delete: (id: string): Promise<void> =>
    request<void>(`/prospects/${id}`, { method: "DELETE" }),

  openFile: (path: string): Promise<void> =>
    request<void>("/prospects/open-file", { method: "POST", body: JSON.stringify({ path }) }),
};
