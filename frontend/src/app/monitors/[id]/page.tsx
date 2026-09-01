"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { monitorsAPI } from "@/lib/api";
import { Monitor, CheckResult } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import CheckHistory from "@/components/CheckHistory";
import DeleteButton from "@/components/DeleteButton";

export default function MonitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const monitorId = parseInt(id, 10);
  const router = useRouter();

  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [monitorData, resultsData] = await Promise.all([
        monitorsAPI.getById(monitorId),
        monitorsAPI.getResults(monitorId),
      ]);
      setMonitor(monitorData);
      setResults(resultsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load monitor");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [monitorId]);

  const handleCheckNow = async () => {
    setIsChecking(true);
    try {
      await monitorsAPI.checkHealth(monitorId);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Health check failed");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [monitorId]);

  const getStatus = (): "healthy" | "error" | "unknown" => {
    if (!monitor?.is_active) return "unknown";
    if (results.length === 0) return "unknown";
    const latest = results[0];
    if (latest.error) return "error";
    if (latest.status_code && latest.status_code >= 200 && latest.status_code < 400) {
      return "healthy";
    }
    return "error";
  };

  const formatInterval = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    return `${Math.floor(seconds / 3600)} hours`;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-gray-500">Loading monitor...</div>
      </div>
    );
  }

  if (error || !monitor) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "Monitor not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push("/")}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          &larr; Back to Monitors
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{monitor.name}</h1>
            <p className="text-gray-500 mt-1 break-all">{monitor.url}</p>
          </div>
          <StatusBadge status={getStatus()} isActive={monitor.is_active} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 py-4 border-t border-b border-gray-100">
          <div>
            <p className="text-sm text-gray-500">Interval</p>
            <p className="font-medium">{formatInterval(monitor.interval_seconds)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{monitor.is_active ? "Active" : "Paused"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">
              {new Date(monitor.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Check</p>
            <p className="font-medium">
              {results.length > 0
                ? `${results[0].response_time.toFixed(0)}ms`
                : "Never"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleCheckNow}
            disabled={isChecking}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isChecking ? "Checking..." : "Check Now"}
          </button>
          <a
            href={`/monitors/${monitor.id}/edit`}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300"
          >
            Edit
          </a>
          <DeleteButton monitor={monitor} />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Check History</h2>
        <CheckHistory results={results} />
      </div>
    </div>
  );
}
