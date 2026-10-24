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
  getNextOpenDate,
  formatMsToCountdown,
};

export default openHoursUtils;
