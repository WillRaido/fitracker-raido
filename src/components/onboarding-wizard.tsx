"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";
import { bogotaDate } from "@/lib/date";
import { seedRaidoTemplate } from "@/lib/templates";
import {
  Dumbbell,
  UtensilsCrossed,
  Activity,
  Target,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  ClipboardList,
  FilePlus2,
  Check,
} from "lucide-react";

type Props = {
  userId: string;
  initial: UserProfile | null;
};

const TOTAL_STEPS = 5;

type TemplateChoice = "raido" | "empty";

export default function OnboardingWizard({ userId, initial }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState(initial?.first_name ?? "");
  const [lastName, setLastName] = useState(initial?.last_name ?? "");
  const [age, setAge] = useState(initial?.age?.toString() ?? "");
  const [weight, setWeight] = useState(initial?.weight_kg?.toString() ?? "");
  const [height, setHeight] = useState(initial?.height_cm?.toString() ?? "");
  const [objective, setObjective] = useState(initial?.objective ?? "");
  const [priorities, setPriorities] = useState(initial?.priorities ?? "");
  const [cycleWeeks, setCycleWeeks] = useState(
    initial?.cycle_weeks?.toString() ?? "8"
  );
  const [template, setTemplate] = useState<TemplateChoice | null>(null);

  function next() {
    setError("");
    if (step === 1 && !firstName.trim()) {
      setError("Cuéntanos tu nombre para personalizar tu experiencia.");
      return;
    }
    if (step === 3 && !template) {
      setError("Elige cómo quieres empezar.");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function finish() {
    setSaving(true);
    setError("");
    try {
      const supabase = createClient();

      // Carga opcional de la plantilla Raido (comidas, hábitos y plan).
      if (template === "raido") {
        await seedRaidoTemplate(supabase, userId);
      }

      const { error: dbError } = await supabase.from("user_profile").upsert({
        user_id: userId,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        age: age ? parseInt(age, 10) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        height_cm: height ? parseInt(height, 10) : null,
        objective: objective.trim() || null,
        priorities: priorities.trim() || null,
        cycle_weeks: cycleWeeks ? parseInt(cycleWeeks, 10) : null,
        cycle_start: bogotaDate(),
        onboarding_done: true,
      });

      if (dbError) {
        setError(dbError.message);
        setSaving(false);
        return;
      }

      router.refresh();
      router.push("/inicio");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar tu perfil."
      );
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-neutral-800 bg-neutral-900 py-3 px-4 text-white placeholder-neutral-600 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";
  const labelCls = "mb-2 block text-sm font-medium text-neutral-300";

  return (
    <main className="flex min-h-[100dvh] flex-col px-6 pb-10 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Progreso */}
        <div className="mb-8 flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition ${
                i <= step ? "bg-emerald-500" : "bg-neutral-800"
              }`}
            />
          ))}
        </div>

        <div className="flex-1">
          {step === 0 && (
            <div className="flex flex-col">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                <Sparkles className="h-7 w-7" />
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                ¡Bienvenido a Fitracker!
              </h1>
              <p className="mt-3 text-neutral-400">
                Tu compañero para seguir tu progreso día a día. En 1 minuto
                configuramos tu perfil. Esto es lo que podrás gestionar:
              </p>
              <div className="mt-6 space-y-3">
                {[
                  {
                    icon: Dumbbell,
                    title: "Entrenamiento",
                    desc: "Registra tus series, pesos y repeticiones.",
                  },
                  {
                    icon: UtensilsCrossed,
                    title: "Nutrición",
                    desc: "Sigue tu meal prep y tus comidas del día.",
                  },
                  {
                    icon: Activity,
                    title: "Hábitos y postura",
                    desc: "Movilidad, cuello, hidratación y más.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-emerald-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="text-xs text-neutral-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Cuéntanos sobre ti
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                Usaremos estos datos para personalizar tu experiencia.
              </p>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Nombre</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Will"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Apellido</label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Quintero"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Edad</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="30"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Peso (kg)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="75"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Altura (cm)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="175"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                <Target className="h-6 w-6" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Tu objetivo
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                ¿Qué quieres lograr en este ciclo? (opcional, puedes cambiarlo
                luego)
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className={labelCls}>Objetivo del ciclo</label>
                  <input
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Ej. Ganar masa muscular"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Prioridades</label>
                  <input
                    value={priorities}
                    onChange={(e) => setPriorities(e.target.value)}
                    placeholder="Ej. Pierna y espalda"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Duración del ciclo (semanas)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={cycleWeeks}
                    onChange={(e) => setCycleWeeks(e.target.value)}
                    placeholder="8"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                ¿Cómo quieres empezar?
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                Puedes cargar una plantilla lista o empezar desde cero. Todo es
                editable después en Ajustes y en tu plan.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  {
                    key: "raido" as const,
                    icon: ClipboardList,
                    title: "Plantilla Raido",
                    desc: "Comidas, hábitos posturales y un plan de 5 días listos para usar.",
                  },
                  {
                    key: "empty" as const,
                    icon: FilePlus2,
                    title: "Empezar vacío",
                    desc: "Sin datos precargados. Tú agregas tus comidas, hábitos y plan.",
                  },
                ].map(({ key, icon: Icon, title, desc }) => {
                  const selected = template === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setError("");
                        setTemplate(key);
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          selected
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-neutral-800 text-neutral-300"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">{title}</p>
                        <p className="text-xs text-neutral-500">{desc}</p>
                      </div>
                      {selected && (
                        <Check className="h-5 w-5 shrink-0 text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center text-center">
              <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <Sparkles className="h-8 w-8" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                ¡Todo listo{firstName ? `, ${firstName}` : ""}!
              </h1>
              <p className="mt-2 text-neutral-400">
                {template === "raido"
                  ? "Cargaremos tu plantilla Raido con comidas, hábitos y plan. Puedes personalizarlos cuando quieras en Ajustes."
                  : "Tu cuenta empezará vacía. Agrega tus comidas, hábitos y plan desde Ajustes y la sección de entrenamiento."}
              </p>
              <p className="mt-4 text-sm text-neutral-500">
                Marca cada tarea del día para ver crecer tu progreso y tu racha.
              </p>
            </div>
          )}
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}

        {/* Navegación */}
        <div className="mt-8 flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={back}
              disabled={saving}
              className="flex items-center gap-1 rounded-xl border border-neutral-800 px-4 py-3 font-medium text-neutral-300 transition hover:bg-neutral-900 disabled:opacity-60"
            >
              <ChevronLeft className="h-5 w-5" />
              Atrás
            </button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={next}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-500 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400"
            >
              Continuar
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Ir a mi inicio"
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
