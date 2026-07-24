"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PlanDay, PlanExercise } from "@/lib/types";
import { Plus, Trash2, Moon } from "lucide-react";

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEK_SHORT: Record<number, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
  0: "Dom",
};
const WEEK_LONG: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  0: "Domingo",
};

export default function PlanEditor({
  userId,
  initialDays,
  initialExercises,
  todayWeekday,
}: {
  userId: string;
  initialDays: PlanDay[];
  initialExercises: PlanExercise[];
  todayWeekday: number;
}) {
  const supabase = createClient();
  const [active, setActive] = useState<number>(todayWeekday);
  const [days, setDays] = useState<Record<number, PlanDay | undefined>>(() => {
    const map: Record<number, PlanDay | undefined> = {};
    initialDays.forEach((d) => (map[d.weekday] = d));
    return map;
  });
  const [exercises, setExercises] = useState<PlanExercise[]>(initialExercises);
  const [newName, setNewName] = useState("");
  const [newSets, setNewSets] = useState("");
  const [newReps, setNewReps] = useState("");

  const dayExercises = useMemo(
    () =>
      exercises
        .filter((e) => e.weekday === active)
        .sort((a, b) => a.order_index - b.order_index),
    [exercises, active]
  );

  const currentDay = days[active];
  const isRest = currentDay?.is_rest ?? false;

  async function upsertDay(patch: Partial<Pick<PlanDay, "focus" | "is_rest">>) {
    const existing = days[active];
    const optimistic: PlanDay = {
      id: existing?.id ?? "temp",
      user_id: userId,
      weekday: active,
      focus: existing?.focus ?? null,
      is_rest: existing?.is_rest ?? false,
      created_at: existing?.created_at ?? new Date().toISOString(),
      ...patch,
    };
    setDays((prev) => ({ ...prev, [active]: optimistic }));

    const { data } = await supabase
      .from("workout_plan_days")
      .upsert(
        {
          user_id: userId,
          weekday: active,
          focus: optimistic.focus,
          is_rest: optimistic.is_rest,
        },
        { onConflict: "user_id,weekday" }
      )
      .select("*")
      .single();
    if (data) setDays((prev) => ({ ...prev, [active]: data as PlanDay }));
  }

  async function addExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const { data } = await supabase
      .from("workout_plan_exercises")
      .insert({
        user_id: userId,
        weekday: active,
        exercise_name: newName.trim(),
        order_index: dayExercises.length,
        target_sets: newSets ? parseInt(newSets, 10) : null,
        target_reps: newReps.trim() || null,
      })
      .select("*")
      .single();
    if (data) {
      setExercises((prev) => [...prev, data as PlanExercise]);
      setNewName("");
      setNewSets("");
      setNewReps("");
    }
  }

  async function updateExercise(
    id: string,
    patch: Partial<Pick<PlanExercise, "exercise_name" | "target_sets" | "target_reps">>
  ) {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
    await supabase.from("workout_plan_exercises").update(patch).eq("id", id);
  }

  async function removeExercise(id: string) {
    const prev = exercises;
    setExercises((cur) => cur.filter((e) => e.id !== id));
    const { error } = await supabase
      .from("workout_plan_exercises")
      .delete()
      .eq("id", id);
    if (error) setExercises(prev);
  }

  return (
    <div>
      {/* Selector de día */}
      <div className="mb-4 grid grid-cols-7 gap-1">
        {WEEK_ORDER.map((wd) => {
          const has = (exercises.some((e) => e.weekday === wd)) || days[wd]?.focus;
          return (
            <button
              key={wd}
              onClick={() => setActive(wd)}
              className={`flex flex-col items-center rounded-xl py-2 text-xs font-medium transition ${
                active === wd
                  ? "bg-emerald-500 text-neutral-950"
                  : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
              }`}
            >
              {WEEK_SHORT[wd]}
              <span
                className={`mt-1 h-1 w-1 rounded-full ${
                  has
                    ? active === wd
                      ? "bg-neutral-950"
                      : "bg-emerald-400"
                    : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-white">{WEEK_LONG[active]}</h2>
          <button
            onClick={() => upsertDay({ is_rest: !isRest })}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              isRest
                ? "bg-indigo-500/20 text-indigo-300"
                : "bg-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            {isRest ? "Día de descanso" : "Marcar descanso"}
          </button>
        </div>

        {!isRest && (
          <>
            <input
              defaultValue={currentDay?.focus ?? ""}
              onBlur={(e) => {
                if ((e.target.value || null) !== (currentDay?.focus ?? null))
                  upsertDay({ focus: e.target.value.trim() || null });
              }}
              placeholder="Enfoque del día (ej. Pierna A - Cuádriceps)"
              className="mb-4 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-500"
            />

            <div className="mb-3 space-y-2">
              {dayExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-900 p-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      defaultValue={ex.exercise_name}
                      onBlur={(e) => {
                        if (
                          e.target.value.trim() &&
                          e.target.value !== ex.exercise_name
                        )
                          updateExercise(ex.id, {
                            exercise_name: e.target.value.trim(),
                          });
                      }}
                      className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white outline-none"
                    />
                    <button
                      onClick={() => removeExercise(ex.id)}
                      className="shrink-0 rounded-lg p-1.5 text-neutral-500 transition hover:text-red-400"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                    <label className="flex items-center gap-1">
                      Series:
                      <input
                        type="number"
                        inputMode="numeric"
                        defaultValue={ex.target_sets ?? ""}
                        onBlur={(e) =>
                          updateExercise(ex.id, {
                            target_sets: e.target.value
                              ? parseInt(e.target.value, 10)
                              : null,
                          })
                        }
                        className="w-12 rounded bg-neutral-800 px-1.5 py-0.5 text-center text-neutral-200 outline-none"
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      Reps:
                      <input
                        defaultValue={ex.target_reps ?? ""}
                        onBlur={(e) =>
                          updateExercise(ex.id, {
                            target_reps: e.target.value.trim() || null,
                          })
                        }
                        placeholder="8-12"
                        className="w-16 rounded bg-neutral-800 px-1.5 py-0.5 text-center text-neutral-200 placeholder-neutral-600 outline-none"
                      />
                    </label>
                  </div>
                </div>
              ))}
              {dayExercises.length === 0 && (
                <p className="py-3 text-center text-sm text-neutral-500">
                  Sin ejercicios este día. Agrega abajo.
                </p>
              )}
            </div>

            <form
              onSubmit={addExercise}
              className="space-y-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/30 p-2"
            >
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nuevo ejercicio"
                className="w-full bg-transparent px-1 text-sm text-white placeholder-neutral-600 outline-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={newSets}
                  onChange={(e) => setNewSets(e.target.value)}
                  placeholder="Series"
                  className="w-20 rounded-lg bg-neutral-800 px-2 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 outline-none"
                />
                <input
                  value={newReps}
                  onChange={(e) => setNewReps(e.target.value)}
                  placeholder="Reps (8-12)"
                  className="w-24 rounded-lg bg-neutral-800 px-2 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 outline-none"
                />
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="ml-auto flex items-center justify-center rounded-lg bg-emerald-500 p-2 text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </form>
          </>
        )}

        {isRest && (
          <p className="py-6 text-center text-sm text-neutral-400">
            Día de descanso. Sin ejercicios programados.
          </p>
        )}
      </section>
    </div>
  );
}
