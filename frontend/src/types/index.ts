export interface Monitor {
  id: number;
  name: string;
  url: string;
  interval_seconds: number;
  auth_type: "none" | "bearer" | "basic";
  auth_token?: string | null;
  auth_username?: string | null;
  auth_password?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonitorCreate {
  name: string;
  url: string;
  interval_seconds?: number;
  auth_type?: "none" | "bearer" | "basic";
  auth_token?: string | null;
  auth_username?: string | null;
  auth_password?: string | null;
  is_active?: boolean;
}

export interface MonitorUpdate {
  name?: string;
  url?: string;
  interval_seconds?: number;
  auth_type?: "none" | "bearer" | "basic";
  auth_token?: string | null;
  auth_username?: string | null;
  auth_password?: string | null;
  is_active?: boolean;
}

export interface CheckResult {
  id: number;
  monitor_id: number;
  status_code: number | null;
  reason_phrase: string | null;
  response_time: number;
  error: string | null;
  headers: Record<string, unknown> | null;
  body: string | null;
  checked_at: string;
}

export interface MonitorWithStatus extends Monitor {
  lastCheck?: CheckResult | null;
  status?: "healthy" | "error" | "unknown";
}

export interface UptimeStats {
  period: string; // "24h" | "7d" | "30d"
  uptime_percentage: number | null;
  total_checks: number;
  successful_checks: number;
  failed_checks: number;
}

export interface MonitorUptime {
  day: UptimeStats;
  week: UptimeStats;
  month: UptimeStats;
}

export interface Incident {
  id: number;
  monitor_id: number;
  status: "open" | "resolved";
  started_at: string;
  resolved_at: string | null;
  reason: string;
  duration_seconds: number | null;
  first_check_result_id: number | null;
  last_check_result_id: number | null;
  created_at: string;
}

export type UserRole = "admin" | "developer";

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  role: UserRole;
  created_at: string;
}

export interface PlatformOverview {
  total_users: number;
  active_users: number;
  disabled_users: number;
  admin_count: number;
  developer_count: number;
  total_monitors: number;
  active_monitors: number;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}
