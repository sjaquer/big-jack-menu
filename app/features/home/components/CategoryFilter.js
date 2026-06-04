"use client";

import { useState, useEffect, useRef } from "react";

export default function CategoryFilter({
  categories = [],
  selectedCategory,
  onSelectCategory,
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
    <div className="sticky top-[73px] z-40 bg-gradient-to-b from-neutral-950 to-neutral-900/95 backdrop-blur-lg border-b-2 border-neutral-800 py-5 shadow-lg overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-3">
          Filtra por categoría
        </p>
        <div className="relative">
          {/* Sombras de atenuación laterales para indicar scroll */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-neutral-950 to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
              scrolledLeft ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-neutral-950 to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
              scrolledRight ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            ref={categoryScrollerRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4"
          >
            <div
              ref={leftSentinelRef}
              className="w-px h-px flex-shrink-0 opacity-0 pointer-events-none"
            />
            {["TODOS", ...categories].map((cat, idx) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  style={{ "--index": idx }}
                  className={`min-h-[44px] px-6 py-2.5 rounded-full text-sm font-black tracking-wide transition-all border whitespace-nowrap active:scale-95 fade-in-stagger ${
                    isActive
                      ? "bg-[#FCC900] text-white border-[#FCC900] shadow-lg shadow-[#FCC900]/25 scale-105"
                      : "bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:border-[#FCC900]/50 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  {cat === "TODOS" ? "🔥 TODO" : cat}
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
