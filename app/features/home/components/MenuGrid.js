"use client";

import { Sparkles } from "lucide-react";
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
  return (
    <main id="menu-section" className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-[#FCC900] font-bold">
            Estás viendo
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            {selectedCategory === "TODOS" ? "Menú Completo" : selectedCategory}
          </h2>
          <p className="text-sm text-neutral-400">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "producto disponible" : "productos disponibles"}
          </p>
        </div>
        <div className="bg-neutral-900/80 border-2 border-neutral-800 rounded-2xl p-4 max-w-md">
          <p className="text-xs text-neutral-400 leading-relaxed flex items-start gap-2">
            <Sparkles size={16} className="text-[#FCC900]" />
            <span>
              <span className="font-semibold text-white">Tip:</span> Toca cualquier imagen para ver
              detalles completos o usa los botones para añadir rápido al carrito.
            </span>
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
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
    </main>
  );
}
