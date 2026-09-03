"use client";

import { useEffect, useState } from "react";
import { CheckResult } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface CheckHistoryProps {
  results: CheckResult[];
  isLoading?: boolean;
}

const PAGE_SIZE = 5;

export default function CheckHistory({ results, isLoading }: CheckHistoryProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

  // Keep the current page in range if the results list shrinks/changes.
  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedResults = results.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const formatDate = (dateString: string) => {
    const formatted = new Date(dateString).toLocaleString("en-US", {
      timeZone: "Asia/Phnom_Penh",
      dateStyle: "short",
      timeStyle: "medium",
    });
    return `${formatted} ICT`;
  };

  const getStatusBadge = (result: CheckResult) => {
    if (result.error) {
      return (
        <Badge variant="destructive" className="gap-1">
          Error
        </Badge>
      );
    }
    if (result.status_code && result.status_code >= 200 && result.status_code < 400) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 gap-1">
          {result.status_code} {result.reason_phrase || ""}
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1">
        {result.status_code || "N/A"} {result.reason_phrase || ""}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading check history...
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No check results yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Response Time</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedResults.map((result) => (
            <TableRow key={result.id}>
              <TableCell className="font-mono text-xs">
                {formatDate(result.checked_at)}
              </TableCell>
              <TableCell>{getStatusBadge(result)}</TableCell>
              <TableCell className="font-medium">
                {result.response_time.toFixed(0)}ms
              </TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                {result.error || ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
