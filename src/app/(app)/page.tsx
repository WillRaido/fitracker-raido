import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  bogotaDate,
  bogotaPretty,
  bogotaWeekday,
  WORKOUT_DAY_TITLES,
} from "@/lib/date";
import {
  Activity,
  UtensilsCrossed,
  Dumbbell,
  ChevronRight,
  CheckCircle2,
  Settings,
  LogOut,
  Flame,
} from "lucide-react";

function ProgressRing({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-neutral-800"
        />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={`${pct} 100`}
          strokeLinecap="round"
          className="text-emerald-400"
          pathLength={100}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
        {pct}%
      </span>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const logDate = bogotaDate();
  const dow = bogotaWeekday();

  // Ventana de 60 días para calcular la racha de hábitos
  const since = new Date();
  since.setDate(since.getDate() - 60);
  const sinceDate = bogotaDate(since);

  const [
    habitsRes,
    mealsRes,
    habitLogsRes,
    mealLogsRes,
    sessionRes,
    streakLogsRes,
  ] = await Promise.all([
    supabase.from("habits").select("id").eq("active", true),
    supabase.from("meals").select("id").eq("active", true),
    supabase
      .from("habit_logs")
      .select("habit_id")
      .eq("log_date", logDate)
      .eq("completed", true),
    supabase
      .from("meal_logs")
      .select("meal_id")
      .eq("log_date", logDate)
      .eq("completed", true),
    supabase
      .from("workout_sessions")
      .select("id, session_exercises(id)")
      .eq("session_date", logDate)
      .maybeSingle(),
    supabase
      .from("habit_logs")
      .select("log_date")
      .eq("completed", true)
      .gte("log_date", sinceDate),
  ]);

  const habitsTotal = habitsRes.data?.length ?? 0;
  const mealsTotal = mealsRes.data?.length ?? 0;
  const habitsDone = habitLogsRes.data?.length ?? 0;
  const mealsDone = mealLogsRes.data?.length ?? 0;
  const session = sessionRes.data as
    | { id: string; session_exercises: { id: string }[] }
    | null;
  const workoutStarted = !!session;
  const exercisesCount = session?.session_exercises.length ?? 0;

  // Racha: días consecutivos (terminando hoy o ayer) con TODOS los hábitos hechos
  const countsByDate = new Map<string, number>();
  (streakLogsRes.data ?? []).forEach((r: { log_date: string }) => {
    countsByDate.set(r.log_date, (countsByDate.get(r.log_date) ?? 0) + 1);
  });
  const isComplete = (d: string) =>
    habitsTotal > 0 && (countsByDate.get(d) ?? 0) >= habitsTotal;

  let streak = 0;
  const cursor = new Date();
  // Si hoy aún no está completo, la racha puede venir desde ayer
  if (!isComplete(bogotaDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (isComplete(bogotaDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const cards = [
    {
      href: "/entrenamiento",
      label: "Entrenamiento",
      sub: WORKOUT_DAY_TITLES[dow],
      icon: Dumbbell,
      status: workoutStarted
        ? `${exercisesCount} ejercicios registrados`
        : "Sin iniciar",
      done: workoutStarted,
    },
    {
      href: "/nutricion",
      label: "Nutrición",
      sub: "Meal Prep del día",
      icon: UtensilsCrossed,
      status: `${mealsDone}/${mealsTotal} comidas`,
      done: mealsTotal > 0 && mealsDone === mealsTotal,
    },
    {
      href: "/habitos",
      label: "Hábitos y Postura",
      sub: "Movilidad · Cuello · Hidratación",
      icon: Activity,
      status: `${habitsDone}/${habitsTotal} completados`,
      done: habitsTotal > 0 && habitsDone === habitsTotal,
    },
  ];

  const totalDone = habitsDone + mealsDone + (workoutStarted ? 1 : 0);
  const totalItems = habitsTotal + mealsTotal + 1;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:pb-10 md:pt-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm capitalize text-neutral-500">{bogotaPretty()}</p>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Hola de nuevo 👋
          </h1>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/ajustes"
            aria-label="Ajustes"
            className="rounded-full border border-neutral-800 p-2 text-neutral-400 transition hover:text-white"
          >
            <Settings className="h-5 w-5" />
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              aria-label="Cerrar sesión"
              className="rounded-full border border-neutral-800 p-2 text-neutral-400 transition hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>

      {/* Resumen del día */}
      <section className="mb-6 flex items-center gap-4 rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-900/40 p-5">
        <ProgressRing done={totalDone} total={totalItems} />
        <div className="flex-1">
          <h2 className="font-semibold text-white">Progreso de hoy</h2>
          <p className="text-sm text-neutral-400">
            {totalDone} de {totalItems} tareas del día
          </p>
        </div>
        {streak > 0 && (
          <div className="flex flex-col items-center rounded-xl bg-orange-500/10 px-3 py-2">
            <Flame className="h-5 w-5 text-orange-400" />
            <span className="mt-0.5 text-lg font-bold leading-none text-white">
              {streak}
            </span>
            <span className="text-[10px] text-neutral-400">
              {streak === 1 ? "día" : "días"}
            </span>
          </div>
        )}
      </section>

      {/* Accesos */}
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map(({ href, label, sub, icon: Icon, status, done }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 transition hover:border-neutral-700 hover:bg-neutral-900"
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                done
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-neutral-800 text-neutral-300"
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Icon className="h-6 w-6" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">{label}</p>
              <p className="truncate text-xs text-neutral-500">{sub}</p>
              <p className="mt-0.5 text-sm text-emerald-400">{status}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-neutral-600 transition group-hover:text-neutral-400" />
          </Link>
        ))}
      </div>
    </main>
  );
}
