# Fitracker — Estado del Proyecto

> Documento de contexto para retomar el desarrollo. Última actualización: 2026-07-24.

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

Nota: el trigger `seed_user_defaults` da a cada usuario nuevo las mismas
comidas/hábitos por defecto (mismos nombres). Eso es normal y son datos propios.

## 7c. Onboarding — decisión: HÍBRIDO

- **Autorregistro** disponible (`/registro`): nombre, apellido, edad, peso,
  objetivo, contraseña → `signUp` + guardar en `user_profile`.
- **Admin (Will)** puede seguir creando usuarios y cargando/override su plan por
  seed SQL usando el `user id`.
- **Onboarding guiado** en el primer ingreso: si `user_profile` está incompleto →
  llevar al asistente; si ya está completo → dashboard.
- **Sin depender de correos:** desactivar "Confirm email" en Supabase Auth
  (mientras no haya SMTP) para que el registro entre directo.

### Plan de implementación (pendiente)
1. **Migración 005**: extender `user_profile` con `first_name`, `last_name`,
   `age int`, `weight_kg numeric`, `onboarding_done boolean default false`.
   Actualizar `schema.sql` y el tipo `UserProfile` en `src/lib/types.ts`.
2. **/registro**: página de autorregistro (`supabase.auth.signUp`) + inserción de
   perfil. Enlazar desde `/login` y desde la landing.
3. **Middleware/gate**: si hay sesión pero `onboarding_done = false` →
   redirigir a `/onboarding`.
4. **/onboarding**: asistente (wizard) que recoge/confirma perfil y explica la app,
   al terminar marca `onboarding_done = true`.
5. **Banner con parallax** en `/inicio`: saludo con el `first_name`
   ("Hola, Will") y efecto parallax al hacer scroll (client component).
6. Config Supabase: desactivar "Confirm email".

## 8. Próximos pasos (backlog)

1. **[EN CURSO]** Onboarding híbrido (ver 7c): migración 005 → /registro →
   /onboarding → banner parallax.
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
