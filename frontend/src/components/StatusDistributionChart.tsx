"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CheckResult } from "@/types";

interface StatusDistributionChartProps {
  results: CheckResult[];
}

const COLORS = {
  healthy: "oklch(0.6 0.118 184.714)",  // green (chart-2)
  clientError: "oklch(0.828 0.189 84.429)", // yellow (chart-4)
  serverError: "oklch(0.577 0.245 27.325)", // red (destructive)
  error: "oklch(0.556 0 0)",                // gray (muted-foreground)
};

export default function StatusDistributionChart({ results }: StatusDistributionChartProps) {
  const { chartData, total } = useMemo(() => {
    let healthy = 0;
    let clientError = 0;
    let serverError = 0;
    let error = 0;

    results.forEach((r) => {
      if (r.error) {
        error++;
      } else if (r.status_code && r.status_code >= 200 && r.status_code < 400) {
        healthy++;
      } else if (r.status_code && r.status_code >= 400 && r.status_code < 500) {
        clientError++;
      } else if (r.status_code && r.status_code >= 500) {
        serverError++;
      } else {
        error++;
      }
    });

    const data = [
      { name: "2xx Healthy", value: healthy, color: COLORS.healthy },
      { name: "4xx Client Error", value: clientError, color: COLORS.clientError },
      { name: "5xx Server Error", value: serverError, color: COLORS.serverError },
      { name: "Errors", value: error, color: COLORS.error },
    ].filter((d) => d.value > 0);

    return { chartData: data, total: results.length };
  }, [results]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    const pct = total > 0 ? ((data.value / total) * 100).toFixed(1) : "0";
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="text-sm font-medium text-foreground">{data.name}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {data.value} checks ({pct}%)
        </p>
      </div>
    );
  };

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        No data yet
      </div>
    );
  }

  const healthyCount = chartData.find((d) => d.name === "2xx Healthy")?.value || 0;
  const healthyPct = total > 0 ? ((healthyCount / total) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{healthyPct}%</span>
        <span className="text-sm text-muted-foreground">healthy checks</span>
      </div>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="font-medium ml-auto">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
