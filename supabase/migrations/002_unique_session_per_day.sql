-- =============================================================
-- Migración 002: Una sola sesión de entrenamiento por día
-- Corrige el bug de sesiones duplicadas que dejaba ejercicios
-- "huérfanos" y no se mostraban al recargar.
-- Ejecutar en el SQL Editor de Supabase.
-- =============================================================

-- 1) Deduplicar: conservar, por usuario y fecha, la sesión con MÁS
--    ejercicios (y en empate, la más antigua). Las demás se borran
--    (sus ejercicios se eliminan en cascada).
with ranked as (
  select
    s.id,
    row_number() over (
      partition by s.user_id, s.session_date
      order by
        (select count(*) from public.session_exercises se where se.session_id = s.id) desc,
        s.created_at asc
    ) as rn
  from public.workout_sessions s
)
delete from public.workout_sessions
where id in (select id from ranked where rn > 1);

-- 2) Restricción única: máximo una sesión por usuario y día.
alter table public.workout_sessions
  drop constraint if exists uq_session_user_date;

alter table public.workout_sessions
  add constraint uq_session_user_date unique (user_id, session_date);
