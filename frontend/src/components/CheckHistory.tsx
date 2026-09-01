"use client";

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
import { Loader2 } from "lucide-react";

interface CheckHistoryProps {
  results: CheckResult[];
  isLoading?: boolean;
}

export default function CheckHistory({ results, isLoading }: CheckHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
        {results.map((result) => (
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
  );
}
