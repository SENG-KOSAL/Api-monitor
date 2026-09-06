import {
  Monitor,
  MonitorCreate,
  MonitorUpdate,
  CheckResult,
  MonitorUptime,
  Incident,
  User,
  UserRole,
  PlatformOverview,
  RegisterData,
  LoginData,
  AuthToken,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "pulse_auth_token";

// ---------------------------------------------------------------------------
// Token storage — a thin wrapper so every place that needs the token (the
// fetch helper below, AuthContext, etc.) agrees on where it lives.
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

// Read the `exp` claim out of a JWT without verifying its signature — we
// only use this client-side to know *when* to proactively log the person
// out; the backend is what actually enforces the token is valid.
export function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(normalized));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

// Fired whenever a request comes back 401, so AuthContext can react (clear
// user state, send the person to /login) without fetchAPI needing to know
// about React or routing.
const UNAUTHORIZED_EVENT = "pulse:unauthorized";

function notifyUnauthorized() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

export function onUnauthorized(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(UNAUTHORIZED_EVENT, callback);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, callback);
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    clearToken();
    notifyUnauthorized();
    const error = await response.json().catch(() => ({ detail: "Authentication required" }));
    throw new Error(error.detail || "Authentication required");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP error ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const authAPI = {
  register: (data: RegisterData) =>
    fetchAPI<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // The backend uses FastAPI's standard OAuth2 password form, which expects
  // application/x-www-form-urlencoded fields named "username" and
  // "password" — not JSON. "username" is set to the user's email.
  login: async (data: LoginData): Promise<AuthToken> => {
    const body = new URLSearchParams();
    body.set("username", data.email);
    body.set("password", data.password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(error.detail || "Login failed");
    }

    return response.json();
  },

  me: () => fetchAPI<User>("/auth/me"),
};

export const monitorsAPI = {
  getAll: (skip = 0, limit = 100) =>
    fetchAPI<Monitor[]>(`/monitors/?skip=${skip}&limit=${limit}`),

  getById: (id: number) =>
    fetchAPI<Monitor>(`/monitors/${id}`),

  create: (data: MonitorCreate) =>
    fetchAPI<Monitor>("/monitors/", {
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

  getUptime: (id: number) =>
    fetchAPI<MonitorUptime>(`/monitors/${id}/uptime`),

  getActiveIncidents: (id: number) =>
    fetchAPI<Incident[]>(`/monitors/${id}/incidents/active`),

  getIncidents: (id: number, skip = 0, limit = 50) =>
    fetchAPI<Incident[]>(`/monitors/${id}/incidents?skip=${skip}&limit=${limit}`),
};

// Admin-only endpoints — the backend 403s every one of these unless the
// caller's account has role "admin" (see app/dependencies.py::require_admin).
export const adminAPI = {
  getOverview: () => fetchAPI<PlatformOverview>("/api/admin/overview"),

  getUsers: (skip = 0, limit = 100) =>
    fetchAPI<User[]>(`/api/admin/users?skip=${skip}&limit=${limit}`),

  getUser: (id: number) => fetchAPI<User>(`/api/admin/users/${id}`),

  updateUserStatus: (id: number, is_active: boolean) =>
    fetchAPI<User>(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active }),
    }),

  updateUserRole: (id: number, role: UserRole) =>
    fetchAPI<User>(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
};
