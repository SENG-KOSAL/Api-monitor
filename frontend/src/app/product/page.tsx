"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          Pulse is built around one idea: a monitor for anything you depend on.
          Here's every monitor type, what it tracks, and whether it's ready today.
        </p>
      </motion.div>

      <div className="space-y-5">
        {monitorTypes.map((type, index) => {
          const Icon = type.icon;
          const available = type.status === "available";

          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
            >
              <div className="glass-panel rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
                <div
                  className={[
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
                    available
                      ? "bg-[var(--lime)]/10 border-[var(--lime)]/25"
                      : "bg-white/[0.03] border-white/10",
                  ].join(" ")}
                >
                  <Icon
                    className={available ? "h-6 w-6 text-[var(--lime)]" : "h-6 w-6 text-muted-foreground"}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      {type.label}
                    </h2>
                    <span
                      className={[
                        "text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full border",
                        available
                          ? "text-[var(--lime)] border-[var(--lime)]/25 bg-[var(--lime)]/10"
                          : "text-muted-foreground border-white/10 bg-white/[0.03]",
                      ].join(" ")}
                    >
                      {available ? "Available" : "Coming soon"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-xl">
                    {type.detail}
                  </p>
                </div>

                <Button asChild variant={available ? "default" : "outline"} size="sm" className="shrink-0 gap-1.5">
                  <Link href={`/monitors/new/${type.id}`}>
                    {available ? "Add monitor" : "Learn more"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
