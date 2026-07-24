"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Dumbbell,
  UtensilsCrossed,
  Activity,
  ArrowRight,
  Target,
  LineChart,
  Sparkles,
} from "lucide-react";

const PILLARS = [
  {
    emoji: "🏋️",
    icon: Dumbbell,
    title: "Entrenamiento",
    desc: "Un plan semanal a tu medida. Registra series, pesos y progreso día a día con total trazabilidad.",
    color: "emerald",
  },
  {
    emoji: "🥗",
    icon: UtensilsCrossed,
    title: "Nutrición",
    desc: "Tu meal prep organizado por horarios. Sabes qué comer, cuándo, y marcas tu cumplimiento.",
    color: "sky",
  },
  {
    emoji: "🧘",
    icon: Activity,
    title: "Hábitos",
    desc: "Movilidad, postura e hidratación. Pequeñas rutinas que construyen grandes cambios.",
    color: "violet",
  },
];

const COLOR_MAP: Record<string, string> = {
  emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
  sky: "border-sky-500/30 bg-sky-500/5 text-sky-400",
  violet: "border-violet-500/30 bg-violet-500/5 text-violet-400",
};

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-neutral-950 text-white">
      {/* ---------- Fondo parallax ---------- */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -left-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-emerald-600/20 blur-[120px]"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        />
        <div
          className="absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-sky-600/15 blur-[120px]"
          style={{ transform: `translateY(${scrollY * -0.18}px)` }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-[30rem] w-[30rem] rounded-full bg-violet-600/15 blur-[120px]"
          style={{ transform: `translateY(${scrollY * 0.12}px)` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,transparent,rgba(10,10,10,0.6))]" />
      </div>

      {/* ---------- Nav superior ---------- */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-neutral-950/60 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/icon.svg"
              alt="Fitracker"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-bold tracking-tight">
              Fitracker
            </span>
          </div>
          <Link
            href="/inicio"
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative mx-auto flex min-h-[88vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div
          style={{ transform: `translateY(${scrollY * 0.3}px)`, opacity: Math.max(0, 1 - scrollY / 500) }}
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-neutral-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            por Raido
          </span>
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
            Transforma tus
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              hábitos de vida
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-400">
            Fitracker te acompaña a mejorar de forma real y sostenible, con un
            plan enfocado en <span className="text-white">tus</span>{" "}
            requerimientos. Sin excusas, con datos.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/inicio"
              className="group flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 font-semibold text-neutral-950 transition hover:bg-emerald-400"
            >
              Comenzar ahora
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <a
              href="#pilares"
              className="rounded-full border border-white/15 px-7 py-3.5 font-semibold text-neutral-200 transition hover:bg-white/5"
            >
              Conocer más
            </a>
          </div>
        </div>
      </section>

      {/* ---------- 3 Pilares ---------- */}
      <section id="pilares" className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            3 Pilares
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Todo lo que necesitas, en un solo lugar
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-400">
            Un enfoque integral para que cada persona avance a su ritmo y según
            sus metas.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.05]"
              style={{
                transform: `translateY(${Math.max(-40, (scrollY - 700 - i * 60) * -0.05)}px)`,
              }}
            >
              <div
                className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl ${COLOR_MAP[p.color]}`}
              >
                {p.emoji}
              </div>
              <h3 className="text-xl font-bold">{p.title}</h3>
              <p className="mt-2 text-neutral-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Cómo funciona ---------- */}
      <section className="relative mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-10 sm:p-14">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                icon: Target,
                title: "Define tu objetivo",
                desc: "Hipertrofia, salud, fuerza... tu meta guía todo el plan.",
              },
              {
                icon: Activity,
                title: "Sigue tu plan diario",
                desc: "Entreno, comidas y hábitos organizados por día y horario.",
              },
              {
                icon: LineChart,
                title: "Mide tu progreso",
                desc: "Registra cada avance y observa cómo mejoras semana a semana.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center md:text-left">
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-neutral-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA final ---------- */}
      <section className="relative mx-auto max-w-3xl px-6 pb-28 pt-10 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Tu mejor versión empieza hoy
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-neutral-400">
          Únete y construye hábitos que duren toda la vida.
        </p>
        <Link
          href="/inicio"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-lg font-semibold text-neutral-950 transition hover:bg-emerald-400"
        >
          Entrar a Fitracker
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="relative border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-neutral-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/icon.svg"
              alt="Fitracker"
              width={22}
              height={22}
              className="rounded"
            />
            <span className="font-semibold text-neutral-300">Fitracker</span>
          </div>
          <span>
            Hecho con dedicación por{" "}
            <span className="font-semibold text-neutral-300">Raido</span> ·{" "}
            {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </main>
  );
}
