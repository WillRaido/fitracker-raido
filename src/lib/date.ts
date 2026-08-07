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

/** Hora del día (0-23) en Colombia. */
export function bogotaHour(d: Date = new Date()): number {
  const h = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    hour12: false,
  }).format(d);
  return parseInt(h, 10);
}

/** Saludo según la hora en Colombia. */
export function bogotaGreeting(d: Date = new Date()): string {
  const h = bogotaHour(d);
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
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

