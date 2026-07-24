"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  WorkoutSession,
  SessionExercise,
  ExerciseSet,
  SetType,
} from "@/lib/types";
import { Plus, Trash2, Dumbbell, StickyNote } from "lucide-react";

type Props = {
  initialSession: WorkoutSession | null;
  userId: string;
  logDate: string;
  suggestedTitle: string;
};

export default function WorkoutLogger({
  initialSession,
  userId,
  logDate,
  suggestedTitle,
}: Props) {
  const supabase = createClient();
  const [session, setSession] = useState<WorkoutSession | null>(initialSession);
  const [exercises, setExercises] = useState<SessionExercise[]>(
    initialSession?.session_exercises?.sort(
      (a, b) => a.order_index - b.order_index
    ) ?? []
  );
  const [newExercise, setNewExercise] = useState("");
  const [busy, setBusy] = useState(false);

  async function startSession() {
    setBusy(true);
    const { data, error } = await supabase
      .from("workout_sessions")
      .insert({ user_id: userId, session_date: logDate })
      .select("*")
      .single();
    setBusy(false);
    if (!error && data) {
      setSession({ ...data, session_exercises: [] } as WorkoutSession);
    }
  }

  async function addExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!newExercise.trim() || !session) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("session_exercises")
      .insert({
        session_id: session.id,
        exercise_name: newExercise.trim(),
        order_index: exercises.length,
      })
      .select("*")
      .single();
    setBusy(false);
    if (!error && data) {
      setExercises((prev) => [...prev, { ...data, exercise_sets: [] }]);
      setNewExercise("");
    }
  }

  async function deleteExercise(id: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
    await supabase.from("session_exercises").delete().eq("id", id);
  }

  async function saveExerciseNotes(id: string, notes: string) {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, notes } : ex))
    );
    await supabase.from("session_exercises").update({ notes }).eq("id", id);
  }

  async function addSet(
    exerciseId: string,
    payload: Omit<ExerciseSet, "id" | "session_exercise_id" | "set_number">
  ) {
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    const set_number = ex.exercise_sets.length + 1;
    const { data, error } = await supabase
      .from("exercise_sets")
      .insert({
        session_exercise_id: exerciseId,
        set_number,
        ...payload,
      })
      .select("*")
      .single();
    if (!error && data) {
      setExercises((prev) =>
        prev.map((e) =>
          e.id === exerciseId
            ? { ...e, exercise_sets: [...e.exercise_sets, data as ExerciseSet] }
            : e
        )
      );
    }
  }

  async function deleteSet(exerciseId: string, setId: string) {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId
          ? {
              ...e,
              exercise_sets: e.exercise_sets.filter((s) => s.id !== setId),
            }
          : e
      )
    );
    await supabase.from("exercise_sets").delete().eq("id", setId);
  }

  if (!session) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 text-center">
        <Dumbbell className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">{suggestedTitle}</h2>
        <p className="mt-1 text-sm text-neutral-400">
          No has registrado el entrenamiento de hoy.
        </p>
        <button
          onClick={startSession}
          disabled={busy}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-60"
        >
          <Plus className="h-5 w-5" />
          Iniciar entrenamiento
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exercises.map((ex) => (
        <ExerciseCard
          key={ex.id}
          exercise={ex}
          onDelete={() => deleteExercise(ex.id)}
          onSaveNotes={(notes) => saveExerciseNotes(ex.id, notes)}
          onAddSet={(payload) => addSet(ex.id, payload)}
          onDeleteSet={(setId) => deleteSet(ex.id, setId)}
        />
      ))}

      <form
        onSubmit={addExercise}
        className="flex gap-2 rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/30 p-3"
      >
        <input
          value={newExercise}
          onChange={(e) => setNewExercise(e.target.value)}
          placeholder="Añadir ejercicio (ej. Sentadilla)"
          className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={busy || !newExercise.trim()}
          className="flex items-center justify-center rounded-xl bg-emerald-500 px-4 text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

// ---------------- Exercise Card ----------------
function ExerciseCard({
  exercise,
  onDelete,
  onSaveNotes,
  onAddSet,
  onDeleteSet,
}: {
  exercise: SessionExercise;
  onDelete: () => void;
  onSaveNotes: (notes: string) => void;
  onAddSet: (
    p: Omit<ExerciseSet, "id" | "session_exercise_id" | "set_number">
  ) => void;
  onDeleteSet: (setId: string) => void;
}) {
  const [setType, setSetType] = useState<SetType>("effective");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [showNotes, setShowNotes] = useState(!!exercise.notes);

  function submitSet(e: React.FormEvent) {
    e.preventDefault();
    onAddSet({
      set_type: setType,
      reps: reps ? parseInt(reps, 10) : null,
      weight_kg: weight ? parseFloat(weight) : null,
      rir: null,
      notes: null,
    });
    setReps("");
    setWeight("");
  }

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-white">{exercise.exercise_name}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNotes((s) => !s)}
            className={`rounded-lg p-2 transition ${
              showNotes ? "text-emerald-400" : "text-neutral-500"
            } hover:text-white`}
            aria-label="Notas"
          >
            <StickyNote className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-neutral-500 transition hover:text-red-400"
            aria-label="Eliminar ejercicio"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {showNotes && (
        <textarea
          defaultValue={exercise.notes ?? ""}
          onBlur={(e) => onSaveNotes(e.target.value)}
          placeholder="Notas: mareos, calambres, sensaciones..."
          rows={2}
          className="mb-3 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-emerald-500"
        />
      )}

      {/* Sets */}
      {exercise.exercise_sets.length > 0 && (
        <div className="mb-3 space-y-1">
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 px-1 text-[11px] uppercase tracking-wide text-neutral-500">
            <span>Tipo</span>
            <span>Reps</span>
            <span>Peso (kg)</span>
            <span></span>
          </div>
          {exercise.exercise_sets
            .sort((a, b) => a.set_number - b.set_number)
            .map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 rounded-lg bg-neutral-800/40 px-2 py-2 text-sm"
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
                <span className="tabular-nums text-neutral-100">
                  {s.reps ?? "—"}
                </span>
                <span className="tabular-nums text-neutral-100">
                  {s.weight_kg ?? "—"}
                </span>
                <button
                  onClick={() => onDeleteSet(s.id)}
                  className="text-neutral-600 transition hover:text-red-400"
                  aria-label="Eliminar serie"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Add set form */}
      <form onSubmit={submitSet} className="flex items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-neutral-700">
          <button
            type="button"
            onClick={() => setSetType("warmup")}
            className={`px-2.5 py-2 text-xs font-semibold transition ${
              setType === "warmup"
                ? "bg-amber-500 text-neutral-950"
                : "bg-neutral-900 text-neutral-400"
            }`}
          >
            SA
          </button>
          <button
            type="button"
            onClick={() => setSetType("effective")}
            className={`px-2.5 py-2 text-xs font-semibold transition ${
              setType === "effective"
                ? "bg-emerald-500 text-neutral-950"
                : "bg-neutral-900 text-neutral-400"
            }`}
          >
            SE
          </button>
        </div>
        <input
          type="number"
          inputMode="numeric"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="Reps"
          className="w-full min-w-0 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-500"
        />
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Kg"
          className="w-full min-w-0 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-neutral-950 transition hover:bg-emerald-400"
          aria-label="Añadir serie"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
