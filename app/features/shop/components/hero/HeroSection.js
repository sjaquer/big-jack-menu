import { menuItems, restaurantInfo } from "../../../../data/menuData";
import { formatPrice, getPriceRange } from "../../../../lib/format";
import { PRIMARY_CATEGORIES } from "../../constants";
import ScrollHero from "./ScrollHero";

const burgerFrom = Math.min(
  ...menuItems
    .filter((item) => PRIMARY_CATEGORIES.includes(item.category))
    .map((item) => getPriceRange(item).min)
);

export default function HeroSection() {
  return <ScrollHero fromPrice={formatPrice(burgerFrom)} area={restaurantInfo.address.area} />;
}
