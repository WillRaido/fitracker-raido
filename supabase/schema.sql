-- =============================================================
-- RAIDO TRACKER - Esquema de Base de Datos (Supabase / PostgreSQL)
-- =============================================================
-- Ejecutar este script completo en el SQL Editor de Supabase.
-- Incluye: tablas, relaciones, seeds base, RLS y triggers.
-- =============================================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";

-- =============================================================
-- 0. HELPER: updated_at automático
-- =============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================
-- MÓDULO 1: ENTRENAMIENTO (5 días)
-- =============================================================

-- 1.1 Catálogo de ejercicios (biblioteca reutilizable)
create table if not exists public.exercises (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  muscle_group text,                 -- ej: Pecho, Espalda, Pierna
  created_at  timestamptz not null default now()
);

-- 1.2 Rutinas / plantillas de día (Día 1..5)
create table if not exists public.workout_days (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  day_number  int not null check (day_number between 1 and 7),
  title       text not null,          -- ej: "Día 1 - Empuje"
  created_at  timestamptz not null default now(),
  unique (user_id, day_number)
);

-- 1.3 Sesión de entrenamiento (una fecha concreta que se entrena)
create table if not exists public.workout_sessions (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  workout_day_id uuid references public.workout_days(id) on delete set null,
  session_date   date not null default current_date,
  notes          text,               -- notas generales de la sesión
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 1.4 Ejercicios realizados dentro de una sesión
create table if not exists public.session_exercises (
  id           uuid primary key default uuid_generate_v4(),
  session_id   uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id  uuid references public.exercises(id) on delete set null,
  exercise_name text not null,        -- snapshot del nombre por si se borra el catálogo
  order_index  int not null default 0,
  notes        text                   -- mareos, calambres, sensaciones
);

-- 1.5 Series (aproximación / efectivas) por ejercicio
create table if not exists public.exercise_sets (
  id                  uuid primary key default uuid_generate_v4(),
  session_exercise_id uuid not null references public.session_exercises(id) on delete cascade,
  set_number          int not null,
  set_type            text not null default 'effective'
                        check (set_type in ('warmup','effective')), -- aproximación vs efectiva
  reps                int,
  weight_kg           numeric(6,2),
  rir                 int,            -- reps in reserve (opcional)
  notes               text
);

-- =============================================================
-- MÓDULO 2: NUTRICIÓN (5 comidas - Meal Prep diario)
-- =============================================================

-- 2.1 Catálogo de comidas del meal prep (con defaults)
create table if not exists public.meals (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,          -- Pre-Entreno, Post-Entreno, etc.
  order_index    int not null default 0,
  active         boolean not null default true,
  scheduled_time time,                    -- horario para recordatorios
  created_at     timestamptz not null default now()
);

-- 2.2 Registro diario: ¿comida preparada/consumida? (checkbox)
create table if not exists public.meal_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  meal_id    uuid not null references public.meals(id) on delete cascade,
  log_date   date not null default current_date,
  completed  boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, meal_id, log_date)
);

-- =============================================================
-- MÓDULO 3: HÁBITOS Y POSTURA (checkboxes diarios)
-- =============================================================

-- 3.1 Catálogo de hábitos (con defaults)
create table if not exists public.habits (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,          -- Chin Tucks, Isométricos de cuello, etc.
  category       text,                   -- Movilidad, Postura, Hidratación
  order_index    int not null default 0,
  active         boolean not null default true,
  scheduled_time time,                    -- horario para recordatorios
  created_at     timestamptz not null default now()
);

-- 3.2 Registro diario de hábitos (checkbox)
create table if not exists public.habit_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  habit_id   uuid not null references public.habits(id) on delete cascade,
  log_date   date not null default current_date,
  completed  boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, habit_id, log_date)
);

-- =============================================================
-- TRIGGERS updated_at
-- =============================================================
drop trigger if exists trg_workout_sessions_updated on public.workout_sessions;
create trigger trg_workout_sessions_updated
  before update on public.workout_sessions
  for each row execute function public.handle_updated_at();

-- =============================================================
-- ÍNDICES para consultas por fecha/usuario
-- =============================================================
create index if not exists idx_meal_logs_user_date   on public.meal_logs(user_id, log_date);
create index if not exists idx_habit_logs_user_date  on public.habit_logs(user_id, log_date);
create index if not exists idx_sessions_user_date     on public.workout_sessions(user_id, session_date);

-- =============================================================
-- ROW LEVEL SECURITY (cada usuario solo ve lo suyo)
-- =============================================================
alter table public.exercises          enable row level security;
alter table public.workout_days       enable row level security;
alter table public.workout_sessions   enable row level security;
alter table public.session_exercises  enable row level security;
alter table public.exercise_sets      enable row level security;
alter table public.meals              enable row level security;
alter table public.meal_logs          enable row level security;
alter table public.habits             enable row level security;
alter table public.habit_logs         enable row level security;

-- Políticas para tablas con user_id directo
create policy "own_exercises"        on public.exercises        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_workout_days"     on public.workout_days     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_workout_sessions" on public.workout_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_meals"            on public.meals            for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_meal_logs"        on public.meal_logs        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_habits"           on public.habits           for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_habit_logs"       on public.habit_logs       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Políticas para tablas hijas (se validan vía la sesión padre)
create policy "own_session_exercises" on public.session_exercises for all
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy "own_exercise_sets" on public.exercise_sets for all
  using (exists (
    select 1 from public.session_exercises se
    join public.workout_sessions s on s.id = se.session_id
    where se.id = session_exercise_id and s.user_id = auth.uid()))
  with check (exists (
    select 1 from public.session_exercises se
    join public.workout_sessions s on s.id = se.session_id
    where se.id = session_exercise_id and s.user_id = auth.uid()));

-- =============================================================
-- SEED AUTOMÁTICO: crea comidas y hábitos por defecto al registrarse
-- =============================================================
create or replace function public.seed_user_defaults()
returns trigger as $$
begin
  -- 5 comidas por defecto (con horarios del Raido Protocol)
  insert into public.meals (user_id, name, order_index, scheduled_time) values
    (new.id, 'Pre-Entreno',    1, '11:00'),
    (new.id, 'Post-Entreno',   2, '14:00'),
    (new.id, 'Pre-Turno',      3, '16:30'),
    (new.id, 'Snack Nocturno', 4, '21:00'),
    (new.id, 'Caseína',        5, '23:30');

  -- Hábitos y postura por defecto
  insert into public.habits (user_id, name, category, order_index, scheduled_time) values
    (new.id, 'Movilidad pre-entreno',           'Movilidad',   1, '10:45'),
    (new.id, 'Chin Tucks (retracción cervical)','Postura',     2, '19:30'),
    (new.id, 'Isométricos de cuello',           'Postura',     3, '19:30'),
    (new.id, 'Estiramiento de Psoas (Caballero)','Movilidad',  4, '23:30'),
    (new.id, 'Ingesta de agua/sal',             'Hidratación', 5, null);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_seed_user_defaults on auth.users;
create trigger trg_seed_user_defaults
  after insert on auth.users
  for each row execute function public.seed_user_defaults();
