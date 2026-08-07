# Fitracker — Estado del Proyecto

> Documento de contexto para retomar el desarrollo. Última actualización: 2026-07-27.

## 1. Qué es

**Fitracker** (marca Raido) es una **PWA mobile-first** para seguimiento de
**entrenamiento, nutrición y hábitos posturales**. Multiusuario, con la meta de
invitar a familia/amigos más adelante.

- **Dominio producción:** https://fitracker.raido.com.co
- **Repo:** github.com/WillRaido/fitracker-raido

## 2. Stack

- **Next.js 14** (App Router, TypeScript)
- **TailwindCSS**
- **Supabase** (PostgreSQL + Auth email/contraseña + Row Level Security)
- **next-pwa** (service worker, solo en producción)
- **lucide-react** (iconos)
- **Vercel** (hosting, integración con GitHub)

## 3. Arquitectura de rutas

- `/` → **Landing page pública** (parallax, 3 pilares, marca Raido).
- `/login` → **Login con email + contraseña** (`signInWithPassword`). Muestra errores vía `?error=` y validación en línea.
- `/auth/callback` y `/auth/confirm` → Rutas del flujo Magic Link (ya no se usan; quedan como referencia por si se retoma OTP).
- `/(app)` → Rutas protegidas (middleware redirige a `/login` sin sesión):
  - `/inicio` → Dashboard (anillos de progreso, rachas, tarjeta de objetivo/ciclo).
  - `/entrenamiento` → Registro diario; `/entrenamiento/plan` → editor del plan semanal.
  - `/nutricion` → Checklist de comidas con emoji, horario y detalle.
  - `/habitos` → Hábitos agrupados por categoría con emojis.
  - `/ajustes` → Editor de comidas (con alimentos y propósito) y hábitos.
  - `/historial` → (pendiente de gráficos).

## 4. Base de datos (Supabase)

**Tablas:** `users`, `exercises`, `workout_days`, `workout_sessions`,
`session_exercises`, `exercise_sets`, `meals` (con `foods`, `purpose`,
`scheduled_time`), `meal_logs`, `habits`, `habit_logs`, `workout_plan_days`,
`workout_plan_exercises`, `user_profile` (objetivo y duración del ciclo).

- **RLS activo** en todas las tablas (aislamiento por usuario).
- **Migraciones** en `supabase/migrations/`:
  - `001_add_scheduled_time.sql`
  - `002_unique_session_per_day.sql` (evita sesiones duplicadas)
  - `003_workout_plan.sql`
  - `004_nutrition_and_profile.sql`
- **Seeds personales** en `supabase/seeds/`:
  - `will_plan_and_week1.sql` (plan + semana 1)
  - `will_nutrition_and_profile.sql`
- Esquema canónico completo en `supabase/schema.sql`.

## 5. Funcionalidades completadas

- Auth Magic Link + RLS multiusuario.
- Layout responsive (sidebar desktop + bottom nav móvil).
- Dashboard con progreso, rachas y tarjeta de objetivo/semana del ciclo.
- Editor del plan semanal de entrenamiento (por día, ejercicios, series/reps objetivo).
- Registro diario de entrenamiento con reutilización de sesión y sembrado de ejercicios del plan.
- Nutrición con alimentos, propósito y horario; edición en Ajustes (panel expandible).
- Hábitos agrupados por categoría con emojis y check circular.
- Landing page pública con parallax.
- PWA instalable.

## 6. Gitflow y despliegue

- **`main`** = producción → Vercel Production Branch → `fitracker.raido.com.co`.
- **`develop`** = QA/pruebas → Vercel Preview automático.
- **`feature/*`** → PR a `develop` → merge `develop → main` para producir.
- **Un solo proyecto Supabase** para el MVP.

**Variables en Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production + Preview).
- `NEXT_PUBLIC_SITE_URL` solo en **Production** (= `https://fitracker.raido.com.co`).
  En Preview se deja **sin definir** → el login usa `window.location.origin`.

**DNS (Hostinger):** `CNAME fitracker → 325692354f3d5c02.vercel-dns-017.com`.

## 7. Autenticación — email + contraseña

Se **abandonó Magic Link** (rate limit de 2/h del correo integrado + no permitía
editar plantillas sin SMTP). Ahora el login es **email + contraseña**
(`supabase.auth.signInWithPassword`).

**Modelo de uso:** Will (admin) crea las cuentas de amigos/esposa y les carga el
plan (igual que se hizo con su propio usuario).

**Cómo crear un usuario nuevo (Supabase Dashboard):**
1. Authentication → **Users → Add user**.
2. Ingresar email + contraseña y **marcar "Auto Confirm User"** (para que pueda
   entrar sin verificar correo).
3. Copiar el `user id` generado.
4. Cargar su plan/nutrición con un seed SQL usando ese `user id`
   (ver `supabase/seeds/` como plantilla).

**Config recomendada en Supabase → Authentication:**
- Provider **Email** habilitado (viene por defecto).
- Opcional: desactivar "Confirm email" si se prefiere no depender de correos
  (con "Auto Confirm User" al crear no es necesario).

**SMTP (opcional, a futuro):** solo si se quiere "reset de contraseña" por correo
o invitaciones automáticas. No es necesario para el login actual.

## 7b. Aislamiento de datos (aclaración importante)

**NO hay fuga de datos.** La RLS está correcta en todas las tablas
(`auth.uid() = user_id`). El síntoma de "usuario nuevo ve datos de Will" fue
porque **no se cerró la sesión de Will**: el middleware redirige `/login → /inicio`
si ya hay sesión, así que nunca se llegó al formulario y se navegó como Will.
**Para probar otro usuario: cerrar sesión o usar incógnito.**

Nota (histórico): antes el trigger `seed_user_defaults` daba a cada usuario nuevo
las comidas/hábitos del Raido Protocol. **Se eliminó** en la migración
`006_remove_seed_trigger.sql`. Ahora los usuarios arrancan **vacíos** y el
onboarding ofrece cargar la **plantilla Raido** (opcional) desde
`src/lib/templates.ts` con la sesión del propio usuario.

## 7c. Onboarding — decisión: HÍBRIDO

- **Autorregistro** disponible (`/registro`): nombre, apellido, edad, peso,
  objetivo, contraseña → `signUp` + guardar en `user_profile`.
- **Admin (Will)** puede seguir creando usuarios y cargando/override su plan por
  seed SQL usando el `user id`.
- **Onboarding guiado** en el primer ingreso: si `user_profile` está incompleto →
  llevar al asistente; si ya está completo → dashboard.
- **Sin depender de correos:** desactivar "Confirm email" en Supabase Auth
  (mientras no haya SMTP) para que el registro entre directo.

### Plan de implementación (estado)
1. [HECHO] **Migración 005** (`005_profile_onboarding.sql`): extiende
   `user_profile` con `first_name`, `last_name`, `age int`, `weight_kg numeric`,
   `height_cm int`, `onboarding_done boolean default false`. Marca
   `onboarding_done = true` a usuarios con `objective` (ej. Will). Tipo
   `UserProfile` en `src/lib/types.ts` ya actualizado.
2. [HECHO] **/registro**: autorregistro (`supabase.auth.signUp`) + upsert de
   perfil (`src/app/registro/page.tsx`). Enlazado desde `/login`.
3. [HECHO] **Gate de onboarding**: en `src/app/(app)/layout.tsx` (server), si no
   hay perfil o `onboarding_done = false` → redirige a `/onboarding`. (Se hizo
   en el layout en vez del middleware para evitar consultas DB en el edge.)
4. [HECHO] **/onboarding**: wizard de 5 pasos
   (`src/components/onboarding-wizard.tsx`): bienvenida → datos → objetivo →
   elección de plantilla → resumen. Al terminar hace upsert con
   `onboarding_done = true` y `cycle_start = hoy`.
5. [HECHO] **Banner con parallax** en `/inicio`
   (`src/components/dashboard-hero.tsx`): saludo según hora + `first_name`
   ("Buenas tardes, Will") con orbes en parallax al hacer scroll.
6. [PENDIENTE — config manual] Supabase: desactivar "Confirm email".
7. [HECHO] **Títulos de entrenamiento personalizados**: `/inicio` y
   `/entrenamiento` leen `workout_plan_days.focus`/`is_rest` del día actual. Si
   el usuario no tiene plan, se muestra "Configura tu plan" (ya NO el plan de
   Will). Se eliminó `WORKOUT_DAY_TITLES`.
8. [HECHO] **Arranque vacío + plantilla opcional**: migración
   `006_remove_seed_trigger.sql` quita el auto-seed. El onboarding (paso 4)
   ofrece "Plantilla Raido" (comidas + hábitos + plan de 5 días con ejercicios,
   en `src/lib/templates.ts`) o "Empezar vacío". La carga se hace desde el
   cliente con la sesión del usuario (RLS).

Nota verificada: el aislamiento por RLS funciona bien. Tras la migración 006, un
usuario nuevo arranca **vacío**; solo verá datos precargados si elige la
plantilla Raido en el onboarding.

## 8. Próximos pasos (backlog)

1. **[HECHO]** Onboarding híbrido (ver 7c): migración 005 → /registro →
   gate en layout → /onboarding → banner parallax → títulos personalizados.
   Solo queda la config manual en Supabase (desactivar "Confirm email").
2. Instalar la PWA en iPhone y validar.
3. (Opcional) Pantalla para que el usuario cambie su propia contraseña.
4. Gráficos de progreso en `/historial`.
5. Recordatorios basados en horarios (`scheduled_time`).
6. Mejoras visuales continuas.

## 9. Comandos útiles

```bash
npm run dev            # desarrollo local (localhost:3000)
npx tsc --noEmit       # chequeo de tipos
npm run build          # build de producción
git checkout develop   # rama de trabajo
# publicar a producción:
git checkout main && git merge develop --ff-only && git push && git checkout develop
```
