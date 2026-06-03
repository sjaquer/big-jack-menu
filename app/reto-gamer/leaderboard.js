// Sistema de ranking simplificado: solo un récord local guardado en localStorage
const RECORD_KEY = 'bj_local_record_v1';

export const CATEGORIES = {
  HIGH_SCORE: { id: 'high_score', name: 'High Score', description: 'Récord local (mejor puntuación)', icon: '🏆' }
};

// Generar código simple para canje
export function generateRedeemCode(playerName = '') {
  const code = `BJ-${playerName.replace(/\s+/g, '').slice(0,6).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  return code;
}

// Hash ligero (mantener la función para compatibilidad)
export function generateHash(data) {
  const str = `${data.score}-${data.wave || 0}-${data.duration || 0}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

function getRecord() {
  try {
    const raw = localStorage.getItem(RECORD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveRecord(record) {
  try {
    localStorage.setItem(RECORD_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

// Guardar puntuación: si es mejor que el récord local lo reemplaza
export function saveToLeaderboard(entry) {
  const current = getRecord();
  const newEntry = {
    playerName: entry.playerName || 'Jugador',
    whatsapp: entry.whatsapp || '',
    score: entry.score || 0,
    wave: entry.wave || 1,
    kills: entry.kills || 0,
    duration: entry.duration || 0,
    timeToBoss: entry.timeToBoss || 0,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2,5),
    date: new Date().toLocaleDateString('es-PE'),
    redeemCode: generateRedeemCode(entry.playerName || 'J'),
    verified: false
  };

  // Si no existe récord o la nueva puntuación es mayor, reemplazar
  if (!current || (newEntry.score > (current.score || 0))) {
    saveRecord(newEntry);
    return newEntry;
  }

  // Si no supera, devolver el actual sin cambiar
  return current;
}

// Obtener ranking por categoría (devuelve array con 0 o 1 elemento)
export function getRankingByCategory(categoryId, limit = 10) {
  const rec = getRecord();
  if (!rec) return [];
  return [rec].slice(0, limit);
}

// Estadísticas simples
export function getStats() {
  const rec = getRecord();
  if (!rec) return { totalPlayers: 0, highestScore: 0, averageScore: 0, totalGames: 0, bestWave: 0 };
  return {
    totalPlayers: 1,
    highestScore: rec.score || 0,
    averageScore: rec.score || 0,
    totalGames: 1,
    bestWave: rec.wave || 0
  };
}

// Descargar CSV (si existe récord)
export function downloadCSV() {
  const rec = getRecord();
  if (!rec) {
    alert('No hay datos para exportar');
    return;
  }
  const headers = ['Nombre','WhatsApp','Puntuación','Oleada','Kills','Tiempo(s)','Código','Fecha'];
  const row = [rec.playerName, rec.whatsapp, rec.score, rec.wave, rec.kills, Math.round(rec.duration||0), rec.redeemCode, rec.date];
  const csv = [headers.join(','), row.map(c => `"${c}"`).join(',')].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `big_jack_record_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Obtener posición simple: 1 si supera el récord, 2 si no
export function getPlayerRank(score, categoryId = 'high_score') {
  const rec = getRecord();
  if (!rec) return 1;
  return score > (rec.score || 0) ? 1 : 2;
}
