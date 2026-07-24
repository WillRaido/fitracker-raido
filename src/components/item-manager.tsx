"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ManagedItem } from "@/lib/types";
import { Plus, Trash2, Clock, GripVertical } from "lucide-react";

type Props = {
  title: string;
  icon: React.ReactNode;
  table: "meals" | "habits";
  userId: string;
  initialItems: ManagedItem[];
  /** Los hábitos tienen categoría; las comidas no. */
  withCategory?: boolean;
};

export default function ItemManager({
  title,
  icon,
  table,
  userId,
  initialItems,
  withCategory = false,
}: Props) {
  const supabase = createClient();
  const [items, setItems] = useState<ManagedItem[]>(initialItems);
  const [newName, setNewName] = useState("");
  const [newTime, setNewTime] = useState("");
  const [busy, setBusy] = useState(false);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    const { data, error } = await supabase
      .from(table)
      .insert({
        user_id: userId,
        name: newName.trim(),
        order_index: items.length + 1,
        scheduled_time: newTime || null,
      })
      .select("*")
      .single();
    setBusy(false);
    if (!error && data) {
      setItems((prev) => [...prev, data as ManagedItem]);
      setNewName("");
      setNewTime("");
    }
  }

  async function updateField(
    id: string,
    field: "name" | "scheduled_time",
    value: string
  ) {
    const clean = field === "scheduled_time" ? value || null : value;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: clean } : i))
    );
    await supabase.from(table).update({ [field]: clean }).eq("id", id);
  }

  async function removeItem(id: string) {
    const prev = items;
    setItems((cur) => cur.filter((i) => i.id !== id));
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) setItems(prev); // revertir si falla
  }

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
      <header className="mb-4 flex items-center gap-2">
        <span className="text-emerald-400">{icon}</span>
        <h2 className="font-semibold text-white">{title}</h2>
        <span className="ml-auto text-sm text-neutral-500">
          {items.length}
        </span>
      </header>

      <ul className="mb-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-2"
          >
            <GripVertical className="h-4 w-4 shrink-0 text-neutral-700" />
            <input
              defaultValue={item.name}
              onBlur={(e) => {
                if (e.target.value.trim() && e.target.value !== item.name)
                  updateField(item.id, "name", e.target.value.trim());
              }}
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
            />
            <label className="flex shrink-0 items-center gap-1 rounded-lg bg-neutral-800 px-2 py-1">
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              <input
                type="time"
                defaultValue={item.scheduled_time?.slice(0, 5) ?? ""}
                onChange={(e) =>
                  updateField(item.id, "scheduled_time", e.target.value)
                }
                className="bg-transparent text-xs text-neutral-200 outline-none [color-scheme:dark]"
              />
            </label>
            <button
              onClick={() => removeItem(item.id)}
              className="shrink-0 rounded-lg p-1.5 text-neutral-500 transition hover:text-red-400"
              aria-label="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-4 text-center text-sm text-neutral-500">
            No hay elementos. Agrega el primero abajo.
          </li>
        )}
      </ul>

      <form
        onSubmit={addItem}
        className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/30 p-2"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={withCategory ? "Nuevo hábito" : "Nueva comida"}
          className="min-w-0 flex-1 bg-transparent px-1 text-sm text-white placeholder-neutral-600 outline-none"
        />
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="shrink-0 rounded-lg bg-neutral-800 px-2 py-1 text-xs text-neutral-200 outline-none [color-scheme:dark]"
        />
        <button
          type="submit"
          disabled={busy || !newName.trim()}
          className="flex shrink-0 items-center justify-center rounded-lg bg-emerald-500 p-2 text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-50"
          aria-label="Agregar"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
