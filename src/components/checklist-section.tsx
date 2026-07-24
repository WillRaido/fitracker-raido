"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistItem } from "@/lib/types";
import { Check } from "lucide-react";

type Props = {
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
  userId: string;
  logDate: string;
  /** Tabla de registros: "habit_logs" | "meal_logs" */
  table: "habit_logs" | "meal_logs";
  /** Columna FK: "habit_id" | "meal_id" */
  fkColumn: "habit_id" | "meal_id";
};

export default function ChecklistSection({
  title,
  icon,
  items: initialItems,
  userId,
  logDate,
  table,
  fkColumn,
}: Props) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [, startTransition] = useTransition();
  const supabase = createClient();

  const doneCount = items.filter((i) => i.completed).length;

  async function toggle(item: ChecklistItem) {
    const nextCompleted = !item.completed;

    // Optimistic UI
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, completed: nextCompleted } : i
      )
    );

    startTransition(async () => {
      const { error } = await supabase.from(table).upsert(
        {
          user_id: userId,
          [fkColumn]: item.id,
          log_date: logDate,
          completed: nextCompleted,
        },
        { onConflict: `user_id,${fkColumn},log_date` }
      );

      // Revertir si falla
      if (error) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, completed: !nextCompleted } : i
          )
        );
      }
    });
  }

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">{icon}</span>
          <h2 className="font-semibold text-white">{title}</h2>
        </div>
        <span className="text-sm tabular-nums text-neutral-400">
          {doneCount}/{items.length}
        </span>
      </header>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => toggle(item)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition active:scale-[0.99] ${
                item.completed
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
              }`}
            >
              {item.emoji && (
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl transition ${
                    item.completed ? "bg-emerald-500/10" : "bg-neutral-800"
                  }`}
                >
                  {item.emoji}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-sm font-semibold transition ${
                      item.completed
                        ? "text-neutral-500 line-through"
                        : "text-neutral-100"
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.time && (
                    <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] font-medium tabular-nums text-neutral-400">
                      {item.time.slice(0, 5)}
                    </span>
                  )}
                </span>
                {item.detail && (
                  <span
                    className={`mt-1 block whitespace-pre-line text-xs leading-relaxed transition ${
                      item.completed ? "text-neutral-600" : "text-neutral-400"
                    }`}
                  >
                    {item.detail}
                  </span>
                )}
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  item.completed
                    ? "border-emerald-500 bg-emerald-500 text-neutral-950"
                    : "border-neutral-600 bg-transparent"
                }`}
              >
                {item.completed && <Check className="h-4 w-4" strokeWidth={3} />}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
