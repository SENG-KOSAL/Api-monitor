"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { monitorTypes } from "@/lib/monitor-types";

export default function NewMonitorTypePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
          What do you want to monitor?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a type to get started. You can add more monitors later.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
              <Link
                href={`/monitors/new/${type.id}`}
                className={[
                  "group relative flex h-full flex-col justify-between gap-5 rounded-2xl p-5 transition-all glass-panel",
                  available
                    ? "hover:border-[var(--lime)]/30 hover:-translate-y-0.5"
                    : "hover:-translate-y-0.5 hover:border-white/[0.14]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-xl border",
                      available
                        ? "bg-[var(--lime)]/10 border-[var(--lime)]/25"
                        : "bg-white/[0.03] border-white/10",
                    ].join(" ")}
                  >
                    <Icon
                      className={available ? "h-5 w-5 text-[var(--lime)]" : "h-5 w-5 text-muted-foreground"}
                    />
                  </div>
                  <span
                    className={[
                      "text-[10px] font-medium tracking-wide uppercase px-2 py-1 rounded-full border",
                      available
                        ? "text-[var(--lime)] border-[var(--lime)]/25 bg-[var(--lime)]/10"
                        : "text-muted-foreground border-white/10 bg-white/[0.03]",
                    ].join(" ")}
                  >
                    {available ? "Available" : "Coming soon"}
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-1.5">
                    {type.label}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-[var(--lime)]" />
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {type.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
