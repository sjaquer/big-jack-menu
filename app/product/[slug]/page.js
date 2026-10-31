import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { menuItems, restaurantInfo } from "../../data/menuData";
import { ArrowRight, ClipboardList, Flame, Leaf, Star } from "lucide-react";
import SiteHeader from "../../components/SiteHeader";
import ProductAddToCart from "./ProductAddToCart";

const FEATURES = [
  {
    icon: Leaf,
    title: "Ingredientes frescos",
    description: "Seleccionados a diario y preparados al momento de tu pedido.",
  },
  {
    icon: Flame,
    title: "Cocción perfecta",
    description: "Punto exacto para máxima jugosidad y sabor.",
  },
  {
    icon: Star,
    title: "Sabor único",
    description: "Receta exclusiva de Big Jack, sin floro.",
  },
];

export function generateStaticParams() {
  return menuItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = menuItems.find((item) => item.slug === slug);
  if (!product) {
    return {
      title: "Producto no encontrado | " + restaurantInfo.name,
      description: restaurantInfo.slogan,
    };
  }
  return {
    title: `${product.name} | ${restaurantInfo.name}`,
    description: product.description,
    openGraph: {
      title: `${product.name} | ${restaurantInfo.name}`,
      description: product.description,
      type: "article",
      images: [product.image],
    },
  };
}

export default async function ProductDetail({ params }) {
  const { slug } = await params;
  const product = menuItems.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const priceRange = product.options?.length
    ? product.options.reduce(
        (acc, opt) => [Math.min(acc[0], opt.price), Math.max(acc[1], opt.price)],
        [Infinity, -Infinity]
      )
    : [0, 0];

  const minPrice = priceRange[0] === Infinity ? 0 : priceRange[0];
  const maxPrice = priceRange[1] === -Infinity ? minPrice : priceRange[1];

  return (
    <div className="min-h-screen bg-[#0F0F12] text-white">
      <SiteHeader compact />

      <main>
        <section className="max-w-6xl mx-auto px-4 py-8 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="relative">
              <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden border-4 border-[#FCC900] shadow-2xl">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                {product.popular && (
                  <div className="absolute top-6 left-6 block-yellow text-xs sm:text-sm shadow-xl z-20">
                    HIT LIMEÑO
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent p-6 z-20">
                  <span className="tag-streetwear inline-block mb-2">
                    [ {product.category} ]
                  </span>
                  <h1 className="font-anton text-4xl md:text-5xl uppercase tracking-wide leading-[0.95]">
                    {product.name}
                  </h1>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest text-[#FCC900] font-black">
                  [ HECHO AL TOQUE ]
                </p>
                <p className="text-neutral-300 text-base sm:text-lg leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-end gap-3">
                  <span className="block-yellow text-2xl">
                    S/ {minPrice.toFixed(2)}
                  </span>
                  {minPrice !== maxPrice && (
                    <span className="text-neutral-400 text-sm font-semibold">
                      hasta S/ {maxPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <ProductAddToCart product={product} />
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16 border-t-2 border-neutral-800">
          <div className="text-center mb-10 space-y-2">
            <p className="text-xs uppercase tracking-widest text-[#FCC900] font-black">
              [ POR QUÉ ELEGIRNOS ]
            </p>
            <h2 className="font-anton text-3xl sm:text-4xl uppercase tracking-wide">
              Lo que hace especial a {product.name}
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
              Cada detalle cuenta para ofrecerte la mejor experiencia.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-[#131317] border-2 border-neutral-800 hover:border-[#FCC900]/60 rounded-2xl p-6 sm:p-8 text-center transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#FCC900]/10 border border-[#FCC900]/30 flex items-center justify-center">
                  <feature.icon size={22} className="text-[#FCC900]" />
                </div>
                <h3 className="font-anton text-xl uppercase tracking-wide mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#131317] border-y-2 border-neutral-800 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-[#FCC900] font-black">
                [ DESCUBRE MÁS ]
              </p>
              <h2 className="font-anton text-2xl sm:text-3xl uppercase tracking-wide">
                ¿Listo para probar {product.name}?
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
                Explora nuestro menú completo y encuentra tu combinación perfecta.
              </p>
            </div>
            <Link
              href="/"
              className="btn-streetwear inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg rounded-2xl shadow-xl shadow-[#FCC900]/20"
            >
              Ver todo el menú
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-[#0F0F12] border-t-2 border-neutral-800 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="space-y-2">
              <p className="tag-streetwear inline-block">[ {restaurantInfo.name} ]</p>
              <p className="text-sm text-neutral-400">
                © {new Date().getFullYear()} {restaurantInfo.name} — {restaurantInfo.slogan}
              </p>
              <p className="text-xs text-neutral-500">RUC: {restaurantInfo.ruc}</p>
            </div>
            <Link
              href="/libro-de-reclamaciones"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#131317] hover:bg-[#1F1F24] border-2 border-neutral-800 hover:border-[#FCC900]/60 text-white rounded-xl text-sm font-bold transition-colors"
            >
              <ClipboardList size={16} className="text-[#FCC900]" />
              Libro de Reclamaciones
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
