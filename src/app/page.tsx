import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChecklistSection from "@/components/checklist-section";
import type { Habit, Meal, HabitLog, MealLog, ChecklistItem } from "@/lib/types";
import { Activity, UtensilsCrossed, LogOut } from "lucide-react";

export default async function TodayPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fecha "hoy" en la zona horaria de Colombia (YYYY-MM-DD)
  const logDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
  }).format(new Date());

  // Cargar catálogos + registros del día en paralelo
  const [habitsRes, mealsRes, habitLogsRes, mealLogsRes] = await Promise.all([
    supabase
      .from("habits")
      .select("*")
      .eq("active", true)
      .order("order_index"),
    supabase.from("meals").select("*").eq("active", true).order("order_index"),
    supabase.from("habit_logs").select("*").eq("log_date", logDate),
    supabase.from("meal_logs").select("*").eq("log_date", logDate),
  ]);

  const habits = (habitsRes.data ?? []) as Habit[];
  const meals = (mealsRes.data ?? []) as Meal[];
  const habitLogs = (habitLogsRes.data ?? []) as HabitLog[];
  const mealLogs = (mealLogsRes.data ?? []) as MealLog[];

  const habitDone = new Map(habitLogs.map((l) => [l.habit_id, l.completed]));
  const mealDone = new Map(mealLogs.map((l) => [l.meal_id, l.completed]));

  const habitItems: ChecklistItem[] = habits.map((h) => ({
    id: h.id,
    name: h.name,
    category: h.category,
    completed: habitDone.get(h.id) ?? false,
  }));

  const mealItems: ChecklistItem[] = meals.map((m) => ({
    id: m.id,
    name: m.name,
    completed: mealDone.get(m.id) ?? false,
  }));

  const prettyDate = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Bogota",
  }).format(new Date());

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-md px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm capitalize text-neutral-500">{prettyDate}</p>
          <h1 className="text-2xl font-bold tracking-tight text-white">Hoy</h1>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            aria-label="Cerrar sesión"
            className="rounded-full border border-neutral-800 p-2 text-neutral-400 transition hover:text-white"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </header>

      <div className="space-y-4">
        <ChecklistSection
          title="Hábitos y Postura"
          icon={<Activity className="h-5 w-5" />}
          items={habitItems}
          userId={user.id}
          logDate={logDate}
          table="habit_logs"
          fkColumn="habit_id"
        />

        <ChecklistSection
          title="Nutrición (Meal Prep)"
          icon={<UtensilsCrossed className="h-5 w-5" />}
          items={mealItems}
          userId={user.id}
          logDate={logDate}
          table="meal_logs"
          fkColumn="meal_id"
        />
      </div>
    </main>
  );
}
