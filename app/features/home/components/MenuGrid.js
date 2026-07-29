"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";

function CategoryCarousel({
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
      {/* Header de Categoría + Paginador Móvil */}
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

        {/* Paginador Móvil "X DE Y" y Puntos Táctiles */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Badge "1 DE 4" */}
          <div className="inline-flex items-center gap-1.5 bg-[#1F1F24] border-2 border-neutral-700 px-3 py-1 rounded-full text-xs font-black text-[#FCC900] tracking-wider uppercase shadow-md">
            <span>OPCIÓN</span>
            <span className="text-white">{activeIndex + 1}</span>
            <span className="text-neutral-500">/</span>
            <span className="text-neutral-400">{items.length}</span>
          </div>

          {/* Puntos interactivos táctiles */}
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

          {/* Botones Flecha (Visibles en desktop y móvil) */}
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

      {/* Carrusel Deslizable */}
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

export default function MenuGrid({
  filteredItems = [],
  selectedCategory,
  cart = [],
  onAdd,
  onOpenModal,
  recentlyAdded,
  hasPrimaryProduct,
  PRIMARY_CATEGORIES = [],
  COMPLEMENT_CATEGORIES = [],
}) {
  const categoriesList = Array.from(new Set(filteredItems.map((item) => item.category)));

  return (
    <main id="menu-section" className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-[#FCC900] font-bold">
            [ CARTA BIG JACK ]
          </p>
          <h2 className="text-3xl sm:text-4xl font-anton text-white uppercase tracking-wide">
            {selectedCategory === "TODOS" ? "NUESTRO MENÚ COMPLETO" : selectedCategory}
          </h2>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
            {filteredItems.length} {filteredItems.length === 1 ? "OPCIÓN DISPONIBLE" : "OPCIONES DISPONIBLES"}
          </p>
        </div>
        <div className="hidden sm:block bg-[#131317] border-2 border-neutral-800 rounded-2xl p-3.5 max-w-md">
          <p className="text-xs text-neutral-300 leading-relaxed flex items-center gap-2">
            <Sparkles size={15} className="text-[#FCC900] flex-shrink-0" />
            <span>
              <span className="font-black text-white uppercase mr-1">TIP:</span>
              Desliza horizontalmente para explorar todas nuestras alternativas.
            </span>
          </p>
        </div>
      </div>

      {selectedCategory === "TODOS" ? (
        <div className="space-y-12">
          {categoriesList.map((category) => {
            const itemsInCategory = filteredItems.filter((item) => item.category === category);
            if (!itemsInCategory.length) return null;

            return (
              <div key={category} className="space-y-6">
                {/* VISTA MÓVIL (grid vertical limpio) */}
                <section className="sm:hidden space-y-4">
                  <div className="flex items-center gap-3 border-b-2 border-neutral-800 pb-3">
                    <span className="w-3 h-3 rounded-full bg-[#FCC900]" />
                    <h3 className="font-anton text-2xl text-white uppercase tracking-wider">
                      {category}
                    </h3>
                    <span className="text-xs font-bold text-neutral-500">
                      ({itemsInCategory.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    {itemsInCategory.map((item) => {
                      const isComplement = COMPLEMENT_CATEGORIES.includes(item.category);
                      const complementBlocked = isComplement && !hasPrimaryProduct;

                      return (
                        <ProductCard
                          key={item.id}
                          item={item}
                          cart={cart}
                          onAdd={onAdd}
                          onOpenModal={onOpenModal}
                          recentlyAdded={recentlyAdded}
                          complementBlocked={complementBlocked}
                          PRIMARY_CATEGORIES={PRIMARY_CATEGORIES}
                          COMPLEMENT_CATEGORIES={COMPLEMENT_CATEGORIES}
                        />
                      );
                    })}
                  </div>
                </section>

                {/* VISTA COMPUTADORA (carrusel horizontal) */}
                <div className="hidden sm:block">
                  <CategoryCarousel
                    category={category}
                    items={itemsInCategory}
                    cart={cart}
                    onAdd={onAdd}
                    onOpenModal={onOpenModal}
                    recentlyAdded={recentlyAdded}
                    hasPrimaryProduct={hasPrimaryProduct}
                    PRIMARY_CATEGORIES={PRIMARY_CATEGORIES}
                    COMPLEMENT_CATEGORIES={COMPLEMENT_CATEGORIES}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isComplement = COMPLEMENT_CATEGORIES.includes(item.category);
            const complementBlocked = isComplement && !hasPrimaryProduct;

            return (
              <ProductCard
                key={item.id}
                item={item}
                cart={cart}
                onAdd={onAdd}
                onOpenModal={onOpenModal}
                recentlyAdded={recentlyAdded}
                complementBlocked={complementBlocked}
                PRIMARY_CATEGORIES={PRIMARY_CATEGORIES}
                COMPLEMENT_CATEGORIES={COMPLEMENT_CATEGORIES}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

