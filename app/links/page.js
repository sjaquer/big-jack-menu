"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  MapPin, 
  Clock,
  ChevronRight,
  Navigation,
  Gamepad2,
  Star,
  Users,
  UtensilsCrossed
} from "lucide-react";
import { restaurantInfo } from "../data/menuData";

// SVG Icons for brands (no emojis)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = () => (
          subtitle: "Centro de Lima",
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const PedidosYaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="#FF0050"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Pe</text>
  </svg>
);

export default function LinksPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Categorías principales
  const categories = [
    {
      id: "order",
      title: "Pedir Ahora",
      links: [
        {
          id: "menu",
          title: "Ver Menú Digital",
          subtitle: "Explora y arma tu pedido",
          href: "/",
          icon: UtensilsCrossed,
          style: "primary"
        },
        {
          id: "whatsapp",
          title: "WhatsApp",
          subtitle: "Chatea y pide directo",
          href: `https://wa.me/${restaurantInfo.contact.whatsapp}`,
          icon: WhatsAppIcon,
          iconType: "svg",
          style: "whatsapp"
        },
        {
          id: "pedidosya",
          title: "PedidosYa",
          subtitle: "Delivery a tu puerta",
          href: "https://www.pedidosya.com.pe/restaurantes/lima/big-jack-0c79d59d-90de-48bd-aa0d-3a5277f7da49-menu",
          icon: PedidosYaIcon,
          iconType: "svg",
          style: "pedidosya"
        }
      ]
    },
    {
      id: "social",
      title: "Redes Sociales",
      links: [
        {
          id: "instagram",
          title: "Instagram",
          subtitle: restaurantInfo.contact.instagram,
          href: `https://instagram.com/${restaurantInfo.contact.instagram.replace('@', '')}`,
          icon: InstagramIcon,
          iconType: "svg",
          style: "instagram"
        },
        {
          id: "tiktok",
          title: "TikTok",
          subtitle: "@bigjackpe",
          href: restaurantInfo.contact.tiktok,
          icon: TikTokIcon,
          iconType: "svg",
          style: "tiktok"
        }
      ]
    },
    {
      id: "info",
      title: "Información",
      links: [
        {
          id: "maps",
          title: "Ubicación",
          subtitle: "Jr. Bartolomé Herrera 133, Lince",
          href: restaurantInfo.contact.googleMapsLink,
          icon: Navigation,
          style: "maps"
        },
        {
          id: "quienes",
          title: "Quiénes Somos",
          subtitle: "Conoce nuestra historia",
          href: "/quienes",
          icon: Users,
          style: "default"
        },
        {
          id: "game",
          title: "Reto Gamer",
          subtitle: "Juega Neon Burger Hell",
          href: "/reto-gamer",
          icon: Gamepad2,
          style: "game"
        }
      ]
    }
  ];

  const getButtonStyle = (style) => {
    const styles = {
      primary: "bg-gradient-to-r from-[#d99133] to-[#b07020] text-white hover:shadow-lg hover:shadow-[#d99133]/20",
      whatsapp: "bg-[#25D366] text-white hover:bg-[#20BD5A] hover:shadow-lg hover:shadow-[#25D366]/20",
      pedidosya: "bg-[#FF0050] text-white hover:bg-[#E6004A] hover:shadow-lg hover:shadow-[#FF0050]/20",
      instagram: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white hover:shadow-lg hover:shadow-purple-500/20",
      tiktok: "bg-black text-white border border-neutral-700 hover:border-neutral-500",
      maps: "bg-[#4285F4] text-white hover:bg-[#3B78E7] hover:shadow-lg hover:shadow-blue-500/20",
      game: "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/20",
      default: "bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700"
    };
    return styles[style] || styles.default;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#020204] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-3 border-[#d99133]/20 border-t-[#d99133] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020204] text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,145,51,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-10">
        
        {/* Header - Logo y Marca */}
        <header className="flex flex-col items-center mb-10">
          {/* Logo Title */}
          <div className="relative w-64 h-32 mb-2">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-20 bg-[#d99133] blur-[60px] opacity-20 rounded-full pointer-events-none"></div>
             <Image 
               src="/images/bigjacktitle.webp" 
               alt="Big Jack"
               fill
               className="object-contain drop-shadow-2xl"
               priority
             />
          </div>
          
          {/* Slogan */}
          <p className="text-neutral-400 text-sm mb-5 font-medium tracking-wide">
            {restaurantInfo.slogan}
          </p>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-neutral-300">Abierto</span>
            <span className="text-neutral-600">|</span>
            <MapPin size={14} className="text-[#d99133]" />
            <span className="text-neutral-400">Centro de Lima</span>
          </div>
        </header>

        {/* Intro SEO/Misión */}
        <section className="mb-8 text-center space-y-3">
          <h1 className="text-xl font-black text-white leading-tight">
            Burger spot de barrio en pleno Centro de Lima
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Nacimos en una esquina céntrica para servir hamburguesas gruesas con alma peruana. Atención directa, delivery cercano y la misión de llevar nuestro sabor a más barrios del país.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-[#d99133] text-black font-bold hover:bg-[#c07e2b] transition-all"
            >
              Ver menú y pedir
            </Link>
            <a
              href={restaurantInfo.contact.googleMapsLink}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl border border-neutral-700 text-white font-semibold hover:border-[#d99133]/60 hover:text-[#d99133] transition-all"
            >
              Estamos en Centro de Lima
            </a>
          </div>
        </section>

        {/* Google Review CTA */}
        <section className="mb-8">
          <a
            href="https://g.page/r/CRukRtdfadmpEAE/review"
            target="_blank"
            rel="noreferrer"
            className="group block"
          >
            <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-[#d99133]/50 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d99133]/5 rounded-full blur-2xl"></div>
              
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                  <GoogleIcon />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="text-[#FBBC05]" fill="currentColor" />
                    ))}
                    <span className="text-neutral-500 text-xs ml-1">4.9</span>
                  </div>
                  <p className="text-white font-bold text-sm">Deja tu reseña en Google</p>
                  <p className="text-neutral-500 text-xs">Tu opinión nos ayuda a mejorar</p>
                </div>
                
                <ChevronRight size={20} className="text-neutral-600 group-hover:text-[#d99133] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </div>
          </a>
        </section>

        {/* Links por Categoría */}
        {categories.map((category) => (
          <section key={category.id} className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3 px-1">
              {category.title}
            </h2>
            
            <div className="space-y-2">
              {category.links.map((link) => {
                const Icon = link.icon;
                const isExternal = link.href.startsWith('http');
                
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                    className={`group flex items-center gap-4 w-full p-4 rounded-xl transition-all active:scale-[0.98] ${getButtonStyle(link.style)}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      {link.iconType === "svg" ? <Icon /> : <Icon size={22} />}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-bold text-sm">{link.title}</p>
                      <p className="text-xs opacity-70 truncate">{link.subtitle}</p>
                    </div>
                    
                    <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </a>
                );
              })}
            </div>
          </section>
        ))}

        {/* Horarios */}
        <section className="mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#d99133]/10 flex items-center justify-center">
                <Clock size={20} className="text-[#d99133]" />
              </div>
              <h3 className="font-bold text-white">Horarios</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Lun - Jue</span>
                <span className="text-white font-medium">4:00 PM - 1:00 AM</span>
              </div>
              <div className="h-px bg-neutral-800"></div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Vie - Dom</span>
                <span className="text-[#d99133] font-bold">5:00 PM - 1:00 AM</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-6 border-t border-neutral-800">
          <p className="text-neutral-600 text-xs mb-2">
            Hamburguesas brutales desde 2025
          </p>
          <p className="text-neutral-700 text-xs">
            RUC: {restaurantInfo.ruc}
          </p>
          <p className="text-neutral-700 text-xs mt-1">
            © {new Date().getFullYear()} Big Jack
          </p>
        </footer>
      </div>
    </div>
  );
}
