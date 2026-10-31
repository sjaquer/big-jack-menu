import Image from "next/image";
import { notFound } from "next/navigation";
import { categoryInfo, menuItems } from "../../../data/menuData";
import { formatPrice, getPriceRange } from "../../../lib/format";
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

  const { min } = getPriceRange(product);
  const description = `${product.description} Desde ${formatPrice(min)}. Pídela en el Centro de Lima para recojo o delivery.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/product/${product.slug}`,
      images: [{ url: product.image, alt: product.name }],
    },
    twitter: { card: "summary_large_image", images: [product.image] },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  const { min } = getPriceRange(product);
  const hasOptions = (product.options?.length || 0) > 1;

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
        </div>

        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
          {categoryInfo[product.category]?.title || product.category}
        </p>
        <h1 className="mt-3 font-anton text-[clamp(3.5rem,14vw,7rem)] uppercase leading-[0.88] text-white">
          {product.name}
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
