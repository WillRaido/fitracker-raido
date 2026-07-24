const TZ = "America/Bogota";

/** Fecha "hoy" en Colombia en formato YYYY-MM-DD. */
export function bogotaDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}

/** Fecha legible en español, ej: "viernes, 24 de julio". */
export function bogotaPretty(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  }).format(d);
}

/** Día de la semana en Colombia: 0=Domingo .. 6=Sábado. */
export function bogotaWeekday(d: Date = new Date()): number {
  const name = d.toLocaleDateString("en-US", {
    timeZone: TZ,
    weekday: "long",
  });
  const map: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return map[name] ?? 1;
}

export const WORKOUT_DAY_TITLES: Record<number, string> = {
  1: "Día 1 · Pierna A (Cuádriceps)",
  2: "Día 2 · Empuje (Pecho, Hombro, Tríceps)",
  3: "Miércoles · Descanso activo",
  4: "Día 4 · Tirón (Espalda, Bíceps)",
  5: "Día 5 · Pierna B (Isquios, Glúteo)",
  6: "Día 6 · Torso (Bombeo)",
  0: "Domingo · Descanso total",
};
