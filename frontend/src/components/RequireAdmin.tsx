"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * Gate for everything under /admin. Two checks, in order:
 *  1. Is anyone logged in at all? (same as RequireAuth)
 *  2. Does that person have role "admin"? A logged-in DEVELOPER is bounced
 *     back to /dashboard rather than 403'd on a blank page — the backend
 *     still enforces this independently on every /api/admin/* call.
 */
export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login?next=/admin");
      return;
    }
    if (user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  const authorized = isAuthenticated && user?.role === "admin";

  if (isLoading || !authorized) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--lime)]" />
          {isLoading ? "Checking your session..." : "Redirecting..."}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
