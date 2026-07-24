import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChecklistSection from "@/components/checklist-section";
import { bogotaDate, bogotaPretty } from "@/lib/date";
import type { Meal, MealLog, ChecklistItem } from "@/lib/types";
import { UtensilsCrossed } from "lucide-react";

export default async function NutricionPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const logDate = bogotaDate();

  const [mealsRes, logsRes] = await Promise.all([
    supabase.from("meals").select("*").eq("active", true).order("order_index"),
    supabase.from("meal_logs").select("*").eq("log_date", logDate),
  ]);

  const meals = (mealsRes.data ?? []) as Meal[];
  const logs = (logsRes.data ?? []) as MealLog[];
  const done = new Map(logs.map((l) => [l.meal_id, l.completed]));

  const items: ChecklistItem[] = meals.map((m) => ({
    id: m.id,
    name: m.name,
    completed: done.get(m.id) ?? false,
  }));

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:max-w-xl md:pb-10 md:pt-8">
      <header className="mb-6">
        <p className="text-sm capitalize text-neutral-500">{bogotaPretty()}</p>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Nutrición
        </h1>
      </header>

      <ChecklistSection
        title="Meal Prep del día"
        icon={<UtensilsCrossed className="h-5 w-5" />}
        items={items}
        userId={user.id}
        logDate={logDate}
        table="meal_logs"
        fkColumn="meal_id"
      />
    </main>
  );
}
