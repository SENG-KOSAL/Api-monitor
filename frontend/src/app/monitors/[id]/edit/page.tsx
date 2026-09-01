"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useMonitor } from "@/hooks/use-monitors";
import MonitorForm from "@/components/MonitorForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";

export default function EditMonitorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const monitorId = parseInt(id, 10);
  const router = useRouter();

  const { data: monitor, isLoading, error } = useMonitor(monitorId);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading monitor...
        </div>
      </div>
    );
  }

  if (error || !monitor) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error?.message || "Monitor not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          onClick={() => router.push(`/monitors/${monitorId}`)}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Monitor
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Monitor</CardTitle>
          </CardHeader>
          <CardContent>
            <MonitorForm monitor={monitor} mode="edit" />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
