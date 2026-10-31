"use client";

import Image from "next/image";
import useScrollProgress from "../../hooks/useScrollProgress";

/**
 * Hero en scroll: el titular se va, la hamburguesa entra con un fundido a
 * pantalla completa y crece; al final aparecen frases cortas y un solo CTA.
 * Las capas se animan en CSS a partir de `--p` (ver `.scroll-hero` en globals.css).
 */
export default function ScrollHero({ fromPrice, area }) {
  const ref = useScrollProgress();

  return (
    <section ref={ref} aria-labelledby="hero-title" className="scroll-hero relative">
      <div className="scroll-hero-stage sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="hero-burger absolute inset-0 flex items-center justify-center">
          <div className="relative aspect-square w-[min(92vw,78dvh)]">
            <Image
              src="/images/burger-hero.webp"
              alt="Hamburguesa BIG JACK con queso derretido"
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 92vw, 78vh"
              className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.85)]"
            />
          </div>
        </div>

        <div className="hero-title relative px-6 text-center">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">{area}</p>
          <h1 id="hero-title" className="font-anton uppercase leading-[0.82] text-white">
            <span className="block text-[clamp(3.25rem,15vw,11rem)]">Hamburguesas</span>
            <span className="block text-[clamp(4.25rem,22vw,15rem)] text-bj-yellow">gruesas</span>
            <span className="mt-4 block text-[clamp(1rem,3.5vw,1.75rem)] tracking-[0.2em] text-neutral-300">
              a la plancha
            </span>
          </h1>
          <p className="hero-hint mt-14 text-[11px] uppercase tracking-[0.35em] text-neutral-500" aria-hidden="true">
            Desliza
          </p>
        </div>

        <p className="hero-word hero-word-1 absolute left-6 top-[18%] font-anton text-[clamp(2.5rem,11vw,6rem)] uppercase leading-none text-white sm:left-[10%]">
          Chorrea.
        </p>
        <p className="hero-word hero-word-2 absolute bottom-[36%] right-6 text-right text-lg font-semibold text-neutral-200 sm:right-[10%] sm:text-2xl">
          Queso derretido,
          <br />
          carne de verdad.
        </p>

        <div className="hero-cta absolute inset-x-0 bottom-[17%] flex sm:bottom-[8%] flex-col items-center gap-4 px-6">
          <p className="font-anton text-2xl uppercase tracking-wide text-white">
            Desde <span className="text-bj-yellow">{fromPrice}</span>
          </p>
          <a href="#menu" className="btn-streetwear flex h-14 items-center rounded-full px-10 text-lg">
            Ver la carta
          </a>
        </div>
      </div>
    </section>
  );
}
