import Link from "next/link";
import { notFound } from "next/navigation";
import { menuItems, restaurantInfo } from "../../data/menuData";
import { ChevronLeft, ShoppingCart, Star } from "lucide-react";
import ProductAddToCart from "./ProductAddToCart";

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
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white">
      {/* Header con navegación */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-neutral-950 to-neutral-900 backdrop-blur-lg border-b-2 border-neutral-800 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border-2 border-neutral-700 rounded-xl text-white font-bold transition-all active:scale-95"
          >
            <ChevronLeft size={20} />
            <span className="text-sm sm:text-base">Menú</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm text-neutral-400 hidden sm:block">Ver tu carrito</span>
            <Link
              href="/?openCart=true"
              className="p-3 sm:p-4 bg-yellow-500 text-black rounded-2xl hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
            >
              <ShoppingCart size={22} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero con imagen destacada */}
      <section className="relative max-w-6xl mx-auto px-4 py-8 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Imagen del producto */}
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
            <div className="relative rounded-[2rem] overflow-hidden border-4 border-neutral-800 shadow-2xl">
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
              {product.popular && (
                <div className="absolute top-6 left-6 bg-yellow-500 text-black px-4 py-2 rounded-full font-black text-sm flex items-center gap-2 shadow-lg">
                  <Star size={16} fill="currentColor" />
                  POPULAR
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-500 font-bold mb-1">
                  {product.category}
                </p>
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  {product.name}
                </h1>
              </div>
            </div>
          </div>

          {/* Información y CTA */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl px-4 py-2">
                  <span className="text-xl">🔥</span>
                  <p className="text-yellow-500 text-sm font-black uppercase tracking-wider">Premium</p>
                </div>
                {product.popular && (
                  <div className="inline-flex items-center gap-2 bg-red-500/10 border-2 border-red-500/30 rounded-xl px-4 py-2">
                    <span className="text-xl">⭐</span>
                    <p className="text-red-400 text-sm font-black uppercase tracking-wider">Lo + Pedido</p>
                  </div>
                )}
              </div>
              
              <p className="text-neutral-300 text-base sm:text-lg leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-yellow-500">
                  S/ {minPrice.toFixed(2)}
                </span>
                {minPrice !== maxPrice && (
                  <span className="text-neutral-500 text-lg">
                    - S/ {maxPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Componente de agregar al carrito */}
            <ProductAddToCart product={product} />
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16 border-t-2 border-neutral-900">
        <div className="text-center mb-10 space-y-2">
          <p className="text-xs uppercase tracking-widest text-yellow-500 font-bold">¿Por qué elegirnos?</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Lo que hace especial a {product.name}</h2>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">Cada detalle cuenta para ofrecerte la mejor experiencia</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: "🌿", title: "Ingredientes Frescos", desc: "Seleccionados diariamente y preparados al momento de tu pedido" },
            { icon: "🔥", title: "Cocción Perfecta", desc: "Punto exacto de cocción para máxima jugosidad y sabor" },
            { icon: "⭐", title: "Sabor Único", desc: "Receta exclusiva de Big Jack desarrollada por expertos" }
          ].map((feature, idx) => (
            <div key={idx} className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-neutral-800 hover:border-yellow-500/50 rounded-2xl p-6 sm:p-8 text-center transition-all hover:-translate-y-1">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-black text-white mb-3">{feature.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-t-2 border-neutral-900 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-yellow-500 font-bold">Descubre más</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white">¿Listo para probar {product.name}?</h3>
            <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
              Explora nuestro menú completo y encuentra tu combinación perfecta
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-yellow-500 text-black font-black text-base sm:text-lg rounded-2xl hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/20 active:scale-95"
          >
            🍔 VER TODO EL MENÚ
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="space-y-1">
              <p className="text-sm text-neutral-400">
                © {new Date().getFullYear()} {restaurantInfo.name} - {restaurantInfo.slogan}
              </p>
              <p className="text-xs text-neutral-500">RUC: {restaurantInfo.ruc}</p>
            </div>
            <Link
              href="/libro-de-reclamaciones"
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-xl text-sm font-bold transition"
            >
              📋 Libro de Reclamaciones
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
