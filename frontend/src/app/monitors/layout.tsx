"use client";

import RequireAuth from "@/components/RequireAuth";

export default function MonitorsLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
