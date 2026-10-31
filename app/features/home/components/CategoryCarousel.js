"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

export default function CategoryCarousel({
  category,
  items = [],
  cart,
  onAdd,
  onOpenModal,
  recentlyAdded,
  hasPrimaryProduct,
  PRIMARY_CATEGORIES,
  COMPLEMENT_CATEGORIES,
}) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e) => {
    const container = e.currentTarget;
    if (!container.children.length) return;
    const scrollLeft = container.scrollLeft;
    let closestIndex = 0;
    let minDiff = Infinity;

    Array.from(container.children).forEach((child, i) => {
      const diff = Math.abs(child.offsetLeft - container.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  const scrollToIndex = (idx) => {
    const container = containerRef.current;
    if (!container) return;
    const targetItem = container.children[idx];
    if (targetItem) {
      const targetLeft = targetItem.offsetLeft - container.offsetLeft;
      container.scrollTo({ left: targetLeft, behavior: "smooth" });
      setActiveIndex(idx);
    }
  };

  const scrollDir = (dir) => {
    const target = dir === "left" ? activeIndex - 1 : activeIndex + 1;
    if (target >= 0 && target < items.length) {
      scrollToIndex(target);
    }
  };

  return (
    <section className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#FCC900]" />
          <h3 className="font-anton text-2xl sm:text-3xl text-white uppercase tracking-wider">
            {category}
          </h3>
          <span className="text-xs font-bold text-neutral-500">
            ({items.length})
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="inline-flex items-center gap-1.5 bg-[#1F1F24] border-2 border-neutral-700 px-3 py-1 rounded-full text-xs font-black text-[#FCC900] tracking-wider uppercase shadow-md">
            <span>OPCIÓN</span>
            <span className="text-white">{activeIndex + 1}</span>
            <span className="text-neutral-500">/</span>
            <span className="text-neutral-400">{items.length}</span>
          </div>

          {items.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-hide">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeIndex === idx
                      ? "w-7 bg-[#FCC900] shadow-sm shadow-[#FCC900]/50"
                      : "w-2.5 bg-neutral-700 hover:bg-neutral-500"
                  }`}
                  aria-label={`Ir al producto ${idx + 1} de ${category}`}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => scrollDir("left")}
              disabled={activeIndex === 0}
              className="w-8 h-8 rounded-full bg-[#131317] border-2 border-neutral-800 hover:border-[#FCC900] disabled:opacity-30 disabled:border-neutral-900 flex items-center justify-center text-white transition-colors active:scale-95"
              aria-label={`Anterior producto en ${category}`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollDir("right")}
              disabled={activeIndex === items.length - 1}
              className="w-8 h-8 rounded-full bg-[#131317] border-2 border-neutral-800 hover:border-[#FCC900] disabled:opacity-30 disabled:border-neutral-900 flex items-center justify-center text-white transition-colors active:scale-95"
              aria-label={`Siguiente producto en ${category}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="carousel-snap-container gap-4 pb-4 scrollbar-hide w-full"
      >
        {items.map((item) => {
          const isComplement = COMPLEMENT_CATEGORIES.includes(item.category);
          const complementBlocked = isComplement && !hasPrimaryProduct;

          return (
            <div
              key={item.id}
              className="carousel-snap-item w-[280px] sm:w-[320px] flex-shrink-0"
            >
              <ProductCard
                item={item}
                cart={cart}
                onAdd={onAdd}
                onOpenModal={onOpenModal}
                recentlyAdded={recentlyAdded}
                complementBlocked={complementBlocked}
                PRIMARY_CATEGORIES={PRIMARY_CATEGORIES}
                COMPLEMENT_CATEGORIES={COMPLEMENT_CATEGORIES}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
