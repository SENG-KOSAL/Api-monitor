"use client";

import { useEffect, useState } from "react";
import { Incident } from "@/types";
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

interface IncidentHistoryProps {
  incidents: Incident[];
  isLoading?: boolean;
}

const PAGE_SIZE = 5;

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "Ongoing";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function IncidentHistory({ incidents, isLoading }: IncidentHistoryProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(incidents.length / PAGE_SIZE));

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedIncidents = incidents.slice(
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading incidents...
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No incidents recorded.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Resolved</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedIncidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell>
                {incident.status === "open" ? (
                  <Badge variant="destructive" className="gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-pulse-ring" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                    Open
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 gap-1">
                    Resolved
                  </Badge>
                )}
              </TableCell>
              <TableCell className="font-medium max-w-xs truncate">
                {incident.reason}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {formatDate(incident.started_at)}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {incident.resolved_at ? formatDate(incident.resolved_at) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {formatDuration(incident.duration_seconds)}
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
