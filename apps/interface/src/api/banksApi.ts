import type { Bank } from "@apartment-tracker/types";

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

export const banksApi = {
  fetchAll: (): Promise<Bank[]> => request<Bank[]>("/banks"),

  create: (name: string): Promise<Bank> =>
    request<Bank>("/banks", { method: "POST", body: JSON.stringify({ name }) }),

  update: (id: string, name: string): Promise<Bank> =>
    request<Bank>(`/banks/${id}`, { method: "PUT", body: JSON.stringify({ name }) }),

  delete: (id: string): Promise<void> =>
    request<void>(`/banks/${id}`, { method: "DELETE" }),
};
