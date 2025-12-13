"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  Target, 
  Download, 
  RefreshCw,
  Crown,
  Medal,
  Award,
  Gamepad2,
  Star,
  Zap
} from "lucide-react";
import { 
  CATEGORIES, 
  PRIZES,
  getRankingByCategory, 
  getStats, 
  downloadCSV 
} from "../leaderboard";

export default function RankingPage() {
  const [activeCategory, setActiveCategory] = useState('high_score');
  const [rankings, setRankings] = useState([]);
  const [stats, setStats] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [activeCategory]);

  const loadData = () => {
    const rankingData = getRankingByCategory(activeCategory, 20);
    setRankings(rankingData);
    setStats(getStats());
  };

  const getRankIcon = (position) => {
    switch (position) {
      case 1: return <Crown className="text-[#d99133]" size={24} />;
      case 2: return <Medal className="text-gray-300" size={22} />;
      case 3: return <Award className="text-[#b07020]" size={22} />;
      default: return <span className="text-neutral-500 font-mono text-sm">#{position}</span>;
    }
  };

  const getRankStyle = (position) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-[#d99133]/20 to-[#b07020]/20 border-[#d99133]/50';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3: return 'bg-gradient-to-r from-[#b07020]/20 to-[#8a5010]/20 border-[#b07020]/50';
      default: return 'bg-neutral-900/50 border-neutral-700/50';
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categoryIcons = {
    high_score: Trophy,
    speedrun_boss: Zap,
    survival: Clock
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#020204] flex items-center justify-center">
        <div className="animate-spin text-4xl">🍔</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020204] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#020204]/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/reto-gamer" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-semibold">Volver al juego</span>
          </Link>
          <button
            onClick={() => loadData()}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-[#d99133] via-[#b07020] to-[#8a5010] bg-clip-text text-transparent">
            🏆 RANKING
          </h1>
          <p className="text-neutral-400">Reto Gamer Big Jack - Neon Burger Hell</p>
        </div>

        {/* Stats */}
        {stats && stats.totalGames > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-neutral-900 rounded-xl p-4 text-center border border-neutral-800">
              <div className="text-2xl font-bold text-[#d99133]">{stats.highestScore.toLocaleString()}</div>
              <div className="text-xs text-neutral-500">Récord Mundial</div>
            </div>
            <div className="bg-neutral-900 rounded-xl p-4 text-center border border-neutral-800">
              <div className="text-2xl font-bold text-cyan-400">{stats.totalPlayers}</div>
              <div className="text-xs text-neutral-500">Jugadores</div>
            </div>
            <div className="bg-neutral-900 rounded-xl p-4 text-center border border-neutral-800">
              <div className="text-2xl font-bold text-green-400">{stats.totalGames}</div>
              <div className="text-xs text-neutral-500">Partidas</div>
            </div>
            <div className="bg-neutral-900 rounded-xl p-4 text-center border border-neutral-800">
              <div className="text-2xl font-bold text-purple-400">{stats.bestWave}</div>
              <div className="text-xs text-neutral-500">Mejor Oleada</div>
            </div>
          </div>
        )}

        {/* Premios */}
        <div className="bg-gradient-to-r from-[#d99133]/10 to-[#b07020]/10 rounded-2xl p-6 mb-8 border border-[#d99133]/30">
          <h2 className="text-xl font-bold text-[#d99133] mb-4 flex items-center gap-2">
            <Crown size={24} /> Premios 1er Lugar (por categoría)
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-2xl">🍔</span>
              <span className="text-neutral-300">{PRIZES.main}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-neutral-300">{PRIZES.discount}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-2xl">🍟</span>
              <span className="text-neutral-300">{PRIZES.fries}</span>
            </li>
          </ul>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.values(CATEGORIES).map(category => {
            const Icon = categoryIcons[category.id] || Trophy;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  activeCategory === category.id
                    ? 'bg-[#d99133] text-black'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.icon}</span>
              </button>
            );
          })}
        </div>

        {/* Category Description */}
        <div className="text-center mb-6 text-neutral-400 text-sm">
          {Object.values(CATEGORIES).find(c => c.id === activeCategory)?.description}
        </div>

        {/* Ranking List */}
        <div className="space-y-3">
          {rankings.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900/50 rounded-2xl border border-neutral-800">
              <Gamepad2 size={48} className="mx-auto mb-4 text-neutral-600" />
              <p className="text-neutral-500">No hay registros aún</p>
              <Link 
                href="/reto-gamer"
                className="inline-block mt-4 px-6 py-2 bg-[#d99133] text-black font-bold rounded-full hover:bg-[#eeb055] transition-colors"
              >
                ¡Sé el primero!
              </Link>
            </div>
          ) : (
            rankings.map((entry, index) => {
              const position = index + 1;
              return (
                <div
                  key={entry.id || index}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${getRankStyle(position)} transition-all hover:scale-[1.01]`}
                >
                  {/* Rank */}
                  <div className="w-10 flex justify-center">
                    {getRankIcon(position)}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">
                      {entry.playerName || 'Jugador Anónimo'}
                    </div>
                    <div className="text-xs text-neutral-500 flex items-center gap-2 flex-wrap">
                      <span>Oleada {entry.wave || 1}</span>
                      <span>•</span>
                      <span>{entry.kills || 0} kills</span>
                      {entry.verified && (
                        <>
                          <span>•</span>
                          <span className="text-green-400 flex items-center gap-1">
                            <Star size={10} /> Verificado
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Score/Time */}
                  <div className="text-right">
                    {activeCategory === 'speedrun_boss' ? (
                      <div className="text-xl font-bold text-cyan-400">
                        {formatTime(entry.timeToBoss)}
                      </div>
                    ) : activeCategory === 'survival' ? (
                      <div className="text-xl font-bold text-purple-400">
                        {formatTime(entry.duration)}
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-[#d99133]">
                        {entry.score?.toLocaleString() || 0}
                      </div>
                    )}
                    <div className="text-xs text-neutral-500">{entry.date}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Export Button (Admin) */}
        <div className="mt-8 text-center">
          <button
            onClick={downloadCSV}
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-colors"
          >
            <Download size={18} />
            Exportar a Excel/CSV
          </button>
          <p className="text-xs text-neutral-600 mt-2">
            Descarga todos los datos del ranking
          </p>
        </div>

        {/* Play CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/reto-gamer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#d99133] to-[#b07020] hover:from-[#eeb055] hover:to-[#d99133] text-black font-black text-lg rounded-2xl shadow-lg hover:shadow-[#d99133]/30 transition-all"
          >
            <Gamepad2 size={24} />
            ¡JUGAR AHORA!
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 mt-12 py-6 text-center text-neutral-600 text-sm">
        <p>Big Jack - Reto Gamer 2024</p>
        <p className="text-xs mt-1">Los ganadores serán contactados por WhatsApp</p>
      </footer>
    </div>
  );
}
