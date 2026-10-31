"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { restaurantInfo } from "../data/menuData";
import { useShop } from "../features/shop/context/ShopContext";

// Barra mínima: logo y pedido. Nada más compite con la comida.
export default function SiteHeader() {
  const pathname = usePathname();
  const { itemsCount, openCart } = useShop();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 h-[var(--header-h)] bg-bj-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-3xl items-center gap-2 px-5">
        {!isHome && (
          <Link
            href="/"
            className="-ml-3 flex h-11 w-11 items-center justify-center rounded-full text-neutral-300 hover:text-white"
            aria-label="Volver a la carta"
          >
            <ChevronLeft size={22} />
          </Link>
        )}

        <Link href="/" className="relative h-9 w-28" aria-label={`${restaurantInfo.name}, inicio`}>
          <Image src={restaurantInfo.logo} alt="" fill sizes="112px" className="object-contain object-left" priority />
        </Link>

        <button
          type="button"
          onClick={openCart}
          className="relative ml-auto flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:text-bj-yellow"
          aria-label={itemsCount ? `Ver pedido, ${itemsCount} productos` : "Ver pedido"}
        >
          <ShoppingBag size={22} />
          {itemsCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-bj-yellow px-1 text-[11px] font-black text-black">
              {itemsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
