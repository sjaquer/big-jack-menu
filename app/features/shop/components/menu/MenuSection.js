"use client";

import { useMemo } from "react";
import { categories, categoryInfo, menuItems } from "../../../../data/menuData";
import { useShop } from "../../context/ShopContext";
import { COMPLEMENT_CATEGORIES, PRIMARY_CATEGORIES } from "../../constants";
import useScrollSpy from "../../hooks/useScrollSpy";
import CategoryNav from "./CategoryNav";
import CompactItem from "./CompactItem";
import FeatureItem from "./FeatureItem";

const SECTIONS = categories
  .map((category) => ({
    category,
    id: categoryInfo[category]?.id || category.toLowerCase(),
    title: categoryInfo[category]?.title || category,
    navLabel: categoryInfo[category]?.navLabel || categoryInfo[category]?.title || category,
    subtitle: categoryInfo[category]?.subtitle || "",
    featured: PRIMARY_CATEGORIES.includes(category),
    items: menuItems.filter((item) => item.category === category),
  }))
  .filter((section) => section.items.length > 0);

const SECTION_IDS = SECTIONS.map((section) => section.id);

export default function MenuSection() {
  const { cart, hasPrimaryProduct, requestAdd, openSheet } = useShop();
  const { activeId, setActiveId } = useScrollSpy(SECTION_IDS);

  const quantities = useMemo(() => {
    const map = new Map();
    cart.forEach((entry) => map.set(entry.productId, (map.get(entry.productId) || 0) + entry.quantity));
    return map;
  }, [cart]);

  const handlers = {
    onAdd: (product) => requestAdd(product),
    onOpen: (product) => openSheet(product),
  };

  return (
    <section id="menu" aria-labelledby="menu-title" className="scroll-mt-[var(--header-h)] pt-24 sm:pt-32">
      <h2
        id="menu-title"
        className="reveal mx-auto max-w-3xl px-5 font-anton text-[clamp(4rem,20vw,9rem)] uppercase leading-[0.85] text-white"
      >
        La <span className="text-bj-yellow">carta</span>
      </h2>

      <CategoryNav sections={SECTIONS} activeId={activeId} onNavigate={setActiveId} className="mt-10" />

      <div className="mx-auto max-w-3xl px-5">
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className={section.featured ? "pt-16" : "pt-24"}
          >
            <header className={section.featured ? "sr-only" : "reveal mb-10"}>
              <h3
                id={`${section.id}-title`}
                className={`font-anton uppercase leading-none ${
                  section.featured ? "text-2xl tracking-[0.2em] text-neutral-500" : "text-4xl text-white sm:text-5xl"
                }`}
              >
                {section.title}
              </h3>
              {section.subtitle && !section.featured && (
                <p className="mt-2 text-sm text-neutral-500">{section.subtitle}</p>
              )}
            </header>

            {section.featured ? (
              <ul className="space-y-24 sm:space-y-32">
                {section.items.map((item, index) => (
                  <li key={item.id}>
                    <FeatureItem
                      item={item}
                      index={index}
                      priority={index === 0}
                      quantityInCart={quantities.get(item.id) || 0}
                      {...handlers}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="divide-y divide-neutral-800/80">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <CompactItem
                      item={item}
                      quantityInCart={quantities.get(item.id) || 0}
                      note={
                        COMPLEMENT_CATEGORIES.includes(item.category) && !hasPrimaryProduct
                          ? "Va con hamburguesa"
                          : null
                      }
                      {...handlers}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
