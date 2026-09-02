"use client";

import { MonitorUptime } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface UptimeStatsProps {
  uptime: MonitorUptime | undefined;
  isLoading: boolean;
}

export default function UptimeStats({ uptime, isLoading }: UptimeStatsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uptime Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading uptime stats...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!uptime) {
    return null;
  }

  const periods = [
    { key: "day" as const, label: "Last 24 Hours", stat: uptime.day },
    { key: "week" as const, label: "Last 7 Days", stat: uptime.week },
    { key: "month" as const, label: "Last 30 Days", stat: uptime.month },
  ];

  const getUptimeColor = (percentage: number | null) => {
    if (percentage === null) return "text-muted-foreground";
    if (percentage >= 99) return "text-green-600";
    if (percentage >= 95) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uptime Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {periods.map(({ key, label, stat }) => (
            <div
              key={key}
              className="flex flex-col gap-1 p-4 rounded-lg border bg-card"
            >
              <p className="text-sm text-muted-foreground">{label}</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span
                  className={cn(
                    "text-2xl font-bold",
                    getUptimeColor(stat.uptime_percentage)
                  )}
                >
                  {stat.uptime_percentage !== null
                    ? `${stat.uptime_percentage.toFixed(1)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{stat.successful_checks}</span>
                {" / "}
                <span>{stat.total_checks} checks</span>
                {stat.failed_checks > 0 && (
                  <span className="text-red-500 ml-1">
                    ({stat.failed_checks} failed)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
