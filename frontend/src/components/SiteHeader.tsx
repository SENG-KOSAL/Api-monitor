"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Activity, LogOut, Plus } from "lucide-react";

const navLinks = [
  { label: "Product", href: "/product" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Once someone is inside the working app (dashboard or a monitor's pages),
  // the logo should take them back to their monitors, not the marketing page.
  const inApp = pathname.startsWith("/dashboard") || pathname.startsWith("/monitors");
  const logoHref = inApp ? "/dashboard" : "/";

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false; // anchors never show as the active route
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="glass-nav rounded-2xl px-4 sm:px-5">
          <div className="flex justify-between items-center h-14">
            <Link href={logoHref} className="flex items-center gap-2.5 shrink-0">
              <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--lime)]/10 border border-[var(--lime)]/30">
                <Activity className="h-4 w-4 text-[var(--lime)]" strokeWidth={2.5} />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                Pulse
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={[
                      "px-3 py-2 text-sm rounded-lg transition-colors",
                      active
                        ? "text-[var(--lime)] bg-[var(--lime)]/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              {isLoading ? null : isAuthenticated ? (
                <>
                  <Button asChild size="sm">
                    <Link href="/monitors/new" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add monitor</span>
                    </Link>
                  </Button>
                  <div className="hidden md:flex items-center gap-1.5 pl-1">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--lime)]/10 border border-[var(--lime)]/25 text-xs font-medium text-[var(--lime)]">
                      {(user?.full_name || user?.email || "?").charAt(0).toUpperCase()}
                    </span>
                    <button
                      onClick={logout}
                      title="Log out"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/register">Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
