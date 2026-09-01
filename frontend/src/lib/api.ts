import { Monitor, MonitorCreate, MonitorUpdate, CheckResult } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP error ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const monitorsAPI = {
  getAll: (skip = 0, limit = 100) =>
    fetchAPI<Monitor[]>(`/monitors?skip=${skip}&limit=${limit}`),

  getById: (id: number) =>
    fetchAPI<Monitor>(`/monitors/${id}`),

  create: (data: MonitorCreate) =>
    fetchAPI<Monitor>("/monitors", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: MonitorUpdate) =>
    fetchAPI<Monitor>(`/monitors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchAPI<void>(`/monitors/${id}`, {
      method: "DELETE",
    }),

  checkHealth: (id: number) =>
    fetchAPI<CheckResult>(`/monitors/${id}/check`, {
      method: "POST",
    }),

  getResults: (id: number, skip = 0, limit = 100) =>
    fetchAPI<CheckResult[]>(`/monitors/${id}/results?skip=${skip}&limit=${limit}`),
};
