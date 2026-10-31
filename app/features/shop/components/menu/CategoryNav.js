"use client";

/**
 * Navegación fija de la carta: solo texto, la sección visible queda resaltada
 * (scroll-spy) para que el cliente siempre sepa dónde está.
 */
export default function CategoryNav({ sections, activeId, onNavigate, className = "" }) {
  return (
    <nav
      aria-label="Secciones de la carta"
      className={`sticky top-[var(--header-h)] z-40 bg-bj-bg/90 backdrop-blur-md ${className}`}
    >
      <ul className="mx-auto flex max-w-3xl justify-between gap-2 px-5 sm:justify-start sm:gap-10">
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={() => onNavigate?.(section.id)}
                aria-current={isActive ? "true" : undefined}
                className={`relative flex min-h-12 items-center text-sm font-semibold transition-colors ${
                  isActive ? "text-white" : "text-neutral-500 hover:text-neutral-200"
                }`}
              >
                {section.navLabel}
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-bj-yellow transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                  aria-hidden="true"
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
