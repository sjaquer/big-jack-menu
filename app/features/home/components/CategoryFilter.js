"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Flame } from "lucide-react";

export default function CategoryFilter({
  categories = [],
  selectedCategory,
  onSelectCategory,
  searchQuery = "",
  onSearchChange,
  categoryCounts = {},
}) {
  const categoryScrollerRef = useRef(null);
  const leftSentinelRef = useRef(null);
  const rightSentinelRef = useRef(null);
  const [scrolledLeft, setScrolledLeft] = useState(false);
  const [scrolledRight, setScrolledRight] = useState(false);

  useEffect(() => {
    const scroller = categoryScrollerRef.current;
    const leftSentinel = leftSentinelRef.current;
    const rightSentinel = rightSentinelRef.current;
    if (!scroller || !leftSentinel || !rightSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === leftSentinel) {
            setScrolledLeft(!entry.isIntersecting);
          }
          if (entry.target === rightSentinel) {
            setScrolledRight(!entry.isIntersecting);
          }
        });
      },
      { root: scroller, threshold: 0.1 }
    );

    observer.observe(leftSentinel);
    observer.observe(rightSentinel);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-[73px] z-40 bg-[#0F0F12]/95 backdrop-blur-md border-b-3 border-neutral-800 py-4 shadow-xl overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        {/* Buscador en Tiempo Real & Título Explicativo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="tag-streetwear self-start sm:self-auto">
            [ MENÚ & FILTRAR EN LA CARTA ]
          </span>

          {onSearchChange && (
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar ingrediente (smash, tocino, queso)..."
                aria-label="Buscar productos por nombre o ingrediente"
                className="w-full bg-[#131317] border-2 border-neutral-700 focus:border-[#FCC900] rounded-xl pl-10 pr-9 py-2 text-xs font-bold text-white placeholder:text-neutral-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scroller de Categorías */}
        <div className="relative">
          <div
            className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0F0F12] to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
              scrolledLeft ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0F0F12] to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
              scrolledRight ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            ref={categoryScrollerRef}
            className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 items-center"
          >
            <div
              ref={leftSentinelRef}
              className="w-px h-px flex-shrink-0 opacity-0 pointer-events-none"
            />
            {["TODOS", ...categories].map((cat, idx) => {
              const isActive = selectedCategory === cat;
              const count = categoryCounts[cat];

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={(e) => {
                    onSelectCategory(cat);
                    e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                  style={{ "--index": idx }}
                  className={`min-h-[44px] px-5 py-2.5 rounded-full text-xs font-black tracking-wider transition-all border-2 whitespace-nowrap flex items-center gap-2 uppercase active:scale-95 flex-shrink-0 ${
                    isActive
                      ? "bg-[#FCC900] text-black border-[#FCC900] shadow-lg shadow-[#FCC900]/20 font-black scale-105"
                      : "bg-[#131317] text-neutral-300 border-neutral-800 hover:border-[#FCC900]/50 hover:text-white"
                  }`}
                >
                  <span>{cat === "TODOS" ? "TODO EL MENÚ" : cat}</span>
                  {typeof count === "number" && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? "bg-black text-[#FCC900]" : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
            <div
              ref={rightSentinelRef}
              className="w-px h-px flex-shrink-0 opacity-0 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
