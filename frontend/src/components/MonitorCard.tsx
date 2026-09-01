"use client";

import Link from "next/link";
import { Monitor } from "@/types";
import StatusBadge from "./StatusBadge";
import DeleteButton from "./DeleteButton";

interface MonitorCardProps {
  monitor: Monitor;
  lastCheck?: {
    status_code: number | null;
    response_time: number;
    error: string | null;
  } | null;
  onRefresh?: () => void;
}

export default function MonitorCard({ monitor, lastCheck, onRefresh }: MonitorCardProps) {
  const getStatus = (): "healthy" | "error" | "unknown" => {
    if (!lastCheck) return "unknown";
    if (lastCheck.error) return "error";
    if (lastCheck.status_code && lastCheck.status_code >= 200 && lastCheck.status_code < 400) {
      return "healthy";
    }
    return "error";
  };

  const formatInterval = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/monitors/${monitor.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 truncate block"
          >
            {monitor.name}
          </Link>
          <p className="text-sm text-gray-500 truncate mt-1" title={monitor.url}>
            {monitor.url}
          </p>
        </div>
        <StatusBadge status={getStatus()} isActive={monitor.is_active} />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>
          Every {formatInterval(monitor.interval_seconds)}
        </span>
        {lastCheck && (
          <span>
            {lastCheck.response_time.toFixed(0)}ms
            {lastCheck.status_code && ` • ${lastCheck.status_code}`}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Link
          href={`/monitors/${monitor.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View Details
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/monitors/${monitor.id}/edit`}
            className="text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Edit
          </Link>
          <DeleteButton monitor={monitor} onDeleted={onRefresh} />
        </div>
      </div>
    </div>
  );
}
