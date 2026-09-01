"use client";

import { CheckResult } from "@/types";

interface CheckHistoryProps {
  results: CheckResult[];
  isLoading?: boolean;
}

export default function CheckHistory({ results, isLoading }: CheckHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (result: CheckResult) => {
    if (result.error) return "text-red-600";
    if (result.status_code && result.status_code >= 200 && result.status_code < 400) {
      return "text-green-600";
    }
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading check history...</div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No check results yet.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Response Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((result) => (
            <tr key={result.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(result.checked_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`font-medium ${getStatusColor(result)}`}>
                  {result.error ? "Error" : `${result.status_code} ${result.reason_phrase || ""}`}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {result.response_time.toFixed(0)}ms
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {result.error || ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
