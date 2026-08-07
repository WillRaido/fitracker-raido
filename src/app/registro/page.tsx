"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, User, CheckCircle2 } from "lucide-react";

export default function RegistroPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "check" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setStatus("error");
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    setStatus("loading");
    setMessage("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setStatus("error");
        setMessage(
          error.message.includes("already registered")
            ? "Ese correo ya tiene una cuenta. Inicia sesión."
            : error.message
        );
        return;
      }

      // Si la confirmación de correo está activa, no hay sesión todavía.
      if (!data.session) {
        setStatus("check");
        return;
      }

      // Sesión activa: guardamos el perfil inicial y vamos al onboarding.
      await supabase.from("user_profile").upsert({
        user_id: data.user!.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        onboarding_done: false,
      });

      router.refresh();
      router.push("/onboarding");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? `No se pudo conectar: ${err.message}`
          : "No se pudo conectar con el servidor."
      );
    }
  }

  if (status === "check") {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Revisa tu correo</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Enviamos un enlace de confirmación a{" "}
            <span className="font-medium text-neutral-200">{email}</span>.
            Confírmalo y luego inicia sesión.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm text-emerald-400 hover:text-emerald-300"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/icon.svg"
            alt="Fitracker"
            width={72}
            height={72}
            className="mb-4 rounded-2xl"
            priority
          />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Crea tu cuenta
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Empieza a seguir tu entrenamiento, nutrición y hábitos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Nombre
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Will"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-3 pl-10 pr-3 text-white placeholder-neutral-600 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Apellido
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Quintero"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-3 px-3 text-white placeholder-neutral-600 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-neutral-300"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-3 pl-10 pr-4 text-white placeholder-neutral-600 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-neutral-300"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-3 pl-10 pr-4 text-white placeholder-neutral-600 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="mb-2 block text-sm font-medium text-neutral-300"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-3 pl-10 pr-4 text-white placeholder-neutral-600 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {status === "error" && (
            <p className="text-sm text-red-400">{message}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Crear cuenta"
            )}
          </button>

          <p className="text-center text-sm text-neutral-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
