"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Instagram, 
  MessageCircle, 
  Music2, 
  Star, 
  MapPin, 
  Gift, 
  ShoppingBag,
  Heart,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Sparkles
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
      title: "⭐ Deja tu reseña en Google",
      description: "¿Te gustó tu pedido? Cuéntanos tu experiencia",
      href: "https://g.page/r/CRukRtdfadmpEAE/review",
      gradient: "from-yellow-500 via-orange-500 to-red-500",
      icon: Star,
      primary: true,
      badge: "¡Importante!"
    },
    {
      id: "menu",
      title: "🍔 Ver Menú Digital",
      description: "Nuestras hamburguesas brutales",
      href: "/",
      gradient: "from-yellow-500 to-orange-600",
      icon: ShoppingBag,
      primary: false
    },
    {
      id: "whatsapp",
      title: "💬 Pedir por WhatsApp",
      description: "Chatea con nosotros y haz tu pedido",
      href: `https://wa.me/${restaurantInfo.contact.whatsapp}`,
      gradient: "from-green-500 to-green-600",
      icon: MessageCircle,
      primary: false
    },
    {
      id: "pedidosya",
      title: "🛵 Delivery por PedidosYa",
      description: "Recibe tu pedido en casa",
      href: "https://www.pedidosya.com.pe/restaurantes/lima/big-jack-0c79d59d-90de-48bd-aa0d-3a5277f7da49-menu",
      gradient: "from-pink-500 to-rose-600",
      icon: TrendingUp,
      primary: false
    }
  ];

  const socialLinks = [
    {
      id: "instagram",
      title: "Instagram",
      username: restaurantInfo.contact.instagram,
      href: `https://instagram.com/${restaurantInfo.contact.instagram.replace('@', '')}`,
      icon: Instagram,
      color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"
    },
    {
      id: "tiktok",
      title: "TikTok",
      username: "@bigjackpe",
      href: restaurantInfo.contact.tiktok,
      icon: Music2,
      color: "bg-gradient-to-br from-black to-cyan-400"
    },
    {
      id: "maps",
      title: "Google Maps",
      username: "Ver ubicación",
      href: restaurantInfo.contact.googleMapsLink,
      icon: MapPin,
      color: "bg-gradient-to-br from-blue-500 to-green-500"
    }
  ];

  const benefits = [
    {
      icon: Gift,
      title: "Programa de Lealtad",
      description: "Acumula puntos con cada compra"
    },
    {
      icon: Star,
      title: "Descuentos Exclusivos",
      description: "Ofertas especiales para clientes frecuentes"
    },
    {
      icon: Heart,
      title: "Recompensas",
      description: "Tu 10ma burger es gratis"
    }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white font-sans relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 sm:py-16">
        {/* Header / Profile */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 p-1 shadow-2xl shadow-yellow-900/50">
                <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-5xl font-black">
                  🍔
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                <Sparkles size={20} className="text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            BIG JACK
          </h1>
          
          <p className="text-lg text-neutral-300 mb-4 max-w-md mx-auto leading-relaxed">
            {restaurantInfo.slogan}
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
            <MapPin size={16} className="text-yellow-500" />
            <span>Lince, Lima — Lun-Jue 4-11PM | Vie-Dom 12-11PM</span>
          </div>
        </div>

        {/* CTA Hero - Review destacado */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
          <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-3xl p-6 shadow-2xl shadow-yellow-900/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-white mb-3">
                    <Star size={14} fill="currentColor" />
                    ¡Necesitamos tu opinión!
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                    ¿Te gustó tu pedido?
                  </h2>
                  <p className="text-white/90 text-base leading-relaxed">
                    Deja tu reseña en Google y ayúdanos a crecer. ¡Tu opinión importa mucho! 💛
                  </p>
                </div>
              </div>
              <a
                href="https://g.page/r/CRukRtdfadmpEAE/review"
                target="_blank"
                rel="noreferrer"
                className="group w-full min-h-[64px] bg-white hover:bg-neutral-100 text-black rounded-2xl font-black text-lg flex items-center justify-between px-6 py-4 transition-all active:scale-[0.98] shadow-xl"
              >
                <span className="flex items-center gap-3">
                  <Star size={24} className="text-yellow-600" fill="currentColor" />
                  Dejar mi reseña ahora
                </span>
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Main action links */}
        <div className="space-y-4 mb-12">
          {mainLinks.slice(1).map((link, index) => {
            const Icon = link.icon;
            return (
              <a
                key={link.id}
                href={link.href}
                target={link.href.startsWith('http') ? "_blank" : undefined}
                rel={link.href.startsWith('http') ? "noreferrer" : undefined}
                className={`group block animate-in fade-in slide-in-from-bottom duration-500`}
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <div className="relative bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm border-2 border-neutral-700 hover:border-yellow-500/50 rounded-2xl p-5 transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-yellow-900/20">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon size={28} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        {link.title}
                        {link.badge && (
                          <span className="text-[10px] px-2 py-0.5 bg-red-500 rounded-full font-black uppercase">
                            {link.badge}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-neutral-400 leading-snug">
                        {link.description}
                      </p>
                    </div>
                    <ChevronRight size={24} className="text-neutral-500 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Benefits section */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 backdrop-blur-sm border-2 border-neutral-700/50 rounded-3xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2 mb-3">
                <Gift size={18} className="text-yellow-500" />
                <span className="text-sm font-bold text-yellow-500 uppercase tracking-wider">Beneficios exclusivos</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                Únete a nuestro programa
              </h2>
              <p className="text-neutral-400 text-sm">
                Descuentos, recompensas y sorpresas para clientes frecuentes
              </p>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="bg-neutral-900/50 rounded-2xl p-5 text-center border border-neutral-700/50 hover:border-yellow-500/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-3">
                      <Icon size={24} className="text-yellow-500" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
              <p className="text-center text-sm text-yellow-400 font-semibold">
                💬 Pregunta en WhatsApp cómo participar en nuestro programa de lealtad
              </p>
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-400">
          <h3 className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-bold mb-4 text-center">
            Síguenos en redes
          </h3>
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
                  <div className={`${social.color} rounded-2xl p-4 shadow-lg hover:scale-105 active:scale-95 transition-transform`}>
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Icon size={28} />
                      <div className="text-center">
                        <p className="text-xs font-bold">{social.title}</p>
                        <p className="text-[10px] opacity-80">{social.username}</p>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4 animate-in fade-in duration-700 delay-500">
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
            <Heart size={16} className="text-red-500" fill="currentColor" />
            <span>Hecho con amor para nuestros clientes</span>
          </div>
          
          <div className="text-xs text-neutral-600">
            <p>© 2025 Big Jack. Todos los derechos reservados.</p>
            <p className="mt-1">RUC: {restaurantInfo.ruc}</p>
          </div>

          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 font-semibold transition-colors"
          >
            Volver al menú principal
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
