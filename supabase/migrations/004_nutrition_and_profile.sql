-- =============================================================
-- Migración 004: Detalle nutricional + Perfil/Objetivo del usuario
-- Ejecutar en el SQL Editor de Supabase.
-- =============================================================

-- 1) Enriquecer las comidas con alimentos y propósito estratégico
alter table public.meals add column if not exists foods   text;
alter table public.meals add column if not exists purpose text;

-- 2) Perfil del usuario: objetivo y ciclo de entrenamiento
create table if not exists public.user_profile (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  objective   text,          -- ej. "Hipertrofia Magra (+5kg)"
  priorities  text,          -- ej. "Pecho, Brazos, Cuello"
  cycle_weeks int,           -- ej. 12
  cycle_start date,          -- inicio del ciclo (para calcular semana actual)
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_user_profile_updated on public.user_profile;
create trigger trg_user_profile_updated
  before update on public.user_profile
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.user_profile enable row level security;
drop policy if exists "own_profile" on public.user_profile;
create policy "own_profile" on public.user_profile for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
