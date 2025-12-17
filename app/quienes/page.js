"use client";
import Link from "next/link";
import { Heart, Star, User, Printer, Flame, Zap, MapPin, ArrowLeft } from "lucide-react";
import { restaurantInfo } from "../data/menuData";

export default function QuienesPage() {
  return (
    <div className="min-h-screen bg-[#020204] text-white font-sans selection:bg-[#d99133] selection:text-black">
      {/* Navbar simple */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020204]/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-bold text-sm">Volver al menú</span>
          </Link>
          <span className="font-black text-xl tracking-tighter text-[#d99133]">BIG JACK</span>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Hero Section */}
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d99133]/10 border border-[#d99133]/20 text-[#d99133] text-xs font-bold tracking-widest uppercase mb-4">
              Manifiesto Estratégico
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              MÁS QUE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d99133] to-[#ffb04f]">HAMBURGUESAS</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Nacimos en el barrio para cambiar el juego. Sin pretensiones, con mucho fuego y una obsesión enfermiza por la calidad.
            </p>
          </div>

          {/* Misión & Visión Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="group bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl hover:border-[#d99133]/50 transition-all duration-300 hover:bg-neutral-900">
              <div className="w-12 h-12 bg-[#d99133]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Flame className="text-[#d99133]" size={24} />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">Nuestra Misión</h2>
              <p className="text-neutral-400 leading-relaxed">
                Democratizar la experiencia gourmet con <span className="text-white font-semibold">alma de barrio</span>. Servimos hamburguesas de calidad superior en un ambiente cargado de energía urbana, donde cada cliente se siente en casa desde el primer bocado.
              </p>
            </div>

            <div className="group bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl hover:border-red-500/50 transition-all duration-300 hover:bg-neutral-900">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-red-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">Nuestra Visión</h2>
              <p className="text-neutral-400 leading-relaxed">
                Ser el <span className="text-white font-semibold">referente indiscutible</span> de la ciudad. Crecer desde nuestra esquina hacia nuevos horizontes sin sacrificar jamás nuestra esencia artesanal ni nuestra rebeldía positiva.
              </p>
            </div>
          </div>

          {/* Pilares */}
          <div className="space-y-10">
            <div className="text-center">
              <h3 className="text-3xl font-black tracking-tight mb-2">NUESTROS 4 PILARES</h3>
              <div className="h-1 w-20 bg-[#d99133] mx-auto rounded-full"></div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Heart,
                  title: "Hospitalidad Radical",
                  desc: "No somos despachadores, somos anfitriones. Primero la persona, luego la transacción.",
                  color: "text-[#d99133]",
                  bg: "bg-[#d99133]/10"
                },
                {
                  icon: Star,
                  title: "Calidad Intransigente",
                  desc: "Si no te lo comerías tú, no se lo des al cliente. Respeto total por el producto.",
                  color: "text-red-500",
                  bg: "bg-red-500/10"
                },
                {
                  icon: Zap,
                  title: "Actitud con Ritmo",
                  desc: "Energía urbana. Somos rápidos, limpios y mantenemos el 'vibe' alto siempre.",
                  color: "text-yellow-400",
                  bg: "bg-yellow-400/10"
                },
                {
                  icon: MapPin,
                  title: "Somos Barrio",
                  desc: "Confianza y cercanía. Tratamos al cliente recurrente como a un verdadero amigo.",
                  color: "text-blue-400",
                  bg: "bg-blue-400/10"
                }
              ].map((item, i) => (
                <div key={i} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <item.icon className={item.color} size={20} />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-neutral-900/30 border border-neutral-800 rounded-3xl p-8 text-center space-y-6">
            <p className="text-neutral-300 text-lg font-medium">¿Quieres ser parte de esta historia?</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a 
                href={`https://wa.me/${restaurantInfo.contact.whatsapp}`} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-green-900/20"
              >
                💬 Escríbenos al WhatsApp
              </a>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 bg-[#d99133] hover:bg-[#c07e2b] text-black px-6 py-3.5 rounded-xl font-black transition-all hover:scale-105 shadow-lg shadow-[#d99133]/20"
              >
                🍔 Ver el Menú
              </Link>
            </div>
            <div className="pt-4 border-t border-neutral-800/50">
              <button 
                onClick={() => window.print()} 
                className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                <Printer size={14} /> Guardar o imprimir manifiesto
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}