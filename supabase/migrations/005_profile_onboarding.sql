-- =============================================================
-- Migración 005: Perfil ampliado + onboarding
-- Añade datos personales al perfil y una bandera para saber si el
-- usuario ya completó el proceso guiado de bienvenida.
-- Ejecutar en el SQL Editor de Supabase.
-- =============================================================

alter table public.user_profile
  add column if not exists first_name      text,
  add column if not exists last_name       text,
  add column if not exists age             int,
  add column if not exists weight_kg       numeric(5,2),
  add column if not exists height_cm       int,
  add column if not exists onboarding_done boolean not null default false;

-- Los usuarios existentes (ej. Will) ya conocen la app: no les mostramos
-- el onboarding. Se marca como completado si ya tienen un objetivo definido.
update public.user_profile
set onboarding_done = true
where objective is not null;
