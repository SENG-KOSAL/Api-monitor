"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CheckResult, Incident } from "@/types";

interface UptimeTimelineProps {
  results: CheckResult[];
  incidents: Incident[];
}

export default function UptimeTimeline({ results, incidents }: UptimeTimelineProps) {
  const chartData = useMemo(() => {
    const sorted = [...results].sort(
      (a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime()
    );

    return sorted.map((r) => {
      const isUp = !r.error && r.status_code !== null && r.status_code >= 200 && r.status_code < 400;
      return {
        time: new Date(r.checked_at).toLocaleString("en-US", {
          timeZone: "Asia/Phnom_Penh",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        value: isUp ? 1 : 0,
        isUp,
        fullTime: r.checked_at,
        responseTime: r.response_time,
      };
    });
  }, [results]);

  const totalChecks = chartData.length;
  const upChecks = chartData.filter((d) => d.isUp).length;
  const uptimePct = totalChecks > 0 ? ((upChecks / totalChecks) * 100).toFixed(1) : "0";

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className={`text-sm font-medium ${data.isUp ? "text-green-600" : "text-red-500"}`}>
          {data.isUp ? "Up" : "Down"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.responseTime.toFixed(0)}ms
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(data.fullTime).toLocaleString("en-US", {
            timeZone: "Asia/Phnom_Penh",
            dateStyle: "short",
            timeStyle: "medium",
          })} ICT
        </p>
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[120px] text-muted-foreground text-sm">
        No data yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{uptimePct}%</span>
          <span className="text-sm text-muted-foreground">uptime</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-green-500" />
            Up ({upChecks})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
            Down ({totalChecks - upChecks})
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={chartData} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis domain={[0, 1]} hide />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={12}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isUp ? "oklch(0.6 0.118 184.714)" : "oklch(0.577 0.245 27.325)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
