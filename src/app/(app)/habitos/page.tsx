import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChecklistSection from "@/components/checklist-section";
import { bogotaDate, bogotaPretty } from "@/lib/date";
import type { Habit, HabitLog, ChecklistItem } from "@/lib/types";
import { habitEmoji, categoryStyle } from "@/lib/emoji";

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

  // Agrupar por categoría, preservando el orden de aparición
  const groups: { category: string; items: ChecklistItem[] }[] = [];
  for (const h of habits) {
    const category = h.category?.trim() || "General";
    let group = groups.find((g) => g.category === category);
    if (!group) {
      group = { category, items: [] };
      groups.push(group);
    }
    group.items.push({
      id: h.id,
      name: h.name,
      emoji: habitEmoji(h.category, h.name),
      completed: done.get(h.id) ?? false,
    });
  }

  const totalDone = habits.filter((h) => done.get(h.id)).length;

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:max-w-xl md:pb-10 md:pt-8">
      <header className="mb-6">
        <p className="text-sm capitalize text-neutral-500">{bogotaPretty()}</p>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Hábitos y Postura
        </h1>
        <p className="mt-1 text-sm text-emerald-400">
          {totalDone} de {habits.length} completados hoy
        </p>
      </header>

      <div className="space-y-4">
        {groups.map((g) => {
          const { emoji } = categoryStyle(g.category);
          return (
            <ChecklistSection
              key={g.category}
              title={g.category}
              icon={<span className="text-lg">{emoji}</span>}
              items={g.items}
              userId={user.id}
              logDate={logDate}
              table="habit_logs"
              fkColumn="habit_id"
            />
          );
        })}
        {groups.length === 0 && (
          <p className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 text-center text-sm text-neutral-500">
            No tienes hábitos activos. Añádelos en Ajustes.
          </p>
        )}
      </div>
    </main>
  );
}
