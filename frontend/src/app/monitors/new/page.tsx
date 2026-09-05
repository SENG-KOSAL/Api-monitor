"use client";

import MonitorForm from "@/components/MonitorForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Radio, Timer, History, ShieldCheck } from "lucide-react";

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

export default function NewMonitorPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: what a monitor does */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="lg:col-span-5 lg:sticky lg:top-28"
        >
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Add a monitor
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
