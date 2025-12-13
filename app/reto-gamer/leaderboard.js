// Sistema de Leaderboard para Big Jack Reto Gamer
// Guarda datos en localStorage y permite exportar a CSV/Excel

const LEADERBOARD_KEY = 'bj_leaderboard_v1';

// Categorías del torneo
export const CATEGORIES = {
  HIGH_SCORE: {
    id: 'high_score',
    name: 'High Score',
    description: 'Puntaje más alto',
    icon: '🏆',
    sortBy: 'score',
    sortOrder: 'desc'
  },
  SPEEDRUN_BOSS: {
    id: 'speedrun_boss',
    name: 'Speedrun Boss 1',
    description: 'Llegar al primer boss más rápido',
    icon: '⚡',
    sortBy: 'timeToBoss',
    sortOrder: 'asc'
  },
  SURVIVAL: {
    id: 'survival',
    name: 'Supervivencia',
    description: 'Mayor tiempo sobrevivido',
    icon: '⏱️',
    sortBy: 'survivalTime',
    sortOrder: 'desc'
  }
};

// Premios para el primer lugar de cada categoría
export const PRIZES = {
  main: "🍔 Nombrar una burger en tu honor con tu nombre",
  discount: "💰 50% descuento en todos los pedidos de una burger (1 por semana, sabores seleccionados)",
  fries: "🍟 Papas grandes GRATIS en cada pedido"
};

// Generar código único para canjear
export function generateRedeemCode(playerName, category) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const categoryCode = category.substring(0, 2).toUpperCase();
  return `BJ-${categoryCode}-${timestamp.slice(-4)}-${random}`;
}

// Generar hash de verificación
export function generateHash(data) {
  const str = `${data.score}-${data.wave}-${data.kills}-${data.duration}-${data.sessionId}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Validar datos del juego
export function validateGameData(data) {
  // Verificar que el tiempo sea razonable
  const minTimeForScore = data.score / 250; // Max ~250 puntos por segundo
  if (data.duration < minTimeForScore) return false;
  
  // Verificar correlación kills/score
  const expectedMinKills = Math.floor(data.score / 300);
  if (data.kills < expectedMinKills * 0.3) return false;
  
  // Verificar hash
  const expectedHash = generateHash(data);
  if (data.hash !== expectedHash) return false;
  
  return true;
}

// Obtener leaderboard
export function getLeaderboard() {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Guardar entrada en leaderboard
export function saveToLeaderboard(entry) {
  const leaderboard = getLeaderboard();
  
  // Agregar timestamp y código
  const newEntry = {
    ...entry,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    timestamp: Date.now(),
    date: new Date().toLocaleDateString('es-PE'),
    redeemCode: generateRedeemCode(entry.playerName, entry.category || 'high_score'),
    verified: false
  };
  
  leaderboard.push(newEntry);
  
  // Ordenar por score descendente
  leaderboard.sort((a, b) => b.score - a.score);
  
  // Guardar
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  
  return newEntry;
}

// Obtener ranking por categoría
export function getRankingByCategory(categoryId, limit = 10) {
  const leaderboard = getLeaderboard();
  const category = Object.values(CATEGORIES).find(c => c.id === categoryId);
  
  if (!category) return [];
  
  // Filtrar y ordenar según la categoría
  let sorted = [...leaderboard];
  
  if (category.sortBy === 'timeToBoss') {
    sorted = sorted.filter(e => e.timeToBoss && e.timeToBoss > 0);
    sorted.sort((a, b) => category.sortOrder === 'asc' 
      ? a.timeToBoss - b.timeToBoss 
      : b.timeToBoss - a.timeToBoss
    );
  } else if (category.sortBy === 'survivalTime') {
    sorted.sort((a, b) => category.sortOrder === 'asc'
      ? a.duration - b.duration
      : b.duration - a.duration
    );
  } else {
    sorted.sort((a, b) => category.sortOrder === 'asc'
      ? a.score - b.score
      : b.score - a.score
    );
  }
  
  return sorted.slice(0, limit);
}

// Obtener posición del jugador
export function getPlayerRank(score, categoryId = 'high_score') {
  const ranking = getRankingByCategory(categoryId, 1000);
  const position = ranking.findIndex(e => e.score <= score);
  return position === -1 ? ranking.length + 1 : position + 1;
}

// Exportar a CSV
export function exportToCSV() {
  const leaderboard = getLeaderboard();
  
  if (leaderboard.length === 0) {
    return null;
  }
  
  const headers = [
    'Posición',
    'Nombre',
    'WhatsApp',
    'Puntuación',
    'Oleada',
    'Enemigos Eliminados',
    'Tiempo (seg)',
    'Tiempo al Boss 1 (seg)',
    'Código Canje',
    'Fecha',
    'Verificado'
  ];
  
  const rows = leaderboard.map((entry, index) => [
    index + 1,
    entry.playerName || 'Anónimo',
    entry.whatsapp || '-',
    entry.score,
    entry.wave || 1,
    entry.kills || 0,
    Math.round(entry.duration || 0),
    entry.timeToBoss ? Math.round(entry.timeToBoss) : '-',
    entry.redeemCode || '-',
    entry.date || '-',
    entry.verified ? 'Sí' : 'No'
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

// Descargar CSV
export function downloadCSV() {
  const csv = exportToCSV();
  if (!csv) {
    alert('No hay datos para exportar');
    return;
  }
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `big_jack_leaderboard_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Obtener estadísticas generales
export function getStats() {
  const leaderboard = getLeaderboard();
  
  if (leaderboard.length === 0) {
    return {
      totalPlayers: 0,
      highestScore: 0,
      averageScore: 0,
      totalGames: 0,
      bestWave: 0
    };
  }
  
  const scores = leaderboard.map(e => e.score);
  const waves = leaderboard.map(e => e.wave || 1);
  
  return {
    totalPlayers: new Set(leaderboard.map(e => e.whatsapp || e.playerName)).size,
    highestScore: Math.max(...scores),
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    totalGames: leaderboard.length,
    bestWave: Math.max(...waves)
  };
}
