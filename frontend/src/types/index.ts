export interface Monitor {
  id: number;
  name: string;
  url: string;
  interval_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonitorCreate {
  name: string;
  url: string;
  interval_seconds?: number;
  is_active?: boolean;
}

export interface MonitorUpdate {
  name?: string;
  url?: string;
  interval_seconds?: number;
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
