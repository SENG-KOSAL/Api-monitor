"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { monitorTypes } from "@/lib/monitor-types";
import {
  ArrowRight,
  Radio,
  Bell,
  History,
  ShieldCheck,
  Gauge,
  PlugZap,
} from "lucide-react";

const useCases = [
  {
    icon: Radio,
    title: "Catch outages before your users do",
    body: "Pulse checks your endpoints on a schedule, so a failing health check reaches you before a customer files a ticket.",
  },
  {
    icon: Gauge,
    title: "See latency drift, not just downtime",
    body: "Response times are logged on every check, so a service that's technically 'up' but getting slow doesn't go unnoticed.",
  },
  {
    icon: History,
    title: "Keep a record you can point to",
    body: "24h, 7d, and 30d uptime and an incident history live with every monitor — useful for post-mortems and SLA conversations.",
  },
  {
    icon: ShieldCheck,
    title: "Nothing writes back to your systems",
    body: "Every check is a read-only request. Pulse observes; it never modifies your API, database, or server.",
  },
];

const steps = [
  {
    number: "01",
    title: "Pick what to monitor",
    body: "Choose a monitor type — API, server, database, background job, or application.",
  },
  {
    number: "02",
    title: "Point it at your system",
    body: "Give Pulse a URL (and auth, if it needs it) and a check interval.",
  },
  {
    number: "03",
    title: "Get notified when it matters",
    body: "Pulse tracks status, latency, and incidents automatically from the first check onward.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--lime)] border border-[var(--lime)]/25 bg-[var(--lime)]/10 px-3 py-1 rounded-full">
            <PlugZap className="h-3 w-3" />
            Uptime & latency monitoring
          </span>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
            Know the moment your systems stop behaving.
          </h1>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-xl">
            Pulse watches the APIs, servers, and jobs your product depends on —
            checking status and response time on a schedule, and keeping a
            history you can actually use when something goes wrong.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/monitors/new" className="gap-1.5">
                Add your first monitor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Why it's useful */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mb-10"
        >
          <p className="text-xs font-medium tracking-wide uppercase text-[var(--lime)] mb-2">
            Why teams use Pulse
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
            One dashboard for whether things are actually working.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {useCases.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
            >
              <Card className="p-6 h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--lime)]/10 border border-[var(--lime)]/25 mb-4">
                  <Icon className="h-5 w-5 text-[var(--lime)]" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How it works steps */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
              className="relative"
            >
              <span className="font-display text-4xl font-semibold text-white/[0.08]">
                {step.number}
              </span>
              <h3 className="font-display text-lg font-semibold text-foreground -mt-2">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What we monitor, teaser -> Product page */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Card className="p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-xs font-medium tracking-wide uppercase text-[var(--lime)] mb-2">
                {monitorTypes.length} monitor types
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">
                From a single API to your whole stack.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                See every monitor type Pulse supports today, and what's coming next.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0 gap-1.5 self-start sm:self-auto">
              <Link href="/product">
                View the product
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </motion.div>
      </section>

      {/* Pricing placeholder anchor target */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Card className="p-8 sm:p-10 text-center">
            <Bell className="h-6 w-6 text-[var(--lime)] mx-auto mb-3" />
            <h2 className="font-display text-xl font-semibold text-foreground">Pricing is on its way</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Pulse is in active development. For now, add monitors and use the dashboard free.
            </p>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
