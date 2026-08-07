import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingWizard from "@/components/onboarding-wizard";
import type { UserProfile } from "@/lib/types";

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profile")
    .select("*")
    .maybeSingle();

  if (profile?.onboarding_done) redirect("/inicio");

  return (
    <OnboardingWizard
      userId={user.id}
      initial={(profile as UserProfile | null) ?? null}
    />
  );
}
