-- =============================================================
-- Migración 001: Horarios en comidas y hábitos
-- Necesario para el módulo de edición y las notificaciones.
-- Ejecutar en el SQL Editor de Supabase.
-- =============================================================

alter table public.meals
  add column if not exists scheduled_time time;

alter table public.habits
  add column if not exists scheduled_time time;

-- Horarios por defecto según el Raido Protocol (comidas)
update public.meals set scheduled_time = '11:00' where name = 'Pre-Entreno'    and scheduled_time is null;
update public.meals set scheduled_time = '14:00' where name = 'Post-Entreno'   and scheduled_time is null;
update public.meals set scheduled_time = '16:30' where name = 'Pre-Turno'      and scheduled_time is null;
update public.meals set scheduled_time = '21:00' where name = 'Snack Nocturno' and scheduled_time is null;
update public.meals set scheduled_time = '23:30' where name = 'Caseína'        and scheduled_time is null;
