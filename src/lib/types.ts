export type Habit = {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  order_index: number;
  active: boolean;
  created_at: string;
};

export type Meal = {
  id: string;
  user_id: string;
  name: string;
  order_index: number;
  active: boolean;
  created_at: string;
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
