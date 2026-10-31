"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { menuItems } from "../../../../data/menuData";
import { formatPrice } from "../../../../lib/format";
import { useShop } from "../../context/ShopContext";
import CartItemRow from "./CartItemRow";
import CartSuggestions from "./CartSuggestions";

const POPULAR = menuItems.filter((item) => item.popular && item.available !== false).slice(0, 2);

function EmptyCart({ onPick, onBrowse }) {
  return (
    <div className="flex h-full flex-col justify-center py-10">
      <p className="font-anton text-5xl uppercase leading-[0.9] text-white">
        Todavía
        <br />
        <span className="text-neutral-600">nada.</span>
      </p>
      <p className="mt-4 text-neutral-400">Así no se puede, vecino. Empieza por una de estas:</p>

      <ul className="mt-8 divide-y divide-white/10">
        {POPULAR.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => onPick(item)} className="group flex w-full items-center gap-4 py-4 text-left">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-black">
                <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-white group-hover:text-bj-yellow">{item.name}</span>
                <span className="text-sm text-neutral-500">{formatPrice(item.options?.[0]?.price)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" onClick={onBrowse} className="btn-streetwear mt-10 h-14 rounded-full text-lg">
        Ver la carta
      </button>
    </div>
  );
}

export default function CartItemList() {
  const router = useRouter();
  const { cart, updateQuantity, removeItem, clearCart, showToast, openSheet, closeCart } = useShop();

  if (cart.length === 0) {
    return (
      <EmptyCart
        onPick={(item) => {
          closeCart();
          openSheet(item);
        }}
        onBrowse={() => {
          closeCart();
          router.push("/#menu");
        }}
      />
    );
  }

  return (
    <>
      <ul aria-label="Productos del pedido" className="divide-y divide-white/10">
        {cart.map((item) => (
          <CartItemRow key={item.id} item={item} onQuantity={updateQuantity} onRemove={removeItem} />
        ))}
      </ul>

      <CartSuggestions />

      <button
        type="button"
        onClick={() => showToast({ type: "confirm", message: "¿Vaciamos todo el pedido?", onConfirm: clearCart })}
        className="mt-8 text-xs font-medium text-neutral-600 underline-offset-4 transition-colors hover:text-red-300 hover:underline"
      >
        Vaciar pedido
      </button>
    </>
  );
}
