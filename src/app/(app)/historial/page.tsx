import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Dumbbell, CalendarDays, ChevronRight } from "lucide-react";

export default async function HistorialPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id, session_date, session_exercises(id)")
    .order("session_date", { ascending: false })
    .limit(30);

  const rows =
    (sessions as
      | { id: string; session_date: string; session_exercises: { id: string }[] }[]
      | null) ?? [];

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:max-w-2xl md:pb-10 md:pt-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Historial
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Tus entrenamientos registrados.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 text-center">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-neutral-600" />
          <p className="text-sm text-neutral-400">
            Aún no hay entrenamientos registrados. Empieza uno desde la pestaña
            Entreno.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((s) => {
            const date = new Intl.DateTimeFormat("es-CO", {
              weekday: "short",
              day: "numeric",
              month: "short",
              timeZone: "America/Bogota",
            }).format(new Date(`${s.session_date}T12:00:00`));
            return (
              <li key={s.id}>
                <Link
                  href={`/historial/${s.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 transition hover:border-neutral-700 hover:bg-neutral-900"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <Dumbbell className="h-5 w-5" />
                    </span>
                    <span className="capitalize text-neutral-100">{date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400">
                      {s.session_exercises.length} ejercicios
                    </span>
                    <ChevronRight className="h-5 w-5 text-neutral-600 transition group-hover:text-neutral-400" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
