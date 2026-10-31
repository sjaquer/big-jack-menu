// Formateo del horario de atención para mostrarlo al cliente.
// Fuente: `restaurantInfo.hours` (0 = domingo … 6 = sábado).
import { restaurantInfo } from "../data/menuData";

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAY_LONG = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
// La semana se muestra de lunes a domingo.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

// "19:00" → "7:00 p. m." (forma del manual de marca §8.2)
export function formatTime(hhmm) {
  const [hh, mm] = String(hhmm || "").split(":").map((value) => Number.parseInt(value, 10));
  if (!Number.isInteger(hh) || !Number.isInteger(mm)) return "";
  const suffix = hh < 12 ? "a. m." : "p. m.";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${String(mm).padStart(2, "0")} ${suffix}`;
}

export function formatRange(day) {
  if (!day?.open || !day?.close) return "Cerrado";
  return `${formatTime(day.open)} – ${formatTime(day.close)}`;
}

// Agrupa días consecutivos con el mismo horario:
// [{ days: "Todos los días", hours: "7:00 p. m. – 1:00 a. m." }]
export function groupSchedule(hours = restaurantInfo.hours) {
  const groups = [];

  for (const dayIndex of WEEK_ORDER) {
    const label = formatRange(hours?.[dayIndex]);
    const last = groups[groups.length - 1];
    if (last && last.hours === label) {
      last.to = dayIndex;
      last.count += 1;
    } else {
      groups.push({ from: dayIndex, to: dayIndex, hours: label, count: 1 });
    }
  }

  return groups.map((group) => ({
    days:
      group.count === 7
        ? "Todos los días"
        : group.count === 1
          ? DAY_LONG[group.from]
          : `${DAY_SHORT[group.from]} – ${DAY_SHORT[group.to]}`,
    hours: group.hours,
  }));
}

// Una línea para header, metadatos o llms.txt.
export function formatScheduleSummary(hours = restaurantInfo.hours) {
  return groupSchedule(hours)
    .map((group) => `${group.days}: ${group.hours}`)
    .join(" · ");
}

export function formatPrepTime(prep = restaurantInfo.prepTimeMinutes) {
  if (!prep) return "";
  return prep.min === prep.max ? `${prep.min} min` : `${prep.min}–${prep.max} min`;
}
