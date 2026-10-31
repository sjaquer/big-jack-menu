"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { menuItems } from "../../../../data/menuData";
import { formatPrice } from "../../../../lib/format";
import { useShop } from "../../context/ShopContext";
import { UPSELL_SLUGS } from "../../constants";

const SUGGESTIONS = UPSELL_SLUGS.map((slug) => menuItems.find((item) => item.slug === slug)).filter(
  (item) => item && item.available !== false
);

// "Completa tu pedido": complementos que aún no están en el carrito, a un toque.
export default function CartSuggestions() {
  const { cart, hasPrimaryProduct, addProduct } = useShop();
  const inCart = new Set(cart.map((entry) => entry.productId));
  const items = SUGGESTIONS.filter((item) => !inCart.has(item.id));
  if (!hasPrimaryProduct || !items.length) return null;

  return (
    <section aria-labelledby="cart-suggestions" className="pt-8">
      <h3 id="cart-suggestions" className="mb-4 text-sm font-medium text-neutral-400">
        ¿Le pones algo más?
      </h3>
      <ul className="scrollbar-hide -mx-6 flex gap-3 overflow-x-auto px-6">
        {items.map((item) => (
          <li key={item.id} className="w-32 shrink-0">
            <button
              type="button"
              onClick={() => addProduct(item, item.options?.[0]?.id)}
              className="group w-full text-left"
              aria-label={`Agregar ${item.name}`}
            >
              <span className="relative block aspect-square overflow-hidden rounded-2xl bg-black">
                <Image src={item.image} alt="" fill sizes="128px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-bj-yellow text-black shadow-lg">
                  <Plus size={16} strokeWidth={2.5} />
                </span>
              </span>
              <span className="mt-2 block truncate text-sm font-medium text-white">{item.name}</span>
              <span className="text-xs text-neutral-500">{formatPrice(item.options?.[0]?.price)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
