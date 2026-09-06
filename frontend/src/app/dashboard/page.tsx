"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMonitors, useMonitorLastCheck } from "@/hooks/use-monitors";
import MonitorCard from "@/components/MonitorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Loader2, AlertCircle, Activity, Radio, PauseCircle, Timer } from "lucide-react";
import { Monitor } from "@/types";

function MonitorCardWithCheck({ monitor, index }: { monitor: Monitor; index: number }) {
  const { data: lastCheck } = useMonitorLastCheck(monitor.id);

  return (
    <MonitorCard
      monitor={monitor}
      lastCheck={lastCheck}
      index={index}
    />
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className={accent ? "h-4 w-4 text-[var(--lime)]" : "h-4 w-4 text-muted-foreground"} />
      </div>
      <p className={`mt-2 text-3xl font-display font-semibold ${accent ? "text-[var(--lime)]" : "text-foreground"}`}>
        {value}
      </p>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: monitors, isLoading, error } = useMonitors();

  const total = monitors?.length ?? 0;
  const active = monitors?.filter((m) => m.is_active).length ?? 0;
  const paused = total - active;
  const avgIntervalSeconds =
    total > 0 ? Math.round(monitors!.reduce((sum, m) => sum + m.interval_seconds, 0) / total) : 0;
  const avgInterval =
    avgIntervalSeconds >= 3600
      ? `${Math.round(avgIntervalSeconds / 3600)}h`
      : avgIntervalSeconds >= 60
      ? `${Math.round(avgIntervalSeconds / 60)}m`
      : `${avgIntervalSeconds}s`;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--lime)]" />
          Loading monitors...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {total} monitor{total !== 1 ? "s" : ""} configured across your APIs.
          </p>
        </div>
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/monitors/new" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add monitor
          </Link>
        </Button>
      </motion.div>

      {total > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Activity} label="Total monitors" value={String(total)} />
          <StatCard icon={Radio} label="Active" value={String(active)} accent />
          <StatCard icon={PauseCircle} label="Paused" value={String(paused)} />
          <StatCard icon={Timer} label="Avg. check interval" value={avgInterval} />
        </div>
      )}

      {!monitors || monitors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="text-center py-14">
            <CardContent className="pt-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--lime)]/10 border border-[var(--lime)]/25">
                <Activity className="h-6 w-6 text-[var(--lime)]" />
              </div>
              <p className="text-foreground font-medium mb-1">No monitors yet</p>
              <p className="text-muted-foreground text-sm mb-5">
                Add an endpoint and Pulse will start checking it on schedule.
              </p>
              <Button asChild>
                <Link href="/monitors/new" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Add your first monitor
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monitors.map((monitor, index) => (
            <MonitorCardWithCheck key={monitor.id} monitor={monitor} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
