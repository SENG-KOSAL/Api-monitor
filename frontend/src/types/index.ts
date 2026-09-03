export interface Monitor {
  id: number;
  name: string;
  url: string;
  interval_seconds: number;
  auth_type: "none" | "bearer";
  auth_token?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonitorCreate {
  name: string;
  url: string;
  interval_seconds?: number;
  auth_type?: "none" | "bearer";
  auth_token?: string | null;
  is_active?: boolean;
}

export interface MonitorUpdate {
  name?: string;
  url?: string;
  interval_seconds?: number;
  auth_type?: "none" | "bearer";
  auth_token?: string | null;
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
