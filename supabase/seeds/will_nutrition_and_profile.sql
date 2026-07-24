-- =============================================================
-- SEED PERSONAL (Will): Plan de nutrición desinflamatorio + Perfil
-- Requiere haber ejecutado antes: migrations/004_nutrition_and_profile.sql
-- Ejecutar en el SQL Editor de Supabase. Idempotente.
--
-- Actualiza las 5 comidas EN SITIO (por order_index) para no borrar
-- tu historial de cumplimiento (meal_logs).
-- =============================================================

do $$
declare v_user uuid;
begin
  select id into v_user from auth.users order by created_at asc limit 1;  -- ajusta si hay varios usuarios
  if v_user is null then
    raise exception 'No hay usuarios en auth.users';
  end if;

  -- ---------------------------------------------------------
  -- 1) Comidas (alimentos + propósito + horario)
  -- ---------------------------------------------------------
  update public.meals set
    name = 'Pre-Entreno', scheduled_time = '11:00', active = true,
    foods = E'50g Crema de arroz\n1 Huevo + 150g Claras\nCafé negro',
    purpose = 'Energía explosiva. Cero pesadez gástrica.'
    where user_id = v_user and order_index = 1;

  update public.meals set
    name = 'Post-Entreno', scheduled_time = '14:00', active = true,
    foods = E'200g Pollo o Carne magra\n300g Papa cocida (o 100g arroz)\nEnsalada (Tomate/Pepino)',
    purpose = 'Ventana anabólica. Salar generosamente.'
    where user_id = v_user and order_index = 2;

  update public.meals set
    name = 'Pre-Turno', scheduled_time = '16:30', active = true,
    foods = E'150g Carne molida o Pollo\n200g Papa cocida (o 70g arroz)\n15g Aceite de oliva',
    purpose = 'Energía sostenida.'
    where user_id = v_user and order_index = 3;

  update public.meals set
    name = 'Snack Turno', scheduled_time = '21:00', active = true,
    foods = E'150g Pollo o Atún\nExtra de vegetales frescos',
    purpose = 'Síntesis proteica constante.'
    where user_id = v_user and order_index = 4;

  update public.meals set
    name = 'Cierre', scheduled_time = '23:30', active = true,
    foods = E'30g Caseína en agua\n20g Almendras o Nueces',
    purpose = 'Reparación nocturna profunda.'
    where user_id = v_user and order_index = 5;

  -- ---------------------------------------------------------
  -- 2) Perfil / objetivo del ciclo (12 semanas desde 2026-07-20)
  -- ---------------------------------------------------------
  insert into public.user_profile
    (user_id, objective, priorities, cycle_weeks, cycle_start, notes)
  values
    (v_user,
     'Hipertrofia Magra (+5 kg)',
     'Pecho, Brazos y Cuello · Corrección Postural',
     12,
     date '2026-07-20',
     'Ciclo de 12 semanas: Semanas 1-11 sobrecarga progresiva, Semana 12 descarga.')
  on conflict (user_id) do update set
    objective   = excluded.objective,
    priorities  = excluded.priorities,
    cycle_weeks = excluded.cycle_weeks,
    cycle_start = excluded.cycle_start,
    notes       = excluded.notes;

end $$;
