"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Dumbbell,
  UtensilsCrossed,
  Activity,
  LineChart,
  LogOut,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/entrenamiento", label: "Entreno", icon: Dumbbell },
  { href: "/nutricion", label: "Nutrición", icon: UtensilsCrossed },
  { href: "/habitos", label: "Hábitos", icon: Activity },
  { href: "/historial", label: "Historial", icon: LineChart },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/inicio" ? pathname === "/inicio" : pathname.startsWith(href);

  return (
    <div className="md:flex">
      {/* ---------- Sidebar (desktop) ---------- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-neutral-800 bg-neutral-950 p-4 md:flex">
        <div className="mb-8 flex items-center gap-3 px-2 pt-2">
          <Image
            src="/icon.svg"
            alt="Fitracker"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="text-lg font-bold text-white">Fitracker</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive(href)
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive(href) ? 2.4 : 1.8} />
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/ajustes"
          className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            isActive("/ajustes")
              ? "bg-emerald-500/10 text-emerald-400"
              : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
          }`}
        >
          <Settings className="h-5 w-5" />
          Ajustes
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
        </form>
      </aside>

      {/* ---------- Contenido ---------- */}
      <div className="w-full md:pl-60">{children}</div>

      {/* ---------- Bottom nav (mobile) ---------- */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-lg md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition ${
                isActive(href) ? "text-emerald-400" : "text-neutral-500"
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={isActive(href) ? 2.4 : 1.8} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
