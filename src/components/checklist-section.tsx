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

      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => toggle(item)}
              className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition active:scale-[0.99] hover:bg-neutral-800/50"
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                  item.completed
                    ? "border-emerald-500 bg-emerald-500 text-neutral-950"
                    : "border-neutral-600 bg-transparent"
                }`}
              >
                {item.completed && <Check className="h-4 w-4" strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium transition ${
                      item.completed
                        ? "text-neutral-500 line-through"
                        : "text-neutral-100"
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.time && (
                    <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-neutral-400">
                      {item.time.slice(0, 5)}
                    </span>
                  )}
                </span>
                {item.detail && (
                  <span
                    className={`mt-0.5 block whitespace-pre-line text-xs leading-relaxed transition ${
                      item.completed ? "text-neutral-600" : "text-neutral-400"
                    }`}
                  >
                    {item.detail}
                  </span>
                )}
                {item.category && (
                  <span className="text-xs text-neutral-500">
                    {item.category}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
