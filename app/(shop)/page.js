import FaqSection from "../features/shop/components/FaqSection";
import HeroSection from "../features/shop/components/hero/HeroSection";
import LocationSection from "../features/shop/components/LocationSection";
import MenuSection from "../features/shop/components/menu/MenuSection";
import { buildFaqSchema } from "../features/shop/seo";
import JsonLd from "../components/JsonLd";

export const metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MenuSection />
      <LocationSection />
      <FaqSection />
      <JsonLd data={buildFaqSchema()} />
    </>
  );
}
