"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { featureFlags } from "@/core/config/feature-flags";

const items = [
  { href: "/", label: "Dashboard", flag: true },
  { href: "/ingest", label: "Ingesta", flag: featureFlags.ingest },
  { href: "/verify", label: "Verificar", flag: featureFlags.verify }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="min-h-[calc(100vh-64px)] w-64 border-r border-gov-border bg-white p-4">
      <nav aria-label="Navegacion principal">
        <ul className="space-y-2">
          {items
            .filter((item) => item.flag)
            .map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-md px-3 py-2 text-sm ${
                      active ? "bg-gov-primary text-white" : "bg-gov-muted text-gov-foreground hover:bg-gov-border"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
    </aside>
  );
}
