import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlanEditor from "@/components/plan-editor";
import { bogotaWeekday } from "@/lib/date";
import type { PlanDay, PlanExercise } from "@/lib/types";
import { ChevronLeft } from "lucide-react";

export default async function PlanPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [daysRes, exRes] = await Promise.all([
    supabase.from("workout_plan_days").select("*"),
    supabase.from("workout_plan_exercises").select("*").order("order_index"),
  ]);

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:max-w-2xl md:pb-10 md:pt-8">
      <Link
        href="/entrenamiento"
        className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-400 transition hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        Entrenamiento
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Mi plan semanal
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Define el enfoque y los ejercicios de cada día. Se repite cada semana.
        </p>
      </header>

      <PlanEditor
        userId={user.id}
        initialDays={(daysRes.data ?? []) as PlanDay[]}
        initialExercises={(exRes.data ?? []) as PlanExercise[]}
        todayWeekday={bogotaWeekday()}
      />
    </main>
  );
}
