"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "healthy" | "error" | "unknown";
  isActive: boolean;
}

export default function StatusBadge({ status, isActive }: StatusBadgeProps) {
  if (!isActive) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-gray-500" />
        </span>
        Paused
      </Badge>
    );
  }

  const statusConfig = {
    healthy: {
      className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
      dotClassName: "bg-green-500",
      pulseClassName: "bg-green-400",
      label: "Healthy",
    },
    error: {
      className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
      dotClassName: "bg-red-500",
      pulseClassName: "bg-red-400",
      label: "Error",
    },
    unknown: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
      dotClassName: "bg-yellow-500",
      pulseClassName: "bg-yellow-400",
      label: "Unknown",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn("gap-1.5", config.className)}>
      <span className="relative flex h-2 w-2">
        {status === "healthy" && (
          <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse-ring", config.pulseClassName)} />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", config.dotClassName)} />
      </span>
      {config.label}
    </Badge>
  );
}
