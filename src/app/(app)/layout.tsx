import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Gate de onboarding: si el usuario no lo ha completado, lo llevamos al
  // asistente guiado. Si no existe perfil aún, también se considera pendiente.
  const { data: profile } = await supabase
    .from("user_profile")
    .select("onboarding_done")
    .maybeSingle();

  if (!profile?.onboarding_done) {
    redirect("/onboarding");
  }

  return <AppShell>{children}</AppShell>;
}
