"use client";

import { useAdminOverview } from "@/hooks/use-admin";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Users, ShieldCheck, UserX, Activity } from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-3xl font-display font-semibold text-foreground">{value}</p>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const { data, isLoading, error } = useAdminOverview();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--lime)]" />
        Loading overview...
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error?.message ?? "Could not load platform overview"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-display font-semibold text-foreground mb-1.5">
        Platform overview
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        A top-level look at everyone using Pulse.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total users" value={String(data.total_users)} />
        <StatCard icon={ShieldCheck} label="Admins" value={String(data.admin_count)} />
        <StatCard icon={UserX} label="Disabled users" value={String(data.disabled_users)} />
        <StatCard
          icon={Activity}
          label="Active monitors"
          value={`${data.active_monitors} / ${data.total_monitors}`}
        />
      </div>
    </div>
  );
}
