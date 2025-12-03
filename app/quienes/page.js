"use client";
import Link from "next/link";
import { Heart, Star, User, Printer } from "lucide-react";
import { restaurantInfo } from "../data/menuData";

export default function QuienesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white font-sans py-12 px-4">
      <div className="max-w-5xl mx-auto bg-neutral-900 rounded-xl shadow-2xl overflow-hidden border-2 border-neutral-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-orange-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.2),_transparent_60%)]" />
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-2 tracking-wide">BIG JACK</h1>
            <p className="text-lg md:text-xl font-bold tracking-widest text-black bg-yellow-400 inline-block px-4 py-1 transform -rotate-1">MANIFIESTO ESTRATÉGICO</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 md:p-12 space-y-10">
          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-neutral-800 p-6 rounded-lg border-l-8 border-yellow-500">
              <div className="flex items-center gap-3 mb-3">
                <Star className="text-yellow-400" />
                <h2 className="text-2xl font-bold">Nuestra Misión</h2>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                Democratizar la experiencia gourmet con <span className="text-yellow-400 font-semibold">alma de barrio</span>, sirviendo hamburguesas de calidad superior en un ambiente cargado de <span className="text-yellow-400 font-semibold">energía urbana</span>. Queremos que la hospitalidad sea tal que cada cliente se sienta en casa.
              </p>
            </section>

            <section className="bg-neutral-800 p-6 rounded-lg border-l-8 border-red-600">
              <div className="flex items-center gap-3 mb-3">
                <User className="text-red-400" />
                <h2 className="text-2xl font-bold">Nuestra Visión</h2>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                Consolidarnos como el <span className="text-red-400 font-semibold">referente indiscutible</span> de hamburguesas en la ciudad; crecer desde nuestra esquina hacia nuevos horizontes, sin sacrificar jamás nuestra esencia artesanal y nuestra <span className="text-red-400 font-semibold">rebeldía positiva</span>.
              </p>
            </section>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="h-1 w-full bg-neutral-800" />
            <h3 className="text-2xl text-orange-500 font-bold uppercase">Nuestros 4 pilares</h3>
            <div className="h-1 w-full bg-neutral-800" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-neutral-800 p-6 rounded-lg text-center border-t-4 border-yellow-500">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-yellow-500" />
              </div>
              <h4 className="text-lg font-bold">Hospitalidad Radical</h4>
              <p className="text-sm text-neutral-400">No somos despachadores, somos anfitriones. Primero la persona, luego la transacción.</p>
            </div>

            <div className="bg-neutral-800 p-6 rounded-lg text-center border-t-4 border-red-500">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"/></svg>
              </div>
              <h4 className="text-lg font-bold">Calidad Intransigente</h4>
              <p className="text-sm text-neutral-400">Si no te lo comerías tú, no se lo des al cliente. Respeto total por el producto.</p>
            </div>

            <div className="bg-neutral-800 p-6 rounded-lg text-center border-t-4 border-orange-500">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L11 22L7 20L13 2Z"/></svg>
              </div>
              <h4 className="text-lg font-bold">Actitud con Ritmo</h4>
              <p className="text-sm text-neutral-400">Energía urbana. Somos rápidos, limpios y mantenemos el "vibe" alto siempre.</p>
            </div>

            <div className="bg-neutral-800 p-6 rounded-lg text-center border-t-4 border-white">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2Z"/></svg>
              </div>
              <h4 className="text-lg font-bold">Somos Barrio</h4>
              <p className="text-sm text-neutral-400">Confianza y cercanía. Tratamos al cliente recurrente como a un verdadero amigo.</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-neutral-400 mb-4">Si quieres conocer más sobre nuestro equipo o cómo trabajamos, escríbenos por WhatsApp o visítanos en el local.</p>
            <div className="flex items-center justify-center gap-3">
              <a href={`https://wa.me/${restaurantInfo.contact.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-green-600 px-4 py-3 rounded-full font-bold text-white">💬 WhatsApp</a>
              <Link href="/" className="inline-flex items-center gap-2 bg-yellow-500 px-4 py-3 rounded-full font-black text-black">🍔 Volver al menú</Link>
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-neutral-800 border border-neutral-700 px-4 py-3 rounded-full text-white"> <Printer size={16} /> Guardar / Imprimir</button>
            </div>
          </div>
        </div>

        <div className="bg-neutral-950 p-6 text-center border-t border-neutral-800">
          <p className="text-xs text-neutral-500">© {new Date().getFullYear()} Big Jack — {restaurantInfo.contact.address}</p>
        </div>
      </div>
    </div>
  );
}
