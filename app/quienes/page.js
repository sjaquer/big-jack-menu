"use client";
import Link from "next/link";
import { Heart, Star, Printer, Flame, Zap, MapPin, ArrowLeft, MessageCircle } from "lucide-react";
import { restaurantInfo } from "../data/menuData";

export default function QuienesPage() {
  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white font-sans selection:bg-[#FCC900] selection:text-black">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1E1E1E]/95 backdrop-blur-md border-b border-[#C0C0C0]/25">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#C0C0C0] hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-bold text-sm">Volver al menu</span>
          </Link>
          <span className="font-anton text-2xl tracking-[-0.03em] text-[#FCC900]">BIG JACK</span>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto space-y-14">
          <section className="relative overflow-hidden rounded-[2rem] border-2 border-[#FCC900]/35 bg-gradient-to-br from-[#1E1E1E] via-[#232323] to-[#111111] p-8 md:p-12">
            {/* Background Effects - Fuego y Potencia Honesta */}
            {/* Radial superior izquierdo: rojo fuego */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(178,34,34,0.18),_transparent_60%)]" />
            {/* Radial inferior derecho: amarillo potencia */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(252,201,0,0.14),_transparent_58%)]" />
            {/* Textura diagonal metallic: vecino confiable */}
            <div className="absolute inset-0 opacity-[0.08]" style={{backgroundImage: "repeating-linear-gradient(45deg, rgba(192,192,192,0.15) 0px, rgba(192,192,192,0.15) 2px, transparent 2px, transparent 6px)"}} />
            
            <div className="relative z-10 space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FCC900]/15 border border-[#FCC900]/35 text-[#FCC900] text-xs font-black tracking-[0.18em] uppercase">
                Nuestra Esencia
              </span>
              <h1 className="font-anton text-5xl md:text-7xl leading-[0.9] tracking-[-0.04em]">
                HAMBURGUESAS
                <br />
                <span className="text-[#FCC900]">ARTESANALES Y GRUESAS</span>
              </h1>
              <p className="max-w-3xl text-[#C0C0C0] text-base md:text-lg leading-relaxed">
                Aquí no hay misterios ni rodeos. Preparamos hamburguesas con carne 100% de res a la plancha, queso derretido en su punto y salsas de la casa hechas a diario. Desde Centro de Lima para todo aquel que busca comer rico, al toque y sin floros.
              </p>
              <p className="font-signature text-xl text-white">Sabor Real Limeño</p>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            <article className="group bg-[#181818] border border-[#C0C0C0]/20 p-8 rounded-3xl hover:border-[#FCC900]/45 transition-all duration-300">
              <div className="w-12 h-12 bg-[#FCC900]/15 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Flame className="text-[#FCC900]" size={24} />
              </div>
              <h2 className="font-anton text-3xl tracking-[-0.03em] mb-4">Misión</h2>
              <p className="text-[#C0C0C0] leading-relaxed">
                Servir hamburguesas gruesas, jugosas y bien despachadas con ingredientes frescos y atención rápida. Menos cajas bonitas vacías y más sabor real.
              </p>
            </article>

            <article className="group bg-[#181818] border border-[#C0C0C0]/20 p-8 rounded-3xl hover:border-[#B22222]/60 transition-all duration-300">
              <div className="w-12 h-12 bg-[#B22222]/15 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-[#ffb4b4]" size={24} />
              </div>
              <h2 className="font-anton text-3xl tracking-[-0.03em] mb-4">Visión</h2>
              <p className="text-[#C0C0C0] leading-relaxed">
                Ser la hamburguesería preferida de Centro de Lima y crecer manteniendo lo que nos caracteriza: buena carne, trato directo y entregas a tiempo.
              </p>
            </article>
          </section>

          <section className="space-y-8">
            <header className="text-center">
              <h3 className="font-anton text-4xl tracking-[-0.03em]">COMO TRABAJAMOS</h3>
              <p className="text-[#C0C0C0] mt-2">Simple, claro y al grano.</p>
            </header>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Heart,
                  title: "Respeto por el cliente",
                  desc: "Tratamos cada pedido como si fuera para la casa.",
                  color: "text-[#FCC900]",
                  bg: "bg-[#FCC900]/12",
                },
                {
                  icon: Star,
                  title: "Calidad sin maquillaje",
                  desc: "Fotos reales, producto real y punto real.",
                  color: "text-[#ffb4b4]",
                  bg: "bg-[#B22222]/14",
                },
                {
                  icon: Zap,
                  title: "Operacion rapida",
                  desc: "Flujo directo para pedidos grandes o recojo express.",
                  color: "text-white",
                  bg: "bg-white/10",
                },
                {
                  icon: MapPin,
                  title: "Centro de Lima",
                  desc: "Cobertura centrica y despacho cercano.",
                  color: "text-[#FCC900]",
                  bg: "bg-[#FCC900]/12",
                },
              ].map((item, i) => (
                <article key={i} className="bg-[#181818] border border-[#C0C0C0]/20 p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <item.icon className={item.color} size={20} />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-sm text-[#C0C0C0] leading-relaxed">{item.desc}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="bg-[#171717] border border-[#C0C0C0]/25 rounded-3xl p-8 text-center space-y-6">
            <p className="text-white text-lg font-semibold">Si quieres pedir para equipo, oficina o evento, lo coordinamos por WhatsApp en un solo flujo.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#FCC900] hover:bg-[#e2b500] text-black px-6 py-3.5 rounded-xl font-black transition-all hover:scale-105 shadow-lg shadow-[#FCC900]/20"
              >
                <MessageCircle size={18} />
                Pedidos por WhatsApp
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#353535] border border-[#C0C0C0]/30 text-white px-6 py-3.5 rounded-xl font-bold transition-all hover:scale-105"
              >
                Ver menu completo
              </Link>
            </div>

            <div className="pt-4 border-t border-[#C0C0C0]/20">
              <p className="text-sm text-[#C0C0C0] mb-2">Base operativa: Centro de Lima</p>
              <button
                onClick={() => window.print()}
                className="text-xs text-[#C0C0C0] hover:text-white flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                <Printer size={14} /> Guardar o imprimir manifiesto
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}