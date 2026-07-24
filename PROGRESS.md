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
- **Supabase** (PostgreSQL + Auth Magic Link + Row Level Security)
- **next-pwa** (service worker, solo en producción)
- **lucide-react** (iconos)
- **Vercel** (hosting, integración con GitHub)

## 3. Arquitectura de rutas

- `/` → **Landing page pública** (parallax, 3 pilares, marca Raido).
- `/login` → Login con Magic Link. Muestra errores vía `?error=`.
- `/auth/callback` → Canjea `?code=` (flujo PKCE) → sesión. (Flujo por defecto actual.)
- `/auth/confirm` → Verifica `token_hash` (patrón SSR robusto). **Listo pero requiere plantilla de correo personalizada** (ver bloqueo abajo).
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

## 7. BLOQUEO ACTUAL — Login por correo

**Síntoma:** al hacer clic en el Magic Link → error `otp_expired`
("Email link is invalid or has expired"), redirige al landing.

**Causa raíz:** el correo integrado de Supabase tiene **rate limit de 2/hora**
y no permite editar plantillas ("Set up custom SMTP to edit templates").
Sumado a prefetch de proveedores / clics en enlaces viejos.

**Solución acordada (pendiente de hacer):** configurar **SMTP propio (Resend)**:
1. Crear cuenta en resend.com (gratis, 3.000/mes).
2. Verificar dominio `raido.com.co` (agregar registros SPF/DKIM en Hostinger DNS).
3. Crear API Key (`re_...`).
4. En Supabase → Authentication → Emails → SMTP Settings (Enable custom SMTP):
   - Host `smtp.resend.com`, Port `465`, Username `resend`, Password = API key.
   - Sender: `no-reply@raido.com.co`, nombre `Fitracker`.
5. Esto sube el límite a 30/h y **desbloquea plantillas**.
6. Editar plantilla Magic Link para usar el endpoint robusto ya implementado:
   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
     Iniciar sesión
   </a>
   ```

**Verificar también en Supabase → Authentication → URL Configuration:**
- Site URL: `https://fitracker.raido.com.co`
- Redirect URLs: `https://fitracker.raido.com.co/**`

**Nota:** mientras no haya SMTP, el flujo por defecto (`/auth/callback`, PKCE)
funciona si se usa un enlace fresco y no interviene el prefetch.

## 8. Próximos pasos (backlog)

1. **[BLOQUEO]** Configurar SMTP Resend → arreglar login → probar en producción.
2. Instalar la PWA en iPhone y validar.
3. Gráficos de progreso en `/historial`.
4. Asistente de onboarding para nuevos usuarios.
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
