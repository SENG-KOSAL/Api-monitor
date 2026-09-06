"use client";

import RequireAdmin from "@/components/RequireAdmin";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AdminNav />
        <div className="mt-6">{children}</div>
      </div>
    </RequireAdmin>
  );
}
