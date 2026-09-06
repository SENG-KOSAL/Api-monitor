import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Providers from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Activity, Plus } from "lucide-react";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Pulse — API Monitor",
  description: "Uptime and latency monitoring for the APIs you ship.",
};

const navLinks = [
  { label: "Product", href: "/#product" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Dashboard", href: "/" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background relative">
        {/* Ambient backdrop: architectural grid + organic glow blooms + grain */}
        <div className="grid-overlay" aria-hidden="true" />
        <div
          className="glow-blob w-[560px] h-[560px] -top-40 -left-40 bg-[var(--lime)]/[0.12]"
          aria-hidden="true"
        />
        <div
          className="glow-blob w-[480px] h-[480px] top-1/3 -right-32 bg-[var(--lime)]/[0.07]"
          aria-hidden="true"
        />
        <div className="noise-overlay" aria-hidden="true" />

        <Providers>
          <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="glass-nav rounded-2xl px-4 sm:px-5">
                <div className="flex justify-between items-center h-14">
                  <Link href="/" className="flex items-center gap-2.5 shrink-0">
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--lime)]/10 border border-[var(--lime)]/30">
                      <Activity className="h-4 w-4 text-[var(--lime)]" strokeWidth={2.5} />
                    </span>
                    <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                      Pulse
                    </span>
                  </Link>

                  <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  <Button asChild size="sm" className="shrink-0">
                    <Link href="/monitors/new" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add monitor</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 relative z-10">{children}</main>

          <footer className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 mt-8">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground border-t border-white/[0.06] pt-6">
              <span>© {new Date().getFullYear()} Pulse. Every check, logged.</span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--lime)] opacity-75 animate-pulse-ring" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--lime)]" />
                </span>
                All systems operational
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
