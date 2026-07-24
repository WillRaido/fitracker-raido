export type Habit = {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  order_index: number;
  active: boolean;
  scheduled_time: string | null;
  created_at: string;
};

export type Meal = {
  id: string;
  user_id: string;
  name: string;
  order_index: number;
  active: boolean;
  scheduled_time: string | null;
  created_at: string;
};

/** Item editable de catálogo (comida o hábito). */
export type ManagedItem = {
  id: string;
  name: string;
  category?: string | null;
  scheduled_time: string | null;
  order_index: number;
  active: boolean;
};

export type DailyLog = {
  id: string;
  user_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
};

export type HabitLog = DailyLog & { habit_id: string };
export type MealLog = DailyLog & { meal_id: string };

/** Item normalizado para el checklist diario (hábitos o comidas). */
export type ChecklistItem = {
  id: string;
  name: string;
  category?: string | null;
  completed: boolean;
};

// ---------- Entrenamiento ----------
export type SetType = "warmup" | "effective";

export type ExerciseSet = {
  id: string;
  session_exercise_id: string;
  set_number: number;
  set_type: SetType;
  reps: number | null;
  weight_kg: number | null;
  rir: number | null;
  notes: string | null;
};

export type SessionExercise = {
  id: string;
  session_id: string;
  exercise_id: string | null;
  exercise_name: string;
  order_index: number;
  notes: string | null;
  exercise_sets: ExerciseSet[];
};

export type WorkoutSession = {
  id: string;
  user_id: string;
  workout_day_id: string | null;
  session_date: string;
  notes: string | null;
  created_at: string;
  session_exercises: SessionExercise[];
};
