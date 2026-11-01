import Image from "next/image";
import { notFound } from "next/navigation";
import { categoryInfo, menuItems, restaurantInfo } from "../../../data/menuData";
import { formatPrice, getPriceRange } from "../../../lib/format";
import { absoluteUrl } from "../../../lib/site";
import JsonLd from "../../../components/JsonLd";
import { buildProductSchema } from "../../../features/shop/seo";
import RelatedProducts from "../../../features/shop/components/RelatedProducts";
import ProductAddToCart from "./ProductAddToCart";

const findProduct = (slug) => menuItems.find((item) => item.slug === slug);

export function generateStaticParams() {
  return menuItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return { title: "Producto no encontrado", robots: { index: false } };

  const { min, max } = getPriceRange(product);
  const price = min === max ? formatPrice(min) : `Desde ${formatPrice(min)}`;
  const description = `${product.description} ${price}. Pídela en el Centro de Lima para recojo o delivery.`;
  // Previsualización 1200×630 en JPG (scripts/generate-product-og.mjs): se ve bien en WhatsApp, Facebook y X.
  const image = {
    url: absoluteUrl(`/images/og/${product.slug}.jpg`),
    width: 1200,
    height: 630,
    alt: `${product.name} · ${price} · ${restaurantInfo.name}`,
    type: "image/jpeg",
  };

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} | ${restaurantInfo.name}`,
      description,
      url: `/product/${product.slug}`,
      siteName: restaurantInfo.name,
      locale: "es_PE",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${restaurantInfo.name}`,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  const { min } = getPriceRange(product);
  const hasOptions = (product.options?.length || 0) > 1;
  const isBurger = product.name.startsWith("Hamburguesa ");

  return (
    <>
      <JsonLd data={buildProductSchema(product)} />

      <article className="mx-auto max-w-3xl px-5 pb-8 pt-6">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-black sm:aspect-[5/4]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
          <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium tracking-wider text-neutral-400 backdrop-blur-sm">
            * Imagen referencial
          </span>
        </div>

        {!isBurger && (
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            {categoryInfo[product.category]?.title || product.category}
          </p>
        )}
        <h1 className={`${isBurger ? "mt-10" : "mt-3"} font-anton text-[clamp(3.5rem,14vw,7rem)] uppercase leading-[0.88] text-white`}>
          {isBurger ? (
            <>
              <span className="mb-2 block font-sans text-base font-semibold normal-case tracking-[0.2em] text-neutral-500">
                Hamburguesa
              </span>
              {product.name.slice("Hamburguesa ".length)}
            </>
          ) : (
            product.name
          )}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-neutral-400">{product.description}</p>
        <p className="mt-6 font-anton text-4xl text-white">
          {hasOptions && <span className="mr-2 align-middle font-sans text-sm font-semibold text-neutral-500">desde</span>}
          {formatPrice(min)}
        </p>

        <div className="mt-12">
          <ProductAddToCart product={product} />
        </div>
      </article>

      <RelatedProducts currentSlug={product.slug} />
    </>
  );
}
