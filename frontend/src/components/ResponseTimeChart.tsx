"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { CheckResult } from "@/types";

interface ResponseTimeChartProps {
  results: CheckResult[];
}

export default function ResponseTimeChart({ results }: ResponseTimeChartProps) {
  const chartData = useMemo(() => {
    return [...results]
      .reverse()
      .map((r) => ({
        time: new Date(r.checked_at).toLocaleString("en-US", {
          timeZone: "Asia/Phnom_Penh",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        responseTime: r.response_time,
        isUp: !r.error && r.status_code !== null && r.status_code >= 200 && r.status_code < 400,
        fullTime: r.checked_at,
      }));
  }, [results]);

  const avgResponseTime = useMemo(() => {
    if (chartData.length === 0) return 0;
    const total = chartData.reduce((sum, d) => sum + d.responseTime, 0);
    return Math.round(total / chartData.length);
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="text-sm font-medium text-foreground">
          {data.responseTime.toFixed(0)}ms
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(data.fullTime).toLocaleString("en-US", {
            timeZone: "Asia/Phnom_Penh",
            dateStyle: "short",
            timeStyle: "medium",
          })} ICT
        </p>
        <p className={`text-xs mt-1 ${data.isUp ? "text-[var(--lime)]" : "text-[var(--danger-signal)]"}`}>
          {data.isUp ? "Healthy" : "Failed"}
        </p>
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        No data yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{avgResponseTime}ms</span>
        <span className="text-sm text-muted-foreground">avg response time</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}ms`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avgResponseTime}
            stroke="var(--chart-1)"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="responseTime"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#responseGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--chart-1)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
