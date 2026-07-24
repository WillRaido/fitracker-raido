-- =============================================================
-- SEED PERSONAL (Will): Plan de entrenamiento de 5 días +
-- registro de la primera semana (2026-07-20 a 2026-07-24).
--
-- Ejecutar en el SQL Editor de Supabase. Es IDEMPOTENTE:
-- borra y recrea el plan y las sesiones de esa semana para el
-- usuario, así puedes correrlo varias veces sin duplicar.
--
-- Por defecto usa el PRIMER usuario registrado (tú). Si más
-- adelante hay varios usuarios, reemplaza la línea marcada
-- por: select id into v_user from auth.users where email = 'tu@correo';
-- =============================================================

-- Helper temporal para registrar una serie efectiva por nombre de ejercicio
create or replace function public.log_set(
  p_user uuid, p_date date, p_exercise text,
  p_weight numeric, p_reps int, p_note text
) returns void as $fn$
declare v_se uuid; v_n int;
begin
  select se.id into v_se
  from public.session_exercises se
  join public.workout_sessions ws on ws.id = se.session_id
  where ws.user_id = p_user and ws.session_date = p_date
    and se.exercise_name = p_exercise
  limit 1;
  if v_se is null then return; end if;
  select coalesce(max(set_number), 0) + 1 into v_n
  from public.exercise_sets where session_exercise_id = v_se;
  insert into public.exercise_sets
    (session_exercise_id, set_number, set_type, reps, weight_kg, notes)
  values (v_se, v_n, 'effective', p_reps, p_weight, p_note);
end;
$fn$ language plpgsql;

do $$
declare
  v_user uuid;
begin
  select id into v_user from auth.users order by created_at asc limit 1;  -- <-- ajusta si hay varios usuarios
  if v_user is null then
    raise exception 'No hay usuarios en auth.users';
  end if;

  -- ---------------------------------------------------------
  -- 1) LIMPIAR plan y sesiones de la semana (idempotencia)
  -- ---------------------------------------------------------
  delete from public.workout_plan_exercises where user_id = v_user;
  delete from public.workout_plan_days      where user_id = v_user;
  delete from public.workout_sessions
    where user_id = v_user and session_date between date '2026-07-20' and date '2026-07-24';

  -- ---------------------------------------------------------
  -- 2) ENFOQUE POR DÍA (0=Dom..6=Sab)
  -- ---------------------------------------------------------
  insert into public.workout_plan_days (user_id, weekday, focus, is_rest) values
    (v_user, 1, 'Pierna A (Cuádriceps)',                  false),
    (v_user, 2, 'Empuje (Pecho y Tríceps)',               false),
    (v_user, 3, 'Descanso Activo (Caminata 30 min + Estiramientos)', true),
    (v_user, 4, 'Tirón (Espalda, Bíceps y Cuello)',       false),
    (v_user, 5, 'Pierna B (Isquios y Pantorrilla)',       false),
    (v_user, 6, 'Especialización Torso (Pecho, Brazos y Postura)', false),
    (v_user, 0, 'Descanso Total (Meal Prep)',             true);

  -- ---------------------------------------------------------
  -- 3) EJERCICIOS DEL PLAN (target_sets = SA+SE total)
  -- ---------------------------------------------------------
  insert into public.workout_plan_exercises
    (user_id, weekday, exercise_name, order_index, target_sets, target_reps, notes) values
    -- Día 1 (Lunes) - Pierna A
    (v_user, 1, 'Sentadilla Libre',        0, 5, '6-8',           '2 SA / 3 SE · Desc 3 min · Control excéntrico'),
    (v_user, 1, 'Sentadilla Búlgara',      1, 4, '8-10 x pierna', '1 SA / 3 SE · Desc 2 min'),
    (v_user, 1, 'Prensa (Pies bajos)',     2, 4, '10-12',         '1 SA / 3 SE · Desc 2 min'),
    (v_user, 1, 'Leg Extension',           3, 3, '12-15',         '3 SE · Desc 90 seg'),
    (v_user, 1, 'Aductores Máquina',       4, 3, '15',            '3 SE · Desc 60 seg'),

    -- Día 2 (Martes) - Empuje
    (v_user, 2, 'Press Banca Plano',       0, 5, '6-8',   '2 SA / 3 SE · Desc 2.5 min · Control excéntrico'),
    (v_user, 2, 'Press Inclinado (Manc.)', 1, 4, '8-12',  '1 SA / 3 SE · Desc 2 min · Ángulo 30-45°'),
    (v_user, 2, 'Cruces Polea Alta',       2, 4, '12-15', '4 SE · Desc 90 seg · Máxima contracción'),
    (v_user, 2, 'Elevaciones Laterales',   3, 4, '12-15', '4 SE · Desc 90 seg · Cero balanceo'),
    (v_user, 2, 'Extensión Tríceps Polea', 4, 4, '10-12', '1 SA / 3 SE · Desc 90 seg · Agarre recto o cuerda'),
    (v_user, 2, 'Copa Tríceps (Sobre cabeza)', 5, 3, '10-15', '3 SE · Desc 90 seg · Cabeza larga del tríceps'),

    -- Día 4 (Jueves) - Tirón
    (v_user, 4, 'Jalón al Pecho',          0, 5, '8-10',  '2 SA / 3 SE · Desc 2 min · Agarre prono'),
    (v_user, 4, 'Remo con Barra',          1, 4, '8-12',  '1 SA / 3 SE · Desc 2 min · Torso a 45°'),
    (v_user, 4, 'Curl Bíceps Barra',       2, 5, '8-10',  '1 SA / 4 SE · Desc 90 seg · Carga pesada, codos fijos'),
    (v_user, 4, 'Curl Martillo Manc.',     3, 3, '10-12', '3 SE · Desc 90 seg · Enfoque braquial'),
    (v_user, 4, 'Extensión Cuello (Disco)',4, 4, '15-20', '1 SA / 3 SE · Desc 60 seg · Boca abajo, disco en nuca'),
    (v_user, 4, 'Flexión Cuello (Disco)',  5, 3, '15-20', '3 SE · Desc 60 seg · Boca arriba, disco en frente (toalla)'),

    -- Día 5 (Viernes) - Pierna B
    (v_user, 5, 'Peso Muerto Rumano',      0, 5, '8-10',  '2 SA / 3 SE · Desc 3 min'),
    (v_user, 5, 'Prensa (Pies altos)',     1, 4, '10-12', '1 SA / 3 SE · Desc 2 min'),
    (v_user, 5, 'Curl Femoral',            2, 4, '12-15', '4 SE · Desc 90 seg'),
    (v_user, 5, 'Elevación Talones (Pie)', 3, 5, '15-20', '1 SA / 4 SE · Desc 60 seg'),
    (v_user, 5, 'Elevación Talones (Sentado)', 4, 3, '12-15', '3 SE · Desc 60 seg'),

    -- Día 6 (Sábado) - Especialización Torso
    (v_user, 6, 'Press Inclinado Máquina', 0, 5, '10-12', '1 SA / 4 SE · Desc 90 seg · Pecho superior'),
    (v_user, 6, 'Pec Deck / Aperturas',    1, 3, '12-15', '3 SE · Desc 90 seg · Aislar pectoral'),
    (v_user, 6, 'Face Pulls',              2, 4, '15',    '4 SE · Desc 90 seg · Corrección postural'),
    (v_user, 6, 'Curl Predicador (Bíceps)',3, 5, '10-12', '1 SA / 4 SE · Desc 90 seg · Aislamiento puro'),
    (v_user, 6, 'Press Francés (Tríceps)', 4, 5, '10-12', '1 SA / 4 SE · Desc 90 seg · Carga moderada, control total');

  -- ---------------------------------------------------------
  -- 4) SESIONES de la primera semana (días entrenados)
  --    Mié 22 = descanso activo → sin sesión de pesas.
  -- ---------------------------------------------------------
  insert into public.workout_sessions (user_id, session_date, notes) values
    (v_user, date '2026-07-20', 'Semana 1 · Pierna A'),
    (v_user, date '2026-07-21', 'Semana 1 · Empuje'),
    (v_user, date '2026-07-23', 'Semana 1 · Tirón'),
    (v_user, date '2026-07-24', 'Semana 1 · Pierna B');

  -- 4.1) Copiar los ejercicios del plan a cada sesión según su día
  insert into public.session_exercises (session_id, exercise_name, order_index, notes)
  select ws.id, pe.exercise_name, pe.order_index, null
  from public.workout_sessions ws
  join public.workout_plan_exercises pe
    on pe.user_id = v_user
   and pe.weekday = extract(dow from ws.session_date)::int
  where ws.user_id = v_user
    and ws.session_date between date '2026-07-20' and date '2026-07-24';

  -- 4.2) Ejercicio extra que mencionaste el Jueves (no estaba en el plan)
  insert into public.session_exercises (session_id, exercise_name, order_index, notes)
  select ws.id, 'Remo con Mancuerna', 10, 'Extra'
  from public.workout_sessions ws
  where ws.user_id = v_user and ws.session_date = date '2026-07-23';

  -- ---------------------------------------------------------
  -- 5) SERIES EFECTIVAS registradas (tus máximos de la semana)
  -- ---------------------------------------------------------
  -- Lunes (Pierna A)
  perform log_set(v_user, date '2026-07-20', 'Sentadilla Libre',   100, 6, null);
  perform log_set(v_user, date '2026-07-20', 'Sentadilla Búlgara',  20, 8, 'x pierna');
  -- Martes (Empuje)
  perform log_set(v_user, date '2026-07-21', 'Press Banca Plano',   80, 6, null);
  perform log_set(v_user, date '2026-07-21', 'Press Inclinado (Manc.)', 35, 8, 'x mano');
  -- Jueves (Tirón)
  perform log_set(v_user, date '2026-07-23', 'Jalón al Pecho',      100, 8, null);
  perform log_set(v_user, date '2026-07-23', 'Remo con Barra',       60, 8, 'Controlando excéntrica');
  perform log_set(v_user, date '2026-07-23', 'Remo con Mancuerna',   35, 8, 'x mano');
  perform log_set(v_user, date '2026-07-23', 'Curl Bíceps Barra',    30, 8, null);

end $$;

-- Limpiar el helper temporal
drop function if exists public.log_set(uuid, date, text, numeric, int, text);
