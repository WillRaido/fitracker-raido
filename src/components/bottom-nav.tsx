"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Dumbbell, LineChart } from "lucide-react";

const TABS = [
  { href: "/", label: "Hoy", icon: CalendarCheck },
  { href: "/entrenamiento", label: "Entreno", icon: Dumbbell },
  { href: "/historial", label: "Historial", icon: LineChart },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition ${
                active ? "text-emerald-400" : "text-neutral-500"
              }`}
            >
              <Icon
                className="h-6 w-6"
                strokeWidth={active ? 2.4 : 1.8}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
