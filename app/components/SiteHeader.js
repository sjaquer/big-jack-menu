"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  MapPin,
  MessageCircle,
  ShoppingCart,
  User,
} from "lucide-react";
import { restaurantInfo } from "../data/menuData";

function CartBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-2 -right-2 bg-[#B22222] text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg animate-pulse">
      {count}
    </span>
  );
}

export default function SiteHeader({ cartCount = 0, onCartClick, compact = false }) {
  const schedule = restaurantInfo.hours?.[1];

  if (compact) {
    return (
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#020204] to-[#0a0a0c] backdrop-blur-lg border-b-2 border-neutral-800 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border-2 border-neutral-700 rounded-xl text-white font-bold transition-all active:scale-95"
          >
            <ChevronLeft size={20} />
            <span className="text-sm sm:text-base">Menú</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm text-neutral-400 hidden sm:block">
              Ver tu carrito
            </span>
            <Link
              href="/?openCart=true"
              aria-label="Abrir carrito"
              className="relative p-3 sm:p-4 bg-[#FCC900] text-black font-black rounded-2xl hover:bg-[#e2b500] transition-all active:scale-95 shadow-lg shadow-[#FCC900]/20"
            >
              <ShoppingCart size={22} />
              <CartBadge count={cartCount} />
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const fallbackCart = (
    <Link
      href="/?openCart=true"
      aria-label="Abrir carrito"
      className="relative p-3 bg-[#FCC900] text-black rounded-2xl hover:bg-[#e2b500] transition-all shadow-lg shadow-[#FCC900]/20 active:scale-95"
    >
      <ShoppingCart size={24} />
      <CartBadge count={cartCount} />
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#0F0F12]/95 backdrop-blur-md border-b-3 border-[#FCC900] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <div className="flex-1 flex items-center gap-3">
            <Link href="/" className="block">
              <div className="relative h-10 sm:h-12 w-44 hover:scale-105 transition-transform">
                <Image
                  src={restaurantInfo.logo}
                  alt={restaurantInfo.name}
                  fill
                  sizes="176px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <span className="hidden sm:inline-block tag-streetwear">
              [ LIMA CENTRO ]
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-6 mx-6">
            <div className="flex items-center gap-2 text-xs">
              <Clock size={16} className="text-[#FCC900]" />
              <div>
                <p className="text-[#C0C0C0]">Todos los días</p>
                <p className="text-white font-semibold">
                  {schedule ? `${schedule.open}–${schedule.close}` : "Consulta horarios"}
                </p>
              </div>
            </div>
            <Link
              href="/quienes"
              className="hidden xl:inline-flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#353535] rounded-xl text-white text-sm font-semibold transition-all border border-[#C0C0C0]/30"
            >
              <User size={16} />
              Quiénes somos
            </Link>
            <a
              href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#FCC900] hover:bg-[#e2b500] rounded-xl text-black text-sm font-black transition-all active:scale-95"
            >
              <MessageCircle size={18} />
              Pedido rápido
            </a>
          </div>

          {onCartClick ? (
            <button
              type="button"
              onClick={onCartClick}
              className="relative p-3 bg-[#FCC900] text-black rounded-2xl hover:bg-[#e2b500] transition-all shadow-lg shadow-[#FCC900]/20 active:scale-95"
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={24} />
              <CartBadge count={cartCount} />
            </button>
          ) : (
            fallbackCart
          )}
        </div>

        <div className="lg:hidden pb-3 flex items-center justify-between gap-3 border-t border-[#C0C0C0]/25 pt-3">
          <a
            href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#FCC900] hover:bg-[#e2b500] rounded-xl text-black text-sm font-black transition-all active:scale-95"
          >
            <MessageCircle size={16} />
            Pedir
          </a>
          <Link
            href="/quienes"
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#2A2A2A] hover:bg-[#353535] border border-[#C0C0C0]/35 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
          >
            <User size={16} />
            Quiénes somos
          </Link>
          <a
            href={restaurantInfo.contact.googleMapsLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#2A2A2A] hover:bg-[#353535] border border-[#C0C0C0]/35 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
          >
            <MapPin size={16} />
            Ubicación
          </a>
        </div>
      </div>
    </header>
  );
}
