import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WorkoutLogger from "@/components/workout-logger";
import type { WorkoutSession, PlanDay, PlanExercise } from "@/lib/types";
import { bogotaDate, bogotaPretty, bogotaWeekday } from "@/lib/date";
import { CalendarCog } from "lucide-react";

export default async function EntrenamientoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const logDate = bogotaDate();
  const dow = bogotaWeekday();

  const [sessionRes, planDayRes, planExRes] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select("*, session_exercises(*, exercise_sets(*))")
      .eq("session_date", logDate)
      .order("created_at", { ascending: true }),
    supabase
      .from("workout_plan_days")
      .select("*")
      .eq("weekday", dow)
      .maybeSingle(),
    supabase
      .from("workout_plan_exercises")
      .select("*")
      .eq("weekday", dow)
      .order("order_index"),
  ]);

  const planDay = planDayRes.data as PlanDay | null;
  const planExercises = (planExRes.data ?? []) as PlanExercise[];

  // El enfoque del plan del usuario define el título; si no tiene plan, se usa
  // un título neutro (no se asume ningún plan ajeno).
  const suggestedTitle = planDay?.is_rest
    ? "Día de descanso"
    : planDay?.focus || "Entrenamiento del día";

  const { data } = sessionRes;

  // Robustez ante sesiones duplicadas antiguas: elegir la que tenga más ejercicios
  const sessions = (data as WorkoutSession[] | null) ?? [];
  const session =
    sessions.length === 0
      ? null
      : [...sessions].sort(
          (a, b) =>
            (b.session_exercises?.length ?? 0) -
            (a.session_exercises?.length ?? 0)
        )[0];
  const prettyDate = bogotaPretty();

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:max-w-2xl md:pb-10 md:pt-8">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm capitalize text-neutral-500">{prettyDate}</p>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Entrenamiento
          </h1>
          <p className="mt-1 text-sm text-emerald-400">{suggestedTitle}</p>
        </div>
        <Link
          href="/entrenamiento/plan"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-neutral-800 px-3 py-2 text-sm text-neutral-300 transition hover:border-neutral-700 hover:text-white"
        >
          <CalendarCog className="h-4 w-4" />
          Plan
        </Link>
      </header>

      <WorkoutLogger
        initialSession={session}
        userId={user.id}
        logDate={logDate}
        suggestedTitle={suggestedTitle}
        planExercises={planExercises}
      />
    </main>
  );
}
