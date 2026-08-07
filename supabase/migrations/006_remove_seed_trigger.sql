-- =============================================================
-- Migración 006: Quitar el seed automático de comidas/hábitos
-- Antes, cada usuario nuevo heredaba las comidas/hábitos del "Raido
-- Protocol" (los de Will) vía trigger. Ahora los usuarios arrancan
-- VACÍOS y el onboarding ofrece cargar la plantilla Raido si lo desean.
-- Ejecutar en el SQL Editor de Supabase.
-- =============================================================

drop trigger if exists trg_seed_user_defaults on auth.users;
drop function if exists public.seed_user_defaults();

notify pgrst, 'reload schema';
