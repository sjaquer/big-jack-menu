"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";

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
  const categoryRefs = useRef({});

  const scrollCategory = (catName, direction) => {
    const el = categoryRefs.current[catName];
    if (el) {
      const scrollAmount = direction === "left" ? -320 : 320;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Group items by category if "TODOS" is selected
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
              <section key={category} className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-neutral-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-[#FCC900]" />
                    <h3 className="font-anton text-2xl sm:text-3xl text-white uppercase tracking-wider">
                      {category}
                    </h3>
                    <span className="text-xs font-bold text-neutral-500">
                      ({itemsInCategory.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scrollCategory(category, "left")}
                      className="w-9 h-9 rounded-full bg-[#131317] border-2 border-neutral-800 hover:border-[#FCC900] flex items-center justify-center text-white transition-colors active:scale-95"
                      aria-label={`Deslizar a la izquierda en ${category}`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCategory(category, "right")}
                      className="w-9 h-9 rounded-full bg-[#131317] border-2 border-neutral-800 hover:border-[#FCC900] flex items-center justify-center text-white transition-colors active:scale-95"
                      aria-label={`Deslizar a la derecha en ${category}`}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div
                  ref={(el) => (categoryRefs.current[category] = el)}
                  className="carousel-snap-container gap-5 pb-4 scrollbar-hide -mx-4 px-4"
                >
                  {itemsInCategory.map((item) => {
                    const isComplement = COMPLEMENT_CATEGORIES.includes(item.category);
                    const complementBlocked = isComplement && !hasPrimaryProduct;

                    return (
                      <div key={item.id} className="carousel-snap-item w-[84vw] max-w-[310px] sm:w-[340px] flex-shrink-0">
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

