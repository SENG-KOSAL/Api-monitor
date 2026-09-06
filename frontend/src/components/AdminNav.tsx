"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Users } from "lucide-react";

const links = [
  { label: "Overview", href: "/admin", icon: ShieldCheck },
  { label: "Users", href: "/admin/users", icon: Users },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 border-b border-white/10 pb-3">
      {links.map(({ label, href, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={[
              "flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors",
              active
                ? "text-[var(--lime)] bg-[var(--lime)]/10"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
