"use client";

import { useEffect, useState } from "react";

type Props = {
  firstName: string | null;
  prettyDate: string;
  greeting: string;
  children?: React.ReactNode;
};

/** Saludo del inicio con un sutil efecto parallax al hacer scroll. */
export default function DashboardHero({
  firstName,
  prettyDate,
  greeting,
  children,
}: Props) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const name = firstName?.trim();

  return (
    <header className="relative mb-6 overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-br from-emerald-500/10 via-neutral-900 to-neutral-900 p-5">
      {/* Orbes con parallax */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl"
        style={{ transform: `translateY(${offset * 0.25}px)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-8 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl"
        style={{ transform: `translateY(${offset * -0.15}px)` }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div style={{ transform: `translateY(${offset * 0.08}px)` }}>
          <p className="text-sm capitalize text-neutral-400">{prettyDate}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
            {greeting}
            {name ? `, ${name}` : ""} 👋
          </h1>
        </div>
        {children && (
          <div className="flex shrink-0 items-center gap-1">{children}</div>
        )}
      </div>
    </header>
  );
}
