"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Radio, Timer, History, ShieldCheck, Bell } from "lucide-react";
import MonitorForm from "@/components/MonitorForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMonitorType } from "@/lib/monitor-types";

const points = [
  {
    icon: Radio,
    title: "Checks run on your schedule",
    body: "Pick an interval from 30 seconds to 24 hours. Pulse pings the endpoint and records what comes back.",
  },
  {
    icon: Timer,
    title: "Status and latency, every time",
    body: "Each check logs the HTTP status, response time, and any error — so a slow endpoint shows up before it goes down.",
  },
  {
    icon: History,
    title: "Uptime history you can review",
    body: "24h, 7d, and 30d uptime are tracked automatically and stay attached to the monitor.",
  },
  {
    icon: ShieldCheck,
    title: "Read-only by design",
    body: "Pulse only sends a GET request to the URL you give it. Nothing is written back to your API.",
  },
];

export default function NewMonitorByTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: typeId } = use(params);
  const type = getMonitorType(typeId);

  if (!type) {
    notFound();
  }

  if (type.status === "soon") {
    const Icon = type.icon;
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/monitors/new"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to monitor types
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="text-center py-14">
            <CardContent className="pt-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] border border-white/10">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-[10px] font-medium tracking-wide uppercase text-muted-foreground mb-2">
                Coming soon
              </p>
              <h1 className="font-display text-xl font-semibold text-foreground mb-2">
                {type.label} monitoring
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
                {type.detail}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link href="/monitors/new/api" className="gap-1.5">
                    Add an API monitor instead
                  </Link>
                </Button>
                <Button variant="secondary" size="sm" disabled className="gap-1.5">
                  <Bell className="h-3.5 w-3.5" />
                  Notify me
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/monitors/new"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to monitor types
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: what a monitor does */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="lg:col-span-5 lg:sticky lg:top-28"
        >
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Add an API monitor
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            A monitor is one endpoint Pulse watches for you. Give it a name and a
            URL, and it starts checking on the schedule you set.
          </p>

          <div className="mt-7 space-y-5">
            {points.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--lime)]/10 border border-[var(--lime)]/25">
                  <Icon className="h-4 w-4 text-[var(--lime)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[11px] text-muted-foreground mb-2">Sample check log</p>
            <p className="font-mono text-xs text-[var(--lime)]">
              GET /health → 200 · 84ms
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              checked 5m ago
            </p>
          </div>
        </motion.div>

        {/* Right: the create form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
          className="lg:col-span-7"
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Monitor details</CardTitle>
            </CardHeader>
            <CardContent>
              <MonitorForm mode="create" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
