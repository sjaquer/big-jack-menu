import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Instagram, MapPin, Navigation, Clock, Clipboard, Sparkles } from "lucide-react";

export default function FooterSection({
  restaurantInfo,
  PEDIDOSYA_LINK,
  RAPPI_LINK,
}) {
  return (
    <footer className="mt-auto bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-t-2 border-[#FCC900]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Principal Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
          {/* About us */}
          <div className="space-y-5 lg:col-span-1">
            <div>
              <div className="relative h-16 w-48 mb-4">
                <Image
                  src="/images/bigjacklogotipo.svg"
                  alt={restaurantInfo.name}
                  fill
                  sizes="192px"
                  className="object-contain drop-shadow-[0_0_15px_rgba(252,201,0,0.24)]"
                />
              </div>
              <p className="text-[#C0C0C0] text-sm leading-relaxed">{restaurantInfo.slogan}</p>
              <div className="mt-4 rounded-xl border border-[#FCC900]/45 px-4 py-3 bg-[#1E1E1E]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#FCC900] font-black">
                  Central de Potencia
                </p>
                <p className="font-signature text-white text-lg mt-1">Sello de autenticidad</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-600 font-bold mb-3">
                Síguenos
              </p>
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 bg-[#FCC900]/15 border border-[#FCC900]/40 hover:bg-[#FCC900] hover:border-[#FCC900] rounded-xl flex items-center justify-center transition-all group"
                  title="WhatsApp"
                >
                  <MessageCircle
                    size={20}
                    className="text-[#FCC900] group-hover:text-black transition-colors"
                  />
                </a>
                <a
                  href={`https://instagram.com/${restaurantInfo.contact.instagram.replace(
                    "@",
                    ""
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 bg-[#B22222]/20 border border-[#B22222]/50 hover:bg-[#B22222] hover:border-[#B22222] rounded-xl flex items-center justify-center transition-all group"
                  title="Instagram"
                >
                  <Instagram
                    size={20}
                    className="text-[#ffb4b4] group-hover:text-white transition-colors"
                  />
                </a>
                <a
                  href={restaurantInfo.contact.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 bg-black border border-neutral-800 hover:border-white hover:bg-neutral-900 rounded-xl flex items-center justify-center transition-all group"
                  title="TikTok"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white/70 group-hover:text-white transition-colors"
                  >
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Location and address */}
          <div className="space-y-5">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-[#FCC900]" /> Ubicación
              </h4>
              <div className="space-y-3 text-sm">
                <p className="text-neutral-400 leading-relaxed">
                  {restaurantInfo.contact.address}
                </p>
                <a
                  href={restaurantInfo.contact.googleMapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-white font-semibold transition-all active:scale-95 animate-pulse-slow"
                >
                  <Navigation size={16} />
                  Abrir en Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="space-y-5">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Clock size={18} className="text-[#FCC900]" /> Horarios
              </h4>
              <div className="space-y-3 text-sm">
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400 font-medium">Lunes - Jueves</span>
                      <span className="text-white font-semibold">18:00 - 01:00</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400 font-medium">Viernes - Domingo</span>
                      <span className="text-[#FCC900] font-black">18:00 - 01:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Razón Social / Libro de Reclamaciones */}
          <div className="space-y-5">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Clipboard size={18} className="text-[#FCC900]" /> Legal
              </h4>
              <div className="space-y-4">
                <div className="space-y-2 text-xs">
                  <p className="text-neutral-400">
                    <span className="font-semibold text-white">RUC:</span> {restaurantInfo.ruc}
                  </p>
                  <p className="text-neutral-400">
                    <span className="font-semibold text-white">Razón Social:</span>
                    <br />
                    <span className="text-xs">Big Jack Perú S.A.C.</span>
                  </p>
                </div>
                <Link
                  href="/libro-de-reclamaciones"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#FCC900] hover:bg-[#e2b500] text-black rounded-xl font-bold transition-all shadow-xl shadow-[#FCC900]/20 active:scale-95 w-full justify-center text-sm"
                >
                  <Clipboard size={16} />
                  Libro de Reclamaciones
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & links */}
        <div className="border-t-2 border-neutral-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-[#C0C0C0] text-center md:text-left">
              © {new Date().getFullYear()}{" "}
              <span className="font-bold text-white">{restaurantInfo.name}</span>. Menos cartón.
              Más carne. Legal.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <Link
                href="/links"
                className="text-xs text-[#FCC900] hover:text-[#e2b500] transition-colors font-bold underline"
              >
                Todos nuestros enlaces
              </Link>
              <Link
                href="/quienes"
                className="text-xs text-neutral-400 hover:text-[#FCC900] transition-colors font-semibold"
              >
                Quiénes somos
              </Link>
              <a
                href="#menu-section"
                className="text-xs text-neutral-400 hover:text-[#FCC900] transition-colors font-semibold"
              >
                Volver al menú
              </a>
              <p className="text-xs flex items-center gap-2 text-[#C0C0C0]">
                Hecho en Lima <Sparkles size={14} className="text-[#B22222]" /> con calle
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
