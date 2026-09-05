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
      <Badge
        variant="outline"
        className="gap-1.5 border-white/10 bg-white/[0.03] text-muted-foreground"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-muted-foreground/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-muted-foreground" />
        </span>
        Paused
      </Badge>
    );
  }

  const statusConfig = {
    healthy: {
      className: "border-[var(--lime)]/25 bg-[var(--lime)]/10 text-[var(--lime)] hover:bg-[var(--lime)]/10",
      dotClassName: "bg-[var(--lime)]",
      pulseClassName: "bg-[var(--lime)]",
      label: "Healthy",
    },
    error: {
      className: "border-[var(--danger-signal)]/30 bg-[var(--danger-signal)]/10 text-[var(--danger-signal)] hover:bg-[var(--danger-signal)]/10",
      dotClassName: "bg-[var(--danger-signal)]",
      pulseClassName: "bg-[var(--danger-signal)]",
      label: "Error",
    },
    unknown: {
      className: "border-[var(--amber-signal)]/30 bg-[var(--amber-signal)]/10 text-[var(--amber-signal)] hover:bg-[var(--amber-signal)]/10",
      dotClassName: "bg-[var(--amber-signal)]",
      pulseClassName: "bg-[var(--amber-signal)]",
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
        <span className={cn("relative inline-flex h-2 w-2 rounded-full status-dot-glow", config.dotClassName)} />
      </span>
      {config.label}
    </Badge>
  );
}
