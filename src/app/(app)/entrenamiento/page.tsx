import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WorkoutLogger from "@/components/workout-logger";
import type { WorkoutSession } from "@/lib/types";
import { bogotaDate, bogotaPretty, bogotaWeekday, WORKOUT_DAY_TITLES } from "@/lib/date";

export default async function EntrenamientoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const logDate = bogotaDate();
  const dow = bogotaWeekday();
  const suggestedTitle = WORKOUT_DAY_TITLES[dow];

  const { data } = await supabase
    .from("workout_sessions")
    .select("*, session_exercises(*, exercise_sets(*))")
    .eq("session_date", logDate)
    .order("created_at", { ascending: true });

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
      <header className="mb-6">
        <p className="text-sm capitalize text-neutral-500">{prettyDate}</p>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Entrenamiento
        </h1>
        <p className="mt-1 text-sm text-emerald-400">{suggestedTitle}</p>
      </header>

      <WorkoutLogger
        initialSession={session}
        userId={user.id}
        logDate={logDate}
        suggestedTitle={suggestedTitle}
      />
    </main>
  );
}
