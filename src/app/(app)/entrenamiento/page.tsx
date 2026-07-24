import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WorkoutLogger from "@/components/workout-logger";
import type { WorkoutSession } from "@/lib/types";

// Sugerencia de rutina según el día de la semana (basado en el Raido Protocol)
const DAY_TITLES: Record<number, string> = {
  1: "Día 1 · Pierna A (Cuádriceps)",
  2: "Día 2 · Empuje (Pecho, Hombro, Tríceps)",
  3: "Miércoles · Descanso activo",
  4: "Día 4 · Tirón (Espalda, Bíceps)",
  5: "Día 5 · Pierna B (Isquios, Glúteo)",
  6: "Día 6 · Torso (Bombeo)",
  0: "Domingo · Descanso total",
};

export default async function EntrenamientoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const logDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
  }).format(new Date());

  // Día de la semana (0=Dom..6=Sab) en zona horaria Colombia
  const dowName = new Date().toLocaleDateString("en-US", {
    timeZone: "America/Bogota",
    weekday: "long",
  });
  const DOW: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  const dow = DOW[dowName] ?? 1;
  const suggestedTitle = DAY_TITLES[dow];

  const { data } = await supabase
    .from("workout_sessions")
    .select("*, session_exercises(*, exercise_sets(*))")
    .eq("session_date", logDate)
    .maybeSingle();

  const session = (data as WorkoutSession | null) ?? null;

  const prettyDate = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Bogota",
  }).format(new Date());

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-md px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
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
