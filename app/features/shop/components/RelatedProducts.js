"use client";

import { menuItems } from "../../../data/menuData";
import { useShop } from "../context/ShopContext";
import { PRIMARY_CATEGORIES } from "../constants";
import CompactItem from "./menu/CompactItem";

const LIMIT = 3;

// En una hamburguesa sugiere complementos; en un complemento, hamburguesas.
function pickRelated(currentSlug) {
  const current = menuItems.find((item) => item.slug === currentSlug);
  const wantsBurgers = current && !PRIMARY_CATEGORIES.includes(current.category);
  return menuItems
    .filter((item) => item.slug !== currentSlug && item.available !== false)
    .filter((item) => PRIMARY_CATEGORIES.includes(item.category) === wantsBurgers)
    .sort((a, b) => Number(b.popular) - Number(a.popular))
    .slice(0, LIMIT);
}

export default function RelatedProducts({ currentSlug }) {
  const { requestAdd, openSheet, cart } = useShop();
  const items = pickRelated(currentSlug);
  if (!items.length) return null;

  return (
    <section aria-labelledby="related-title" className="mx-auto max-w-3xl px-5 py-24">
      <h2 id="related-title" className="mb-6 font-anton text-4xl uppercase text-white">
        Va bien con
      </h2>
      <ul className="divide-y divide-neutral-800/80">
          {items.map((item) => (
            <li key={item.id}>
              <CompactItem
                item={item}
                quantityInCart={cart.filter((entry) => entry.productId === item.id).reduce((sum, entry) => sum + entry.quantity, 0)}
                onAdd={(product) => requestAdd(product)}
                onOpen={(product) => openSheet(product)}
              />
            </li>
          ))}
      </ul>
    </section>
  );
}
