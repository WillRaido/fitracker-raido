import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChecklistSection from "@/components/checklist-section";
import { bogotaDate, bogotaPretty } from "@/lib/date";
import type { Habit, HabitLog, ChecklistItem } from "@/lib/types";
import { Activity } from "lucide-react";

export default async function HabitosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const logDate = bogotaDate();

  const [habitsRes, logsRes] = await Promise.all([
    supabase.from("habits").select("*").eq("active", true).order("order_index"),
    supabase.from("habit_logs").select("*").eq("log_date", logDate),
  ]);

  const habits = (habitsRes.data ?? []) as Habit[];
  const logs = (logsRes.data ?? []) as HabitLog[];
  const done = new Map(logs.map((l) => [l.habit_id, l.completed]));

  const items: ChecklistItem[] = habits.map((h) => ({
    id: h.id,
    name: h.name,
    category: h.category,
    completed: done.get(h.id) ?? false,
  }));

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:max-w-xl md:pb-10 md:pt-8">
      <header className="mb-6">
        <p className="text-sm capitalize text-neutral-500">{bogotaPretty()}</p>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Hábitos y Postura
        </h1>
      </header>

      <ChecklistSection
        title="Rutina diaria"
        icon={<Activity className="h-5 w-5" />}
        items={items}
        userId={user.id}
        logDate={logDate}
        table="habit_logs"
        fkColumn="habit_id"
      />
    </main>
  );
}
