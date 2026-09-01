"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { monitorsAPI } from "@/lib/api";
import { Monitor } from "@/types";
import MonitorForm from "@/components/MonitorForm";

export default function EditMonitorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const monitorId = parseInt(id, 10);
  const router = useRouter();

  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonitor = async () => {
      try {
        const data = await monitorsAPI.getById(monitorId);
        setMonitor(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load monitor");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonitor();
  }, [monitorId]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-gray-500">Loading monitor...</div>
      </div>
    );
  }

  if (error || !monitor) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "Monitor not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/monitors/${monitorId}`)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          &larr; Back to Monitor
        </button>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Monitor</h1>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <MonitorForm monitor={monitor} mode="edit" />
      </div>
    </div>
  );
}
