import { Server, Database, Workflow, AppWindow, Globe, type LucideIcon } from "lucide-react";

export type MonitorTypeId = "api" | "server" | "database" | "background-job" | "application";

export interface MonitorTypeMeta {
  id: MonitorTypeId;
  label: string;
  description: string;
  icon: LucideIcon;
  status: "available" | "soon";
  /** Longer copy shown on the "coming soon" detail page. */
  detail: string;
}

export const monitorTypes: MonitorTypeMeta[] = [
  {
    id: "api",
    label: "API",
    description: "Check an HTTP endpoint's status and response time.",
    icon: Globe,
    status: "available",
    detail:
      "Sends scheduled GET requests to a URL and records the HTTP status, response time, and any error — the monitor type Pulse supports today.",
  },
  {
    id: "server",
    label: "Server",
    description: "Track CPU, memory, and disk on a host.",
    icon: Server,
    status: "soon",
    detail:
      "Install a lightweight agent on a host to track CPU, memory, disk, and load over time, with alerts when a machine runs hot.",
  },
  {
    id: "database",
    label: "Database",
    description: "Watch query latency and connection health.",
    icon: Database,
    status: "soon",
    detail:
      "Connect a database to watch query latency, connection pool usage, and replication lag, so slow queries surface before users notice.",
  },
  {
    id: "background-job",
    label: "Background job",
    description: "Confirm scheduled jobs and workers run on time.",
    icon: Workflow,
    status: "soon",
    detail:
      "Have a cron job or worker check in on a schedule, and get flagged the moment a run goes missing or fails silently.",
  },
  {
    id: "application",
    label: "Application",
    description: "Monitor uptime and errors for a deployed app.",
    icon: AppWindow,
    status: "soon",
    detail:
      "Track uptime, error rates, and release health for a full deployed application, beyond a single endpoint.",
  },
];

export function getMonitorType(id: string): MonitorTypeMeta | undefined {
  return monitorTypes.find((t) => t.id === id);
}
