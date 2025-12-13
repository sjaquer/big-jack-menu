"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Instagram, 
  MessageCircle, 
  Music2, 
  Star, 
  MapPin, 
  ShoppingBag,
  Heart,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Clock,
  Flame,
  Zap,
  Users
} from "lucide-react";
import { restaurantInfo } from "../data/menuData";

export default function LinksPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mainLinks = [
    {
      id: "review",
      title: "Deja tu reseña en Google",
      description: "¿Te gustó tu pedido? Cuéntanos tu experiencia",
      href: "https://g.page/r/CRukRtdfadmpEAE/review",
      gradient: "from-yellow-500 via-orange-500 to-red-500",
      icon: Star,
      primary: true,
      badge: "¡Importante!"
    },
    {
      id: "menu",
      title: "Ver Menú Digital",
      description: "Explora nuestras hamburguesas brutales",
      href: "/",
      gradient: "from-yellow-500 to-orange-600",
      icon: ShoppingBag,
      emoji: "🍔"
    },
    {
      id: "whatsapp",
      title: "Pedir por WhatsApp",
      description: "Chatea con nosotros y haz tu pedido",
      href: `https://wa.me/${restaurantInfo.contact.whatsapp}`,
      gradient: "from-green-500 to-emerald-600",
      icon: MessageCircle,
      emoji: "💬"
    },
    {
      id: "pedidosya",
      title: "Delivery por PedidosYa",
      description: "Recibe tu pedido en casa",
      href: "https://www.pedidosya.com.pe/restaurantes/lima/big-jack-0c79d59d-90de-48bd-aa0d-3a5277f7da49-menu",
      gradient: "from-pink-500 to-rose-600",
      icon: TrendingUp,
      emoji: "🛵"
    },
    {
      id: "quienes",
      title: "Quiénes Somos",
      description: "Conoce nuestra historia y valores",
      href: "/quienes",
      gradient: "from-purple-500 to-indigo-600",
      icon: Users,
      emoji: "🔥"
    },
    {
      id: "game",
      title: "🎮 Reto Gamer",
      description: "¡Juega Neon Burger Hell y destruye a Jack!",
      href: "/reto-gamer",
      gradient: "from-red-500 via-orange-500 to-yellow-500",
      icon: Zap,
      emoji: "👾",
      badge: "¡Nuevo!"
    }
  ];

  const socialLinks = [
    {
      id: "instagram",
      title: "Instagram",
      username: restaurantInfo.contact.instagram,
      href: `https://instagram.com/${restaurantInfo.contact.instagram.replace('@', '')}`,
      icon: Instagram,
      color: "from-purple-600 via-pink-500 to-orange-400",
      followers: "Síguenos"
    },
    {
      id: "tiktok",
      title: "TikTok",
      username: "@bigjackpe",
      href: restaurantInfo.contact.tiktok,
      icon: Music2,
      color: "from-cyan-400 via-black to-pink-500",
      followers: "Videos"
    },
    {
      id: "maps",
      title: "Google Maps",
      username: "Ubícanos",
      href: restaurantInfo.contact.googleMapsLink,
      icon: MapPin,
      color: "from-blue-500 to-green-500",
      followers: "Visítanos"
    }
  ];

  const stats = [
    { label: "Pedidos felices", value: "500+", icon: Heart },
    { label: "Tiempo promedio", value: "15 min", icon: Clock },
    { label: "Calificación", value: "4.9★", icon: Star }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-yellow-500/20 border-t-yellow-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🍔</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-b from-yellow-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-3xl"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 sm:py-12">
        
        {/* Header / Profile - Mejorado */}
        <div className="text-center mb-10">
          {/* Logo animado */}
          <div className="mb-6 flex justify-center">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
              
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 p-1 shadow-2xl shadow-yellow-500/30">
                <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center">
                  <span className="text-6xl group-hover:scale-110 transition-transform">🍔</span>
                </div>
              </div>
              
              {/* Status badge */}
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-2.5 shadow-lg shadow-green-500/30 border-4 border-neutral-900">
                <Zap size={18} className="text-white" fill="currentColor" />
              </div>
            </div>
          </div>
          
          {/* Nombre y slogan */}
          <h1 className="text-5xl sm:text-6xl font-black mb-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
            BIG JACK
          </h1>
          
          <p className="text-lg text-neutral-300 mb-5 max-w-sm mx-auto leading-relaxed font-medium">
            {restaurantInfo.slogan}
          </p>

          {/* Location badge mejorado */}
          <div className="inline-flex items-center gap-3 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-full px-5 py-2.5 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-bold">Abierto</span>
            </div>
            <div className="w-px h-4 bg-neutral-700"></div>
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <MapPin size={14} className="text-yellow-500" />
              <span>Lince, Lima</span>
            </div>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-2xl p-3 text-center hover:border-yellow-500/30 transition-colors">
                <Icon size={18} className="text-yellow-500 mx-auto mb-1" />
                <p className="text-lg font-black text-white">{stat.value}</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* CTA Hero - Review destacado - MEJORADO */}
        <div className="mb-8 group">
          <div className="relative">
            {/* Glow animado */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-[28px] blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
            
            <div className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-3xl p-6 shadow-2xl overflow-hidden">
              {/* Pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-white" fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-white/90 text-sm font-bold">4.9 en Google</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  ¿Te gustó tu pedido? 🔥
                </h2>
                <p className="text-white/80 text-sm mb-5 leading-relaxed">
                  Tu reseña nos ayuda a seguir mejorando. ¡Gracias por tu apoyo!
                </p>
                
                <a
                  href="https://g.page/r/CRukRtdfadmpEAE/review"
                  target="_blank"
                  rel="noreferrer"
                  className="group/btn w-full min-h-[60px] bg-white hover:bg-neutral-100 text-black rounded-2xl font-black text-base flex items-center justify-between px-5 py-4 transition-all active:scale-[0.98] shadow-xl"
                >
                  <span className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Star size={20} className="text-white" fill="currentColor" />
                    </div>
                    Dejar mi reseña
                  </span>
                  <ChevronRight size={22} className="text-neutral-400 group-hover/btn:text-black group-hover/btn:translate-x-1 transition-all" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main action links - BENTO STYLE */}
        <div className="space-y-3 mb-10">
          {mainLinks.slice(1).map((link, index) => {
            const Icon = link.icon;
            return (
              <a
                key={link.id}
                href={link.href}
                target={link.href.startsWith('http') ? "_blank" : undefined}
                rel={link.href.startsWith('http') ? "noreferrer" : undefined}
                className="group block"
              >
                <div className="relative bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition-all duration-300 hover:bg-neutral-900 hover:shadow-xl hover:shadow-black/20 active:scale-[0.98]">
                  {/* Hover gradient line */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${link.gradient} rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  
                  <div className="flex items-center gap-4">
                    {/* Icon container */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all`}>
                      <span className="text-2xl">{link.emoji}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white mb-0.5 group-hover:text-yellow-400 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-neutral-500 group-hover:text-neutral-400 transition-colors">
                        {link.description}
                      </p>
                    </div>
                    
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 group-hover:bg-neutral-700 flex items-center justify-center flex-shrink-0 transition-colors">
                      <ChevronRight size={20} className="text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Social links - GRID MEJORADO */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
            <span className="text-xs uppercase tracking-[0.3em] text-neutral-600 font-bold">Síguenos</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group"
                >
                  <div className={`relative bg-gradient-to-br ${social.color} rounded-2xl p-4 shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden`}>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative flex flex-col items-center gap-2 text-white">
                      <Icon size={26} strokeWidth={2.5} />
                      <div className="text-center">
                        <p className="text-xs font-black">{social.title}</p>
                        <p className="text-[10px] opacity-70">{social.followers}</p>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Horarios card */}
        <div className="mb-10">
          <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                <Clock size={20} className="text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Horarios de atención</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-neutral-800/50">
                <span className="text-neutral-400 text-sm">Lunes - Jueves</span>
                <span className="text-white font-bold text-sm">4:00 PM - 11:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-400 text-sm">Viernes - Domingo</span>
                <span className="text-yellow-500 font-bold text-sm">12:00 PM - 11:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="text-center space-y-5 pt-4 border-t border-neutral-800/50">
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
            <Flame size={16} className="text-orange-500" />
            <span>Hamburguesas brutales desde 2024</span>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 font-bold transition-colors bg-yellow-500/10 hover:bg-yellow-500/20 px-4 py-2 rounded-full"
            >
              🍔 Ver Menú
            </Link>
            <Link 
              href="/quienes"
              className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white font-semibold transition-colors"
            >
              Quiénes somos
              <ExternalLink size={12} />
            </Link>
          </div>
          
          <div className="text-xs text-neutral-600 space-y-1">
            <p>© {new Date().getFullYear()} Big Jack. Todos los derechos reservados.</p>
            <p>RUC: {restaurantInfo.ruc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
