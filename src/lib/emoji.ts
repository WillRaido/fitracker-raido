// Mapeos de emojis para dar vida visual a la app.

/** Emoji para una comida según su nombre. */
export function mealEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("pre-entreno") || n.includes("pre entreno")) return "☕";
  if (n.includes("post")) return "🍗";
  if (n.includes("pre-turno") || n.includes("pre turno")) return "🍠";
  if (n.includes("snack")) return "🥗";
  if (n.includes("cierre") || n.includes("caseína") || n.includes("caseina"))
    return "🥛";
  return "🍽️";
}

/** Emoji para un hábito según su categoría o nombre. */
export function habitEmoji(category: string | null, name: string): string {
  const c = (category ?? "").toLowerCase();
  const n = name.toLowerCase();
  if (c.includes("hidrat") || n.includes("agua")) return "💧";
  if (c.includes("postura") || n.includes("cuello") || n.includes("chin"))
    return "🧍";
  if (c.includes("movilidad") || n.includes("estiramiento") || n.includes("psoas"))
    return "🤸";
  return "✅";
}

/** Emoji e info visual para una categoría de hábitos. */
export function categoryStyle(category: string): {
  emoji: string;
  color: string;
} {
  const c = category.toLowerCase();
  if (c.includes("hidrat")) return { emoji: "💧", color: "sky" };
  if (c.includes("postura")) return { emoji: "🧍", color: "violet" };
  if (c.includes("movilidad")) return { emoji: "🤸", color: "emerald" };
  return { emoji: "⭐", color: "amber" };
}
