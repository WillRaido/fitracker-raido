import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ItemManager from "@/components/item-manager";
import type { ManagedItem } from "@/lib/types";
import { UtensilsCrossed, Activity } from "lucide-react";

export default async function AjustesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [mealsRes, habitsRes] = await Promise.all([
    supabase
      .from("meals")
      .select("id, name, scheduled_time, order_index, active")
      .order("order_index"),
    supabase
      .from("habits")
      .select("id, name, category, scheduled_time, order_index, active")
      .order("order_index"),
  ]);

  const meals = (mealsRes.data ?? []) as ManagedItem[];
  const habits = (habitsRes.data ?? []) as ManagedItem[];

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-24 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:max-w-2xl md:pb-10 md:pt-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Ajustes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Personaliza tus comidas, hábitos y horarios.
        </p>
      </header>

      <div className="space-y-4">
        <ItemManager
          title="Mis comidas"
          icon={<UtensilsCrossed className="h-5 w-5" />}
          table="meals"
          userId={user.id}
          initialItems={meals}
        />
        <ItemManager
          title="Mis hábitos"
          icon={<Activity className="h-5 w-5" />}
          table="habits"
          userId={user.id}
          initialItems={habits}
          withCategory
        />
      </div>

      <p className="mt-6 text-center text-xs text-neutral-600">
        Los horarios se usarán para los recordatorios (próximamente).
      </p>
    </main>
  );
}
