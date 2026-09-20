import { Resident } from "@apartment-tracker/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface CreateResidentPayload {
  name: string;
  birth_date: string;
}

export interface UpdateResidentPayload {
  name?: string;
  birth_date?: string;
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

export const residentsApi = {
  fetchAll: (): Promise<Resident[]> =>
    request<Resident[]>("/residents"),

  create: (payload: CreateResidentPayload): Promise<Resident> =>
    request<Resident>("/residents", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: UpdateResidentPayload): Promise<Resident> =>
    request<Resident>(`/residents/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  delete: (id: string): Promise<void> =>
    request<void>(`/residents/${id}`, { method: "DELETE" }),
};
