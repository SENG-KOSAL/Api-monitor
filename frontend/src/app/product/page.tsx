"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Activity } from "lucide-react";
import { monitorTypes } from "@/lib/monitor-types";

export default function ProductPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="max-w-2xl mb-12"
      >
        <p className="text-xs font-medium tracking-wide uppercase text-[var(--lime)] mb-2">
          Product
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
          Every way to watch your system.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Pulse's product is organized into services. Monitoring is live today —
          more services will land here as they're built.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Link
          href="/monitors/new"
          className="group glass-panel rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 transition-all hover:border-[var(--lime)]/30 hover:-translate-y-0.5"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--lime)]/10 border border-[var(--lime)]/25">
            <Activity className="h-7 w-7 text-[var(--lime)]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-xl font-semibold text-foreground">Monitors</h2>
              <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full border text-[var(--lime)] border-[var(--lime)]/25 bg-[var(--lime)]/10">
                Live
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-xl">
              Watch the systems your product depends on — APIs, servers, databases,
              background jobs, and applications — from one place.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {monitorTypes.map((type) => (
                <span
                  key={type.id}
                  className="text-[11px] text-muted-foreground border border-white/10 bg-white/[0.03] rounded-full px-2.5 py-1"
                >
                  {type.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--lime)] shrink-0 self-start sm:self-center">
            Set up a monitor
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
        className="mt-6 rounded-2xl border border-dashed border-white/10 px-6 py-5 text-sm text-muted-foreground"
      >
        More services — like automation and chat — are on the way and will show up here as their own section.
      </motion.div>
    </div>
  );
}
