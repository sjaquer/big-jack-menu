// Utilities para horarios de apertura
// Funciones puras que calculan si el restaurante está abierto y cuándo abre la próxima vez.
import { restaurantInfo } from "../data/menuData";

function parseTimeToDate(baseDate, hhmm) {
  const [hh, mm] = hhmm.split(":").map((v) => parseInt(v, 10));
  const d = new Date(baseDate);
  d.setHours(hh, mm, 0, 0);
  return d;
}

export function isOpenNow(date = new Date(), hours = restaurantInfo.hours) {
  const day = date.getDay(); // 0..6
  const schedule = hours?.[day];
  if (!schedule) return false;
  const open = parseTimeToDate(date, schedule.open);
  const close = parseTimeToDate(date, schedule.close);

  // Si close <= open asumimos cierre al día siguiente (no usado aquí pero cubierto)
  if (close <= open) {
    // cierre al día siguiente
    if (date >= open) return true;
    const prevOpen = new Date(open);
    prevOpen.setDate(prevOpen.getDate() - 1);
    const prevSchedule = hours?.[(day + 6) % 7];
    if (prevSchedule) {
      const prevOpenDate = parseTimeToDate(prevOpen, prevSchedule.open);
      const prevCloseDate = parseTimeToDate(prevOpen, prevSchedule.close);
      // ajustar prevCloseDate al día siguiente
      prevCloseDate.setDate(prevCloseDate.getDate() + 1);
      return date >= prevOpenDate && date <= prevCloseDate;
    }
    return false;
  }

  return date >= open && date <= close;
}

// Devuelve la próxima fecha/hora de apertura desde `date`
export function getNextOpenDate(date = new Date(), hours = restaurantInfo.hours) {
  // Buscar en los próximos 7 días el primer periodo abierto que ocurra después de 'date'
  for (let add = 0; add < 8; add++) {
    const candidate = new Date(date);
    candidate.setDate(candidate.getDate() + add);
    const day = candidate.getDay();
    const schedule = hours?.[day];
    if (!schedule) continue;
    const openDate = parseTimeToDate(candidate, schedule.open);
    const closeDate = parseTimeToDate(candidate, schedule.close);
    // Si close <= open asumimos cierre al día siguiente: dejamos closeDate al día siguiente
    if (closeDate <= openDate) closeDate.setDate(closeDate.getDate() + 1);

    if (add === 0) {
      // mismo día: si la apertura aún no pasó, devolverla
      if (date < openDate) return openDate;
      // si ya pasó y aún estamos antes del cierre, estamos abiertos -> devolver null
      if (date <= closeDate) return null;
    } else {
      return openDate;
    }
  }
  return null;
}

export function formatMsToCountdown(ms) {
  if (!ms || ms <= 0) return "0m";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default {
  isOpenNow,
  getNextOpenDate,
  formatMsToCountdown,
};
