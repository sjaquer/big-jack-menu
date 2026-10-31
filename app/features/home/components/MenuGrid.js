"use client";

import { Sparkles } from "lucide-react";
import CategoryCarousel from "./CategoryCarousel";
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
  const categoriesList = Array.from(new Set(filteredItems.map((item) => item.category)));

  return (
    <main id="menu-section" className="w-full min-w-0 max-w-6xl mx-auto px-4 py-8 space-y-12">
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
              <CategoryCarousel
                key={category}
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
