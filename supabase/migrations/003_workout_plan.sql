-- =============================================================
-- Migración 003: Plan semanal de entrenamiento (por usuario)
-- Define, para cada día de la semana, un enfoque y sus ejercicios
-- objetivo. El registro diario se genera a partir de este plan.
-- weekday: 0=Domingo .. 6=Sábado (igual que bogotaWeekday()).
-- Ejecutar en el SQL Editor de Supabase.
-- =============================================================

-- Enfoque por día de la semana (ej. "Pierna A", "Descanso")
create table if not exists public.workout_plan_days (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  weekday    int  not null check (weekday between 0 and 6),
  focus      text,
  is_rest    boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, weekday)
);

-- Ejercicios planificados para cada día de la semana
create table if not exists public.workout_plan_exercises (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  weekday       int  not null check (weekday between 0 and 6),
  exercise_name text not null,
  order_index   int  not null default 0,
  target_sets   int,
  target_reps   text,          -- ej. "8-12"
  notes         text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_plan_exercises_user_weekday
  on public.workout_plan_exercises(user_id, weekday);

-- RLS
alter table public.workout_plan_days      enable row level security;
alter table public.workout_plan_exercises enable row level security;

drop policy if exists "own_plan_days" on public.workout_plan_days;
create policy "own_plan_days" on public.workout_plan_days for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_plan_exercises" on public.workout_plan_exercises;
create policy "own_plan_exercises" on public.workout_plan_exercises for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
