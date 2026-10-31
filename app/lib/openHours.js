// Utilities para horarios de apertura.
// El negocio opera en America/Lima (UTC-5, sin horario de verano), así que los
// cálculos se hacen sobre el reloj de Lima y no sobre la zona del dispositivo.
import { restaurantInfo } from "../data/menuData";

const LIMA_UTC_OFFSET_MINUTES = -300;
const MS_PER_MINUTE = 60000;

function parseTimeToMinutes(hhmm) {
  if (typeof hhmm !== "string") return null;
  const [hh, mm] = hhmm.split(":").map((value) => Number.parseInt(value, 10));
  if (!Number.isInteger(hh) || !Number.isInteger(mm)) return null;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}

function getLimaParts(date) {
  const shifted = new Date(date.getTime() + LIMA_UTC_OFFSET_MINUTES * MS_PER_MINUTE);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

function limaLocaltimeToDate({ year, month, day }, minutes) {
  const utcMidnight = Date.UTC(year, month, day);
  return new Date(utcMidnight + (minutes - LIMA_UTC_OFFSET_MINUTES) * MS_PER_MINUTE);
}

export function isOpenNow(date = new Date(), hours = restaurantInfo.hours) {
  const { weekday, minutes } = getLimaParts(date);

  const today = hours?.[weekday];
  if (today) {
    const open = parseTimeToMinutes(today.open);
    const close = parseTimeToMinutes(today.close);
    if (open != null && close != null) {
      if (close > open && minutes >= open && minutes < close) return true;
      if (close <= open && minutes >= open) return true;
    }
  }

  const previousDay = hours?.[(weekday + 6) % 7];
  if (previousDay) {
    const previousOpen = parseTimeToMinutes(previousDay.open);
    const previousClose = parseTimeToMinutes(previousDay.close);
    if (previousOpen != null && previousClose != null && previousClose < previousOpen) {
      if (minutes < previousClose) return true;
    }
  }

  return false;
}

// Devuelve la próxima apertura estrictamente posterior a `date`, o null si ya está abierto.
export function getNextOpenDate(date = new Date(), hours = restaurantInfo.hours) {
  if (isOpenNow(date, hours)) return null;

  const lima = getLimaParts(date);

  for (let add = 0; add < 8; add++) {
    const candidateDay = new Date(Date.UTC(lima.year, lima.month, lima.day + add));
    const schedule = hours?.[candidateDay.getUTCDay()];
    if (!schedule) continue;

    const openMinutes = parseTimeToMinutes(schedule.open);
    if (openMinutes == null) continue;

    const opening = limaLocaltimeToDate(
      {
        year: candidateDay.getUTCFullYear(),
        month: candidateDay.getUTCMonth(),
        day: candidateDay.getUTCDate(),
      },
      openMinutes
    );

    if (opening > date) return opening;
  }

  return null;
}

function formatLimaTime(date) {
  const { minutes } = getLimaParts(date);
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  const suffix = hh < 12 ? "a. m." : "p. m.";
  return `${hh % 12 === 0 ? 12 : hh % 12}:${String(mm).padStart(2, "0")} ${suffix}`;
}

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function dayWord(target, now) {
  const a = getLimaParts(now);
  const b = getLimaParts(target);
  const diffDays = Math.round(
    (Date.UTC(b.year, b.month, b.day) - Date.UTC(a.year, a.month, a.day)) / 86400000
  );
  if (diffDays === 0) return "hoy";
  if (diffDays === 1) return "mañana";
  return `el ${WEEKDAYS[b.weekday]}`;
}

// Hora de cierre del turno en curso, o null si está cerrado.
export function getCurrentCloseDate(date = new Date(), hours = restaurantInfo.hours) {
  if (!isOpenNow(date, hours)) return null;
  const lima = getLimaParts(date);

  // Turno de ayer que cruza la medianoche.
  const previous = hours?.[(lima.weekday + 6) % 7];
  const previousOpen = parseTimeToMinutes(previous?.open);
  const previousClose = parseTimeToMinutes(previous?.close);
  if (previousClose != null && previousOpen != null && previousClose < previousOpen && lima.minutes < previousClose) {
    return limaLocaltimeToDate(lima, previousClose);
  }

  const today = hours?.[lima.weekday];
  const close = parseTimeToMinutes(today?.close);
  const open = parseTimeToMinutes(today?.open);
  if (close == null || open == null) return null;
  const closeDay = close <= open ? { ...lima, day: lima.day + 1 } : lima;
  return limaLocaltimeToDate(closeDay, close);
}

// Texto corto de estado: "Abierto · hasta 1:00 a. m." / "Cerrado · abre hoy 7:00 p. m."
export function getOpenStatusLabel(date = new Date(), hours = restaurantInfo.hours) {
  const closeDate = getCurrentCloseDate(date, hours);
  if (closeDate) {
    return { isOpen: true, label: `Abierto · hasta ${formatLimaTime(closeDate)}` };
  }
  const next = getNextOpenDate(date, hours);
  if (!next) return { isOpen: false, label: "Cerrado" };
  return {
    isOpen: false,
    label: `Cerrado · abre ${dayWord(next, date)} ${formatLimaTime(next)}`,
    nextOpenLabel: `${dayWord(next, date)} a las ${formatLimaTime(next)}`,
  };
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

const openHoursUtils = {
  isOpenNow,
  getOpenStatusLabel,
  getNextOpenDate,
  formatMsToCountdown,
};

export default openHoursUtils;
