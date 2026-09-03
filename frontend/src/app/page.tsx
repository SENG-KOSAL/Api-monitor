"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMonitors, useMonitorLastCheck } from "@/hooks/use-monitors";
import MonitorCard from "@/components/MonitorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Loader2, AlertCircle, Activity } from "lucide-react";
import { Monitor } from "@/types";

function MonitorCardWithCheck({ monitor, index }: { monitor: Monitor; index: number }) {
  const { data: lastCheck } = useMonitorLastCheck(monitor.id);

  return (
    <MonitorCard
      monitor={monitor}
      lastCheck={lastCheck}
      index={index}
    />
  );
}

export default function DashboardPage() {
  const { data: monitors, isLoading, error } = useMonitors();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading monitors...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground">Monitors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {monitors?.length || 0} monitor{(monitors?.length || 0) !== 1 ? "s" : ""} configured
        </p>
      </motion.div>

      {!monitors || monitors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No monitors configured yet.</p>
              <Button asChild>
                <Link href="/monitors/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first monitor
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monitors.map((monitor, index) => (
            <MonitorCardWithCheck key={monitor.id} monitor={monitor} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
