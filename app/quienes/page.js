"use client";
import Link from "next/link";
import { Heart, Star, Printer, Flame, Zap, MapPin, ArrowLeft, MessageCircle } from "lucide-react";
import { restaurantInfo } from "../data/menuData";

export default function QuienesPage() {
  return (
    <div className="min-h-screen bg-[#0F0F12] text-white font-sans selection:bg-[#FCC900] selection:text-black">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F12]/95 backdrop-blur-md border-b-2 border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-neutral-300 hover:text-[#FCC900] transition-colors font-bold text-xs uppercase tracking-wider">
            <ArrowLeft size={18} />
            <span>Volver al menú</span>
          </Link>
          <span className="font-anton text-2xl tracking-wider text-[#FCC900]">BIG JACK</span>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <section className="relative overflow-hidden rounded-3xl border-3 border-[#FCC900]/40 bg-[#131317] p-8 md:p-12 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(252,201,0,0.15),_transparent_65%)]" />
            
            <div className="relative z-10 space-y-6">
              <span className="tag-streetwear">
                [ NUESTRA ESENCIA ]
              </span>
              <h1 className="font-anton text-4xl sm:text-6xl md:text-7xl leading-[0.9] text-white uppercase tracking-tight">
                HAMBURGUESAS <br />
                <span className="text-[#FCC900]">ARTESANALES Y GRUESAS</span>
              </h1>
              <p className="max-w-3xl text-neutral-300 text-sm md:text-base leading-relaxed font-medium">
                Aquí no hay misterios ni rodeos. Preparamos hamburguesas con carne 100% de res a la plancha, queso derretido en su punto y salsas de la casa hechas a diario. Desde Centro de Lima para todo aquel que busca comer rico, al toque y sin floros.
              </p>
              <p className="text-xs uppercase tracking-widest text-[#FCC900] font-black">SABOR REAL LIMEÑO</p>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            <article className="bg-[#131317] border-2 border-neutral-800 p-8 rounded-3xl hover:border-[#FCC900] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 bg-[#FCC900]/15 rounded-2xl flex items-center justify-center border border-[#FCC900]/30">
                <Flame className="text-[#FCC900]" size={24} />
              </div>
              <h2 className="font-anton text-3xl text-white uppercase tracking-wide">MISIÓN</h2>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Servir hamburguesas gruesas, jugosas y bien despachadas con ingredientes frescos y atención rápida. Menos cajas bonitas vacías y más sabor real.
              </p>
            </article>

            <article className="bg-[#131317] border-2 border-neutral-800 p-8 rounded-3xl hover:border-[#FCC900] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 bg-[#FCC900]/15 rounded-2xl flex items-center justify-center border border-[#FCC900]/30">
                <Zap className="text-[#FCC900]" size={24} />
              </div>
              <h2 className="font-anton text-3xl text-white uppercase tracking-wide">VISIÓN</h2>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Ser la hamburguesería preferida de Centro de Lima y crecer manteniendo lo que nos caracteriza: buena carne, trato directo y entregas a tiempo.
              </p>
            </article>
          </section>

          <section className="space-y-8">
            <header className="text-center space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-[#FCC900]">[ FILOSOFÍA ]</p>
              <h3 className="font-anton text-3xl sm:text-4xl text-white uppercase">CÓMO TRABAJAMOS</h3>
            </header>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Heart,
                  title: "Respeto por el cliente",
                  desc: "Tratamos cada pedido como si fuera para la casa.",
                },
                {
                  icon: Star,
                  title: "Calidad sin maquillaje",
                  desc: "Fotos reales, producto real y punto real.",
                },
                {
                  icon: Zap,
                  title: "Operación rápida",
                  desc: "Flujo directo para pedidos grandes o recojo express.",
                },
                {
                  icon: MapPin,
                  title: "Centro de Lima",
                  desc: "Cobertura céntrica y despacho cercano.",
                },
              ].map((item, i) => (
                <article key={i} className="bg-[#131317] border-2 border-neutral-800 p-6 rounded-2xl hover:border-[#FCC900]/60 transition-all">
                  <div className="w-10 h-10 bg-[#FCC900]/15 border border-[#FCC900]/30 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="text-[#FCC900]" size={20} />
                  </div>
                  <h4 className="font-bold text-white text-base mb-1 uppercase tracking-wide">{item.title}</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed font-medium">{item.desc}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="bg-[#131317] border-2 border-neutral-800 rounded-3xl p-8 text-center space-y-6">
            <p className="text-white text-base font-bold">Si quieres pedir para equipo, oficina o evento, lo coordinamos por WhatsApp en un solo flujo.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="btn-streetwear px-6 py-3.5 rounded-xl flex items-center gap-2 text-sm shadow-xl"
              >
                <MessageCircle size={18} />
                Pedir por WhatsApp
              </a>
              <Link
                href="/"
                className="px-6 py-3.5 rounded-xl bg-[#1F1F24] border-2 border-neutral-700 hover:border-[#FCC900] text-white font-bold text-sm transition-all"
              >
                Ver menú completo
              </Link>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <p className="text-xs text-neutral-400 font-bold mb-2">Base operativa: Centro de Lima</p>
              <button
                onClick={() => window.print()}
                className="text-xs text-neutral-500 hover:text-white flex items-center justify-center gap-2 mx-auto transition-colors font-bold"
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