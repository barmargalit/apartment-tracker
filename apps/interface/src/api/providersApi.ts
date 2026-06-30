import { BillType, Provider } from "@apartment-tracker/types";

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

export const providersApi = {
  fetchAll: (type?: BillType): Promise<Provider[]> =>
    request<Provider[]>(type ? `/providers?type=${type}` : "/providers"),

  create: (payload: { name: string; type: BillType }): Promise<Provider> =>
    request<Provider>("/providers", { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: { name?: string; type?: BillType }): Promise<Provider> =>
    request<Provider>(`/providers/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  delete: (id: string): Promise<void> =>
    request<void>(`/providers/${id}`, { method: "DELETE" }),
};
