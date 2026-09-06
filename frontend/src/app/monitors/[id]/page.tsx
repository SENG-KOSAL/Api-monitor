"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useMonitor, useMonitorResults, useMonitorUptime, useMonitorActiveIncidents, useMonitorIncidents, useCheckHealth } from "@/hooks/use-monitors";
import StatusBadge from "@/components/StatusBadge";
import CheckHistory from "@/components/CheckHistory";
import UptimeStats from "@/components/UptimeStats";
import IncidentHistory from "@/components/IncidentHistory";
import ResponseTimeChart from "@/components/ResponseTimeChart";
import StatusDistributionChart from "@/components/StatusDistributionChart";
import UptimeTimeline from "@/components/UptimeTimeline";
import DeleteButton from "@/components/DeleteButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Pencil, Activity, Clock, Calendar, Zap, AlertCircle, Key, ShieldAlert } from "lucide-react";

export default function MonitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const monitorId = parseInt(id, 10);
  const router = useRouter();

  const { data: monitor, isLoading: monitorLoading, error: monitorError } = useMonitor(monitorId);
  const { data: results = [], isLoading: resultsLoading } = useMonitorResults(monitorId);
  const { data: uptime, isLoading: uptimeLoading } = useMonitorUptime(monitorId);
  const { data: activeIncidents = [], isLoading: activeIncidentsLoading } = useMonitorActiveIncidents(monitorId);
  const { data: incidents = [], isLoading: incidentsLoading } = useMonitorIncidents(monitorId);
  const checkHealth = useCheckHealth();

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

  const handleCheckNow = async () => {
    await checkHealth.mutateAsync(monitorId);
  };

  if (monitorLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading monitor...
        </div>
      </div>
    );
  }

  if (monitorError || !monitor) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{monitorError?.message || "Monitor not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Monitors
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl">{monitor.name}</CardTitle>
                <p className="text-muted-foreground mt-1 break-all">{monitor.url}</p>
              </div>
              <StatusBadge status={getStatus()} isActive={monitor.is_active} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 py-4 border-t border-b">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Interval</p>
                  <p className="font-medium">{formatInterval(monitor.interval_seconds)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{monitor.is_active ? "Active" : "Paused"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Key className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Auth</p>
                  <p className="font-medium">
                    {monitor.auth_type === "bearer"
                      ? "Bearer Token"
                      : monitor.auth_type === "basic"
                      ? "Basic Auth"
                      : "None (Public)"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(monitor.created_at).toLocaleString("en-US", {
                      timeZone: "Asia/Phnom_Penh",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    <span className="text-xs text-muted-foreground">ICT</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Check</p>
                  <p className="font-medium">
                    {results.length > 0
                      ? `${results[0].response_time.toFixed(0)}ms`
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleCheckNow}
                disabled={checkHealth.isPending}
                className="gap-1.5"
              >
                {checkHealth.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {checkHealth.isPending ? "Checking..." : "Check Now"}
              </Button>
              <Button variant="outline" asChild className="gap-1.5">
                <a href={`/monitors/${monitor.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </a>
              </Button>
              <DeleteButton monitor={monitor} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {activeIncidents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-6"
        >
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-800">
                  Active Incident{activeIncidents.length > 1 ? "s" : ""}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeIncidents.map((incident) => (
                <div key={incident.id} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-red-800">{incident.reason}</p>
                    <p className="text-sm text-red-600">
                      Since {new Date(incident.started_at).toLocaleString("en-US", {
                        timeZone: "Asia/Phnom_Penh",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })} ICT
                    </p>
                  </div>
                  <Badge variant="destructive" className="shrink-0 gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-pulse-ring" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                    Ongoing
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6"
      >
        <UptimeStats uptime={uptime} isLoading={uptimeLoading} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponseTimeChart results={results} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.14 }}
        className="mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusDistributionChart results={results} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Uptime Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <UptimeTimeline results={results} incidents={incidents} />
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <IncidentHistory incidents={incidents} isLoading={incidentsLoading} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Check History</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckHistory results={results} isLoading={resultsLoading} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
