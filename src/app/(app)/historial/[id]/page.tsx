import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutSession } from "@/lib/types";
import { ChevronLeft, StickyNote } from "lucide-react";

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("workout_sessions")
    .select("*, session_exercises(*, exercise_sets(*))")
    .eq("id", params.id)
    .maybeSingle();

  const session = data as WorkoutSession | null;
  if (!session) notFound();

  const prettyDate = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(new Date(`${session.session_date}T12:00:00`));

  const exercises = [...session.session_exercises].sort(
    (a, b) => a.order_index - b.order_index
  );

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:max-w-2xl md:pb-10 md:pt-8">
      <Link
        href="/historial"
        className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-400 transition hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        Historial
      </Link>

      <header className="mb-6">
        <h1 className="text-xl font-bold capitalize tracking-tight text-white">
          {prettyDate}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {exercises.length} ejercicios ·{" "}
          {exercises.reduce((n, ex) => n + ex.exercise_sets.length, 0)} series
        </p>
      </header>

      {session.notes && (
        <div className="mb-4 flex gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 text-sm text-neutral-300">
          <StickyNote className="h-4 w-4 shrink-0 text-emerald-400" />
          {session.notes}
        </div>
      )}

      {exercises.length === 0 ? (
        <p className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 text-center text-sm text-neutral-500">
          Esta sesión no tiene ejercicios registrados.
        </p>
      ) : (
        <div className="space-y-4">
          {exercises.map((ex) => (
            <section
              key={ex.id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4"
            >
              <h2 className="mb-2 font-semibold text-white">
                {ex.exercise_name}
              </h2>
              {ex.notes && (
                <p className="mb-3 text-xs italic text-neutral-500">
                  {ex.notes}
                </p>
              )}
              <div className="space-y-1">
                {[...ex.exercise_sets]
                  .sort((a, b) => a.set_number - b.set_number)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 rounded-lg bg-neutral-800/40 px-3 py-2 text-sm"
                    >
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                          s.set_type === "warmup"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {s.set_type === "warmup" ? "SA" : "SE"}
                      </span>
                      <span className="text-neutral-300">
                        Serie {s.set_number}
                      </span>
                      <span className="ml-auto tabular-nums text-neutral-100">
                        {s.reps ?? "—"} reps
                      </span>
                      <span className="tabular-nums text-neutral-100">
                        {s.weight_kg ?? "—"} kg
                      </span>
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
