import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Plantilla "Raido Protocol": datos base opcionales que un usuario nuevo
 * puede cargar durante el onboarding. Se insertan desde el cliente con la
 * sesión del propio usuario (RLS: auth.uid() = user_id).
 */

export type TemplateMeal = {
  name: string;
  order_index: number;
  scheduled_time: string | null;
  foods?: string | null;
  purpose?: string | null;
};

export type TemplateHabit = {
  name: string;
  category: string;
  order_index: number;
  scheduled_time: string | null;
};

export type TemplatePlanDay = {
  weekday: number; // 0=Dom..6=Sab
  focus: string | null;
  is_rest: boolean;
};

export type TemplatePlanExercise = {
  weekday: number;
  exercise_name: string;
  order_index: number;
  target_sets: number | null;
  target_reps: string | null;
};

export const RAIDO_MEALS: TemplateMeal[] = [
  {
    name: "Pre-Entreno",
    order_index: 1,
    scheduled_time: "11:00",
    foods: "50g crema de arroz · 1 huevo + 150g claras · café negro",
    purpose: "Energía explosiva de rápida digestión.",
  },
  {
    name: "Post-Entreno",
    order_index: 2,
    scheduled_time: "14:00",
    foods: "200g pollo o carne magra · 300g papa (o 100g arroz) · ensalada",
    purpose: "Ventana anabólica. Salar para reponer electrolitos.",
  },
  {
    name: "Pre-Turno",
    order_index: 3,
    scheduled_time: "16:30",
    foods: "150g carne molida o pollo · 200g papa (o 70g arroz) · 15g aceite de oliva",
    purpose: "Energía sostenida para iniciar la jornada.",
  },
  {
    name: "Snack Nocturno",
    order_index: 4,
    scheduled_time: "21:00",
    foods: "150g pechuga o atún · vegetales frescos",
    purpose: "Síntesis proteica sin cargar carbohidratos.",
  },
  {
    name: "Caseína",
    order_index: 5,
    scheduled_time: "23:30",
    foods: "30g (1 scoop) caseína en agua · 20g almendras o nueces",
    purpose: "Liberación lenta de aminoácidos nocturna.",
  },
];

export const RAIDO_HABITS: TemplateHabit[] = [
  { name: "Movilidad pre-entreno", category: "Movilidad", order_index: 1, scheduled_time: "10:45" },
  { name: "Chin Tucks (retracción cervical)", category: "Postura", order_index: 2, scheduled_time: "19:30" },
  { name: "Isométricos de cuello", category: "Postura", order_index: 3, scheduled_time: "19:30" },
  { name: "Estiramiento de Psoas (Caballero)", category: "Movilidad", order_index: 4, scheduled_time: "23:30" },
  { name: "Ingesta de agua/sal", category: "Hidratación", order_index: 5, scheduled_time: null },
];

export const RAIDO_PLAN_DAYS: TemplatePlanDay[] = [
  { weekday: 1, focus: "Pierna A (Cuádriceps)", is_rest: false },
  { weekday: 2, focus: "Empuje (Pecho, Hombro, Tríceps)", is_rest: false },
  { weekday: 3, focus: "Descanso activo", is_rest: true },
  { weekday: 4, focus: "Tirón (Espalda, Bíceps)", is_rest: false },
  { weekday: 5, focus: "Pierna B (Isquios, Glúteo)", is_rest: false },
  { weekday: 6, focus: "Torso (Bombeo)", is_rest: false },
  { weekday: 0, focus: "Descanso total", is_rest: true },
];

export const RAIDO_PLAN_EXERCISES: TemplatePlanExercise[] = [
  // Día 1 · Pierna A
  { weekday: 1, exercise_name: "Sentadilla Libre", order_index: 0, target_sets: 5, target_reps: "6-8" },
  { weekday: 1, exercise_name: "Sentadilla Búlgara", order_index: 1, target_sets: 4, target_reps: "8-10" },
  { weekday: 1, exercise_name: "Prensa de Piernas", order_index: 2, target_sets: 4, target_reps: "10-12" },
  { weekday: 1, exercise_name: "Leg Extension", order_index: 3, target_sets: 3, target_reps: "12-15" },
  { weekday: 1, exercise_name: "Aductores Máquina", order_index: 4, target_sets: 3, target_reps: "15" },
  { weekday: 1, exercise_name: "Elevación de Talones (de pie)", order_index: 5, target_sets: 4, target_reps: "15-20" },
  // Día 2 · Empuje
  { weekday: 2, exercise_name: "Press Banca Plano", order_index: 0, target_sets: 5, target_reps: "6-8" },
  { weekday: 2, exercise_name: "Press Inclinado (Mancuernas)", order_index: 1, target_sets: 4, target_reps: "8-12" },
  { weekday: 2, exercise_name: "Cruces en Polea Alta", order_index: 2, target_sets: 3, target_reps: "12-15" },
  { weekday: 2, exercise_name: "Elevaciones Laterales", order_index: 3, target_sets: 4, target_reps: "12-15" },
  { weekday: 2, exercise_name: "Extensión de Tríceps (Polea)", order_index: 4, target_sets: 4, target_reps: "10-15" },
  // Día 4 · Tirón
  { weekday: 4, exercise_name: "Jalón al Pecho", order_index: 0, target_sets: 5, target_reps: "8-10" },
  { weekday: 4, exercise_name: "Remo con Barra", order_index: 1, target_sets: 4, target_reps: "8-12" },
  { weekday: 4, exercise_name: "Face Pulls", order_index: 2, target_sets: 4, target_reps: "12-15" },
  { weekday: 4, exercise_name: "Curl Bíceps Barra", order_index: 3, target_sets: 4, target_reps: "10-12" },
  { weekday: 4, exercise_name: "Curl Martillo", order_index: 4, target_sets: 3, target_reps: "10-12" },
  // Día 5 · Pierna B
  { weekday: 5, exercise_name: "Peso Muerto Rumano", order_index: 0, target_sets: 5, target_reps: "8-10" },
  { weekday: 5, exercise_name: "Prensa Inclinada", order_index: 1, target_sets: 4, target_reps: "10-12" },
  { weekday: 5, exercise_name: "Curl Femoral", order_index: 2, target_sets: 4, target_reps: "12-15" },
  { weekday: 5, exercise_name: "Elevación de Talones (sentado)", order_index: 3, target_sets: 4, target_reps: "12-15" },
  // Día 6 · Torso
  { weekday: 6, exercise_name: "Press Pecho en Máquina", order_index: 0, target_sets: 3, target_reps: "12-15" },
  { weekday: 6, exercise_name: "Remo Gironda (Polea Baja)", order_index: 1, target_sets: 3, target_reps: "12-15" },
  { weekday: 6, exercise_name: "Elevaciones Laterales en Polea", order_index: 2, target_sets: 3, target_reps: "12-15" },
  { weekday: 6, exercise_name: "Extensión de Tríceps Copa", order_index: 3, target_sets: 3, target_reps: "12-15" },
];

/** Inserta la plantilla Raido para un usuario. Lanza si algo falla. */
export async function seedRaidoTemplate(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const results = await Promise.all([
    supabase
      .from("meals")
      .insert(RAIDO_MEALS.map((m) => ({ ...m, user_id: userId }))),
    supabase
      .from("habits")
      .insert(RAIDO_HABITS.map((h) => ({ ...h, user_id: userId }))),
    supabase
      .from("workout_plan_days")
      .insert(RAIDO_PLAN_DAYS.map((d) => ({ ...d, user_id: userId }))),
    supabase
      .from("workout_plan_exercises")
      .insert(RAIDO_PLAN_EXERCISES.map((e) => ({ ...e, user_id: userId }))),
  ]);

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    throw new Error(failed.error.message);
  }
}
