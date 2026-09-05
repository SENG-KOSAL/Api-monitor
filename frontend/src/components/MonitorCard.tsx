"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Monitor } from "@/types";
import StatusBadge from "./StatusBadge";
import DeleteButton from "./DeleteButton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, Pencil, Key } from "lucide-react";

interface MonitorCardProps {
  monitor: Monitor;
  lastCheck?: {
    status_code: number | null;
    response_time: number;
    error: string | null;
  } | null;
  onRefresh?: () => void;
  index?: number;
}

export default function MonitorCard({ monitor, lastCheck, onRefresh, index = 0 }: MonitorCardProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="group relative overflow-hidden transition-all hover:border-white/[0.14] hover:-translate-y-0.5">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <Link
                href={`/monitors/${monitor.id}`}
                className="font-display text-lg font-semibold text-foreground hover:text-[var(--lime)] truncate block transition-colors"
              >
                {monitor.name}
              </Link>
              <p className="text-xs text-muted-foreground truncate mt-1 flex items-center gap-1" title={monitor.url}>
                <ExternalLink className="h-3 w-3 shrink-0" />
                {monitor.url}
              </p>
            </div>
            <StatusBadge status={getStatus()} isActive={monitor.is_active} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Every {formatInterval(monitor.interval_seconds)}
              </span>
              {monitor.auth_type === "bearer" && (
                <span
                  className="inline-flex items-center gap-1 rounded bg-secondary/80 px-1.5 py-0.5 text-xs font-medium text-secondary-foreground"
                  title="Bearer Token Authentication"
                >
                  <Key className="h-3 w-3" />
                  Bearer
                </span>
              )}
              {monitor.auth_type === "basic" && (
                <span
                  className="inline-flex items-center gap-1 rounded bg-secondary/80 px-1.5 py-0.5 text-xs font-medium text-secondary-foreground"
                  title="Basic Authentication"
                >
                  <Key className="h-3 w-3" />
                  Basic
                </span>
              )}
            </div>
            {lastCheck && (
              <span className="font-medium text-[var(--lime)]">
                {lastCheck.response_time.toFixed(0)}ms
                {lastCheck.status_code && <span className="text-muted-foreground"> • {lastCheck.status_code}</span>}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/monitors/${monitor.id}`} className="gap-1.5">
                View Details
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/monitors/${monitor.id}/edit`} className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
              <DeleteButton monitor={monitor} onDeleted={onRefresh} />
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
