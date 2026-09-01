"use client";

import { useState, useEffect, useCallback } from "react";
import { monitorsAPI } from "@/lib/api";
import { Monitor, CheckResult } from "@/types";
import MonitorCard from "@/components/MonitorCard";

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [lastChecks, setLastChecks] = useState<
    Record<number, CheckResult | null>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await monitorsAPI.getAll();
      setMonitors(data);
      setError(null);

      const checks: Record<number, CheckResult | null> = {};
      await Promise.all(
        data.map(async (monitor) => {
          try {
            const results = await monitorsAPI.getResults(monitor.id, 0, 1);
            checks[monitor.id] = results.length > 0 ? results[0] : null;
          } catch {
            checks[monitor.id] = null;
          }
        })
      );
      setLastChecks(checks);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load monitors"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-gray-500">Loading monitors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Monitors</h1>
        <p className="mt-1 text-sm text-gray-500">
          {monitors.length} monitor{monitors.length !== 1 ? "s" : ""} configured
        </p>
      </div>

      {monitors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 mb-4">No monitors configured yet.</p>
          <a
            href="/monitors/new"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            Add your first monitor
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monitors.map((monitor) => (
            <MonitorCard
              key={monitor.id}
              monitor={monitor}
              lastCheck={lastChecks[monitor.id] ?? null}
              onRefresh={fetchData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
