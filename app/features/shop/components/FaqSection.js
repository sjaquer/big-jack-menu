import { Plus } from "lucide-react";
import { getFaqItems } from "../seo";

// Las mismas preguntas que se publican como FAQPage en JSON-LD.
export default function FaqSection() {
  return (
    <section aria-labelledby="faq-title" className="mx-auto max-w-3xl px-5 pb-32">
      <h2 id="faq-title" className="reveal mb-8 font-anton text-4xl uppercase text-white sm:text-5xl">
        Lo que siempre nos preguntan
      </h2>
      <div className="divide-y divide-neutral-800 border-y border-neutral-800">
        {getFaqItems().map((item) => (
          <details key={item.question} className="group">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-semibold text-white [&::-webkit-details-marker]:hidden">
              {item.question}
              <Plus size={20} className="shrink-0 text-neutral-500 transition-transform group-open:rotate-45" aria-hidden="true" />
            </summary>
            <p className="max-w-xl pb-6 leading-relaxed text-neutral-400">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
