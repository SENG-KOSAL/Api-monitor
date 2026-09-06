import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import SiteHeader from "@/components/SiteHeader";

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
          <SiteHeader />

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
